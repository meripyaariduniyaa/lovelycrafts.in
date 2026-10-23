import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { getPublicCreatorBySlug } from '@/lib/public-creators';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  let creator = null;
  try {
    creator = await getPublicCreatorBySlug(slug);
  } catch {
    // A profile without current public data should not be indexed.
  }
  if (!creator) {
    return { title: `Creator Profile Not Found | ${SITE_NAME}`, robots: { index: false, follow: false } };
  }

  const description = (creator.bio || `Explore ${creator.name}'s favorite personalized digital gifts and exclusive LovelyCrafts offers.`).slice(0, 160);
  const title = `${creator.name} — Digital Gifts & Creator Offers | ${SITE_NAME}`;
  const url = `${SITE_URL}/creators/${encodeURIComponent(creator.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CreatorSlugLayout({ children }) {
  return children;
}
