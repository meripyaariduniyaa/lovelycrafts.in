'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import { playSfx } from '@/lib/sfx';

/**
 * CraftingCeremony - Unforgettable ceremonial sealing ritual for the creation flow.
 *
 * Props:
 * - template: active template metadata (accentColor, glowColor, title, icon, etc.)
 * - recipientName: recipient's name for personal engraving
 * - noteId: generated keepsake Firestore ID
 * - router: Next.js router instance for preview transition
 */
export default function CraftingCeremony({ template, recipientName, noteId, router }) {
  const [phase, setPhase] = useState(0);

  const cleanRecipient = useMemo(() => {
    return (recipientName || 'Someone Special').trim();
  }, [recipientName]);

  const initial = useMemo(() => {
    return cleanRecipient.charAt(0).toUpperCase() || '♥';
  }, [cleanRecipient]);

  const accentColor = template?.accentColor || '#f43f5e';
  const glowColor = template?.glowColor || 'rgba(244, 63, 94, 0.35)';

  // Multi-phase ceremonial timers with clean teardown
  useEffect(() => {
    // Phase 1 (800ms): 3D envelope folds closed
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 800);

    // Phase 2 (2200ms): Molten wax seal stamps down with playSfx('waxSeal')
    const t2 = setTimeout(() => {
      setPhase(2);
      try {
        playSfx('waxSeal');
      } catch {
        // Safe fallback if audio context not available
      }
    }, 2200);

    // Subtle golden chime just after stamp
    const tChime = setTimeout(() => {
      try {
        playSfx('sparkle');
      } catch {
        // Safe fallback
      }
    }, 2450);

    // Phase 3 (3400ms+): Clean transition to /preview?id=${noteId}
    const t3 = setTimeout(() => {
      setPhase(3);
      if (noteId && router?.push) {
        router.push(`/preview?id=${noteId}`);
      }
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tChime);
      clearTimeout(t3);
    };
  }, [noteId, router]);

  // Ambient floating dust & magic sparkles (20 particles)
  const sparkles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: `${(i * 31) % 94 + 3}%`,
      y: `${(i * 47) % 92 + 4}%`,
      size: 4 + (i % 4) * 3,
      delay: (i * 0.18).toFixed(2),
      duration: 2.8 + (i % 3) * 0.7,
      color: [accentColor, '#ffd700', '#ffffff', '#fb7185', '#fef08a'][i % 5],
    }));
  }, [accentColor]);

  // Golden burst rays for wax seal impact
  const burstParticles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i * (360 / 14) * Math.PI) / 180;
      const distance = 55 + (i % 3) * 25;
      return {
        id: i,
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance,
        scale: 0.6 + (i % 3) * 0.4,
        symbol: ['✦', '✧', '✨', '•'][i % 4],
      };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="status"
      aria-live="polite"
      aria-label="Sealing your keepsake experience"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden px-4 select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #231815 0%, #130d0b 60%, #0a0706 100%)',
      }}
    >
      {/* Dynamic ambient color glow from template */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 blur-3xl transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 48%, ${glowColor} 0%, rgba(0,0,0,0) 65%)`,
        }}
      />

      {/* Floating Sparkles & Embers */}
      {sparkles.map((sp) => (
        <motion.div
          key={sp.id}
          className="pointer-events-none absolute rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.85, 0],
            scale: [0, 1.2, 0],
            y: [-10, -45],
          }}
          transition={{
            duration: sp.duration,
            repeat: Infinity,
            delay: parseFloat(sp.delay),
            ease: 'easeInOut',
          }}
          style={{
            left: sp.x,
            top: sp.y,
            width: sp.size,
            height: sp.size,
            backgroundColor: sp.color,
            boxShadow: `0 0 12px ${sp.color}`,
          }}
        />
      ))}

      {/* Stage: 3D Sealing Ceremony */}
      <div className="relative flex flex-col items-center justify-center max-w-sm w-full mx-auto">
        {/* Subtle ceremonial ring behind envelope */}
        <motion.div
          className="absolute -inset-10 rounded-full pointer-events-none"
          animate={{
            scale: phase >= 2 ? [1, 1.25, 1.1] : [0.95, 1.05, 0.95],
            opacity: phase >= 2 ? [0.4, 0.75, 0.5] : [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
          }}
        />

        {/* 3D Envelope Container with Perspective */}
        <div
          className="relative w-[310px] sm:w-[350px] h-[200px] sm:h-[220px]"
          style={{ perspective: 1200 }}
        >
          {/* Back Paper Liner of Envelope */}
          <div
            className="absolute inset-0 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(175deg, #fbf7ee 0%, #ede3d1 100%)',
              border: '1px solid rgba(225, 205, 175, 0.6)',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(230, 200, 160, 0.15)',
            }}
          />

          {/* Letter Card that slides down inside during Phase 1 */}
          <motion.div
            className="absolute left-4 right-4 h-[175px] rounded-xl p-4 shadow-md flex flex-col justify-between overflow-hidden"
            initial={{ y: -50, scale: 0.96, opacity: 0.95 }}
            animate={{
              y: phase >= 1 ? 16 : -50,
              scale: phase >= 1 ? 0.93 : 0.96,
              opacity: phase >= 1 ? 0.45 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 26,
            }}
            style={{
              background: '#fffdfa',
              border: '1px solid #ebdccb',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 1,
            }}
          >
            {/* Letter Header */}
            <div className="flex items-center justify-between border-b border-amber-100/70 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{template?.icon || '💌'}</span>
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-900/70">
                  {template?.title || 'Lovely Craft'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-800/50 uppercase tracking-widest">
                AIR MAIL
              </span>
            </div>

            {/* Letter Simulated Handwritten Inscription */}
            <div className="space-y-1.5 py-1">
              <div className="text-xs font-serif italic text-amber-950/80 font-medium truncate">
                Dearest {cleanRecipient},
              </div>
              <div className="h-1.5 bg-amber-900/10 rounded w-5/6" />
              <div className="h-1.5 bg-amber-900/10 rounded w-4/6" />
              <div className="h-1.5 bg-amber-900/10 rounded w-3/4" />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-100/60 text-[9px] text-amber-700/60 font-mono tracking-tight">
              <span>A bespoke digital keepsake</span>
              <span>100% PRIVATE</span>
            </div>
          </motion.div>

          {/* Front Envelope Pocket (Left, Right, Bottom fold shadows) */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{ zIndex: 2 }}
          >
            {/* Diagonal fold triangles forming the classic envelope pocket */}
            <svg
              className="w-full h-full"
              viewBox="0 0 350 220"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left triangle */}
              <polygon
                points="0,0 175,125 0,220"
                fill="#f4ece0"
                stroke="#e2d3be"
                strokeWidth="0.75"
              />
              {/* Right triangle */}
              <polygon
                points="350,0 175,125 350,220"
                fill="#efe5d6"
                stroke="#ded0b9"
                strokeWidth="0.75"
              />
              {/* Bottom triangle overlapping */}
              <polygon
                points="0,220 175,108 350,220"
                fill="#faeedd"
                stroke="#dccab1"
                strokeWidth="0.75"
              />
            </svg>

            {/* Air Mail Stamp & Details */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-amber-900/50">
              <span className="flex items-center gap-1 font-semibold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED SEAL
              </span>
              <span className="opacity-70">№ {noteId ? noteId.slice(0, 6).toUpperCase() : 'CRAFT'}</span>
            </div>
          </div>

          {/* 3D Top Flap (folds down in Phase 1) */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[126px] pointer-events-none"
            initial={{ rotateX: -165 }}
            animate={{
              rotateX: phase >= 1 ? 0 : -165,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 24,
              mass: 0.9,
            }}
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              zIndex: phase >= 1 ? 3 : 0,
            }}
          >
            <svg
              className="w-full h-full drop-shadow-md"
              viewBox="0 0 350 126"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top Flap Triangle */}
              <polygon
                points="0,0 350,0 175,126"
                fill={phase >= 1 ? '#f5ede1' : '#ede2d3'}
                stroke="#dfcfb8"
                strokeWidth="0.75"
              />
              {/* Subtle inner ridge */}
              <line
                x1="0"
                y1="0"
                x2="175"
                y2="126"
                stroke="#ffffff"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
              <line
                x1="350"
                y1="0"
                x2="175"
                y2="126"
                stroke="#cfbea4"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
            </svg>
          </motion.div>

          {/* Phase 2: Molten Wax Seal Stamp */}
          <AnimatePresence>
            {phase >= 2 && (
              <div
                className="absolute left-1/2 top-[116px] -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 10 }}
              >
                {/* Molten Wax Underlay Glow */}
                <motion.div
                  className="absolute -inset-4 rounded-full pointer-events-none blur-md"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 0.8 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Golden Sparkle Burst on Impact */}
                {burstParticles.map((b) => (
                  <motion.span
                    key={b.id}
                    className="absolute pointer-events-none text-yellow-300 font-bold select-none"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: b.targetX,
                      y: b.targetY,
                      scale: [0, b.scale, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      fontSize: `${13 * b.scale}px`,
                      textShadow: '0 0 8px #fef08a',
                    }}
                  >
                    {b.symbol}
                  </motion.span>
                ))}

                {/* 3D Wax Seal Body */}
                <motion.div
                  initial={{ scale: 2.4, opacity: 0, y: -45, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 480,
                    damping: 24,
                    mass: 0.85,
                  }}
                  className="relative flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full shadow-2xl cursor-default"
                  style={{
                    backgroundColor: accentColor,
                    backgroundImage: `radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.45) 0%, rgba(0, 0, 0, 0.35) 90%), radial-gradient(circle, ${accentColor} 40%, #580c1f 100%)`,
                    boxShadow: `
                      0 8px 24px rgba(0, 0, 0, 0.55),
                      0 0 25px ${glowColor},
                      inset 0 3px 6px rgba(255, 255, 255, 0.45),
                      inset 0 -4px 8px rgba(0, 0, 0, 0.5)
                    `,
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  {/* Organic irregular scalloped wax edges */}
                  <div
                    className="absolute -inset-1.5 rounded-full pointer-events-none opacity-40 blur-[1px]"
                    style={{
                      border: `3px dashed ${accentColor}`,
                    }}
                  />

                  {/* Inner Debossed Medallion Ring */}
                  <div
                    className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white/30"
                    style={{
                      boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(255, 255, 255, 0.3)',
                      background: 'rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {/* Monogram / Recipient Initial */}
                    <span
                      className="font-serif font-black text-xl sm:text-2xl text-amber-100 select-none"
                      style={{
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.7), 0 -1px 1px rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {initial}
                    </span>
                  </div>

                  {/* Hot Wax Sheen Highlight */}
                  <div className="absolute top-2 left-2.5 w-4 h-2 bg-white/40 rounded-full blur-[1px] transform -rotate-45 pointer-events-none" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Phase Indicator & Ceremonial Text */}
        <div className="mt-9 text-center space-y-2.5 w-full px-2 min-h-[72px]">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="phase-0"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.24 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-center gap-1.5 text-amber-300/90 text-xs font-medium tracking-wide">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ✨
                  </motion.span>
                  <span>Weaving your memories together...</span>
                </div>
                <p className="text-stone-400 text-xs">
                  Preparing an intimate digital keepsake
                </p>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="phase-1"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.24 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-medium tracking-wide">
                  <span>🖋️</span>
                  <span>Inscribing your heartfelt words for {cleanRecipient}...</span>
                </div>
                <p className="text-stone-400 text-xs">
                  Folding your letter with timeless care
                </p>
              </motion.div>
            )}

            {(phase === 2 || phase === 3) && (
              <motion.div
                key="phase-2"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-center gap-2 text-amber-200 text-sm font-semibold tracking-wide">
                  <span>✨</span>
                  <span>Sealed with love...</span>
                  <span>✨</span>
                </div>
                <p className="text-stone-300/80 text-xs">
                  {phase === 3 ? 'Opening your experience...' : 'Your keepsake is ready'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3-Step Pill Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[0, 1, 2].map((step) => {
              const isActive = phase >= step;
              return (
                <div
                  key={step}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? '24px' : '8px',
                    backgroundColor: isActive ? accentColor : 'rgba(255, 255, 255, 0.15)',
                    boxShadow: isActive ? `0 0 10px ${accentColor}` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
