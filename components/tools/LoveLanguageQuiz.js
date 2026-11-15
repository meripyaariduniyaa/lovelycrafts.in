'use client';

import { useState } from 'react';
import ToolResult from './ToolResult';

const QUESTIONS = [
  { q: 'What makes you feel most loved?', a: ['Hearing "I love you"', 'A warm, long hug', 'A surprise gift', 'Help with chores or tasks', 'A full day together'] },
  { q: "On a tough day, you'd prefer your partner to...", a: ['Say encouraging words', 'Hold your hand or cuddle', 'Bring you a sweet little treat', 'Take care of something on your to-do list', 'Spend quiet uninterrupted time with you'] },
  { q: 'The most meaningful surprise for you is...', a: ['A heartfelt handwritten letter', 'An unexpected gentle hug or massage', 'A thoughtful gift they remembered you wanted', 'Them preparing dinner or running your errand', 'A surprise date planned just for two'] },
  { q: 'You feel closest to someone when...', a: ['Having deep, vulnerable conversations', 'Cuddling softly without words', 'Exchanging gifts chosen with care', 'They help you without being asked', 'Doing a fun activity together side-by-side'] },
  { q: "For your birthday, you'd appreciate most...", a: ['A sincere toast praising your qualities', 'Affectionate hugs from people you love', 'A gift you will cherish for years', 'Someone organizing everything seamlessly', 'Spending all day laughing with loved ones'] },
  { q: 'In disagreements, what hurts you deepest?', a: ['Harsh or dismissive words', 'Cold physical distance or lack of touch', 'Feeling neglected on special occasions', 'Feeling like all burdens fall on you alone', 'Being ignored or emotionally shut out'] },
  { q: 'How do you naturally express affection?', a: ['Compliments and words of praise', 'Hugs, kisses, and playful touch', 'Surprising them with gifts', 'Doing helpful favors for them', 'Clearing your calendar to be with them'] },
  { q: 'Your dream evening with someone special is...', a: ['Talking for hours under the stars', 'Snuggling warmly with a good movie', 'Exchanging cute anniversary or just-because gifts', 'Cooking a meal together where they chop and clean', 'Exploring an exciting new place together'] },
  { q: 'What makes a relationship truly strong for you?', a: ['Open verbal reassurance & honesty', 'Gentle physical intimacy & warmth', 'Thoughtful tokens of appreciation', 'Reliability and mutual daily support', 'Quality shared memories and focus'] },
  { q: 'What would you keep forever in a keepsake box?', a: ['A sweet voice note or love note', 'The memory of an unforgettable embrace', 'A handmade personal gift', 'A coupon book of favors they fulfilled', 'Plane tickets or photos from a shared trip'] },
];

const LANGUAGES = [
  { name: 'Words of Affirmation', emoji: '💬', desc: 'You feel most cherished through verbal compliments, appreciation, and sweet messages that validate your bond.' },
  { name: 'Physical Touch', emoji: '🤗', desc: 'Non-verbal affection, warm hugs, holding hands, and physical presence speak louder to your heart than anything else.' },
  { name: 'Receiving Gifts', emoji: '🎁', desc: 'You value the thoughtfulness, effort, and care represented by gifts and visual symbols of love.' },
  { name: 'Acts of Service', emoji: '🛠️', desc: 'Actions speak loudest for you. Easing your burdens and showing helpful consideration makes you feel genuinely supported.' },
  { name: 'Quality Time', emoji: '⏰', desc: 'Undivided attention, eye contact, and focused shared experiences are the lifeblood of your deepest connections.' },
];

export default function LoveLanguageQuiz({ tool }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const [result, setResult] = useState(null);

  function answer(index) {
    const next = [...scores];
    next[index] += 1;
    setScores(next);
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      const maxScore = Math.max(...next);
      const primary = next.indexOf(maxScore);
      const total = next.reduce((a, b) => a + b, 0);
      const pcts = next.map((s) => Math.round((s / total) * 100));
      const lang = LANGUAGES[primary];
      setResult({
        title: `${lang.emoji} Primary: ${lang.name}`,
        text: lang.desc,
        details: LANGUAGES.map((l, i) => `${l.emoji} ${l.name}: ${pcts[i]}%`),
        insight: `Understanding that your love language is ${lang.name} will help your partner love you in the way you truly feel it!`,
        shareText: `My primary love language is ${lang.name} ${lang.emoji}! Breakdown: ${LANGUAGES.map((l, i) => `${l.name}: ${pcts[i]}%`).join(' · ')}`,
      });
    }
  }

  function reset() {
    setCurrent(0);
    setScores([0, 0, 0, 0, 0]);
    setResult(null);
  }

  if (result) {
    return (
      <div className="tool-interactive">
        <ToolResult result={result} tool={tool} />
        <button type="button" className="tool-reset-btn" onClick={reset}>Take Quiz Again 🔄</button>
      </div>
    );
  }

  const q = QUESTIONS[current];
  return (
    <div className="tool-interactive">
      <div className="tool-quiz-progress">Question {current + 1} of {QUESTIONS.length}</div>
      <div className="tool-quiz-bar">
        <div className="tool-quiz-bar-fill" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <h3 className="tool-quiz-question">{q.q}</h3>
      <div className="tool-quiz-options">
        {q.a.map((opt, i) => (
          <button key={i} type="button" className="tool-quiz-option" onClick={() => answer(i)}>
            <span className="tool-quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
