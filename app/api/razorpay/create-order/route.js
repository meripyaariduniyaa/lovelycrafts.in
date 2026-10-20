import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAdminDb } from '@/lib/firebase-admin';
import { resolveCoupon } from '@/lib/coupons';
import { verifyReferral } from '@/lib/referral-crypto';
import { getTemplatePrice } from '@/lib/pricing';

export async function POST(request) {
  try {
    const adminDb = getAdminDb();
    const { apologyId, couponCode, buyerName, buyerEmail, buyerPhone } = await request.json();
    if (typeof apologyId !== 'string' || !apologyId.trim()) {
      return NextResponse.json({ error: 'Gift identifier is required.' }, { status: 400 });
    }

    const snap = await adminDb.collection('notes').doc(apologyId).get();
    if (!snap.exists) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });

    const raw = snap.data();
    if (raw.is_paid) {
      return NextResponse.json({ error: 'This gift has already been paid.' }, { status: 409 });
    }
    const templateId = raw.template || 'proposal';
    const priceInfo = await getTemplatePrice(templateId);
    if (!priceInfo.enabled) {
      return NextResponse.json({ error: 'This gift is currently unavailable.' }, { status: 409 });
    }
    const baseAmount = priceInfo.pricePaise || 19900;
    const totalAmount = baseAmount;

    // Check referral cookie from request
    const refCookie = request.cookies.get('lc_ref')?.value;
    const refData = verifyReferral(refCookie);
    let attributedCreatorId = refData?.creatorId || null;
    let attributionSource = attributedCreatorId ? 'referral_link' : null;

    let appliedCoupon = null;
    if (couponCode && String(couponCode).trim()) {
      const couponResult = await resolveCoupon(couponCode, {
        db: adminDb,
        templateId,
        orderAmountPaise: totalAmount,
        creatorUserId: raw.creator_uid,
      });

      if (!couponResult.valid) {
        return NextResponse.json({ invalidCoupon: true, error: couponResult.error }, { status: 200 });
      }

      appliedCoupon = couponResult;

      // Creator coupon takes highest precedence over referral link
      if (appliedCoupon.creator_id) {
        attributedCreatorId = appliedCoupon.creator_id;
        attributionSource = 'coupon';
      }
    }

    if (appliedCoupon) {
      const discountPercent = appliedCoupon.percent;

      if (discountPercent === 100) {
        return NextResponse.json({
          free: true,
          amount: 0,
          currency: 'INR',
          couponApplied: true,
          discountPercent: 100,
          couponCode: appliedCoupon.code,
          couponId: appliedCoupon.id || null,
          creatorId: attributedCreatorId,
          attributionSource,
          message: `${appliedCoupon.label || '100% Coupon applied'}! Entire order is unlocked for free.`
        });
      }

      const discountRatio = discountPercent / 100;
      const discountedAmount = Math.max(100, Math.round(totalAmount * (1 - discountRatio))); // Amount in paise
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        return NextResponse.json({ error: 'Payment creation is not configured.' }, { status: 503 });
      }
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: discountedAmount,
        currency: 'INR',
        receipt: apologyId,
        notes: {
          apologyId,
          uid: raw.creator_uid || '',
          couponCode: appliedCoupon.code || '',
          couponId: appliedCoupon.id || '',
          creatorId: attributedCreatorId || '',
          attributionSource: attributionSource || 'none',
          discountPercent,
          baseAmount,
          finalAmount: discountedAmount,
          buyerName: buyerName || '',
          buyerEmail: buyerEmail || '',
          buyerPhone: buyerPhone || '',
        }
      });

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        couponApplied: true,
        couponCode: appliedCoupon.code,
        couponId: appliedCoupon.id || null,
        creatorId: attributedCreatorId,
        attributionSource,
        discountPercent,
        message: `✅ ${appliedCoupon.label || `${discountPercent}% discount applied`}! You pay ₹${(discountedAmount / 100).toFixed(0)} instead of ₹${(totalAmount / 100).toFixed(0)}.`
      });
    }

    // No coupon applied
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment creation is not configured.' }, { status: 503 });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: apologyId,
      notes: {
        apologyId,
        uid: raw.creator_uid || '',
        creatorId: attributedCreatorId || '',
        attributionSource: attributionSource || 'none',
        discountPercent: 0,
        baseAmount,
        finalAmount: totalAmount,
        buyerName: buyerName || '',
        buyerEmail: buyerEmail || '',
        buyerPhone: buyerPhone || '',
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      couponApplied: false,
      couponCode: null,
      couponId: null,
      creatorId: attributedCreatorId,
      attributionSource,
      discountPercent: 0,
      message: 'No coupon applied.'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to create order.' }, { status: 500 });
  }
}

