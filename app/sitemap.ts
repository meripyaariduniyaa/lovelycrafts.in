import type { MetadataRoute } from 'next';
import { templates } from '@/lib/templates';
import { getAdminDb } from '@/lib/firebase-admin';
import { getPublicCreatorSitemapEntries } from '@/lib/public-creators';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovelycrafts.in';

// Date the current SEO and content pass was updated.
const SITE_CONTENT_UPDATED = new Date('2026-10-23');
export const revalidate = 3600;
const TEMPLATES_UPDATED = new Date('2026-08-29');
const LEGAL_UPDATED = new Date('2026-08-09');

const SEED_BLOG_SLUGS = [
  '10-creative-virtual-birthday-surprises',
  'how-to-write-an-emotional-apology-letter',
  'romantic-anniversary-surprises-couples-salgirah',
  'modern-proposal-ideas-interactive-story',
  'valentines-day-pyaar-bhare-sandesh-love-letters',
  'long-distance-relationship-door-hokar-bhi-paas',
  'best-friend-birthday-dosti-yaari-scraps',
  'digital-greeting-card-trends-whatsapp-wishes',
];

const enInAlternates = (path: string) => ({
  languages: {
    'en-IN': `${SITE_URL}${path}`,
  },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: SITE_CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: enInAlternates('/'),
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: SITE_CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: enInAlternates('/templates'),
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: enInAlternates('/blog'),
    },
    {
      url: `${SITE_URL}/arcade`,
      lastModified: SITE_CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: enInAlternates('/arcade'),
    },
    {
      url: `${SITE_URL}/business`,
      lastModified: SITE_CONTENT_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: enInAlternates('/business'),
    },
    {
      url: `${SITE_URL}/creators`,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: enInAlternates('/creators'),
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: enInAlternates('/privacy'),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: enInAlternates('/about'),
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: enInAlternates('/contact'),
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: enInAlternates('/faq'),
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: enInAlternates('/terms'),
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: enInAlternates('/refund'),
    },
    {
      url: `${SITE_URL}/shipping`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: enInAlternates('/shipping'),
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: enInAlternates('/cookies'),
    },
  ];

  const templatePages: MetadataRoute.Sitemap = templates
    .filter((template) => template.id)
    .map((template) => ({
      url: `${SITE_URL}/templates/${encodeURIComponent(template.id)}`,
      lastModified: TEMPLATES_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: enInAlternates(`/templates/${encodeURIComponent(template.id)}`),
    }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').where('status', '==', 'published').get();
    const publishedBySlug = new Map(snap.docs.filter((doc) => typeof doc.data().slug === 'string' && doc.data().slug.trim()).map((doc) => [doc.data().slug, doc.data()]));
    const slugs = [...new Set([...SEED_BLOG_SLUGS, ...publishedBySlug.keys()])];
    blogPages = slugs.map((slug) => {
      const data = publishedBySlug.get(slug);
      if (!data) return {
        url: `${SITE_URL}/blog/${encodeURIComponent(slug)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: enInAlternates(`/blog/${encodeURIComponent(slug)}`),
      };
      const lastMod = data.updatedAt?.toDate?.() || data.publishedAt?.toDate?.() || null;
      return {
        url: `${SITE_URL}/blog/${encodeURIComponent(data.slug)}`,
        ...(lastMod ? { lastModified: lastMod } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: enInAlternates(`/blog/${encodeURIComponent(data.slug)}`),
      };
    });
  } catch (err) {
    // If during build time db cannot be contacted, fallback to seed blog slugs
    blogPages = SEED_BLOG_SLUGS.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: enInAlternates(`/blog/${slug}`),
    }));
  }

  const arcadeGamePages: MetadataRoute.Sitemap = ['heart-rush', 'memory-match', 'speed-tap', 'love-quiz', 'word-scramble'].map((id) => ({
    url: `${SITE_URL}/arcade/${id}`,
    lastModified: TEMPLATES_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: enInAlternates(`/arcade/${id}`),
  }));

  let creatorPages: MetadataRoute.Sitemap = [];
  try {
    creatorPages = (await getPublicCreatorSitemapEntries()).map(({ slug, lastModified }) => ({
      url: `${SITE_URL}/creators/${encodeURIComponent(slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: enInAlternates(`/creators/${encodeURIComponent(slug)}`),
    }));
  } catch {
    // Omit dynamic creator pages when the public profile collection is unavailable.
  }

  return [...staticPages, ...templatePages, ...arcadeGamePages, ...blogPages, ...creatorPages];
}
