'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '@/lib/haptics';

const MORE_LINKS = [
  { href: '/wedding-invitations', label: 'Shaadi', icon: '✦', desc: 'Traditional digital wedding invitations' },
  { href: '/creators', label: 'Creator Club', icon: '✦', desc: 'Earn by sharing LovelyCrafts' },
  { href: '/arcade', label: 'Arcade', icon: '✦', desc: 'Couple & bestie mini-games' },
  { href: '/business', label: 'For Business', icon: '✦', desc: 'Automate team milestones' },
  { href: '/blog', label: 'Blog', icon: '✦', desc: 'Gift ideas & inspiration' },
  { href: '/faq', label: 'FAQs', icon: '✦', desc: 'Help & common questions' },
  { href: '/terms', label: 'Policies', icon: '✦', desc: 'Terms, privacy & refunds' },
  { href: '/about', label: 'About', icon: '✦', desc: 'Our story' },
  { href: '/contact', label: 'Contact', icon: '✦', desc: 'Get in touch' },
];

export default function MobileMoreSheet({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="more-sheet-backdrop"
            aria-hidden="true"
            onClick={() => { triggerHaptic('light'); onClose(); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(41, 37, 33, 0.38)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1300,
            }}
          />

          {/* Sheet panel */}
          <motion.div
            key="more-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1400,
              background: 'rgba(250, 247, 242, 0.96)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              borderRadius: '24px 24px 0 0',
              border: '0.5px solid rgba(92, 72, 52, 0.14)',
              boxShadow: '0 -8px 48px rgba(47, 34, 21, 0.14)',
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  background: 'rgba(92, 72, 52, 0.22)',
                }}
              />
            </div>

            <div style={{ padding: '8px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-bold)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>
                More
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { triggerHaptic('light'); onClose(); }}
                style={{
                  background: 'rgba(92, 72, 52, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  touchAction: 'manipulation',
                }}
              >
                ✕
              </button>
            </div>

            <nav aria-label="Secondary navigation" style={{ padding: '8px 12px 8px' }}>
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { triggerHaptic('selection'); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 8px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    color: 'var(--text-dark)',
                    touchAction: 'manipulation',
                    transition: 'background 150ms var(--ease-out)',
                    minHeight: '56px',
                  }}
                  className="more-sheet-item"
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: 'rgba(168, 61, 70, 0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-bold)', fontSize: '0.95rem' }}>{link.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{link.desc}</div>
                  </div>
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
