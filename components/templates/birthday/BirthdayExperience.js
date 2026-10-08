'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PolaroidStack from '../common/PolaroidStack';

/* ─────────────────────────────────────────────────────────
   BIRTHDAY EXPERIENCE
   Scenes:
   1. Splash — throw item at heart → burst
   2. Full-screen Happy Birthday (red bg)
   3. Gold burst → tree grows → heart leaves bloom
   4. Falling heart leaves + name reveal
   5. Video presentation scene (fullscreen bg video + Make a Wish)
   6. Make a wish (shooting star)
   7. Balloon pop reveals (transparent vector SVG balloons)
   8. Memory photos (interactive PolaroidStack with scratch canvas)
   9. Envelope animation
  10. Handwritten letter
  11. Final happy birthday celebration
───────────────────────────────────────────────────────── */
export default function BirthdayExperience({ note, isPreview = false, onReachEnd }) {
  const [scene, setScene] = useState(1);

  const name = note?.recipient_name || 'Birthday Star';
  const senderName = note?.custom_details?.sender_name || '';
  const turningAge = note?.custom_details?.turning_age || '';
  const balloonMessages = note?.custom_details?.balloon_messages || ['Happy Birthday! 🎂', 'You are amazing!', 'So proud of you!'];
  const letter = note?.custom_details?.letter || note?.custom_message || '';
  
  // Defensive photo extraction
  const rawPhotos = note?.image_urls || note?.images || note?.photos || note?.custom_details?.images || note?.custom_details?.photos || [];
  const photos = (Array.isArray(rawPhotos) ? rawPhotos : Object.values(rawPhotos || {}))
    .map((p) => (typeof p === 'string' ? p : p?.url || p?.secure_url || null))
    .filter((u) => typeof u === 'string' && u.trim().length > 0);

  const finalSceneIndex = 11;

  useEffect(() => {
    if (scene === finalSceneIndex) {
      onReachEnd?.(true, () => setScene(1));
    }
  }, [scene, onReachEnd]);

  const goNext = () => setScene((s) => s + 1);

  return (
    <div style={{ background: '#080810', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Dancing+Script:wght@600;700&family=Caveat:wght@500;700&display=swap');
        @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes heartFloat { 0%,100%{transform:translateY(0) rotate(-8deg);opacity:0.8} 50%{transform:translateY(-18px) rotate(8deg);opacity:1} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 50px rgba(251,191,36,0.7)} }
        @keyframes shoot { 0%{transform:translate(0,0) rotate(-45deg);opacity:1} 100%{transform:translate(200px,-200px) rotate(-45deg);opacity:0} }
        @keyframes typewriter-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes leaf-fall { 0%{transform:translateY(-20px) rotate(0) scale(0.5);opacity:0} 20%{opacity:1} 100%{transform:translateY(100vh) rotate(360deg) scale(0.8);opacity:0} }
      `}</style>

      <AnimatePresence mode="wait">
        {scene === 1 && <SceneSplash key="s1" name={name} onNext={goNext} />}
        {scene === 2 && <SceneHBDFull key="s2" name={name} turningAge={turningAge} onNext={goNext} />}
        {scene === 3 && <SceneGoldTree key="s3" name={name} onNext={goNext} />}
        {scene === 4 && <SceneNameReveal key="s4" name={name} turningAge={turningAge} onNext={goNext} />}
        {scene === 5 && <SceneVideo key="s5" name={name} onNext={goNext} />}
        {scene === 6 && <SceneWish key="s6" name={name} onNext={goNext} />}
        {scene === 7 && <SceneBalloons key="s7" messages={balloonMessages} onNext={goNext} />}
        {scene === 8 && <SceneMemories key="s8" photos={photos} name={name} onNext={goNext} />}
        {scene === 9 && <SceneEnvelope key="s9" onOpen={goNext} />}
        {scene === 10 && <SceneLetter key="s10" letter={letter} senderName={senderName} name={name} onNext={goNext} />}
        {scene === 11 && <SceneFinal key="s11" name={name} turningAge={turningAge} onEnd={() => onReachEnd?.(true, () => setScene(1))} />}
      </AnimatePresence>
    </div>
  );
}

/* ── SCENE 1: Interactive SVG Splash — Magic Wand & Glowing Heart ── */
function SceneSplash({ name, onNext }) {
  const [thrown, setThrown] = useState(false);
  const [burst, setBurst] = useState(false);

  const handleThrow = () => {
    if (thrown) return;
    setThrown(true);
    setTimeout(() => {
      setBurst(true);
      setTimeout(onNext, 1200);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #1e0915 0%, #080309 70%, #000000 100%)',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background SVG Bokeh Dots */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}>
        <defs>
          <radialGradient id="bokehGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="20%" cy="25%" r="120" fill="url(#bokehGlow)" />
        <circle cx="80%" cy="70%" r="160" fill="url(#bokehGlow)" />
        <circle cx="50%" cy="85%" r="90" fill="url(#bokehGlow)" />
      </svg>

      <motion.p
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          color: '#fb7185',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
          textShadow: '0 0 12px rgba(244, 63, 94, 0.4)',
        }}
      >
        ✨ Tap to Start Celebration ✨
      </motion.p>

      {/* Target SVG Heart Box */}
      <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <motion.button
          onClick={handleThrow}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4b72" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#f43f5e" floodOpacity="0.6" />
              </filter>
            </defs>
            <path
              d="M50 85 C20 60 5 40 5 25 C5 12 15 3 28 3 C36 3 44 8 50 15 C56 8 64 3 72 3 C85 3 95 12 95 25 C95 40 80 60 50 85 Z"
              fill="url(#heartGrad)"
              filter="url(#heartShadow)"
            />
            <path
              d="M32 12 C24 12 18 17 18 24 C18 28 22 35 30 42"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.button>
      </div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          color: '#cbd5e1',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        Tap the heart for {name} ❤️
      </motion.p>
    </motion.div>
  );
}

/* ── SCENE 2: Full-screen Happy Birthday Banner ── */
function SceneHBDFull({ name, turningAge, onNext }) {
  useEffect(() => {
    const timer = setTimeout(onNext, 4200);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #881337 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{ textAlign: 'center', padding: '2rem' }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(3rem, 10vw, 5.5rem)',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 8px 30px rgba(0,0,0,0.4)',
            lineHeight: 1.1,
          }}
        >
          Happy Birthday
        </h1>
        <h2
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            color: '#fef08a',
            margin: '0.5rem 0 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {name}! ✨
        </h2>
      </motion.div>
    </motion.div>
  );
}

/* ── SCENE 3: Gold Tree grows & leaves bloom ── */
function SceneGoldTree({ name, onNext }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(onNext, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onNext]);

  const leaves = [
    { id: 1, x: 110, y: 70, scale: 1.1, color: '#f43f5e' },
    { id: 2, x: 80, y: 90, scale: 0.9, color: '#fbbf24' },
    { id: 3, x: 140, y: 90, scale: 1, color: '#a855f7' },
    { id: 4, x: 60, y: 120, scale: 0.85, color: '#f472b6' },
    { id: 5, x: 160, y: 120, scale: 0.9, color: '#fb923c' },
    { id: 6, x: 95, y: 110, scale: 1, color: '#38bdf8' },
    { id: 7, x: 125, y: 110, scale: 1.05, color: '#4ade80' },
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
        background: 'radial-gradient(ellipse at 50% 60%, #1c0e03 0%, #080810 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ position: 'relative', width: 280, height: 340 }}>
        <svg viewBox="0 0 220 280" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="goldTrunkGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            <linearGradient id="branchGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.8" />
            </filter>
          </defs>

          <motion.path
            d="M 104 260 L 106 180 Q 106 160 110 150 Q 114 160 114 180 L 116 260 Z"
            fill="url(#goldTrunkGrad)"
            filter="url(#goldGlow)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: phase >= 1 ? 1 : 0 }}
            style={{ transformOrigin: 'bottom center' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />

          <motion.path
            d="M 110 170 Q 80 140 50 100 M 110 170 Q 140 140 170 100 M 110 150 Q 90 120 75 80 M 110 150 Q 130 120 145 80 M 110 185 Q 70 160 40 130 M 110 185 Q 150 160 180 130"
            stroke="url(#branchGrad)"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#goldGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          />

          {phase >= 2 &&
            leaves.map((leaf, i) => (
              <motion.g
                key={leaf.id}
                transform={`translate(${leaf.x}, ${leaf.y}) scale(${leaf.scale})`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: leaf.scale }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 14 }}
              >
                <path
                  d="M0 6 C-3 0, -8 0, -8 4 C-8 8, 0 13, 0 15 C0 13, 8 8, 8 4 C8 0, 3 0, 0 6 Z"
                  fill={leaf.color}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  filter="url(#goldGlow)"
                />
              </motion.g>
            ))}
        </svg>
      </div>

      {phase >= 2 && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            color: '#fde68a',
            fontFamily: "'Dancing Script', cursive",
            fontSize: '1.75rem',
            textAlign: 'center',
            marginTop: '1.25rem',
            textShadow: '0 0 15px rgba(251, 191, 36, 0.6)',
            fontWeight: 700,
          }}
        >
          Blooming with love for you 🌸
        </motion.p>
      )}
    </motion.div>
  );
}

/* ── SCENE 4: Name Reveal ── */
function SceneNameReveal({ name, turningAge, onNext }) {
  useEffect(() => { const t = setTimeout(onNext, 3500); return () => clearTimeout(t); }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #1a1000 0%, #080810 100%)', padding: '2rem' }}
    >
      <div style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: '#fff', margin: '0 0 0.5rem', lineHeight: 1.15 }}
        >
          Happy Birthday,
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2.5rem, 9vw, 5rem)', background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0', lineHeight: 1.1 }}
        >
          {name}! 🎂
        </motion.h2>
        {turningAge && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '1rem' }}>
            You're turning {turningAge} and you're absolutely glowing ✨
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/* ── SCENE 5: SceneVideo — Fullscreen Background Video Presentation ── */
function SceneVideo({ name, onNext }) {
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(videoRef.current.muted);
          })
          .catch((err) => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(e => console.error('Muted autoplay failed:', e));
            }
          });
      }
    }
  }, []);

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        background: '#000000',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Background Fullscreen Video */}
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/vkcgnlm1/video/upload/v1789756064/Site_Assets/bmonvulpkw3gezai1iwk.mp4"
        autoPlay
        playsInline
        loop
        webkit-playsinline="true"
        style={{
          width: '100vw',
          height: '100vh',
          height: '100dvh',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Subtle Overlay Gradient for Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Sound Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#ffffff',
          fontSize: '0.85rem',
          fontWeight: 700,
          padding: '9px 18px',
          borderRadius: '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span>{isMuted ? '🔇 Tap for Sound' : '🔊 Sound On'}</span>
      </button>

      {/* Center Bottom Action Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          textAlign: 'center',
          width: '90%',
          maxWidth: '380px',
        }}
      >
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          style={{
            width: '100%',
            padding: '16px 36px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(244, 63, 94, 0.6), 0 4px 15px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <span>🎂 Make a Wish →</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── SCENE 6: Make a Wish ── */
function SceneWish({ name, onNext }) {
  const [wished, setWished] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 30%, #05051a 0%, #080810 100%)', padding: '2rem', position: 'relative', overflow: 'hidden' }}
    >
      {/* Stars */}
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, width: 2 + (i % 3), height: 2 + (i % 3), borderRadius: '50%', background: '#fff', opacity: 0.3 + (i % 5) * 0.1 }} />
      ))}

      {/* Shooting star */}
      {wished && (
        <motion.div
          initial={{ x: -100, y: 100, opacity: 0 }}
          animate={{ x: 300, y: -150, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ position: 'fixed', fontSize: '1.8rem', zIndex: 10 }}
        >
          ⭐✨
        </motion.div>
      )}

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌠</div>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#fff', margin: '0 0 0.5rem' }}>
          Close your eyes, {name}...
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Make a wish on this shooting star. Whatever you wish for — it's coming true. ✨
        </p>

        {!wished ? (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251,191,36,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setWished(true); setTimeout(onNext, 2200); }}
            style={{ padding: '16px 40px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', border: 'none', color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer' }}
          >
            🌟 Make a Wish!
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <p style={{ color: '#fde68a', fontSize: '1.1rem', fontFamily: "'Dancing Script', cursive" }}>Wish sent to the universe! ✨</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Inline Transparent Vector SVG Balloon Component ── */
function BalloonSVG({ mainColor, width = 80, height = 95 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`balloonGrad-${mainColor.replace('#','')}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.85" />
        </radialGradient>
        <filter id={`balloonShadow-${mainColor.replace('#','')}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor={mainColor} floodOpacity="0.5" />
        </filter>
      </defs>
      {/* String */}
      <path d="M50 88 Q45 100 52 110 T48 120" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Balloon Knot */}
      <polygon points="46,88 54,88 50,83" fill={mainColor} />
      {/* Balloon Body */}
      <ellipse cx="50" cy="46" rx="38" ry="43" fill={`url(#balloonGrad-${mainColor.replace('#','')})`} filter={`url(#balloonShadow-${mainColor.replace('#','')})`} />
      {/* Highlight Sheen */}
      <ellipse cx="36" cy="30" rx="10" ry="16" fill="#ffffff" opacity="0.45" transform="rotate(-25 36 30)" />
    </svg>
  );
}

/* ── SCENE 7: Balloon Pop (Transparent Vector SVG Balloons) ── */
function SceneBalloons({ messages, onNext }) {
  const [popped, setPopped] = useState(new Set());
  const balloonColors = ['#f43f5e', '#f59e0b', '#a855f7', '#06b6d4', '#10b981'];
  const validMessages = messages.filter(Boolean);
  const allPopped = popped.size >= validMessages.length;

  const handlePop = (i) => {
    setPopped((prev) => new Set([...prev, i]));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 40%, #0d051a 0%, #080810 100%)', padding: '2rem' }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <span>🎈</span>
        <span>Pop the Balloons!</span>
      </motion.div>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>Each balloon has a hidden message inside</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', maxWidth: '380px', marginBottom: '2rem' }}>
        {validMessages.map((msg, i) => (
          <div key={i} style={{ textAlign: 'center', width: '100px' }}>
            <AnimatePresence mode="wait">
              {!popped.has(i) ? (
                <motion.button
                  key="balloon"
                  whileHover={{ y: -8, scale: 1.1, rotate: [-2, 2, -2] }}
                  whileTap={{ scale: 1.25 }}
                  onClick={() => handlePop(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0 auto' }}
                >
                  <BalloonSVG mainColor={balloonColors[i % 5]} />
                </motion.button>
              ) : (
                <motion.div
                  key="message"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  style={{ background: `${balloonColors[i % 5]}20`, border: `1.5px solid ${balloonColors[i % 5]}55`, borderRadius: '12px', padding: '10px 8px', fontSize: '0.78rem', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}
                >
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {allPopped && (
          <motion.button
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onNext}
            style={{ padding: '15px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            📸 See our memories →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── SCENE 8: Memories ── */
function SceneMemories({ photos, name, onNext }) {
  const birthdayDefaultPhotos = [
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop', caption: 'Celebrating your brightest smiles ✨' },
    { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop', caption: 'Another year of laughs & memories 🎂' },
    { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop', caption: 'So grateful to celebrate you! 🥳' },
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
        background: 'radial-gradient(ellipse at 50% 35%, #1a1005 0%, #080810 100%)',
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
            color: '#fbbf24',
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.25)',
            padding: '5px 14px',
            borderRadius: '999px',
            marginBottom: '0.6rem',
          }}
        >
          📸 Birthday Memories
        </span>
        <h2
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2rem, 6vw, 2.8rem)',
            color: '#fff',
            margin: '0 0 0.35rem',
          }}
        >
          Moments With You, {name}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          {photos && photos.length > 0 ? 'Cherished snaps collected with love 💫' : 'Memories that make every year brighter 💫'}
        </p>
      </motion.div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <PolaroidStack
          photos={photos}
          defaultPhotos={birthdayDefaultPhotos}
          accentColor="#f59e0b"
        />
      </div>

      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(245,158,11,0.4)' }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        style={{
          marginTop: '2rem',
          padding: '14px 32px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
        }}
      >
        <span>💌 Open Birthday Letter</span>
        <span>→</span>
      </motion.button>
    </motion.div>
  );
}

/* ── SCENE 9: Envelope ── */
function SceneEnvelope({ onOpen }) {
  const [opening, setOpening] = useState(false);
  const handleOpen = () => { setOpening(true); setTimeout(onOpen, 1200); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #1a0a00 0%, #080810 100%)', padding: '2rem' }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        A special letter for you 💌
      </motion.p>
      <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={!opening ? handleOpen : undefined}>
        <motion.div animate={opening ? { scale: [1, 1.2, 0.8], opacity: [1, 1, 0] } : { y: [0, -6, 0] }} transition={opening ? { duration: 0.8 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '7rem', display: 'inline-block' }}>
          {opening ? '💌' : '✉️'}
        </motion.div>
        {!opening && (
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem' }}>
            Tap to open your letter ↑
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/* ── SCENE 10: Letter ── */
function SceneLetter({ letter, senderName, name, onNext }) {
  const lines = letter ? letter.split('\n').filter(Boolean) : [`Happy Birthday ${name}! 🎂`];
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const t = setTimeout(() => setVisibleLines((v) => v + 1), 850);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(t);
    }
  }, [visibleLines, lines.length]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', padding: '2rem' }}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ background: 'linear-gradient(180deg,#fef9f0,#fdf6e8)', borderRadius: '4px', padding: '1.75rem', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', minHeight: '260px', position: 'relative' }}>
          {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: 'absolute', left: '1.75rem', right: '1.75rem', top: `${3 + i * 1.8}rem`, height: 1, background: 'rgba(120,80,40,0.1)' }} />)}
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: '0.9rem', color: '#92400e', margin: '0 0 0.75rem', position: 'relative' }}>Happy Birthday, {name}!</p>
          <div style={{ position: 'relative' }}>
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                style={{ fontFamily: "'Caveat', cursive", fontSize: '1.05rem', color: '#3b1f0a', lineHeight: 1.8, margin: '0 0 0.2rem' }}>{line}</motion.p>
            ))}
            {!done && <span style={{ display: 'inline-block', width: 2, height: '1.2em', background: '#92400e', animation: 'typewriter-cursor 0.8s infinite', verticalAlign: 'text-bottom', marginLeft: 2 }} />}
          </div>
          {done && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ fontFamily: "'Caveat', cursive", fontSize: '0.9rem', color: '#92400e', textAlign: 'right', marginTop: '1rem' }}>
              With birthday love, {senderName || 'someone who cares'} 🎂
            </motion.p>
          )}
        </div>
        {done && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{ width: '100%', marginTop: '1.25rem', padding: '15px', borderRadius: '16px', background: 'linear-gradient(135deg,#f59e0b,#b45309)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            🎉 One Last Surprise →
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── SCENE FINAL: Happy Birthday again ── */
function SceneFinal({ name, turningAge, onEnd }) {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i, left: `${(i * 23 + 3) % 100}%`, delay: `${(i * 0.05).toFixed(2)}s`,
    dur: `${2 + (i % 5) * 0.4}s`, color: ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#4ade80', '#fff'][i % 6],
    size: 8 + (i % 5) * 4,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 40%, #1a1000 0%, #080810 100%)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {confetti.map((c) => (
        <div key={c.id} style={{ position: 'absolute', top: 0, left: c.left, fontSize: c.size, color: c.color, animation: `confettiFall ${c.dur} ${c.delay} ease-in infinite`, pointerEvents: 'none' }}>
          {['■', '●', '★'][c.id % 3]}
        </div>
      ))}
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎊</div>
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#fde68a', margin: '0 0 0.5rem', textShadow: '0 4px 20px rgba(251,191,36,0.5)' }}>
          Happy Birthday, {name}! 🎂
        </h1>
        {turningAge && (
          <p style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '2rem' }}>Cheers to {turningAge} years of being absolutely wonderful! 🥳</p>
        )}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '1rem', color: '#94a3b8' }}>
          May your WiFi be strong and your coffee be hot ☕📶
        </motion.div>
        {onEnd && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onEnd}
            style={{ padding: '15px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#f59e0b,#b45309)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            🎂 That's a wrap! ✨
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
