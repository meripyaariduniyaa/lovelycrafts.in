'use client';

import { useState, useEffect } from 'react';

export default function SpeedTapGame({ onGameOver, challengeTargetScore = null, challengerName = null }) {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'gameover'
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover') {
      onGameOver?.(taps);
    }
  }, [gameState, taps, onGameOver]);

  const startGame = () => {
    setTaps(0);
    setTimeLeft(10);
    setGameState('playing');
  };

  const handleTap = () => {
    if (gameState !== 'playing') return;
    setTaps((prev) => prev + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 80);
  };

  // Speed rank calculation
  const getRank = (count) => {
    if (count >= 100) return { title: '⚡ GODSPEED CUDDLER!', color: '#e11d48' };
    if (count >= 75) return { title: '🔥 LIGHTNING LOVE HUGGER!', color: '#f59e0b' };
    if (count >= 50) return { title: '💖 SUPERSONIC SWEETHEART!', color: '#ec4899' };
    return { title: '✨ WARM & COZY TAPPER', color: '#8b5cf6' };
  };

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto', textAlign: 'center', userSelect: 'none' }}>
      
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: 'clamp(0.6rem, 2vw, 1rem) clamp(0.85rem, 3vw, 1.5rem)',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid #fecdd3',
        marginBottom: '1rem'
      }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
            Taps
          </span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>
            {taps}
          </div>
        </div>

        <div>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
            Speed (Taps/Sec)
          </span>
          <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, color: '#ec4899' }}>
            {timeLeft < 10 ? (taps / (10 - timeLeft)).toFixed(1) : '0.0'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: timeLeft <= 3 ? '#ef4444' : '#be185d', textTransform: 'uppercase' }}>
            Timer
          </span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: timeLeft <= 3 ? '#ef4444' : '#1f2937', lineHeight: 1 }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Target to Beat Banner */}
      {challengeTargetScore !== null && (
        <div style={{
          background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
          border: '1.5px dashed #f43f5e',
          borderRadius: '16px',
          padding: '0.6rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#9f1239',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚔️ Target to Beat ({challengerName || 'Partner'}):</span>
          <span style={{ background: '#f43f5e', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 900 }}>
            {challengeTargetScore} taps
          </span>
        </div>
      )}

      {/* Main Tap Field */}
      <div style={{
        background: '#ffffff',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        borderRadius: '24px',
        border: '2px solid #fbcfe8',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        minHeight: 'clamp(420px, 58vh, 600px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none'
      }}>
        {gameState === 'ready' ? (
          <div>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 4.2rem)', display: 'block', marginBottom: '0.5rem' }}>⚡🫂</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)', color: '#881337', fontWeight: 800, margin: '0 0 0.5rem' }}>
              10-Second Hug Frenzy!
            </h2>
            <p style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', color: '#6b7280', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              Tap the giant beating heart as fast as you can in 10 seconds to test your hug power!
            </p>
            <button
              className="btn-primary"
              onClick={startGame}
              style={{ padding: '0.85rem 2.6rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
            >
              🚀 Start Tap Frenzy (10s)
            </button>
          </div>
        ) : gameState === 'gameover' ? (
          <div style={{ animation: 'sorryStepFadeIn 0.4s ease' }}>
            <span style={{ fontSize: 'clamp(2.8rem, 7vw, 3.8rem)', display: 'block', marginBottom: '0.5rem' }}>🏆✨</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.2rem)', color: '#1f2937', fontWeight: 900, margin: '0 0 0.25rem' }}>
              Frenzy Finished!
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', margin: '0 0 0.75rem' }}>
              You registered <strong style={{ color: '#be185d', fontSize: '2rem' }}>{taps}</strong> taps in 10 seconds!
            </p>
            <div style={{
              background: '#fdf2f8',
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              color: getRank(taps).color,
              fontWeight: 800,
              fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
              display: 'inline-block',
              marginBottom: '1.5rem',
              border: `1.5px solid ${getRank(taps).color}`
            }}>
              {getRank(taps).title}
            </div>
            <br />
            <button
              className="btn-primary"
              onClick={startGame}
              style={{ padding: '0.8rem 2.2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
            >
              🔄 Try Again
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={handleTap}
              style={{
                width: 'clamp(190px, 46vw, 260px)',
                height: 'clamp(190px, 46vw, 260px)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f43f5e 0%, #be185d 100%)',
                border: 'clamp(6px, 1.5vw, 8px) solid #fecdd3',
                color: '#fff',
                fontSize: 'clamp(3.8rem, 9vw, 5.5rem)',
                cursor: 'pointer',
                boxShadow: pulse ? '0 0 50px rgba(244,63,94,0.8), 0 10px 25px rgba(0,0,0,0.2)' : '0 14px 40px rgba(244,63,94,0.35)',
                transform: pulse ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.04s ease, box-shadow 0.04s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label="Tap fast"
            >
              💖
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              TAP RAPIDLY! 🔥
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
