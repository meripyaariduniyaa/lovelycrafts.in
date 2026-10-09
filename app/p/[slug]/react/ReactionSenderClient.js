'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_OPTIONS = [
  { emoji: '🥺', label: 'Touched & emotional', tag: 'Happy Tears' },
  { emoji: '❤️', label: 'Love you forever', tag: 'Pure Love' },
  { emoji: '🥰', label: 'Made my whole day', tag: 'Heartfelt' },
  { emoji: '💍', label: 'YES, 1000x YES!', tag: 'Forever' },
  { emoji: '✨', label: 'Thank you so much', tag: 'Grateful' },
  { emoji: '🤗', label: 'Sending a huge hug', tag: 'Warm Hug' },
  { emoji: '😭', label: 'Crying happy tears', tag: 'Overwhelmed' },
  { emoji: '💌', label: 'Writing a secret note', tag: 'Personal' },
];

const PROMPT_SUGGESTIONS = [
  'I love you more than words can say ❤️',
  'This made me smile so big today ✨',
  'Thank you for always making me feel special 🥺',
  'You are the best thing in my life 🥰',
];

export default function ReactionSenderClient({ note }) {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(Boolean(note.recipient_reaction));
  const [sending, setSending] = useState(false);

  const recipientName = note.recipient_name || 'You';
  const senderName = note.sender_name || 'the sender';

  const handleSendReaction = async () => {
    if (!note.id || sending || !selected) return;
    setSending(true);
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: note.id,
          action: 'react',
          reactionEmoji: selected.emoji,
          reactionLabel: selected.label,
          reactionMessage: message.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error sending reaction:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff5f8 0%, #fff0f5 50%, #faf0f7 100%)',
      color: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
        @keyframes float-heart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-15px) rotate(8deg); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        }
        @keyframes pop-emoji {
          0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .reaction-card-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1.5px solid #fce7f3;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .reaction-card-pill:hover {
          background: #fff1f5;
          border-color: #fecdd3;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(244,63,94,0.1);
        }
        .reaction-card-pill.active {
          background: linear-gradient(135deg, #fff1f5 0%, #ffe4e6 100%);
          border-color: #f43f5e;
          box-shadow: 0 8px 24px rgba(244,63,94,0.2);
          transform: translateY(-2px) scale(1.01);
        }
        .reaction-card-pill.active .pill-emoji {
          animation: pop-emoji 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.92)',
        borderBottom: '1px solid #fce7f3',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 2px 10px rgba(244, 63, 94, 0.05)',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href={`/p/${note.custom_slug || note.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '50px',
              padding: '6px 14px',
              color: '#be185d',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 800,
            }}
          >
            <span>←</span> Back to Surprise
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>💌</span>
            <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>LovelyCrafts</span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', background: '#ffe4e6', padding: '3px 10px', borderRadius: '50px' }}>
            Reaction
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '1.75rem 1.25rem' }}>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── SUCCESS / CONFIRMATION SCREEN ── */
            <motion.div
              key="submitted-state"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #fff5f8 100%)',
                border: '1.5px solid #fecdd3',
                borderRadius: '32px',
                padding: '2.5rem 1.75rem',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(244, 63, 94, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Floating ambient glow */}
              <div style={{
                position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(244,63,94,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <motion.div
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
                style={{ fontSize: '4.5rem', marginBottom: '1rem', display: 'inline-block' }}
              >
                {selected?.emoji || note.recipient_reaction?.emoji || '💖'}
              </motion.div>

              <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.15 }}>
                Your Reaction Was Sent! 💕
              </h1>

              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 auto 1.5rem', maxWidth: '340px' }}>
                {senderName !== 'the sender'
                  ? <><strong>{senderName}</strong> will see your heartfelt reaction live on their LovelyCrafts dashboard.</>
                  : 'The person who created this surprise will see your heartfelt response on their dashboard.'}
              </p>

              {(message || note.recipient_reaction?.message) && (
                <div style={{
                  background: '#fff1f5',
                  border: '1px solid #fecdd3',
                  borderRadius: '16px',
                  padding: '1rem 1.25rem',
                  fontSize: '0.9rem',
                  color: '#be185d',
                  fontStyle: 'italic',
                  marginBottom: '1.75rem',
                  lineHeight: 1.5,
                }}>
                  &ldquo;{message || note.recipient_reaction?.message}&rdquo;
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href={`/p/${note.custom_slug || note.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    background: '#ffffff',
                    border: '1.5px solid #fecdd3',
                    color: '#be185d',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  }}
                >
                  <span>↺</span>
                  <span>Replay The Experience</span>
                </Link>

                <Link
                  href={`/create?template=${encodeURIComponent(note.template || 'proposal')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '15px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 6px 25px rgba(244,63,94,0.35)',
                  }}
                >
                  <span>✨</span>
                  <span>Craft a Surprise Back For Them ➔</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ── REACTION SENDER FORM ── */
            <motion.div
              key="reaction-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #fff8fa 100%)',
                border: '1.5px solid #fecdd3',
                borderRadius: '32px',
                padding: '2rem 1.5rem',
                boxShadow: '0 20px 60px rgba(244, 63, 94, 0.12)',
              }}
            >
              {/* Header Title */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#be185d',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}>
                  Wrap Up The Moment ✨
                </span>
                <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.5rem', color: '#0f172a', margin: '0 0 0.35rem', lineHeight: 1.15 }}>
                  How Did This Feel?
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  {senderName !== 'the sender'
                    ? <>Let <strong style={{ color: '#be185d' }}>{senderName}</strong> know how much this moment meant to you.</>
                    : 'Choose your reaction to send directly back to the creator.'}
                </p>
              </div>

              {/* Reaction Pill Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                {REACTION_OPTIONS.map((opt) => {
                  const isActive = selected?.emoji === opt.emoji;
                  return (
                    <button
                      key={opt.emoji}
                      type="button"
                      onClick={() => setSelected(opt)}
                      className={`reaction-card-pill ${isActive ? 'active' : ''}`}
                    >
                      <span className="pill-emoji" style={{ fontSize: '1.75rem', flexShrink: 0 }}>
                        {opt.emoji}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isActive ? '#be185d' : '#0f172a', lineHeight: 1.25 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isActive ? '#e11d48' : '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                          {opt.tag}
                        </div>
                      </div>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: isActive ? '2px solid #f43f5e' : '1.5px solid #cbd5e1',
                        background: isActive ? '#f43f5e' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.65rem', fontWeight: 900,
                      }}>
                        {isActive && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Prompt Suggestions (Pills) */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                  Quick Note Suggestions:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PROMPT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMessage(sug)}
                      style={{
                        background: message === sug ? '#fff1f2' : '#f8fafc',
                        border: message === sug ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                        color: message === sug ? '#be185d' : '#475569',
                        borderRadius: '50px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Note Back (Textarea) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
                  Write a secret note back (optional):
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pour your thoughts here... ❤️"
                  rows={3}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    fontFamily: "'Inter', sans-serif",
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#f43f5e')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: selected ? 1.02 : 1 }}
                whileTap={{ scale: selected ? 0.98 : 1 }}
                onClick={handleSendReaction}
                disabled={!selected || sending}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  border: 'none',
                  background: selected
                    ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
                    : '#e2e8f0',
                  color: selected ? '#ffffff' : '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: selected ? (sending ? 'not-allowed' : 'pointer') : 'default',
                  boxShadow: selected ? '0 8px 25px rgba(244,63,94,0.35)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {sending ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    <span>Sending your reaction...</span>
                  </>
                ) : selected ? (
                  <>
                    <span>Send {selected.emoji} Reaction to {senderName !== 'the sender' ? senderName : 'Them'}</span>
                    <span>➔</span>
                  </>
                ) : (
                  <span>Select a reaction above to send</span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
