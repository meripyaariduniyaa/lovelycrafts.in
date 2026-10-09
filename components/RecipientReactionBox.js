'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_OPTIONS = [
  { emoji: '🥺', label: 'Touched & emotional' },
  { emoji: '❤️', label: 'Love you forever' },
  { emoji: '🥰', label: 'Made my whole day' },
  { emoji: '💍', label: 'YES, 1000x YES!' },
  { emoji: '✨', label: 'Thank you so much' },
  { emoji: '🤗', label: 'Sending a huge hug' },
  { emoji: '😭', label: 'Crying happy tears' },
  { emoji: '💌', label: 'Write my own reply' },
];

export default function RecipientReactionBox({ noteId, recipientName }) {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!noteId || sending || submitted || !selected) return;
    setSending(true);
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          action: 'react',
          reactionEmoji: selected.emoji,
          reactionLabel: selected.label,
          reactionMessage: message.trim(),
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Could not send reaction', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ width: 'min(94vw, 520px)', margin: '2.5rem auto 3rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes popIn {
          0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .rrb-pill {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 14px; border-radius: 14px;
          border: 1.5px solid #fce7f3;
          background: #ffffff;
          cursor: pointer; font-size: 13px; font-weight: 700;
          color: #475569; transition: all 0.2s; text-align: left;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .rrb-pill:hover {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #be185d; transform: translateY(-1px);
        }
        .rrb-pill.active {
          background: #ffe4e6;
          border-color: #f43f5e;
          color: #be185d;
          box-shadow: 0 4px 16px rgba(244,63,94,0.18);
        }
        .rrb-pill.active .rrb-emoji { animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .rrb-emoji { font-size: 20px; flex-shrink: 0; }
        .rrb-textarea {
          width: 100%; border: 1.5px solid #e2e8f0;
          border-radius: 14px; padding: 12px 16px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          resize: none; outline: none;
          background: #ffffff; color: #0f172a;
          transition: all 0.2s; box-sizing: border-box;
        }
        .rrb-textarea::placeholder { color: #94a3b8; }
        .rrb-textarea:focus {
          border-color: #f43f5e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(244,63,94,0.12);
        }
        .rrb-send {
          width: 100%; padding: 14px;
          border-radius: 16px; border: none;
          background: linear-gradient(135deg, #f43f5e, #be185d);
          color: white; font-weight: 800; font-size: 15px;
          cursor: pointer; font-family: 'Inter', sans-serif;
          box-shadow: 0 8px 24px rgba(190,24,93,0.25);
          transition: all 0.2s; letter-spacing: -0.01em;
        }
        .rrb-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(190,24,93,0.35); }
        .rrb-send:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              background: 'linear-gradient(160deg, #ffffff 0%, #fff5f8 100%)',
              border: '1.5px solid #fecdd3',
              borderRadius: '28px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(244,63,94,0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow ring */}
            <div style={{
              position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
              width: 240, height: 240, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <motion.div
              initial={{ scale: 0.3, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
              style={{ fontSize: '4rem', marginBottom: '1rem', display: 'inline-block' }}
            >
              {selected?.emoji}
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}
            >
              Your reply was sent! 💕
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: '0 auto', maxWidth: '320px', fontWeight: 500 }}
            >
              {recipientName ? (
                <>The person who made this for <strong style={{ color: '#be185d' }}>{recipientName}</strong> will see your reaction on their dashboard.</>
              ) : (
                'The person who created this will see your heartfelt reaction on their dashboard.'
              )}
            </motion.p>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{
                  marginTop: '1.25rem', padding: '0.9rem 1.25rem',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '14px', fontSize: '0.88rem',
                  color: '#be185d', fontStyle: 'italic',
                }}
              >
                &ldquo;{message}&rdquo;
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(160deg, #ffffff 0%, #fff8fb 100%)',
              border: '1.5px solid #fecdd3',
              borderRadius: '28px',
              padding: '1.75rem 1.5rem 2rem',
              boxShadow: '0 20px 45px -10px rgba(244,63,94,0.1)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, color: '#be185d',
                letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block',
                marginBottom: '0.35rem',
              }}>
                💬 Leave a reaction
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.35rem' }}>
                How did this make you feel?
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                Tap a reaction below to let them know your heart felt this.
              </p>
            </div>

            {/* Reaction Pill Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '1.25rem',
            }}>
              {REACTION_OPTIONS.map((opt) => {
                const isActive = selected?.emoji === opt.emoji;
                return (
                  <button
                    key={opt.emoji}
                    type="button"
                    onClick={() => setSelected(isActive ? null : opt)}
                    className={`rrb-pill ${isActive ? 'active' : ''}`}
                  >
                    <span className="rrb-emoji">{opt.emoji}</span>
                    <span style={{ lineHeight: 1.25 }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional note input */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden', marginBottom: '1.25rem' }}
              >
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                  Add a secret note back (optional):
                </label>
                <textarea
                  className="rrb-textarea"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say whatever is on your mind... ❤️"
                  maxLength={500}
                />
              </motion.div>
            )}

            {/* Send button */}
            <button
              type="button"
              className="rrb-send"
              onClick={handleSend}
              disabled={!selected || sending}
            >
              {sending ? (
                <span>Sending your reply... 💌</span>
              ) : selected ? (
                <span>Send {selected.emoji} Reaction to Them ➔</span>
              ) : (
                <span>Select a reaction above to send</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
