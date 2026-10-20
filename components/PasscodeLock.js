'use client';

import { useState } from 'react';

export default function PasscodeLock({ passcode, secretQuestion, recipientName, onUnlocked }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const isFourDigitCode = /^\d{4}$/.test(String(passcode || ''));

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const cleanInput = input.trim().toLowerCase();
    const cleanPasscode = String(passcode || '').trim().toLowerCase();

    if (cleanInput === cleanPasscode) {
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        onUnlocked?.();
      }, 700);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="passcode-lock-wrapper">
      <div className={`passcode-card ${shake ? 'shake-anim' : ''} ${success ? 'unlock-anim' : ''}`}>
        <div className="lock-icon-badge">
          {success ? '🔓' : '🔒'}
        </div>

        <p className="secret-eyebrow">A SECRET FOR {recipientName?.toUpperCase() || 'YOU'}</p>
        <h1 className="lock-title">
          {secretQuestion ? secretQuestion : 'Enter the secret passcode'}
        </h1>
        <p className="lock-subtitle">
          Only someone special knows the answer to unlock this memory.
        </p>

        <form onSubmit={handleSubmit} className="passcode-form">
          <input
            type="text"
            inputMode={isFourDigitCode ? 'numeric' : 'text'}
            maxLength={isFourDigitCode ? 4 : undefined}
            className={`passcode-input ${error ? 'input-error' : ''}`}
            placeholder="Type answer or code…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(false);
            }}
            autoFocus
          />

          <button type="submit" className="unlock-btn">
            {success ? '✓ Unlocked!' : 'Unlock Experience ✨'}
          </button>
        </form>

        {error && (
          <p className="error-message">
            Oops! That answer isn&apos;t quite right. Try again ❤️
          </p>
        )}
      </div>

      <style jsx>{`
        .passcode-lock-wrapper {
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .passcode-card {
          width: min(92vw, 440px);
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 28px;
          padding: 40px 28px;
          text-align: center;
          box-shadow: 0 24px 60px rgba(136, 19, 55, 0.14), 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
        }

        .lock-icon-badge {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff1f2, #ffe4e6);
          border: 2px solid #fecdd3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 16px;
          box-shadow: 0 8px 20px rgba(244, 63, 94, 0.15);
        }

        .secret-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #be185d;
          margin: 0 0 6px;
        }

        .lock-title {
          font-size: clamp(1.4rem, 4.5vw, 1.85rem);
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .lock-subtitle {
          font-size: 13.5px;
          color: #6b7280;
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .passcode-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .passcode-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fafaf9;
          text-align: center;
          font-weight: 600;
          color: #111827;
          outline: none;
          transition: all 0.2s ease;
        }

        .passcode-input:focus {
          border-color: #f43f5e;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
        }

        .passcode-input.input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .unlock-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #a64036, #a64036);
          color: #43332b;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(190, 24, 93, 0.3);
          transition: all 0.2s ease;
        }

        .unlock-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(190, 24, 93, 0.4);
        }

        .error-message {
          font-size: 12.5px;
          color: #e11d48;
          font-weight: 600;
          margin-top: 14px;
        }

        .shake-anim {
          animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .unlock-anim {
          transform: scale(1.05);
          opacity: 0;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
