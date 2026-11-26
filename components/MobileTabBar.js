'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '@/lib/haptics';

/**
 * Routes where the tab bar is hidden to give full immersive canvas.
 * Matches exact path or any sub-route.
 */
const IMMERSIVE_ROUTES = [
  '/create',
  '/preview',
  '/checkout',
  '/success',
  '/invoice',
  '/wedding-invitations/editor',
  '/wedding-invitations/preview',
  '/wedding-invitations/checkout',
  '/w/',
  '/p/',
];

/** Primary tab entries */
const TABS = [
  {
    href: '/',
    label: 'Home',
    isActive: (p) => p === '/',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v11h14V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/templates',
    label: 'Gifts',
    isActive: (p) => p === '/templates' || p?.startsWith('/templates'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 8c0 0-2-5 2-5s2 5 2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8c0 0 2-5-2-5s-2 5-2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'My Surprises',
    isActive: (p) => p === '/profile' || p?.startsWith('/profile'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: '/tools',
    label: 'Tools',
    isActive: (p) => p?.startsWith('/tools'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: null,
    label: 'More',
    isActive: () => false,
    isMore: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function MobileTabBar({ onMoreClick }) {
  const pathname = usePathname() || '/';
  const barRef = useRef(null);

  // Hide on immersive routes
  const isImmersive = IMMERSIVE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r),
  );

  if (isImmersive) return null;

  return (
    <nav
      ref={barRef}
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        width: 'calc(100% - 24px)',
        maxWidth: '480px',
        // Glass pill
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        borderRadius: '999px',
        border: '0.5px solid rgba(92, 72, 52, 0.14)',
        boxShadow: '0 8px 32px rgba(47, 34, 21, 0.14), 0 2px 8px rgba(47, 34, 21, 0.06)',
        alignItems: 'center',
        padding: '6px 4px',
        gap: 0,
      }}
      // Only show on mobile — handled in SiteChrome with CSS class
      className="mobile-tab-bar"
    >
      {TABS.map((tab) => {
        const active = tab.isActive(pathname);

        if (tab.isMore) {
          return (
            <button
              key="more"
              type="button"
              aria-label="More navigation options"
              onClick={() => {
                triggerHaptic('selection');
                onMoreClick?.();
              }}
              className="mobile-tab-item"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '6px 2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a0948a',
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'var(--font-bold)',
                position: 'relative',
                minHeight: '44px',
                borderRadius: '999px',
                touchAction: 'manipulation',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => triggerHaptic('selection')}
            className="mobile-tab-item"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 2px',
              color: active ? '#a83d46' : '#a0948a',
              fontSize: '10px',
              fontWeight: active ? 700 : 600,
              fontFamily: 'var(--font-bold)',
              textDecoration: 'none',
              position: 'relative',
              minHeight: '44px',
              borderRadius: '999px',
              touchAction: 'manipulation',
              transition: 'color 180ms var(--ease-out)',
            }}
          >
            {/* Spring active pill background */}
            <AnimatePresence>
              {active && (
                <motion.span
                  layoutId="tabActivePill"
                  key="active-pill"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    background: 'rgba(168, 61, 70, 0.08)',
                    zIndex: 0,
                  }}
                />
              )}
            </AnimatePresence>
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.icon}</span>
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
