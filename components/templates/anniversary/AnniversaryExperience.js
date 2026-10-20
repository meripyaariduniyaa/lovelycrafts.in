'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PolaroidStack from '../common/PolaroidStack';



/* ─────────────────────────────────────────────────────────
   ANNIVERSARY EXPERIENCE
   Scenes:
   1. Happy Anniversary celebration
   2. Live countdown timer (years/months/days/hrs/mins/secs)
   3. Journey timeline with events & photos
   4. Heart balloon pop → reveal reasons why I love you
   5. Champagne toast — raise & clink glasses
   6. Envelope + handwritten letter
   7. Love meter rapid-tap → happy ending
───────────────────────────────────────────────────────── */
export default function AnniversaryExperience({ note, isPreview = false, onReachEnd, onGoToReact, reactUrl }) {
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


  const name = note?.recipient_name || 'My Love';
  const senderName = note?.custom_details?.sender_name || '';
  const anniversaryDateStr = note?.custom_details?.anniversary_date || '';
  const firstMetDateStr = note?.custom_details?.first_met_date || '';
  const journey = note?.custom_details?.journey || [];
  const reasons = note?.custom_details?.reasons || [];
  const letter = note?.custom_details?.letter || note?.custom_message || '';
  const rawPhotos = note?.image_urls || note?.images || note?.photos || note?.custom_details?.images || note?.custom_details?.photos || [];
  const photos = (Array.isArray(rawPhotos) ? rawPhotos : []).map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean);

  useEffect(() => {
    if (scene === 8) {
      onReachEnd?.(true, () => setScene(1));
    }
  }, [scene, onReachEnd]);



  const goNext = () => setScene((s) => s + 1);

  return (
    <div style={{ background: '#f8f3eb', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Dancing+Script:wght@600;700&family=Caveat:wght@500;700&display=swap');
        @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes heartFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-14px) rotate(5deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes typewriter-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes champagne-bubble { 0%{transform:translateY(0);opacity:0.6} 100%{transform:translateY(-60px);opacity:0} }
      `}</style>



      <AnimatePresence mode="wait">
        {scene === 1 && <SceneCelebration key="s1" name={name} onNext={goNext} />}
        {scene === 2 && <SceneTimer key="s2" anniversaryDateStr={anniversaryDateStr} firstMetDateStr={firstMetDateStr} name={name} onNext={goNext} />}
        {scene === 3 && <SceneTimeline key="s3" journey={journey} photos={photos} name={name} onNext={goNext} />}
        {scene === 4 && <SceneHeartBalloons key="s4" reasons={reasons} onNext={goNext} />}
        {scene === 5 && <SceneChampagne key="s5" name={name} senderName={senderName} onNext={goNext} />}
        {scene === 6 && <SceneEnvelope key="s6" onOpen={goNext} />}
        {scene === 7 && <SceneLetter key="s7" letter={letter} name={name} senderName={senderName} onNext={goNext} />}
        {scene === 8 && <SceneLoveMeter key="s8" name={name} onEnd={handleFinalEnd} reactUrl={resolvedReactUrl} />}
      </AnimatePresence>
    </div>
  );
}

/* ── SCENE 1: Celebration ── */
function SceneCelebration({ name, onNext }) {
  const confetti = Array.from({ length: 55 }, (_, i) => ({
    id: i, left: `${(i * 23 + 5) % 100}%`, delay: `${(i * 0.05).toFixed(2)}s`,
    dur: `${2 + (i % 5) * 0.4}s`, color: ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#fde68a', '#fff'][i % 6],
    size: 8 + (i % 5) * 4,
  }));

  useEffect(() => { const t = setTimeout(onNext, 4500); return () => clearTimeout(t); }, [onNext]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 40%, #f8f3eb 0%, #f8f3eb 100%)', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
      {confetti.map((c) => (
        <div key={c.id} style={{ position: 'absolute', top: 0, left: c.left, fontSize: c.size, color: c.color, animation: `confettiFall ${c.dur} ${c.delay} ease-in infinite`, pointerEvents: 'none' }}>■</div>
      ))}
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 180 }} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div animate={{ rotate: [-5, 5, -3, 3, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '5rem', marginBottom: '1rem' }}>🥂</motion.div>
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 8vw, 4rem)', color: '#fde68a', margin: '0 0 0.4rem', textShadow: '0 4px 20px rgba(251,191,36,0.4)', lineHeight: 1.15 }}>
          Happy Anniversary
        </h1>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 6vw, 3rem)', background: 'linear-gradient(135deg,#fbbf24,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>
          {name}! 💕
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Here's to every beautiful moment we've shared ✨
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/* ── SCENE 2: Live Timer ── */
function SceneTimer({ anniversaryDateStr, firstMetDateStr, name, onNext }) {
  const [elapsed, setElapsed] = useState(null);

  const calcElapsed = useCallback(() => {
    const dateStr = anniversaryDateStr || firstMetDateStr;
    if (!dateStr) return null;
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) return null;
    const now = new Date();
    const diffMs = now - start;
    if (diffMs < 0) return null;

    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const days = totalDays % 30;
    const months = Math.floor(totalDays / 30) % 12;
    const years = Math.floor(totalDays / 365);

    return { years, months, days, hours, minutes, seconds, totalDays };
  }, [anniversaryDateStr, firstMetDateStr]);

  useEffect(() => {
    setElapsed(calcElapsed());
    const interval = setInterval(() => setElapsed(calcElapsed()), 1000);
    return () => clearInterval(interval);
  }, [calcElapsed]);

  const units = elapsed
    ? [
        { label: 'Years', value: elapsed.years },
        { label: 'Months', value: elapsed.months },
        { label: 'Days', value: elapsed.days },
        { label: 'Hours', value: elapsed.hours },
        { label: 'Minutes', value: elapsed.minutes },
        { label: 'Seconds', value: elapsed.seconds },
      ]
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 30%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}>
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#94a3b8', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        ⏰ Time Together
      </motion.p>
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: '#fde68a', margin: '0 0 1.75rem', textAlign: 'center' }}>
        Every second with you is precious
      </motion.h2>

      {elapsed ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem', maxWidth: '360px', width: '100%', marginBottom: '1.5rem' }}>
            {units.map((u, i) => (
              <motion.div key={u.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '0.9rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter', monospace", fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                  {String(u.value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>{u.label}</div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '2rem' }}>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{elapsed.totalDays?.toLocaleString()} days together</span>, the <span style={{ color: '#fde68a', fontWeight: 700 }}>{elapsed.months + elapsed.years * 12}th month</span> and counting... 🥂
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          💕 Every moment counts — here's to us!
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: elapsed ? 1 : 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={onNext}
        style={{ padding: '14px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
        🗺️ Our Journey Together →
      </motion.button>
    </motion.div>
  );
}

/* ── SCENE 3: Timeline ── */
function SceneTimeline({ journey, photos, name, onNext }) {
  const validEvents = journey.filter((j) => j.date && j.memory);
  if (validEvents.length === 0) { return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', padding: '2rem', flexDirection: 'column', gap: '1.5rem' }}>
    <p style={{ color: '#64748b', textAlign: 'center' }}>Your journey is still being written... 💕</p>
    <button onClick={onNext} style={{ padding: '14px 32px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
  </motion.div>; }

  const [current, setCurrent] = useState(0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}>
      <p style={{ color: '#64748b', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>🗺️ Our Journey</p>

      {/* Timeline */}
      <div style={{ position: 'relative', maxWidth: '380px', width: '100%', marginBottom: '2rem' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#fbbf24,rgba(251,191,36,0.1))' }} />

        {validEvents.map((event, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', paddingLeft: '44px', position: 'relative' }}>
            {/* Dot */}
            <div style={{ position: 'absolute', left: 11, top: 6, width: 20, height: 20, borderRadius: '50%', background: '#fbbf24', border: '3px solid #f8f3eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
              {i === current ? '★' : '●'}
            </div>
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '12px', padding: '0.85rem 1rem', flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{event.date}</div>
              <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{event.memory}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {photos && photos.length > 0 && (
        <div style={{ width: '100%', maxWidth: '380px', marginBottom: '2rem' }}>
          <p style={{ color: '#fbbf24', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center' }}>
            📸 Picture Memories
          </p>
          <PolaroidStack photos={photos} accentColor="#fbbf24" />
        </div>
      )}

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={onNext}
        style={{ padding: '14px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
        ❤️ Why I Love You →
      </motion.button>
    </motion.div>
  );
}

/* ── SCENE 4: Heart Balloons → Reasons ── */
function SceneHeartBalloons({ reasons, onNext }) {
  const [popped, setPopped] = useState(new Set());
  const validReasons = reasons.filter(Boolean);
  if (validReasons.length === 0) {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', padding: '2rem', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>❤️</div>
      <p style={{ color: '#fda4af', textAlign: 'center', fontFamily: "'Dancing Script', cursive", fontSize: '1.3rem' }}>I love you more than words can say 💕</p>
      <button onClick={onNext} style={{ padding: '14px 32px', borderRadius: '50px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
    </motion.div>;
  }

  const allPopped = popped.size >= validReasons.length;
  const colors = ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#4ade80'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 30%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}>
      <p style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>💕 Pop the Hearts!</p>
      <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '2rem' }}>Each heart reveals a reason why I love you</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '360px', marginBottom: '2rem' }}>
        {validReasons.map((reason, i) => (
          <div key={i} style={{ textAlign: 'center', width: '100px' }}>
            <AnimatePresence mode="wait">
              {!popped.has(i) ? (
                <motion.button key="heart" whileHover={{ y: -8, scale: 1.1 }} whileTap={{ scale: 1.3 }}
                  onClick={() => setPopped((p) => new Set([...p, i]))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '3rem', display: 'block', margin: '0 auto', filter: `drop-shadow(0 4px 12px ${colors[i % 5]}66)`, animation: 'heartFloat 2s ease-in-out infinite' }}>
                  ❤️
                </motion.button>
              ) : (
                <motion.div key="reason" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                  style={{ background: `${colors[i % 5]}15`, border: `1.5px solid ${colors[i % 5]}44`, borderRadius: '12px', padding: '10px 8px', fontSize: '0.78rem', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
                  {reason}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {allPopped && (
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={onNext}
          style={{ padding: '14px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
          🥂 Champagne Toast →
        </motion.button>
      )}
    </motion.div>
  );
}

/* ── SCENE 5: Champagne Toast ── */
function SceneChampagne({ name, senderName, onNext }) {
  const [phase, setPhase] = useState(0); // 0: raise, 1: clink, 2: wish

  useEffect(() => {
    if (phase === 1) { const t = setTimeout(() => setPhase(2), 1200); return () => clearTimeout(t); }
  }, [phase]);

  const bubbles = Array.from({ length: 8 }, (_, i) => ({ id: i, left: `${20 + i * 8}%`, delay: `${(i * 0.3).toFixed(1)}s` }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 60%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Champagne glasses */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', position: 'relative' }}>
        {/* Bubbles */}
        {phase >= 1 && bubbles.map((b) => (
          <div key={b.id} style={{ position: 'absolute', bottom: '60%', left: b.left, width: 6, height: 6, borderRadius: '50%', background: '#fde68a', animation: `champagne-bubble 1.5s ${b.delay} ease-in infinite`, opacity: 0 }} />
        ))}

        <motion.div
          animate={phase === 0 ? { y: [20, 0] } : phase === 1 ? { rotate: [0, -15, 0], x: [0, 20, 0] } : {}}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.4))' }}
        >
          🥂
        </motion.div>
        <motion.div
          animate={phase === 1 ? { rotate: [0, 15, 0], x: [0, -20, 0] } : {}}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.4))' }}
        >
          🥂
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center' }}>
        {phase === 0 && (
          <>
            <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: '#fde68a', margin: '0 0 0.5rem' }}>Raise your glass, {name}!</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.75rem', fontSize: '0.9rem' }}>Here's to us and all the beautiful years ahead 💕</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPhase(1)}
              style={{ padding: '15px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(251,191,36,0.3)' }}>
              🥂 Clink!
            </motion.button>
          </>
        )}
        {phase === 1 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontFamily: "'Dancing Script', cursive" }}>Cheers! 🥂✨</h2>
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ color: '#fde68a', fontFamily: "'Dancing Script', cursive", fontSize: '1.3rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              To forever and beyond with you, {name} 💕
            </p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={onNext}
              style={{ padding: '14px 36px', borderRadius: '50px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              💌 Open your letter →
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── SCENE 6: Envelope ── */
function SceneEnvelope({ onOpen }) {
  const [opening, setOpening] = useState(false);
  const handleOpen = () => { setOpening(true); setTimeout(onOpen, 1200); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem' }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        A love letter, sealed with warmth 💌
      </motion.p>
      <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={!opening ? handleOpen : undefined}>
        <motion.div animate={opening ? { scale: [1, 1.2, 0.8], opacity: [1, 1, 0] } : { y: [0, -6, 0] }}
          transition={opening ? { duration: 0.8 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '7rem', display: 'inline-block', filter: 'drop-shadow(0 8px 24px rgba(251,191,36,0.3))' }}>
          {opening ? '💌' : '✉️'}
        </motion.div>
        {!opening && (
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem' }}>
            Tap to open ↑
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

/* ── SCENE 7: Handwritten Letter ── */
function SceneLetter({ letter, name, senderName, onNext }) {
  const lines = letter ? letter.split('\n').filter(Boolean) : ['To the one who makes every day worth it...'];
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
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', padding: '2rem' }}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ background: 'linear-gradient(180deg,#fef9f0,#fdf6e8)', borderRadius: '4px', padding: '1.75rem', boxShadow: '0 8px 40px rgba(247, 238, 228, 0.96)', minHeight: '260px', position: 'relative' }}>
          {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: 'absolute', left: '1.75rem', right: '1.75rem', top: `${3 + i * 1.8}rem`, height: 1, background: 'rgba(120,80,40,0.1)' }} />)}
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: '0.9rem', color: '#92400e', margin: '0 0 0.75rem', position: 'relative' }}>My dearest {name},</p>
          <div style={{ position: 'relative' }}>
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                style={{ fontFamily: "'Caveat', cursive", fontSize: '1.05rem', color: '#3b1f0a', lineHeight: 1.8, margin: '0 0 0.2rem' }}>{line}</motion.p>
            ))}
            {!done && <span style={{ display: 'inline-block', width: 2, height: '1.2em', background: '#92400e', animation: 'typewriter-cursor 0.8s infinite', verticalAlign: 'text-bottom', marginLeft: 2 }} />}
          </div>
          {done && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ fontFamily: "'Caveat', cursive", fontSize: '0.9rem', color: '#92400e', textAlign: 'right', marginTop: '1.5rem' }}>
              With all my love, {senderName || 'your person'} 🥂
            </motion.p>
          )}
        </div>
        {done && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{ width: '100%', marginTop: '1.25rem', padding: '15px', borderRadius: '16px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            ❤️ One Final Activity →
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── SCENE 8: Love Meter Rapid-Tap ── */
function SceneLoveMeter({ name, onEnd }) {
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);
  const MAX_TAPS = 20;
  const progress = Math.min((taps / MAX_TAPS) * 100, 100);

  const handleTap = () => {
    if (done) return;
    setTaps((t) => {
      const next = t + 1;
      if (next >= MAX_TAPS) { setTimeout(() => setDone(true), 300); }
      return next;
    });
  };

  const meterColor = progress < 40 ? '#38bdf8' : progress < 70 ? '#fbbf24' : '#f43f5e';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 40%, #f8f3eb 0%, #f8f3eb 100%)', padding: '2rem', userSelect: 'none' }}>

      {!done ? (
        <>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#94a3b8', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ❤️ Fill the Love Meter!
          </motion.p>
          <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Tap fast to fill it up, {name}!</p>

          {/* Meter */}
          <div style={{ width: '240px', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '999px', height: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <motion.div animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 400 }}
                style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${meterColor}99, ${meterColor})` }} />
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: [1, 1.2, 0.9, 1.1, 1], transition: { duration: 0.2 } }}
            onClick={handleTap}
            style={{ fontSize: '5rem', background: 'none', border: 'none', cursor: 'pointer', filter: `drop-shadow(0 4px 16px ${meterColor}66)` }}
          >
            ❤️
          </motion.button>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.75rem' }}>Tap to fill! {MAX_TAPS - taps} more to go!</p>
        </>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💯❤️</div>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: '#fff', margin: '0 0 0.5rem' }}>
            Full of love for you, {name}!
          </h2>
          <p style={{ color: '#fda4af', fontSize: '1rem', marginBottom: '2rem' }}>Happy Anniversary! Here's to forever 🥂💕</p>
          {onEnd && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onEnd}
              id="anniversary-final-wrap-btn"
              style={{ padding: '16px 40px', borderRadius: '50px', background: 'linear-gradient(135deg,#fbbf24,#92400e)', border: 'none', color: '#fff', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(251,191,36,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>🥂 That&apos;s a wrap! • Share Reaction 💌</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
