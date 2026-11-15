'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const WISHES = {
  bestfriend: {
    funny: [
      "Happy Birthday! You're not old, you're just vintage. Like fine wine... except wine gets quieter with age! 🍷😂",
      "Happy Birthday to my partner-in-crime! Remember, if anyone asks, we were both at the library. 🚔🤫",
      "Another year of me graciously blessing your life with my presence. You're welcome! Happy Birthday bestie! 💅✨",
    ],
    heartfelt: [
      "To the one who has seen my brightest days and held me on my darkest: thank you for being you. Happy Birthday, my ride-or-die! 💖",
      "Life is a million times brighter and louder with you around. Wishing you endless laughter and success this year! 🌟",
      "A true friend knows the song in your heart and sings it back when you forget the words. Happy Birthday, bestie! 💛",
    ],
    emotional: [
      "I don't say this nearly enough, but having you in my corner is one of the greatest blessings of my life. Happy Birthday, always. 🥹",
      "Through every phase, distance, and heartbreak, you stood solid. Today we celebrate the wonderful soul you are. Happy Birthday! 💕",
    ],
  },
  partner: {
    funny: [
      "Happy Birthday to the love of my life, the stealer of all my hoodies and blankets! 😘🛌",
      "Another year of pretending that you're the funny one in this relationship. Happy Birthday sweetheart! 😂💕",
      "Happy Birthday! I love you even when you're deciding where to eat for 45 minutes straight. 🍕❤️",
    ],
    heartfelt: [
      "Every single room lights up when you smile, but my whole world lit up the day you walked into it. Happy Birthday, my love! 🌹",
      "You make ordinary days feel cinematic and hard days feel manageable. Here's to celebrating you today and every day! ✨",
      "My heart is fullest when I'm beside you. Wishing you the happiest, sweetest birthday imaginable! 💖",
    ],
    emotional: [
      "Loving you has been the easiest, most rewarding adventure of my life. Thank you for choosing me every single day. Happy Birthday, my forever. 💍🥹",
      "Before you, home was just a place. Now, home is wherever you are. Happy Birthday to the keeper of my heart. 💕",
    ],
  },
  family: {
    funny: [
      "Happy Birthday! I'd say you don't look a day older, but our family photo album begs to differ! 📸😂",
      "Happy Birthday! Thanks for passing down all the good genes and none of the bad habits (mostly). 🧬🥳",
    ],
    heartfelt: [
      "To the pillar of our family: thank you for your unconditional love, warmth, and strength. Happy Birthday! 🏡💖",
      "No matter how far life takes me, your warmth always guides me home. Wishing you boundless health and happiness today! 🌟",
    ],
    emotional: [
      "Every sacrifice you made, every quiet encouragement—it shaped who I am. Happy Birthday to my guiding light. 🥹💛",
      "You have loved me through every season of life. Today, I hope you feel surrounded by all the love you gave us. 💕",
    ],
  },
};

const RELATIONSHIPS = [
  { id: 'bestfriend', label: 'Best Friend', emoji: '👯' },
  { id: 'partner', label: 'Partner / Spouse', emoji: '💕' },
  { id: 'family', label: 'Family Member', emoji: '👨‍👩‍👧' },
];

const TONES = [
  { id: 'funny', label: 'Funny & Playful 😂' },
  { id: 'heartfelt', label: 'Heartfelt & Sweet 💖' },
  { id: 'emotional', label: 'Deep & Emotional 🥹' },
];

export default function BirthdayWishGenerator({ tool }) {
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  const [tone, setTone] = useState('');
  const [result, setResult] = useState(null);

  function generate(e) {
    e.preventDefault();
    if (!name.trim() || !rel || !tone) return;
    const pool = WISHES[rel]?.[tone] || WISHES.bestfriend.heartfelt;
    const wish = pool[Math.floor(Math.random() * pool.length)];
    const personalized = `Dear ${name.trim()},\n\n${wish}`;
    setResult({
      title: `Birthday Wish for ${name.trim()} 🎂`,
      text: personalized,
      shareText: personalized,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={generate} className="tool-form">
        <div className="tool-input-group">
          <label htmlFor="wish-name">Their Name</label>
          <input id="wish-name" type="text" placeholder="e.g. Priya, Rahul, Mom..." value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
        </div>
        <div className="tool-input-group">
          <label>Who are they to you?</label>
          <div className="tool-chip-row">
            {RELATIONSHIPS.map((r) => (
              <button key={r.id} type="button" className={`tool-chip ${rel === r.id ? 'active' : ''}`} onClick={() => setRel(r.id)}>
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-input-group">
          <label>Tone of your message</label>
          <div className="tool-chip-row">
            {TONES.map((t) => (
              <button key={t.id} type="button" className={`tool-chip ${tone === t.id ? 'active' : ''}`} onClick={() => setTone(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="tool-submit-btn" disabled={!name.trim() || !rel || !tone}>
          Generate Birthday Wish 🎉
        </button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
      {result && (
        <button type="button" className="tool-reset-btn" onClick={generate}>
          🔄 Generate Another Variation
        </button>
      )}
    </div>
  );
}
