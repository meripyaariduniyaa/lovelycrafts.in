'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FALLBACK_CREATORS = [
  {
    id: 'sample-1',
    name: 'Ananya Sharma',
    slug: 'ananya',
    bio: 'Couple & relationship surprises enthusiast ✨ Sharing sweet memories & love letters.',
    tier: 'elite',
    discount: '10% OFF',
    code: 'ANANYA10',
    avatar: '👩‍🦰',
    profile_image: null,
    niche: 'Couple & Romance',
    featured: true,
  },
  {
    id: 'sample-2',
    name: 'Rohan Mehta',
    slug: 'rohan',
    bio: 'Tech & aesthetic digital experiences. Making long distance birthdays special 🎉',
    tier: 'partner',
    discount: '10% OFF',
    code: 'ROHAN10',
    avatar: '👨‍💻',
    profile_image: null,
    niche: 'Lifestyle & Birthday',
    featured: true,
  },
  {
    id: 'sample-3',
    name: 'Priya & Kabir',
    slug: 'priyakabir',
    bio: 'Documenting our journey across India ✈️ Big fans of the dodging NO proposal box!',
    tier: 'elite',
    discount: '10% OFF',
    code: 'PRIYA10',
    avatar: '👩‍❤️‍👨',
    profile_image: null,
    niche: 'Travel & Proposals',
    featured: true,
  },
];

export default function FeaturedCreatorsSection() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/creators/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.creators && data.creators.length > 0) {
          setCreators(data.creators);
        } else {
          setCreators(FALLBACK_CREATORS);
        }
      })
      .catch(() => {
        setCreators(FALLBACK_CREATORS);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayList = creators.length > 0 ? creators.slice(0, 4) : FALLBACK_CREATORS;

  return (
    <section className="featured-creators-section" style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fffbfb 100%)',
      borderRadius: 'clamp(20px, 4vw, 32px)',
      padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2.5rem)',
      border: '1px solid #fecdd3',
      boxShadow: '0 12px 36px rgba(190, 24, 93, 0.04)',
    }}>
      <div className="text-center" style={{ marginBottom: '2.25rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          color: '#be185d',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
        }}>
          <span>⭐ VERIFIED CREATORS</span>
          <span>•</span>
          <span>Exclusive Audience Discounts</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: 800, color: '#1c1917', margin: '0 0 0.4rem' }}>
          Loved &amp; Recommended by Top Creators
        </h2>
        <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
          Discover their favorite interactive surprise templates and unlock exclusive creator discounts for your gift!
        </p>
      </div>

      {/* Creators Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {displayList.map((creator) => {
          const initials = (creator.name || 'Creator')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
          const discountText = creator.discount || '10% OFF';
          const codeText = creator.code || `${(creator.slug || creator.name || 'CREATOR').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8)}10`;

          return (
            <div
              key={creator.id || creator.slug}
              style={{
                background: '#ffffff',
                border: '1px solid #fecdd3',
                borderRadius: '24px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(244,63,94,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#ffe4e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#be123c',
                    overflow: 'hidden',
                    border: '2px solid #fda4af',
                    flexShrink: 0,
                  }}>
                    {creator.profile_image ? (
                      <img src={creator.profile_image} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      creator.avatar || initials
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                        {creator.name}
                      </h3>
                      <span title="Verified Creator" style={{ color: '#059669', fontSize: '0.9rem' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 700, textTransform: 'capitalize' }}>
                      {creator.tier || 'Verified'} Creator
                    </span>
                  </div>
                </div>

                <p style={{
                  color: '#4b5563',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  margin: '0 0 1.25rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {creator.bio || 'Recommending the best interactive love & birthday surprises on LovelyCrafts.'}
                </p>

                {/* Creator Discount Strip */}
                <div style={{
                  background: '#fff1f2',
                  border: '1px dashed #fb7185',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase' }}>
                      Creator Discount Code
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#be123c', fontFamily: 'monospace' }}>
                      {codeText}
                    </div>
                  </div>
                  <span style={{
                    background: '#e11d48',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}>
                    {discountText}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <Link
                  href={`/creators/${creator.slug || creator.id}`}
                  className="btn-secondary"
                  style={{
                    padding: '0.65rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    borderRadius: '10px',
                  }}
                >
                  View Page ➔
                </Link>
                <Link
                  href={`/c/${creator.slug || creator.id}`}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  }}
                >
                  Use Code ✨
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creator Club Banner Callout */}
      <div style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #fecdd3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2.2rem' }}>🚀</div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
              Are you a content creator, influencer, or storyteller?
            </h4>
            <p style={{ fontSize: '0.86rem', color: '#4b5563', margin: 0 }}>
              Join the <strong>LovelyCrafts Creator Club</strong>. Give your audience 10% off and earn up to <strong>18% commission</strong>.
            </p>
          </div>
        </div>

        <Link
          href="/creators"
          className="btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            borderRadius: '12px',
            background: '#f8f3eb',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          Join Creator Club ➔
        </Link>
      </div>
    </section>
  );
}
