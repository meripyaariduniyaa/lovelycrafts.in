import type { MetadataRoute } from 'next';
import { templates } from '@/lib/templates';
import { getAdminDb } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovelycrafts.in';

// Fixed dates for static pages — avoids signalling false daily content changes on every build
const SITE_LAUNCH = new Date('2026-08-09');
const TEMPLATES_UPDATED = new Date('2026-08-29');
const LEGAL_UPDATED = new Date('2026-08-09');

const enInAlternates = (path: string) => ({
  languages: {
    'en-IN': `${SITE_URL}${path}`,
  },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: enInAlternates('/'),
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: TEMPLATES_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: enInAlternates('/templates'),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: enInAlternates('/blog'),
    },
    {
      url: `${SITE_URL}/arcade`,
      lastModified: TEMPLATES_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: enInAlternates('/arcade'),
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
    blogPages = snap.docs.map((doc) => {
      const data = doc.data();
      const lastMod = data.updatedAt?.toDate?.() || data.publishedAt?.toDate?.() || new Date();
      return {
        url: `${SITE_URL}/blog/${encodeURIComponent(data.slug)}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: enInAlternates(`/blog/${encodeURIComponent(data.slug)}`),
      };
    });
  } catch (err) {
    // If during build time db cannot be contacted, fallback to seed blog slugs
    const seedSlugs = [
      '10-creative-virtual-birthday-surprises',
      'how-to-write-an-emotional-apology-letter',
      'modern-proposal-ideas-interactive-story',
    ];
    blogPages = seedSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: new Date('2026-09-01'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: enInAlternates(`/blog/${slug}`),
    }));
  }

  return [...staticPages, ...templatePages, ...blogPages];
}
