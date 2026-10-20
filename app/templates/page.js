import Link from 'next/link';
import { templates } from '@/lib/templates';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import GoogleAd from '@/components/GoogleAd';
import TemplatesCatalog from '@/components/TemplatesCatalog';


export const metadata = {
  title: 'Browse Interactive Digital Gift Templates | LovelyCrafts',
  description: 'Explore personalized interactive digital gift experiences: birthday surprises, romantic proposals, anniversary celebrations, apology notes, and long-distance memory journeys. Share on WhatsApp in minutes.',
  keywords: [
    'interactive digital gift templates India',
    'personalized digital card templates',
    'birthday surprise templates India',
    'proposal website template',
    'anniversary digital card',
    'apology card online India',
    'i miss you digital card',
    'emotional digital experience India',
    'LovelyCrafts templates',
  ],
  alternates: { canonical: `${SITE_URL}/templates` },
  openGraph: {
    title: 'Browse Interactive Digital Gift Templates | LovelyCrafts',
    description: 'Birthday surprises, proposals, apologies, anniversaries & more — personalized interactive digital cards.',
    url: `${SITE_URL}/templates`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts — Interactive Digital Gift Templates' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'Browse Interactive Digital Gift Templates | LovelyCrafts',
    description: 'Birthday surprises, proposals, apologies, anniversaries & more. Share on WhatsApp in minutes.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function TemplatesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'LovelyCrafts Digital Templates',
    description: 'Interactive personalized digital gift and greeting experiences',
    url: `${SITE_URL}/templates`,
    numberOfItems: templates.length,
    itemListElement: templates.map((t, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: t.title,
      description: t.description,
      url: `${SITE_URL}/templates/${t.id}`,
    })),
  };

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Templates', item: `${SITE_URL}/templates` },
    ],
  };

  return (
    <main className="shell lc-marketplace-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />

      <div className="main-content">
        <section className="hero-section hero-enhanced text-center mt-6 mb-8" style={{ borderRadius: 'clamp(20px, 4vw, 28px)', padding: 'clamp(1.75rem, 3.5vw, 2.75rem) clamp(1rem, 3vw, 2rem)' }}>
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">🎁</span>
          <span className="hero-floating-decor d2" aria-hidden="true">💖</span>
          <span className="hero-floating-decor d3" aria-hidden="true">✨</span>
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
              marginBottom: '0.85rem',
              boxShadow: '0 2px 8px rgba(244,63,94,0.08)',
            }}
          >
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>🎁 EXPLORE ALL {templates.length} INTERACTIVE TEMPLATES</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15, fontWeight: 900, color: '#1c1917', margin: '0 auto 0.75rem', letterSpacing: '-0.03em' }}>
            Choose the Perfect <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>Digital Gift Experience</span>
          </h1>
          <p className="hero-copy text-muted" style={{ maxWidth: '660px', margin: '0.75rem auto 1.25rem', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6 }}>
            Turn your favorite memories, photos, letters, and songs into stunning interactive web cards they open directly on WhatsApp in under 3 minutes.
          </p>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '0.85rem' }}>
            <span className="hero-social-proof-item">
              <span>📱</span>
              <span>Opens in any phone browser</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🔒</span>
              <span>Private 1-click WhatsApp link</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>✨</span>
              <span>100% Free interactive demo preview</span>
            </span>
          </div>
        </section>

        <section className="templates-section">
          <div className="templates-section-heading">
            <div>
              <span className="templates-section-label">Choose your moment</span>
              <h2>Something personal for every feeling</h2>
            </div>
            <p className="templates-subtitle">Each experience is made to be opened, tapped, and felt. Pick one, add your memories, then send the finished link.</p>
          </div>
          <TemplatesCatalog templates={templates} />
        </section>

        <section className="templates-how-it-works" aria-labelledby="how-your-gift-is-made">
          <div className="templates-section-heading templates-section-heading--centered">
            <div>
              <span className="templates-section-label">How it works</span>
              <h2 id="how-your-gift-is-made">Make something they can feel</h2>
            </div>
            <p className="templates-subtitle">No design skills or app download needed. Your words and memories become the experience.</p>
          </div>
          <div className="how-it-works-grid-enhanced" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              ['01', 'Pick an experience', 'Choose the feeling you want to send: celebration, romance, or a heartfelt second chance.', '🎁'],
              ['02', 'Add your magic', 'Tell us their name, add your photos, and write the words only you can say.', '💌'],
              ['03', 'Preview the moment', 'Open the live demo to see how the interactive story feels before you share it.', '👁️'],
              ['04', 'Share the private link', 'Send the finished experience on WhatsApp, Instagram, or wherever you talk.', '🔗'],
            ].map(([number, title, copy, icon]) => (
              <div key={number} className="how-card-enhanced">
                <div className="how-step-icon">{icon}</div>
                <div className="how-step-badge">{number}</div>
                <h3 className="how-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.35rem' }}>{title}</h3>
                <p className="how-desc" style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="templates-faq" aria-labelledby="templates-faq-title" style={{ marginTop: '2.5rem' }}>
          <div className="templates-section-heading templates-section-heading--centered">
            <div>
              <span className="templates-section-label">Before you create</span>
              <h2 id="templates-faq-title">Questions, answered</h2>
            </div>
            <p className="templates-subtitle">Everything you need to know before turning a feeling into a private digital surprise.</p>
          </div>
          <div className="faq-accordion-list">
            <details className="faq-item">
              <summary className="faq-summary">
                <span>❓ How will they open my experience?</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p className="faq-content">You receive a private link after creating your note. Send it through WhatsApp, Instagram DM, SMS, or any app that supports links. They open it in their phone browser without installing any app.</p>
            </details>
            <details className="faq-item">
              <summary>
                <span className="faq-summary" style={{ padding: 0 }}>❓ Can I add my own photos and message?</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p className="faq-content">Yes! Each template lets you upload your favorite memories, add custom photos, write heartfelt letters, select romantic background music, and even seal with a passcode.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">
                <span>❓ Can I see the experience before sharing it?</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p className="faq-content">Yes. Click "👁️ Live Demo" on any template to test the interactive preview. The recipient will experience the same interactive animations, sounds, and surprises.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">
                <span>❓ How long does it take to make?</span>
                <span className="faq-toggle-icon" aria-hidden="true">+</span>
              </summary>
              <p className="faq-content">Most templates take under 2 to 3 minutes to fill in. Just select your photos, write your message, and your live shareable link is generated instantly.</p>
            </details>
          </div>
        </section>

        {/* Subtle Templates Page Ad Unit */}
        <GoogleAd slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} className="templates-ad-banner" />
      </div>
    </main>
  );
}
