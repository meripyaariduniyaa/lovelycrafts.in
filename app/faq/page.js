import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | LovelyCrafts',
  description:
    'Find answers to all your questions about creating digital surprises, photo privacy, custom background music, WhatsApp links, payments, and Creator Club.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'LovelyCrafts FAQ — Everything You Need to Know',
    description: 'Got questions about creating digital gifts, security, or sharing links? Read our detailed guide.',
    url: `${SITE_URL}/faq`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    title: 'LovelyCrafts FAQ — Frequently Asked Questions',
    description: 'Find answers to all your questions about LovelyCrafts digital gifts and surprises.',
  },
  robots: { index: true, follow: true },
};

const FAQ_CATEGORIES = [
  {
    category: '🎁 Creating & Sharing Surprises',
    faqs: [
      {
        q: 'How does my recipient open the digital surprise?',
        a: 'Once you finish personalizing your chosen template, you receive a unique, private link. You can share this link on WhatsApp, Instagram DM, SMS, or email. Your recipient simply taps the link on their mobile device or desktop browser to open the experience.',
      },
      {
        q: 'Do recipients need to install any app to view their gift?',
        a: 'No! LovelyCrafts experiences run directly in any web browser (Safari, Chrome, Firefox, WhatsApp Browser). No apps, downloads, or logins are required for the recipient.',
      },
      {
        q: 'How long does it take to create a digital gift?',
        a: 'Most experience templates take only 2 to 3 minutes to fill out. You can upload photos, add a custom letter, choose background music, and set up a secret passcode in just a few taps.',
      },
      {
        q: 'Can I preview my surprise before sending it?',
        a: 'Yes! Every template features a "Live Demo" button where you can interact with the full experience before creating your personalized version.',
      },
    ],
  },
  {
    category: '🔒 Privacy, Security & Data',
    faqs: [
      {
        q: 'Is my digital surprise private?',
        a: 'Yes, 100%. Only people with your unique link can access your gift experience. Search engines like Google do not index recipient links.',
      },
      {
        q: 'Can I add a secret passcode or date lock?',
        a: 'Yes! Many of our templates allow you to add a custom passcode, anniversary date lock, or midnight countdown lock so your recipient can only open it at the exact moment you choose.',
      },
      {
        q: 'How long are created links accessible?',
        a: 'Created gift experiences remain accessible via their private link for 90 days, giving your recipient plenty of time to revisit and relive the memory.',
      },
    ],
  },
  {
    category: '💳 Payments & Refunds',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We process payments securely via Razorpay, supporting Google Pay, PhonePe, Paytm, UPI, all major Credit/Debit cards, and Net Banking.',
      },
      {
        q: 'What is your refund policy?',
        a: 'Because LovelyCrafts delivers instant customized digital surprises, completed purchases are generally non-refundable. However, we provide a 48-Hour Refund Guarantee for confirmed technical delivery failures (where payment was deducted but no gift link was generated) or accidental duplicate transactions. Submit your Order ID to support within 48 hours of payment for a full refund. Check our Refund Policy page for full details.',
      },
    ],
  },
  {
    category: '👑 Creator Club & Affiliates',
    faqs: [
      {
        q: 'What is the LovelyCrafts Creator Club?',
        a: 'The Creator Club is our affiliate program for content creators, influencers, and digital marketers. Creators get an exclusive referral link and 10% coupon code for their audience, earning 10% to 18% tiered commissions across 5 performance levels based on monthly sales volume.',
      },
      {
        q: 'How are creator payouts processed?',
        a: 'Payouts are disbursed automatically via UPI or direct NEFT bank transfer once your confirmed commission balance reaches the minimum threshold of ₹500. Qualifying tiers reset at the beginning of each calendar month.',
      },
    ],
  },
];

export default function FAQPage() {
  const faqSchemaItems = FAQ_CATEGORIES.flatMap((cat) => cat.faqs).map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSchemaItems,
  };

  return (
    <main className="shell" style={{ padding: '2.5rem 1rem 5rem', background: '#fafaf9', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '1.75rem', fontSize: '0.88rem', color: '#64748b' }}>
          <Link href="/" style={{ color: '#be185d', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          {' / '}
          <span style={{ fontWeight: 700, color: '#0f172a' }}>FAQ</span>
        </nav>

        {/* Hero Header */}
        <section
          className="hero-section hero-enhanced text-center mb-10"
          style={{
            borderRadius: 'clamp(20px, 4vw, 28px)',
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.25rem)',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">❓</span>
          <span className="hero-floating-decor d2" aria-hidden="true">✨</span>
          <span className="hero-floating-decor d3" aria-hidden="true">💡</span>
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
            <span>❓ HELP CENTER &bull; FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15, fontWeight: 900, color: '#0f172a', margin: '0 auto 1rem', letterSpacing: '-0.03em' }}>
            Frequently Asked <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>Questions &amp; Guides</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.12rem)', color: '#475569', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Everything you need to know about creating, personalizing, locking, and sharing interactive digital gift links on WhatsApp.
          </p>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '1rem' }}>
            <span className="hero-social-proof-item">
              <span>📱</span>
              <span>No app install needed</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🔒</span>
              <span>Secret passcode lock supported</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>Ready in under 3 minutes</span>
            </span>
          </div>
        </section>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {FAQ_CATEGORIES.map((cat, idx) => (
            <section
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '2.25rem 2rem',
                border: '1.5px solid rgba(244,63,94,0.12)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {cat.category}
              </h2>

              <div className="faq-accordion-list">
                {cat.faqs.map((faq, fIdx) => (
                  <details
                    key={fIdx}
                    className="faq-item"
                  >
                    <summary className="faq-summary">
                      <span>{faq.q}</span>
                      <span className="faq-toggle-icon" aria-hidden="true">+</span>
                    </summary>
                    <p className="faq-content">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA Banner */}
        <div
          className="bottom-cta-section-enhanced"
          style={{
            marginTop: '3.5rem',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 16px 36px rgba(244,63,94,0.12)',
          }}
        >
          <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.5rem' }}>💬 ✉️ 🚀</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#881337', marginBottom: '0.5rem' }}>
            Still Have Questions?
          </h2>
          <p style={{ color: '#9f1239', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Our customer support desk is ready to help you craft the perfect interactive surprise.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
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
              💬 Contact Support Desk
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="btn-secondary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '999px',
                background: '#ffffff',
              }}
            >
              ✉️ Email Us Directly
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
