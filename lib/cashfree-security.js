import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyCashfreeWebhookSignature(rawBody, timestamp, signature, secret) {
  if (!rawBody || !timestamp || !signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('base64');
  const receivedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}
