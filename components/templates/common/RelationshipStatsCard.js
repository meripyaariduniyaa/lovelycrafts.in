'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Relationship Stats Card
 * Displays humorous and sentimental relationship metrics.
 */
export default function RelationshipStatsCard({ stats = [] }) {
  const defaultStats = [
    { label: 'Arguments Won by You', value: '99.9%', accent: '#4ade80' },
    { label: 'Food & Fries Stolen', value: '84%', accent: '#f43f5e' },
    { label: 'Photos Taken Before 1 is Chosen', value: '47 shots', accent: '#38bdf8' },
    { label: 'Inside Jokes & Weird Voices', value: 'Classified 🤫', accent: '#fbbf24' },
    { label: '3 AM Sleepy Phone Calls', value: '418 hrs', accent: '#c084fc' },
    { label: 'Times I Would Choose You Again', value: 'Infinite ∞', accent: '#f43f5e' },
  ];

  const items = stats.length > 0 ? stats : defaultStats;

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {items.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ scale: 1.03, y: -2 }}
            style={{
              background: 'rgba(247, 238, 228, 0.96)',
              borderRadius: '20px',
              padding: '16px 14px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)',
                fontWeight: 900,
                color: s.accent || '#fef08a',
                display: 'block',
                fontFamily: 'monospace',
                marginBottom: '4px',
              }}
            >
              {s.value}
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#cbd5e1',
                fontWeight: 600,
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
