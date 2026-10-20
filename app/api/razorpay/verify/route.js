import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { calculateEffectiveTierAndRate, commissionForAmount, normalizeCode } from '@/lib/creator-club';
import { verifyReferral } from '@/lib/referral-crypto';
import { createAutoInvoice } from '@/lib/finance';
import { disableOrganicRetentionCoupon, resolveCoupon } from '@/lib/coupons';
import { getTemplatePrice } from '@/lib/pricing';
import { createSettlementOrderId, verifyHmacSha256Signature } from '@/lib/razorpay-security';
import { sendReceipt } from '@/lib/email';

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { apologyId, razorpay_order_id, razorpay_payment_id, razorpay_signature, buyerName: bodyBuyerName, buyerEmail: bodyBuyerEmail, buyerPhone: bodyBuyerPhone } = body;
    const provider = body.provider === 'cashfree' ? 'cashfree' : 'razorpay';
    if (typeof apologyId !== 'string' || !apologyId.trim()) {
      return NextResponse.json({ error: 'Gift identifier is required.' }, { status: 400 });
    }

    const noteRef = adminDb.collection('notes').doc(apologyId);
    const noteSnap = await noteRef.get();

    if (!noteSnap.exists) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    const noteData = noteSnap.data();
    const created = noteData.created_at?.toDate?.() || new Date();
    const templateId = noteData.template || 'proposal';
    let normalizedCode = null;
    let effectiveCouponId = null;
    let effectiveCreatorId = null;
    let effectiveAttributionSource = null;
    let finalDiscountPercent = 0;
    let finalAmountPaid = 0;
    let method = provider;
    let paymentOrderId = null;
    let paymentId = null;
    let buyerName = bodyBuyerName || '';
    let buyerEmail = bodyBuyerEmail || '';
    let buyerPhone = bodyBuyerPhone || '';

    if (body.free === true) {
      const price = await getTemplatePrice(templateId);
      const freeCoupon = await resolveCoupon(body.couponCode, {
        db: adminDb,
        templateId,
        orderAmountPaise: price.pricePaise,
        creatorUserId: noteData.creator_uid,
      });
      if (!freeCoupon.valid || freeCoupon.percent !== 100) {
        return NextResponse.json({ error: 'This coupon is not eligible to unlock the gift.' }, { status: 400 });
      }

      normalizedCode = normalizeCode(freeCoupon.code);
      effectiveCouponId = freeCoupon.id || null;
      effectiveCreatorId = freeCoupon.creator_id || null;
      effectiveAttributionSource = effectiveCreatorId ? 'coupon' : null;
      finalDiscountPercent = 100;
      method = 'coupon';
    } else {
      if (provider === 'cashfree') {
        const cashfreeOrderId = body.cashfree_order_id;
        const clientId = process.env.CASHFREE_CLIENT_ID;
        const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
        const mode = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
        if (!cashfreeOrderId || !clientId || !clientSecret) {
          return NextResponse.json({ error: 'Cashfree verification is not configured.' }, { status: 503 });
        }
        const apiBase = mode === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
        const apiHeaders = {
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
          'x-api-version': process.env.CASHFREE_API_VERSION || '2025-01-01',
          Accept: 'application/json',
        };
        const [orderResponse, paymentsResponse] = await Promise.all([
          fetch(`${apiBase}/orders/${encodeURIComponent(cashfreeOrderId)}`, { headers: apiHeaders, cache: 'no-store' }),
          fetch(`${apiBase}/orders/${encodeURIComponent(cashfreeOrderId)}/payments`, { headers: apiHeaders, cache: 'no-store' }),
        ]);
        if (!orderResponse.ok || !paymentsResponse.ok) {
          return NextResponse.json({ error: 'Cashfree could not confirm this payment yet.' }, { status: 502 });
        }
        const [providerOrder, providerPayments] = await Promise.all([orderResponse.json(), paymentsResponse.json()]);
        const providerPayment = (Array.isArray(providerPayments) ? providerPayments : []).find((payment) => payment.payment_status === 'SUCCESS');
        const tags = providerOrder.order_tags || {};
        const amountPaise = Math.round(Number(providerOrder.order_amount) * 100);
        if (
          providerOrder.order_id !== cashfreeOrderId ||
          providerOrder.order_status !== 'PAID' ||
          tags.note_id !== apologyId ||
          !providerPayment ||
          Math.round(Number(providerPayment.payment_amount) * 100) !== amountPaise ||
          providerPayment.payment_currency !== 'INR'
        ) {
          return NextResponse.json({ error: 'Cashfree has not verified a successful payment for this gift.' }, { status: 400 });
        }

        paymentOrderId = providerOrder.order_id;
        paymentId = String(providerPayment.cf_payment_id);
        normalizedCode = tags.coupon_code ? normalizeCode(tags.coupon_code) : null;
        effectiveCouponId = tags.coupon_id || null;
        effectiveCreatorId = tags.creator_id || null;
        effectiveAttributionSource = tags.attribution_source || null;
        finalDiscountPercent = Number(tags.discount_percent) || 0;
        finalAmountPaid = amountPaise;
        if (tags.buyer_name) buyerName = tags.buyer_name;
        else if (providerOrder.customer_details?.customer_name) buyerName = providerOrder.customer_details.customer_name;
        if (tags.buyer_email) buyerEmail = tags.buyer_email;
        else if (providerOrder.customer_details?.customer_email) buyerEmail = providerOrder.customer_details.customer_email;
        if (tags.buyer_phone) buyerPhone = tags.buyer_phone;
        else if (providerOrder.customer_details?.customer_phone) buyerPhone = providerOrder.customer_details.customer_phone;
      } else {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return NextResponse.json({ error: 'Missing Razorpay payment data.' }, { status: 400 });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !secret) {
          return NextResponse.json({ error: 'Payment verification is not configured.' }, { status: 503 });
        }
        if (!verifyHmacSha256Signature(`${razorpay_order_id}|${razorpay_payment_id}`, razorpay_signature, secret)) {
          return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: secret });
        const [providerOrder, providerPayment] = await Promise.all([
          razorpay.orders.fetch(razorpay_order_id),
          razorpay.payments.fetch(razorpay_payment_id),
        ]);
        const trustedNotes = providerOrder.notes || {};

        if (
          providerOrder.id !== razorpay_order_id ||
          providerPayment.order_id !== providerOrder.id ||
          providerPayment.status !== 'captured' ||
          Number(providerPayment.amount) !== Number(providerOrder.amount) ||
          providerPayment.currency !== 'INR' ||
          (providerOrder.receipt !== apologyId && trustedNotes.apologyId !== apologyId)
        ) {
          return NextResponse.json({ error: 'The payment could not be verified for this gift.' }, { status: 400 });
        }

        paymentOrderId = providerOrder.id;
        paymentId = providerPayment.id;
        normalizedCode = trustedNotes.couponCode ? normalizeCode(trustedNotes.couponCode) : null;
        effectiveCouponId = trustedNotes.couponId || null;
        effectiveCreatorId = trustedNotes.creatorId || null;
        effectiveAttributionSource = trustedNotes.attributionSource || null;
        finalDiscountPercent = Number(trustedNotes.discountPercent) || 0;
        finalAmountPaid = Number(providerPayment.amount);
        // Buyer details from trusted server-side Razorpay notes
        if (trustedNotes.buyerName) buyerName = trustedNotes.buyerName;
        if (trustedNotes.buyerEmail) buyerEmail = trustedNotes.buyerEmail;
        if (trustedNotes.buyerPhone) buyerPhone = trustedNotes.buyerPhone;
      }
    }

    // 1. Resolve Coupon & Creator early
    let resolvedCouponDoc = null;

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

    // 2. Create a deterministic, transactional settlement record so provider retries
    // cannot create another order or commission for the same payment.
    const orderRef = adminDb.collection('orders').doc(
      createSettlementOrderId({ paymentId, noteId: apologyId }),
    );
    const existingPaymentOrder = paymentId
      ? await adminDb.collection('orders').where(provider === 'cashfree' ? 'cashfree_payment_id' : 'razorpay_payment_id', '==', paymentId).limit(1).get()
      : await adminDb.collection('orders').where('note_id', '==', apologyId).limit(1).get();
    if (!existingPaymentOrder.empty) {
      const existing = existingPaymentOrder.docs[0];
      if (existing.data().note_id !== apologyId) {
        return NextResponse.json({ error: 'The payment is already linked to another gift.' }, { status: 409 });
      }
      return NextResponse.json({ ok: true, orderId: existing.id, duplicate: true });
    }

    if (noteData.is_paid) {
      const alreadyPaidWithThisPayment = method === 'razorpay'
        ? noteData.razorpay_payment_id === paymentId
        : method === 'cashfree'
          ? noteData.cashfree_payment_id === paymentId
          : noteData.payment_method === 'coupon' && noteData.coupon_code === normalizedCode;
      if (!alreadyPaidWithThisPayment) {
        return NextResponse.json({ error: 'This gift has already been paid.' }, { status: 409 });
      }
    }

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
      payment_provider: method === 'coupon' ? null : method,
      payment_status: 'paid',
      ...(method === 'cashfree'
        ? { cashfree_order_id: paymentOrderId, cashfree_payment_id: paymentId }
        : { razorpay_order_id: paymentOrderId, razorpay_payment_id: paymentId }),
      attribution_source: effectiveAttributionSource,
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_phone: buyerPhone || null,
      created_at: FieldValue.serverTimestamp(),
      paid_at: FieldValue.serverTimestamp(),
    };

    const settlementOutcome = await adminDb.runTransaction(async (transaction) => {
      const currentNoteSnap = await transaction.get(noteRef);
      const currentOrderSnap = await transaction.get(orderRef);
      if (!currentNoteSnap.exists) return 'missing-note';
      if (currentOrderSnap.exists) return 'duplicate';

      const currentNote = currentNoteSnap.data();
      if (currentNote.is_paid) {
        const samePayment = method === 'razorpay'
          ? currentNote.razorpay_payment_id === paymentId
          : method === 'cashfree'
            ? currentNote.cashfree_payment_id === paymentId
            : currentNote.payment_method === 'coupon' && currentNote.coupon_code === normalizedCode;
        if (!samePayment) return 'already-paid';
      }

      transaction.create(orderRef, orderSnapshot);
      transaction.update(noteRef, {
        is_paid: true,
        expires_at: Timestamp.fromDate(new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000)),
        ...(method === 'cashfree'
          ? { cashfree_order_id: paymentOrderId, cashfree_payment_id: paymentId, payment_provider: 'cashfree' }
          : { razorpay_order_id: paymentOrderId, razorpay_payment_id: paymentId, ...(method === 'razorpay' ? { payment_provider: 'razorpay' } : {}) }),
        coupon_code: normalizedCode,
        discount_percent: finalDiscountPercent,
        amount_paid: finalAmountPaid,
        payment_method: method,
        paid_at: FieldValue.serverTimestamp(),
      });
      return 'created';
    });

    if (settlementOutcome === 'duplicate') {
      return NextResponse.json({ ok: true, orderId: orderRef.id, duplicate: true });
    }
    if (settlementOutcome === 'already-paid') {
      return NextResponse.json({ error: 'This gift has already been paid.' }, { status: 409 });
    }
    if (settlementOutcome === 'missing-note') {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

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
        paymentMethod: method === 'coupon' ? 'VIP Gift Pass' : method === 'cashfree' ? 'Cashfree' : 'UPI / Razorpay',
      });
    } catch (invoiceErr) {
      console.error('Failed to auto-generate finance invoice:', invoiceErr);
    }

    // 3c. Send purchase receipt email to buyer
    if (buyerEmail) {
      sendReceipt({
        to: buyerEmail,
        buyerName: buyerName || 'there',
        orderId: orderRef.id,
        templateId: noteData.template || 'proposal',
        amountRupees: Number(((finalAmountPaid || 0) / 100).toFixed(2)),
        paymentMethod: method === 'coupon' ? 'VIP Gift Pass' : method === 'cashfree' ? 'Cashfree Payments' : 'UPI / Razorpay',
        noteId: apologyId,
        discountPercent: finalDiscountPercent,
      }).catch((emailErr) => console.error('Receipt email failed:', emailErr));
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


