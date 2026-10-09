import Link from 'next/link';
import TemplatesCatalog from '@/components/TemplatesCatalog';
import EmotionFinder from '@/components/EmotionFinder';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import { templates } from '@/lib/templates';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'LovelyCrafts — Interactive Digital Gifts & Personalized Surprises India',
  description:
    'Create stunning interactive digital surprises in 3 minutes. Birthday cards, romantic proposals, apology notes, anniversary gifts, and emotional experiences — personalized with your photos & message. Share instantly on WhatsApp.',
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
    description:
      'Create stunning interactive digital surprises in 3 minutes. Birthday cards, proposals, apology notes, anniversary gifts, and emotional experiences.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts — Personalized Digital Surprises' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'LovelyCrafts — Interactive Digital Gifts & Surprises India',
    description: 'Birthday cards, proposals, apology notes & emotional digital experiences. Share on WhatsApp in seconds.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function Home() {
  return (
    <main className="shell">
      <div className="main-content">
        {/* ========================================================================= */}
        {/* 1. PLAYFUL EMOTIONAL HERO BANNER */}
        {/* ========================================================================= */}
        <section
          className="hero-section hero-enhanced text-center mt-4 mb-8"
          style={{
            borderRadius: 'clamp(20px, 4vw, 32px)',
            padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 3.5vw, 2.5rem)',
            background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.98) 0%, rgba(255, 245, 248, 0.95) 50%, rgba(245, 243, 255, 0.98) 100%)',
            border: '1.5px solid rgba(244, 63, 94, 0.18)',
            boxShadow: '0 20px 50px -15px rgba(225, 29, 72, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">💌</span>
          <span className="hero-floating-decor d2" aria-hidden="true">💖</span>
          <span className="hero-floating-decor d3" aria-hidden="true">✨</span>
          <span className="hero-floating-decor d4" aria-hidden="true">🎂</span>

          {/* Hero Top Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              fontSize: 'clamp(0.72rem, 1.6vw, 0.8rem)',
              color: '#be185d',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(244,63,94,0.08)',
            }}
          >
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>✨ Crafted To Bring Happy Tears &amp; Big Smiles</span>
          </div>

          {/* Main Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5.5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 900,
              color: '#0f172a',
              margin: '0 auto 1rem',
              letterSpacing: '-0.03em',
              maxWidth: '850px',
            }}
          >
            Turn Real Emotions Into <br />
            <span className="cursive" style={{ color: '#e11d48', fontSize: '1.08em' }}>
              Magical Interactive Surprises
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: '#475569',
              fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
              maxWidth: '680px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Create a private, unskippable digital experience in 3 minutes. Perfect for birthdays, romantic proposals, anniversaries, apologies, and long-distance lovers.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions" style={{ marginBottom: '1.25rem' }}>
            <Link
              href="/templates"
              className="btn-primary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                fontWeight: 800,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)',
                boxShadow: '0 8px 25px rgba(244, 63, 94, 0.35)',
              }}
            >
              ✨ Craft a Surprise Now ➔
            </Link>

            <Link
              href="/arcade"
              className="btn-secondary"
              style={{
                padding: '0.85rem 1.8rem',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: 800,
                borderRadius: '999px',
                background: '#ffffff',
                border: '1.5px solid #ddd6fe',
                color: '#6d28d9',
              }}
            >
              🎮 Play Couple Arcade
            </Link>
          </div>

          {/* Business Link */}
          <div style={{ margin: '0.5rem 0 1.25rem' }}>
            <Link
              href="/business"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#be185d',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
            >
              💼 Planning company celebrations? Explore LovelyCrafts for Business ➔
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="hero-social-proof">
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>Ready in <b>3 mins</b></span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>📱</span>
              <span><b>1-Click</b> WhatsApp Share</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🔒</span>
              <span><b>100% Private</b> &amp; Safe</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🎵</span>
              <span><b>Music &amp; Confetti</b> Included</span>
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. LIVE REACTION ACTIVITY TICKER */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <LiveActivityTicker />
        </div>

        {/* ========================================================================= */}
        {/* 3. EMOTIONAL MOOD / INTENT MATCHER */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: '3.5rem' }}>
          <EmotionFinder />
        </section>

        {/* ========================================================================= */}
        {/* 4. THREE SIMPLE STEPS (HOW IT WORKS) */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: '4rem' }}>
          <div className="templates-section-heading templates-section-heading--centered">
            <div>
              <span className="templates-section-label">Simple &amp; Fast</span>
              <h2>How The Magic Unfolds in 3 Steps</h2>
            </div>
            <p className="templates-subtitle">
              No design skills needed. Just your genuine feelings, a few photos, and your favorite song.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                border: '1.5px solid #ffe4e6',
                boxShadow: '0 8px 24px rgba(244, 63, 94, 0.05)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #ffe4e6, #fff1f2)',
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1.25rem',
                }}
              >
                🎨
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#e11d48',
                  background: '#fff1f2',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.5rem',
                }}
              >
                Step 1
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Pick an Experience
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Choose from interactive proposals, birthday bashes, sentimental anniversaries, distance bridges, or sincere apologies.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                border: '1.5px solid #fce7f3',
                boxShadow: '0 8px 24px rgba(244, 63, 94, 0.05)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
                  border: '1px solid #fbcfe8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1.25rem',
                }}
              >
                📸
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#db2777',
                  background: '#fdf2f8',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.5rem',
                }}
              >
                Step 2
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Add Photos &amp; Words
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Drop in your favorite photos, secret letter, inside jokes, and pick a heartwarming background melody.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                border: '1.5px solid #ede9fe',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.05)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1.25rem',
                }}
              >
                💌
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#7c3aed',
                  background: '#f5f3ff',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.5rem',
                }}
              >
                Step 3
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Share on WhatsApp
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Get an instant private link. When they open it, confetti pops, music plays, and your surprise unfolds!
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE TEMPLATES CATALOG */}
        {/* ========================================================================= */}
        <section className="templates-section" style={{ marginBottom: '4rem' }}>
          <div className="templates-section-heading">
            <div>
              <span className="templates-section-label">Curated Surprises</span>
              <h2>Choose a Template Experience</h2>
            </div>
            <p className="templates-subtitle">
              Every template is custom crafted with smooth animations, audio player, interactive games, and private photo galleries.
            </p>
          </div>
          <TemplatesCatalog templates={templates} />
        </section>

        {/* ========================================================================= */}
        {/* 6. COUPLE & BESTIE MINI-GAMES ARCADE SHOWCASE */}
        {/* ========================================================================= */}
        <section
          style={{
            marginBottom: '4rem',
            background: 'linear-gradient(135deg, #faf5ff 0%, #fff1f2 50%, #fdf2f8 100%)',
            border: '1.5px solid #e9d5ff',
            borderRadius: '28px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 12px 36px rgba(147, 51, 234, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#7c3aed',
                  background: '#f3e8ff',
                  border: '1px solid #e9d5ff',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.5rem',
                }}
              >
                🎮 Couple &amp; Friends Arcade
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem' }}>
                Play Cute 30s Games Together
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Test your chemistry, spin the date wheel, scratch surprise coupons, and challenge each other!
              </p>
            </div>
            <Link
              href="/arcade"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #be185d)',
                padding: '0.75rem 1.5rem',
                fontSize: '0.88rem',
                borderRadius: '999px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              🎮 Open Arcade ➔
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <Link
              href="/arcade/love-quiz"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid #f3e8ff',
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>💖</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                Chemistry Quiz
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                6 rapid romance questions to test couple synergy.
              </p>
            </Link>

            <Link
              href="/arcade/heart-rush"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid #fce7f3',
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>⚡</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                Heart Rush!
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Catch falling love letters &amp; dodge heartbreak bombs.
              </p>
            </Link>

            <Link
              href="/arcade/memory-match"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid #ede9fe',
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🃏</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                Memory Match
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Flip matching couple icons against the clock.
              </p>
            </Link>

            <Link
              href="/arcade/speed-tap"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid #fef3c7',
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🫂</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                10s Hug Frenzy
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Speed tap duel to see who sends the most hugs!
              </p>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. "HAPPY TEARS & SMILES" WALL OF LOVE (TESTIMONIALS) */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: '4rem' }}>
          <div className="templates-section-heading templates-section-heading--centered">
            <div>
              <span className="templates-section-label">Real Stories</span>
              <h2>Happy Tears &amp; Unforgettable Smiles</h2>
            </div>
            <p className="templates-subtitle">
              See how thousands of partners, besties, and families made someone feel extraordinary.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.5rem',
            }}
          >
            {/* Review 1 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1.5px solid #ffe4e6',
                boxShadow: '0 6px 20px rgba(244, 63, 94, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e11d48', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '999px' }}>
                    Long Distance Anniversary
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  &ldquo;He lives in Germany and I&apos;m in Bangalore. When he opened the starry night letter at midnight with our song playing, he literally called me crying with happiness. Best surprise experience I have ever sent!&rdquo;
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <b style={{ color: '#0f172a' }}>Priya &amp; Rohan</b>
                <span style={{ color: '#94a3b8' }}>Bangalore → Berlin</span>
              </div>
            </div>

            {/* Review 2 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1.5px solid #fef3c7',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '999px' }}>
                    21st Birthday Surprise
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  &ldquo;Her reaction video when the balloon pops revealed our secret college photos was priceless! She said it was 100x more emotional and meaningful than any generic gift card.&rdquo;
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <b style={{ color: '#0f172a' }}>Aarav M.</b>
                <span style={{ color: '#94a3b8' }}>Mumbai</span>
              </div>
            </div>

            {/* Review 3 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '999px' }}>
                    Heartfelt Apology
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  &ldquo;We had a terrible argument and I was struggling to find the right words. The interactive apology note gave us both a gentle moment to breathe and talk with open hearts. Truly grateful.&rdquo;
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <b style={{ color: '#0f172a' }}>Neha &amp; Vikram</b>
                <span style={{ color: '#94a3b8' }}>Delhi</span>
              </div>
            </div>

            {/* Review 4 */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '1.75rem',
                border: '1.5px solid #fce7f3',
                boxShadow: '0 6px 20px rgba(244, 63, 94, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '2px 8px', borderRadius: '999px' }}>
                    Romantic Proposal
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  &ldquo;The cheeky runaway &apos;NO&apos; button made her giggle so hard while tears welled up in her eyes. When the &apos;YES&apos; burst into heart confetti, it was pure movie magic.&rdquo;
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <b style={{ color: '#0f172a' }}>Tanvi &amp; Sameer</b>
                <span style={{ color: '#94a3b8' }}>Pune</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. TRUST & PEACE OF MIND RIBBON */}
        {/* ========================================================================= */}
        <section
          style={{
            marginBottom: '3.5rem',
            background: '#ffffff',
            border: '1.5px solid #ffe4e6',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: '0 4px 16px rgba(244, 63, 94, 0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔒</span>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                100% Private Links
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Only those with your unique link can view</span>
            </div>
            <div>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📱</span>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                Zero App Download
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Opens smoothly in any mobile browser</span>
            </div>
            <div>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🎵</span>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                Music &amp; Audio Ready
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Plays background soundtracks &amp; notes</span>
            </div>
            <div>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⚡</span>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                Instant Delivery
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Created in 3 mins, ready right on time</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. FINAL PLAYFUL CTA CARD */}
        {/* ========================================================================= */}
        <section
          className="bottom-cta-section-enhanced"
          style={{
            padding: 'clamp(2.5rem, 5vw, 3.5rem) 1.5rem',
            textAlign: 'center',
            borderRadius: '28px',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fdf2f8 100%)',
            border: '1.5px solid #fecdd3',
            boxShadow: '0 16px 40px -10px rgba(244, 63, 94, 0.15)',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>💖 ✨</span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: '#881337',
              fontWeight: 900,
              margin: '0 0 0.75rem',
              lineHeight: 1.2,
            }}
          >
            Ready to Make Someone Feel Deeply Special Today?
          </h2>
          <p
            style={{
              color: '#9f1239',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              maxWidth: '600px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.6,
            }}
          >
            Don&apos;t just send a plain text message. Give them an interactive digital memory they will bookmark and smile at for years to come.
          </p>
          <Link
            href="/templates"
            className="btn-primary"
            style={{
              padding: '0.95rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f43f5e, #be185d)',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(244, 63, 94, 0.35)',
              display: 'inline-block',
            }}
          >
            ✨ Start Crafting Now ➔
          </Link>
        </section>
      </div>
    </main>
  );
}
