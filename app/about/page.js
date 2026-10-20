import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL, INSTAGRAM_URL, X_URL } from '@/lib/seo';

export const metadata = {
  title: 'About Us — Personal Digital Surprises & Experience Platform | LovelyCrafts',
  description:
    'Learn about LovelyCrafts, India’s leading interactive digital gifting and surprise link platform. Read our story, mission, privacy standards, and team values.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About LovelyCrafts — Personalized Digital Gifts & Surprises India',
    description:
      'Discover how LovelyCrafts turns heartfelt emotions, memories, and photos into private, interactive digital surprises shared instantly on WhatsApp.',
    url: `${SITE_URL}/about`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    title: 'About LovelyCrafts — Crafting Heartfelt Digital Surprises',
    description: 'Learn about LovelyCrafts, our mission, values, and how we help people express emotions digitally.',
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LovelyCrafts',
    url: `${SITE_URL}/about`,
    description:
      'LovelyCrafts is an Indian digital surprise and interactive gifting platform enabling users to send custom virtual birthday bashes, romantic proposals, apology cards, and memory scrapbooks.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      email: CONTACT_EMAIL,
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
          <span style={{ fontWeight: 700, color: '#0f172a' }}>About Us</span>
        </nav>

        {/* Hero Banner */}
        <section
          className="hero-section hero-enhanced text-center mb-10"
          style={{
            borderRadius: 'clamp(20px, 4vw, 28px)',
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.25rem)',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">❤️</span>
          <span className="hero-floating-decor d2" aria-hidden="true">✨</span>
          <span className="hero-floating-decor d3" aria-hidden="true">🇮🇳</span>
          <span className="hero-floating-decor d4" aria-hidden="true">💌</span>

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
            <span>✨ OUR STORY &bull; MISSION &bull; CRAFT</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15, fontWeight: 900, color: '#0f172a', margin: '0 auto 1rem', letterSpacing: '-0.03em' }}>
            Turning Heartfelt Feelings Into <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>Interactive Digital Surprises</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.12rem)', color: '#475569', maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            At LovelyCrafts, we believe that expressing love, celebration, or a sincere apology should feel personal, emotional, and instant—no matter the physical distance between two people.
          </p>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '1rem' }}>
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>50,000+ Surprises delivered</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🔒</span>
              <span>100% Private encrypted links</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🇮🇳</span>
              <span>Proudly built in India</span>
            </span>
          </div>
        </section>

        {/* Milestone Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1rem', textAlign: 'center', border: '1px solid #fecdd3', boxShadow: '0 4px 14px rgba(244,63,94,0.05)' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#be185d' }}>50K+</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>Happy Surprises Sent</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1rem', textAlign: 'center', border: '1px solid #fecdd3', boxShadow: '0 4px 14px rgba(244,63,94,0.05)' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#be185d' }}>&lt; 3 Min</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>Average Creation Time</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1rem', textAlign: 'center', border: '1px solid #fecdd3', boxShadow: '0 4px 14px rgba(244,63,94,0.05)' }}>
            <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#be185d' }}>4.9 ★</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>Sender Satisfaction</div>
          </div>
        </div>

        {/* Main Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Who We Are */}
          <section
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.25rem 2rem',
              border: '1.5px solid rgba(244,63,94,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💡</span> Who We Are
            </h2>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: '1rem' }}>
              LovelyCrafts is an interactive digital experience studio based in India. We design and build gamified web surprises that replace static greeting cards and boring text messages with rich, tactile, and unforgettable web journeys.
            </p>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, margin: 0 }}>
              Whether you want to send a midnight birthday surprise with interactive candle blowout, a playful confession with a dodging &ldquo;NO&rdquo; button, or a sincere apology letter that gives them the space to feel, LovelyCrafts provides the creative canvas for your memories.
            </p>
          </section>

          {/* Section 2: Why We Created LovelyCrafts */}
          <section
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.25rem 2rem',
              border: '1.5px solid rgba(244,63,94,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>❤️</span> Why We Built LovelyCrafts
            </h2>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: '1rem' }}>
              In today’s fast-paced digital world, communication is often reduced to quick emojis or forwarded images on WhatsApp. Physical greeting cards take days to arrive and end up tucked away in a drawer.
            </p>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, margin: 0 }}>
              We asked a simple question: <em>What if a digital message could feel as tactile, romantic, and thoughtful as a handcrafted scrapbook or a secret treasure box?</em> LovelyCrafts was created to bring that wonder and emotional depth into the palm of their hands.
            </p>
          </section>

          {/* Section 3: Core Principles & Trust */}
          <section
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.25rem 2rem',
              border: '1.5px solid rgba(244,63,94,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🛡️</span> Our Core Principles
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#fff5f8', padding: '1.35rem', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be185d', margin: '0 0 0.5rem' }}>🔒 100% Privacy</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Your photos, letters, and memories remain strictly private. Only someone with your unguessable secret link can unlock the experience.
                </p>
              </div>

              <div style={{ background: '#fff5f8', padding: '1.35rem', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be185d', margin: '0 0 0.5rem' }}>⚡ Instant Delivery</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  No waiting for courier shipping or broken delivery dates. Create your surprise link in 2 minutes and share it instantly on WhatsApp or SMS.
                </p>
              </div>

              <div style={{ background: '#fff5f8', padding: '1.35rem', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be185d', margin: '0 0 0.5rem' }}>🎵 Rich Multimedia</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Combine ambient audio tracks, polaroid photo memories, interactive 3D elements, and secret passcodes into one seamless mobile experience.
                </p>
              </div>

              <div style={{ background: '#fff5f8', padding: '1.35rem', borderRadius: '16px', border: '1px solid #fecdd3' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#be185d', margin: '0 0 0.5rem' }}>👑 Creator Community</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Through our Creator Club, storytellers and digital artists earn recurring commission while sharing authentic moments of joy with their community.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Contact & Office Desk */}
          <section
            style={{
              background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
              borderRadius: '24px',
              padding: '2rem',
              border: '1.5px solid #fecdd3',
              boxShadow: '0 6px 20px rgba(225,29,72,0.04)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#881337', marginBottom: '0.75rem' }}>
              📫 Get In Touch With Us
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Have questions, feedback, or need help creating your custom surprise link? Our customer support desk is always ready to assist you.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.92rem', color: '#0f172a' }}>
              <div>
                <strong>📧 Customer Support Email:</strong><br />
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#be185d', textDecoration: 'none', fontWeight: 800 }}>
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div>
                <strong>🌐 Social Profiles:</strong><br />
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#be185d', textDecoration: 'none', fontWeight: 800, marginRight: '14px' }}>
                  Instagram ↗
                </a>
                <a href={X_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#be185d', textDecoration: 'none', fontWeight: 800 }}>
                  X (Twitter) ↗
                </a>
              </div>
            </div>
          </section>

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
          <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.5rem' }}>✨ 💝 🚀</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#881337', marginBottom: '0.5rem' }}>
            Ready to Create an Unforgettable Moment?
          </h2>
          <p style={{ color: '#9f1239', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Pick a template, upload your memories, and surprise someone who matters most in under 3 minutes.
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
              ✨ Explore All Templates
            </Link>
            <Link
              href="/contact"
              className="btn-secondary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '999px',
                background: '#ffffff',
              }}
            >
              💬 Contact Support Desk
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
