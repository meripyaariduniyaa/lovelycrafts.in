'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function WeddingPreviewPage() {
  const { id } = useParams(); const { user } = useAuth(); const [invitation, setInvitation] = useState(null); const [error, setError] = useState('');
  useEffect(() => { if (!user) return; user.getIdToken().then((token) => fetch(`/api/weddings/${id}`, { headers: { Authorization: `Bearer ${token}` } })).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setInvitation(data.invitation); }).catch((err) => setError(err.message)); }, [id, user]);
  if (error) return <main className="shaadi-shell"><p role="alert">{error}</p></main>; if (!invitation) return <main className="shaadi-shell">Loading your preview…</main>;
  return <main className="shaadi-shell shaadi-narrow"><Link href={`/wedding-invitations/editor/${id}`} className="shaadi-text-link">← Back to editing</Link><div className="shaadi-preview" style={{ '--invite-ink': invitation.appearance?.accent || '#bd914b', '--invite-paper': invitation.appearance?.background || '#fff8e9' }}><div className="shaadi-preview-ornament"><div className="shaadi-preview-motif">✦</div><div className="shaadi-preview-label">Together with their families</div><h1>{invitation.brideName} <span>&amp;</span><br />{invitation.groomName}</h1><p>{invitation.weddingDate}</p>{invitation.events?.map((event) => <div key={event.id} className="shaadi-preview-event"><strong>{event.title || event.type}</strong><small>{event.date} · {event.venueName}</small></div>)}</div></div><Link className="shaadi-button" href={`/wedding-invitations/checkout/${id}`}>Continue to checkout</Link></main>;
}
