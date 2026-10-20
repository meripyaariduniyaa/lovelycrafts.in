import Link from 'next/link';
import TemplatesCatalog from '@/components/TemplatesCatalog';
import EmotionFinder from '@/components/EmotionFinder';
import PreviewDemoButton from '@/components/PreviewDemoButton';
import { templates } from '@/lib/templates';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'LovelyCrafts — Interactive Digital Gifts & Personalized Surprises India',
  description:
    'Create a personal digital surprise with your photos and words. Explore interactive birthday, proposal, anniversary, apology, and long-distance gifts, then share a private link.',
  keywords: [
    'personalized digital gift India',
    'interactive birthday card India',
    'send surprise on WhatsApp',
    'online proposal for girlfriend',
    'romantic anniversary gift online',
    'interactive apology card',
    'digital gift for long distance relationship',
    'digital birthday surprise link',
    'emotional digital card India',
    'couple arcade games online',
    'LovelyCrafts',
    'lovelycrafts.in',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'LovelyCrafts — Interactive Digital Gifts & Personalized Surprises India',
    description: 'Create a personal digital surprise with photos, messages, and interactive moments.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts — Personalized Digital Surprises' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'LovelyCrafts — Interactive Digital Gifts & Surprises India',
    description: 'Birthday gifts, proposals, apologies, and personal digital experiences.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

const steps = [
  { number: '01', title: 'Choose the feeling', description: 'Pick a template made for the moment you want to share.', icon: '✦' },
  { number: '02', title: 'Make it yours', description: 'Add names, photos, and the words only you can say.', icon: '♡' },
  { number: '03', title: 'Preview and share', description: 'See the experience, finish checkout, and send its link.', icon: '↗' },
];

export default function Home() {
  const featuredTemplate = templates.find((template) => template.id === 'birthday') || templates[0];
  const categories = [...new Set(templates.map((template) => template.category).filter(Boolean))];

  return (
    <main className="shell lc-home">
      <div className="main-content lc-home-content">
        <section className="lc-hero" aria-labelledby="home-title">
          <div className="lc-hero-copy">
            <p className="lc-eyebrow"><span aria-hidden="true">✦</span> Little things, made unforgettable</p>
            <h1 id="home-title">Give them a moment <em>made just for them.</em></h1>
            <p className="lc-hero-description">
              Turn your photos, stories, and inside jokes into an interactive digital gift they can open anywhere.
            </p>
            <div className="lc-hero-actions">
              <Link href="/templates" className="lc-button lc-button-primary">Find a gift <span aria-hidden="true">→</span></Link>
              <Link href="/templates#how-your-gift-is-made" className="lc-button lc-button-secondary">How it works</Link>
            </div>
            <div className="lc-hero-notes" aria-label="Gift highlights">
              <span><span aria-hidden="true">♡</span> Personal photos and words</span>
              <span><span aria-hidden="true">↗</span> A link you can share</span>
            </div>
            <Link href="/business" className="lc-business-link">Looking for company celebrations? Explore LovelyCrafts for Business <span aria-hidden="true">→</span></Link>
          </div>

          {featuredTemplate && (
            <div className="lc-hero-showcase" aria-label={`Preview ${featuredTemplate.title}`}>
              <div className="lc-showcase-glow" aria-hidden="true" />
              <div className="lc-gift-card">
                <div className="lc-gift-card-topline"><span> A LITTLE SOMETHING FOR YOU </span><span aria-hidden="true">✦</span></div>
                <div className="lc-gift-art" style={{ background: featuredTemplate.gradient }}>
                  <span className="lc-gift-art-orbit" aria-hidden="true" />
                  <span className="lc-gift-emoji" aria-hidden="true">{featuredTemplate.emoji}</span>
                  <span className="lc-gift-art-caption">made with love</span>
                </div>
                <div className="lc-gift-card-copy">
                  <span className="lc-gift-category">{featuredTemplate.category} · {featuredTemplate.time}</span>
                  <h2>{featuredTemplate.title}</h2>
                  <p>{featuredTemplate.features?.[0] || featuredTemplate.description}</p>
                </div>
                <PreviewDemoButton
                  templateId={featuredTemplate.id}
                  className="lc-preview-button"
                  style={{}}
                >
                  Open a live preview <span aria-hidden="true">↗</span>
                </PreviewDemoButton>
              </div>
              <div className="lc-floating-note lc-floating-note-top"><span aria-hidden="true">✉</span> Your words, your way</div>
              <div className="lc-floating-note lc-floating-note-bottom"><span aria-hidden="true">♡</span> A story they can open</div>
            </div>
          )}
        </section>

        <section className="lc-occasion-section" aria-labelledby="occasion-title">
          <div className="lc-section-heading lc-section-heading-row">
            <div>
              <p className="lc-eyebrow">Start with the moment</p>
              <h2 id="occasion-title">What would you like to celebrate?</h2>
            </div>
            <Link href="/templates" className="lc-text-link">Explore all gifts <span aria-hidden="true">→</span></Link>
          </div>
          <nav className="lc-occasion-list" aria-label="Browse gifts by occasion">
            {categories.map((category) => (
              <Link key={category} href={`/templates?occasion=${encodeURIComponent(category)}`} className="lc-occasion-chip">
                <span aria-hidden="true">{category === 'Romance' ? '♡' : category === 'Celebration' ? '✹' : category === 'Heartfelt' ? '✉' : '✦'}</span>
                {category}
              </Link>
            ))}
            <Link href="/templates" className="lc-occasion-chip lc-occasion-chip-all">All experiences <span aria-hidden="true">→</span></Link>
          </nav>
        </section>

        <section className="lc-catalog-section" id="gift-collection" aria-labelledby="gift-collection-title">
          <div className="lc-section-heading lc-section-heading-row">
            <div>
              <p className="lc-eyebrow">The gift collection</p>
              <h2 id="gift-collection-title">Choose something that feels like you</h2>
            </div>
            <p className="lc-section-intro">Every experience has its own little surprises. Find one, explore the preview, and make it personal.</p>
          </div>
          <TemplatesCatalog templates={templates} />
        </section>

        <section className="lc-how-section" aria-labelledby="how-title">
          <div className="lc-section-heading lc-section-heading-centered">
            <p className="lc-eyebrow">Simple from the first click</p>
            <h2 id="how-title">A few details. A whole lot of feeling.</h2>
          </div>
          <ol className="lc-steps-grid">
            {steps.map((step) => (
              <li className="lc-step-card" key={step.number}>
                <span className="lc-step-number">{step.number}</span>
                <span className="lc-step-icon" aria-hidden="true">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="lc-finder-wrap">
            <EmotionFinder />
          </div>
        </section>

        <section className="lc-creator-promo" aria-labelledby="creator-title">
          <div className="lc-creator-mark" aria-hidden="true">✦</div>
          <div>
            <p className="lc-eyebrow">For the people who inspire people</p>
            <h2 id="creator-title">Share a little joy with your community.</h2>
            <p>Join the LovelyCrafts Creator Club to share gifts with your audience and follow your referrals in a creator dashboard.</p>
          </div>
          <Link href="/creators" className="lc-button lc-button-secondary">Meet the Creator Club <span aria-hidden="true">→</span></Link>
        </section>

        <section className="lc-trust-strip" aria-label="About LovelyCrafts gifts">
          <div><span aria-hidden="true">✦</span><strong>Choose an experience</strong><small>Each template has its own story and interactions.</small></div>
          <div><span aria-hidden="true">♡</span><strong>Add your memories</strong><small>Personalize with the fields your template supports.</small></div>
          <div><span aria-hidden="true">↗</span><strong>Share your finished gift</strong><small>Send its link through the app you already use.</small></div>
        </section>

        <section className="lc-faq-section" aria-labelledby="home-faq-title">
          <div className="lc-section-heading lc-section-heading-centered">
            <p className="lc-eyebrow">Good to know</p>
            <h2 id="home-faq-title">A few things you might be wondering</h2>
          </div>
          <div className="lc-faq-list">
            <details>
              <summary>How does a LovelyCrafts gift work?</summary>
              <p>Choose a template, add the details it supports, preview your gift, then complete checkout to get a link you can share.</p>
            </details>
            <details>
              <summary>Can the recipient open the gift on their phone?</summary>
              <p>LovelyCrafts gifts open as web pages, so recipients can open the private link in a browser on their phone or computer.</p>
            </details>
            <details>
              <summary>Can I see a template before making it?</summary>
              <p>Yes. Use “Preview Demo” on a template card to open its existing interactive preview before you start personalizing.</p>
            </details>
            <details>
              <summary>How do I send the finished gift?</summary>
              <p>After checkout, use the gift’s private link to share it through WhatsApp, a message, or another app you already use.</p>
            </details>
          </div>
        </section>

        <section className="lc-final-cta" aria-labelledby="final-cta-title">
          <p className="lc-eyebrow">Make their next notification special</p>
          <h2 id="final-cta-title">Some feelings deserve more than a text.</h2>
          <p>Find a digital gift, add your own touch, and send a moment they can keep coming back to.</p>
          <Link href="/templates" className="lc-button lc-button-primary">Explore the gifts <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    </main>
  );
}
