'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Secret Reveal HUD
 * Shows 3 locked secrets that unlock as the recipient reaches certain chapters.
 */
export default function SecretRevealHUD({
  unlockedCount = 1,
  totalSecrets = 3,
  secrets = ['A Hidden Truth', 'A Sweet Secret', 'The Final Word'],
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '99px',
        background: 'rgba(247, 238, 228, 0.96)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Secrets:
      </span>
      {Array.from({ length: totalSecrets }).map((_, idx) => {
        const isUnlocked = idx < unlockedCount;
        return (
          <motion.div
            key={idx}
            animate={isUnlocked ? { scale: [1, 1.25, 1] } : {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isUnlocked ? '#4ade80' : 'rgba(255,255,255,0.4)',
            }}
          >
            <span>{isUnlocked ? '🔓' : '🔒'}</span>
            <span style={{ fontSize: '0.68rem' }}>#{idx + 1}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
