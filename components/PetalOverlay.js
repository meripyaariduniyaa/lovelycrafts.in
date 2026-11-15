'use client';

import { useEffect, useRef } from 'react';

/**
 * PetalOverlay
 *
 * An ambient, non-intrusive floating overlay that drops a few small,
 * delicate petals in shades of red, orange, and pink.
 *
 * Features:
 * - Ultra-lightweight canvas 2D rendering with Retina DPI scaling
 * - 3D tumble simulation (flip & flutter) using cosine perspective scaling
 * - Subtle sine-wave lateral breeze drift
 * - Strict pointer-events: none (zero obstruction to clicks or scrolls)
 * - Automatically pauses when tab is hidden or prefers-reduced-motion is enabled
 */

// Curated palette of red, orange, and pink petals
const PETAL_PALETTE = [
  // Reds
  { fill: 'rgba(225, 29, 72, 0.72)', shadow: 'rgba(225, 29, 72, 0.25)' },   // rose crimson
  { fill: 'rgba(220, 38, 38, 0.68)', shadow: 'rgba(220, 38, 38, 0.22)' },   // velvet red
  { fill: 'rgba(190, 24, 93, 0.70)', shadow: 'rgba(190, 24, 93, 0.25)' },   // deep berry red

  // Oranges
  { fill: 'rgba(249, 115, 22, 0.70)', shadow: 'rgba(249, 115, 22, 0.22)' },  // warm tangerine
  { fill: 'rgba(251, 146, 60, 0.68)', shadow: 'rgba(251, 146, 60, 0.20)' },  // apricot coral
  { fill: 'rgba(245, 158, 11, 0.65)', shadow: 'rgba(245, 158, 11, 0.20)' },  // golden amber

  // Pinks
  { fill: 'rgba(244, 114, 182, 0.72)', shadow: 'rgba(244, 114, 182, 0.24)' }, // blossom pink
  { fill: 'rgba(236, 72, 153, 0.72)', shadow: 'rgba(236, 72, 153, 0.24)' }, // romantic pink
  { fill: 'rgba(251, 113, 133, 0.70)', shadow: 'rgba(251, 113, 133, 0.22)' }, // soft flamingo
  { fill: 'rgba(253, 164, 175, 0.68)', shadow: 'rgba(253, 164, 175, 0.18)' }, // light blush pink
];

// Number of petals visible at any time — subtle and peaceful
const PETAL_COUNT = 15;

function createPetal(width, height, startAtTop = false) {
  const size = 7 + Math.random() * 6; // 7px - 13px
  const x = Math.random() * width;
  const y = startAtTop
    ? -(15 + Math.random() * 50)
    : Math.random() * (height + 50);

  const speedY = 0.45 + Math.random() * 0.45; // gentle downward drift (0.45 - 0.9 px/frame)
  const speedX = -0.15 + Math.random() * 0.3; // subtle horizontal drift
  const angle = Math.random() * Math.PI * 2;
  const angularSpeed = (Math.random() - 0.5) * 0.02;

  // 3D tumble flip speed (tumbling through the air)
  const flip = Math.random() * Math.PI * 2;
  const flipSpeed = 0.015 + Math.random() * 0.025;

  // Sine-wave sway
  const swayPhase = Math.random() * Math.PI * 2;
  const swaySpeed = 0.012 + Math.random() * 0.015;
  const swayRadius = 0.5 + Math.random() * 0.8;

  const color = PETAL_PALETTE[Math.floor(Math.random() * PETAL_PALETTE.length)];
  const opacity = 0.65 + Math.random() * 0.35;

  return {
    x,
    y,
    size,
    speedY,
    speedX,
    angle,
    angularSpeed,
    flip,
    flipSpeed,
    swayPhase,
    swaySpeed,
    swayRadius,
    color,
    opacity,
  };
}

/**
 * Draws a natural curved petal with gentle 3D perspective tumble
 */
function renderPetal(ctx, p) {
  const tumbleScale = Math.cos(p.flip); // 1 to -1 to 1 (simulates 3D flipping in air)

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.scale(tumbleScale, 1);
  ctx.globalAlpha = p.opacity;

  const r = p.size;
  const halfR = r * 0.55;

  // Organic petal shape using smooth cubic beziers
  ctx.beginPath();
  ctx.moveTo(0, -r);
  // Right curve of petal
  ctx.bezierCurveTo(halfR * 1.25, -r * 0.7, halfR * 1.35, r * 0.4, 0, r);
  // Left curve of petal
  ctx.bezierCurveTo(-halfR * 1.35, r * 0.4, -halfR * 1.25, -r * 0.7, 0, -r);
  ctx.closePath();

  ctx.fillStyle = p.color.fill;
  ctx.fill();

  // Subtle interior vein highlight for authentic depth
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.quadraticCurveTo(halfR * 0.15, 0, 0, r * 0.7);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.65;
  ctx.stroke();

  ctx.restore();
}

export default function PetalOverlay() {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isTabVisibleRef = useRef(true);

  useEffect(() => {
    // Respect prefers-reduced-motion accessibility setting
    if (typeof window === 'undefined') return;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Seed the initial petals across the viewport
    petalsRef.current = Array.from({ length: PETAL_COUNT }, () =>
      createPetal(width, height, false)
    );

    // Pause animation when tab is inactive to preserve CPU / battery
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const tick = () => {
      if (isTabVisibleRef.current) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < petalsRef.current.length; i++) {
          const p = petalsRef.current[i];

          // Advance physics
          p.swayPhase += p.swaySpeed;
          p.x += p.speedX + Math.sin(p.swayPhase) * p.swayRadius;
          p.y += p.speedY;
          p.angle += p.angularSpeed;
          p.flip += p.flipSpeed;

          // If petal drifts off bottom, recycle to top
          if (p.y > height + 20) {
            petalsRef.current[i] = createPetal(width, height, true);
          }

          // If petal drifts off horizontally, gently wrap around
          if (p.x < -30) {
            p.x = width + 25;
          } else if (p.x > width + 30) {
            p.x = -25;
          }

          renderPetal(ctx, p);
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 45, // Visible foreground overlay above sections, but below modals/topbar
        pointerEvents: 'none', // 100% click-through
        contain: 'strict',
      }}
    />
  );
}
