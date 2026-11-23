'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function WeddingCheckoutPage() {
  const { id } = useParams(); const router = useRouter(); const { user } = useAuth(); const [invitation, setInvitation] = useState(null); const [settings, setSettings] = useState(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch('/api/weddings/settings').then((r) => r.json()).then(setSettings); }, []);
  useEffect(() => { if (!user) return; user.getIdToken().then((token) => fetch(`/api/weddings/${id}`, { headers: { Authorization: `Bearer ${token}` } })).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setInvitation(d.invitation); }).catch((e) => setMessage(e.message)); }, [id, user]);
  const tokenHeaders = useCallback(async () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` }), [user]);
  async function checkout() {
    if (!user) return setMessage('Sign in with the account that created this invitation.'); setBusy(true); setMessage('Preparing secure checkout…');
    try {
      const script = document.getElementById('razorpay-checkout-script') || await new Promise((resolve, reject) => { const item = document.createElement('script'); item.id = 'razorpay-checkout-script'; item.src = 'https://checkout.razorpay.com/v1/checkout.js'; item.onload = () => resolve(item); item.onerror = reject; document.body.appendChild(item); });
      if (!script) throw new Error('Razorpay checkout could not load.');
      const headers = await tokenHeaders(); const orderResponse = await fetch(`/api/weddings/${id}/checkout`, { method: 'POST', headers }); const order = await orderResponse.json(); if (!orderResponse.ok) throw new Error(order.error);
      const checkout = new window.Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: 'LovelyCrafts Shaadi', description: `Wedding invitation for ${invitation.brideName} & ${invitation.groomName}`, order_id: order.orderId, prefill: { name: user.displayName || '', email: user.email || '' }, theme: { color: '#8a2c35' }, modal: { ondismiss: () => { setBusy(false); setMessage('Checkout closed. Your invitation is saved as a draft.'); } }, handler: async (payment) => {
        try { const response = await fetch(`/api/weddings/${id}/verify`, { method: 'POST', headers: await tokenHeaders(), body: JSON.stringify(payment) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); const published = await fetch(`/api/weddings/${id}/publish`, { method: 'POST', headers: await tokenHeaders() }); const publishedResult = await published.json(); if (!published.ok) throw new Error(publishedResult.error); router.push(`/dashboard/weddings/${id}?published=1`); } catch (error) { setBusy(false); setMessage(`Payment received. Publishing is being confirmed: ${error.message}`); }
      } });
      checkout.on('payment.failed', (event) => { setBusy(false); setMessage(event.error?.description || 'Payment did not complete. You can try again.'); }); checkout.open(); setMessage('');
    } catch (error) { setBusy(false); setMessage(error.message || 'Unable to start payment.'); }
  }
  return <main className="shaadi-shell shaadi-narrow"><Link href={`/wedding-invitations/editor/${id}`} className="shaadi-text-link">← Back to your invitation</Link><div className="shaadi-eyebrow">A beautiful welcome, ready to share</div><h1 className="shaadi-title">Review &amp; checkout</h1><section className="shaadi-card shaadi-checkout-card"><h2>{invitation ? `${invitation.brideName} & ${invitation.groomName}` : 'Your wedding invitation'}</h2><p>One complete invitation experience with every design feature, your ceremonies, photo gallery and guest RSVPs.</p>{settings?.pricePaise ? <div className="shaadi-price">₹{(settings.pricePaise / 100).toLocaleString('en-IN')}<small> one-time payment</small></div> : <p className="shaadi-notice">Pricing is being prepared. Please check back soon.</p>}{invitation?.paymentStatus === 'paid' ? <p className="shaadi-notice">This invitation is already paid. <Link href={`/dashboard/weddings/${id}`}>Manage invitation</Link></p> : <button className="shaadi-button" onClick={checkout} disabled={busy || !settings?.enabled || !settings?.pricePaise}>{busy ? 'Opening secure checkout…' : 'Pay securely with Razorpay'}</button>}{message && <p role="status" className="shaadi-checkout-message">{message}</p>}<small>Payment is verified securely by LovelyCrafts before your invitation is published.</small></section></main>;
}
