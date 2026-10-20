'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Interactive Sparkler Canvas
 * Users draw with finger/mouse to ignite sparkling golden firework trails.
 */
export default function SparklerCanvas({ onSparkDraw, targetName = '' }) {
  const canvasRef = useRef(null);
  const [ignited, setIgnited] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 240);

    const sparks = [];

    const addSparks = (x, y) => {
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          color: ['#ffffff', '#fef08a', '#fbbf24', '#f59e0b', '#f43f5e'][Math.floor(Math.random() * 5)],
          life: 1,
          decay: Math.random() * 0.04 + 0.02,
        });
      }
    };

    let isDrawing = false;

    const handlePointerDown = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      addSparks(x, y);
      setIgnited(true);
      setDrawnPoints((prev) => prev + 1);
    };

    const handlePointerMove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (!clientX || !clientY) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      addSparks(x, y);
      setDrawnPoints((prev) => {
        const next = prev + 1;
        if (next === 30 && onSparkDraw) onSparkDraw();
        return next;
      });
    };

    const handlePointerUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    let animId;
    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08; // gravity
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      cancelAnimationFrame(animId);
    };
  }, [onSparkDraw]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '2px solid rgba(251, 191, 36, 0.4)',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '240px',
          display: 'block',
          cursor: 'crosshair',
          touchAction: 'none',
          background: '#f8f3eb',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        {!ignited ? (
          <>
            <span
              style={{
                background: 'linear-gradient(135deg, #fef08a, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'var(--font-fredoka), sans-serif',
              }}
            >
              ✨ Draw on screen to light the Sparkler!
            </span>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Touch or drag mouse across the canvas for {targetName || 'them'}
            </p>
          </>
        ) : (
          <div style={{ opacity: 0.85 }}>
            <span style={{ color: '#fef08a', fontSize: '1.1rem', fontWeight: 800, textShadow: '0 0 10px #f59e0b' }}>
              ✦ Lighting the Celebration for {targetName} ✦
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
