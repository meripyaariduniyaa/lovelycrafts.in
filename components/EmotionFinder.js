'use client';

import { useState } from 'react';
import Link from 'next/link';
import { templates } from '@/lib/templates';

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
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-black uppercase tracking-wider mb-3">
        <span>✨ Emotion-First Gift Engine</span>
      </div>

      <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', margin: '4px 0 8px', color: '#0f172a', fontWeight: 900, lineHeight: 1.2 }}>
        What do you want them to feel?
      </h2>

      <p style={{ color: '#64748b', fontSize: 'clamp(0.88rem, 2vw, 1rem)', margin: '0 0 1.5rem', fontWeight: 500 }}>
        Pick a feeling. We’ll curate the most unforgettable digital surprise for you.
      </p>

      {/* Mood Choice Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '1.75rem',
        }}
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMoodId === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMoodId(mood.id)}
              style={{
                border: isSelected ? '2px solid #e11d48' : '1px solid #fecdd3',
                borderRadius: '999px',
                padding: '8px 18px',
                background: isSelected ? 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 6px 20px rgba(244, 63, 94, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Mood Subtitle */}
      <div style={{ marginBottom: '1.5rem', color: '#be185d', fontSize: '0.92rem', fontWeight: 700, fontStyle: 'italic' }}>
        &ldquo;{activeMood.subtitle}&rdquo;
      </div>

      {/* Responsive Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          textAlign: 'left',
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>₹{template.price}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>
                  ₹{template.basePrice}
                </span>
              </div>

              <Link
                href={`/create?template=${template.id}`}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  boxShadow: '0 3px 10px rgba(244, 63, 94, 0.25)',
                }}
              >
                Personalize Now →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link
          href="/templates"
          className="btn-secondary"
          style={{
            padding: '0.65rem 1.5rem',
            fontSize: '0.88rem',
            borderRadius: '999px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          🎁 Explore All {templates.length} Gift Templates ➔
        </Link>
      </div>
    </div>
  );
}
