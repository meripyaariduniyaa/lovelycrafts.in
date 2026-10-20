'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '@/components/AuthProvider';

const GAMES = [
  {
    id: 'heart-rush',
    title: 'Heart Rush!',
    icon: '💖⚡',
    tagline: '30s Falling Sparks Catcher',
    description: 'Catch falling hearts, letters, and roses while dodging heartbreak bombs. High reflex couple duel!',
    badge: '🔥 MOST POPULAR',
    color: '#ec4899',
    bg: 'linear-gradient(135deg, #fdf2f8, #fce7f3)'
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    icon: '🧩🃏',
    tagline: 'Couple Emoji Card Flip',
    description: 'Flip and match 8 cute couple pairs in the fewest moves and fastest time possible.',
    badge: '✨ BRAIN DUEL',
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
  },
  {
    id: 'speed-tap',
    title: '10s Hug Frenzy',
    icon: '⚡🫂',
    tagline: '10-Second Speed Tap Duel',
    description: 'Tap the beating heart as fast as you can in 10 seconds. Who has the highest hug power?',
    badge: '⚡ SPEED TEST',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
  },
  {
    id: 'love-quiz',
    title: 'Couple Chemistry Quiz',
    icon: '🧠❓',
    tagline: '6 Romance Questions in 30s',
    description: 'Answer rapid-fire romantic questions as a couple. Speed bonuses and streaks boost your chemistry score!',
    badge: '🧪 NEW GAME',
    color: '#059669',
    bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
  },
  {
    id: 'word-scramble',
    title: 'Love Word Scramble',
    icon: '🔡💌',
    tagline: '6 Romantic Words in 60s',
    description: 'Unscramble secret love words before the clock runs out. How many can you and your partner solve?',
    badge: '🔡 WORD GAME',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
  }
];

export default function ArcadeLobby() {
  const { user, login } = useAuth();
  const [highScores, setHighScores] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('arcade_high_scores') || '{}');
      setHighScores(saved);
    } catch {}
  }, []);

  return (
    <main className="shell lc-page-shell" style={{ padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Arcade Header */}
        <section
          className="hero-section hero-enhanced text-center mb-10"
          style={{
            borderRadius: 'clamp(20px, 4vw, 28px)',
            padding: 'clamp(1.75rem, 3.5vw, 2.75rem) clamp(1rem, 3vw, 2rem)',
            marginBottom: '2.5rem',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">🎮</span>
          <span className="hero-floating-decor d2" aria-hidden="true">💖</span>
          <span className="hero-floating-decor d3" aria-hidden="true">⚡</span>
          <span className="hero-floating-decor d4" aria-hidden="true">🏆</span>

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
            <span>🎮 COUPLES &amp; BESTIES ARCADE DUEL</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15, marginTop: '0.5rem', marginBottom: '0.75rem', color: '#1f2937', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Play, Compete &amp; <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>Challenge Your Favorite Person</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', maxWidth: '620px', margin: '0 auto 1rem', lineHeight: 1.6 }}>
            Set a new high score in our romantic &amp; fun mini-games, then send a 1-click WhatsApp challenge link to see who takes the crown!
          </p>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '0.85rem' }}>
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>30-Second quick rounds</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>📱</span>
              <span>1-Click WhatsApp duel share</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>👑</span>
              <span>Zero download required</span>
            </span>
          </div>

          {!user && (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #fecdd3',
                borderRadius: '16px',
                padding: '0.85rem 1.25rem',
                maxWidth: '480px',
                margin: '1.5rem auto 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 4px 14px rgba(244,63,94,0.08)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: 700, textAlign: 'left' }}>
                💡 Sign in to save your personal high scores permanently!
              </span>
              <button
                type="button"
                onClick={login}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(190, 24, 93, 0.25)',
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </section>

        {/* Games Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {GAMES.map((game) => {
            const best = highScores[game.id] || 0;
            return (
              <div
                key={game.id}
                className="bestseller-card"
                style={{
                  background: `linear-gradient(165deg, #ffffff 68%, ${game.color}15 100%)`,
                  borderRadius: '24px',
                  border: `1.5px solid ${game.color}40`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  '--card-glow': `${game.color}40`,
                }}
              >
                {/* Top Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: game.color, background: game.bg, padding: '0.25rem 0.65rem', borderRadius: '999px', border: `1px solid ${game.color}30` }}>
                    {game.badge}
                  </span>
                  {best > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                      🏆 Best: {best} pts
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '3.2rem', marginBottom: '0.75rem' }}>{game.icon}</div>
                  <h3 style={{ fontSize: '1.35rem', color: '#1f2937', fontWeight: 800, margin: '0 0 0.25rem' }}>
                    {game.title}
                  </h3>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: game.color, display: 'block', marginBottom: '0.75rem' }}>
                    {game.tagline}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                    {game.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    href={`/arcade/${game.id}`}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${game.color}, #a64036)`,
                      boxShadow: `0 6px 18px ${game.color}35`,
                      borderRadius: '14px',
                    }}
                  >
                    🎮 Play &amp; Duel ➔
                  </Link>
                </div>
              </div>
            );
          })}
        </div>


        {/* How Duels Work Card */}
        <div
          className="bottom-cta-section-enhanced"
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 16px 36px rgba(244,63,94,0.12)',
            marginTop: '2rem',
          }}
        >
          <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.5rem' }}>⚔️ 💌 👑</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', color: '#881337', fontWeight: 900, margin: '0 0 0.75rem' }}>
            How Partner Duels Work
          </h2>
          <p style={{ color: '#9f1239', fontSize: '0.98rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            <b>1.</b> Play any 30s game to set your high score.<br />
            <b>2.</b> Click &ldquo;Challenge Your Partner&rdquo; to generate a private WhatsApp duel link.<br />
            <b>3.</b> Your partner taps the link, tries to beat your score, and the winner claims the bragging rights! 🏆
          </p>
          <Link
            href="/arcade/heart-rush"
            className="btn-primary"
            style={{ padding: '0.85rem 2.2rem', fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #ec4899, #be185d)', borderRadius: '999px', boxShadow: '0 8px 24px rgba(166, 64, 54, 0.96)' }}
          >
            🔥 Start a Quick Game Now
          </Link>
        </div>

      </div>
    </main>
  );
}
