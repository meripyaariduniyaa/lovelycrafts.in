'use client';

import { useState } from 'react';

export default function WaxSealEnvelope({ recipientName, onOpen, senderName }) {
  const [isOpening, setIsOpening] = useState(false);
  const initial = (recipientName || 'You').trim().charAt(0).toUpperCase();

  const handleBreakSeal = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      onOpen?.();
    }, 900);
  };

  return (
    <div className="wax-seal-wrapper">
      <div className={`envelope-container ${isOpening ? 'is-opening' : ''}`}>
        {/* Envelope Top Flap */}
        <div className="envelope-flap" />

        {/* Envelope Body */}
        <div className="envelope-body">
          <div className="envelope-lines">
            <span className="stamp-badge">📮 AIR MAIL</span>
            <p className="to-label">FOR</p>
            <h2 className="recipient-name-heading">{recipientName || 'Someone Special'}</h2>
            {senderName && <p className="from-label">From: {senderName}</p>}
            <p className="confidential-tag">♥ PRIVATE & CONFIDENTIAL</p>
          </div>
        </div>

        {/* 3D Wax Seal Button */}
        <button
          type="button"
          className="wax-seal-stamp"
          onClick={handleBreakSeal}
          aria-label="Break wax seal to open envelope"
        >
          <div className="wax-seal-inner">
            <span className="wax-initial">{initial}</span>
            <span className="wax-ring" />
          </div>
          <div className="seal-sparkles">
            <span>✨</span>
            <span>✨</span>
          </div>
        </button>

        <p className="tap-hint">
          {isOpening ? 'Unwrapping your moment…' : 'Tap the wax seal to unwrap'}
        </p>
      </div>

      <style jsx>{`
        .wax-seal-wrapper {
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          perspective: 1200px;
        }

        .envelope-container {
          position: relative;
          width: min(92vw, 460px);
          height: 300px;
          background: #fdfbf7;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(136, 19, 55, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08);
          border: 2px solid #f2e8dc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease;
        }

        .envelope-container.is-opening {
          transform: scale(1.08) translateY(-20px) rotateX(15deg);
          opacity: 0;
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(180deg, #f7f1e5 0%, #f4ecdc 100%);
          clip-path: polygon(0 0, 50% 100%, 100% 0);
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .envelope-body {
          position: relative;
          z-index: 1;
          width: 86%;
          text-align: center;
          margin-top: 30px;
        }

        .stamp-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #be185d;
          background: #ffe4e6;
          border: 1px dashed #f43f5e;
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .to-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9ca3af;
          margin: 0;
        }

        .recipient-name-heading {
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          color: #881337;
          margin: 4px 0 6px;
          letter-spacing: -0.02em;
        }

        .from-label {
          font-size: 13px;
          color: #6b7280;
          font-style: italic;
          margin: 0;
        }

        .confidential-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #db2777;
          margin-top: 12px;
          opacity: 0.85;
        }

        .wax-seal-stamp {
          position: absolute;
          top: 96px;
          z-index: 10;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #a64036 0%, #a64036 50%, #f8f3eb 100%);
          border: none;
          box-shadow: 0 10px 25px rgba(136, 19, 55, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.35);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
          animation: gentlePulse 2.8s ease-in-out infinite;
        }

        .wax-seal-stamp:hover {
          transform: scale(1.12);
          box-shadow: 0 14px 30px rgba(136, 19, 55, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.5);
        }

        .wax-seal-stamp:active {
          transform: scale(0.95);
        }

        .wax-seal-inner {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px dashed rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wax-initial {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff1f2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
        }

        .seal-sparkles {
          position: absolute;
          top: -6px;
          right: -6px;
          font-size: 14px;
          pointer-events: none;
          animation: floatSparkle 1.8s ease-in-out infinite alternate;
        }

        .tap-hint {
          position: absolute;
          bottom: -48px;
          font-size: 13px;
          font-weight: 600;
          color: #be185d;
          letter-spacing: 0.04em;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          padding: 6px 16px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          border: 1px solid rgba(244, 63, 94, 0.2);
        }

        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes floatSparkle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          100% { transform: translateY(-4px) rotate(15deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
