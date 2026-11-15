'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

function hashNames(a, b) {
  const combined = (a + b).toLowerCase().replace(/\s/g, '');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100) + 1;
}

function getInsight(pct) {
  if (pct >= 90) return 'You two are a match made in heaven! The stars align perfectly. 🌟';
  if (pct >= 75) return 'Strong connection! You complement each other beautifully. 💖';
  if (pct >= 60) return "There's real chemistry here — nurture it and watch it grow. 🌹";
  if (pct >= 40) return 'You have potential! Every great love story starts somewhere. ✨';
  if (pct >= 20) return 'Opposites attract! Your differences could make things exciting. 🔥';
  return "Love works in mysterious ways — don't give up! 💫";
}

export default function LoveCalculator({ tool }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    const pct = hashNames(name1, name2);
    setResult({
      percentage: pct,
      title: `${name1.trim()} ❤️ ${name2.trim()}`,
      text: `Your love compatibility is ${pct}%!`,
      insight: getInsight(pct),
      shareText: `${name1.trim()} ❤️ ${name2.trim()} — Love compatibility: ${pct}%! ${getInsight(pct)}`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={calculate} className="tool-form">
        <div className="tool-form-row">
          <div className="tool-input-group">
            <label htmlFor="name1">Your Name</label>
            <input id="name1" type="text" placeholder="Enter your name" value={name1} onChange={(e) => setName1(e.target.value)} maxLength={40} required />
          </div>
          <div className="tool-input-heart">❤️</div>
          <div className="tool-input-group">
            <label htmlFor="name2">Their Name</label>
            <input id="name2" type="text" placeholder="Enter their name" value={name2} onChange={(e) => setName2(e.target.value)} maxLength={40} required />
          </div>
        </div>
        <button type="submit" className="tool-submit-btn">Calculate Love 💕</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
