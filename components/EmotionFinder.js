'use client';

import { useState } from 'react';
import Link from 'next/link';
import { emotionChoices, recommendEmotionalTemplates } from '@/lib/emotionalTemplates';

export default function EmotionFinder() {
  const [emotion, setEmotion] = useState('loved');
  const recommendations = recommendEmotionalTemplates(emotion);

  function handleEmotionChange(id) {
    setEmotion(id);
  }

  return (
    <section style={{
      margin: '0 0 3rem',
      background: 'linear-gradient(135deg, #fff1f6, #ffffff)',
      border: '1px solid #fbcfe8',
      borderRadius: 'clamp(20px, 4vw, 28px)',
      padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)',
      textAlign: 'center'
    }}>
      <span style={{ color: '#be185d', fontSize: '11px', fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase' }}>
        EMOTION-FIRST GIFTS
      </span>
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', margin: '8px 0', color: '#1f2937', fontWeight: 700 }}>
        What do you want them to feel?
      </h2>
      <p className="text-muted" style={{ fontSize: 'clamp(0.88rem, 2vw, 0.98rem)', margin: '0 0 1rem' }}>
        We’ll help you find the right way to say it.
      </p>

      {/* Emotion Choice Buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: '1.25rem 0'
      }}>
        {emotionChoices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => handleEmotionChange(choice.id)}
            style={{
              border: '1px solid #f9a8d4',
              borderRadius: '999px',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)',
              background: emotion === choice.id ? '#be185d' : '#ffffff',
              color: emotion === choice.id ? '#ffffff' : '#9d174d',
              fontWeight: 700,
              fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
              cursor: 'pointer',
              boxShadow: emotion === choice.id ? '0 4px 10px rgba(190, 24, 93, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {choice.icon} {choice.label}
          </button>
        ))}
      </div>

      <p style={{ fontStyle: 'italic', color: '#831843', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        We know what you&apos;re trying to say.
      </p>

      {/* Responsive Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(145px, 42vw, 220px), 1fr))',
        gap: 'clamp(8px, 2vw, 14px)',
        textAlign: 'left'
      }}>
        {recommendations.map((template) => (
          <Link
            key={template.id}
            href={`/create?template=${template.id}`}
            style={{
              background: '#ffffff',
              color: '#3b0f1b',
              textDecoration: 'none',
              padding: 'clamp(12px, 2.5vw, 16px)',
              borderRadius: '16px',
              border: '1px solid #fce7f3',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease'
            }}
          >
            <div>
              <div style={{ fontSize: 'clamp(20px, 5vw, 26px)', marginBottom: '4px' }}>{template.icon}</div>
              <strong style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: '#1f2937' }}>{template.title}</strong>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '4px 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {template.description}
              </p>
            </div>
            <span style={{ color: '#be185d', fontWeight: 800, fontSize: '0.85rem' }}>
              Create Now →
            </span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/templates" className="btn-secondary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
          Browse all templates ➔
        </Link>
      </div>
    </section>
  );
}
