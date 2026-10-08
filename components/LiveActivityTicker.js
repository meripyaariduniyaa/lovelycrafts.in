'use client';

import { useState, useEffect } from 'react';

const RECENT_ACTIVITIES = [
  { name: 'Ananya S.', city: 'Mumbai', template: 'Virtual Birthday Bash', emoji: '🎂', time: '2 mins ago' },
  { name: 'Rahul & Tanya', city: 'Bengaluru', template: 'The Perfect Proposal', emoji: '💍', time: '5 mins ago' },
  { name: 'Siddharth & Priya', city: 'Delhi', template: 'Anniversary Special', emoji: '🥂', time: '9 mins ago' },
  { name: 'Kavya M.', city: 'Pune', template: 'I Miss You across miles', emoji: '🌌', time: '14 mins ago' },
  { name: 'Vikram D.', city: 'Hyderabad', template: "I'm Sorry", emoji: '🥺', time: '19 mins ago' },
  { name: 'Megha & Rohan', city: 'Kolkata', template: 'The Perfect Proposal', emoji: '💖', time: '26 mins ago' },
];

export default function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
        setFade(true);
      }, 300);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const current = RECENT_ACTIVITIES[index];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #fecdd3',
        borderRadius: '999px',
        padding: '0.35rem 1rem',
        boxShadow: '0 4px 14px rgba(244, 63, 94, 0.08)',
        fontSize: 'clamp(0.75rem, 2vw, 0.84rem)',
        color: '#374151',
        margin: '0 auto 0.4rem',
        maxWidth: '92%',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(-4px)'
      }}
    >
      <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
      <span>{current.emoji}</span>
      <span style={{ fontWeight: 600, color: '#1f2937' }}>
        <strong>{current.name}</strong> from {current.city} crafted <em>{current.template}</em>
      </span>
      <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>• {current.time}</span>
    </div>
  );
}
