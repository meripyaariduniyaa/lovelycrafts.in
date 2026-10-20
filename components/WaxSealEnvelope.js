'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import PasscodeLock from '@/components/PasscodeLock';

export default function WaxSealEnvelope({ recipientName, onOpen, senderName, isLocked = false, passcode, secretQuestion, onUnlocked }) {
  const [isOpening, setIsOpening] = useState(false);
  const envelopeRef = useRef(null);
  const flapRef = useRef(null);
  const sealRef = useRef(null);
  const letterRef = useRef(null);
  const burstRef = useRef(null);
  const timelineRef = useRef(null);
  const initial = (recipientName || 'You').trim().charAt(0).toUpperCase();

  useEffect(() => () => timelineRef.current?.kill(), []);

  const handleBreakSeal = () => {
    if (isOpening || isLocked) return;
    setIsOpening(true);

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onOpen?.();
      return;
    }

    const timeline = gsap.timeline({ onComplete: () => onOpen?.() });
    timelineRef.current = timeline;
    timeline
      .to(sealRef.current, { scale: 0.2, rotation: 32, opacity: 0, duration: 0.28, ease: 'back.in(2)' })
      .to(flapRef.current, { rotationX: -165, duration: 0.6, ease: 'power3.inOut', transformOrigin: '50% 0%' }, '-=0.08')
      .to(letterRef.current, { y: -128, scale: 1.06, opacity: 1, duration: 0.75, ease: 'back.out(1.35)' }, '-=0.18')
      .fromTo(burstRef.current, { scale: 0.2, opacity: 0 }, { scale: 1.25, opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.1')
      .to(burstRef.current, { scale: 1.8, opacity: 0, duration: 0.45, ease: 'power2.in' })
      .to(envelopeRef.current, { y: -24, scale: 1.04, opacity: 0, duration: 0.45, ease: 'power2.in' }, '-=0.25');
  };

  return (
    <div className="wax-seal-wrapper">
      <div ref={envelopeRef} className={`envelope-container ${isOpening ? 'is-opening' : ''}`}>
        {/* Envelope Top Flap */}
        <div ref={flapRef} className="envelope-flap" />

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

        <div ref={letterRef} className="envelope-letter" aria-hidden="true">
          <span>✉</span>
          <strong>A little note, made just for you</strong>
        </div>

        <div ref={burstRef} className="envelope-burst" aria-hidden="true">
          <span>✦</span><span>♡</span><span>✧</span><span>✦</span><span>♡</span><span>✧</span>
        </div>

        {/* 3D Wax Seal Button */}
        <button
          ref={sealRef}
          type="button"
          className="wax-seal-stamp"
          onClick={handleBreakSeal}
          disabled={isOpening || isLocked}
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

      {isLocked && (
        <div className="envelope-lock-overlay">
          <PasscodeLock
            passcode={passcode}
            secretQuestion={secretQuestion}
            recipientName={recipientName}
            onUnlocked={onUnlocked}
          />
        </div>
      )}

      <style jsx>{`
        .wax-seal-wrapper {
          position: relative;
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
          transform-style: preserve-3d;
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
          backface-visibility: hidden;
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

        .envelope-letter {
          position: absolute;
          z-index: 3;
          left: 10%;
          right: 10%;
          bottom: 24px;
          min-height: 112px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          box-sizing: border-box;
          border: 1px solid #e7d5c4;
          border-radius: 10px;
          background: linear-gradient(145deg, #fffdf8, #f5eadc);
          box-shadow: 0 8px 20px rgba(86, 57, 38, .16);
          color: #5b4033;
          text-align: center;
          opacity: 0;
          transform: translateY(35px);
        }

        .envelope-letter span { color: #a64036; font-size: 2rem; }
        .envelope-letter strong { font: 600 0.85rem/1.4 'Playfair Display', Georgia, serif; }

        .envelope-burst {
          position: absolute;
          z-index: 12;
          left: 50%;
          top: 46%;
          width: 180px;
          height: 180px;
          margin: -90px;
          display: grid;
          grid-template: repeat(3, 1fr) / repeat(3, 1fr);
          place-items: center;
          color: #b66b53;
          font-size: 1.6rem;
          pointer-events: none;
          opacity: 0;
        }

        .envelope-burst span:nth-child(1) { transform: translate(-55px, -42px); }
        .envelope-burst span:nth-child(2) { transform: translate(0, -68px); }
        .envelope-burst span:nth-child(3) { transform: translate(58px, -38px); }
        .envelope-burst span:nth-child(4) { transform: translate(-68px, 28px); }
        .envelope-burst span:nth-child(5) { transform: translate(0, 60px); }
        .envelope-burst span:nth-child(6) { transform: translate(64px, 34px); }

        .envelope-lock-overlay {
          position: absolute;
          z-index: 20;
          inset: 0;
          display: grid;
          place-items: center;
          border-radius: 22px;
          background: rgba(247, 240, 232, .74);
          backdrop-filter: blur(5px);
        }

        .envelope-lock-overlay :global(.passcode-lock-wrapper) { width: 100%; min-height: 0; }
        .envelope-lock-overlay :global(.passcode-card) { width: min(92%, 420px); }

        @media (max-width: 520px) {
          .envelope-container { height: 280px; }
          .envelope-lock-overlay :global(.passcode-card) { padding: 28px 20px; }
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

        .wax-seal-inner::after {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          opacity: 0;
          background:
            linear-gradient(126deg, transparent 46%, rgba(255,255,255,.92) 48%, transparent 51%),
            linear-gradient(52deg, transparent 47%, rgba(72,24,28,.72) 49%, transparent 52%);
          clip-path: polygon(49% 0, 56% 35%, 100% 45%, 62% 53%, 57% 100%, 45% 62%, 0 55%, 42% 46%);
          transition: opacity .08s linear;
        }

        .envelope-container.is-opening .wax-seal-inner::after { opacity: 1; }

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
