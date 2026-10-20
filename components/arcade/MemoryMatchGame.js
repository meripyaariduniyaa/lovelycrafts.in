'use client';

import { useState, useEffect, useCallback } from 'react';

const EMOJIS = ['🌹', '💌', '💍', '🧸', '☕', '🍫', '✨', '💖'];

export default function MemoryMatchGame({ onGameOver, challengeTargetScore = null, challengerName = null }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'gameover'
  const [finalScore, setFinalScore] = useState(0);

  // Initialize randomized cards
  const initGame = useCallback(() => {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
      }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    setStartTime(Date.now());
    setGameState('playing');
  }, []);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing' || !startTime) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, startTime]);

  // Card Flip Logic
  const handleCardClick = (id) => {
    if (gameState !== 'playing' || flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards.find((c) => c.id === newFlipped[0]);
      const card2 = cards.find((c) => c.id === newFlipped[1]);

      if (card1.emoji === card2.emoji) {
        // Matched!
        const nextMatched = [...matched, newFlipped[0], newFlipped[1]];
        setMatched(nextMatched);
        setFlipped([]);

        // Check if all matched
        if (nextMatched.length === cards.length) {
          const totalSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
          // Score formula: Base 500 - (seconds * 5) - (moves * 10)
          const calculatedScore = Math.max(50, Math.round(600 - (totalSeconds * 6) - ((moves + 1) * 8)));
          setFinalScore(calculatedScore);
          setGameState('gameover');
          onGameOver?.(calculatedScore);
        }
      } else {
        // Flip back after short delay
        setTimeout(() => {
          setFlipped([]);
        }, 700);
      }
    }
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
            Moves
          </span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>
            {moves}
          </div>
        </div>

        <div>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
            Pairs Found
          </span>
          <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, color: '#16a34a' }}>
            {matched.length / 2} / 8
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
            Timer
          </span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>
            {elapsed}s
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
          <span>⚔️ Target Score to Beat ({challengerName || 'Partner'}):</span>
          <span style={{ background: '#f43f5e', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 900 }}>
            {challengeTargetScore} pts
          </span>
        </div>
      )}

      {/* Game Field */}
      <div style={{
        background: '#ffffff',
        padding: 'clamp(1rem, 3vw, 2rem)',
        borderRadius: '24px',
        border: '1px solid #fbcfe8',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        minHeight: 'clamp(420px, 58vh, 600px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {gameState === 'ready' ? (
          <div style={{ padding: '1.5rem 1rem' }}>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 4.2rem)', display: 'block', marginBottom: '0.5rem' }}>🧩🃏</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)', color: '#881337', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Memory Match Duel
            </h2>
            <p style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', color: '#6b7280', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              Flip cards to match all 8 couples pairs in the fewest moves and fastest time!
            </p>
            <button
              className="btn-primary"
              onClick={initGame}
              style={{ padding: '0.85rem 2.4rem', fontSize: '1.05rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
            >
              🚀 Start Memory Match
            </button>
          </div>
        ) : gameState === 'gameover' ? (
          <div style={{ padding: '1.5rem 1rem', animation: 'sorryStepFadeIn 0.5s ease' }}>
            <span style={{ fontSize: 'clamp(2.8rem, 7vw, 3.8rem)', display: 'block', marginBottom: '0.5rem' }}>🎉👑</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.2rem)', color: '#1f2937', fontWeight: 900, margin: '0 0 0.25rem' }}>
              Puzzle Completed!
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#4b5563', margin: '0 0 0.5rem' }}>
              Matched all 8 pairs in <strong>{elapsed}s</strong> ({moves} moves)
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #fdf2f8, #ffe4e6)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              border: '2px solid #f43f5e',
              maxWidth: '260px',
              margin: '1rem auto 1.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>Your Score</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#be185d' }}>
                {finalScore} pts
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={initGame}
              style={{ padding: '0.8rem 2.2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
            >
              🔄 Play Again
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(8px, 2vw, 14px)',
            width: '100%',
            maxWidth: 'min(100%, 460px)',
            margin: '0 auto'
          }}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
              const isMatched = matched.includes(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: isMatched ? '#10b981' : isFlipped ? '#f43f5e' : '#fecdd3',
                    background: isMatched ? '#dcfce7' : isFlipped ? '#fff1f2' : 'linear-gradient(135deg, #fda4af, #a64036)',
                    fontSize: isFlipped ? 'clamp(24px, 6vw, 36px)' : '0px',
                    cursor: isMatched ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isFlipped ? '0 6px 14px rgba(244,63,94,0.18)' : '0 4px 8px rgba(0,0,0,0.06)',
                    transform: isFlipped ? 'rotateY(0deg) scale(1)' : 'rotateY(0deg) scale(0.96)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    touchAction: 'none'
                  }}
                  aria-label="Memory card"
                >
                  {isFlipped ? card.emoji : '❓'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
