'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import { templates } from '@/lib/templates';
import { triggerHaptic } from '@/lib/haptics';

const MOODS = [
  {
    id: 'loved',
    label: 'Deeply Loved',
    icon: '💖',
    subtitle: 'Confessions, proposals & romance that melts their heart.',
    templateIds: ['proposal', 'anniversary'],
  },
  {
    id: 'celebrated',
    label: 'Birthday Joy',
    icon: '🎂',
    subtitle: 'Make them feel like the absolute star of the universe today.',
    templateIds: ['birthday', 'anniversary'],
  },
  {
    id: 'missed',
    label: 'Long Distance Love',
    icon: '🌌',
    subtitle: 'Bridge every kilometer with private tapes and unsent letters.',
    templateIds: ['i-miss-you', 'proposal'],
  },
  {
    id: 'forgiven',
    label: 'Heartfelt Apology',
    icon: '🥺',
    subtitle: 'Give them the space to truly feel how much they mean to you.',
    templateIds: ['emotional-apology'],
  },
  {
    id: 'remembered',
    label: 'Cherished Memories',
    icon: '💌',
    subtitle: 'Celebrate your journey, special dates, and milestone moments.',
    templateIds: ['anniversary', 'i-miss-you'],
  },
];

export default function EmotionFinder() {
  const [selectedMoodId, setSelectedMoodId] = useState('loved');
  const [dynamicPricing, setDynamicPricing] = useState({});

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.pricing) {
          setDynamicPricing(data.pricing);
        }
      })
      .catch(() => {});
  }, []);

  const activeMood = MOODS.find((m) => m.id === selectedMoodId) || MOODS[0];
  const recommendedTemplates = templates.filter((t) => activeMood.templateIds.includes(t.id));

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.95) 0%, rgba(255, 245, 248, 0.9) 50%, rgba(245, 243, 255, 0.95) 100%)',
        border: '1.5px solid rgba(244, 63, 94, 0.16)',
        borderRadius: '28px',
        padding: 'clamp(1.5rem, 4vw, 2.75rem) clamp(1rem, 3vw, 2.5rem)',
        textAlign: 'center',
        boxShadow: '0 18px 45px -12px rgba(225, 29, 72, 0.08)',
      }}
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs font-semibold tracking-wide mb-3">
        <span>Curated for your moment</span>
      </div>

      <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', margin: '4px 0 8px', color: '#0f172a', fontWeight: 600, lineHeight: 1.2 }}>
        What do you want them to feel?
      </h2>

      <p style={{ color: '#64748b', fontSize: 'clamp(0.88rem, 2vw, 1rem)', margin: '0 0 1.5rem', fontWeight: 500 }}>
        Pick a feeling. We’ll curate the most unforgettable digital surprise for you.
      </p>

      {/* Mobile-Friendly Mood Choice Buttons (Smooth horizontal scroll & zero-shift tabs) */}
      <div
        role="tablist"
        aria-label="Filter experiences by emotional mood"
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          padding: '4px 2px 10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          touchAction: 'manipulation',
        }}
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMoodId === mood.id;
          return (
            <motion.button
              key={mood.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setSelectedMoodId(mood.id);
              }}
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
              style={{
                position: 'relative',
                minHeight: '44px',
                border: isSelected ? '2px solid transparent' : '1px solid #fecdd3',
                borderRadius: '999px',
                padding: '8px 18px',
                background: isSelected ? 'transparent' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isSelected ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId="moodFilterIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #a64036 0%, #a64036 100%)',
                    boxShadow: '0 6px 20px rgba(244, 63, 94, 0.3)',
                    border: '2px solid #e11d48',
                    zIndex: 0,
                  }}
                  transition={springs.smooth}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{mood.icon}</span>
                <span>{mood.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Mood Subtitle */}
      <div style={{ marginBottom: '1.5rem', color: '#be185d', fontSize: '0.92rem', fontWeight: 700, fontStyle: 'italic', minHeight: '1.5rem' }}>
        &ldquo;{activeMood.subtitle}&rdquo;
      </div>

      {/* Responsive Cards Grid with Instant Smooth Crossfade and Zero Layout Shift */}
      <div style={{ position: 'relative', minHeight: '280px' }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={selectedMoodId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, position: 'absolute', inset: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {recommendedTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1.5px solid #fce7f3',
                  boxShadow: '0 8px 24px -4px rgba(244, 63, 94, 0.08)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2rem' }}>{template.icon}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: '#fff1f2',
                        color: '#be185d',
                        border: '1px solid #fecdd3',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {template.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                    {template.title}
                  </h3>

                  <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {template.description}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {template.features.slice(0, 3).map((feat, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#475569',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '2px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        ✨ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <Link
                    href={`/create?template=${template.id}`}
                    onClick={() => triggerHaptic('light')}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      padding: '9px 16px',
                      borderRadius: '999px',
                      textDecoration: 'none',
                      boxShadow: '0 3px 10px rgba(244, 63, 94, 0.25)',
                      touchAction: 'manipulation',
                    }}
                  >
                    ✨ Personalize This Experience ➔
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link
          href="/templates"
          className="btn-secondary"
          onClick={() => triggerHaptic('light')}
          style={{
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.65rem 1.5rem',
            fontSize: '0.88rem',
            borderRadius: '999px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontWeight: 800,
            textDecoration: 'none',
            touchAction: 'manipulation',
          }}
        >
          🎁 Explore All {templates.length} Gift Templates ➔
        </Link>
      </div>
    </div>
  );
}
