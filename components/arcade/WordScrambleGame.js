'use client';

import { useState, useEffect, useCallback } from 'react';


const LOVE_WORDS = [
  { word: 'SOULMATE', hint: '💞 Your perfect match forever' },
  { word: 'CHERISH', hint: '🌹 To hold dear with love' },
  { word: 'DARLING', hint: '💛 A sweet term of endearment' },
  { word: 'ROMANCE', hint: '🌙 Love & passionate adventure' },
  { word: 'FOREVER', hint: '♾️ Endless time together' },
  { word: 'EMBRACE', hint: '🫂 To hold warmly and closely' },
  { word: 'PASSION', hint: '🔥 Intense overwhelming love' },
  { word: 'DEVOTED', hint: '🕊️ Deeply loyal and committed' },
  { word: 'BLOSSOM', hint: '🌸 Love that grows beautifully' },
  { word: 'ADORING', hint: '😍 Looking at them with pure love' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WordScrambleGame({ onGameOver, challengeTargetScore = null, challengerName = null }) {
  const [gameState, setGameState] = useState('ready');
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong'
  const [solved, setSolved] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);       // per-game hint tokens
  const [revealedSlots, setRevealedSlots] = useState([]); // indices already placed by hints


  const currentWord = words[currentWordIdx];

  const setupWord = useCallback((word) => {
    setScrambled(shuffle(word.split('')).map((ch, i) => ({ ch, id: i, used: false })));
    setSelected([]);
    setRevealedSlots([]);
  }, []);

  const startGame = () => {
    const picked = shuffle(LOVE_WORDS).slice(0, 6);
    setWords(picked);
    setCurrentWordIdx(0);
    setScore(0);
    setSolved(0);
    setHintsLeft(3);
    setRevealedSlots([]);
    setTimeLeft(60);
    setFlash(null);
    setupWord(picked[0].word);
    setGameState('playing');
  };

  // Hint: place the next correct letter into the next empty answer slot
  const useHint = () => {
    if (!currentWord || hintsLeft <= 0 || gameState !== 'playing') return;
    const word = currentWord.word;
    // Find next slot not yet filled
    const nextSlot = selected.length; // we always fill left-to-right
    if (nextSlot >= word.length) return;

    const correctLetter = word[nextSlot];
    // Find an unused scrambled tile with this letter
    const tile = scrambled.find((s) => !s.used && s.ch === correctLetter);
    if (!tile) return;

    const cost = hintsLeft === 3 ? 0 : 50; // first hint free, subsequent cost 50 pts each
    setScore((prev) => Math.max(0, prev - cost));
    setHintsLeft((prev) => prev - 1);
    setRevealedSlots((prev) => [...prev, nextSlot]);
    setScrambled((prev) => prev.map((s) => s.id === tile.id ? { ...s, used: true } : s));
    setSelected((prev) => [...prev, tile]);
    if (window.navigator?.vibrate) window.navigator.vibrate(15);
  };

  // Hint: reveal full word answer (-150 pts)
  const revealFullWord = () => {
    if (!currentWord || hintsLeft <= 0 || gameState !== 'playing') return;
    const word = currentWord.word;
    // Build full answer from scrambled tiles
    const remaining = [...scrambled.filter((s) => !s.used)];
    const fullSelected = [...selected];
    for (let i = selected.length; i < word.length; i++) {
      const correctLetter = word[i];
      const tileIdx = remaining.findIndex((s) => s.ch === correctLetter);
      if (tileIdx === -1) break;
      const tile = remaining.splice(tileIdx, 1)[0];
      fullSelected.push(tile);
    }
    setScore((prev) => Math.max(0, prev - 150));
    setHintsLeft(0);
    setScrambled((prev) => prev.map((s) => fullSelected.some((f) => f.id === s.id) ? { ...s, used: true } : s));
    setSelected(fullSelected);
    if (window.navigator?.vibrate) window.navigator.vibrate(30);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); setGameState('gameover'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover') onGameOver?.(score);
  }, [gameState, score, onGameOver]);

  useEffect(() => {
    if (!currentWord || selected.length !== currentWord.word.length) return;
    const guess = selected.map((s) => s.ch).join('');
    if (guess === currentWord.word) {
      const timeBonus = Math.max(0, timeLeft * 3);
      const gained = 200 + timeBonus;
      setScore((prev) => prev + gained);
      setSolved((prev) => prev + 1);
      setFlash('correct');
      if (window.navigator?.vibrate) window.navigator.vibrate([30, 20, 30]);
      setTimeout(() => {
        setFlash(null);
        const nextIdx = currentWordIdx + 1;
        if (nextIdx < words.length) {
          setCurrentWordIdx(nextIdx);
          setupWord(words[nextIdx].word);
        } else {
          setGameState('gameover');
        }
      }, 500);
    } else {
      setFlash('wrong');
      if (window.navigator?.vibrate) window.navigator.vibrate(80);
      setTimeout(() => {
        setFlash(null);
        setSelected([]);
        setScrambled((prev) => prev.map((s) => ({ ...s, used: false })));
      }, 400);
    }
  }, [selected, currentWord, timeLeft, currentWordIdx, words, setupWord]);

  const tapScramble = (letter) => {
    if (letter.used) return;
    setScrambled((prev) => prev.map((s) => s.id === letter.id ? { ...s, used: true } : s));
    setSelected((prev) => [...prev, letter]);
  };

  const tapSelected = (index) => {
    if (revealedSlots.includes(index)) return; // can't undo a hint-placed letter
    const removed = selected[index];
    setSelected((prev) => prev.filter((_, i) => i !== index));
    setScrambled((prev) => prev.map((s) => s.id === removed.id ? { ...s, used: false } : s));
  };

  const getRank = (s) => {
    if (s >= 1400) return { title: '💖 WORD WIZARD LOVER!', color: '#e11d48' };
    if (s >= 900) return { title: '🔥 ROMANCE VOCABULARY MASTER', color: '#f59e0b' };
    if (s >= 500) return { title: '✨ SWEET WORD DETECTIVE', color: '#ec4899' };
    return { title: '🌸 LOVE LANGUAGE LEARNER', color: '#8b5cf6' };
  };

  const flashBg = flash === 'correct' ? '#dcfce7' : flash === 'wrong' ? '#ffe4e6' : '#ffffff';

  return (
    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto', textAlign: 'center', userSelect: 'none' }}>

      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: 'clamp(0.6rem, 2vw, 1rem) clamp(0.85rem, 3vw, 1.5rem)', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #fecdd3', marginBottom: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>Score</span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>{score}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>Time</span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: timeLeft <= 10 ? '#e11d48' : '#1f2937', lineHeight: 1 }}>{timeLeft}s</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>Solved</span>
          <div style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{solved}/{words.length || 6}</div>
        </div>
      </div>

      {gameState === 'ready' && (
        <div style={{ padding: '2rem 1rem', background: '#fff1f2', borderRadius: '24px', border: '2px dashed #a64036' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>🔡💌</span>
          <h2 style={{ fontSize: '1.6rem', color: '#881337', fontWeight: 800, margin: '0 0 0.5rem' }}>Love Word Scramble!</h2>
          <p style={{ color: '#9f1239', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Unscramble 6 romantic words in 60 seconds. Tap the letters in order to spell them out!
          </p>
          <button type="button" className="btn-primary" onClick={startGame} style={{ padding: '0.85rem 2.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            🔡 Start Scramble
          </button>
        </div>
      )}

      {gameState === 'playing' && currentWord && (
        <div style={{ background: flashBg, borderRadius: '24px', border: `1px solid ${flash === 'correct' ? '#86efac' : flash === 'wrong' ? '#fca5a5' : '#fecdd3'}`, padding: '1.5rem 1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', transition: 'background 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#43332b', background: '#f5f3ff', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
              Word {currentWordIdx + 1} of {words.length}
            </div>
            {/* Hint Tokens */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ fontSize: '1rem', opacity: i < hintsLeft ? 1 : 0.25 }}>💡</span>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.75rem', fontStyle: 'italic' }}>{currentWord.hint}</p>

          {/* Answer Slots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {Array.from({ length: currentWord.word.length }).map((_, i) => {
              const letter = selected[i];
              const isHintSlot = revealedSlots.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onPointerDown={() => letter && !isHintSlot && tapSelected(i)}
                  style={{
                    width: '2.6rem', height: '2.6rem',
                    background: isHintSlot ? 'linear-gradient(135deg, #f59e0b, #d97706)' : letter ? '#f8f3eb' : 'rgba(124,58,237,0.08)',
                    color: '#ffffff',
                    border: `2px solid ${isHintSlot ? '#d97706' : letter ? '#7c3aed' : '#c4b5fd'}`,
                    borderRadius: '12px',
                    fontWeight: 900, fontSize: '1.1rem',
                    cursor: (letter && !isHintSlot) ? 'pointer' : 'default',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isHintSlot ? '0 0 8px rgba(245,158,11,0.5)' : 'none'
                  }}
                >
                  {letter?.ch || ''}
                </button>
              );
            })}
          </div>

          {/* Scrambled Letters */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {scrambled.map((letter) => (
              <button
                key={letter.id}
                type="button"
                onPointerDown={() => !letter.used && tapScramble(letter)}
                style={{
                  width: '2.75rem', height: '2.75rem',
                  background: letter.used ? 'rgba(0,0,0,0.06)' : '#fdf2f8',
                  color: letter.used ? '#d1d5db' : '#881337',
                  border: `2px solid ${letter.used ? '#e5e7eb' : '#fbcfe8'}`,
                  borderRadius: '12px',
                  fontWeight: 900, fontSize: '1.1rem',
                  cursor: letter.used ? 'default' : 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {letter.ch}
              </button>
            ))}
          </div>

          {/* Action Row: Clear + Hints */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                const nonHintSelected = selected.filter((_, i) => !revealedSlots.includes(i));
                setSelected(selected.filter((_, i) => revealedSlots.includes(i)));
                setScrambled((prev) => prev.map((s) =>
                  nonHintSelected.some((f) => f.id === s.id) ? { ...s, used: false } : s
                ));
              }}
              style={{ fontSize: '0.78rem', color: '#9ca3af', background: 'none', border: '1px solid #e5e7eb', borderRadius: '999px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontWeight: 700 }}
            >
              ↺ Clear
            </button>

            <button
              type="button"
              onClick={useHint}
              disabled={hintsLeft <= 0 || selected.length >= currentWord.word.length}
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                background: hintsLeft > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#e5e7eb',
                color: hintsLeft > 0 ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderRadius: '999px',
                padding: '0.35rem 0.9rem',
                cursor: hintsLeft > 0 ? 'pointer' : 'default',
                touchAction: 'manipulation',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              💡 {hintsLeft === 3 ? 'Hint (Free)' : `Hint (-50pts) ×${hintsLeft}`}
            </button>

            {hintsLeft === 0 ? (
              <button
                type="button"
                onClick={() => setShowAdModal(true)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.35rem 0.9rem',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                }}
              >
                🎬 Watch Ad (+2 Hints)
              </button>
            ) : (
              <button
                type="button"
                onClick={revealFullWord}
                disabled={hintsLeft <= 0}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  background: hintsLeft > 0 ? '#fff1f2' : '#e5e7eb',
                  color: hintsLeft > 0 ? '#be185d' : '#9ca3af',
                  border: `1px solid ${hintsLeft > 0 ? '#fecdd3' : '#e5e7eb'}`,
                  borderRadius: '999px',
                  padding: '0.35rem 0.9rem',
                  cursor: hintsLeft > 0 ? 'pointer' : 'default',
                  touchAction: 'manipulation'
                }}
              >
                🔓 Reveal (-150pts)
              </button>
            )}
          </div>
        </div>
      )}



      {gameState === 'gameover' && (
        <div style={{ padding: '2rem 1rem', background: '#ffffff', borderRadius: '24px', border: '2px solid #f8f3eb', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>🏆</span>
          <h2 style={{ fontSize: '1.75rem', color: '#1f2937', fontWeight: 900, margin: '0 0 0.25rem' }}>Scramble Complete!</h2>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: getRank(score).color, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {getRank(score).title}
          </div>
          <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '20px', padding: '1.25rem', maxWidth: '280px', margin: '0 auto 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 700 }}>Total Score</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#7c3aed' }}>{score} pts</div>
            <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>{solved} of {words.length} words solved</div>
          </div>
          <button type="button" className="btn-primary" onClick={startGame} style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}
