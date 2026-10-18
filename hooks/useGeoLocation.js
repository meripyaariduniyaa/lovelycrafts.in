'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current client is located in India.
 * Blocks purchases and checkout script loading for non-India visitors
 * while ensuring all pages and preview features remain fully viewable.
 */
export function useGeoLocation() {
  const [geo, setGeo] = useState(() => {
    // SSR safe default
    if (typeof window === 'undefined') {
      return { isIndia: true, country: 'IN', loading: true, checked: false };
    }

    // 1. URL test parameter (e.g. ?test_country=US or ?test_country=IN)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const testParam = urlParams.get('test_country') || urlParams.get('simulate_country');
      if (testParam) {
        const c = testParam.toUpperCase().trim();
        return { isIndia: c === 'IN', country: c, loading: false, checked: true, source: 'url_param' };
      }

      // 2. Session cache
      const cachedCountry = sessionStorage.getItem('lc_geo_country');
      const cachedIsIndia = sessionStorage.getItem('lc_geo_is_india');
      if (cachedCountry && cachedIsIndia !== null) {
        return {
          isIndia: cachedIsIndia === 'true',
          country: cachedCountry,
          loading: false,
          checked: true,
          source: 'session_cache'
        };
      }

      // 3. Fast timezone heuristic for immediate zero-latency render
      const tz = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || '';
      const isIndiaTz = tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta';
      return {
        isIndia: isIndiaTz,
        country: isIndiaTz ? 'IN' : 'UNKNOWN',
        loading: true,
        checked: false,
        source: 'tz_heuristic'
      };
    } catch {
      return { isIndia: true, country: 'IN', loading: true, checked: false };
    }
  });

  useEffect(() => {
    let mounted = true;

    async function verifyGeoWithServer() {
      if (typeof window === 'undefined') return;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const testParam = urlParams.get('test_country') || urlParams.get('simulate_country');

        let fetchUrl = '/api/geo';
        if (testParam) {
          fetchUrl += `?test_country=${encodeURIComponent(testParam)}`;
        }

        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error('Failed to fetch geo');
        const data = await res.json();

        const country = data.country || 'IN';
        const isIndia = data.isIndia !== false;

        sessionStorage.setItem('lc_geo_country', country);
        sessionStorage.setItem('lc_geo_is_india', isIndia ? 'true' : 'false');

        if (mounted) {
          setGeo({
            isIndia,
            country,
            loading: false,
            checked: true,
            source: data.source || 'server_api'
          });
        }
      } catch (err) {
        console.warn('Geo verification fallback:', err);
        if (mounted) {
          setGeo((prev) => ({
            ...prev,
            loading: false,
            checked: true
          }));
        }
      }
    }

    verifyGeoWithServer();

    return () => {
      mounted = false;
    };
  }, []);

  return geo;
}
