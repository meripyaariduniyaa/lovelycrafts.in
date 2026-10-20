'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSfx } from '@/lib/sfx';
import PolaroidStack from '../common/PolaroidStack';

/**
 * 🌌 I MISS YOU — Celestial Memory Bridge
 * 4 Chapters:
 * 1. Orbital Distance Radar & Trajectory
 * 2. 5 Tactile Cassette Memory Tapes
 * 3. 10,000 km Virtual Hug Transmitter
 * 4. Unsent Letter Across Miles & Polaroids
 */
export default function IMissYouExperience({ note, isPreview = false, onReachEnd, onGoToReact, reactUrl }) {
  const [chapter, setChapter] = useState(1);

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
    onReachEnd?.(true, () => setChapter(1));
  };

  const recipientName = note?.recipient_name || 'My Favorite Person';
  const customDetails = note?.custom_details || {};
  const senderName = customDetails.sender_name || 'From Me';
  const originCity = customDetails.origin_city || 'Mumbai, IN';
  const destinationCity = customDetails.destination_city || 'London, UK';
  const distanceKm = customDetails.distance_km || '7,192 km';
  const timeDifference = customDetails.time_difference || '+4.5 hrs';
  const photos = note?.image_urls || [];
  const letterText = customDetails.letter || note?.custom_message || 'Miles mean nothing when someone means everything to you.';

  const defaultCassettes = [
    { id: 1, title: 'Tape 01: That First Sunset Drive', track: 'Night Vibes', note: 'Rolling down the windows with our playlist on repeat, wishing the red lights lasted longer.' },
    { id: 2, title: 'Tape 02: 3 AM Sleepy Whispers', track: 'Late Night Calls', note: 'When miles felt like zero because we couldn\'t stop laughing at silly inside jokes.' },
    { id: 3, title: 'Tape 03: The Rainy Day Playlist', track: 'Raindrops & Chai', note: 'Sending each other songs when words weren\'t enough. Just hearing your voice makes everything okay.' },
    { id: 4, title: 'Tape 04: The Counting Down', track: 'Terminal 2 Reunion', note: 'Every boarding pass and calendar tick brings us closer to that airport hug.' },
    { id: 5, title: 'Tape 05: Unconditional', track: 'Always My Person', note: 'Miles mean so little when someone means so much. See you sooner than you think.' },
  ];

  const cassettes = customDetails.cassettes && customDetails.cassettes.length > 0 
    ? customDetails.cassettes 
    : defaultCassettes;

  useEffect(() => {
    if (chapter === 4) {
      onReachEnd?.(true, () => setChapter(1));
    }
  }, [chapter, onReachEnd]);

  return (
    <div className="miss-you-viewport">
      <style>{`
        .miss-you-viewport {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 15%, #f8f3eb 0%, #f8f3eb 60%, #f8f3eb 100%);
          color: #57463d;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 20px 16px 80px 16px;
        }

        /* Twinkling Stardust Field */
        .stardust-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          background-image: 
            radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 150px 80px, #cbd5e1, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 90px 180px, #e2e8f0, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 280px 220px, #818cf8, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 320px 90px, #ffffff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 360px 360px;
          opacity: 0.6;
        }

        .experience-container {
          position: relative;
          z-index: 10;
          max-width: 580px;
          margin: 0 auto;
        }

        /* Top Progress Stepper */
        .chapter-stepper {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 24px;
        }

        .chapter-dot {
          height: 4px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.15);
          flex: 1;
          max-width: 60px;
          transition: all 0.3s ease;
        }

        .chapter-dot.active {
          background: linear-gradient(90deg, #818cf8, #c084fc);
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.6);
        }

        /* Glassmorphism Card Style */
        .celestial-card {
          background: rgba(247, 238, 228, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(129, 140, 248, 0.22);
          border-radius: 24px;
          padding: 28px 22px;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.12);
        }

        /* Glowing Action Button */
        .btn-celestial {
          background: linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%);
          color: #43332b;
          border: none;
          border-radius: 999px;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          transition: all 0.2s ease;
          width: 100%;
        }

        .btn-celestial:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(168, 85, 247, 0.5);
        }

        .btn-celestial:active {
          transform: translateY(0);
        }

        /* Audio Visualizer Bars */
        .waveform-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 24px;
          margin-top: 10px;
        }

        .waveform-bar {
          width: 3px;
          border-radius: 3px;
          background: #818cf8;
          animation: wavePulse 1.2s ease-in-out infinite alternate;
        }

        @keyframes wavePulse {
          0% { height: 4px; opacity: 0.3; }
          100% { height: 22px; opacity: 1; }
        }
      `}</style>

      <div className="stardust-bg" />

      <div className="experience-container">
        {/* Progress Stepper */}
        <div className="chapter-stepper">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`chapter-dot ${step <= chapter ? 'active' : ''}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {chapter === 1 && (
            <Chapter1Radar
              key="ch1"
              recipientName={recipientName}
              originCity={originCity}
              destinationCity={destinationCity}
              distanceKm={distanceKm}
              timeDifference={timeDifference}
              onNext={() => {
                playSfx('whoosh');
                setChapter(2);
              }}
            />
          )}

          {chapter === 2 && (
            <Chapter2Cassettes
              key="ch2"
              recipientName={recipientName}
              cassettes={cassettes}
              onNext={() => {
                playSfx('sparkle');
                setChapter(3);
              }}
            />
          )}

          {chapter === 3 && (
            <Chapter3HugTransmitter
              key="ch3"
              recipientName={recipientName}
              senderName={senderName}
              distanceKm={distanceKm}
              onNext={() => {
                playSfx('sparkle');
                setChapter(4);
              }}
            />
          )}

          {chapter === 4 && (
            <Chapter4Letter
              key="ch4"
              recipientName={recipientName}
              senderName={senderName}
              letterText={letterText}
              photos={photos}
              onEnd={handleFinalEnd}
              onGoToReact={handleFinalEnd}
              reactUrl={resolvedReactUrl}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 1: Orbital Distance Radar & Trajectory
───────────────────────────────────────────────────────────── */
function Chapter1Radar({ recipientName, originCity, destinationCity, distanceKm, timeDifference, onNext }) {
  const [odometer, setOdometer] = useState(0);
  const targetKm = parseInt(distanceKm.replace(/[^0-9]/g, '')) || 7192;

  useEffect(() => {
    let start = 0;
    const duration = 1600;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = Math.ceil(targetKm / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetKm) {
        setOdometer(targetKm);
        clearInterval(timer);
      } else {
        setOdometer(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetKm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="celestial-card"
      style={{ textAlign: 'center' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(129, 140, 248, 0.3)', marginBottom: '14px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#c7d2fe', textTransform: 'uppercase' }}>
          Orbital Signal Connected
        </span>
      </div>

      <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px 0', background: 'linear-gradient(135deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Across The Distance
      </h1>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
        For <strong style={{ color: '#e2e8f0' }}>{recipientName}</strong>, wherever you are under this sky.
      </p>

      {/* Flight Radar Visualizer */}
      <div style={{ position: 'relative', padding: '24px 16px', background: 'rgba(247, 238, 228, 0.96)', borderRadius: '18px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origin</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e0e7ff' }}>📍 {originCity}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbcfe8' }}>💫 {destinationCity}</div>
          </div>
        </div>

        {/* Curved Geodesic Arc */}
        <div style={{ position: 'relative', height: '60px', width: '100%', margin: '10px 0' }}>
          <svg viewBox="0 0 300 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              d="M 20 45 Q 150 -15 280 45"
              fill="none"
              stroke="url(#arcGlow)"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            {/* Animated Pulse Satellite */}
            <motion.circle
              r="6"
              fill="#ffffff"
              filter="drop-shadow(0 0 8px #a855f7)"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                offsetPath: "path('M 20 45 Q 150 -15 280 45')",
              }}
            />
          </svg>
        </div>

        {/* Live Distance Meter */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {odometer.toLocaleString()} KM
            </div>
            <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>True Distance</span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
              {timeDifference}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#c084fc' }}>Time Offset</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '22px' }}>
        Different rooms, different coordinates, but looking at the exact same moon tonight.
      </p>

      <button className="btn-celestial" onClick={onNext}>
        <span>Tune Into Our Frequency 📡</span>
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 2: 5 Tactile Cassette Memory Tapes
───────────────────────────────────────────────────────────── */
function Chapter2Cassettes({ recipientName, cassettes, onNext }) {
  const [activeTape, setActiveTape] = useState(0);

  const selectedTape = cassettes[activeTape] || cassettes[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="celestial-card"
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Chapter 02 • Long Distance Audio Log
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 4px 0', color: '#ffffff' }}>
          5 Cassette Memory Tapes 📼
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
          Tap each vintage tape to unlock the memory inside.
        </p>
      </div>

      {/* Cassette Selector Rack */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '18px', scrollbarWidth: 'none' }}>
        {cassettes.map((tape, idx) => {
          const isSelected = activeTape === idx;
          return (
            <button
              key={tape.id || idx}
              onClick={() => {
                playSfx('cassetteClick');
                setActiveTape(idx);
              }}
              style={{
                flex: '0 0 auto',
                padding: '10px 14px',
                borderRadius: '14px',
                border: isSelected ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.25))' : 'rgba(247, 238, 228, 0.96)',
                color: isSelected ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isSelected ? '#c084fc' : '#64748b' }}>
                TAPE 0{idx + 1}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {tape.track || `Memory #${idx + 1}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active 3D Styled Cassette Body */}
      <div style={{
        background: 'linear-gradient(145deg, #f8f3eb, #f8f3eb)',
        borderRadius: '20px',
        border: '2px solid rgba(129, 140, 248, 0.35)',
        padding: '20px',
        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.1), 0 16px 30px rgba(0,0,0,0.5)',
        position: 'relative',
        marginBottom: '22px',
      }}>
        {/* Cassette SVG frame — authentic body graphic */}
        <img
          src="/frames/cassette.svg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            opacity: 0.18,
            pointerEvents: 'none',
            borderRadius: '18px',
          }}
        />
        {/* Top Cassette Label Strip */}
        <div style={{
          background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.82rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <span>SIDE A • HIGH BIAS</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>{selectedTape.title}</span>
        </div>

        {/* Cassette Tape Spools Window */}
        <div style={{
          background: '#f8f3eb',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
        }}>
          {/* Left Spool */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '4px dashed #818cf8',
              background: '#f8f3eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
          </motion.div>

          {/* Magnetic Ribbon Window */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '90px', height: '18px', background: '#f8f3eb', borderRadius: '4px', margin: '0 auto 6px auto' }} />
            <div className="waveform-container">
              {[14, 22, 10, 18, 24, 12, 16, 20].map((h, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>

          {/* Right Spool */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '4px dashed #c084fc',
              background: '#f8f3eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
          </motion.div>
        </div>

        {/* Written Memory Note */}
        <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: '3px solid #818cf8' }}>
          <div style={{ fontSize: '0.74rem', color: '#818cf8', fontWeight: 700, marginBottom: '4px' }}>
            MEMOIRE NOTE:
          </div>
          <p style={{ fontSize: '0.88rem', color: '#e2e8f0', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{selectedTape.note}"
          </p>
        </div>
      </div>

      <button className="btn-celestial" onClick={onNext}>
        <span>Proceed to Hug Transmitter 🫂</span>
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 3: 10,000 km Virtual Hug Transmitter
───────────────────────────────────────────────────────────── */
function Chapter3HugTransmitter({ recipientName, senderName, distanceKm, onNext }) {
  const [charging, setCharging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transmitted, setTransmitted] = useState(false);
  const intervalRef = useRef(null);

  const startCharging = () => {
    if (transmitted) return;
    setCharging(true);
    playSfx('hugPulse');

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setCharging(false);
          setTransmitted(true);
          playSfx('sparkle');
          return 100;
        }
        if (prev % 20 === 0) {
          playSfx('hugPulse');
        }
        return prev + 2.5;
      });
    }, 50);
  };

  const stopCharging = () => {
    if (transmitted) return;
    setCharging(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (progress < 100) {
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="celestial-card"
      style={{ textAlign: 'center' }}
    >
      <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Chapter 03 • Telepathic Signal
      </span>
      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 6px 0', color: '#ffffff' }}>
        Virtual Hug Transmitter 🫂
      </h2>
      <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
        Hold down the button below to charge and transmit a full-body hug across {distanceKm}.
      </p>

      {/* Charging Aura Reactor */}
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulse rings */}
        <motion.div
          animate={{
            scale: charging ? [1, 1.35, 1] : 1,
            opacity: charging ? [0.4, 0.9, 0.4] : 0.2,
          }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(99, 102, 241, 0) 70%)',
          }}
        />

        {/* Center Heart Reactor */}
        <motion.div
          animate={{
            scale: transmitted ? [1, 1.15, 1] : charging ? 1.1 : 1,
          }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: transmitted 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            boxShadow: transmitted
              ? '0 0 40px rgba(16, 185, 129, 0.8)'
              : charging
                ? '0 0 40px rgba(236, 72, 153, 0.8)'
                : '0 0 20px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {transmitted ? '✨' : '🫂'}
        </motion.div>
      </div>

      {/* Charge Meter Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
          <span>Hug Power</span>
          <strong style={{ color: transmitted ? '#34d399' : '#c084fc' }}>{Math.round(progress)}%</strong>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
          <motion.div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: transmitted
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #6366f1, #ec4899)',
              borderRadius: '999px',
            }}
          />
        </div>
      </div>

      {!transmitted ? (
        <button
          className="btn-celestial"
          onPointerDown={startCharging}
          onPointerUp={stopCharging}
          onPointerLeave={stopCharging}
          style={{
            background: charging
              ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
              : 'linear-gradient(135deg, #6366f1, #a855f7)',
            transform: charging ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          <span>{charging ? '⚡ Transmitting Warmth...' : 'Hold to Send Hug Across Miles 🫂'}</span>
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#a7f3d0', fontSize: '0.9rem', marginBottom: '18px' }}>
            🎉 <strong>Hug Transmitted!</strong> Every single kilometer between you and {recipientName} is filled with your warmth right now.
          </div>
          <button className="btn-celestial" onClick={onNext}>
            <span>Open The Unsent Letter 💌</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAPTER 4: Unsent Letter Across Miles & Polaroids
───────────────────────────────────────────────────────────── */
function Chapter4Letter({ recipientName, senderName, letterText, photos, onEnd, onGoToReact, reactUrl }) {
  const [reaction, setReaction] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="celestial-card"
    >
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Final Chapter • The Unsent Letter
        </span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 0 0', color: '#ffffff' }}>
          Written For You 💌
        </h2>
      </div>

      {/* Frosted Glass Letter Paper */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '24px 20px',
        marginBottom: '28px',
        position: 'relative',
      }}>
        {/* Wax Seal photo emblem */}
        <img
          src="/elements/wax-seal-red.jpg"
          alt="Wax seal"
          style={{
            width: 48,
            height: 48,
            objectFit: 'cover',
            borderRadius: '50%',
            boxShadow: '0 0 18px rgba(99, 102, 241, 0.5)',
            margin: '-52px auto 16px auto',
            display: 'block',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        />

        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e0e7ff', marginBottom: '14px' }}>
          Dearest {recipientName},
        </div>

        <div style={{
          fontSize: '0.92rem',
          color: '#cbd5e1',
          lineHeight: 1.8,
          whiteSpace: 'pre-line',
          fontStyle: 'normal',
        }}>
          {letterText}
        </div>

        <div style={{ marginTop: '22px', textAlign: 'right', fontSize: '0.95rem', fontWeight: 700, color: '#fbcfe8' }}>
          Always with you,<br />
          <span style={{ fontSize: '1.1rem', color: '#ffffff' }}>{senderName || 'Me'}</span>
        </div>
      </div>

      {/* Polaroid Memory Stack */}
      {photos && photos.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Memories Across The Distance 📸
            </span>
          </div>
          <PolaroidStack photos={photos} />
        </div>
      )}

      {/* Recipient Reaction Deck */}
      <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
        <span style={{ fontSize: '0.84rem', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>
          How did this make you feel?
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { id: 'hug', label: 'Sending a hug back 🫂' },
            { id: 'counting', label: 'Counting the days ✈️' },
            { id: 'miss', label: 'I miss you more 💫' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                playSfx('sparkle');
                setReaction(btn.id);
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: reaction === btn.id ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                background: reaction === btn.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                color: reaction === btn.id ? '#34d399' : '#e2e8f0',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {reaction && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.84rem', color: '#34d399', marginTop: '12px', fontWeight: 600 }}
          >
            ✨ Your reaction was saved in their heart.
          </motion.p>
        )}

        {/* Primary Wrap & React Button */}
        <div style={{ marginTop: '24px' }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onGoToReact || onEnd}
            id="missyou-final-wrap-btn"
            style={{
              padding: '16px 36px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.98rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <span>💌</span>
            <span>Share Your Reaction Across The Miles</span>
            <span>➔</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
