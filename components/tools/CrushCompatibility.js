'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

function hashNames(a, b) {
  const combined = (a + 'crush' + b).toLowerCase().replace(/\s/g, '');
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100) + 1;
}

const VIBES = [
  'Slow Burn Romance 🔥', 'Instant Spark ⚡', 'Best Friends First 💛',
  'Mystery & Intrigue 🌙', 'Adventure Partners 🌍', 'Soulmate Energy 💜',
];

export default function CrushCompatibility({ tool }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    const pct = hashNames(name1, name2);
    const vibe = VIBES[Math.abs(pct * 7) % VIBES.length];
    setResult({
      percentage: pct,
      title: `${name1.trim()} & ${name2.trim()}`,
      text: `Crush compatibility: ${pct}%`,
      insight: `Your vibe together: ${vibe}`,
      shareText: `${name1.trim()} & ${name2.trim()} — Crush compatibility: ${pct}%! Vibe: ${vibe}`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={calculate} className="tool-form">
        <div className="tool-form-row">
          <div className="tool-input-group">
            <label htmlFor="your-name">Your Name</label>
            <input id="your-name" type="text" placeholder="Your name" value={name1} onChange={(e) => setName1(e.target.value)} maxLength={40} required />
          </div>
          <div className="tool-input-heart">😍</div>
          <div className="tool-input-group">
            <label htmlFor="crush-name">Your Crush</label>
            <input id="crush-name" type="text" placeholder="Crush's name" value={name2} onChange={(e) => setName2(e.target.value)} maxLength={40} required />
          </div>
        </div>
        <button type="submit" className="tool-submit-btn">Check Compatibility 😍</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
