import { getAdminDb } from '@/lib/firebase-admin';
import Link from 'next/link';
import ReactionSenderClient from './ReactionSenderClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let apology = null;

  try {
    const snap = await getAdminDb().collection('notes').doc(slug).get();
    if (snap.exists) apology = snap.data();
  } catch {}

  const recipientName = apology?.recipient_name || 'Someone Special';

  return {
    title: `React to your surprise, ${recipientName} | LovelyCrafts`,
    description: `Share how this crafted moment made you feel.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReactionPage({ params }) {
  const { slug } = await params;
  let apology = null;

  try {
    const snap = await getAdminDb().collection('notes').doc(slug).get();
    if (snap.exists) apology = snap.data();
  } catch {}

  const expires = apology?.expires_at?.toDate?.() || (apology?.expires_at ? new Date(apology.expires_at) : null);
  const valid = apology?.is_paid === true && (!expires || expires.getTime() > Date.now());

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

  const serializableNote = {
    id: slug,
    recipient_name: apology.recipient_name || '',
    sender_name: apology.custom_details?.sender_name || '',
    template: apology.template || 'proposal',
    custom_slug: apology.custom_slug || null,
    recipient_reaction: apology.recipient_reaction || null,
  };

  return (
    <ReactionSenderClient note={serializableNote} />
  );
}
