'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


/* ─────────────────────────────────────────────────────────
   APOLOGY EXPERIENCE ("I'm Sorry")
   4-Scene Full Emotion Journey:
   1. Wax Seal Envelope & Handwritten Typewriter Letter
   2. "Will You Forgive Me?" — Runaway impossible NO button
   3. Sacred Memory Gallery / Promise Polaroids
   4. "Thank You For Forgiving Me 🥺" Warm Glow & Heart Shower
───────────────────────────────────────────────────────── */
export default function ApologyExperience({ note, isPreview = false, onReachEnd }) {
  const [scene, setScene] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsAudioPlaying((p) => !p);
  };


  const recipientName = note?.recipient_name || 'My Love';
  const senderName = note?.custom_details?.sender_name || '';
  const whatHappenedType = note?.custom_details?.what_happened_type || '';
  const letter = note?.custom_details?.letter || note?.custom_message || "I know I messed up, and saying sorry doesn't automatically erase the hurt. But I want you to know how deeply I regret my mistakes. You mean everything to me, and I want to make things right.";
  const photos = note?.image_urls || [];

  // Notify recipient wrapper when reaching the final scene
  useEffect(() => {
    if (scene === 4) {
      onReachEnd?.(true, () => setScene(1));
    }
  }, [scene, onReachEnd]);



  const goNext = () => setScene((s) => s + 1);

  return (
    <div
      style={{
        background: '#f8f3eb',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        position: 'relative',
        color: '#f1f5f9',
      }}
    >
      {/* ponytail: no audio src wired — swap the src for a real hosted track */}
      <audio ref={audioRef} loop src="/audio/apology-bg.mp3" preload="none" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&family=Caveat:wght@500;600;700&display=swap');
        @keyframes softRain {
          0% { transform: translateY(-30px); opacity: 0; }
          20% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(105vh); opacity: 0; }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) rotate(-4deg); opacity: 0.7; }
          50% { transform: translateY(-14px) rotate(4deg); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(45, 212, 191, 0.25), 0 0 40px rgba(45, 212, 191, 0.1); }
          50% { box-shadow: 0 0 35px rgba(45, 212, 191, 0.45), 0 0 65px rgba(45, 212, 191, 0.25); }
        }
        @keyframes typewriterCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Ambient background particles (gentle glowing droplets/starlight) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 19 + 7) % 100}%`,
              top: '-20px',
              width: `${(i % 3) + 1.5}px`,
              height: `${12 + (i % 4) * 8}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(94, 234, 212, 0.35))',
              borderRadius: '999px',
              animation: `softRain ${3 + (i % 4) * 0.8}s linear ${(i * 0.35).toFixed(2)}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating Audio Toggle */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100 }}>
        <button
          onClick={toggleAudio}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isAudioPlaying ? 'rgba(45, 212, 191, 0.18)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${isAudioPlaying ? 'rgba(45, 212, 191, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
            backdropFilter: 'blur(12px)',
            color: isAudioPlaying ? '#5eead4' : '#cbd5e1',
            borderRadius: '999px',
            padding: '7px 14px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span>{isAudioPlaying ? '🎵 Sound: ON' : '🔇 Play Music'}</span>
        </button>
      </div>

      {/* Scene Flow Container */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {scene === 1 && (
            <SceneEnvelopeLetter
              key="s1"
              recipientName={recipientName}
              senderName={senderName}
              whatHappenedType={whatHappenedType}
              letter={letter}
              onNext={goNext}
            />
          )}

          {scene === 2 && (
            <SceneForgiveness
              key="s2"
              recipientName={recipientName}
              senderName={senderName}
              onYes={goNext}
            />
          )}

          {scene === 3 && (
            <SceneMemories
              key="s3"
              photos={photos}
              recipientName={recipientName}
              senderName={senderName}
              onNext={goNext}
            />
          )}

          {scene === 4 && (
            <SceneThankYou
              key="s4"
              recipientName={recipientName}
              senderName={senderName}
              onReplay={() => setScene(1)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 1: WAX SEAL ENVELOPE & HANDWRITTEN APOLOGY LETTER
───────────────────────────────────────────────────────── */
function SceneEnvelopeLetter({ recipientName, senderName, whatHappenedType, letter, onNext }) {
  const [isOpened, setIsOpened] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const whatHappenedLabels = {
    hurtful: 'I said something hurtful 😔',
    fight: 'We had an unnecessary fight 💔',
    not_there: "I wasn't there when you needed me 🥺",
    other: 'Something I deeply regret ✍️',
  };

  const reasonLabel = whatHappenedLabels[whatHappenedType] || '';

  // Typewriter effect when envelope opens
  useEffect(() => {
    if (!isOpened) return;
    setDisplayedText('');
    setIsTypingComplete(false);

    let currentIndex = 0;
    const speed = letter.length > 300 ? 18 : 28;
    const timer = setInterval(() => {
      if (currentIndex < letter.length) {
        setDisplayedText(letter.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTypingComplete(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isOpened, letter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: 'radial-gradient(ellipse at 50% 35%, #f8f3eb 0%, #f8f3eb 100%)',
      }}
    >
      {!isOpened ? (
        /* Envelope State */
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          style={{ textAlign: 'center', maxWidth: '380px', width: '100%' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}
          >
            ✉️
          </motion.div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#5eead4',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            A Private Sincere Message
          </span>

          <h1
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(2rem, 7vw, 2.75rem)',
              color: '#fff',
              margin: '0 0 0.5rem',
              textShadow: '0 2px 20px rgba(94, 234, 212, 0.3)',
            }}
          >
            For {recipientName}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
            Someone who deeply cares about you left a message from their heart.
          </p>

          {/* Realistic Envelope Box with Wax Seal */}
          <div
            onClick={() => setIsOpened(true)}
            style={{
              width: '100%',
              height: '210px',
              background: 'linear-gradient(145deg, #f8f3eb, #f8f3eb)',
              borderRadius: '20px',
              border: '1px solid rgba(94, 234, 212, 0.25)',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(45, 212, 191, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Envelope Flap Lines */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '110px',
                borderBottom: '1px solid rgba(94, 234, 212, 0.2)',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: 'linear-gradient(180deg, #f8f3eb, #f8f3eb)',
              }}
            />

            {/* Glowing Wax Seal Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #0d9488 0%, #f8f3eb 60%, #f8f3eb 100%)',
                border: '3px solid #5eead4',
                boxShadow: '0 0 25px rgba(94, 234, 212, 0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                color: '#fff',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🥺</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.05em', marginTop: '2px', color: '#ccfbf1' }}>
                OPEN
              </span>
            </motion.div>
          </div>

          <p style={{ color: '#5eead4', fontSize: '0.8rem', marginTop: '1.25rem', opacity: 0.85 }}>
            ✦ Tap the wax seal to unwrap ✦
          </p>
        </motion.div>
      ) : (
        /* Unfolded Letter State */
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ maxWidth: '480px', width: '100%', position: 'relative' }}
        >
          {/* Parchment Letter Card */}
          <div
            style={{
              background: 'linear-gradient(170deg, #fdfbf7 0%, #f4eee1 100%)',
              color: '#292524',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 5vw, 2.25rem)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(94, 234, 212, 0.15)',
              border: '1px solid rgba(226, 218, 203, 0.8)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Watermark seal behind letter */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '12rem',
                opacity: 0.04,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🕊️
            </div>

            {/* Letter Header */}
            <div style={{ borderBottom: '1px solid #e7e0d3', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  A Letter of Apology
                </span>
                <span style={{ fontSize: '1.2rem' }}>🕊️</span>
              </div>

              {reasonLabel && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(15, 118, 110, 0.08)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#0f766e',
                    fontWeight: 600,
                    marginTop: '0.5rem',
                  }}
                >
                  <span>Regarding: {reasonLabel}</span>
                </div>
              )}

              <h2
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
                  color: '#134e4a',
                  margin: '0.75rem 0 0',
                  lineHeight: 1.1,
                }}
              >
                Dearest {recipientName},
              </h2>
            </div>

            {/* Typewriter Body */}
            <div
              style={{
                minHeight: '130px',
                fontFamily: "'Caveat', cursive",
                fontSize: 'clamp(1.2rem, 4.2vw, 1.45rem)',
                lineHeight: 1.65,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {displayedText}
              {!isTypingComplete && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.2em',
                    background: '#f8f3eb',
                    marginLeft: '2px',
                    verticalAlign: 'middle',
                    animation: 'typewriterCursor 0.8s infinite',
                  }}
                />
              )}
            </div>

            {/* Sender Sign-off */}
            <div style={{ marginTop: '1.75rem', textAlign: 'right', borderTop: '1px solid #e7e0d3', paddingTop: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                Sincerely & with all my regret,
              </p>
              <p
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: '1.6rem',
                  color: '#0f766e',
                  margin: '0.2rem 0 0',
                  fontWeight: 700,
                }}
              >
                {senderName || 'Yours Always'}
              </p>
            </div>
          </div>

          {/* Action button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0d9488, #f8f3eb)',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 25px rgba(13, 148, 136, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>One more important question</span>
            <span>➔</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 2: FORGIVENESS SCREEN — RUNAWAY "NO" BUTTON
───────────────────────────────────────────────────────── */
function SceneForgiveness({ recipientName, senderName, onYes }) {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [evadeCount, setEvadeCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);

  const evadePhrases = [
    'No 💔',
    'Wait, no! 🥺',
    'Are you sure? 😭',
    'Give me a chance! 🙏',
    'You missed! 😜',
    'Try clicking YES! 💕',
    'I promise to be better! ✨',
    'Pleeease? 🥹',
  ];

  const currentNoPhrase = evadePhrases[Math.min(evadeCount, evadePhrases.length - 1)];

  // Runaway logic: moves away on hover or touch
  const handleEvade = useCallback(() => {
    setEvadeCount((prev) => prev + 1);
    setYesScale((prev) => Math.min(prev + 0.08, 1.45));

    const rangeX = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.35, 140) : 120;
    const rangeY = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.25, 120) : 100;

    const newX = (Math.random() - 0.5) * rangeX * 2;
    const newY = (Math.random() - 0.5) * rangeY * 2;

    setNoPosition({ x: Math.round(newX), y: Math.round(newY) });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at 50% 40%, #f8f3eb 0%, #f8f3eb 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating gentle aura */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 3 }}
      >
        <motion.div
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '4.5rem', marginBottom: '1rem', display: 'inline-block' }}
        >
          🥺
        </motion.div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#5eead4',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.5rem',
          }}
        >
          A Question From The Heart
        </span>

        <h1
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
            color: '#fff',
            margin: '0 0 0.75rem',
            lineHeight: 1.15,
          }}
        >
          Will You Forgive Me, {recipientName}?
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          {senderName ? `${senderName} promises` : 'I promise'} to make you smile again, listen with care, and never take your trust for granted.
        </p>

        {/* Buttons Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            minHeight: '90px',
            position: 'relative',
          }}
        >
          {/* Pulsing Big YES Button */}
          <motion.button
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.05 }}
            whileTap={{ scale: yesScale * 0.95 }}
            onClick={onYes}
            style={{
              padding: '16px 36px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.5), 0 6px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
              transition: 'transform 0.2s ease',
            }}
          >
            <span>YES, I Forgive You 💕</span>
          </motion.button>

          {/* Runaway Impossible NO Button */}
          <motion.button
            animate={{ x: noPosition.x, y: noPosition.y }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onMouseEnter={handleEvade}
            onTouchStart={handleEvade}
            onClick={handleEvade}
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              position: 'relative',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {currentNoPhrase}
          </motion.button>
        </div>

        {evadeCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '0.8rem', color: '#5eead4', marginTop: '1.5rem', fontStyle: 'italic' }}
          >
            {evadeCount >= 4 ? '✨ It seems there’s only one true answer! 💖' : 'Hint: The green button is waiting for you! 😊'}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 3: SACRED MEMORY GALLERY / PROMISES
───────────────────────────────────────────────────────── */
function SceneMemories({ photos, recipientName, senderName, onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback promises if no photos uploaded
  const fallbackPromises = [
    {
      title: 'Active Listening',
      text: 'I promise to listen without getting defensive, and make you feel truly heard.',
      icon: '👂',
    },
    {
      title: 'Cherishing Your Peace',
      text: 'I promise to be your safe space and bring calm to your days, never storm.',
      icon: '🌿',
    },
    {
      title: 'Growing Together',
      text: 'I promise to learn from my mistakes and love you better with each passing day.',
      icon: '🤝',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: 'radial-gradient(ellipse at 50% 40%, #f8f3eb 0%, #f8f3eb 100%)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#5eead4',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '0.5rem',
        }}
      >
        {photos.length > 0 ? 'Cherished Memories' : 'Vows of Sincerity'}
      </span>

      <h2
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: 'clamp(2rem, 6vw, 2.75rem)',
          color: '#fff',
          margin: '0 0 1.5rem',
        }}
      >
        {photos.length > 0 ? `Moments Worth Protecting 📸` : `My Promises To You, ${recipientName} ✨`}
      </h2>

      {photos.length > 0 ? (
        /* Photo Polaroid Carousel */
        <div style={{ maxWidth: '340px', width: '100%', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -60, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                padding: '14px 14px 44px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(94, 234, 212, 0.2)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '4px',
                  background: `url(${photos[currentIndex]}) center/cover no-repeat`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: 0,
                  right: 0,
                  fontFamily: "'Caveat', cursive",
                  fontSize: '1.2rem',
                  color: '#334155',
                }}
              >
                Memory {currentIndex + 1} of {photos.length}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex((c) => c - 1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ← Back
              </button>
            )}

            {currentIndex < photos.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((c) => c + 1)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #0d9488, #f8f3eb)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 4px 18px rgba(13, 148, 136, 0.35)',
                }}
              >
                Next Memory ➔
              </button>
            ) : (
              <button
                onClick={onNext}
                style={{
                  padding: '12px 28px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #0d9488, #f8f3eb)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
                }}
              >
                Continue ➔
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Fallback Promise Cards */
        <div style={{ maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fallbackPromises.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * (i + 1) }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(94, 234, 212, 0.2)',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{p.icon}</span>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#5eead4', fontWeight: 700 }}>
                  {p.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {p.text}
                </p>
              </div>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            style={{
              marginTop: '1rem',
              padding: '14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0d9488, #f8f3eb)',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(13, 148, 136, 0.35)',
            }}
          >
            Continue ➔
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 4: THANK YOU (FORGIVENESS EMBRACED)
───────────────────────────────────────────────────────── */
function SceneThankYou({ recipientName, senderName, onReplay }) {
  // Celebration heart confetti
  const hearts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 100}%`,
    delay: `${(i * 0.15).toFixed(2)}s`,
    dur: `${2.8 + (i % 4) * 0.5}s`,
    size: 14 + (i % 4) * 6,
    char: ['💕', '✨', '💖', '🕊️', '🌸'][i % 5],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at 50% 35%, #f8f3eb 0%, #f8f3eb 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Falling Hearts / Sparkles */}
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: h.left,
            fontSize: `${h.size}px`,
            animation: `softRain ${h.dur} ease-in ${h.delay} infinite`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {h.char}
        </div>
      ))}

      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
        style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 3 }}
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '5rem', marginBottom: '1rem', display: 'inline-block' }}
        >
          🥺❤️
        </motion.div>

        <h1
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2.3rem, 7vw, 3.4rem)',
            color: '#5eead4',
            margin: '0 0 0.5rem',
            lineHeight: 1.15,
            textShadow: '0 4px 25px rgba(94, 234, 212, 0.4)',
          }}
        >
          Thank You For Forgiving Me
        </h1>

        <p
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.4rem',
            color: '#ccfbf1',
            margin: '0 0 1.5rem',
          }}
        >
          You mean the absolute world to me, {recipientName}.
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(94, 234, 212, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.65 }}>
            &ldquo;Your grace and kindness give us a fresh start. I promise to cherish you, communicate honestly, and love you better each and every day.&rdquo;
          </p>

          <div style={{ marginTop: '1rem', color: '#5eead4', fontWeight: 700, fontSize: '0.9rem' }}>
            Forever grateful, {senderName || 'Me'} ✨
          </div>
        </div>

        {/* Replay Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReplay}
          style={{
            padding: '14px 32px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(94, 234, 212, 0.3)',
            color: '#5eead4',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <span>🔄 Replay Experience</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
