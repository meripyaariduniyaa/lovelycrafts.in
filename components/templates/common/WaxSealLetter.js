'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GoldBadge from './GoldBadge';

/**
 * Handcrafted Parchment Letter with Interactive 3D Wax Seal Break & Typewriter Effect
 */
export default function WaxSealLetter({
  recipientName = '',
  title = '',
  content = '',
  senderName = '',
  author = '',
  message = '',
  date = '',
  onSealOpen,
}) {
  const [sealed, setSealed] = useState(true);
  const [typedMessage, setTypedMessage] = useState('');

  const targetTitle = title || `Dearest ${recipientName || 'You'}`;
  const defaultMsg = content || message || 'Every single moment with you has been a quiet blessing. Thank you for filling my world with light and infinite joy.';
  const displayAuthor = author || senderName || 'Forever Yours';

  const handleBreakSeal = () => {
    setSealed(false);
    if (onSealOpen) onSealOpen();
  };

  useEffect(() => {
    if (!sealed) {
      setTypedMessage('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < defaultMsg.length) {
          setTypedMessage((prev) => prev + defaultMsg.charAt(index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [sealed, defaultMsg]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '760px', margin: '0 auto', perspective: '1000px' }}>
      {sealed ? (
        /* Sealed Envelope / Letter Preview */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleBreakSeal}
          style={{
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            borderRadius: '28px',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: '1px solid #fde68a',
            boxShadow: '0 30px 60px -12px rgba(180, 83, 9, 0.25), 0 0 40px rgba(251, 191, 36, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Envelope flap lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              borderBottom: '2px dashed rgba(217, 119, 6, 0.2)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-block', marginBottom: '1.25rem' }}
            >
              <img
                src="/elements/wax-seal-red.jpg"
                alt="Red wax seal"
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  boxShadow: '0 8px 28px rgba(180,30,30,0.45), 0 0 0 3px rgba(255,255,255,0.25)',
                }}
              />
            </motion.div>

            <h3
              style={{
                fontFamily: 'var(--font-dancing), "Playfair Display", serif',
                fontSize: '2.2rem',
                color: '#78350f',
                margin: '0 0 0.5rem',
              }}
            >
              {targetTitle}
            </h3>

            <p style={{ color: '#92400e', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1.5rem', letterSpacing: '0.12em' }}>
              ✦ TAP WAX SEAL TO UNSEAL ✦
            </p>

            <span
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #b45309, #f8f3eb)',
                color: '#ffffff',
                padding: '0.75rem 1.8rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 6px 20px rgba(180, 83, 9, 0.35)',
              }}
            >
              Break Royal Wax Seal
            </span>
          </div>

          {/* Decorative flower accents — rose left, lavender right */}
          <img
            src="/flowers/rose.jpg" alt="" aria-hidden="true"
            style={{ position: 'absolute', bottom: 14, left: 18, width: 52, height: 52, objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(0.5px)' }}
          />
          <img
            src="/flowers/lavender.jpg" alt="" aria-hidden="true"
            style={{ position: 'absolute', bottom: 14, right: 18, width: 52, height: 52, objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(0.5px)', transform: 'scaleX(-1)' }}
          />
        </motion.div>
      ) : (
        /* Unfolded Letter Content */
        <motion.div
          initial={{ opacity: 0, rotateX: -15, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          style={{
            background: 'linear-gradient(145deg, #fffdfa 0%, #faf6ee 100%)',
            borderRadius: '28px',
            padding: '3rem clamp(1.5rem, 5vw, 3rem)',
            textAlign: 'left',
            border: '1px solid #fde68a',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.2), 0 0 50px rgba(245, 158, 11, 0.15)',
            position: 'relative',
          }}
        >
          {/* Header watermark crest */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid rgba(217, 119, 6, 0.15)', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GoldBadge name="crown" size={26} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Handwritten Keepsake
              </span>
            </div>
            {date && <span style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 600 }}>{date}</span>}
          </div>

          <h4
            style={{
              fontFamily: 'var(--font-dancing), "Playfair Display", serif',
              fontSize: '2rem',
              color: '#78350f',
              margin: '0 0 1.25rem',
            }}
          >
            {targetTitle}
          </h4>

          <p
            style={{
              fontFamily: 'var(--font-caveat), "Caveat", Georgia, serif',
              fontSize: '1.45rem',
              color: '#292524',
              lineHeight: 1.7,
              minHeight: '120px',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {typedMessage}
            {typedMessage.length < defaultMsg.length && (
              <span style={{ display: 'inline-block', width: '2px', height: '1.2em', background: '#b45309', verticalAlign: 'middle', marginLeft: '3px', animation: 'blink 0.8s infinite' }} />
            )}
          </p>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(217, 119, 6, 0.2)', textAlign: 'right' }}>
            <span
              style={{
                fontFamily: 'var(--font-dancing), "Dancing Script", cursive',
                fontSize: '1.6rem',
                color: '#92400e',
                fontWeight: 700,
              }}
            >
              {displayAuthor}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
