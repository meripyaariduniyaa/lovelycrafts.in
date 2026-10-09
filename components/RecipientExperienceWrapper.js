'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import PasscodeLock from '@/components/PasscodeLock';
import WaxSealEnvelope from '@/components/WaxSealEnvelope';
import AudioPlayer from '@/components/AudioPlayer';
import VoiceNotePlayer from '@/components/VoiceNotePlayer';
import RecipientReactionBox from '@/components/RecipientReactionBox';

export default function RecipientExperienceWrapper({ note }) {
  const customDetails = note.custom_details || {};
  const hasPasscode = Boolean(customDetails.passcode || customDetails.secret_question);
  
  const [isUnlocked, setIsUnlocked] = useState(!hasPasscode);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [replayHandler, setReplayHandler] = useState(null);

  // Track view event once per session
  useEffect(() => {
    if (!note?.id) return;
    const viewKey = `viewed_note_${note.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, '1');
      fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, action: 'view' }),
      }).catch((e) => console.warn('Could not record view', e));
    }
  }, [note?.id]);

  const handleReachEnd = (ended, onReplay) => {
    setIsAtEnd(Boolean(ended));
    if (onReplay) {
      setReplayHandler(() => onReplay);
    }
  };

  const handleReplayClick = () => {
    setIsAtEnd(false);
    if (typeof replayHandler === 'function') {
      replayHandler();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If locked with passcode, show Passcode Lock first
  if (!isUnlocked) {
    return (
      <PasscodeLock
        passcode={customDetails.passcode}
        secretQuestion={customDetails.secret_question}
        recipientName={note.recipient_name}
        onUnlocked={() => setIsUnlocked(true)}
      />
    );
  }

  // If not yet unwrapped, show Wax Seal Envelope
  if (!isEnvelopeOpened) {
    return (
      <WaxSealEnvelope
        recipientName={note.recipient_name}
        senderName={customDetails.sender_name}
        onOpen={() => setIsEnvelopeOpened(true)}
      />
    );
  }

  // Full experience unlocked
  const musicPreset = customDetails.audio_preset || 'romantic-piano';

  return (
    <div className="recipient-experience-container">

      {/* Voice Note Player Pill if recorded */}
      {note?.voice_note_url && (
        <VoiceNotePlayer audioUrl={note.voice_note_url} recipientName={note.recipient_name} />
      )}

      {/* Main Experience Template */}
      <TemplateRenderer 
        note={note} 
        isPreview={false} 
        onReachEnd={handleReachEnd}
      />

      {/* Recipient Interactive Reaction & Wrap Up The Moment — ONLY after last scene */}
      <AnimatePresence>
        {isAtEnd && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="experience-completion-section"
          >
            {/* Wrap up the moment primary spotlight card */}
            <div style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #fff1f5 100%)',
              border: '2px solid #fecdd3',
              borderRadius: '28px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              width: '100%',
              boxShadow: '0 16px 40px rgba(244, 63, 94, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>✨ 💌 💖</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>
                A Moment to Remember
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem', lineHeight: 1.25 }}>
                Share Your Experience &amp; Thoughts
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 auto 1.5rem', maxWidth: '380px', lineHeight: 1.55 }}>
                {note.custom_details?.sender_name 
                  ? `Let ${note.custom_details.sender_name} know how this made you feel. Your reaction will appear on their dashboard!`
                  : 'Send your emotional reaction and thoughts back so the creator can see how much this meant to you!'}
              </p>

              {/* Primary Glowing Action */}
              <Link
                href={`/p/${note.custom_slug || note.id}/react`}
                className="wrap-moment-glow-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 28px',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)',
                  marginBottom: '1rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>💌</span>
                <span>Wrap Up The Moment • Share Your Experience</span>
                <span>➔</span>
              </Link>

              {/* Secondary actions */}
              <div className="completion-actions-bar">
                {replayHandler && (
                  <button
                    type="button"
                    onClick={handleReplayClick}
                    className="completion-replay-btn"
                    id="replay-experience-btn"
                  >
                    <span className="btn-icon">↺</span>
                    <span>Replay Experience</span>
                  </button>
                )}

                <Link
                  href={`/create?template=${encodeURIComponent(note.template || 'proposal')}`}
                  className="completion-create-btn"
                  id="create-same-surprise-btn"
                >
                  <span className="btn-icon">✨</span>
                  <span>Create a Surprise Like This</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .recipient-experience-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
        }

        .experience-completion-section {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          z-index: 20;
          position: relative;
        }

        .completion-actions-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          width: 100%;
        }

        .completion-replay-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          background: #ffffff;
          border: 1.5px solid #fecdd3;
          color: #be185d;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(244, 63, 94, 0.1);
          transition: all 0.25s ease;
        }

        .completion-replay-btn:hover {
          background: #fff1f2;
          border-color: #f43f5e;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(244, 63, 94, 0.2);
        }

        .completion-create-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: linear-gradient(135deg, #f43f5e, #be185d);
          border: 1px solid rgba(244, 63, 94, 0.5);
          color: #ffffff;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(244, 63, 94, 0.4);
          transition: all 0.25s ease;
        }

        .completion-create-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 30px rgba(244, 63, 94, 0.55);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        @media (max-width: 600px) {
          .completion-actions-bar {
            flex-direction: column;
            width: 100%;
          }
          .completion-replay-btn,
          .completion-create-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
