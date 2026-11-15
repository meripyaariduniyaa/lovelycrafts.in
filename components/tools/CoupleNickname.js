'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

function generateNicknames(a, b) {
  const n1 = a.trim();
  const n2 = b.trim();
  const results = [];

  const mid1 = Math.ceil(n1.length / 2);
  const mid2 = Math.ceil(n2.length / 2);
  results.push(`${n1.slice(0, mid1)}${n2.slice(mid2)} (Portmanteau Ship)`);
  results.push(`${n2.slice(0, mid2)}${n1.slice(mid1)} (Alternate Ship)`);

  const cutePrefixes = ['Honey', 'Sweet', 'Cuddle', 'Sugar', 'Butter', 'Star'];
  const p = cutePrefixes[Math.abs(n1.charCodeAt(0) + n2.charCodeAt(0)) % cutePrefixes.length];
  results.push(`${p} duo: ${p}${n1.charAt(0)} & ${p}${n2.charAt(0)} 💕`);

  results.push(`Team ${n1.charAt(0)}${n2.charAt(0)} ✨`.toUpperCase());
  results.push(`${n1} & ${n2} Together Forever ♾️`);

  const royals = [
    ['King', 'Queen'], ['Prince', 'Princess'], ['Captain', 'First Mate'], ['Sun', 'Moon']
  ];
  const pair = royals[Math.abs(n1.length + n2.length) % royals.length];
  results.push(`${pair[0]} ${n1} & ${pair[1]} ${n2} 👑`);

  return results;
}

export default function CoupleNickname({ tool }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);

  function generate(e) {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    const nicknames = generateNicknames(name1, name2);
    setResult({
      title: `Couple Nicknames for ${name1.trim()} & ${name2.trim()} 💕`,
      items: nicknames,
      insight: 'Pick your favorite name and use it in your next surprise note or private contact name!',
      shareText: `Our couple nickname ideas: ${nicknames.slice(0, 3).join(', ')}! 💕`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={generate} className="tool-form">
        <div className="tool-form-row">
          <div className="tool-input-group">
            <label htmlFor="cn-name1">First Name</label>
            <input id="cn-name1" type="text" placeholder="Your name" value={name1} onChange={(e) => setName1(e.target.value)} maxLength={30} required />
          </div>
          <div className="tool-input-heart">💕</div>
          <div className="tool-input-group">
            <label htmlFor="cn-name2">Partner's Name</label>
            <input id="cn-name2" type="text" placeholder="Partner's name" value={name2} onChange={(e) => setName2(e.target.value)} maxLength={30} required />
          </div>
        </div>
        <button type="submit" className="tool-submit-btn">Generate Nicknames 👩‍❤️‍👨</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
