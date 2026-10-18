/**
 * Checks if an email belongs to a LovelyCrafts platform super-admin.
 * Used to allow admin bypass into any business workspace for operational support.
 */
export function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const allowed = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
