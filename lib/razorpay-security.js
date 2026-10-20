import crypto from 'node:crypto';

const SHA256_HEX_PATTERN = /^[a-f\d]{64}$/i;

export function verifyHmacSha256Signature(value, signature, secret) {
  if (typeof value !== 'string' || typeof secret !== 'string' || !secret || typeof signature !== 'string') {
    return false;
  }
  if (!SHA256_HEX_PATTERN.test(signature)) return false;

  const expected = crypto.createHmac('sha256', secret).update(value).digest();
  const supplied = Buffer.from(signature, 'hex');
  return supplied.length === expected.length && crypto.timingSafeEqual(expected, supplied);
}

export function createSettlementOrderId({ paymentId, noteId }) {
  const identity = paymentId ? `razorpay-payment:${paymentId}` : `coupon-redemption:${noteId}`;
  return `settled_${crypto.createHash('sha256').update(identity).digest('hex')}`;
}
