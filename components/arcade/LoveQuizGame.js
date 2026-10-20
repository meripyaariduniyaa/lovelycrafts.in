'use client';

import { useState, useEffect } from 'react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Where is your dream romantic getaway?',
    emoji: '🏝️✈️',
    options: [
      { text: 'Overwater Bungalow in Maldives', pts: 250 },
      { text: 'Cozy Cabin in Snowy Mountains', pts: 220 },
      { text: 'Sunset Beach Walk in Goa', pts: 200 },
      { text: 'Parisian Café & Eiffel Tower', pts: 240 }
    ]
  },
  {
    id: 2,
    question: 'Who is most likely to fall asleep first during movie night?',
    emoji: '🍿😴',
    options: [
      { text: 'Definitely Me!', pts: 210 },
      { text: '100% My Partner', pts: 210 },
      { text: 'Both of us at the same time', pts: 250 },
      { text: 'Neither, we stay up all night!', pts: 230 }
    ]
  },
  {
    id: 3,
    question: 'What is the ultimate romantic gesture?',
    emoji: '💖🌹',
    options: [
      { text: 'Surprise Midnight Coffee & Hug', pts: 250 },
      { text: 'Handwritten 5-Page Love Letter', pts: 240 },
      { text: 'Custom Playlist with Our Songs', pts: 220 },
      { text: 'Spontaneous Weekend Roadtrip', pts: 230 }
    ]
  },
  {
    id: 4,
    question: 'Who apologizes first after a silly argument?',
    emoji: '🕊️🥺',
    options: [
      { text: 'Me (I can’t stay mad!)', pts: 240 },
      { text: 'Partner (They melt fast)', pts: 240 },
      { text: 'Whoever is hungry first 🍕', pts: 260 },
      { text: 'We just look & laugh', pts: 250 }
    ]
  },
  {
    id: 5,
    question: 'What is your ideal date night style?',
    emoji: '🕯️🍷',
    options: [
      { text: 'Candlelight Dinner & Soft Jazz', pts: 240 },
      { text: 'Late Night Street Food Crawl', pts: 250 },
      { text: 'Stargazing under blankets', pts: 260 },
      { text: 'Gaming & Pizza on the couch', pts: 230 }
    ]
  },
  {
    id: 6,
    question: 'How do you express your love best?',
    emoji: '💌✨',
    options: [
      { text: 'Tight Hugs & Gentle Kisses', pts: 250 },
      { text: 'Thoughtful Surprises & Gifts', pts: 240 },
      { text: 'Quality Time & Deep Talks', pts: 260 },
      { text: 'Making Them Laugh Every Day', pts: 250 }
    ]
  }
];

export default function LoveQuizGame({ onGameOver, challengeTargetScore = null, challengerName = null }) {
  const [gameState, setGameState] = useState('ready');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hintTokens, setHintTokens] = useState(2);       // 2 x 50/50 hints per game
  const [eliminatedOptions, setEliminatedOptions] = useState([]); // indices eliminated this Q

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
      onGameOver?.(score);
    }
  }, [gameState, score, onGameOver]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentQIndex(0);
    setTimeLeft(30);
    setSelectedOption(null);
    setHintTokens(2);
    setEliminatedOptions([]);
    setGameState('playing');
  };

  // 50/50 hint: eliminate 2 options from the current question (-100 pts)
  const use5050Hint = () => {
    if (hintTokens <= 0 || gameState !== 'playing' || selectedOption !== null) return;
    const q = QUIZ_QUESTIONS[currentQIndex];
    // Pick 2 random indices to eliminate (never the highest-pts option)
    const highest = q.options.reduce((best, o, i) => o.pts > q.options[best].pts ? i : best, 0);
    const candidates = q.options.map((_, i) => i).filter((i) => i !== highest && !eliminatedOptions.includes(i));
    const toEliminate = candidates.sort(() => Math.random() - 0.5).slice(0, Math.min(2, candidates.length));
    setEliminatedOptions(toEliminate);
    setHintTokens((prev) => prev - 1);
    setScore((prev) => Math.max(0, prev - 100));
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
  };

  const handleSelectOption = (optionIndex, pts) => {
    if (gameState !== 'playing' || selectedOption !== null) return;

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(25);
    }

    setSelectedOption(optionIndex);
    const streakBonus = streak * 20;
    const gained = pts + streakBonus;

    setScore((prev) => prev + gained);
    setStreak((prev) => prev + 1);

    setTimeout(() => {
      if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
        setEliminatedOptions([]); // reset eliminations for next question
      } else {
        setGameState('gameover');
      }
    }, 350);
  };

  const getRank = (finalScore) => {
    if (finalScore >= 1300) return { title: '💖 SOULMATE CHEMISTRY 100%', color: '#e11d48' };
    if (finalScore >= 1000) return { title: '🔥 PASSIONATE POWER COUPLE', color: '#f59e0b' };
    if (finalScore >= 700) return { title: '✨ SWEET HEART-TO-HEART', color: '#ec4899' };
    return { title: '🌸 CUTE BEGINNINGS', color: '#8b5cf6' };
  };

  const currentQ = QUIZ_QUESTIONS[currentQIndex];

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto', textAlign: 'center', userSelect: 'none' }}>
      
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
            Score
          </span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>
            {score}
          </div>
        </div>

        <div>
          <span style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
            Time
          </span>
          <div style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
            fontWeight: 900,
            color: timeLeft <= 5 ? '#e11d48' : '#1f2937',
            lineHeight: 1
          }}>
            {timeLeft}s
          </div>
        </div>

        {challengeTargetScore !== null && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'clamp(0.65rem, 1.6vw, 0.75rem)', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
              To Beat ({challengerName || 'Partner'})
            </span>
            <div style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 900, color: '#be185d', lineHeight: 1 }}>
              {challengeTargetScore}
            </div>
          </div>
        )}
      </div>

      {/* Game States */}
      {gameState === 'ready' && (
        <div style={{ padding: '2rem 1rem', background: '#fff1f2', borderRadius: '24px', border: '2px dashed #a64036' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>🧠❓</span>
          <h2 style={{ fontSize: '1.6rem', color: '#881337', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Couple Chemistry Quiz!
          </h2>
          <p style={{ color: '#9f1239', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Answer 6 rapid-fire romance questions in 30 seconds. Fast choices get streak bonuses!
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={startGame}
            style={{ padding: '0.85rem 2.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            🔥 Start Quiz Duel
          </button>
        </div>
      )}

      {gameState === 'playing' && currentQ && (
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #fecdd3', padding: '1.5rem 1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#43332b', background: '#fff1f2', padding: '0.2rem 0.7rem', borderRadius: '999px' }}>
              Question {currentQIndex + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {streak > 1 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '0.2rem 0.7rem', borderRadius: '999px' }}>
                  🔥 {streak}x Streak!
                </span>
              )}
              {/* 50/50 Hint Tokens */}
              <button
                type="button"
                onClick={use5050Hint}
                disabled={hintTokens <= 0 || selectedOption !== null}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: hintTokens > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#e5e7eb',
                  color: hintTokens > 0 ? '#ffffff' : '#9ca3af',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.25rem 0.65rem',
                  cursor: hintTokens > 0 ? 'pointer' : 'default',
                  touchAction: 'manipulation',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                💡 50/50 ×{hintTokens}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentQ.emoji}</div>
          <h3 style={{ fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', color: '#1f2937', fontWeight: 800, margin: '0 0 1.5rem' }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isEliminated = eliminatedOptions.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={() => !isEliminated && handleSelectOption(idx, opt.pts)}
                  disabled={isEliminated}
                  style={{
                    background: isEliminated ? '#f3f4f6' : isSelected ? 'linear-gradient(135deg, #10b981, #f8f3eb)' : '#fdf2f8',
                    color: isEliminated ? '#d1d5db' : isSelected ? '#ffffff' : '#881337',
                    border: `1.5px solid ${isEliminated ? '#e5e7eb' : '#fbcfe8'}`,
                    borderRadius: '16px',
                    padding: '0.9rem 1.25rem',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    cursor: isEliminated ? 'not-allowed' : 'pointer',
                    touchAction: 'manipulation',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    transform: isSelected ? 'scale(0.98)' : 'none',
                    opacity: isEliminated ? 0.45 : 1,
                    textDecoration: isEliminated ? 'line-through' : 'none'
                  }}
                >
                  <span>{opt.text}</span>
                  {!isEliminated && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>+{opt.pts}</span>}
                  {isEliminated && <span style={{ fontSize: '0.8rem' }}>✕</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ padding: '2rem 1rem', background: '#ffffff', borderRadius: '24px', border: '2px solid #f8f3eb', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>👑</span>
          <h2 style={{ fontSize: '1.75rem', color: '#1f2937', fontWeight: 900, margin: '0 0 0.25rem' }}>
            Quiz Completed!
          </h2>

          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: getRank(score).color,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {getRank(score).title}
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '1.25rem', maxWidth: '320px', margin: '0 auto 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>Total Score</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#047857' }}>
              {score} pts
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={startGame}
            style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}
