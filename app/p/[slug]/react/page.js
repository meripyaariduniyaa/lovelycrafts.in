import Link from 'next/link';
import ReactionSenderClient from './ReactionSenderClient';
import { resolveNoteSlug } from '@/lib/resolve-note-slug';
import { toReactionClientNote } from '@/lib/reaction-note';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolvedNote = await resolveNoteSlug(slug);
  const apology = resolvedNote?.data || null;

  const recipientName = apology?.recipient_name || 'Someone Special';

  return {
    title: `React to your surprise, ${recipientName} | LovelyCrafts`,
    description: `Share how this crafted moment made you feel.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReactionPage({ params }) {
  const { slug } = await params;
  // Next already decodes route params. Avoid throwing on a literal malformed
  // percent sequence that can still appear in a legacy/custom slug.
  let decodedSlug = slug;
  if (typeof slug === 'string') {
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {
      decodedSlug = slug;
    }
  }
  const resolvedNote = await resolveNoteSlug(decodedSlug);
  const apology = resolvedNote?.data || null;

  const expires = apology?.expires_at?.toDate?.() || (apology?.expires_at ? new Date(apology.expires_at) : null);
  const isDev = process.env.NODE_ENV !== 'production';
  const valid = Boolean(apology && (apology?.is_paid === true || isDev) && (!expires || expires.getTime() > Date.now()));

  if (!valid || !apology) {
    return (
      <main className="shell center-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', fontFamily: 'Inter, sans-serif' }}>
        <div className="glass-card text-center" style={{ maxWidth: '480px', width: '100%', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
          <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>Experience Unavailable</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            This private moment is no longer available or was not unlocked.
          </p>
          <Link href="/" style={{ background: '#f43f5e', color: '#fff', padding: '10px 24px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700 }}>
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  // Keep Firestore-specific values outside the React Server Components boundary.
  const serializableNote = toReactionClientNote(resolvedNote.id, apology);

  return (
    <ReactionSenderClient note={serializableNote} />
  );
}
