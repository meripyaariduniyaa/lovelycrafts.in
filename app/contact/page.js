import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL, INSTAGRAM_URL, X_URL } from '@/lib/seo';

export const metadata = {
  title: 'Contact Us — Customer Support & Help Desk | LovelyCrafts',
  description:
    'Need help with your digital surprise, payment, or custom link? Contact the LovelyCrafts support team via email or form. Fast 24-hour response time.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact LovelyCrafts — Help & Support Desk',
    description: 'Get in touch with LovelyCrafts customer support for queries regarding digital gifts, Creator Club, or payment assistance.',
    url: `${SITE_URL}/contact`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Contact Support | LovelyCrafts',
    description: 'Contact LovelyCrafts support desk for assistance with your digital surprises.',
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact LovelyCrafts',
    url: `${SITE_URL}/contact`,
    description: 'Contact LovelyCrafts customer support team for inquiries, order assistance, or creator club partnerships.',
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      email: CONTACT_EMAIL,
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
    },
  };

  return (
    <main className="shell lc-page-shell" style={{ padding: '2.5rem 1rem 5rem', background: '#fafaf9', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '1.75rem', fontSize: '0.88rem', color: '#64748b' }}>
          <Link href="/" style={{ color: '#be185d', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          {' / '}
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Contact Us</span>
        </nav>

        {/* Hero Section */}
        <section
          className="hero-section hero-enhanced text-center mb-10"
          style={{
            borderRadius: 'clamp(20px, 4vw, 28px)',
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.25rem)',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">💌</span>
          <span className="hero-floating-decor d2" aria-hidden="true">✨</span>
          <span className="hero-floating-decor d3" aria-hidden="true">💬</span>
          <span className="hero-floating-decor d4" aria-hidden="true">⚡</span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '0.32rem 0.95rem',
              borderRadius: '99px',
              fontSize: 'clamp(0.72rem, 1.6vw, 0.78rem)',
              color: '#be185d',
              fontWeight: 800,
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(244,63,94,0.08)',
            }}
          >
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>💌 CUSTOMER SUPPORT DESK &bull; 24H SLA</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15, fontWeight: 900, color: '#0f172a', margin: '0 auto 1rem', letterSpacing: '-0.03em' }}>
            We&apos;re Here to Help <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>Make It Special</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.12rem)', color: '#475569', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Have a question about personalizing an experience, link recovery, or custom features? Send us a note and our team will get back to you promptly.
          </p>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '1rem' }}>
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>Average response: &lt; 2 hours</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🔒</span>
              <span>Direct personal attention</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>💬</span>
              <span>Available 7 days a week</span>
            </span>
          </div>
        </section>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Direct Channels Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.25rem 2rem',
              border: '1.5px solid rgba(244,63,94,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                💬 Direct Support Channels
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#ffe4e6', color: '#a64036', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    ✉️
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Email Support Desk</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 4px' }}>For order status, link recovery, and general queries:</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#be185d', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none' }}>
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    ⚡
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Fast Response SLA</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      We reply to all inquiries Monday through Sunday within <strong>2 to 24 hours</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    🌐
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Social Media DMs</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px' }}>Follow us or reach out on social media:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ background: '#fdf2f8', color: '#a64036', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', border: '1px solid #fecdd3' }}>
                        Instagram ↗
                      </a>
                      <a href={X_URL} target="_blank" rel="noopener noreferrer" style={{ background: '#f8fafc', color: '#43332b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                        X (Twitter) ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.15rem', background: '#fff5f8', borderRadius: '14px', border: '1px solid #fecdd3', fontSize: '0.86rem', color: '#43332b', lineHeight: 1.5 }}>
              💡 Looking for instant answers regarding link privacy or delivery? Check our <Link href="/faq" style={{ color: '#be185d', fontWeight: 800, textDecoration: 'underline' }}>FAQ Help Center</Link>.
            </div>
          </div>

          {/* Contact Form Box */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.25rem 2rem',
              border: '1.5px solid rgba(244,63,94,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              📩 Send Us a Message
            </h2>

            <form action={`mailto:${CONTACT_EMAIL}`} method="post" encType="text/plain" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Topic
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option>Order Status / Link Recovery</option>
                  <option>Creator Club Inquiry</option>
                  <option>Feature Suggestion</option>
                  <option>Payment Query</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us how we can help you..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  boxShadow: '0 4px 15px rgba(244,63,94,0.3)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                ✉️ Send Message to Support
              </button>
            </form>
          </div>

        </div>

        {/* Bottom CTA Banner */}
        <div
          className="bottom-cta-section-enhanced"
          style={{
            marginTop: '3.5rem',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 16px 36px rgba(244,63,94,0.12)',
          }}
        >
          <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.5rem' }}>🎁 💖 🚀</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#881337', marginBottom: '0.5rem' }}>
            Ready to Surprise Someone Special?
          </h2>
          <p style={{ color: '#9f1239', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Explore our curated catalog of interactive digital surprises and share joy on WhatsApp in under 3 minutes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/templates"
              className="btn-primary"
              style={{
                padding: '0.85rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                boxShadow: '0 8px 24px rgba(244,63,94,0.35)',
              }}
            >
              ✨ Browse Interactive Templates
            </Link>
            <Link
              href="/arcade"
              className="btn-secondary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '999px',
                background: '#ffffff',
              }}
            >
              🎮 Try Couple Arcade
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
