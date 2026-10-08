'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GoogleAd from '@/components/GoogleAd';
import LovelyCraftsLogo from '@/components/Logo';

export default function Footer() {
  const pathname = usePathname();

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
    <footer className="site-footer" id="site-footer">
      <div className="footer-container">

        {/* Top Mini Promo Ribbon */}
        <div className="footer-promo-card">
          <div className="footer-promo-left">
            <span className="footer-promo-badge">🎁 CRAFT A SURPRISE</span>
            <h3 className="footer-promo-title">Send an unforgettable interactive surprise today</h3>
            <p className="footer-promo-desc">Personalize with photos, secret messages &amp; music in just 2 minutes.</p>
          </div>
          <Link href="/templates" className="btn-primary footer-promo-btn">
            ✨ Craft a Surprise →
          </Link>
        </div>

        {/* Main Footer Grid */}
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-col-brand">
            <div style={{ marginBottom: '14px' }}>
              <LovelyCraftsLogo size={40} textColor="#0f172a" accentColor="#e11d48" />
            </div>
            <p className="footer-tagline">
              Turning the feelings that are hard to say into private, interactive digital surprises they can open anywhere on WhatsApp.
            </p>

            <div className="footer-trust-chips">
              <span className="footer-trust-chip">⚡ Instant 2-Min Link</span>
              <span className="footer-trust-chip">🔒 100% Private</span>
              <span className="footer-trust-chip">🎵 Custom Music</span>
            </div>

            <div className="footer-social-wrapper">
              <span className="footer-social-label">Connect with us:</span>
              <div className="footer-socials">
                <a href="https://www.instagram.com/lovely.crafts.in/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://x.com/lovelycraftsin" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="footer-social-link" title="X (Twitter)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="mailto:meri.pyaari.duniyaa@gmail.com" aria-label="Email Us" className="footer-social-link" title="Email Us">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Best Sellers */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Experiences</h4>
            <ul className="footer-list">
              <li><Link href="/templates/birthday">🎂 Virtual Birthday Bash</Link></li>
              <li><Link href="/templates/proposal">💍 The Perfect Proposal</Link></li>
              <li><Link href="/templates/anniversary">🥂 Romantic Anniversary</Link></li>
              <li><Link href="/templates/emotional-apology">🥺 I&apos;m Sorry</Link></li>
              <li><Link href="/arcade">🎮 Couple Mini Arcade</Link></li>
            </ul>
          </div>

          {/* Column 2: Send a Feeling */}
          <div className="footer-col">
            <h4 className="footer-heading">By Feeling</h4>
            <ul className="footer-list">
              <li><Link href="/templates/emotional-apology">🥺 Heartfelt Apology</Link></li>
              <li><Link href="/templates/proposal">💕 Love &amp; Romance</Link></li>
              <li><Link href="/templates/birthday">🎂 Celebration &amp; Joy</Link></li>
              <li><Link href="/templates/anniversary">🥂 Forever Together</Link></li>
            </ul>
          </div>

          {/* Column 3: Explore & Tools */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              <li><Link href="/blog">📝 Blog &amp; Gift Guides</Link></li>
              <li><Link href="/templates">All Gift Templates</Link></li>
              <li><Link href="/arcade/heart-rush">⚡ Heart Rush Game</Link></li>
              <li><Link href="/arcade/memory-match">🃏 Memory Match Duel</Link></li>
              <li><Link href="/profile">My Sent Surprises</Link></li>
            </ul>
          </div>

          {/* Column 4: Trust & Legal */}
          <div className="footer-col">
            <h4 className="footer-heading">Company &amp; Support</h4>
            <ul className="footer-list">
              <li><Link href="/about">💡 About LovelyCrafts</Link></li>
              <li><Link href="/contact">💌 Contact &amp; Help Desk</Link></li>
              <li><Link href="/faq">❓ FAQs &amp; Help Guide</Link></li>
              <li><Link href="/creators">👑 Join Creator Club</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
              <li><Link href="/shipping">Shipping Policy</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
            </ul>
            <div className="footer-badge-payment">
              <span>🔒 256-Bit SSL Encrypted</span>
            </div>
          </div>

        </div>

        {/* Subtle Google Ad Unit (Excluded automatically on /create, /preview, /p/*) */}
        <GoogleAd slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} className="footer-ad-banner" />

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} LovelyCrafts. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with <span>❤️</span> for the people who matter most.
          </p>
          <div className="footer-bottom-links">
            <Link href="/about">About Us</Link>
            <span>•</span>
            <Link href="/contact">Contact</Link>
            <span>•</span>
            <Link href="/faq">FAQ</Link>
            <span>•</span>
            <Link href="/blog">Blog</Link>
            <span>•</span>
            <Link href="/creators">Creators</Link>
            <span>•</span>
            <Link href="/privacy">Privacy</Link>
            <span>•</span>
            <Link href="/terms">Terms</Link>
            <span>•</span>
            <Link href="/refund">Refunds</Link>
            <span>•</span>
            <Link href="/shipping">Shipping</Link>
            <span>•</span>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
