'use client';

import React from 'react';
import Link from 'next/link';

export function LovelyCraftsIcon({ size = 36, className = '' }) {
  const id = React.useId().replace(/:/g, '');
  const gradHeart = `lc-heart-grad-${id}`;
  const gradRibbon = `lc-ribbon-grad-${id}`;
  const gradSparkle = `lc-sparkle-grad-${id}`;
  const glowFilter = `lc-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        {/* Main Heart Gradient */}
        <linearGradient id={gradHeart} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2e74" />
          <stop offset="45%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>

        {/* Origami / Ribbon Fold Accent Gradient */}
        <linearGradient id={gradRibbon} x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Golden Sparkle Gradient */}
        <linearGradient id={gradSparkle} x1="32" y1="4" x2="44" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Main Dimensional Heart Shape */}
      <g>
        <path
          d="M24 41.5C24 41.5 6 30.5 6 18C6 11.5 11 6.5 17.5 6.5C21 6.5 23.5 8.5 24 9.5C24.5 8.5 27 6.5 30.5 6.5C37 6.5 42 11.5 42 18C42 30.5 24 41.5 24 41.5Z"
          fill={`url(#${gradHeart})`}
        />
      </g>

      {/* Craft Origami Wing / Fold Highlight */}
      <path
        d="M24 9.5C22.5 14 17 24 10 27C7.5 23 6 19.5 6 18C6 11.5 11 6.5 17.5 6.5C20.8 6.5 23.2 8.3 24 9.5Z"
        fill={`url(#${gradRibbon})`}
      />

      {/* Inner Gift Ribbon / Envelope Cross Fold Line */}
      <path
        d="M17.5 6.5C21.5 14 26.5 25 24 41.5"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Craft Heart Envelope Bow Accent */}
      <path
        d="M24 20C21.5 17 18 19 19.5 21.5C21 24 24 22 24 22C24 22 27 24 28.5 21.5C30 19 26.5 17 24 20Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Golden Magic Star Sparkle 1 (Top Right) */}
      <path
        d="M38 4L39.2 8.8L44 10L39.2 11.2L38 16L36.8 11.2L32 10L36.8 8.8L38 4Z"
        fill={`url(#${gradSparkle})`}
      />

      {/* Small Magic Sparkles */}
      <circle cx="10" cy="34" r="1.5" fill="#fef08a" opacity="0.9" />
      <circle cx="38" cy="28" r="1.2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

export default function LovelyCraftsLogo({
  href = '/',
  size = 40,
  textColor = '#0f172a',
  accentColor = '#f43f5e',
  showText = true,
  className = '',
  style = {},
}) {
  const id = React.useId().replace(/:/g, '');
  const gradHeart = `full-heart-${id}`;
  const gradRibbon = `full-ribbon-${id}`;
  const gradSparkle = `full-sparkle-${id}`;
  const glowFilter = `full-glow-${id}`;
  const textGrad = `full-text-grad-${id}`;

  // Proportions: width is 4.75x of height for perfect compact density
  const width = showText ? Math.round(size * 4.75) : size;
  const height = size;

  const svgContent = (
    <svg
      width={width}
      height={height}
      viewBox={showText ? "0 0 210 44" : "0 0 48 48"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        {/* Heart Gradients */}
        <linearGradient id={gradHeart} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2e74" />
          <stop offset="45%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>

        <linearGradient id={gradRibbon} x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={gradSparkle} x1="32" y1="4" x2="44" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        {/* Crafts Text Gradient Accent */}
        <linearGradient id={textGrad} x1="120" y1="10" x2="205" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2a6d" />
          <stop offset="55%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        <filter id={glowFilter} x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#f43f5e" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ================= HEART ICON ================= */}
      <g transform="translate(0, -2)">
        {/* Main Heart with glow */}
        <g filter={`url(#${glowFilter})`}>
          <path
            d="M24 41.5C24 41.5 6 30.5 6 18C6 11.5 11 6.5 17.5 6.5C21 6.5 23.5 8.5 24 9.5C24.5 8.5 27 6.5 30.5 6.5C37 6.5 42 11.5 42 18C42 30.5 24 41.5 24 41.5Z"
            fill={`url(#${gradHeart})`}
          />
        </g>

        {/* Origami fold highlight */}
        <path
          d="M24 9.5C22.5 14 17 24 10 27C7.5 23 6 19.5 6 18C6 11.5 11 6.5 17.5 6.5C20.8 6.5 23.2 8.3 24 9.5Z"
          fill={`url(#${gradRibbon})`}
        />

        {/* Gift ribbon fold line */}
        <path
          d="M17.5 6.5C21.5 14 26.5 25 24 41.5"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Heart Envelope bow */}
        <path
          d="M24 20C21.5 17 18 19 19.5 21.5C21 24 24 22 24 22C24 22 27 24 28.5 21.5C30 19 26.5 17 24 20Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Top Right Golden Star Sparkle */}
        <path
          d="M38 4L39.2 8.8L44 10L39.2 11.2L38 16L36.8 11.2L32 10L36.8 8.8L38 4Z"
          fill={`url(#${gradSparkle})`}
        />

        {/* Floating Sparkles */}
        <circle cx="10" cy="34" r="1.5" fill="#fef08a" opacity="0.9" />
        <circle cx="38" cy="28" r="1.2" fill="#ffffff" opacity="0.8" />
      </g>

      {/* ================= VECTOR TYPOGRAPHY ================= */}
      {showText && (
        <g transform="translate(50, 31)">
          {/* "Lovely" Text */}
          <text
            x="0"
            y="0"
            fill={textColor}
            style={{
              fontFamily: 'var(--font-bold), Fredoka, Inter, system-ui, -apple-system, sans-serif',
              fontWeight: 800,
              fontSize: '27px',
              letterSpacing: '-0.025em',
            }}
          >
            Lovely
          </text>

          {/* "Crafts" Cursive Script */}
          <text
            x="81"
            y="3"
            fill={accentColor === '#f43f5e' || accentColor === '#e11d48' ? `url(#${textGrad})` : accentColor}
            style={{
              fontFamily: 'var(--font-cursive), var(--font-dancing), "Caveat", "Dancing Script", cursive, sans-serif',
              fontWeight: 700,
              fontSize: '38px',
              fontStyle: 'italic',
              letterSpacing: '0.01em',
            }}
          >
            Crafts
          </text>
        </g>
      )}
    </svg>
  );

  if (href) {
    return (
      <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
        {svgContent}
      </Link>
    );
  }

  return svgContent;
}
