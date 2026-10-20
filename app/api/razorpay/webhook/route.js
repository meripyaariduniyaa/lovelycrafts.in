import { NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { calculateEffectiveTierAndRate, commissionForAmount, normalizeCode } from '@/lib/creator-club';
import { disableOrganicRetentionCoupon } from '@/lib/coupons';
import { createSettlementOrderId, verifyHmacSha256Signature } from '@/lib/razorpay-security';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook verification is not configured.' }, { status: 503 });
    }
    if (!verifyHmacSha256Signature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const event = payload.event;
    const adminDb = getAdminDb();

    // 1. Payment Captured / Order Paid Event (Idempotent)
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity || {};
      const notes = payment.notes || payload.payload?.order?.entity?.notes || {};
      const apologyId = notes.apologyId || payment.receipt;
      const razorpay_order_id = payment.order_id || payload.payload?.order?.entity?.id;
      const razorpay_payment_id = payment.id;
      const amountPaid = payment.amount || payload.payload?.order?.entity?.amount || 0;
      const couponCode = notes.couponCode ? normalizeCode(notes.couponCode) : null;
      const couponId = notes.couponId || null;
      const creatorId = notes.creatorId || null;
      const attributionSource = notes.attributionSource || null;
      const discountPercent = Number(notes.discountPercent) || 0;

      if (!apologyId) {
        return NextResponse.json({ status: 'ignored', message: 'No apologyId in notes' });
      }

      // Check if note is already marked paid
      const noteRef = adminDb.collection('notes').doc(apologyId);
      const noteSnap = await noteRef.get();
      if (!noteSnap.exists) {
        return NextResponse.json({ status: 'ignored', message: 'Note not found' });
      }

      // Existing records were settled by an earlier callback; keep the note in sync and stop here.
      let orderSnap = await adminDb.collection('orders').where('note_id', '==', apologyId).limit(1).get();
      if (orderSnap.empty && razorpay_payment_id) {
        orderSnap = await adminDb.collection('orders').where('razorpay_payment_id', '==', razorpay_payment_id).limit(1).get();
      }

      const noteData = noteSnap.data();
      const created = noteData.created_at?.toDate?.() || new Date();
      if (!orderSnap.empty) {
        if (!noteData.is_paid) {
          await noteRef.update({
            is_paid: true,
            expires_at: Timestamp.fromDate(new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000)),
            razorpay_order_id: razorpay_order_id || null,
            razorpay_payment_id: razorpay_payment_id || null,
            coupon_code: couponCode,
            discount_percent: discountPercent,
            amount_paid: amountPaid,
            payment_method: 'razorpay',
            payment_provider: 'razorpay',
            paid_at: FieldValue.serverTimestamp(),
          });
        }
        return NextResponse.json({ status: 'ok', handled: true, duplicate: true, event });
      }

      const newOrderRef = adminDb.collection('orders').doc(
        createSettlementOrderId({ paymentId: razorpay_payment_id, noteId: apologyId }),
      );
      const orderId = newOrderRef.id;

        const orderPayload = {
          note_id: apologyId,
          customer_uid: noteData.creator_uid || null,
          template_id: noteData.template || 'proposal',
          creator_id: creatorId || null,
          coupon_code: couponCode,
          coupon_id: couponId,
          discount_percent: discountPercent,
          final_amount: amountPaid,
          amount_in_rupees: Number(((amountPaid || 0) / 100).toFixed(2)),
          payment_method: 'razorpay',
          payment_provider: 'razorpay',
          payment_status: 'paid',
          razorpay_order_id: razorpay_order_id || null,
          razorpay_payment_id: razorpay_payment_id || null,
          attribution_source: attributionSource || (creatorId ? (couponCode ? 'coupon' : 'referral_link') : null),
          created_at: FieldValue.serverTimestamp(),
          paid_at: FieldValue.serverTimestamp(),
        };

      const createdOrder = await adminDb.runTransaction(async (transaction) => {
        const [currentNoteSnap, existingOrderSnap] = await Promise.all([
          transaction.get(noteRef),
          transaction.get(newOrderRef),
        ]);
        if (!currentNoteSnap.exists || existingOrderSnap.exists) return false;

        const currentNote = currentNoteSnap.data();
        if (currentNote.is_paid && currentNote.razorpay_payment_id !== razorpay_payment_id) return false;

        transaction.create(newOrderRef, orderPayload);
        transaction.update(noteRef, {
          is_paid: true,
          expires_at: Timestamp.fromDate(new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000)),
          razorpay_order_id: razorpay_order_id || null,
          razorpay_payment_id: razorpay_payment_id || null,
          coupon_code: couponCode,
          discount_percent: discountPercent,
          amount_paid: amountPaid,
          payment_method: 'razorpay',
          paid_at: FieldValue.serverTimestamp(),
        });
        return true;
      });

      if (!createdOrder) {
        return NextResponse.json({ status: 'ok', handled: true, duplicate: true, event });
      }

        // Save permanent immutable copy to admin_payment_ledger
        try {
          await adminDb.collection('admin_payment_ledger').doc(orderId).set({
            ...orderPayload,
            order_id: orderId,
            vault_recorded_at: FieldValue.serverTimestamp(),
            immutable_permanent_lock: true,
          });
        } catch (vaultErr) {
          console.error('Failed to write to admin_payment_ledger vault from webhook:', vaultErr);
        }

        // Increment coupon usage & deactivate single-use/retention coupons
        if (couponId) {
          try {
            const cDoc = await adminDb.collection('coupons').doc(couponId).get();
            const cData = cDoc.exists ? cDoc.data() : null;
            const updatePayload = {
              usage_count: FieldValue.increment(1),
              updated_at: FieldValue.serverTimestamp(),
            };
            if (cData && (cData.type === 'organic_retention' || cData.max_uses === 1)) {
              updatePayload.active = false;
            }
            await adminDb.collection('coupons').doc(couponId).update(updatePayload);
          } catch {}
        } else if (couponCode) {
          try {
            const cSnap = await adminDb.collection('coupons').where('code', '==', couponCode).limit(1).get();
            if (!cSnap.empty) {
              const cData = cSnap.docs[0].data();
              const updatePayload = {
                usage_count: FieldValue.increment(1),
                updated_at: FieldValue.serverTimestamp(),
              };
              if (cData && (cData.type === 'organic_retention' || cData.max_uses === 1)) {
                updatePayload.active = false;
              }
              await cSnap.docs[0].ref.update(updatePayload);
            }
          } catch {}
        }

        // Deactivate any remaining organic retention coupons for this note since purchase is complete
        if (apologyId) {
          await disableOrganicRetentionCoupon(adminDb, { noteId: apologyId }).catch(() => {});
        }

        // Creator attribution
        if (creatorId && amountPaid > 0) {
          const creatorRef = adminDb.collection('creators').doc(creatorId);
          const creatorSnap = await creatorRef.get();
          if (creatorSnap.exists) {
            const creatorData = creatorSnap.data();
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const allPaidOrdersSnap = await adminDb.collection('orders')
              .where('creator_id', '==', creatorId)
              .where('payment_status', '==', 'paid')
              .get();

            const monthPaidOrdersCount = allPaidOrdersSnap.docs.filter((d) => {
              const paidAt = d.data().paid_at?.toDate?.() || d.data().created_at?.toDate?.();
              return paidAt && paidAt >= startOfMonth;
            }).length;

            const { tier, commissionRate } = calculateEffectiveTierAndRate(creatorData, monthPaidOrdersCount);
            const commissionAmount = commissionForAmount(amountPaid, commissionRate);

            if (commissionAmount > 0) {
              const commRef = adminDb.collection('commissions').doc();
              await commRef.set({
                order_id: orderId,
                note_id: apologyId,
                creator_id: creatorId,
                commission_rate: commissionRate,
                order_amount: amountPaid,
                commission_amount: commissionAmount,
                status: 'pending',
                created_at: FieldValue.serverTimestamp(),
                updated_at: FieldValue.serverTimestamp(),
              });
            }

            if (!creatorData.tier_override && creatorData.tier !== tier.id) {
              await creatorRef.update({
                tier: tier.id,
                updated_at: FieldValue.serverTimestamp(),
              });
            }

            // Creator-to-Creator Referral Milestone Bounty (₹150 on 1st paid sale)
            if (creatorData.referred_by_creator_id && !creatorData.referral_bounty_awarded) {
              try {
                const parentCreatorRef = adminDb.collection('creators').doc(creatorData.referred_by_creator_id);
                const parentSnap = await parentCreatorRef.get();
                if (parentSnap.exists) {
                  const bountyCommRef = adminDb.collection('commissions').doc();
                  await bountyCommRef.set({
                    type: 'creator_referral_bounty',
                    order_id: orderId,
                    creator_id: creatorData.referred_by_creator_id,
                    referred_creator_id: creatorId,
                    referred_creator_name: creatorData.name || 'Invited Creator',
                    referred_creator_slug: creatorData.slug || '',
                    commission_rate: 0,
                    order_amount: amountPaid,
                    commission_amount: 15000, // ₹150 in paise
                    status: 'pending',
                    note: `🎉 Creator Referral Bounty: ${creatorData.name || 'Your friend'} made their 1st paid sale!`,
                    created_at: FieldValue.serverTimestamp(),
                    updated_at: FieldValue.serverTimestamp(),
                  });
                  await creatorRef.update({
                    referral_bounty_awarded: true,
                    referral_bounty_awarded_at: FieldValue.serverTimestamp(),
                  });
                }
              } catch (bountyErr) {
                console.error('Error awarding creator referral bounty in webhook:', bountyErr);
              }
            }
          }
        }
      return NextResponse.json({ status: 'ok', handled: true, event });
    }

    // 2. Refund Event (Reverse pending commissions)
    if (event === 'refund.processed' || event === 'payment.refunded') {
      const payment = payload.payload?.payment?.entity || {};
      const razorpay_payment_id = payment.id;
      const razorpay_order_id = payment.order_id;

      let orderQuery = null;
      if (razorpay_payment_id) {
        orderQuery = await adminDb.collection('orders').where('razorpay_payment_id', '==', razorpay_payment_id).limit(1).get();
      }
      if ((!orderQuery || orderQuery.empty) && razorpay_order_id) {
        orderQuery = await adminDb.collection('orders').where('razorpay_order_id', '==', razorpay_order_id).limit(1).get();
      }

      if (orderQuery && !orderQuery.empty) {
        const orderDoc = orderQuery.docs[0];
        await orderDoc.ref.update({
          payment_status: 'refunded',
          refunded_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        });

        // Mirror refund status to admin_payment_ledger vault
        try {
          await adminDb.collection('admin_payment_ledger').doc(orderDoc.id).set({
            payment_status: 'refunded',
            refund_id: payment.refund_status || razorpay_payment_id,
            refunded_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
          }, { merge: true });
        } catch (vaultRefundErr) {
          console.error('Failed to update admin_payment_ledger refund status:', vaultRefundErr);
        }

        // Find pending commissions associated with this order and reverse them
        const commSnap = await adminDb.collection('commissions')
          .where('order_id', '==', orderDoc.id)
          .where('status', '==', 'pending')
          .get();

        const batch = adminDb.batch();
        commSnap.docs.forEach((commDoc) => {
          batch.update(commDoc.ref, {
            status: 'reversed',
            reversed_reason: 'order_refunded',
            updated_at: FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
      }

      return NextResponse.json({ status: 'ok', handled: true, event });
    }

    return NextResponse.json({ status: 'ok', ignored: true, event });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
