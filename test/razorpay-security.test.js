import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { createSettlementOrderId, verifyHmacSha256Signature } from '../lib/razorpay-security.js';

test('Razorpay HMAC verification fails closed and rejects malformed or changed signatures', () => {
  const payload = '{"event":"payment.captured"}';
  const secret = 'test-webhook-secret';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  assert.equal(verifyHmacSha256Signature(payload, signature, secret), true);
  assert.equal(verifyHmacSha256Signature(payload, signature, ''), false);
  assert.equal(verifyHmacSha256Signature(payload, '', secret), false);
  assert.equal(verifyHmacSha256Signature(`${payload} `, signature, secret), false);
  assert.equal(verifyHmacSha256Signature(payload, 'not-a-signature', secret), false);
});

test('settlement order identity is stable across payment callbacks and isolated per payment', () => {
  const first = createSettlementOrderId({ paymentId: 'pay_123', noteId: 'gift_a' });
  assert.equal(first, createSettlementOrderId({ paymentId: 'pay_123', noteId: 'gift_a' }));
  assert.equal(first, createSettlementOrderId({ paymentId: 'pay_123', noteId: 'gift_b' }));
  assert.notEqual(first, createSettlementOrderId({ paymentId: 'pay_456', noteId: 'gift_a' }));
  assert.notEqual(
    createSettlementOrderId({ noteId: 'gift_a' }),
    createSettlementOrderId({ noteId: 'gift_b' }),
  );
});
