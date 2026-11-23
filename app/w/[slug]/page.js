import PublicWedding from '@/components/weddings/PublicWedding';
import { getPublishedWedding } from '@/lib/public-wedding';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params; const invitation = await getPublishedWedding(slug);
  const query = await searchParams; const personalLink = typeof query?.guest === 'string';
  return { title: `${invitation.brideName} & ${invitation.groomName} | Wedding Invitation`, description: invitation.familyMessage || `Join ${invitation.brideName} and ${invitation.groomName} for their wedding celebration.`, robots: personalLink ? { index: false, follow: false } : invitation.searchable ? { index: true, follow: true } : { index: false, follow: false }, openGraph: { title: `${invitation.brideName} & ${invitation.groomName} invite you`, description: invitation.familyMessage || 'A beautiful wedding celebration awaits.', url: `https://lovelycrafts.in/w/${invitation.slug}`, type: 'website', images: [`https://lovelycrafts.in/w/${invitation.slug}/opengraph-image`] }, alternates: { canonical: `https://lovelycrafts.in/w/${invitation.slug}` } };
}

export default async function PublicWeddingPage({ params, searchParams }) { const { slug } = await params; const query = await searchParams; const invitation = await getPublishedWedding(slug); return <PublicWedding invitation={invitation} initialGuestCode={typeof query?.guest === 'string' ? query.guest : ''} />; }
