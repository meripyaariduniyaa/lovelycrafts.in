'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

function hashNames(a, b) {
  const combined = (a + 'lovesmore' + b).toLowerCase().replace(/\s/g, '');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 7) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function WhoLovesMore({ tool }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    const hash = hashNames(name1, name2);
    const score1 = (hash % 41) + 60;
    const score2 = ((hash >> 8) % 41) + 60;
    const n1 = name1.trim();
    const n2 = name2.trim();
    const diff = Math.abs(score1 - score2);
    const winner = score1 >= score2 ? n1 : n2;

    let verdict;
    if (diff < 4) {
      verdict = "It's an exact, rare soulmate tie! You both love each other to the ends of the universe. 💕";
    } else if (diff < 14) {
      verdict = `${winner} edges ahead with just a little extra affection — but honestly, you're both hopelessly smitten! 🥰`;
    } else {
      verdict = `${winner} is unconditionally head over heels! The love meter has completely overflowed! 💘👑`;
    }

    setResult({
      title: `${n1} vs ${n2} ⚖️`,
      text: verdict,
      details: [
        `💖 ${n1}'s love score: ${score1}%`,
        `💖 ${n2}'s love score: ${score2}%`,
      ],
      insight: score1 === score2 ? "Absolute harmony! A rare 50/50 balance of affection. 🌟" : `${winner} takes the golden crown today! 👑`,
      shareText: `Who loves more? ${n1} (${score1}%) vs ${n2} (${score2}%) — ${verdict}`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={calculate} className="tool-form">
        <div className="tool-form-row">
          <div className="tool-input-group">
            <label htmlFor="wlm-name1">First Partner</label>
            <input id="wlm-name1" type="text" placeholder="Name 1" value={name1} onChange={(e) => setName1(e.target.value)} maxLength={40} required />
          </div>
          <div className="tool-input-heart">⚖️</div>
          <div className="tool-input-group">
            <label htmlFor="wlm-name2">Second Partner</label>
            <input id="wlm-name2" type="text" placeholder="Name 2" value={name2} onChange={(e) => setName2(e.target.value)} maxLength={40} required />
          </div>
        </div>
        <button type="submit" className="tool-submit-btn">Who Loves More? ⚖️</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
