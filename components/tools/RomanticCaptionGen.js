'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const CAPTIONS = {
  couple_cute: [
    "You're my favorite notification. 💕📱",
    "Home is wherever I'm with you. 🏠❤️",
    "You make my heart skip a WiFi signal. 📶💖",
    "Together is my absolute favorite place to be. 👫✨",
    "You + Me = ♾️",
    "I like me a whole lot better when I'm with you. 🥰",
    "Proof that angels exist and somehow put up with me. 😇💕",
  ],
  couple_deep: [
    "In a world full of temporary things, you are a perpetual feeling. 💫",
    "I didn't choose you. My heart simply recognized you. 💖",
    "Some souls just understand each other upon meeting. ✨",
    "You are the poem I never knew how to write. 📝💕",
    "The best thing to hold onto in this life is each other. 🤝❤️",
    "Loving you is quiet, deep, and without an ending. 🌊",
  ],
  anniversary_romantic: [
    "Still falling for you, one gorgeous year at a time. 🥂💕",
    "Every love story is beautiful, but ours is my favorite chapter. 📖❤️",
    "Another 365 days of us, and I'd choose you in every lifetime. 💍✨",
    "Then. Now. Always. 🕰️💖",
    "Thank you for being my today and all of my tomorrows. 🌅💕",
  ],
  datenight_fun: [
    "Date night with my favorite human on earth. 🍝🥂",
    "Swiping right was the single best decision of my life. 💘📱",
    "We go together like late nights and deep talks. ☕🌙",
    "Currently accepting applications for... wait, position permanently filled. 😘",
    "Two peas in an exceptionally cute pod. 🫛💕",
  ],
  missing_emotional: [
    "Distance means so little when someone means so much. 🌍💕",
    "I carry your heart with me (I carry it in my heart). 💖",
    "Miles apart on the map, but zero distance in my thoughts. 📍❤️",
    "The hardest part of my day is having to pretend I don't miss you every second. 🥺",
    "Counting down every minute until I can hug you for real. ✈️💕",
  ],
};

const MOODS = [
  { id: 'couple_cute', label: 'Cute Couple 🥰' },
  { id: 'couple_deep', label: 'Deep & Poetic 📝' },
  { id: 'anniversary_romantic', label: 'Anniversary 🥂' },
  { id: 'datenight_fun', label: 'Date Night 🍝' },
  { id: 'missing_emotional', label: 'Missing Them (LDR) 🥺' },
];

export default function RomanticCaptionGen({ tool }) {
  const [mood, setMood] = useState('');
  const [result, setResult] = useState(null);

  function generate(e) {
    e.preventDefault();
    if (!mood) return;
    const pool = CAPTIONS[mood] || CAPTIONS.couple_cute;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);
    setResult({
      title: 'Romantic Instagram Captions 📸',
      items: picks,
      insight: 'Click copy or share below to add it directly to your next Instagram post or story!',
      shareText: picks[0],
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={generate} className="tool-form">
        <div className="tool-input-group">
          <label>Select Your Mood / Occasion</label>
          <div className="tool-chip-row">
            {MOODS.map((m) => (
              <button key={m.id} type="button" className={`tool-chip ${mood === m.id ? 'active' : ''}`} onClick={() => setMood(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="tool-submit-btn" disabled={!mood}>
          Generate Captions 📸
        </button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
      {result && (
        <button type="button" className="tool-reset-btn" onClick={generate}>
          🔄 Get 3 More Captions
        </button>
      )}
    </div>
  );
}
