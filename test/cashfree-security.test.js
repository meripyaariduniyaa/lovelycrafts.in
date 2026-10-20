import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyCashfreeWebhookSignature } from '../lib/cashfree-security.js';

test('Cashfree webhook signatures verify raw-body HMAC and reject changed or missing values', () => {
  const body = '{"type":"PAYMENT_SUCCESS_WEBHOOK","data":{"payment":{"payment_status":"SUCCESS"}}}';
  const timestamp = '1760912345678';
  const secret = 'cashfree-sandbox-test-secret';
  const signature = createHmac('sha256', secret).update(`${timestamp}${body}`).digest('base64');

  assert.equal(verifyCashfreeWebhookSignature(body, timestamp, signature, secret), true);
  assert.equal(verifyCashfreeWebhookSignature(`${body} `, timestamp, signature, secret), false);
  assert.equal(verifyCashfreeWebhookSignature(body, timestamp, '', secret), false);
  assert.equal(verifyCashfreeWebhookSignature(body, timestamp, signature, ''), false);
});
