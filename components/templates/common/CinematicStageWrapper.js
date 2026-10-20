'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleCanvas from './ParticleCanvas';
import SecretRevealHUD from './SecretRevealHUD';

/**
 * Cinematic Stage Wrapper (Full-Screen Immersive Odyssey)
 * Delivers an edge-to-edge, ultra-luxurious, cinematic storytelling canvas with dynamic atmosphere.
 */
export default function CinematicStageWrapper({
  currentStep = 1,
  totalSteps = 7,
  chapterTitle = '',
  particleMode = 'stardust',
  theme = 'romantic', // 'romantic' | 'festive' | 'golden' | 'celestial' | 'somber'
  unlockedSecrets = 1,
  onNext,
  onPrev,
  children,
}) {
  const themes = {
    // 💍 PROPOSAL: Deep Crimson Wine & Rose Velvet
    romantic: {
      bg: 'radial-gradient(ellipse at 50% 20%, #360718 0%, #1a0209 50%, #0c0004 100%)',
      accent: '#f43f5e',
      progressFill: 'linear-gradient(90deg, #fb7185, #f43f5e, #be123c)',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      chapterBadgeColor: '#fda4af',
      chapterBadgeBg: 'rgba(244, 63, 94, 0.12)',
    },
    // 🎂 BIRTHDAY: Electric Midnight Violet & Festive Gold Carnival
    festive: {
      bg: 'radial-gradient(ellipse at 50% 20%, #2f0859 0%, #16042a 50%, #0a0114 100%)',
      accent: '#f59e0b',
      progressFill: 'linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6)',
      glowColor: 'rgba(245, 158, 11, 0.28)',
      chapterBadgeColor: '#fef08a',
      chapterBadgeBg: 'rgba(245, 158, 11, 0.15)',
    },
    birthday: {
      bg: 'radial-gradient(ellipse at 50% 20%, #2f0859 0%, #16042a 50%, #0a0114 100%)',
      accent: '#f59e0b',
      progressFill: 'linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6)',
      glowColor: 'rgba(245, 158, 11, 0.28)',
      chapterBadgeColor: '#fef08a',
      chapterBadgeBg: 'rgba(245, 158, 11, 0.15)',
    },
    // 🥂 ANNIVERSARY: Royal Onyx & 24K Champagne Gold
    golden: {
      bg: 'radial-gradient(ellipse at 50% 20%, #261e12 0%, #120e08 50%, #070503 100%)',
      accent: '#d4af37',
      progressFill: 'linear-gradient(90deg, #fef08a, #d4af37, #b45309)',
      glowColor: 'rgba(212, 175, 55, 0.28)',
      chapterBadgeColor: '#fde047',
      chapterBadgeBg: 'rgba(212, 175, 55, 0.14)',
    },
    vintage_gold: {
      bg: 'radial-gradient(ellipse at 50% 20%, #261e12 0%, #120e08 50%, #070503 100%)',
      accent: '#d4af37',
      progressFill: 'linear-gradient(90deg, #fef08a, #d4af37, #b45309)',
      glowColor: 'rgba(212, 175, 55, 0.28)',
      chapterBadgeColor: '#fde047',
      chapterBadgeBg: 'rgba(212, 175, 55, 0.14)',
    },
    // 🌌 I MISS YOU: Cosmic Starry Navy & Aurora Cyan
    celestial: {
      bg: 'radial-gradient(ellipse at 50% 20%, #0c1a30 0%, #050e1c 50%, #02060d 100%)',
      accent: '#38bdf8',
      progressFill: 'linear-gradient(90deg, #38bdf8, #818cf8, #3b82f6)',
      glowColor: 'rgba(56, 189, 248, 0.28)',
      chapterBadgeColor: '#7dd3fc',
      chapterBadgeBg: 'rgba(56, 189, 248, 0.14)',
    },
    midnight: {
      bg: 'radial-gradient(ellipse at 50% 20%, #0c1a30 0%, #050e1c 50%, #02060d 100%)',
      accent: '#38bdf8',
      progressFill: 'linear-gradient(90deg, #38bdf8, #818cf8, #3b82f6)',
      glowColor: 'rgba(56, 189, 248, 0.28)',
      chapterBadgeColor: '#7dd3fc',
      chapterBadgeBg: 'rgba(56, 189, 248, 0.14)',
    },
    // 🌧️ APOLOGY: Rainy Foggy Slate & Mending Emerald/Teal
    somber: {
      bg: 'radial-gradient(ellipse at 50% 20%, #0f242d 0%, #081318 50%, #03080b 100%)',
      accent: '#2dd4bf',
      progressFill: 'linear-gradient(90deg, #94a3b8, #2dd4bf, #0d9488)',
      glowColor: 'rgba(45, 212, 191, 0.25)',
      chapterBadgeColor: '#5eead4',
      chapterBadgeBg: 'rgba(45, 212, 191, 0.14)',
    },
    rainy_moody: {
      bg: 'radial-gradient(ellipse at 50% 20%, #0f242d 0%, #081318 50%, #03080b 100%)',
      accent: '#2dd4bf',
      progressFill: 'linear-gradient(90deg, #94a3b8, #2dd4bf, #0d9488)',
      glowColor: 'rgba(45, 212, 191, 0.25)',
      chapterBadgeColor: '#5eead4',
      chapterBadgeBg: 'rgba(45, 212, 191, 0.14)',
    },
  };

  const activeTheme = themes[theme] || themes.romantic;
  const progressPercent = Math.min(100, (currentStep / totalSteps) * 100);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: activeTheme.bg,
        color: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0',
      }}
    >
      {/* Background Particle Engine */}
      <ParticleCanvas mode={particleMode} count={45} opacity={0.85} />

      {/* Ambient Atmospheric Light Bleed */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(100vw, 1100px)',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${activeTheme.glowColor} 0%, rgba(0,0,0,0) 70%)`,
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(40px)',
        }}
      />

      {/* Top Floating Cinema HUD */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          padding: '1.25rem 1.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 30,
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(180deg, rgba(247, 238, 228, 0.96) 0%, rgba(247, 238, 228, 0.96) 70%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 'min(96vw, 1000px)', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: activeTheme.chapterBadgeColor,
                background: activeTheme.chapterBadgeBg,
                padding: '4px 14px',
                borderRadius: '999px',
                border: `1px solid ${activeTheme.accent}33`,
              }}
            >
              Chapter {currentStep} of {totalSteps}
            </span>
            {chapterTitle && (
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: `0 0 16px ${activeTheme.glowColor}`,
                }}
              >
                ✦ {chapterTitle} ✦
              </span>
            )}
          </div>

          <SecretRevealHUD unlockedCount={unlockedSecrets || Math.min(3, Math.ceil((currentStep / totalSteps) * 3))} />
        </div>

        {/* Minimalist Progress Indicator */}
        <div
          style={{
            width: 'min(96vw, 1000px)',
            height: '3px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: '100%',
              background: activeTheme.progressFill,
              boxShadow: `0 0 12px ${activeTheme.accent}`,
            }}
          />
        </div>
      </header>

      {/* Main Full-Bleed Cinema Stage */}
      <main
        style={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.99 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
