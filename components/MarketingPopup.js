'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BEST_SELLERS = [
  {
    id: 'birthday',
    title: 'Virtual Birthday Bash',
    icon: '🎂🎈',
    tag: '🔥 #1 BESTSELLER',
    desc: 'Interactive cake cutting, candles blowout & birthday music',
    color: '#f43f5e',
    href: '/templates/birthday',
  },
  {
    id: 'proposal',
    title: 'The Perfect Proposal',
    icon: '💍💖',
    tag: '👑 FOR COUPLES',
    desc: 'Dodging NO button, cute promises & romantic slideshow',
    color: '#ec4899',
    href: '/templates/proposal',
  },
  {
    id: 'emotional-apology',
    title: "I'm Sorry",
    icon: '🥺💌',
    tag: '💔 HEARTFELT APOLOGY',
    desc: 'Sincere reconciliation experience giving room to feel',
    color: '#9333ea',
    href: '/templates/emotional-apology',
  },
  {
    id: 'anniversary',
    title: 'Anniversary Special',
    icon: '🥂✨',
    tag: '💕 COUPLES CLASSIC',
    desc: 'Love meter, pinky promise, celebration candle & promises',
    color: '#d97706',
    href: '/templates/anniversary',
  },
];

export default function MarketingPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Exclude popup on preview, arcade, admin, and creator dashboard routes
    if (
      pathname?.startsWith('/p/') ||
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/drive') ||
      pathname?.startsWith('/del') ||
      pathname?.startsWith('/creator/') ||
      pathname === '/creator' ||
      pathname === '/create' ||
      pathname?.startsWith('/create/') ||
      pathname?.startsWith('/preview') ||
      pathname?.startsWith('/checkout') ||
      pathname?.startsWith('/share') ||
      pathname?.startsWith('/arcade')
    ) {
      return;
    }

    const hasSeenPopup = sessionStorage.getItem('hasSeenMarketingPopup');
    if (hasSeenPopup) return;

    // 1. Time-based trigger (3 seconds)
    const timer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsVisible(true);
        sessionStorage.setItem('hasSeenMarketingPopup', 'true');
      }
    }, 3500);

    // 2. Exit-intent trigger on desktop
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsVisible(true);
        sessionStorage.setItem('hasSeenMarketingPopup', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="marketing-popup-overlay" style={{ zIndex: 10000 }}>
      <div
        className="marketing-popup-content glass-card"
        style={{
          maxWidth: '480px',
          width: '92%',
          padding: '1.75rem 1.25rem',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -15px rgba(225, 29, 72, 0.4)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fffbfb 100%)',
          border: '1px solid rgba(254, 205, 211, 0.9)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="marketing-popup-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close"
          style={{
            top: '0.85rem',
            right: '0.85rem',
            background: '#f1f5f9',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #f43f5e, #be185d)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 4px 12px rgba(166, 64, 54, 0.96)', marginBottom: '0.5rem' }}>
            ✨ Trending Digital Surprises
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.25rem' }}>
            Make Someone Smile Today 💝
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.86rem', margin: 0, lineHeight: 1.4 }}>
            Create an interactive gift experience in 2 minutes. Share directly on WhatsApp!
          </p>
        </div>

        {/* Best Sellers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.15rem' }}>
          {BEST_SELLERS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsVisible(false)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(254, 205, 211, 0.7)',
                borderRadius: '16px',
                padding: '0.85rem 0.75rem',
                textDecoration: 'none',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(244,63,94,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(254, 205, 211, 0.7)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: item.color, display: 'block', marginBottom: '2px' }}>
                  {item.tag}
                </span>
                <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1f2937', margin: '0 0 2px', lineHeight: 1.2 }}>
                  {item.title}
                </h4>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#be185d', fontWeight: 700, marginTop: '6px' }}>
                Customize ➔
              </span>
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <Link
          href="/templates"
          className="btn-primary w-full"
          style={{
            padding: '0.85rem',
            fontSize: '0.98rem',
            fontWeight: 800,
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #f43f5e, #be185d)',
            boxShadow: '0 6px 20px rgba(244,63,94,0.3)',
            textAlign: 'center',
            display: 'block',
            textDecoration: 'none',
          }}
          onClick={() => setIsVisible(false)}
        >
          ✨ Explore All Gift Experiences →
        </Link>

        {/* Social Proof Subtext */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '0.75rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          fontWeight: 600,
        }}>
          <span>⭐ 4.9/5 Rating</span>
          <span>•</span>
          <span>🔒 100% Private Links</span>
          <span>•</span>
          <span>⚡ Live in 2 Mins</span>
        </div>
      </div>
    </div>
  );
}
