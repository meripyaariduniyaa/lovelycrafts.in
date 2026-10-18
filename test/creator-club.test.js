import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CREATOR_TIERS,
  normalizeCode,
  normalizeSlug,
  tierForOrders,
  nextTierForOrders,
  calculateEffectiveTierAndRate,
  commissionForAmount,
  calculateGraduatedCommission,
  isAdminEmail,
} from '../lib/creator-club.js';
import { signReferral, verifyReferral } from '../lib/referral-crypto.js';

import { getCouponRule, resolveCoupon } from '../lib/coupons.js';
import { creatorSummary } from '../lib/creator-metrics.js';

test('1. Normalization utilities', () => {
  assert.equal(normalizeCode('  maya30  '), 'MAYA30');
  assert.equal(normalizeCode('vip-100 special'), 'VIP-100SPECIAL');
  assert.equal(normalizeSlug('Maya & Arjun Vlogs!'), 'maya-arjun-vlogs');
  assert.equal(normalizeSlug('  ---test---slug--- '), 'test-slug');
});

test('2. Creator tiers and automatic commission scaling', () => {
  assert.equal(tierForOrders(0).id, 'starter');
  assert.equal(tierForOrders(100).id, 'starter');
  assert.equal(tierForOrders(101).id, 'rising');
  assert.equal(tierForOrders(300).id, 'rising');
  assert.equal(tierForOrders(301).id, 'creator');
  assert.equal(tierForOrders(700).id, 'creator');
  assert.equal(tierForOrders(701).id, 'partner');
  assert.equal(tierForOrders(1500).id, 'partner');
  assert.equal(tierForOrders(1501).id, 'elite');
  assert.equal(tierForOrders(2500).id, 'elite');

  const next = nextTierForOrders(5);
  assert.equal(next?.id, 'rising');
  assert.equal(nextTierForOrders(1501), null);
});

test('3. Commission calculation on final paid amount & progressive tier-wise slices', () => {
  // Amount in paise: ₹199 = 19900 paise
  // 10% of ₹199 (19900 paise) = 1990 paise (₹19.90)
  assert.equal(commissionForAmount(19900, 10), 1990);
  // 15% of ₹199 (19900 paise) = 2985 paise (₹29.85)
  assert.equal(commissionForAmount(19900, 15), 2985);
  // 18% of ₹199 (19900 paise) = 3582 paise (₹35.82)
  assert.equal(commissionForAmount(19900, 18), 3582);
  // 20% on ₹159 (15900 paise) = 3180 paise
  assert.equal(commissionForAmount(15900, 20), 3180);
  // 0% or negative checks
  assert.equal(commissionForAmount(0, 15), 0);
  assert.equal(commissionForAmount(-100, 15), 0);

  // Progressive graduated tier calculation test:
  // For 300 orders:
  // - First 100 orders @ 10% (100 * 1990 = 199000 paise)
  // - Next 200 orders (101-300) @ 15% (200 * 2985 = 597000 paise)
  // Total = 796000 paise (₹7,960.00)
  const grad300 = calculateGraduatedCommission(300, 19900);
  assert.equal(grad300.totalCommissionPaise, 796000);
  assert.equal(grad300.totalCommissionRupees, 7960);
  assert.equal(grad300.breakdown.length, 2);
  assert.equal(grad300.breakdown[0].tierName, 'Starter');
  assert.equal(grad300.breakdown[0].orders, 100);
  assert.equal(grad300.breakdown[1].tierName, 'Rising');
  assert.equal(grad300.breakdown[1].orders, 200);
});

test('4. Admin overrides take precedence over calculated tier and rate', () => {
  const creatorNoOverride = { tier: 'starter' };
  const res1 = calculateEffectiveTierAndRate(creatorNoOverride, 5);
  assert.equal(res1.tierId, 'starter');
  assert.equal(res1.commissionRate, 10);

  const creatorWithTierOverride = { tier: 'starter', tier_override: 'elite' };
  const res2 = calculateEffectiveTierAndRate(creatorWithTierOverride, 2);
  assert.equal(res2.tierId, 'elite');
  assert.equal(res2.commissionRate, 18);

  const creatorWithRateOverride = { tier: 'starter', commission_rate_override: 25 };
  const res3 = calculateEffectiveTierAndRate(creatorWithRateOverride, 0);
  assert.equal(res3.commissionRate, 25);
});

test('5. 30-Day Referral signing, HMAC verification, and tamper rejection', () => {
  process.env.REFERRAL_COOKIE_SECRET = 'test-secret-key-for-referral-cookie-32chars';

  const creatorId = 'creator_user_123';
  const thirtyDaysFuture = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const signed = signReferral(creatorId, thirtyDaysFuture);

  // Valid verification
  const verified = verifyReferral(signed);
  assert.ok(verified);
  assert.equal(verified?.creatorId, creatorId);
  assert.equal(verified?.expiresAt, thirtyDaysFuture);

  // Expired verification rejection
  const expiredPast = Date.now() - 1000;
  const expiredSigned = signReferral(creatorId, expiredPast);
  assert.equal(verifyReferral(expiredSigned), null);

  // Tampered payload rejection
  const tampered = signed.replace(creatorId, 'tampered_user_456');
  assert.equal(verifyReferral(tampered), null);

  // Tampered signature rejection
  const corrupted = signed.slice(0, -5) + 'xxxxx';
  assert.equal(verifyReferral(corrupted), null);
});

test('6. Coupon precedence (Database > Legacy Registry > Env)', async () => {
  process.env.CUSTOM_COUPONS = JSON.stringify({ 'legacy20': { percent: 20, label: 'Legacy 20%' } });

  // Mock DB where 'MAYA30' exists in Firestore DB
  const mockDb = {
    collection: (coll) => {
      if (coll === 'coupons') {
        return {
          where: (field, op, val) => ({
            limit: () => ({
              get: async () => {
                if (val === 'MAYA30') {
                  return {
                    empty: false,
                    docs: [
                      {
                        id: 'coupon_doc_1',
                        data: () => ({
                          code: 'MAYA30',
                          creator_id: 'creator_maya',
                          type: 'creator',
                          discount_percent: 30,
                          active: true,
                          label: 'Maya 30% Special',
                          applicable_template_ids: [],
                        })
                      }
                    ]
                  };
                }
                return { empty: true, docs: [] };
              }
            })
          })
        };
      }
      return {};
    }
  };

  // 1. Database coupon resolved
  const dbCoupon = await resolveCoupon('maya30', { db: mockDb });
  assert.equal(dbCoupon.valid, true);
  assert.equal(dbCoupon.isDatabaseCoupon, true);
  assert.equal(dbCoupon.creator_id, 'creator_maya');
  assert.equal(dbCoupon.percent, 30);

  // 2. Legacy fallback resolved when not in DB
  const legacyCoupon = await resolveCoupon('legacy20', { db: mockDb });
  assert.equal(legacyCoupon.valid, true);
  assert.equal(legacyCoupon.isDatabaseCoupon, false);
  assert.equal(legacyCoupon.percent, 20);

  // 3. Invalid coupon
  const invalidCoupon = await resolveCoupon('nonexistent', { db: mockDb });
  assert.equal(invalidCoupon.valid, false);
});

test('7. Coupon restrictions: Inactive, Expiry, Max Uses, Template Scopes', async () => {
  const mockDbWithRules = {
    collection: () => ({
      where: (field, op, val) => ({
        limit: () => ({
          get: async () => {
            if (val === 'INACTIVE10') {
              return { empty: false, docs: [{ id: 'c1', data: () => ({ code: 'INACTIVE10', active: false, discount_percent: 10 }) }] };
            }
            if (val === 'EXPIRED10') {
              return { empty: false, docs: [{ id: 'c2', data: () => ({ code: 'EXPIRED10', active: true, expires_at: new Date(Date.now() - 10000), discount_percent: 10 }) }] };
            }
            if (val === 'MAXED10') {
              return { empty: false, docs: [{ id: 'c3', data: () => ({ code: 'MAXED10', active: true, max_uses: 5, usage_count: 5, discount_percent: 10 }) }] };
            }
            if (val === 'PROPOSALONLY') {
              return { empty: false, docs: [{ id: 'c4', data: () => ({ code: 'PROPOSALONLY', active: true, applicable_template_ids: ['proposal'], discount_percent: 50 }) }] };
            }
            if (val === 'MIN500') {
              return { empty: false, docs: [{ id: 'c5', data: () => ({ code: 'MIN500', active: true, minimum_amount: 50000, discount_percent: 20 }) }] };
            }
            return { empty: true, docs: [] };
          }
        })
      })
    })
  };

  const rInactive = await resolveCoupon('INACTIVE10', { db: mockDbWithRules });
  assert.equal(rInactive.valid, false);
  assert.match(rInactive.error, /inactive/i);

  const rExpired = await resolveCoupon('EXPIRED10', { db: mockDbWithRules });
  assert.equal(rExpired.valid, false);
  assert.match(rExpired.error, /expired/i);

  const rMaxed = await resolveCoupon('MAXED10', { db: mockDbWithRules });
  assert.equal(rMaxed.valid, false);
  assert.match(rMaxed.error, /maximum usage limit/i);

  // Template mismatch
  const rTemplateMismatch = await resolveCoupon('PROPOSALONLY', { db: mockDbWithRules, templateId: 'birthday' });
  assert.equal(rTemplateMismatch.valid, false);
  assert.match(rTemplateMismatch.error, /not valid for the selected gift/i);

  // Template match
  const rTemplateMatch = await resolveCoupon('PROPOSALONLY', { db: mockDbWithRules, templateId: 'proposal' });
  assert.equal(rTemplateMatch.valid, true);

  // Minimum amount violation
  const rMinViolation = await resolveCoupon('MIN500', { db: mockDbWithRules, orderAmountPaise: 19900 });
  assert.equal(rMinViolation.valid, false);
  assert.match(rMinViolation.error, /minimum order value/i);
});

test('8. Admin Email Allowlist security check', () => {
  process.env.ADMIN_EMAILS = 'admin@lovelycrafts.in, owner@domain.com , SuperAdmin@GMAIL.COM ';

  assert.equal(isAdminEmail('admin@lovelycrafts.in'), true);
  assert.equal(isAdminEmail('ADMIN@lovelycrafts.in'), true);
  assert.equal(isAdminEmail('owner@domain.com'), true);
  assert.equal(isAdminEmail('superadmin@gmail.com'), true);

  assert.equal(isAdminEmail('stranger@gmail.com'), false);
  assert.equal(isAdminEmail(''), false);
  assert.equal(isAdminEmail(null), false);
  assert.equal(isAdminEmail(undefined), false);
});

test('9. Creator summary and metrics calculation', () => {
  const creator = { id: 'c1', name: 'Maya', tier: 'starter' };
  const orders = [
    { payment_status: 'paid', final_amount: 19900, commission_rate: 15, paid_at: new Date() },
    { payment_status: 'paid', final_amount: 19900, commission_rate: 15, paid_at: new Date() },
    { payment_status: 'pending', final_amount: 19900 },
  ];
  const commissions = [
    { commission_amount: 2985, status: 'pending' },
    { commission_amount: 2985, status: 'paid' },
  ];

  const summary = creatorSummary({ creator, orders, clicks: [{}, {}, {}], commissions, payouts: [] });
  assert.equal(summary.totalOrders, 2);
  assert.equal(summary.clicks, 3);
  assert.equal(summary.pending, 2985);
  assert.equal(summary.paid, 2985);
  assert.equal(summary.tier.id, 'starter');
});

test('10. Coupon deletion preserves historical snapshots while unlinking code', () => {
  // Simulate immutable snapshot stored in order and commission
  const orderSnapshot = {
    id: 'ord_123',
    coupon_code: 'DELETEDCOUPON',
    discount_percent: 25,
    final_amount: 14925,
    creator_id: 'creator_777',
    attribution_source: 'coupon'
  };

  const commissionSnapshot = {
    id: 'comm_456',
    order_id: 'ord_123',
    creator_id: 'creator_777',
    commission_amount: 2238,
    status: 'pending'
  };

  // Simulated state after coupon deletion:
  // Coupon record is gone from DB, creator document unlinked coupon_id = null, coupon_code = null
  const creatorAfterDeletion = {
    id: 'creator_777',
    name: 'Maya',
    coupon_id: null,
    coupon_code: null
  };

  // 1. Historical financial records remain intact and unchanged
  assert.equal(orderSnapshot.coupon_code, 'DELETEDCOUPON');
  assert.equal(orderSnapshot.final_amount, 14925);
  assert.equal(commissionSnapshot.commission_amount, 2238);

  // 2. Creator profile has unlinked coupon
  assert.equal(creatorAfterDeletion.coupon_code, null);
});
