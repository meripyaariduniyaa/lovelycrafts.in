'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const MILESTONES = [
  [1, 'Paper 📜'], [2, 'Cotton 🧵'], [3, 'Leather 👞'], [4, 'Fruit/Flowers 💐'],
  [5, 'Wood 🪵'], [10, 'Tin / Aluminum 🥫'], [15, 'Crystal 🔮'], [20, 'China ☕'],
  [25, 'Silver 🥈'], [30, 'Pearl 🦪'], [40, 'Ruby 💍'], [50, 'Gold 👑'], [60, 'Diamond 💎'],
];

export default function AnniversaryCalculator({ tool }) {
  const [date, setDate] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    if (!date) return;
    const start = new Date(date);
    const now = new Date();
    if (start > now) return;

    const diffMs = now - start;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const nextAnniv = new Date(now.getFullYear(), start.getMonth(), start.getDate());
    if (nextAnniv < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      nextAnniv.setFullYear(nextAnniv.getFullYear() + 1);
    }
    const daysUntilNext = Math.ceil((nextAnniv - now) / (1000 * 60 * 60 * 24));
    const nextYearNum = nextAnniv.getFullYear() - start.getFullYear();
    const milestone = MILESTONES.find(([y]) => y === nextYearNum);

    setResult({
      title: `${years} Years of Love 💕`,
      text: `${years} years, ${months} months, and ${days} days together!`,
      details: [
        `💖 Total days together: ${totalDays.toLocaleString()} days`,
        `📆 Total weeks together: ${totalWeeks.toLocaleString()} weeks`,
        `🥂 Next anniversary (#${nextYearNum}): in ${daysUntilNext} day${daysUntilNext === 1 ? '' : 's'}`,
        milestone ? `🏆 Upcoming traditional theme: ${milestone[1]} (Year ${milestone[0]})` : null,
      ].filter(Boolean),
      insight: totalDays > 365 ? `${totalDays.toLocaleString()} days of creating unforgettable memories together. Here's to forever! 🥂` : `The beautiful beginning of forever. ${totalDays} days in! 💖`,
      shareText: `We have been together for ${years} years, ${months} months, and ${days} days (${totalDays.toLocaleString()} days of love)! 💍 Next anniversary in ${daysUntilNext} days!`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={calculate} className="tool-form">
        <div className="tool-input-group">
          <label htmlFor="anniv-date">When did your journey begin?</label>
          <input id="anniv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
        </div>
        <button type="submit" className="tool-submit-btn">Calculate Anniversary 💍</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
