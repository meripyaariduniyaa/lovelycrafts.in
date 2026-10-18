import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { calculateEffectiveTierAndRate, commissionForAmount, normalizeCode } from '@/lib/creator-club';
import { verifyReferral } from '@/lib/referral-crypto';
import { createAutoInvoice } from '@/lib/finance';
import { disableOrganicRetentionCoupon } from '@/lib/coupons';

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const {
      apologyId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      couponCode,
      couponId,
      creatorId,
      attributionSource,
      discountPercent,
      amountPaid,
      free,
    } = await request.json();

    const noteRef = adminDb.collection('notes').doc(apologyId);
    const noteSnap = await noteRef.get();

    if (!noteSnap.exists) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    const noteData = noteSnap.data();
    const created = noteData.created_at?.toDate?.() || new Date();
    const normalizedCode = couponCode ? normalizeCode(couponCode) : null;
    const finalDiscountPercent = free === true ? 100 : Number(discountPercent) || 0;
    const finalAmountPaid = free === true ? 0 : Number(amountPaid) || 0;
    const method = free === true ? 'coupon' : 'razorpay';

    if (free !== true) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing Razorpay payment data.' }, { status: 400 });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
      const expected = crypto.createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
      }
    }

    // 1. Resolve Coupon & Creator early
    let resolvedCouponDoc = null;
    let effectiveCouponId = couponId || null;
    let effectiveCreatorId = creatorId || null;
    let effectiveAttributionSource = attributionSource || null;

    if (effectiveCouponId) {
      const cRef = adminDb.collection('coupons').doc(effectiveCouponId);
      const cSnap = await cRef.get();
      if (cSnap.exists) {
        resolvedCouponDoc = { id: cSnap.id, ...cSnap.data() };
      }
    } else if (normalizedCode) {
      const cSnap = await adminDb.collection('coupons').where('code', '==', normalizedCode).limit(1).get();
      if (!cSnap.empty) {
        resolvedCouponDoc = { id: cSnap.docs[0].id, ...cSnap.docs[0].data() };
        effectiveCouponId = resolvedCouponDoc.id;
      }
    }

    if (resolvedCouponDoc?.creator_id) {
      effectiveCreatorId = resolvedCouponDoc.creator_id;
      effectiveAttributionSource = 'coupon';
    } else if (!effectiveCreatorId) {
      const refCookie = request.cookies.get('lc_ref')?.value;
      const refData = verifyReferral(refCookie);
      if (refData?.creatorId) {
        effectiveCreatorId = refData.creatorId;
        effectiveAttributionSource = 'referral_link';
      }
    }

    // 2. Update Note record
    await noteRef.update({
      is_paid: true,
      expires_at: Timestamp.fromDate(new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000)),
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      coupon_code: normalizedCode,
      discount_percent: finalDiscountPercent,
      amount_paid: finalAmountPaid,
      payment_method: method,
      paid_at: FieldValue.serverTimestamp(),
    });

    // 3. Create Immutable Order Snapshot in orders & permanent admin_payment_ledger vault
    const orderRef = adminDb.collection('orders').doc();
    const orderSnapshot = {
      note_id: apologyId,
      customer_uid: noteData.creator_uid || null,
      template_id: noteData.template || 'proposal',
      creator_id: effectiveCreatorId || null,
      coupon_code: normalizedCode,
      coupon_id: effectiveCouponId || null,
      discount_percent: finalDiscountPercent,
      final_amount: finalAmountPaid,
      amount_in_rupees: Number(((finalAmountPaid || 0) / 100).toFixed(2)),
      payment_method: method,
      payment_status: 'paid',
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      attribution_source: effectiveAttributionSource,
      created_at: FieldValue.serverTimestamp(),
      paid_at: FieldValue.serverTimestamp(),
    };

    // Save to primary orders collection
    await orderRef.set(orderSnapshot);

    // Save permanent immutable copy to admin_payment_ledger
    try {
      await adminDb.collection('admin_payment_ledger').doc(orderRef.id).set({
        ...orderSnapshot,
        order_id: orderRef.id,
        vault_recorded_at: FieldValue.serverTimestamp(),
        immutable_permanent_lock: true,
      });
    } catch (vaultErr) {
      console.error('Failed to write to admin_payment_ledger vault:', vaultErr);
    }

    // 3b. Auto-generate internal invoice in finance_invoices (Item 3b)
    try {
      await createAutoInvoice({
        db: adminDb,
        orderId: orderRef.id,
        noteData,
        amountInRupees: Number(((finalAmountPaid || 0) / 100).toFixed(2)),
        couponCode: normalizedCode,
        discountPercent: finalDiscountPercent,
        paymentMethod: method === 'coupon' ? 'VIP Gift Pass' : 'UPI / Razorpay',
      });
    } catch (invoiceErr) {
      console.error('Failed to auto-generate finance invoice:', invoiceErr);
    }

    // 4. Atomically increment coupon usage & deactivate single-use/retention coupons
    if (resolvedCouponDoc) {
      try {
        const couponUpdates = {
          usage_count: FieldValue.increment(1),
          updated_at: FieldValue.serverTimestamp(),
        };
        if (resolvedCouponDoc.type === 'organic_retention' || resolvedCouponDoc.max_uses === 1) {
          couponUpdates.active = false;
        }
        await adminDb.collection('coupons').doc(resolvedCouponDoc.id).update(couponUpdates);
      } catch (err) {
        console.error('Coupon usage increment error:', err);
      }
    }

    // Deactivate any remaining organic retention coupons for this note since purchase is complete
    if (apologyId) {
      await disableOrganicRetentionCoupon(adminDb, { noteId: apologyId }).catch(() => {});
    }

    // 5. Mark Creator Gift claimed & deactivate if coupon was a gift pass
    if (resolvedCouponDoc && resolvedCouponDoc.type === 'gift') {
      try {
        await adminDb.collection('coupons').doc(resolvedCouponDoc.id).update({
          active: false,
          updated_at: FieldValue.serverTimestamp(),
        });
        const giftSnap = await adminDb.collection('creatorGifts').where('coupon_id', '==', resolvedCouponDoc.id).limit(1).get();
        if (!giftSnap.empty) {
          await giftSnap.docs[0].ref.update({
            claimed: true,
            active: false,
            claimed_note_id: apologyId,
            claimed_at: FieldValue.serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Gift claim error:', err);
      }
    }

    // 6. Creator Attribution & Commission Snapshot
    if (effectiveCreatorId) {
      const creatorRef = adminDb.collection('creators').doc(effectiveCreatorId);
      const creatorSnap = await creatorRef.get();

      if (creatorSnap.exists) {
        const creatorData = creatorSnap.data();

        // Count paid orders in current month for progressive tier evaluation & monthly maintenance
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const allPaidOrdersSnap = await adminDb.collection('orders')
          .where('creator_id', '==', effectiveCreatorId)
          .where('payment_status', '==', 'paid')
          .get();

        const monthPaidOrdersCount = allPaidOrdersSnap.docs.filter((d) => {
          const paidAt = d.data().paid_at?.toDate?.() || d.data().created_at?.toDate?.();
          return paidAt && paidAt >= startOfMonth;
        }).length;

        // Current transaction falls into the tier bracket corresponding to current month volume
        const { tier, commissionRate } = calculateEffectiveTierAndRate(creatorData, monthPaidOrdersCount);
        const commissionAmount = commissionForAmount(finalAmountPaid, commissionRate);

        // Record pending commission only if there was a customer-paid amount > 0
        if (commissionAmount > 0) {
          const commRef = adminDb.collection('commissions').doc();
          await commRef.set({
            order_id: orderRef.id,
            note_id: apologyId,
            creator_id: effectiveCreatorId,
            commission_rate: commissionRate,
            order_amount: finalAmountPaid,
            commission_amount: commissionAmount,
            status: 'pending',
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
          });
        }

        // Recalculate and update creator's auto-tier (if not overridden by admin)
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
                order_id: orderRef.id,
                creator_id: creatorData.referred_by_creator_id,
                referred_creator_id: effectiveCreatorId,
                referred_creator_name: creatorData.name || 'Invited Creator',
                referred_creator_slug: creatorData.slug || '',
                commission_rate: 0,
                order_amount: finalAmountPaid,
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
            console.error('Error awarding creator referral bounty:', bountyErr);
          }
        }
      }
    }

    return NextResponse.json({ ok: true, orderId: orderRef.id });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Unable to verify payment.' }, { status: 500 });
  }
}


