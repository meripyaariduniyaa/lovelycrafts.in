import { getAdminDb } from '@/lib/firebase-admin';
import { resolveCoupon } from '@/lib/coupons';
import { verifyReferral } from '@/lib/referral-crypto';
import { getTemplatePrice } from '@/lib/pricing';

export async function getCheckoutQuote({ noteId, couponCode, referralCookie }) {
  const adminDb = getAdminDb();
  const noteRef = adminDb.collection('notes').doc(noteId);
  const noteSnap = await noteRef.get();
  if (!noteSnap.exists) return { error: 'Gift not found.', status: 404 };

  const note = noteSnap.data();
  if (note.is_paid) return { error: 'This gift has already been paid.', status: 409, paid: true };

  const templateId = note.template || 'proposal';
  const price = await getTemplatePrice(templateId);
  if (!price.enabled) return { error: 'This gift is currently unavailable.', status: 409 };

  const baseAmount = price.pricePaise || 19900;
  let coupon = null;
  if (typeof couponCode === 'string' && couponCode.trim()) {
    coupon = await resolveCoupon(couponCode, {
      db: adminDb,
      templateId,
      orderAmountPaise: baseAmount,
      creatorUserId: note.creator_uid,
    });
    if (!coupon.valid) return { error: coupon.error || 'Invalid coupon.', status: 400, invalidCoupon: true };
  }

  const referral = verifyReferral(referralCookie || '');
  let creatorId = referral?.creatorId || null;
  let attributionSource = creatorId ? 'referral_link' : null;
  if (coupon?.creator_id) {
    creatorId = coupon.creator_id;
    attributionSource = 'coupon';
  }

  const discountPercent = coupon?.percent || 0;
  const amount = discountPercent >= 100
    ? 0
    : coupon
      ? Math.max(100, Math.round(baseAmount * (1 - discountPercent / 100)))
      : baseAmount;

  return {
    note,
    templateId,
    baseAmount,
    amount,
    discountPercent,
    free: amount === 0,
    couponCode: coupon?.code || null,
    couponId: coupon?.id || null,
    couponLabel: coupon?.label || null,
    creatorId,
    attributionSource,
  };
}
