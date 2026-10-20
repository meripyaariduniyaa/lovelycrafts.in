'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Curated Gen-Z Bubu & Dudu animated stickers & memes
 * High performance, cross-origin CDN webp/gifs with fallback
 */
export const BUBU_MEMES = {
  // Proposal / Love
  proposeHeart: 'https://media.tenor.com/UbiOjXKLkZIAAAAm/bubu-dudu.webp',
  loveHug: 'https://media.tenor.com/hlr3kptkdu4AAAAm/bubu-dudu.webp',
  kissHearts: 'https://media.tenor.com/OFV8jy2OuwYAAAAm/bibimbaobei-bububaobei.webp',
  happyWalk: 'https://media.tenor.com/sUPu9ZEW0kcAAAAm/bubu-dudu-lovely-bubu-dudu-walk.webp',
  fingerGuns: 'https://media.tenor.com/3qIAMwBVG8UAAAAm/finger-guns-dudu.webp',
  cuddleLove: 'https://media.tenor.com/Zrr4L_Wd4JkAAAAm/bubu-rub-bubu-love-dudu.webp',

  // Birthday / Party
  birthdayDance: 'https://media.tenor.com/X4UKmuPSJZwAAAAM/bubu-dance-bubu-dudu.gif',
  blowHearts: 'https://media.tenor.com/Snjg0UcisEEAAAAm/bubu-dudu.webp',
  happySmile: 'https://media.tenor.com/IUvV1AjqwOgAAAAm/tkthao219-bubududu.webp',
  partyBears: 'https://media.tenor.com/D6HDHJLAqb4AAAAm/dudu-bubu-dudu.webp',

  // Apology / Sad
  cryTears: 'https://media.tenor.com/bng5z5CX_DQAAAAm/bubu-bubu-cry.webp',
  phoneCry: 'https://media.tenor.com/z7ZABFfLkn8AAAAm/kh%C3%B3c.webp',
  sorrySad: 'https://media.tenor.com/k3vWOPsbToUAAAAm/sorry.webp',
  forgivenHug: 'https://media.tenor.com/Ki7itoAmuSwAAAAm/mybuni.webp',
};

/** Self-hosted SVG stickers from /elements/ — no CDN dependency */
export const LOCAL_STICKERS = {
  heart:        '/elements/sticker-heart.svg',
  sparkle:      '/elements/sticker-sparkle.svg',
  ribbon:       '/elements/sticker-ribbon.svg',
  envelope:     '/elements/sticker-envelope.svg',
  shootingStar: '/elements/sticker-shooting-star.svg',
};

/** Self-hosted flower photos from /flowers/ */
export const FLOWER_IMAGES = {
  rose:      '/flowers/rose.jpg',
  tulip:     '/flowers/tulip.jpg',
  sunflower: '/flowers/sunflower.jpg',
  bouquet:   '/flowers/bouquet.jpg',
  lavender:  '/flowers/lavender.jpg',
};

/**
 * Animated Bubu Dudu Meme Sticker component
 */
export function BubuSticker({ src, caption, size = 110, className = '', animate = true }) {
  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))',
        }}
      >
        <img
          src={src}
          alt="Bubu Dudu sticker"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '16px',
          }}
          loading="eager"
        />
      </div>

      {caption && (
        <span
          style={{
            marginTop: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#fde68a',
            background: 'rgba(247, 238, 228, 0.96)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '3px 10px',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            backdropFilter: 'blur(8px)',
          }}
        >
          {caption}
        </span>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Self-hosted SVG Sticker (from /elements/)
───────────────────────────────────────────────────────── */

/**
 * Renders a local SVG sticker from /elements/sticker-*.svg
 * Usage: <SvgSticker name="heart" size={64} />
 *        <SvgSticker src="/elements/sticker-ribbon.svg" size={80} />
 */
export function SvgSticker({ name, src, size = 64, caption, animate = true, className = '' }) {
  const imgSrc = src || LOCAL_STICKERS[name];
  return (
    <motion.div
      initial={animate ? { scale: 0.7, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={{ scale: 1.15, rotate: [-2, 2, -2, 0] }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
      className={className}
    >
      <img
        src={imgSrc}
        alt={caption || name || 'sticker'}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.3))',
        }}
      />
      {caption && (
        <span style={{
          marginTop: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fde68a',
          background: 'rgba(247, 238, 228, 0.96)',
          padding: '2px 8px',
          borderRadius: '999px',
        }}>
          {caption}
        </span>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   HIGH QUALITY VECTOR SVGS (Replacing generic emojis)
───────────────────────────────────────────────────────── */

export function RoseSvg({ size = 52, color = '#f43f5e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id="roseGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Stem */}
      <path d="M32 38 C32 46 30 54 28 60" stroke="url(#stemGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 46 C38 43 44 45 46 48 C41 51 35 50 32 46 Z" fill="url(#stemGrad)" opacity="0.9" />
      <path d="M31 52 C25 50 20 53 18 56 C23 58 29 56 31 52 Z" fill="url(#stemGrad)" opacity="0.9" />
      {/* Petals */}
      <path d="M32 8 C22 8 16 18 20 28 C23 35 30 38 32 38 C34 38 41 35 44 28 C48 18 42 8 32 8 Z" fill="url(#roseGlow)" />
      <path d="M26 18 C26 14 30 11 34 12 C38 13 40 18 38 23 C36 27 30 30 26 26 Z" fill="#fb7185" opacity="0.75" />
      <path d="M30 15 C33 13 36 15 36 18 C36 21 33 22 31 21 Z" fill="#ffe4e6" opacity="0.9" />
    </svg>
  );
}

export function ChampagneSvg({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Left Glass */}
      <g transform="rotate(-15 26 40)">
        <path d="M22 14 L28 14 L27 30 C27 34 23 34 23 30 Z" fill="url(#glassGrad)" opacity="0.85" />
        <path d="M25 34 L25 50 M20 50 L30 50" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="25" cy="14" rx="3" ry="1.5" stroke="#fef08a" strokeWidth="1" fill="#fde68a" />
      </g>
      {/* Right Glass */}
      <g transform="rotate(15 38 40)">
        <path d="M36 14 L42 14 L41 30 C41 34 37 34 37 30 Z" fill="url(#glassGrad)" opacity="0.85" />
        <path d="M39 34 L39 50 M34 50 L44 50" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="39" cy="14" rx="3" ry="1.5" stroke="#fef08a" strokeWidth="1" fill="#fde68a" />
      </g>
      {/* Sparkle clink */}
      <path d="M32 18 L34 23 L39 25 L34 27 L32 32 L30 27 L25 25 L30 23 Z" fill="#ffffff" />
    </svg>
  );
}

export function BirthdayCakeSvg({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="cakeBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="icing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
        <linearGradient id="flame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* Plate */}
      <ellipse cx="40" cy="66" rx="34" ry="6" fill="#475569" opacity="0.3" />
      <ellipse cx="40" cy="64" rx="32" ry="5" fill="#e2e8f0" />
      {/* Bottom Layer */}
      <rect x="16" y="44" width="48" height="18" rx="6" fill="url(#cakeBase)" />
      <path d="M16 48 C20 52 24 52 28 48 C32 52 36 52 40 48 C44 52 48 52 52 48 C56 52 60 52 64 48 L64 44 L16 44 Z" fill="url(#icing)" />
      {/* Top Layer */}
      <rect x="24" y="28" width="32" height="16" rx="4" fill="url(#cakeBase)" />
      <path d="M24 32 C28 35 32 35 36 32 C40 35 44 35 48 32 C52 35 56 35 56 32 L56 28 L24 28 Z" fill="url(#icing)" />
      {/* Candle */}
      <rect x="38" y="16" width="4" height="12" rx="1.5" fill="#f43f5e" />
      {/* Flame */}
      <path d="M40 8 C38 12 37 14 40 16 C43 14 42 12 40 8 Z" fill="url(#flame)" />
      <circle cx="40" cy="13" r="1.5" fill="#fef08a" />
    </svg>
  );
}

export function HeartBalloonSvg({ size = 54, color = '#f43f5e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id="balloonGlow" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>
      {/* Heart Balloon */}
      <path
        d="M32 52 C32 52 10 38 10 24 C10 14 18 8 26 12 C29 14 31 17 32 19 C33 17 35 14 38 12 C46 8 54 14 54 24 C54 38 32 52 32 52 Z"
        fill="url(#balloonGlow)"
      />
      {/* Highlight reflection */}
      <path d="M18 18 C16 22 18 26 20 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Knot */}
      <polygon points="30,52 34,52 32,55" fill={color} />
      {/* String */}
      <path d="M32 55 Q29 60 33 64" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
