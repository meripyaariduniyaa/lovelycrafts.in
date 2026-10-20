'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import PasscodeLock from '@/components/PasscodeLock';
import WaxSealEnvelope from '@/components/WaxSealEnvelope';
import VoiceNotePlayer from '@/components/VoiceNotePlayer';

export default function RecipientExperienceWrapper({ note }) {
  const reduceMotion = useReducedMotion();
  const customDetails = note.custom_details || {};
  const hasPasscode = Boolean(customDetails.passcode || customDetails.secret_question);
  
  const [isUnlocked, setIsUnlocked] = useState(!hasPasscode);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const targetSlug = note?.slug || note?.custom_slug || note?.id || '';
  const reactUrl = targetSlug ? `/p/${encodeURIComponent(targetSlug)}/react` : `/p/${encodeURIComponent(note?.id || '')}/react`;

  const handleGoToReact = useCallback(() => {
    if (reactUrl) {
      window.location.href = reactUrl;
    }
  }, [reactUrl]);

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

  const handleReachEnd = useCallback((ended) => {
    setIsAtEnd(Boolean(ended));
  }, []);

  // Keep the sealed envelope visible while the optional passcode prompt is shown.
  if (!isEnvelopeOpened) {
    return (
      <WaxSealEnvelope
        recipientName={note.recipient_name}
        senderName={customDetails.sender_name}
        isLocked={!isUnlocked}
        passcode={customDetails.passcode}
        secretQuestion={customDetails.secret_question}
        onUnlocked={() => setIsUnlocked(true)}
        onOpen={() => setIsEnvelopeOpened(true)}
      />
    );
  }

  // Full experience unlocked
  return (
    <div className="recipient-experience-container">

      {/* Voice Note Player Pill if recorded */}
      {note?.voice_note_url && (
        <VoiceNotePlayer audioUrl={note.voice_note_url} recipientName={note.recipient_name} />
      )}

      {/* Main Experience Template */}
      <motion.div
        className="recipient-template-entry"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <TemplateRenderer
          note={note}
          isPreview={false}
          onReachEnd={handleReachEnd}
          onGoToReact={handleGoToReact}
          reactUrl={reactUrl}
        />
      </motion.div>

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
            <div className="lc-clay-completion-card" style={{
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
              <a
                href={reactUrl}
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToReact();
                }}
                className="wrap-moment-glow-btn"
                id="wrap-up-moment-btn"
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
                  cursor: 'pointer',
                }}
              >
                <span>💌</span>
                <span>Wrap Up The Moment • Share Your Experience</span>
                <span>➔</span>
              </a>

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

      `}</style>
    </div>
  );
}
