'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScratchPhotoCard: Interactive canvas scratch-to-reveal photo component
 */
function ScratchPhotoCard({ photo, accentColor, onScratchComplete }) {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    setIsRevealed(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    
    // Draw rich metallic gold/pink scratch gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.3, '#fbbf24');
    grad.addColorStop(0.7, '#f43f5e');
    grad.addColorStop(1, '#be185d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw sparkle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 37 + 13) % width;
      const sy = (i * 53 + 7) % height;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scratch prompt text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText('✨ Scratch to reveal memory ✨', width / 2, height / 2 - 10);

    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('Rub with finger or mouse', width / 2, height / 2 + 16);
  }, [photo.url]);

  const scratch = (clientX, clientY) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    checkProgress(canvas, ctx);
  };

  const checkProgress = (canvas, ctx) => {
    if (isRevealed) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] === 0) transparentCount++;
    }

    const totalSampled = pixels.length / 64;
    const clearedRatio = transparentCount / totalSampled;

    if (clearedRatio > 0.45) {
      setIsRevealed(true);
      if (onScratchComplete) onScratchComplete();
    }
  };

  const handleMouseDown = (e) => { isDrawing.current = true; scratch(e.clientX, e.clientY); };
  const handleMouseMove = (e) => { if (isDrawing.current) scratch(e.clientX, e.clientY); };
  const handleMouseUp = () => { isDrawing.current = false; };
  const handleTouchStart = (e) => { isDrawing.current = true; if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchMove = (e) => { if (isDrawing.current && e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY); };
  const handleTouchEnd = () => { isDrawing.current = false; };

  return (
    <div style={{ width: '100%', height: '260px', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
      {/* Photo Image */}
      <img
        src={photo.url}
        alt={photo.caption || 'Polaroid moment'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Scratch Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas
            ref={canvasRef}
            width={340}
            height={260}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
              touchAction: 'none',
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>

      {/* Glossy light reflection sheen when revealed */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

/**
 * 3D Interactive Polaroid Cards with Scratch-to-Reveal Mechanic
 */
export default function PolaroidStack({
  photos = [],
  caption = '',
  maxDisplay = 4,
  accentColor = '#f43f5e',
  defaultPhotos: customDefaultPhotos,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackPhotos = customDefaultPhotos || [
    { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop', caption: 'The smile that changed everything' },
    { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop', caption: 'Our late night talks & warm chai' },
    { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop', caption: 'Every memory feels like home' }
  ];

  // Defensive extraction for string URLs or object photo items
  const photoList = (photos && photos.length > 0)
    ? photos.map((p, idx) => (typeof p === 'string' ? { url: p, caption: `Memory #${idx + 1}` } : (p?.url ? p : { url: p, caption: `Memory #${idx + 1}` })))
    : fallbackPhotos;

  const currentPhoto = photoList[activeIndex % photoList.length];

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % photoList.length);
  };

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '360px', margin: '0 auto', perspective: '1200px' }}>
      {/* Decorative fairy light string above */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '8px', padding: '0 20px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#fef08a',
              boxShadow: '0 0 10px #f59e0b, 0 0 20px #fbbf24',
            }}
          />
        ))}
      </div>

      {/* Main Polaroid Frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, rotate: -4, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, rotate: activeIndex % 2 === 0 ? 2 : -2, scale: 1, y: 0 }}
          exit={{ opacity: 0, rotate: 6, scale: 0.9, y: -15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.02 }}
          style={{
            background: '#ffffff',
            padding: '14px 14px 22px 14px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Scratch photo canvas replacing static frame */}
          <ScratchPhotoCard
            photo={currentPhoto}
            accentColor={accentColor}
          />

          {/* Handwritten Caption */}
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-caveat), "Caveat", "Dancing Script", cursive',
                fontSize: '1.45rem',
                color: '#1e293b',
                lineHeight: 1.2,
                fontWeight: 700,
              }}
            >
              {caption || currentPhoto.caption}
            </p>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginTop: '4px',
              }}
            >
              Memory {activeIndex + 1} of {photoList.length}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls: Arrows & Thumb Dots */}
      {photoList.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={prevPhoto}
            aria-label="Previous memory"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            ←
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {photoList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                style={{
                  width: activeIndex === i ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '99px',
                  background: activeIndex === i ? accentColor : 'rgba(255, 255, 255, 0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                aria-label={`View photo ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={nextPhoto}
            aria-label="Next memory"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
