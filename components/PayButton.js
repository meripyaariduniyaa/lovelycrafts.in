'use client';

import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';

export default function PayButton({ apologyId, onPaid, displayAmount, autoOfferRetention = true, recipientName }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [feedback, setFeedback] = useState('');

  // After coupon is applied, we store the resolved order details here
  const [resolvedOrder, setResolvedOrder] = useState(null);

  // Organic customer 10% retention coupon state
  const [retentionCoupon, setRetentionCoupon] = useState(null);
  const [retentionSeconds, setRetentionSeconds] = useState(0);
  const [retentionDismissed, setRetentionDismissed] = useState(false);
  const [creatorReferral, setCreatorReferral] = useState(null);
  const timerRef = useRef(null);

  const basePrice = displayAmount || 199;

  /* ── Check & Fetch Organic Retention 10% Discount OR Auto-Apply Creator Referral ── */
  useEffect(() => {
    if (!apologyId) return;

    let mounted = true;
    async function checkRetentionOrReferral() {
      let localCode = null;
      if (typeof window !== 'undefined') {
        const urlParam = new URLSearchParams(window.location.search).get('coupon');
        const savedCode = localStorage.getItem('lc_saved_coupon');
        localCode = (urlParam || savedCode || '').trim();
      }

      try {
        const res = await fetch('/api/coupons/organic-retention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId: apologyId, action: 'get_or_create' })
        });
        const data = await res.json();
        if (!mounted) return;

        // Auto-apply creator referral coupon if user arrived via creator referral
        if (data.hasReferral && data.referralCoupon?.code) {
          setCreatorReferral(data.referralCoupon);
          if (typeof window !== 'undefined') {
            localStorage.setItem('lc_saved_coupon', data.referralCoupon.code);
          }
          applyCoupon(data.referralCoupon.code);
          return;
        }

        // Auto-apply previously saved coupon (e.g. from /create?coupon= or storefront)
        if (localCode) {
          applyCoupon(localCode);
          return;
        }

        // Otherwise offer standard organic retention discount if eligible & auto-apply
        if (autoOfferRetention && data.ok && data.eligible && data.coupon) {
          setRetentionCoupon(data.coupon);
          setRetentionSeconds(data.coupon.remaining_seconds || 900);
          applyCoupon(data.coupon.code);
        }
      } catch (err) {
        console.error('Failed to load retention/referral offer:', err);
        if (localCode && mounted) {
          applyCoupon(localCode);
        }
      }
    }

    checkRetentionOrReferral();
    return () => { mounted = false; };
  }, [apologyId, autoOfferRetention]);

  /* ── Countdown Timer for Retention Offer ── */
  useEffect(() => {
    if (!retentionCoupon || retentionSeconds <= 0 || retentionDismissed) return;

    timerRef.current = setInterval(() => {
      setRetentionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Disable coupon on backend once expired
          fetch('/api/coupons/organic-retention', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId: apologyId, code: retentionCoupon.code, action: 'disable' })
          }).catch(() => { });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [retentionCoupon, retentionSeconds, retentionDismissed, apologyId]);

  /* ── Dismiss retention offer & disable single-use code ── */
  const handleDismissRetention = async () => {
    setRetentionDismissed(true);
    if (retentionCoupon?.code) {
      try {
        await fetch('/api/coupons/organic-retention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId: apologyId, code: retentionCoupon.code, action: 'disable' })
        });
      } catch { }
    }
  };

  /* ── Step 1: Validate coupon & preview final price ── */
  async function applyCoupon(codeOverride) {
    const code = (typeof codeOverride === 'string' ? codeOverride : couponCode).trim();
    if (!code) return;
    setBusy(true);
    setError('');
    setFeedback('');
    setResolvedOrder(null);

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apologyId, couponCode: code })
      });
      const order = await res.json();

      if (!res.ok || order.invalidCoupon) {
        setError(order.error || 'Could not validate coupon.');
        return;
      }

      // Update coupon code input if override was used
      if (typeof codeOverride === 'string') {
        setCouponCode(codeOverride);
      }

      // Store the full order so Step 2 can use it
      setResolvedOrder(order);

      if (order.free) {
        setFeedback(order.message || `🎉 100% off! Your note is unlocked for free.`);
      } else {
        const discounted = (order.amount / 100).toFixed(0);
        const saved = (basePrice - discounted).toFixed(0);
        setFeedback(
          order.message ||
          (order.discountPercent
            ? `✅ Coupon applied! ${order.discountPercent}% off — you save ₹${saved}.`
            : '✅ Coupon applied!')
        );
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  /* ── Step 2: Proceed to payment with the resolved order ── */
  async function proceedToPay() {
    if (!resolvedOrder) return;
    setBusy(true);
    setError('');

    try {
      const order = resolvedOrder;

      // Free-coupon path
      if (order.free) {
        const verify = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apologyId,
            couponCode: couponCode.trim(),
            couponId: order.couponId || null,
            creatorId: order.creatorId || null,
            attributionSource: order.attributionSource || null,
            free: true,
            amount: 0
          })
        });
        if (!verify.ok) {
          const d = await verify.json().catch(() => ({}));
          throw new Error(d.error || 'Verification failed.');
        }
        onPaid();
        return;
      }

      // Paid path — open Razorpay
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Lovely Crafts',
        description: recipientName ? `Private Link for ${recipientName}` : 'Private Interactive Link',
        order_id: order.orderId,
        handler: async (response) => {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apologyId,
              couponCode: couponCode.trim(),
              couponId: order.couponId || null,
              creatorId: order.creatorId || null,
              attributionSource: order.attributionSource || null,
              discountPercent: order.discountPercent || 0,
              amountPaid: order.amount,
              ...response
            })
          });
          if (!verify.ok) {
            const d = await verify.json().catch(() => ({}));
            throw new Error(d.error || 'Payment verification failed.');
          }
          onPaid();
        }
      });

      razorpay.on('payment.failed', (r) =>
        setError(r.error?.description || 'Payment failed.')
      );
      razorpay.open();
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  /* ── Direct pay (no coupon entered) ── */
  async function directPay() {
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apologyId, couponCode: '' })
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Could not start payment.');

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Lovely Crafts',
        description: recipientName ? `Private Link for ${recipientName}` : 'Private Interactive Link',
        order_id: order.orderId,
        handler: async (response) => {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apologyId,
              couponCode: '',
              discountPercent: 0,
              amountPaid: order.amount,
              ...response
            })
          });
          if (!verify.ok) {
            const d = await verify.json().catch(() => ({}));
            throw new Error(d.error || 'Payment verification failed.');
          }
          onPaid();
        }
      });

      razorpay.on('payment.failed', (r) =>
        setError(r.error?.description || 'Payment failed.')
      );
      razorpay.open();
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  /* ── Determine what the "Pay Now" button should show ── */
  const payLabel = (() => {
    const target = recipientName ? `${recipientName}'s` : 'Their';
    if (!resolvedOrder) return `✨ Unlock ${target} Moment • ₹${basePrice}`;
    if (resolvedOrder.free) return '🎉 Unlock for Free Now';
    const amount = (resolvedOrder.amount / 100).toFixed(0);
    return `✨ Unlock ${target} Moment • ₹${amount}`;
  })();

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Creator Referral Active Badge */}
        {creatorReferral && (
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fff5f8 100%)',
            border: '1.5px solid #fecdd3',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(244, 63, 94, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🎁</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#be185d' }}>
                Creator Partner Discount: <strong style={{ color: '#0f172a' }}>{creatorReferral.creator_name || 'Creator'}</strong>
              </span>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#be185d',
              background: '#ffffff',
              border: '1px solid #fecdd3',
              padding: '2px 8px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}>
              {creatorReferral.code}
            </span>
          </div>
        )}

        {/* Organic Retention 10% Special Offer Banner */}
        {retentionCoupon && !retentionDismissed && retentionSeconds > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fef3c7 100%)',
            border: '1.5px solid #fecdd3',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(244, 63, 94, 0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎁</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  {resolvedOrder && couponCode === retentionCoupon.code
                    ? '🎉 Instant 10% Extra OFF Applied!'
                    : 'Special 10% Instant Discount Available!'}
                </span>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#b45309',
                background: '#ffffff',
                border: '1px solid #fde68a',
                padding: '4px 10px',
                borderRadius: '8px',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}>
                ⏱️ {formatTimer(retentionSeconds)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                Code: <strong style={{ color: '#be185d', letterSpacing: '0.06em', fontFamily: 'monospace', background: '#ffffff', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '6px' }}>{retentionCoupon.code}</strong> (Save 10% extra)
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {(!resolvedOrder || couponCode !== retentionCoupon.code) && (
                  <button
                    type="button"
                    onClick={() => applyCoupon(retentionCoupon.code)}
                    disabled={busy}
                    style={{
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)',
                    }}
                  >
                    {busy ? 'Applying…' : 'Claim 10% OFF'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDismissRetention}
                  title="Dismiss offer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupon row */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="form-input"
          value={couponCode}
          onChange={(e) => { setCouponCode(e.target.value); setResolvedOrder(null); setFeedback(''); setError(''); }}
          placeholder="Have a coupon code?"
          style={{ fontSize: '0.9rem', flex: 1, background: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', padding: '10px 14px', borderRadius: '12px' }}
          onKeyDown={(e) => e.key === 'Enter' && couponCode.trim() && applyCoupon()}
        />
        {couponCode.trim() && !resolvedOrder && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => applyCoupon()}
            disabled={busy}
            style={{ whiteSpace: 'nowrap', padding: '0 1.25rem', borderRadius: '12px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', fontWeight: 700 }}
          >
            {busy ? '…' : 'Apply'}
          </button>
        )}
      </div>

      {/* Feedback / price preview */}
      {feedback && (
        <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: 0, fontWeight: 700, textAlign: 'center' }}>{feedback}</p>
      )}

      {/* Final price summary card */}
      {resolvedOrder && !resolvedOrder.free && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.88rem',
          color: '#166534',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <del style={{ color: '#94a3b8', marginRight: '0.4rem' }}>₹{basePrice}</del>
            With {resolvedOrder.discountPercent || ''}% discount applied
          </span>
          <strong style={{ fontSize: '1.15rem', color: '#15803d' }}>₹{(resolvedOrder.amount / 100).toFixed(0)}</strong>
        </div>
      )}

      {/* Pay Now button — sleek gradient & pulse effect */}
      <button
        onClick={resolvedOrder ? proceedToPay : directPay}
        disabled={busy}
        style={{
          width: '100%',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.02rem',
          fontWeight: 800,
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.75 : 1,
          boxShadow: '0 8px 25px rgba(244,63,94,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {busy ? (
          <>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            Connecting Secure Checkout...
          </>
        ) : (
          payLabel
        )}
      </button>

      {/* Sleek UPI & Express Payment Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Instant via</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px', color: '#059669' }}>GPay</span>
          <span style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 6px', borderRadius: '4px', color: '#7c3aed' }}>PhonePe</span>
          <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 6px', borderRadius: '4px', color: '#0284c7' }}>Paytm</span>
          <span style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 6px', borderRadius: '4px', color: '#b45309' }}>UPI / Cards</span>
        </div>
      </div>

    </div >

      { error && (
        <p style={{ color: '#e11d48', marginTop: '0.75rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}>⚠️ {error}</p>
      )
}
    </>
  );
}
