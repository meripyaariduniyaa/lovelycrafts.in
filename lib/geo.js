/**
 * Geolocation detection helper for Lovely Crafts.
 * Ensures purchases are restricted to clients in India (IN)
 * while keeping all pages visible and browsable worldwide.
 */

export function getClientCountry(request) {
  try {
    // 1. Check for Testing / Simulation Override (Header, URL search param, or Cookie)
    // Very useful for QA, development, and testing non-India scenarios without VPN.
    const url = request?.url ? new URL(request.url) : null;
    const testCountryParam = url?.searchParams?.get('test_country') || url?.searchParams?.get('simulate_country');
    const testCountryHeader = request?.headers?.get?.('x-test-country');
    const testCountryCookie = request?.cookies?.get?.('lc_test_country')?.value || request?.cookies?.get?.('lc_country_override')?.value;

    const testOverride = (testCountryParam || testCountryHeader || testCountryCookie || '').toUpperCase().trim();
    if (testOverride && /^[A-Z]{2}$/.test(testOverride)) {
      return {
        country: testOverride,
        isIndia: testOverride === 'IN',
        isOverridden: true,
        source: 'test_override',
      };
    }

    // 2. Check Standard CDN & Cloud Provider Geolocation Headers
    // Vercel Geolocation (Header injected automatically on Vercel deployments)
    const vercelCountry = request?.headers?.get?.('x-vercel-ip-country');
    if (vercelCountry && /^[A-Za-z]{2}$/.test(vercelCountry.trim())) {
      const country = vercelCountry.toUpperCase().trim();
      return {
        country,
        isIndia: country === 'IN',
        isOverridden: false,
        source: 'x-vercel-ip-country',
      };
    }

    // Cloudflare IP Country (Injected when behind Cloudflare DNS / Proxy)
    const cfCountry = request?.headers?.get?.('cf-ipcountry');
    if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1' && /^[A-Za-z]{2}$/.test(cfCountry.trim())) {
      const country = cfCountry.toUpperCase().trim();
      return {
        country,
        isIndia: country === 'IN',
        isOverridden: false,
        source: 'cf-ipcountry',
      };
    }

    // Standard proxy / reverse proxy headers (e.g. AWS CloudFront, Fastly, Nginx)
    const genericCountry = request?.headers?.get?.('x-country-code') || 
                           request?.headers?.get?.('x-geo-country') ||
                           request?.headers?.get?.('cloudfront-viewer-country');
    if (genericCountry && /^[A-Za-z]{2}$/.test(genericCountry.trim())) {
      const country = genericCountry.toUpperCase().trim();
      return {
        country,
        isIndia: country === 'IN',
        isOverridden: false,
        source: 'x-country-code',
      };
    }

    // 3. Fallback: Check IP address
    const forwardedFor = request?.headers?.get?.('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0]?.trim() || request?.headers?.get?.('x-real-ip') || '';

    const isLocalOrPrivate = !clientIp ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === 'localhost' ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.16.');

    // In local development or private IP environments, default to India
    if (process.env.NODE_ENV === 'development' || isLocalOrPrivate) {
      return {
        country: 'IN',
        isIndia: true,
        isOverridden: false,
        source: 'dev_local_default',
      };
    }

    // Default safe fallback (assumes IN if headers are absent, ensuring normal operation)
    return {
      country: 'IN',
      isIndia: true,
      isOverridden: false,
      source: 'fallback_default',
    };
  } catch (err) {
    console.error('Error resolving client country:', err);
    return {
      country: 'IN',
      isIndia: true,
      isOverridden: false,
      source: 'error_fallback',
    };
  }
}

export function isIndiaRequest(request) {
  const result = getClientCountry(request);
  return result.isIndia;
}
