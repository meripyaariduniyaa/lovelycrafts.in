'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import { useAuth } from '@/components/AuthProvider';
import LovelyCraftsLogo from '@/components/Logo';

const MotionLink = motion.create(Link);

const NAV_ITEMS = [
  { href: '/templates', label: '🎁 Gifts', isActive: (p) => p === '/templates' },
  { href: '/tools', label: '🧰 Tools', isActive: (p) => p?.startsWith('/tools') },
  { href: '/arcade', label: '🎮 Arcade', isActive: (p) => p?.startsWith('/arcade') },
  { href: '/blog', label: '📝 Blog', isActive: (p) => p?.startsWith('/blog') },
  { href: '/business', label: '💼 For Business', isActive: (p) => p === '/business' },
  { href: '/creators', label: '❤️ Creator Club', isActive: (p) => p?.startsWith('/creators') },
];

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  if (
    pathname?.startsWith('/p/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/drive') ||
    pathname?.startsWith('/del') ||
    pathname?.startsWith('/creator/') ||
    pathname === '/creator' ||
    (pathname?.startsWith('/arcade/') && pathname !== '/arcade')
  ) {
    return null;
  }

  const isProfileActive = pathname === '/profile';

  return (
    <>
      <nav className="topbar" id="site-header">
        <div className="topbar-inner">
          <LovelyCraftsLogo size={38} />

          {/* Primary public-site navigation */}
          <div className="nav-links desktop-nav">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                  style={{ position: 'relative', background: active ? 'transparent' : undefined }}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="nav-active-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '999px',
                        backgroundColor: '#efe4d8',
                        zIndex: 0,
                      }}
                      transition={springs.gliding}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/profile"
              className={`nav-link nav-user-pill ${isProfileActive ? 'active' : ''}`}
              style={{ position: 'relative', background: isProfileActive ? 'transparent' : undefined }}
            >
              {isProfileActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="nav-active-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    backgroundColor: '#efe4d8',
                    zIndex: 0,
                  }}
                  transition={springs.gliding}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {user ? (
                  <>
                    <span className="user-dot" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </span>
            </Link>

            <MotionLink
              href="/templates"
              className="btn-primary header-create-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
            >
              ✨ Craft a Surprise
            </MotionLink>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <motion.button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            whileTap={{ scale: 0.92 }}
            transition={springs.snappy}
          >
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          </motion.button>
        </div>
      </nav>

      {/* Mobile Drawer & Backdrop wrapped in AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              className="mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ transition: 'none', animation: 'none' }}
            />

            <motion.nav
              key="mobile-navigation"
              id="mobile-navigation"
              aria-label="Mobile navigation"
              aria-hidden={!mobileMenuOpen}
              className="mobile-drawer open"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={springs.smooth}
              style={{ transition: 'none', visibility: 'visible' }}
            >
              <div className="mobile-drawer-header">
                <div onClick={() => setMobileMenuOpen(false)} style={{ cursor: 'pointer' }}>
                  <LovelyCraftsLogo size={34} />
                </div>
                <motion.button
                  type="button"
                  className="mobile-drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  whileTap={{ scale: 0.92 }}
                  transition={springs.snappy}
                >
                  ✕
                </motion.button>
              </div>

              <div className="mobile-drawer-links">
                <Link
                  href="/templates"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">🎁</span>
                  <div>
                    <strong>All Gift Experiences</strong>
                    <small>Explore all interactive templates</small>
                  </div>
                </Link>

                <Link
                  href="/tools"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">🧰</span>
                  <div>
                    <strong>Free Tools</strong>
                    <small>Love calculators, countdowns &amp; quizzes</small>
                  </div>
                </Link>

                <Link
                  href="/arcade"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">🎮</span>
                  <div>
                    <strong>Couple &amp; Bestie Arcade</strong>
                    <small>Play 30s mini-games &amp; send duels</small>
                  </div>
                </Link>

                <Link
                  href="/blog"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">📝</span>
                  <div>
                    <strong>Blog &amp; Gift Guides</strong>
                    <small>Creative surprise ideas &amp; inspiration</small>
                  </div>
                </Link>

                <Link
                  href="/business"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">💼</span>
                  <div>
                    <strong>LovelyCrafts for Business</strong>
                    <small>Automate employee birthdays &amp; milestones</small>
                  </div>
                </Link>

                <Link
                  href="/faq"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">❓</span>
                  <div>
                    <strong>Help &amp; FAQ</strong>
                    <small>Common questions, photo privacy &amp; guide</small>
                  </div>
                </Link>

                <Link
                  href="/creators"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">✦</span>
                  <div>
                    <strong>Creator Club</strong>
                    <small>Share LovelyCrafts with your audience</small>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">👤</span>
                  <div>
                    <strong>{user ? 'My Dashboard' : 'Sign In / Dashboard'}</strong>
                    <small>{user ? 'Track your created notes & reactions' : 'Save your notes & high scores'}</small>
                  </div>
                </Link>
              </div>

              <div className="mobile-drawer-footer">
                <MotionLink
                  href="/templates"
                  className="btn-primary mobile-cta-button"
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.96 }}
                  transition={springs.snappy}
                >
                  ✨ Craft a Surprise Now
                </MotionLink>
                <p className="mobile-drawer-subtext">Made for the people who matter most ❤️</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
