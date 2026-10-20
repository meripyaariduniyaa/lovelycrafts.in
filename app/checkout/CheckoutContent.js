'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { templates } from '@/lib/templates';

const formatRupees = (paise) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Math.round(Number(paise || 0) / 100));

export default function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const noteId = params.get('id');
  const returnedCashfreeOrderId = params.get('cashfree_order_id');
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [cashfreeAvailable, setCashfreeAvailable] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gateway, setGateway] = useState('razorpay');
  const [busy, setBusy] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [initialQuoteDone, setInitialQuoteDone] = useState(false);
  const quoteLoaded = useRef(false);
  const returnChecked = useRef(false);

  useEffect(() => {
    if (!noteId) { setLoading(false); return; }
    return onSnapshot(doc(db, 'notes', noteId), (snapshot) => {
      if (snapshot.exists()) setNote({ id: snapshot.id, ...snapshot.data() });
      setLoading(false);
    }, () => setLoading(false));
  }, [noteId]);

  useEffect(() => {
    fetch('/api/checkout/payment-options', { cache: 'no-store' })
      .then((response) => response.json())
      .then((options) => setCashfreeAvailable(Boolean(options.cashfreeAvailable)))
      .catch(() => setCashfreeAvailable(false));
  }, []);

  const fetchQuote = useCallback(async (code = '') => {
    const response = await fetch('/api/checkout/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, couponCode: code }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Unable to calculate the checkout amount.');
    setQuote(data);
    return data;
  }, [noteId]);

  useEffect(() => {
    if (!noteId || !note || quoteLoaded.current) return;
    quoteLoaded.current = true;
    const savedCoupon = new URLSearchParams(window.location.search).get('coupon')
      || localStorage.getItem('lc_saved_coupon') || '';
    setCouponCode(savedCoupon);
    fetchQuote(savedCoupon).then(() => setInitialQuoteDone(true)).catch((err) => {
      if (savedCoupon) {
        setCouponCode('');
        fetchQuote('').then(() => setInitialQuoteDone(true)).catch((quoteError) => { setError(quoteError.message); setInitialQuoteDone(true); });
        setMessage(err.message);
      } else { setError(err.message); setInitialQuoteDone(true); }
    });
  }, [noteId, note, fetchQuote]);

  // Carry the existing creator referral / retention-coupon behavior into checkout.
  useEffect(() => {
    if (!noteId || !note || !initialQuoteDone || couponCode || quote?.couponCode) return;
    let active = true;
    fetch('/api/coupons/organic-retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, action: 'get_or_create' }),
    }).then((response) => response.json()).then((data) => {
      const code = data?.referralCoupon?.code || (data?.eligible ? data?.coupon?.code : '');
      if (active && code) {
        setCouponCode(code);
        fetchQuote(code).then(() => setMessage(data.hasReferral ? 'Creator offer applied.' : 'Your available gift discount has been applied.'))
          .catch((err) => { if (active) setError(err.message); });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [noteId, note, initialQuoteDone, couponCode, quote?.couponCode, fetchQuote]);

  useEffect(() => {
    if (!returnedCashfreeOrderId || !noteId || returnChecked.current) return;
    returnChecked.current = true;
    setBusy(true);
    fetch('/api/cashfree/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'cashfree', apologyId: noteId, cashfree_order_id: returnedCashfreeOrderId }),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Payment is still being confirmed.');
      router.replace(`/success?id=${encodeURIComponent(noteId)}`);
    }).catch((err) => setError(err.message)).finally(() => setBusy(false));
  }, [returnedCashfreeOrderId, noteId, router]);

  useEffect(() => {
    if (note?.is_paid) router.replace(`/success?id=${encodeURIComponent(noteId)}`);
  }, [note, noteId, router]);

  async function applyCoupon() {
    setCouponBusy(true); setError(''); setMessage('');
    try {
      const data = await fetchQuote(couponCode.trim());
      setCouponCode(data.couponCode || '');
      if (data.couponCode) localStorage.setItem('lc_saved_coupon', data.couponCode);
      else localStorage.removeItem('lc_saved_coupon');
      setMessage(data.free ? '100% discount applied. Your gift is ready to unlock.' : data.couponCode ? 'Coupon applied to this gift.' : 'Coupon removed.');
    } catch (err) { setError(err.message); }
    finally { setCouponBusy(false); }
  }

  async function unlockFreeGift() {
    const response = await fetch('/api/razorpay/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apologyId: noteId, couponCode: quote.couponCode, free: true, buyerName, buyerEmail }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not unlock this gift.');
    router.push(`/success?id=${encodeURIComponent(noteId)}`);
  }

  async function payWithRazorpay(preferredMethod) {
    if (!window.Razorpay) throw new Error('Razorpay is still loading. Please try again.');
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apologyId: noteId, couponCode: quote?.couponCode || '', buyerName, buyerEmail, buyerPhone: phone }),
    });
    const order = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(order.error || 'Could not start Razorpay checkout.');
    if (order.free) return unlockFreeGift();

    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'LovelyCrafts',
      description: `Private gift${note?.recipient_name ? ` for ${note.recipient_name}` : ''}`,
      order_id: order.orderId,
      prefill: { name: buyerName || undefined, email: buyerEmail || undefined, contact: phone || undefined },
      ...(preferredMethod ? { method: preferredMethod } : {}),
      theme: { color: '#a83d46' },
      handler: async (payment) => {
        try {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apologyId: noteId, ...payment, buyerName, buyerEmail }),
          });
          const result = await verify.json().catch(() => ({}));
          if (!verify.ok) throw new Error(result.error || 'Payment verification failed.');
          router.push(`/success?id=${encodeURIComponent(noteId)}`);
        } catch (err) { setError(err.message); setBusy(false); }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    checkout.on('payment.failed', (failure) => {
      setError(failure.error?.description || 'Payment failed. You can retry or switch gateways.');
      setBusy(false);
    });
    checkout.open();
  }

  async function payWithCashfree() {
    if (!window.Cashfree) throw new Error('Cashfree checkout is still loading. Please try again.');
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number for Cashfree payment.');
    }
    const response = await fetch('/api/cashfree/create-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, couponCode: quote?.couponCode || '', phone: cleanPhone, buyerName, buyerEmail }),
    });
    const order = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(order.error || 'Could not start Cashfree checkout.');
    if (order.free) return unlockFreeGift();
    const cashfree = window.Cashfree({ mode: order.mode });
    await cashfree.checkout({ paymentSessionId: order.paymentSessionId, redirectTarget: '_self' });
  }

  async function continueToPayment(preferredMethod) {
    setBusy(true); setError('');
    try {
      if (!quote) await fetchQuote(couponCode.trim());
      if (quote?.free) return await unlockFreeGift();
      if (gateway === 'razorpay') await payWithRazorpay(preferredMethod);
      else await payWithCashfree();
    } catch (err) { setError(err.message || 'Unable to start payment.'); setBusy(false); }
  }

  const template = templates.find((item) => item.id === note?.template);

  if (loading || !quote && !error) return <div className="checkout-loading">Preparing secure checkout…</div>;
  if (!noteId || !note) return <main className="checkout-state"><h1>Gift not found</h1><p>Return to the studio and create a new gift.</p><Link href="/create">Create a gift</Link></main>;

  return (
    <main className="checkout-page">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      <div className="checkout-heading">
        <span className="checkout-kicker">Almost ready to share</span>
        <h1>Secure checkout</h1>
        <p>Your gift stays private until payment is confirmed.</p>
      </div>
      <div className="checkout-grid">
        <section className="gift-summary" aria-label="Gift summary">
          <span className="summary-label">YOUR GIFT</span>
          <div className="summary-art">{template?.emoji || '🎁'}</div>
          <h2>{template?.title || 'A LovelyCrafts gift'}</h2>
          <p className="summary-to">Made for <strong>{note.recipient_name || 'someone special'}</strong></p>
          <div className="summary-divider" />
          <div className="summary-price"><span>To pay</span><strong>{formatRupees(quote?.amount)}</strong></div>
          {quote?.discountPercent > 0 && <p className="summary-saved">{quote.discountPercent}% discount applied</p>}
          <ul className="summary-points">
            <li>Private gift link unlocks after verified payment</li>
            <li>Your personal message and photos stay with this gift</li>
            <li>Share the unlocked gift by link or WhatsApp</li>
          </ul>
          <Link className="edit-gift-link" href={`/preview?id=${encodeURIComponent(noteId)}`}>← Back to preview</Link>
        </section>

        <section className="payment-section" aria-label="Payment options">
          <div className="gateway-tabs" role="tablist" aria-label="Choose payment gateway">
            {['razorpay', 'cashfree'].map((provider) => (
              <button key={provider} type="button" role="tab" aria-selected={gateway === provider}
                className={gateway === provider ? 'gateway-tab active' : 'gateway-tab'}
                onClick={() => { setGateway(provider); setError(''); }}>
                {provider === 'razorpay' ? 'Razorpay' : 'Cashfree'}
              </button>
            ))}
          </div>
          <div className="payment-card">
            <div className="payment-card-heading">
              <h2>Pay with {gateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}</h2>
              <span className="secure-badge">SECURE</span>
            </div>
            <p className="payment-copy">{gateway === 'razorpay'
              ? 'Pay using UPI, cards, netbanking or wallet through Razorpay.'
              : 'Pay using UPI, cards or netbanking through Cashfree.'}</p>

            {gateway === 'cashfree' && !quote?.free && (
              cashfreeAvailable ? <label className="phone-field">Mobile number for Cashfree checkout
                <span className="phone-entry"><span>+91</span><input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                  value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number" aria-label="Mobile number for Cashfree checkout" /></span>
              </label> : <p className="checkout-error" role="status">Cashfree is not configured yet. Please choose Razorpay or add Cashfree sandbox credentials.</p>
            )}

            {/* Buyer details for receipt */}
            <div className="buyer-fields">
              <label htmlFor="checkout-buyer-name">Your name</label>
              <input id="checkout-buyer-name" type="text" value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Your name" autoComplete="name" />
              <label htmlFor="checkout-buyer-email">Email for receipt</label>
              <input id="checkout-buyer-email" type="email" value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="coupon-panel">
              <label htmlFor="checkout-coupon">Have a coupon?</label>
              <div className="coupon-row">
                <input id="checkout-coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Enter code" autoComplete="off" />
                <button type="button" disabled={couponBusy} onClick={applyCoupon}>{couponBusy ? 'Checking…' : 'Apply'}</button>
              </div>
              {quote?.couponCode && <span className="coupon-active">✓ {quote.couponCode} applied <button type="button" onClick={() => { setCouponCode(''); fetchQuote('').then(() => { localStorage.removeItem('lc_saved_coupon'); setMessage('Coupon removed.'); }).catch((err) => setError(err.message)); }}>Remove</button></span>}
            </div>

            {message && <p className="checkout-message" role="status">{message}</p>}
            {error && <p className="checkout-error" role="alert">{error}</p>}
            {gateway === 'razorpay' && !quote?.free ? (
              <div className="razorpay-methods" aria-label="Razorpay payment methods">
                <div className="upi-method-card">
                  <div className="upi-method-heading">
                    <span className="upi-method-icon" aria-hidden="true">⌁</span>
                    <div><h3>Pay with UPI</h3><p>Choose an app in Razorpay’s secure checkout.</p></div>
                    <span className="instant-badge">INSTANT</span>
                  </div>
                  <div className="upi-app-list" aria-label="Popular UPI apps supported">
                    <span className="upi-app upi-app-gpay"><b>G</b> Google Pay</span>
                    <span className="upi-app upi-app-phonepe"><b>पे</b> PhonePe</span>
                    <span className="upi-app upi-app-paytm"><b>₹</b> Paytm</span>
                    <span className="upi-app upi-app-more">+ more UPI apps</span>
                  </div>
                  <button className="upi-launch-button" type="button" disabled={busy || couponBusy || !quote}
                    onClick={() => continueToPayment('upi')}>
                    {busy ? 'Opening secure checkout…' : `Continue with UPI · ${formatRupees(quote?.amount)}`}
                  </button>
                </div>
                <button className="card-method-button" type="button" disabled={busy || couponBusy || !quote}
                  onClick={() => continueToPayment('card')}>
                  <span className="card-method-icon" aria-hidden="true">▣</span>
                  <span><strong>Card, netbanking or wallet</strong><small>Opens Razorpay’s secure checkout</small></span>
                  <span className="card-method-arrow" aria-hidden="true">›</span>
                </button>
              </div>
            ) : (
              <button className="pay-button" type="button" disabled={busy || couponBusy || !quote || (gateway === 'cashfree' && !cashfreeAvailable && !quote?.free)}
                onClick={() => continueToPayment()}>
                {busy ? 'Confirming securely…' : quote?.free ? 'Unlock gift for free' : `Continue to ${gateway === 'razorpay' ? 'Razorpay' : 'Cashfree'} · ${formatRupees(quote?.amount)}`}
              </button>
            )}
            <p className="privacy-note"><span aria-hidden="true">♧</span> Payments are processed securely by {gateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}. LovelyCrafts never sees your card details or UPI PIN.</p>
          </div>
          <div className="checkout-back-links"><Link href={`/preview?id=${encodeURIComponent(noteId)}`}>Return to preview</Link><span> · </span><Link href="/refund">Payment help</Link></div>
        </section>
      </div>

      <style jsx>{`
        .checkout-page { max-width: 1120px; margin: 0 auto; padding: clamp(2rem, 5vw, 4rem) 1.25rem 4rem; color: #43332b; }
        .checkout-heading { text-align: center; margin-bottom: 2rem; }
        .checkout-kicker,.summary-label { color: #9d382f; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
        .checkout-heading h1 { margin: .55rem 0 .35rem; color: #3f3029; font: 500 clamp(2.2rem, 5vw, 3.2rem)/1.1 var(--font-playfair), Georgia, serif; }
        .checkout-heading p { margin: 0; color: #78695f; }
        .checkout-grid { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(0, 1.1fr); gap: clamp(1.2rem, 4vw, 2.5rem); align-items: start; }
        .gift-summary,.payment-card { border: 1px solid #eadfd2; border-radius: 26px; background: #fffdf9; box-shadow: 0 15px 45px rgba(91,58,39,.07); }
        .gift-summary { padding: clamp(1.35rem, 3vw, 2rem); }
        .summary-art { width: 64px; height: 64px; display:grid; place-items:center; margin: 1.25rem 0 .85rem; border-radius: 20px 20px 20px 5px; background: #f7e9df; font-size: 2rem; }
        .gift-summary h2,.payment-card-heading h2 { margin: 0; color:#3f3029; font: 500 1.65rem/1.2 var(--font-playfair), Georgia, serif; }
        .summary-to { margin: .65rem 0 1.3rem; color:#746258; }
        .summary-to strong { color:#43332b; }
        .summary-divider { border-top: 1px dashed #dfd0c3; margin: 1.2rem 0; }
        .summary-price { display:flex; align-items:center; justify-content:space-between; gap:1rem; color:#746258; }
        .summary-price strong { color:#3f3029; font: 500 2.1rem var(--font-playfair), Georgia, serif; }
        .summary-saved { color:#39734b; font-size:.82rem; font-weight:700; }
        .summary-points { display:grid; gap:.75rem; padding:0; margin:1.2rem 0 1.5rem; list-style:none; color:#67564b; font-size:.88rem; }
        .summary-points li::before { content:'•'; margin-right:.6rem; color:#b45d50; }
        .edit-gift-link,.checkout-back-links a { color:#963b35; font-weight:700; font-size:.88rem; }
        .payment-section { min-width:0; }
        .gateway-tabs { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; padding:.38rem; margin-bottom:.9rem; border:1px solid #eadfd2; border-radius:18px; background:#f1e8dc; }
        .gateway-tab { min-height:54px; border:0; border-radius:14px; background:transparent; color:#746258; font-weight:750; font-size:.98rem; cursor:pointer; }
        .gateway-tab.active { color:#352b27; background:#fffdf9; box-shadow:0 4px 14px rgba(91,58,39,.1); }
        .payment-card { padding:clamp(1.25rem,3vw,1.75rem); }
        .payment-card-heading { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .secure-badge { padding:.4rem .65rem; border-radius:999px; background:#e7f0e5; color:#386d47; font-size:.67rem; font-weight:800; letter-spacing:.08em; }
        .payment-copy { margin:.85rem 0 1.2rem; color:#746258; line-height:1.6; }
        .phone-field { display:grid; gap:.45rem; margin:0 0 1rem; color:#514238; font-size:.82rem; font-weight:700; }
        .phone-entry { display:flex; align-items:center; min-height:50px; border:1px solid #dfd0c3; border-radius:14px; background:#fff; color:#66554a; }
        .phone-entry span { padding:0 .85rem; border-right:1px solid #eadfd2; }
        .phone-entry input { width:100%; min-width:0; border:0; outline:0; padding:.8rem; border-radius:0 14px 14px 0; color:#43332b; background:transparent; }
        .coupon-panel { padding:1rem; border:1px solid #efe3d7; border-radius:16px; background:#fcf8f2; }
        .coupon-panel label { display:block; margin-bottom:.55rem; color:#514238; font-size:.82rem; font-weight:750; }
        .coupon-row { display:flex; gap:.55rem; }
        .coupon-row input { flex:1; min-width:0; min-height:46px; border:1px solid #dfd0c3; border-radius:12px; padding:.7rem .8rem; background:#fffdf9; color:#43332b; }
        .coupon-row button { border:1px solid #d9c6b5; border-radius:12px; padding:0 1rem; background:#f1e4d7; color:#653d32; font-weight:750; cursor:pointer; }
        .coupon-active { display:block; margin-top:.6rem; color:#3c754d; font-size:.78rem; font-weight:700; }
        .coupon-active button { margin-left:.5rem; border:0; background:none; color:#8e4437; text-decoration:underline; cursor:pointer; }
        .buyer-fields { display:grid; gap:.45rem; margin-bottom:1rem; }
        .buyer-fields label { color:#514238; font-size:.82rem; font-weight:750; }
        .buyer-fields input { min-height:46px; border:1px solid #dfd0c3; border-radius:12px; padding:.7rem .8rem; background:#fffdf9; color:#43332b; outline:none; }
        .buyer-fields input:focus { border-color:#b45d50; }
        .checkout-message,.checkout-error { margin:.8rem 0 0; font-size:.84rem; line-height:1.5; }
        .checkout-message { color:#39734b; }.checkout-error { color:#a32e2e; }
        .pay-button { width:100%; min-height:56px; margin-top:1.1rem; border:0; border-radius:16px; background:#332a29; color:#fffaf5; font-size:1rem; font-weight:800; cursor:pointer; transition:transform .18s, background .18s; }
        .pay-button:hover:not(:disabled) { transform:translateY(-1px); background:#4a3430; }.pay-button:disabled { opacity:.65; cursor:wait; }
        .razorpay-methods { display:grid; gap:.8rem; margin-top:1.1rem; }
        .upi-method-card,.card-method-button { border:1px solid #eadfd2; border-radius:20px; background:#fffdf9; }
        .upi-method-card { padding:1.15rem; }
        .upi-method-heading { display:flex; align-items:center; gap:.75rem; }
        .upi-method-heading h3 { margin:0; color:#3f3029; font:500 1.3rem/1.2 var(--font-playfair),Georgia,serif; }
        .upi-method-heading p { margin:.25rem 0 0; color:#78695f; font-size:.8rem; }
        .upi-method-icon { width:42px; height:42px; display:grid; place-items:center; border-radius:14px; background:#f7e9df; color:#a64036; font-size:1.5rem; }
        .instant-badge { margin-left:auto; padding:.35rem .55rem; border-radius:999px; background:#e7f0e5; color:#386d47; font-size:.61rem; font-weight:800; letter-spacing:.07em; }
        .upi-app-list { display:flex; flex-wrap:wrap; gap:.45rem; margin:1rem 0; }
        .upi-app { display:inline-flex; align-items:center; gap:.35rem; min-height:34px; padding:.35rem .55rem; border:1px solid #efe3d7; border-radius:999px; background:#fff; color:#514238; font-size:.7rem; font-weight:700; }
        .upi-app b { width:19px; height:19px; display:grid; place-items:center; border-radius:50%; font-size:.68rem; }
        .upi-app-gpay b { color:#4285f4; }.upi-app-phonepe b { background:#5f259f; color:#fff; }.upi-app-paytm b { background:#e8f5ff; color:#1677b8; }
        .upi-app-more { color:#78695f; background:#f8f3eb; }
        .upi-launch-button { width:100%; min-height:52px; border:0; border-radius:15px; background:#332a29; color:#fffaf5; font:800 .95rem/1.3 var(--font-bold); cursor:pointer; }
        .upi-launch-button:hover:not(:disabled) { background:#4a3430; }.upi-launch-button:disabled { opacity:.65; cursor:wait; }
        .card-method-button { width:100%; min-height:68px; display:flex; align-items:center; gap:.8rem; padding:.75rem .9rem; text-align:left; color:#43332b; cursor:pointer; }
        .card-method-button:hover:not(:disabled) { background:#fcf8f2; border-color:#d9c6b5; }.card-method-button:disabled { opacity:.65; cursor:wait; }
        .card-method-button > span:nth-child(2) { display:grid; gap:.2rem; flex:1; }.card-method-button strong { font-size:.84rem; }.card-method-button small { color:#78695f; font-size:.74rem; }
        .card-method-icon { width:42px; height:42px; display:grid; place-items:center; border-radius:13px; background:#f5e9c2; font-size:1.15rem; }
        .card-method-arrow { color:#78695f; font-size:1.5rem; }
        .privacy-note { display:flex; gap:.6rem; align-items:flex-start; margin:1rem 0 0; color:#78695f; font-size:.76rem; line-height:1.55; }.privacy-note span { color:#3b8054; }
        .checkout-back-links { margin-top:1rem; text-align:center; color:#a5907d; font-size:.86rem; }
        .checkout-loading,.checkout-state { min-height:58vh; display:grid; align-content:center; justify-items:center; gap:.75rem; padding:2rem; text-align:center; color:#43332b; }
        .checkout-state p { color:#78695f; }.checkout-state a { color:#963b35; font-weight:700; }
        @media(max-width:760px) { .checkout-page { padding-top:2rem; }.checkout-grid { grid-template-columns:1fr; }.gift-summary { order:0; }.payment-section { order:1; } }
        @media(prefers-reduced-motion:reduce) { .pay-button { transition:none; } }
      `}</style>
    </main>
  );
}
