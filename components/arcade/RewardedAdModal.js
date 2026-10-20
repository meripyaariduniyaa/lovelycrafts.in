'use client';

import { useState, useEffect } from 'react';

/**
 * RewardedAdModal Component
 * 
 * Allows users to watch a short sponsored ad (5s video or interactive banner)
 * to unlock in-game rewards like +2 Hints, +15s Time, or Score Multipliers.
 */
export default function RewardedAdModal({ isOpen, onClose, onRewardGranted, rewardTitle = '+2 Free Hints' }) {
  const [countdown, setCountdown] = useState(5);
  const [watching, setWatching] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setWatching(true);
      setCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!watching || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setWatching(false);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [watching, countdown]);

  if (!isOpen) return null;

  const handleClaim = () => {
    onRewardGranted?.();
    onClose?.();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(247, 238, 228, 0.96)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        padding: '1.75rem',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        border: '1px solid #fecdd3',
        position: 'relative'
      }}>
        
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#43332b', background: '#fff1f2', padding: '0.2rem 0.65rem', borderRadius: '999px', display: 'inline-block', marginBottom: '0.75rem' }}>
          🎬 SPONSORED REWARDED AD
        </span>

        <h3 style={{ fontSize: '1.3rem', color: '#1f2937', fontWeight: 800, margin: '0 0 0.25rem' }}>
          Watch Sponsored Ad for {rewardTitle}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 1.25rem' }}>
          Support LovelyCrafts Arcade to claim instant in-game boosts!
        </p>

        {/* Simulated Sponsored Ad Player / Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f3eb, #f8f3eb)',
          borderRadius: '16px',
          padding: '1.5rem 1rem',
          color: '#ffffff',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎁✨</span>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#fef08a' }}>
            LovelyCrafts Premium Gift Pass
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#e0e7ff', margin: 0 }}>
            Create personalized WhatsApp surprises for birthdays, proposals & anniversaries!
          </p>

          <div style={{
            marginTop: '1rem',
            background: 'rgba(255,255,255,0.15)',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'inline-block'
          }}>
            {watching ? `⏱️ Reward unlocks in ${countdown}s` : '✅ Ad Complete! Click Claim Below'}
          </div>
        </div>

        {/* Action Buttons */}
        {completed ? (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleClaim}
            style={{
              padding: '0.8rem',
              fontSize: '1rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '999px'
            }}
          >
            🎉 Claim {rewardTitle} Now!
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary w-full"
            disabled
            style={{
              padding: '0.8rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '999px',
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
          >
            Please wait ({countdown}s)...
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '0.85rem',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          No thanks, close ad
        </button>

      </div>
    </div>
  );
}
