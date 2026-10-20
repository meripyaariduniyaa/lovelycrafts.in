/**
 * Oneko cat animation should only appear on the main marketing & discovery pages:
 * - Main Homepage (/)
 * - Templates gallery (/templates)
 * - Blog & articles (/blog)
 * - About, FAQ, Contact, Content Ideas, Arcade, Creators
 *
 * It is explicitly excluded from transactional & focused experience pages:
 * - Private recipient pages (/p/*)
 * - Creation builder (/create)
 * - Preview (/preview)
 * - Checkout (/checkout)
 * - Post-purchase success hub (/success)
 * - Invoice viewer (/invoice/*)
 * - User profile (/profile)
 * - Corporate portal (/business, /c/*)
 * - Legal policies (/terms, /privacy, etc.)
 */

export const ALLOWED_EXACT_ROUTES = new Set([
  '/',
  '/about',
  '/faq',
  '/contact',
]);

export const ALLOWED_PREFIX_ROUTES = [
  '/templates',
  '/blog',
  '/content-ideas',
  '/arcade',
  '/creators',
  '/creator',
];

export function isOnekoAllowed(pathname) {
  if (!pathname || typeof pathname !== 'string') return false;
  // Normalize trailing slash except for root
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (ALLOWED_EXACT_ROUTES.has(cleanPath)) return true;
  return ALLOWED_PREFIX_ROUTES.some((prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
}
