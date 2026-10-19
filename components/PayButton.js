'use client';

import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';

export default function PayButton({
  apologyId,
  onPaid,
  displayAmount = 199,
  baseAmount = 499,
  autoOfferRetention = true,
  recipientName,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Resolved order from Razorpay order creation endpoint
  const [resolvedOrder, setResolvedOrder] = useState(null);

  // Organic customer 10% retention coupon state
  const [retentionCoupon, setRetentionCoupon] = useState(null);
  const [retentionSeconds, setRetentionSeconds] = useState(0);
  const [retentionDismissed, setRetentionDismissed] = useState(false);
  const [creatorReferral, setCreatorReferral] = useState(null);
  const timerRef = useRef(null);

  const [customerPhone, setCustomerPhone] = useState('9717113764');
  const [customerEmail, setCustomerEmail] = useState('chandan@workcosmo.in');

  // Load saved customer phone / email silently from localStorage for Razorpay prefill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('lc_customer_phone');
      const savedEmail = localStorage.getItem('lc_customer_email');
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedEmail) setCustomerEmail(savedEmail);
    }
  }, []);

  const basePrice = Number(displayAmount) || 199;
  const originalStrikethrough = Number(baseAmount) || 499;

  // Active payable price
  const currentPrice = resolvedOrder
    ? (resolvedOrder.free ? 0 : Math.round(resolvedOrder.amount / 100))
    : basePrice;

  // Active discount percentage
  const discountPercent = originalStrikethrough > currentPrice
    ? Math.round(((originalStrikethrough - currentPrice) / originalStrikethrough) * 100)
    : 60;

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
          body: JSON.stringify({ noteId: apologyId, action: 'get_or_create' }),
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

        // Auto-apply previously saved coupon
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
          fetch('/api/coupons/organic-retention', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId: apologyId, code: retentionCoupon.code, action: 'disable' }),
          }).catch(() => {});
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
    setResolvedOrder(null);
    setCouponCode('');
    if (retentionCoupon?.code) {
      try {
        await fetch('/api/coupons/organic-retention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId: apologyId, code: retentionCoupon.code, action: 'disable' }),
        });
      } catch {}
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
        body: JSON.stringify({ apologyId, couponCode: code }),
      });
      const order = await res.json();

      if (!res.ok || order.invalidCoupon) {
        setError(order.error || 'Could not validate coupon.');
        return;
      }

      setCouponCode(code);
      setResolvedOrder(order);

      if (order.free) {
        setFeedback(order.message || '🎉 100% OFF! Experience unlocked for free.');
      } else {
        const discounted = Math.round(order.amount / 100);
        const saved = basePrice - discounted;
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

  /* ── Remove applied coupon ── */
  function removeCoupon() {
    setCouponCode('');
    setResolvedOrder(null);
    setFeedback('');
    setError('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lc_saved_coupon');
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
            amount: 0,
          }),
        });
        if (!verify.ok) {
          const d = await verify.json().catch(() => ({}));
          throw new Error(d.error || 'Verification failed.');
        }
        onPaid();
        return;
      }

      const cleanPhone = (customerPhone || '').replace(/\D/g, '');
      const validPhone = cleanPhone.length === 10 ? cleanPhone : '9717113764';
      const cleanEmail = ((customerEmail || '').trim()) || 'chandan@workcosmo.in';

      const prefill = {
        name: recipientName ? `${recipientName}` : 'Customer',
        contact: validPhone,
        email: cleanEmail,
      };

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Lovely Crafts',
        description: recipientName ? `Private Gift for ${recipientName}` : 'Private Gift Experience',
        order_id: order.orderId,
        prefill,
        theme: {
          color: '#f43f5e',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI Apps (Instant)',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent', 'collect', 'qr'],
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
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
              ...response,
            }),
          });
          if (!verify.ok) {
            const d = await verify.json().catch(() => ({}));
            throw new Error(d.error || 'Payment verification failed.');
          }
          onPaid();
        },
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
        body: JSON.stringify({ apologyId, couponCode: '' }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Could not start payment.');

      const cleanPhone = (customerPhone || '').replace(/\D/g, '');
      const validPhone = cleanPhone.length === 10 ? cleanPhone : '9717113764';
      const cleanEmail = ((customerEmail || '').trim()) || 'chandan@workcosmo.in';

      const prefill = {
        name: recipientName ? `${recipientName}` : 'Customer',
        contact: validPhone,
        email: cleanEmail,
      };

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Lovely Crafts',
        description: recipientName ? `Private Gift for ${recipientName}` : 'Private Gift Experience',
        order_id: order.orderId,
        prefill,
        theme: {
          color: '#f43f5e',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI Apps (Instant)',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent', 'collect', 'qr'],
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response) => {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apologyId,
              couponCode: '',
              discountPercent: 0,
              amountPaid: order.amount,
              ...response,
            }),
          });
          if (!verify.ok) {
            const d = await verify.json().catch(() => ({}));
            throw new Error(d.error || 'Payment verification failed.');
          }
          onPaid();
        },
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

  const handleCheckoutClick = () => {
    if (resolvedOrder) {
      proceedToPay();
    } else {
      directPay();
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Determine Ribbon Content based on active discounts (strictly no '50 cashback')
  const ribbonText = (() => {
    if (retentionCoupon && retentionSeconds > 0 && !retentionDismissed) {
      return `🎁 Special 10% Instant Discount Applied! • ⏱️ ${formatTimer(retentionSeconds)}`;
    }
    if (resolvedOrder && resolvedOrder.discountPercent) {
      return `🎉 Instant ${resolvedOrder.discountPercent}% Discount Applied with code ${couponCode.toUpperCase()}!`;
    }
    if (creatorReferral) {
      return `🎁 Partner Discount Active with ${creatorReferral.code}!`;
    }
    return `🎁 Special Discount Available • Limited Time Offer`;
  })();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* ── COMPACT BOTTOM BAR (Docked in single view) ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flexShrink: 0,
          zIndex: 60,
          background: '#090814',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Top Highlight Ribbon */}
        <div
          style={{
            background: 'linear-gradient(90deg, #00d293 0%, #00b884 100%)',
            color: '#022c22',
            padding: '4px 12px',
            textAlign: 'center',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>{ribbonText}</span>
          {retentionCoupon && retentionSeconds > 0 && !retentionDismissed && (
            <button
              type="button"
              onClick={handleDismissRetention}
              title="Remove discount"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#064e3b',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '0.8rem',
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Container */}
        <div
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            padding: '6px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Price & Coupon Row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Special Price</span>
                <span>🎉</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                  ₹{originalStrikethrough}
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  ₹{currentPrice}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: '#022c22',
                    background: '#00e5a3',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {discountPercent}% OFF
                </span>
              </div>
            </div>

            {/* Coupon button */}
            <button
              type="button"
              onClick={() => setShowCouponModal(true)}
              style={{
                background: couponCode ? 'rgba(0, 229, 163, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                border: couponCode ? '1px solid #00e5a3' : '1px solid rgba(255, 255, 255, 0.18)',
                color: couponCode ? '#00e5a3' : '#f43f5e',
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '5px 11px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🎟️</span>
              <span>{couponCode ? `${couponCode.toUpperCase()}` : 'Have a coupon?'}</span>
            </button>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleCheckoutClick}
            disabled={busy}
            style={{
              width: '100%',
              padding: '11px 18px',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #e75c8d 0%, #db2777 50%, #f43f5e 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.45)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              opacity: busy ? 0.75 : 1,
            }}
          >
            {busy ? (
              <span>Connecting…</span>
            ) : resolvedOrder?.free ? (
              <span>🎉 Unlock for Free Now</span>
            ) : (
              <span>Get this at ₹{currentPrice}</span>
            )}
          </button>

          {/* Trust Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            <span>✓ Secure payment via Razorpay</span>
            <span>•</span>
            <span>⚡ Instant delivery after payment</span>
          </div>

          {/* Error Message */}
          {error && (
            <p style={{ color: '#fb7185', margin: '2px 0 0', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>
              ⚠️ {error}
            </p>
          )}
        </div>
      </div>

      {/* ── ELEGANT COUPON MODAL / DRAWER (Reliable open & close) ── */}
      {showCouponModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCouponModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#131124',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '22px 20px',
              color: '#ffffff',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎟️</span>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Apply Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Currently Applied Code */}
            {couponCode && (
              <div
                style={{
                  background: 'rgba(0, 229, 163, 0.12)',
                  border: '1px solid #00e5a3',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Coupon
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#00e5a3', fontFamily: 'monospace' }}>
                    {couponCode.toUpperCase()}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fca5a5',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Input & Apply Row */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '4px 6px 4px 12px',
                marginBottom: '10px',
              }}
            >
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setError('');
                  setFeedback('');
                }}
                placeholder="Enter promo code"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
              />
              <button
                type="button"
                onClick={() => applyCoupon()}
                disabled={busy || !couponCode.trim()}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: busy || !couponCode.trim() ? 'not-allowed' : 'pointer',
                  opacity: busy || !couponCode.trim() ? 0.6 : 1,
                }}
              >
                {busy ? '…' : 'Apply'}
              </button>
            </div>

            {/* Feedback / Error */}
            {feedback && (
              <p style={{ color: '#00e5a3', fontSize: '0.8rem', margin: '4px 0 8px', fontWeight: 700 }}>
                {feedback}
              </p>
            )}
            {error && (
              <p style={{ color: '#fb7185', fontSize: '0.8rem', margin: '4px 0 8px', fontWeight: 700 }}>
                ⚠️ {error}
              </p>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowCouponModal(false)}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
