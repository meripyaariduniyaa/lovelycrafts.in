import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyReferral } from '@/lib/referral-crypto';
import { generateOrganicRetentionCoupon, disableOrganicRetentionCoupon } from '@/lib/coupons';
import { getClientCountry } from '@/lib/geo';

export async function POST(request) {
  try {
    const geo = getClientCountry(request);
    if (!geo.isIndia) {
      return NextResponse.json({ ok: false, eligible: false, countryBlocked: true, message: 'Offers restricted to India' });
    }

    const adminDb = getAdminDb();
    const body = await request.json().catch(() => ({}));
    const { noteId, action = 'get_or_create', code, couponId } = body;

    // Check referral cookie — prioritize creator attribution if present
    const refCookie = request.cookies.get('lc_ref')?.value;
    const refData = verifyReferral(refCookie);
    const hasCreatorReferral = Boolean(refData?.creatorId);

    if (action === 'disable') {
      const disableResult = await disableOrganicRetentionCoupon(adminDb, { code, couponId, noteId });
      return NextResponse.json({ ok: true, disabled: true, ...disableResult });
    }

    // If customer has creator referral link, resolve and return creator's coupon
    if (hasCreatorReferral) {
      let referralCoupon = null;
      try {
        const creatorSnap = await adminDb.collection('creators').doc(refData.creatorId).get();
        if (creatorSnap.exists) {
          const creatorData = creatorSnap.data();
          let code = creatorData.coupon_code || null;
          let percent = 10;
          let label = `${creatorData.name || 'Creator'}'s Special Discount`;

          // Check for active creator coupon in coupons collection
          const cpSnap = await adminDb.collection('coupons')
            .where('creator_id', '==', refData.creatorId)
            .where('active', '==', true)
            .limit(1)
            .get();

          if (!cpSnap.empty) {
            const cpDoc = cpSnap.docs[0].data();
            code = cpDoc.code || code;
            percent = cpDoc.discount_percent || percent;
            label = cpDoc.label || label;
          }

          if (code) {
            referralCoupon = {
              code,
              percent,
              label,
              creator_id: refData.creatorId,
              creator_name: creatorData.name || 'Creator Partner',
            };
          }
        }
      } catch (err) {
        console.error('Error fetching creator referral coupon:', err);
      }

      return NextResponse.json({
        ok: true,
        eligible: false,
        hasReferral: true,
        reason: 'creator_referral_active',
        creatorId: refData.creatorId,
        referralCoupon,
      });
    }

    const couponResult = await generateOrganicRetentionCoupon(adminDb, {
      noteId: noteId || null,
      durationMinutes: 15,
    });

    if (couponResult.eligible === false) {
      return NextResponse.json({
        ok: true,
        eligible: false,
        reason: couponResult.reason || 'retention_offer_expired',
      });
    }

    return NextResponse.json({
      ok: true,
      eligible: true,
      coupon: couponResult,
    });
  } catch (error) {
    console.error('Error in organic-retention coupon API:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to process organic retention coupon' },
      { status: 500 }
    );
  }
}
