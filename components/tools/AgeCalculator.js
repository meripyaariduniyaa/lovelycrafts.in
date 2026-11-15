'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

export default function AgeCalculator({ tool }) {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);

  function calculate(e) {
    e.preventDefault();
    if (!dob) return;
    const birth = new Date(dob);
    const now = new Date();
    if (birth > now) return;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    const daysUntilNext = getDaysUntilBirthday(birth);

    setResult({
      title: `You are ${years} years old 🎂`,
      text: `${years} years, ${months} months, and ${days} days`,
      details: [
        `📅 Total days lived: ${totalDays.toLocaleString()}`,
        `📆 Total weeks: ${totalWeeks.toLocaleString()}`,
        `🗓️ Total months: ${totalMonths}`,
        `🎉 Next birthday in: ${daysUntilNext} day${daysUntilNext === 1 ? '' : 's'}`,
      ],
      insight: `You have breathed through ${totalDays.toLocaleString()} magnificent sunrises! Celebrate every single one.`,
      shareText: `I am ${years} years, ${months} months, and ${days} days old (${totalDays.toLocaleString()} days alive)! 🎂 Next birthday in ${daysUntilNext} days!`,
    });
  }

  function getDaysUntilBirthday(birth) {
    const now = new Date();
    const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      next.setFullYear(next.getFullYear() + 1);
    }
    return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={calculate} className="tool-form">
        <div className="tool-input-group">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
        </div>
        <button type="submit" className="tool-submit-btn">Calculate Age 🎂</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
