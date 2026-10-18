'use client';

export function useGeoLocation() {
  return {
    isIndia: true,
    country: 'IN',
    loading: false,
    error: null,
    isOverridden: false,
    source: 'unrestricted',
  };
}
