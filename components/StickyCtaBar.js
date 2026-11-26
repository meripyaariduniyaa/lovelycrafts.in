'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';

const MotionLink = motion.create(Link);

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
      // NEVER show on mobile screens (< 768px) where bottom tab bar resides
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setShow(false);
        return;
      }
      setShow(window.scrollY > 400 && !footerVisible);
    };

    // Initial check
    handleScroll();

    // Hide bar when footer comes into view
    const footer = document.getElementById('site-footer');
    let observer = null;
    if (footer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          footerVisible = entry.isIntersecting;
          handleScroll();
        },
        { threshold: 0.01 }
      );
      observer.observe(footer);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sticky-cta-bar"
          initial={{ y: 50, opacity: 0, scale: 0.95, x: '-50%' }}
          animate={{ y: 0, opacity: 1, scale: 1, x: '-50%' }}
          exit={{ y: 50, opacity: 0, scale: 0.95, x: '-50%' }}
          transition={springs.smooth}
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            zIndex: 900,
            width: 'calc(100% - 2rem)',
            maxWidth: '540px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(92, 72, 52, 0.12)',
              borderRadius: '999px',
              padding: '0.5rem 0.65rem 0.5rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxShadow: '0 8px 24px rgba(47, 34, 21, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '1rem', color: 'var(--accent-primary, #a83d46)' }}>✦</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark, #292521)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Craft an Interactive Surprise
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted, #635d56)', fontWeight: 500 }}>
                  Ready in 2 mins · Instant WhatsApp share
                </p>
              </div>
            </div>

            <MotionLink
              href="/templates"
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                borderRadius: '8px',
                background: 'var(--accent-primary, #a83d46)',
                boxShadow: '0 2px 8px rgba(168, 61, 70, 0.16)',
                textDecoration: 'none',
              }}
            >
              Start now →
            </MotionLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
