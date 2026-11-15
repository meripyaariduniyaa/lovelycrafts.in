'use client';

import { useState, useEffect, useRef } from 'react';
import ToolResult from './ToolResult';

export default function BirthdayCountdown({ tool }) {
  const [bdate, setBdate] = useState('');
  const [countdown, setCountdown] = useState(null);
  const intervalRef = useRef(null);

  function startCountdown(e) {
    e.preventDefault();
    if (!bdate) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    function tick() {
      const birth = new Date(bdate);
      const now = new Date();
      const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate(), 0, 0, 0);
      if (next.getTime() <= now.getTime()) {
        next.setFullYear(next.getFullYear() + 1);
      }

      const diff = next - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const turningAge = next.getFullYear() - birth.getFullYear();

      setCountdown({
        title: `🎂 Turning ${turningAge}!`,
        text: `${days}d ${hours}h ${minutes}m ${seconds}s until the big day!`,
        details: [
          `📅 Birthday: ${birth.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}`,
          `🎁 Turning: ${turningAge} years young`,
          `⏳ Exact time remaining: ${days} days, ${hours} hours, ${minutes} minutes`,
        ],
        shareText: `Countdown to my birthday: ${days} days and ${hours} hours until I turn ${turningAge}! 🎂🎉`,
        days, hours, minutes, seconds,
      });
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="tool-interactive">
      <form onSubmit={startCountdown} className="tool-form">
        <div className="tool-input-group">
          <label htmlFor="bdate">Select Birth Date (Year & Day)</label>
          <input id="bdate" type="date" value={bdate} onChange={(e) => setBdate(e.target.value)} required />
        </div>
        <button type="submit" className="tool-submit-btn">Start Live Countdown ⏳</button>
      </form>

      {countdown && (
        <div className="tool-countdown-container">
          <div className="tool-countdown-display">
            <div className="tool-countdown-unit"><span className="tool-countdown-num">{countdown.days}</span><span>Days</span></div>
            <div className="tool-countdown-sep">:</div>
            <div className="tool-countdown-unit"><span className="tool-countdown-num">{countdown.hours}</span><span>Hours</span></div>
            <div className="tool-countdown-sep">:</div>
            <div className="tool-countdown-unit"><span className="tool-countdown-num">{countdown.minutes}</span><span>Min</span></div>
            <div className="tool-countdown-sep">:</div>
            <div className="tool-countdown-unit"><span className="tool-countdown-num">{countdown.seconds}</span><span>Sec</span></div>
          </div>
          <ToolResult result={countdown} tool={tool} />
        </div>
      )}
    </div>
  );
}
