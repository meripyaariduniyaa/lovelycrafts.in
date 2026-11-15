'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * GoogleAd Component
 * 
 * Renders a Google AdSense ad unit.
 * Automatically suppresses rendering on:
 * - /create (creation flow)
 * - /preview (preview before payment)
 * - /p/* (shared recipient experience pages)
 */
export default function GoogleAd({
  slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || '',
  format = 'auto',
  responsive = 'true',
  style = { display: 'block' },
  className = '',
}) {
  const pathname = usePathname();
  const adRef = useRef(null);
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Explicitly check excluded routes (/admin, /drive, /del, /create, /preview, /p/*, /c/*)
  const isExcludedRoute =
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/drive') ||
    pathname.startsWith('/del') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/tools');

  useEffect(() => {
    if (isExcludedRoute || !adsenseClientId || !slot) return;

    try {
      if (
        typeof window !== 'undefined' &&
        adRef.current &&
        !adRef.current.getAttribute('data-adsbygoogle-status') &&
        adRef.current.children.length === 0
      ) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ignore duplicate push warnings or transient AdSense errors
    }
  }, [pathname, adsenseClientId, slot, isExcludedRoute]);

  // Never render on create, preview, or shared link pages
  if (isExcludedRoute || !adsenseClientId || !slot) {
    return null;
  }

  return (
    <div
      className={`ad-wrapper ${className}`}
      style={{
        margin: '1.5rem auto',
        padding: '0.5rem',
        textAlign: 'center',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '0.65rem',
          color: '#9ca3af',
          marginBottom: '4px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Advertisement
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={adsenseClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
