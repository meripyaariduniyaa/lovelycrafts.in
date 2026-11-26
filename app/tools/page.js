import Link from 'next/link';
import { tools, TOOL_CATEGORIES } from '@/lib/tools';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import ToolsHubClient from './ToolsHubClient';

export const metadata = {
  title: 'Free Love, Birthday & Gift Tools — Instant & Shareable | LovelyCrafts',
  description:
    'Free love calculators, crush compatibility tests, birthday countdowns, age calculators, and AI gift idea generators. Instant results shareable on WhatsApp & Instagram.',
  keywords: [
    'free love calculator',
    'crush compatibility test',
    'birthday countdown timer',
    'age calculator online',
    'anniversary calculator',
    'birthday wishes generator',
    'couple nickname generator',
    'gift idea generator',
    'emoji love translator',
    'who loves more calculator',
    'free relationship tools',
    'lovelycrafts tools',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools`,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Free Love, Birthday & Gift Tools — Instant & Shareable | LovelyCrafts',
    description:
      'Explore free love calculators, compatibility tests, age & countdown tools, and gift idea generators. Get instant results and turn them into digital gifts!',
    url: `${SITE_URL}/tools`,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts Free Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'Free Love, Birthday & Gift Tools | LovelyCrafts',
    description: 'Instant love calculators, birthday countdowns, and gift generators shareable on WhatsApp.',
    images: [DEFAULT_OG_IMAGE],
  },
};

const FAQ_ITEMS = [
  {
    q: 'Are all tools on LovelyCrafts 100% free to use?',
    a: 'Yes! Every calculator, quiz, countdown, and message generator on this hub is completely free with no signup or download required.',
  },
  {
    q: 'Can I share my calculation or quiz results on WhatsApp?',
    a: 'Absolutely. Every tool comes with one-click WhatsApp sharing, an X (Twitter) share button, and a quick copy-to-clipboard button formatted specifically for Instagram stories, chats, and captions.',
  },
  {
    q: 'How do I turn my result into a personalized digital gift?',
    a: 'Each tool result has a direct "Turn this into a gift" button. Clicking it links you directly to a tailored LovelyCrafts interactive template (like The Perfect Proposal, Virtual Birthday Bash, or Anniversary Special) where you can add photos, music, and voice notes.',
  },
  {
    q: 'Is my data private when using these tools?',
    a: 'Yes. All calculations happen entirely inside your web browser. We never store your names, dates, or answers on our servers.',
  },
];

export default function ToolsHubPage() {
  const toolsItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Love, Birthday & Gift Tools by LovelyCrafts',
    description: 'Collection of free interactive love calculators, birthday tools, message generators, and gift quizzes.',
    url: `${SITE_URL}/tools`,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <main className="lc-page-shell tools-page-shell">
      {/* HERO SECTION */}
      <section className="tools-hero text-center">
        <div className="tools-hero-badge">
          <span>Free, instant &amp; shareable</span>
        </div>

        <h1 className="tools-hero-title">
          Free Love, Birthday &amp; <br />
          <span className="cursive tools-hero-accent">Gift Experience Tools</span>
        </h1>

        <p className="tools-hero-desc">
          Love calculators, compatibility tests, birthday countdowns, and gift idea generators — all free,
          all instant, all shareable. Get your result in seconds and turn it into a personalized digital surprise.
        </p>

        {/* TRUST PILLS */}
        <div className="tools-trust-strip">
          <span className="tools-trust-pill">12+ free tools</span>
          <span className="tools-trust-pill">Instant 3-second results</span>
          <span className="tools-trust-pill">WhatsApp &amp; Instagram shareable</span>
          <span className="tools-trust-pill">Turn any result into a gift</span>
        </div>
      </section>

      {/* INTERACTIVE HUB */}
      <section className="tools-hub-container" aria-label="Interactive Tools Catalog">
        <ToolsHubClient tools={tools} />
      </section>

      {/* HOW PEOPLE USE THESE TOOLS */}
      <section className="tools-how-section">
        <div className="tools-section-header text-center">
          <p className="lc-eyebrow">How It Works</p>
          <h2>Turn Any Fun Result Into an Unforgettable Gift</h2>
        </div>

        <div className="tools-how-grid">
          <div className="tools-how-card">
            <span className="tools-how-num">01</span>
            <h3>Pick a Free Tool</h3>
            <p>Open any tool like the Love Calculator, Birthday Countdown, or Love Language Quiz.</p>
          </div>
          <div className="tools-how-card">
            <span className="tools-how-num">02</span>
            <h3>Get Instant Insight</h3>
            <p>Type in names or answer quick questions to receive your personalized score or custom message.</p>
          </div>
          <div className="tools-how-card">
            <span className="tools-how-num">03</span>
            <h3>Share or Craft a Gift</h3>
            <p>Send the result directly on WhatsApp, or click to transform it into a full interactive digital surprise link.</p>
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE SECTIONS */}
      <section className="tools-categories-section">
        <div className="tools-section-header text-center">
          <p className="lc-eyebrow">Browse by Category</p>
          <h2>Explore Every Tool Collection</h2>
        </div>

        <div className="tools-cat-showcase-grid">
          {TOOL_CATEGORIES.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
            return (
              <div key={cat.id} className="tools-cat-block">
                <div className="tools-cat-block-header">
                  <span className="tools-cat-emoji" aria-hidden="true">{cat.emoji}</span>
                  <div>
                    <h3 className="tools-cat-title">{cat.label}</h3>
                    <p className="tools-cat-count">{catTools.length} tools available</p>
                  </div>
                </div>
                <ul className="tools-cat-list">
                  {catTools.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className="tools-cat-link">
                        <span className="tools-cat-link-icon">{t.emoji}</span>
                        <span className="tools-cat-link-title">{t.title}</span>
                        <span className="tools-cat-link-arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="tools-faq-section" aria-labelledby="tools-faq-heading">
        <div className="tools-section-header text-center">
          <p className="lc-eyebrow">Got Questions?</p>
          <h2 id="tools-faq-heading">Frequently Asked Questions</h2>
        </div>

        <div className="tools-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="tools-faq-item">
              <summary className="tools-faq-question">{item.q}</summary>
              <p className="tools-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* BOTTOM PROMO CTA */}
      <section className="tools-bottom-cta text-center">
        <div className="tools-cta-emoji" aria-hidden="true">🎁💌</div>
        <h2>Ready to Send a Real Digital Surprise?</h2>
        <p>
          Turn feelings into interactive experiences with photo puzzles, memory timelines, voice notes, and romantic music.
        </p>
        <Link href="/templates" className="lc-button lc-button-primary">
          Explore All Gift Templates ✨
        </Link>
      </section>

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsItemListSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
    </main>
  );
}

