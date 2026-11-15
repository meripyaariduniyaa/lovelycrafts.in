'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const WORD_MAP = {
  love: '❤️', loves: '💖', loved: '💓', loving: '🥰',
  you: '👉🫵', u: '👉', i: '👈🙋', me: '🙋',
  miss: '😢💭', missing: '🥺💔', kiss: '💋', kisses: '😘💋',
  hug: '🤗', hugs: '🫂', heart: '💖', baby: '👶🍼', babe: '🥰', darling: '💕', honey: '🍯',
  beautiful: '✨🌹', pretty: '🌸', handsome: '😎✨', cute: '🥺💖',
  happy: '😊🎉', sad: '😢', cry: '😭',
  forever: '♾️💍', always: '🔁💕', together: '👫💍',
  dream: '💭✨', smile: '😊', eyes: '👀✨',
  star: '⭐', stars: '✨🌟', moon: '🌙', sun: '☀️',
  night: '🌙⭐', morning: '🌅☕', day: '☀️',
  good: '👍', best: '🏆', friend: '👯', friends: '💛👭',
  world: '🌍', universe: '🌌', life: '🌱💖',
  think: '💭', feel: '💓', want: '🙏', need: '💫', wish: '🌠',
  birthday: '🎂🎉', surprise: '🎁✨', gift: '🎁', party: '🥳🍾',
  sorry: '🥺🙏', apologize: '🕊️💔', forgive: '🤝💖',
  thank: '🙏', thanks: '🙏💕', please: '🥺',
  yes: '✅💖', no: '❌', and: '➕', with: '🤝',
  my: '🫶', your: '👆', our: '👫',
  so: '🔥', very: '💯', much: '📈', more: '➕➕',
  marry: '💍👰', proposal: '💍💐', wedding: '👰🤵🥂',
};

function translateToEmoji(text) {
  return text.split(/(\s+|[.,!?;:])/).map((token) => {
    if (!token || /^\s+$/.test(token) || /^[.,!?;:]$/.test(token)) return token;
    const clean = token.toLowerCase().replace(/[^a-z]/g, '');
    return WORD_MAP[clean] || token;
  }).join('');
}

export default function EmojiLoveTranslator({ tool }) {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  function translate(e) {
    e.preventDefault();
    if (!message.trim()) return;
    const translated = translateToEmoji(message);
    setResult({
      title: 'Emoji Love Message 😘',
      text: translated,
      insight: 'Copy and send this encrypted love message to your partner on WhatsApp or Instagram stories!',
      shareText: `${translated}`,
    });
  }

  return (
    <div className="tool-interactive">
      <form onSubmit={translate} className="tool-form">
        <div className="tool-input-group">
          <label htmlFor="love-msg">Type your message in English</label>
          <textarea id="love-msg" placeholder="e.g. I love you so much, you are my whole world and my heart beats for you forever..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={300} required />
        </div>
        <button type="submit" className="tool-submit-btn">Translate to Emojis 😘</button>
      </form>
      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}
