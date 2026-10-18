export const CREATOR_TIERS = [
  { id: 'starter', name: 'Starter', minOrders: 0, maxOrders: 100, commissionRate: 10, emoji: '🌱', rangeLabel: '0–100' },
  { id: 'rising', name: 'Rising', minOrders: 101, maxOrders: 300, commissionRate: 15, emoji: '💚', rangeLabel: '101–300' },
  { id: 'creator', name: 'Creator', minOrders: 301, maxOrders: 700, commissionRate: 16, emoji: '💙', rangeLabel: '301–700' },
  { id: 'partner', name: 'Partner', minOrders: 701, maxOrders: 1500, commissionRate: 17, emoji: '💜', rangeLabel: '701–1,500' },
  { id: 'elite', name: 'Elite', minOrders: 1501, maxOrders: Infinity, commissionRate: 18, emoji: '👑', rangeLabel: '1,501+' },
];

export const PAYOUT_THRESHOLD_PAISE = 50000; // ₹500 in paise
export const PAYOUT_THRESHOLD_RUPEES = 500;

export function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function tierForOrders(orders = 0) {
  const num = Math.max(0, Number(orders) || 0);
  return [...CREATOR_TIERS].reverse().find((tier) => num >= tier.minOrders) || CREATOR_TIERS[0];
}

export function nextTierForOrders(orders = 0) {
  const num = Math.max(0, Number(orders) || 0);
  return CREATOR_TIERS.find((tier) => tier.minOrders > num) || null;
}

export function calculateEffectiveTierAndRate(creator = {}, paidOrdersCount = 0) {
  const baseTier = tierForOrders(paidOrdersCount);
  const effectiveTierId = creator.tier_override || creator.tier || baseTier.id;
  const matchedTier = CREATOR_TIERS.find((t) => t.id === effectiveTierId) || {
    id: effectiveTierId,
    name: effectiveTierId.charAt(0).toUpperCase() + effectiveTierId.slice(1),
    commissionRate: baseTier.commissionRate,
    emoji: '⭐'
  };

  const effectiveRate = Number(
    creator.commission_rate_override !== undefined && creator.commission_rate_override !== null
      ? creator.commission_rate_override
      : matchedTier.commissionRate
  );

  return {
    tier: matchedTier,
    tierId: effectiveTierId,
    commissionRate: Math.max(0, Math.min(100, effectiveRate)),
    nextTier: nextTierForOrders(paidOrdersCount)
  };
}

export function commissionForAmount(amountPaise, rate) {
  const amount = Math.max(0, Number(amountPaise) || 0);
  const percentage = Math.max(0, Number(rate) || 0) / 100;
  return Math.round(amount * percentage);
}

export function calculateGraduatedCommission(totalOrders = 0, orderAmountPaise = 19900) {
  let remainingOrders = Math.max(0, Number(totalOrders) || 0);
  let totalCommissionPaise = 0;
  const breakdown = [];

  for (let i = 0; i < CREATOR_TIERS.length; i++) {
    const tier = CREATOR_TIERS[i];
    const tierCapacity = tier.maxOrders === Infinity ? Infinity : (tier.maxOrders - Math.max(1, tier.minOrders) + 1);

    const ordersInThisTier = Math.min(remainingOrders, tierCapacity);
    if (ordersInThisTier > 0) {
      const commPerOrder = commissionForAmount(orderAmountPaise, tier.commissionRate);
      const tierTotal = ordersInThisTier * commPerOrder;
      totalCommissionPaise += tierTotal;
      breakdown.push({
        tierId: tier.id,
        tierName: tier.name,
        orders: ordersInThisTier,
        rate: tier.commissionRate,
        commissionPaise: tierTotal,
        commissionRupees: Number((tierTotal / 100).toFixed(2)),
      });
      remainingOrders -= ordersInThisTier;
    }
    if (remainingOrders <= 0) break;
  }

  return {
    totalCommissionPaise,
    totalCommissionRupees: Number((totalCommissionPaise / 100).toFixed(2)),
    breakdown,
  };
}

export function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const allowed = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}


