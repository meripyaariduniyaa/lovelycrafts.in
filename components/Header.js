'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import LovelyCraftsLogo from '@/components/Logo';

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
    (pathname?.startsWith('/arcade/') && pathname !== '/arcade')
  ) {
    return null;
  }

  return (
    <>
      <nav className="topbar" id="site-header">
        <div className="topbar-inner">
          <LovelyCraftsLogo size={40} />

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">


            <Link
              href="/templates"
              className={`nav-link ${pathname === '/templates' ? 'active' : ''}`}
            >
              🎁 Gifts
            </Link>

            <Link
              href="/arcade"
              className={`nav-link ${pathname?.startsWith('/arcade') ? 'active' : ''}`}
            >
              🎮 Arcade
            </Link>

            <Link
              href="/about"
              className={`nav-link ${pathname === '/about' ? 'active' : ''}`}
            >
              💡 About
            </Link>

            <Link
              href="/faq"
              className={`nav-link ${pathname === '/faq' ? 'active' : ''}`}
            >
              ❓ FAQ
            </Link>

            <Link
              href="/blog"
              className={`nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`}
            >
              📝 Blog
            </Link>

            <Link
              href="/business"
              className={`nav-link ${pathname === '/business' ? 'active' : ''}`}
            >
              💼 For Business
            </Link>

            <Link
              href="/contact"
              className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}
            >
              💌 Contact
            </Link>

            <Link
              href="/profile"
              className={`nav-link nav-user-pill ${pathname === '/profile' ? 'active' : ''}`}
            >
              {user ? (
                <>
                  <span className="user-dot" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                </>
              )}
            </Link>

            <Link
              href="/templates"
              className="btn-primary header-create-button"
            >
              ✨ Craft a Surprise
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`burger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div onClick={() => setMobileMenuOpen(false)}>
            <LovelyCraftsLogo size={36} />
          </div>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
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
            href="/creators"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">👑</span>
            <div>
              <strong>LovelyCrafts Creator Club</strong>
              <small>Earn up to 18% commission &amp; custom coupons</small>
            </div>
          </Link>

          <Link
            href="/blog"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">📝</span>
            <div>
              <strong>Blog &amp; Guides</strong>
              <small>Surprise ideas, relationship stories &amp; tips</small>
            </div>
          </Link>

          <Link
            href="/about"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">💡</span>
            <div>
              <strong>About Us</strong>
              <small>Our story, mission &amp; digital gift platform</small>
            </div>
          </Link>

          <Link
            href="/faq"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">❓</span>
            <div>
              <strong>Frequently Asked Questions</strong>
              <small>Help desk, photo privacy &amp; link guide</small>
            </div>
          </Link>

          <Link
            href="/contact"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">💌</span>
            <div>
              <strong>Contact &amp; Support Desk</strong>
              <small>Send a message or reach support team</small>
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
          <Link
            href="/templates"
            className="btn-primary mobile-cta-button"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✨ Craft a Surprise Now
          </Link>
          <p className="mobile-drawer-subtext">Made for the people who matter most ❤️</p>
        </div>
      </div>
    </>
  );
}
