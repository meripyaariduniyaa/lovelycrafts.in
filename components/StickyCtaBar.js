'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyCtaBar() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname?.startsWith('/p/') ||
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/drive') ||
      pathname?.startsWith('/del') ||
      pathname?.startsWith('/creator/') ||
      pathname === '/creator' ||
      pathname === '/create' ||
      pathname?.startsWith('/create/') ||
      pathname === '/preview' ||
      pathname === '/checkout' ||
      pathname?.startsWith('/arcade/')
    ) {
      setShow(false);
      return;
    }

    let footerVisible = false;

    const handleScroll = () => {
      setShow(window.scrollY > 400 && !footerVisible);
    };

    // Hide bar when footer comes into view
    const footer = document.getElementById('site-footer');
    let observer = null;
    if (footer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          footerVisible = entry.isIntersecting;
          setShow(window.scrollY > 400 && !footerVisible);
        },
        { threshold: 0.01 }
      );
      observer.observe(footer);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        width: 'calc(100% - 2rem)',
        maxWidth: '540px',
        animation: 'sorryStepFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid #fecdd3',
          borderRadius: '999px',
          padding: '0.5rem 0.65rem 0.5rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 12px 36px rgba(190, 24, 93, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '1.25rem' }}>🎁</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Craft an Interactive Surprise
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#be185d', fontWeight: 700 }}>
              ⚡ Ready in 2 mins • Instant WhatsApp Share
            </p>
          </div>
        </div>

        <Link
          href="/templates"
          className="btn-primary"
          style={{
            padding: '0.5rem 1.1rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #f43f5e, #be185d)',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)'
          }}
        >
          Start Now ➔
        </Link>
      </div>
    </div>
  );
}
