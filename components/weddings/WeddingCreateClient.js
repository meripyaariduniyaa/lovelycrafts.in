'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function WeddingCreateClient() {
  const params = useSearchParams(); const router = useRouter(); const { user, loading, login } = useAuth(); const [settings, setSettings] = useState(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch('/api/weddings/settings').then((res) => res.json()).then(setSettings).catch(() => setSettings({ enabled: false })); }, []);
  async function create() {
    if (!user) { await login(); return; }
    setBusy(true); setMessage('');
    try { const token = await user.getIdToken(); const response = await fetch('/api/weddings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ templateId: params.get('template') || 'royal-hindu' }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to start your invitation.'); router.push(`/wedding-invitations/editor/${result.invitation.id}`); }
    catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <main className="shaadi-shell shaadi-narrow"><div className="shaadi-eyebrow">Your celebration, beautifully told</div><h1 className="shaadi-title">Begin your invitation</h1><p className="shaadi-copy">We’ll guide you through your families, ceremonies, venue and design. You can preview everything before checkout.</p>
    <div className="shaadi-card shaadi-create-card"><span className="shaadi-card-motif">✦</span><h2>One complete wedding experience</h2><p>Every design feature, event, gallery and RSVP tool is included. Your final price is shown before checkout.</p>{settings?.enabled ? <button className="shaadi-button" onClick={create} disabled={busy || loading}>{busy ? 'Opening your editor…' : user ? 'Start my invitation' : 'Sign in to continue'}</button> : <div className="shaadi-notice">LovelyCrafts Shaadi is preparing for launch. Please check back soon.</div>}{message && <p role="alert" className="shaadi-error">{message}</p>}</div>
    <Link className="shaadi-text-link" href="/wedding-invitations/templates">← Browse the collections</Link>
  </main>;
}
