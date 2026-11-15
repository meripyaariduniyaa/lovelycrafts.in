'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const OCCASIONS = [
  { id: 'birthday', label: '🎂 Birthday' },
  { id: 'anniversary', label: '💍 Anniversary' },
  { id: 'valentines', label: "💕 Valentine's" },
  { id: 'apology', label: '🥺 Apology / Sorry' },
  { id: 'justbecause', label: '✨ Just Because' },
];

const BUDGETS = [
  { id: 'free', label: 'Free / DIY ✨' },
  { id: 'low', label: 'Under ₹500 💸' },
  { id: 'mid', label: '₹500–₹2000 🎁' },
  { id: 'high', label: '₹2000+ 💎' },
];

const VIBES = [
  { id: 'romantic', label: 'Romantic 🌹' },
  { id: 'funny', label: 'Funny & Playful 😂' },
  { id: 'emotional', label: 'Deeply Emotional 🥹' },
  { id: 'practical', label: 'Useful & Practical 🎯' },
];

const IDEAS = {
  birthday_free_romantic: [
    'A handwritten love letter read aloud over candlelit video call 💌',
    'A custom curated Spotify playlist of songs that secretly describe them 🎵',
    'A LovelyCrafts digital birthday surprise with your photos, balloon pop, & background music ✨',
  ],
  birthday_low_romantic: [
    'A customized photo frame with your first-ever selfie together 📸',
    'A LovelyCrafts interactive birthday experience link they can open at midnight 🎂',
    'A fragrant scented candle paired with a cute reminder note 🕯️',
  ],
  birthday_mid_romantic: [
    'A custom night-sky star map of the exact date & city you met ⭐',
    'A LovelyCrafts custom keepsake with personal voice notes & photo gallery 🎵',
    'A cozy dinner date setup with their favorite cuisine & flowers 🍝🌹',
  ],
  birthday_free_funny: [
    'A hilarious "Top 10 reasons you are getting ancient" roast list 😂',
    'A customized digital meme collage of their most goofy camera-roll candid moments 📱',
    'A funny handmade coupon book: "Free pass to win 1 argument" 🎟️',
  ],
  birthday_low_funny: [
    'A custom ceramic mug with their most chaotic expression printed on it 🍵',
    'A funny scratch-off dare game for their birthday party 🎲',
    'A custom bobblehead or cartoon illustration 🎨',
  ],
  anniversary_free_romantic: [
    'A LovelyCrafts interactive Anniversary Timeline surprise with champagne pop & reasons why I love you 🥂',
    'A video montage of your past 365 days together set to your favorite romantic track 📹',
    'A "30 reasons why I love you" sealed envelope collection 📝',
  ],
  anniversary_mid_romantic: [
    'Engraved matching coordinate bracelets with the location of your first date 💍',
    'A full LovelyCrafts premium surprise link shared via WhatsApp at midnight ✨',
    'A weekend staycation or scenic picnic surprise 🧺',
  ],
  valentines_free_romantic: [
    'A LovelyCrafts "Will You Be My Valentine" proposal experience where the No button dodges away 💕',
    'A sunrise walk together followed by breakfast in bed 🌅',
    'A sealed digital voice letter expressing what they truly mean to you 🎙️',
  ],
  valentines_low_romantic: [
    'A bouquet of their favorite flowers accompanied by an interactive LovelyCrafts card 🌹',
    'A custom engraved keychain with your special anniversary date 🔑',
    'A box of artisan chocolates paired with a heartfelt note 🍫',
  ],
  apology_free_emotional: [
    'A LovelyCrafts heartfelt apology card with your sincere words, gentle music, and photos 🕊️',
    'A calm voice note acknowledging their feelings without any defensiveness 🎙️',
    'Their favorite comfort food delivered quietly with a handwritten apology note 🍲',
  ],
};

function getIdeas(occasion, budget, vibe) {
  const key = `${occasion}_${budget}_${vibe}`;
  if (IDEAS[key]) return IDEAS[key];
  const matched = Object.keys(IDEAS).find((k) => k.startsWith(occasion)) || Object.keys(IDEAS)[0];
  return IDEAS[matched];
}

export default function GiftIdeaGenerator({ tool }) {
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [vibe, setVibe] = useState('');
  const [result, setResult] = useState(null);

  function generate(e) {
    e.preventDefault();
    if (!occasion || !budget || !vibe) return;
    const ideas = getIdeas(occasion, budget, vibe);
    setResult({
      title: 'Personalized Gift Ideas 🎁',
      items: ideas,
      insight: 'Digital gifts like LovelyCrafts interactive experiences can be delivered in 2 minutes on WhatsApp with 100% privacy!',
      shareText: `Top gift ideas for ${occasion}:\n• ${ideas.join('\n• ')}`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={generate} className="tool-form">
        <div className="tool-input-group">
          <label>Occasion</label>
          <div className="tool-chip-row">
            {OCCASIONS.map((o) => (
              <button key={o.id} type="button" className={`tool-chip ${occasion === o.id ? 'active' : ''}`} onClick={() => setOccasion(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-input-group">
          <label>Budget Range</label>
          <div className="tool-chip-row">
            {BUDGETS.map((b) => (
              <button key={b.id} type="button" className={`tool-chip ${budget === b.id ? 'active' : ''}`} onClick={() => setBudget(b.id)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-input-group">
          <label>Emotional Vibe</label>
          <div className="tool-chip-row">
            {VIBES.map((v) => (
              <button key={v.id} type="button" className={`tool-chip ${vibe === v.id ? 'active' : ''}`} onClick={() => setVibe(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="tool-submit-btn" disabled={!occasion || !budget || !vibe}>
          Find Perfect Gift Ideas 🎁
        </button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
