'use client';

import { useState } from 'react';
import { triggerHaptic } from '@/lib/haptics';

export default function ShareButtons({ text, toolTitle, toolSlug }) {
  const [copied, setCopied] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : `https://lovelycrafts.in/tools/${toolSlug}`;
  const shareText = `${text}\n\nTry it yourself: ${url}`;
  const igStoryText = `✨ ${text}\n\n💌 Try this free tool at lovelycrafts.in/tools/${toolSlug}!\n👉 Link in bio / stories`;

  const handleWhatsApp = () => {
    triggerHaptic('success');
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  };

  const handleX = () => {
    triggerHaptic('selection');
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener'
    );
  };

  const handleCopy = async () => {
    triggerHaptic('selection');
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstagramStoryCopy = async () => {
    triggerHaptic('success');
    try {
      await navigator.clipboard.writeText(igStoryText);
      setCopiedStory(true);
      setTimeout(() => setCopiedStory(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = igStoryText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedStory(true);
      setTimeout(() => setCopiedStory(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic('selection');
    if (navigator.share) {
      try {
        await navigator.share({ title: toolTitle, text, url });
      } catch {
        // User cancelled or error — ignore
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="tool-share-buttons">
      <span className="tool-share-label">1-Tap Share Result:</span>
      <div className="tool-share-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {/* WhatsApp 1-tap share */}
        <button
          type="button"
          className="tool-share-btn tool-share-whatsapp"
          onClick={handleWhatsApp}
          title="Share directly on WhatsApp"
          style={{ minHeight: '44px', touchAction: 'manipulation' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* Instagram Story 1-tap copy */}
        <button
          type="button"
          onClick={handleInstagramStoryCopy}
          title="Copy formatted result for Instagram Story"
          style={{
            background: copiedStory ? '#059669' : 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '44px',
            touchAction: 'manipulation',
            boxShadow: '0 4px 12px rgba(225, 48, 108, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>📸</span>
          <span>{copiedStory ? '✓ Copied for Story!' : 'IG Story Copy'}</span>
        </button>

        {/* Quick Link Copy */}
        <button
          type="button"
          className="tool-share-btn tool-share-copy"
          onClick={handleCopy}
          title="Copy link to clipboard"
          style={{ minHeight: '44px', touchAction: 'manipulation' }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied Link!</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>

        {/* X (Twitter) */}
        <button
          type="button"
          className="tool-share-btn tool-share-x"
          onClick={handleX}
          title="Share on X"
          style={{ minHeight: '44px', touchAction: 'manipulation' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X</span>
        </button>

        {hasNativeShare && (
          <button
            type="button"
            className="tool-share-btn tool-share-native"
            onClick={handleNativeShare}
            title="Share via device menu"
            style={{ minHeight: '44px', touchAction: 'manipulation' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  );
}

