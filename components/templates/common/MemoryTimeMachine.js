'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Memory Time Machine: Horizontal interactive milestone scrubber
 * Stages: The Beginning → First Date → Favorite Memory → Today → Tomorrow
 */
export default function MemoryTimeMachine({ milestones = [], onComplete }) {
  const [activeStep, setActiveStep] = useState(0);

  const defaultMilestones = [
    { title: 'The Beginning', date: 'Day 1', text: 'Where two separate worlds unexpectedly collided.', tag: 'First Hello' },
    { title: 'First Date', date: 'The Spark', text: 'The late-night conversation we never wanted to end.', tag: 'Pure Magic' },
    { title: 'Favorite Memory', date: 'Unforgettable', text: 'Laughing so hard our stomachs hurt in the pouring rain.', tag: 'Core Memory' },
    { title: 'Today', date: 'Here & Now', text: 'Realizing that every road in my life was leading straight to you.', tag: 'Certainty' },
    { title: 'Tomorrow', date: 'Our Forever', text: 'The beginning of every adventure we have yet to live.', tag: 'Future Us' },
  ];

  const items = milestones.length > 0 ? milestones : defaultMilestones;
  const current = items[activeStep];

  const handleNext = () => {
    if (activeStep < items.length - 1) {
      const next = activeStep + 1;
      setActiveStep(next);
      if (next === items.length - 1 && onComplete) onComplete();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      {/* Horizontal Scrubber Track */}
      <div style={{ position: 'relative', margin: '2rem 1rem', padding: '0 10px' }}>
        {/* Track Line */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)', transform: 'translateY(-50%)', zIndex: 1 }} />
        <motion.div
          animate={{ width: `${(activeStep / (items.length - 1)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ position: 'absolute', top: '50%', left: 0, height: '3px', background: 'linear-gradient(90deg, #f43f5e, #fbbf24)', transform: 'translateY(-50%)', zIndex: 2, boxShadow: '0 0 10px #fbbf24' }}
        />

        {/* Milestone Nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
          {items.map((m, idx) => {
            const isPassed = activeStep >= idx;
            const isCurrent = activeStep === idx;
            return (
              <motion.button
                key={idx}
                onClick={() => setActiveStep(idx)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: isCurrent ? '26px' : '16px',
                  height: isCurrent ? '26px' : '16px',
                  borderRadius: '50%',
                  background: isCurrent ? '#fef08a' : isPassed ? '#f43f5e' : '#f8f3eb',
                  border: isCurrent ? '3px solid #f43f5e' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isCurrent ? '0 0 16px #fef08a' : 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                }}
                aria-label={m.title}
              />
            );
          })}
        </div>
      </div>

      {/* Active Milestone Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className="glass-card"
          style={{
            padding: '2rem 1.5rem',
            borderRadius: '24px',
            border: '1.5px solid rgba(251, 191, 36, 0.4)',
            background: 'rgba(247, 238, 228, 0.96)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ✦ {current.tag || `Milestone ${activeStep + 1}`} ✦
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{current.date}</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '2rem', color: '#fff1f2', margin: '0 0 0.5rem' }}>
            {current.title}
          </h3>

          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            {current.text}
          </p>

          {activeStep < items.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              style={{
                padding: '8px 20px',
                borderRadius: '99px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                color: '#fef08a',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Step Forward in Time →
            </motion.button>
          ) : (
            <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 800 }}>
              ✓ All roads brought us right here.
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
