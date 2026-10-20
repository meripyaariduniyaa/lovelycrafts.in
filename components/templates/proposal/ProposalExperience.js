'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import PolaroidStack from '../common/PolaroidStack';



/* ─────────────────────────────────────────────────────────
   PROPOSAL EXPERIENCE
   Scenes:
   1. YES/NO Question — flying NO button
   2. Confetti Shower → reveal letter button
   3. Envelope open animation
   4. Handwritten letter line-by-line
   5. Memory photos (interactive PolaroidStack)
───────────────────────────────────────────────────────── */
export default function ProposalExperience({ note, isPreview = false, onReachEnd, onGoToReact, reactUrl }) {
  const [scene, setScene] = useState(1);

  const targetSlug = note?.slug || note?.custom_slug || note?.id || '';
  const resolvedReactUrl = reactUrl || (targetSlug ? `/p/${encodeURIComponent(targetSlug)}/react` : '');

  const handleFinalEnd = () => {
    if (onGoToReact) {
      onGoToReact();
      return;
    }
    if (resolvedReactUrl && !isPreview) {
      window.location.href = resolvedReactUrl;
      return;
    }
    onReachEnd?.(true, () => setScene(1));
  };


  const recipientName = note?.recipient_name || 'My Love';
  const senderName = note?.custom_details?.sender_name || '';
  const quotation = note?.custom_details?.quotation || '';
  const letter = note?.custom_details?.letter || note?.custom_message || '';
  const rawPhotos = note?.image_urls || note?.images || note?.photos || note?.custom_details?.images || note?.custom_details?.photos || [];
  const photos = (Array.isArray(rawPhotos) ? rawPhotos : []).map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean);

  return (
    <div style={{ background: '#f8f3eb', minHeight: isPreview ? '100%' : '100vh', height: isPreview ? '100%' : 'auto', fontFamily: "'Inter', sans-serif", overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Dancing+Script:wght@600;700&family=Caveat:wght@500;700&display=swap');
        @keyframes floatHeart { 0%,100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-12px) rotate(5deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes pulse-soft { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes typewriter-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>



      <AnimatePresence mode="wait">
        {scene === 1 && <Scene1YesNo key="s1" recipientName={recipientName} senderName={senderName} quotation={quotation} onYes={() => setScene(2)} isPreview={isPreview} />}
        {scene === 2 && <Scene2Confetti key="s2" recipientName={recipientName} onNext={() => setScene(3)} />}
        {scene === 3 && <Scene3Envelope key="s3" onOpen={() => setScene(4)} />}
        {scene === 4 && <Scene4Letter key="s4" letter={letter} senderName={senderName} recipientName={recipientName} onNext={() => setScene(5)} photos={photos} />}
        {scene === 5 && <Scene5Photos key="s5" photos={photos} recipientName={recipientName} onEnd={handleFinalEnd} reactUrl={resolvedReactUrl} />}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 1: YES / NO — flying NO button
───────────────────────────────────────────────────────── */
function Scene1YesNo({ recipientName, senderName, quotation, onYes, isPreview = false }) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noClickCount, setNoClickCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const evadePhrases = [
    'No 😅',
    'Wait, what? 🥺',
    'Are you sure? 💔',
    'Wrong button! 😂',
    'Try clicking YES! 💕',
    "Can't catch me! 😜",
  ];

  // After 2 failed NOs, show a hint
  useEffect(() => {
    if (noClickCount >= 2) setShowHint(true);
  }, [noClickCount]);

  const flyNo = useCallback(() => {
    setNoClickCount((c) => c + 1);
    const maxX = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.35, 140) : 120;
    const maxY = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.25, 120) : 100;
    setNoPos({
      x: (Math.random() - 0.5) * maxX * 2,
      y: (Math.random() - 0.5) * maxY * 2,
    });
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: `${(i * 41) % 100}%`, y: `${(i * 67) % 100}%`, delay: `${(i * 0.3).toFixed(1)}s`,
    color: ['#f43f5e', '#fb7185', '#fecdd3', '#fff'][i % 4],
  }));

  const currentNoText = evadePhrases[Math.min(noClickCount, evadePhrases.length - 1)];
  const yesScale = 1 + Math.min(noClickCount * 0.08, 0.4);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: isPreview ? '100%' : '100vh', height: isPreview ? '100%' : 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 30%, #f8f3eb 0%, #f8f3eb 100%)', padding: isPreview ? '1.25rem 1rem' : '2rem', position: 'relative', overflow: 'hidden' }}
    >
      {/* Floating hearts background */}
      {particles.map((p) => (
        <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: '1.2rem', opacity: 0.15, animation: `floatHeart ${2 + (p.id % 3)}s ${p.delay} ease-in-out infinite`, color: p.color, pointerEvents: 'none', userSelect: 'none' }}>
          {['♥', '✦', '❋', '✿'][p.id % 4]}
        </div>
      ))}

      {/* Content */}
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: '380px' }}>
        {/* Rose */}
        <motion.div animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '4rem', marginBottom: '1.25rem', display: 'inline-block' }}>
          🌹
        </motion.div>

        {quotation && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem', color: '#fda4af', marginBottom: '1.5rem', lineHeight: 1.5, fontWeight: 500 }}>
            &ldquo;{quotation}&rdquo;
          </motion.p>
        )}

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', color: '#fff', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
          {recipientName},
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ color: '#fda4af', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          Will you be mine? 💕
        </motion.p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '80px' }}>
          {/* YES */}
          <motion.button
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.08, boxShadow: '0 0 35px rgba(244,63,94,0.7)' }}
            whileTap={{ scale: yesScale * 0.93 }}
            onClick={onYes}
            style={{
              padding: '16px 40px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg,#f43f5e,#be123c)',
              border: 'none',
              color: '#fff',
              fontSize: '1.15rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(244,63,94,0.4)',
              zIndex: 10,
              transition: 'transform 0.2s ease',
            }}
          >
            Yes! 💕
          </motion.button>

          {/* NO — flies away on hover / touch / click */}
          <motion.button
            animate={{ x: noPos.x, y: noPos.y }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onMouseEnter={flyNo}
            onTouchStart={flyNo}
            onClick={flyNo}
            style={{
              padding: '14px 28px',
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              position: noClickCount > 0 ? 'absolute' : 'relative',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {currentNoText}
          </motion.button>
        </div>

        {showHint && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#fda4af', fontSize: '0.82rem', marginTop: '1.25rem', fontStyle: 'italic' }}>
            😉 There's only one right answer here... 💕
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 2: CONFETTI SHOWER
───────────────────────────────────────────────────────── */
function Scene2Confetti({ recipientName, onNext }) {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${(i * 29 + 5) % 100}%`,
    delay: `${(i * 0.06).toFixed(2)}s`,
    duration: `${2.5 + (i % 4) * 0.5}s`,
    color: ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#4ade80', '#fb923c', '#fff'][i % 7],
    size: 8 + (i % 5) * 4,
    shape: ['■', '●', '♥', '★', '▲'][i % 5],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 30%, #f8f3eb 0%, #f8f3eb 100%)', position: 'relative', overflow: 'hidden', padding: '2rem' }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div key={c.id} style={{ position: 'absolute', top: 0, left: c.left, fontSize: c.size, color: c.color, animation: `confettiFall ${c.duration} ${c.delay} ease-in forwards`, pointerEvents: 'none' }}>
          {c.shape}
        </div>
      ))}

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse-soft 1.5s ease-in-out infinite' }}>🎉</div>
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 7vw, 3rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          They said YES! 💕
        </h1>
        <p style={{ color: '#fda4af', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Your love story just got even more beautiful, {recipientName}...
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onNext}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          style={{ padding: '15px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 24px rgba(166, 64, 54, 0.96)' }}
        >
          Open your letter 💌
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 3: ENVELOPE OPEN
───────────────────────────────────────────────────────── */
function Scene3Envelope({ onOpen }) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setTimeout(onOpen, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}
    >
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          A letter, sealed with love
        </p>

        {/* Envelope SVG */}
        <div style={{ position: 'relative', width: 220, height: 160, margin: '0 auto 2rem', cursor: 'pointer' }} onClick={!opening ? handleOpen : undefined}>
          {/* Envelope body */}
          <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 24px rgba(244,63,94,0.3))' }}>
            <rect x="1" y="30" width="218" height="129" rx="8" fill="#1a0d12" stroke="#f43f5e" strokeWidth="1.5" />
            <polygon points="1,30 110,100 219,30" fill="#2d1520" />
            {/* Flap */}
            <motion.polygon
              points="1,30 110,100 219,30 219,1 1,1"
              fill="#3d1a28"
              stroke="#f43f5e"
              strokeWidth="1"
              animate={opening ? { rotateX: -180, y: -60, opacity: 0 } : { rotateX: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top center' }}
            />
            {/* Wax seal */}
            {!opening && <circle cx="110" cy="50" r="18" fill="#f43f5e" opacity="0.9" />}
            {!opening && <text x="110" y="55" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="serif">♥</text>}
          </svg>

          {opening && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.8 }}
              animate={{ y: -20, opacity: 1, scale: 1 }}
              style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '3rem' }}
            >
              💌
            </motion.div>
          )}
        </div>

        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Tap the envelope to open ↑
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 4: HANDWRITTEN LETTER
───────────────────────────────────────────────────────── */
function Scene4Letter({ letter, senderName, recipientName, onNext, photos }) {
  const lines = letter ? letter.split('\n').filter(Boolean) : ['From my heart to yours... 💕'];
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const t = setTimeout(() => setVisibleLines((v) => v + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [visibleLines, lines.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 0%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}
    >
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ maxWidth: '420px', width: '100%' }}>
        {/* Parchment paper */}
        <div style={{ background: 'linear-gradient(180deg, #fef9f0 0%, #fdf6e8 100%)', borderRadius: '4px', padding: '2rem', boxShadow: '0 8px 40px rgba(247, 238, 228, 0.96), 0 0 0 1px rgba(255,200,150,0.3)', position: 'relative', minHeight: '280px' }}>
          {/* Ruled lines */}
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ position: 'absolute', left: '2rem', right: '2rem', top: `${3.5 + i * 2}rem`, height: 1, background: 'rgba(120,80,40,0.12)' }} />
          ))}

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '0.9rem', color: '#92400e', margin: 0 }}>Dear {recipientName},</p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', color: '#3b1f0a', lineHeight: 1.8, margin: '0 0 0.25rem' }}>
                {line}
              </motion.p>
            ))}
            {/* Cursor */}
            {!done && (
              <span style={{ display: 'inline-block', width: 2, height: '1.2em', background: '#92400e', animation: 'typewriter-cursor 0.8s infinite', verticalAlign: 'text-bottom', marginLeft: 2 }} />
            )}
          </div>

          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem', color: '#92400e' }}>
                Always yours, {senderName || 'someone who loves you'} ♥
              </p>
            </motion.div>
          )}
        </div>

        {done && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{ width: '100%', marginTop: '1.5rem', padding: '15px', borderRadius: '16px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(166, 64, 54, 0.96)' }}
          >
            📸 See our memories →
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 5: MEMORY PHOTOS
───────────────────────────────────────────────────────── */
function Scene5Photos({ photos, recipientName, onEnd }) {
  const proposalDefaultPhotos = [
    { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop', caption: 'The smile that changed everything' },
    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop', caption: 'Our late night talks & warm chai' },
    { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop', caption: 'Every memory feels like home' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, #f8f3eb 0%, #f8f3eb 100%)',
        padding: '2rem 1.25rem',
      }}
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '1.25rem' }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#f43f5e',
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.25)',
            padding: '5px 14px',
            borderRadius: '999px',
            marginBottom: '0.6rem',
          }}
        >
          📸 Our Love Story
        </span>
        <h2
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2rem, 6vw, 2.8rem)',
            color: '#fff',
            margin: '0 0 0.35rem',
          }}
        >
          Memories With You, {recipientName}
        </h2>
        <p style={{ color: '#fda4af', fontSize: '0.88rem', margin: 0 }}>
          {photos && photos.length > 0 ? 'Every photograph is a piece of my heart 💕' : 'Moments that make forever feel right 💕'}
        </p>
      </motion.div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <PolaroidStack
          photos={photos}
          defaultPhotos={proposalDefaultPhotos}
          accentColor="#f43f5e"
        />
      </div>

      {onEnd && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(244,63,94,0.45)' }}
          whileTap={{ scale: 0.96 }}
          onClick={onEnd}
          id="proposal-final-wrap-btn"
          style={{
            marginTop: '2rem',
            padding: '16px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '1.02rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 30px rgba(244,63,94,0.45)',
          }}
        >
          <span>💍 Share Your Reaction • Always &amp; Forever ♥</span>
        </motion.button>
      )}
    </motion.div>
  );
}
