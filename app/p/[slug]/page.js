import Link from 'next/link';
import RecipientExperienceWrapper from '@/components/RecipientExperienceWrapper';
import { resolveNoteSlug } from '@/lib/resolve-note-slug';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovelycrafts.in';

// Private note pages are NEVER indexed — all generated user content stays private
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolvedNote = await resolveNoteSlug(slug);
  const apology = resolvedNote?.data || null;

  const expires = apology?.expires_at?.toDate?.() || (apology?.expires_at ? new Date(apology.expires_at) : null);
  const valid = apology?.is_paid === true && expires && expires.getTime() > Date.now();

  // Always noindex private recipient pages regardless of validity
  const noindex = { index: false, follow: false };

  if (!valid || !apology) {
    return {
      title: 'Private note unavailable | LovelyCrafts',
      description: 'This note link has expired, is not yet unlocked, or is no longer available.',
      robots: noindex,
    };
  }

  const recipientName = apology.recipient_name || 'someone special';

  return {
    title: `A heartfelt note for ${recipientName} | LovelyCrafts`,
    description: `A private, beautiful digital note for ${recipientName}.`,
    robots: noindex,
  };
}

export default async function CustomLinkPage({ params }) {
  const { slug } = await params;
  const resolvedNote = await resolveNoteSlug(slug);
  const apology = resolvedNote?.data || null;

  const expires = apology?.expires_at?.toDate?.() || (apology?.expires_at ? new Date(apology.expires_at) : null);
  const valid = apology?.is_paid === true && expires && expires.getTime() > Date.now();

  if (!valid || !apology) {
    return (
      <main className="shell center-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card text-center" style={{ maxWidth: '500px', width: '100%', margin: '2rem auto' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            THIS PAGE ISN&apos;T AVAILABLE
          </p>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>It may have expired.</h1>
          <p className="text-muted" style={{ fontSize: '1rem' }}>
            This private note is no longer available, or the link was not unlocked yet.
          </p>
          <Link href="/" className="btn-secondary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  // Create a clean, plain serializable JavaScript object for the Client Component
  const serializableNote = {
    id: resolvedNote.id,
    slug: slug || apology.custom_slug || resolvedNote.id,
    recipient_name: apology.recipient_name || '',
    custom_message: apology.custom_message || '',
    image_urls: Array.isArray(apology.image_urls) ? apology.image_urls : [],
    shagun_qr_url: apology.shagun_qr_url || null,
    custom_details: apology.custom_details || null,
    template: apology.template || 'default',
    custom_slug: apology.custom_slug || null,
    is_paid: apology.is_paid || false,
  };

  return (
    <main className="recipient-experience" aria-label="A private LovelyCrafts experience">
      <RecipientExperienceWrapper note={serializableNote} />
    </main>
  );
}
