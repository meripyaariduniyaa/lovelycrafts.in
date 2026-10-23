'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const PRIVATE_PATH = /^\/(?:p|invoice|profile|creator|preview|success)(?:\/|$)/i;

export default function GoogleAnalytics({ measurementId }) {
  const pathname = usePathname();
  const currentPath = useRef(pathname || '/');
  const lastPageView = useRef('');
  const initialized = useRef(false);
  currentPath.current = pathname || '/';

  const trackPageView = useCallback((path) => {
    if (!window.gtag || PRIVATE_PATH.test(path) || lastPageView.current === path) return;
    lastPageView.current = path;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: `${window.location.origin}${path}`,
      page_title: document.title,
    });
  }, []);

  useEffect(() => {
    if (initialized.current) trackPageView(pathname || '/');
  }, [pathname, trackPageView]);

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-analytics-event]') : null;
      const eventName = target?.getAttribute('data-analytics-event');
      if (!eventName || !/^[a-z][a-z0-9_]{1,39}$/.test(eventName) || !window.gtag) return;
      window.gtag('event', eventName, { page_path: currentPath.current });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const onReady = useCallback(() => {
    if (!window.dataLayer) window.dataLayer = [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      page_location: `${window.location.origin}/`,
      page_path: '/',
      page_title: 'LovelyCrafts',
    });
    initialized.current = true;
    trackPageView(currentPath.current);
  }, [measurementId, trackPageView]);

  if (!/^G-[A-Z0-9]+$/.test(measurementId || '')) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive" onReady={onReady}>
        {`window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};`}
      </Script>
    </>
  );
}
