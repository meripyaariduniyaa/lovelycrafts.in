'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GoldBadge from './GoldBadge';

/**
 * 3D Origami Crane with 4 Unfolding Commitment Wings
 * Unfolds commitments: Listen better, Communicate honestly, Respect boundaries, Show through actions
 */
export default function OrigamiCrane({ commitments = [], onComplete }) {
  const [unfolded, setUnfolded] = useState(false);

  const defaultCommitments = [
    { title: 'Listen Better', desc: 'To listen to your heart and feelings without rushing to defend myself.' },
    { title: 'Communicate Honestly', desc: 'To always share with transparency, vulnerability, and gentle words.' },
    { title: 'Respect Boundaries', desc: 'To honor your space, your pace, and your emotional comfort at all times.' },
    { title: 'Show Through Actions', desc: 'To let my consistent daily actions prove my sincerity, not just empty words.' },
  ];

  const items = commitments.length > 0 ? commitments : defaultCommitments;

  const handleUnfold = () => {
    setUnfolded(true);
    if (onComplete) onComplete();
  };

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      {!unfolded ? (
        <motion.div
          onClick={handleUnfold}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #f8f3eb, #f8f3eb)',
            padding: '2.5rem 3rem',
            borderRadius: '28px',
            border: '2px solid #5eead4',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 35px rgba(45, 212, 191, 0.3)',
            cursor: 'pointer',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GoldBadge name="crane" size={80} />
          </motion.div>
          <span
            style={{
              display: 'block',
              color: '#ccfbf1',
              fontSize: '1.2rem',
              fontWeight: 800,
              marginTop: '12px',
              fontFamily: 'var(--font-dancing), cursive',
            }}
          >
            ✦ Tap Crane to Unfold 4 Sacred Promises ✦
          </span>
          <p style={{ color: '#99f6e4', fontSize: '0.82rem', margin: '4px 0 0' }}>
            A symbol of healing, peace, and unconditional commitment
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '1.5rem',
            }}
          >
            {items.map((c, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: 'rgba(247, 238, 228, 0.96)',
                  borderRadius: '20px',
                  padding: '16px 14px',
                  border: '1.5px solid #2dd4bf',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#5eead4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Wing #{idx + 1}: {c.title}
                </span>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#f0fdfa', lineHeight: 1.4 }}>
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <span style={{ color: '#5eead4', fontSize: '0.9rem', fontWeight: 700 }}>
            ✓ 4 Commitments Unfolded and Sealed in Heart
          </span>
        </motion.div>
      )}
    </div>
  );
}
