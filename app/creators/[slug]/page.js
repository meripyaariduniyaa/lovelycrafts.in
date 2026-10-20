'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { templates } from '@/lib/templates';

export default function PublicCreatorPage() {
  const params = useParams();
  const slug = params?.slug;

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/creators/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Creator not found');
        return res.json();
      })
      .then((data) => {
        if (data.creator) {
          setCreator(data.creator);
          const code = data.creator.primaryCoupon?.code || data.creator.coupon_code || '';
          if (code && typeof window !== 'undefined') {
            localStorage.setItem('lc_saved_coupon', code);
          }
        } else {
          setError('Creator profile not found.');
        }
      })
      .catch((err) => setError(err.message || 'Could not load creator profile.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyCoupon = () => {
    if (!creator?.primaryCoupon?.code) return;
    navigator.clipboard.writeText(creator.primaryCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareCreatorPage = () => {
    const pageUrl = window.location.href;
    const code = creator?.primaryCoupon?.code || creator?.coupon_code || '';
    const shareText = `Hey! Check out ${creator?.name || 'this creator'}'s official LovelyCrafts storefront and use code ${code} for 10% OFF personalized digital surprises! 💕\n${pageUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${creator?.name} | LovelyCrafts Creator Storefront`,
        text: shareText,
        url: pageUrl,
      }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  if (loading) {
    return (
      <main className="lc-page-shell" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 20%, #ffe4e6 0%, #fafafa 100%)' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>💖</div>
          <p style={{ marginTop: '14px', fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Loading Creator Storefront...</p>
        </div>
      </main>
    );
  }

  if (error || !creator) {
    return (
      <main className="lc-page-shell" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '40px 28px', borderRadius: '24px', border: '1px solid #fecdd3', maxWidth: '480px', boxShadow: '0 12px 32px rgba(225,29,72,0.06)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Creator Profile Not Found</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>This creator link might be inactive or does not exist.</p>
          <Link href="/creators" style={{ background: '#e11d48', color: '#fff', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 14px rgba(166, 64, 54, 0.96)' }}>
            Explore Verified Creators 🚀
          </Link>
        </div>
      </main>
    );
  }

  const recommendedIds = creator.recommended_template_ids || [];
  const recommendedTemplates = templates.filter((t) => recommendedIds.includes(t.id)).slice(0, 4);
  const displayTemplates = recommendedTemplates.length > 0 ? recommendedTemplates : templates.slice(0, 6);
  const couponCode = creator.primaryCoupon?.code || creator.coupon_code || '';
  const discountPercent = creator.primaryCoupon?.discount_percent || creator.discount_rate || 10;

  return (
    <main className="lc-page-shell" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 25%, #fafafa 100%)', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        {/* TOP BRAND BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
            <span style={{ fontSize: '1.3rem' }}>❤️</span> Lovely<span style={{ color: '#e11d48' }}>Crafts</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={shareCreatorPage}
              style={{ background: '#fff', color: '#43332b', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
            >
              <span>📲 Share Page</span>
            </button>
            <Link href="/creators" style={{ background: '#ffe4e6', color: '#a64036', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              ⭐ All Creators
            </Link>
          </div>
        </div>

        {/* HERO CREATOR BRAND CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbfb 100%)',
            borderRadius: '28px',
            padding: '36px 24px',
            border: '1px solid #fecdd3',
            boxShadow: '0 16px 40px rgba(225,29,72,0.06)',
            textAlign: 'center',
            marginBottom: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Background Glow */}
          <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '150px', background: 'radial-gradient(circle, rgba(251,113,133,0.15) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />

          {/* AVATAR */}
          <div
            style={{
              width: '108px',
              height: '108px',
              borderRadius: '50%',
              background: '#ffe4e6',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.8rem',
              overflow: 'hidden',
              border: '3px solid #fda4af',
              boxShadow: '0 8px 24px rgba(225,29,72,0.18)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {creator.profile_image ? (
              <img src={creator.profile_image} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '💖'
            )}
          </div>

          {/* BADGES */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{ background: '#ecfdf5', color: '#43332b', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ✓ Verified Partner
            </span>
            <span style={{ background: '#fff1f2', color: '#a64036', border: '1px solid #fecdd3', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'capitalize' }}>
              {creator.tier ? `${creator.tier} Creator` : 'Official Creator'}
            </span>
          </div>

          {/* NAME & BIO */}
          <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)', fontWeight: 900, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {creator.name}
          </h1>

          {creator.bio ? (
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#4b5563', maxWidth: '620px', margin: '0 auto 20px', lineHeight: 1.6, fontStyle: 'italic' }}>
              &ldquo;{creator.bio}&rdquo;
            </p>
          ) : (
            <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              &ldquo;My favorite interactive surprises to personalize and send privately on WhatsApp ✨&rdquo;
            </p>
          )}

          {/* SOCIAL LINKS */}
          {(creator.instagram_url || creator.youtube_url) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
              {creator.instagram_url && (
                <a
                  href={creator.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '12px', background: '#fdf2f8', color: '#a64036', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid #fbcfe8', transition: 'transform 0.15s' }}
                >
                  📷 Instagram Channel ↗
                </a>
              )}
              {creator.youtube_url && (
                <a
                  href={creator.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '12px', background: '#fef2f2', color: '#a64036', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid #fecaca', transition: 'transform 0.15s' }}
                >
                  ▶️ YouTube Channel ↗
                </a>
              )}
            </div>
          )}

          {/* EXCLUSIVE DISCOUNT COUPON CARD */}
          {couponCode && (
            <div
              style={{
                maxWidth: '520px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                border: '2px dashed #fb7185',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                boxShadow: '0 8px 24px rgba(225,29,72,0.08)',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>
                  🎟️ {creator.name}&apos;s Exclusive Audience Code
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#881337', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {couponCode}
                </div>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                  ✓ Unlocks {discountPercent}% OFF Entire Order
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={copyCoupon}
                  style={{
                    background: copied ? '#059669' : '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(225,29,72,0.22)',
                  }}
                >
                  {copied ? '✓ Code Copied!' : 'Copy Code 📋'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RECOMMENDED EXPERIENCES SHOWCASE */}
        <section style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Storefront Recommendations
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, color: '#111827', margin: '2px 0 0' }}>
                ⭐ {creator.name}&apos;s Favorite Surprises
              </h2>
            </div>
            <Link href="/templates" style={{ color: '#e11d48', fontWeight: 700, textDecoration: 'none', fontSize: '0.92rem' }}>
              View All Gifts →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
            {displayTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  background: '#fff',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{template.icon || '🎁'}</div>
                    <span style={{ background: '#ffe4e6', color: '#a64036', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                      Recommended ✨
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                    {template.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {template.description}
                  </p>
                </div>

                <div>
                  {couponCode && (
                    <div style={{ marginBottom: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: '#be123c', fontWeight: 700 }}>
                        🏷️ Auto-Apply Code:
                      </span>
                      <code style={{ fontSize: '0.88rem', fontWeight: 900, color: '#43332b', background: '#ffe4e6', padding: '2px 8px', borderRadius: '6px' }}>
                        {couponCode} (-{discountPercent}%)
                      </code>
                    </div>
                  )}

                  <Link
                    href={`/create?template=${template.id}${couponCode ? `&coupon=${couponCode}` : ''}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: '#e11d48',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(225,29,72,0.22)',
                      transition: 'background 0.2s',
                    }}
                  >
                    ✨ Craft Experience with {creator.name}&apos;s Code
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST PILLARS */}
        <section style={{ background: '#fff', borderRadius: '24px', padding: '32px 24px', border: '1px solid #f3f4f6', boxShadow: '0 6px 20px rgba(0,0,0,0.02)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 18px' }}>
            Why 50,000+ Senders Love LovelyCrafts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📲</div>
              <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '2px' }}>Instant WhatsApp Delivery</strong>
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>Send private surprise links in under 2 minutes.</small>
            </div>
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🔒</div>
              <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '2px' }}>100% Private &amp; Secure</strong>
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>Only the recipient with your link can view your gift.</small>
            </div>
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>⭐</div>
              <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '2px' }}>4.9★ Rated Experiences</strong>
              <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>Heartfelt reactions, tears of joy &amp; unforgettable smiles.</small>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
