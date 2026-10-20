'use client';

import { useState } from 'react';

import { WhatsAppIcon, XIcon, LinkIcon, ShareIcon } from '@/components/AppIcons';

export default function BlogShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  // Normalize URL to always use lovelycrafts.in
  const cleanUrl = (url || 'https://lovelycrafts.in')
    .replace('https://meripyaariduniyaa.com', 'https://lovelycrafts.in')
    .replace('http://localhost:3000', 'https://lovelycrafts.in');

  const encodedUrl = encodeURIComponent(cleanUrl);
  const encodedTitle = encodeURIComponent(title || 'LovelyCrafts');

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title,
        url: cleanUrl,
      }).catch(() => {});
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
        Share:
      </span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#25D366',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 6px rgba(37,211,102,0.25)',
        }}
      >
        <WhatsAppIcon size={16} color="#ffffff" />
        <span>WhatsApp</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#f8f3eb',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <XIcon size={14} color="#ffffff" />
        <span>Post</span>
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        style={{
          background: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <LinkIcon size={15} color="#475569" />
        <span>{copied ? '✓ Copied!' : 'Copy Link'}</span>
      </button>

      {/* Native Mobile Share if supported */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          type="button"
          onClick={handleNativeShare}
          style={{
            background: '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShareIcon size={14} color="#be123c" />
          <span>More</span>
        </button>
      )}
    </div>
  );
}
