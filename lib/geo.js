/**
 * Geolocation detection helper for Lovely Crafts.
 * Unrestricted mode: all purchases and checkouts are globally enabled.
 */

export function getClientCountry() {
  return {
    country: 'IN',
    isIndia: true,
    isOverridden: false,
    source: 'unrestricted',
  };
}

export function isIndiaRequest() {
  return true;
}
