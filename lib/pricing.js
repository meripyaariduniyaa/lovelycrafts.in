import { getAdminDb } from '@/lib/firebase-admin';
import { templates } from '@/lib/templates';

// In-memory cache for fast lookups (invalidates after 30 seconds)
let pricingCache = null;
let cacheExpiry = 0;

export const DEFAULT_PRICING = templates.reduce((acc, t) => {
  acc[t.id] = {
    price: t.price || 199,
    basePrice: t.basePrice || 499,
    badge: t.badge || 'Popular',
    enabled: true,
  };
  return acc;
}, {});

/**
 * Fetch all dynamic template prices from Firestore with fallback to defaults
 */
export async function getTemplatePricing(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && pricingCache && now < cacheExpiry) {
    return pricingCache;
  }

  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return DEFAULT_PRICING;
    }

    const docSnap = await adminDb.collection('settings').doc('pricing').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      const merged = { ...DEFAULT_PRICING };

      Object.keys(DEFAULT_PRICING).forEach((id) => {
        if (data[id] && typeof data[id].price === 'number') {
          merged[id] = {
            price: Number(data[id].price),
            basePrice: Number(data[id].basePrice || DEFAULT_PRICING[id].basePrice),
            badge: data[id].badge || DEFAULT_PRICING[id].badge,
            enabled: data[id].enabled !== false,
          };
        }
      });

      pricingCache = merged;
      cacheExpiry = now + 30000; // Cache for 30s
      return merged;
    }
  } catch (err) {
    console.error('[getTemplatePricing] Error reading pricing from Firestore:', err);
  }

  pricingCache = DEFAULT_PRICING;
  cacheExpiry = now + 10000;
  return DEFAULT_PRICING;
}

/**
 * Get price in Rupees and paise for a specific template
 */
export async function getTemplatePrice(templateId) {
  const allPricing = await getTemplatePricing();
  const templateConfig = allPricing[templateId] || DEFAULT_PRICING[templateId] || { price: 199, basePrice: 499 };
  
  const priceRupees = Math.max(1, Number(templateConfig.price) || 199);
  const basePriceRupees = Math.max(priceRupees, Number(templateConfig.basePrice) || 499);

  return {
    templateId,
    priceRupees,
    pricePaise: priceRupees * 100,
    basePriceRupees,
    basePricePaise: basePriceRupees * 100,
  };
}

/**
 * Save updated template prices to Firestore
 */
export async function saveTemplatePricing(newPricing, updatedBy = 'admin') {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error('Firebase Admin DB is not initialized.');
  }

  const payload = {
    ...newPricing,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await adminDb.collection('settings').doc('pricing').set(payload, { merge: true });
  
  // Invalidate cache
  pricingCache = null;
  cacheExpiry = 0;

  return payload;
}
