import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPLICATION_STATUSES,
  CORPORATE_PLANS,
  CORPORATE_ROLES,
  isValidStatusTransition,
  normalizeSlug,
  generateInvitationToken,
  generateRecipientToken,
  hashToken,
  validateApplicationInput,
  buildAuditLog,
} from '../lib/business.js';

test('1. Corporate application input validation', () => {
  // Case 1: Valid corporate application
  const validApp = {
    company_name: 'Acme Technologies Pvt Ltd',
    website: 'https://acme.com',
    business_email: 'hr@acme.com',
    contact_name: 'Priya Sharma',
    designation: 'VP of Human Resources',
    employee_count: '51-200',
    use_cases: ['birthdays', 'work_anniversaries'],
    estimated_frequency: 'monthly',
    terms_accepted: true,
  };
  const res1 = validateApplicationInput(validApp);
  assert.equal(res1.isValid, true);
  assert.equal(res1.isFreeDomain, false);
  assert.equal(res1.sanitized.company_name, 'Acme Technologies Pvt Ltd');
  assert.equal(res1.sanitized.business_email, 'hr@acme.com');

  // Case 2: Free email domain flag
  const gmailApp = {
    ...validApp,
    business_email: 'acme.hr@gmail.com',
  };
  const res2 = validateApplicationInput(gmailApp);
  assert.equal(res2.isValid, true);
  assert.equal(res2.isFreeDomain, true);

  // Case 3: Missing required fields
  const invalidApp = {
    company_name: 'A', // Too short
    business_email: 'invalid-email',
    contact_name: '',
    designation: '',
  };
  const res3 = validateApplicationInput(invalidApp);
  assert.equal(res3.isValid, false);
  assert.equal(res3.errors.length >= 3, true);
});

test('2. Business slug normalization', () => {
  assert.equal(normalizeSlug('Acme Technologies Pvt. Ltd.'), 'acme-technologies-pvt-ltd');
  assert.equal(normalizeSlug('   Super---Cool & Co. !!! '), 'super-cool-co');
  assert.equal(normalizeSlug('LovelyCrafts HQ'), 'lovelycrafts-hq');
  assert.equal(normalizeSlug('A'.repeat(100)).length <= 50, true);
});

test('3. Application status state-machine transitions', () => {
  // Valid transitions
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.PENDING, APPLICATION_STATUSES.UNDER_REVIEW), true);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.PENDING, APPLICATION_STATUSES.APPROVED), true);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.UNDER_REVIEW, APPLICATION_STATUSES.APPROVED), true);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.UNDER_REVIEW, APPLICATION_STATUSES.REJECTED), true);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.APPROVED, APPLICATION_STATUSES.SUSPENDED), true);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.SUSPENDED, APPLICATION_STATUSES.APPROVED), true);

  // Invalid transitions
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.APPROVED, APPLICATION_STATUSES.PENDING), false);
  assert.equal(isValidStatusTransition(APPLICATION_STATUSES.ARCHIVED, APPLICATION_STATUSES.APPROVED), false);
  assert.equal(isValidStatusTransition(null, APPLICATION_STATUSES.APPROVED), false);
});

test('4. Secure Invitation & Recipient Token Generation', () => {
  const token1 = generateInvitationToken();
  const token2 = generateInvitationToken();
  assert.equal(typeof token1, 'string');
  assert.equal(token1.length, 64); // 32 bytes hex = 64 chars
  assert.notEqual(token1, token2);

  // Hash verification
  const hash1 = hashToken(token1);
  const hash2 = hashToken(token1);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);

  // Recipient token
  const recipientToken = generateRecipientToken();
  assert.equal(typeof recipientToken, 'string');
  assert.equal(recipientToken.length >= 32, true);
});

test('5. Corporate plan configurations and limits', () => {
  assert.equal(CORPORATE_PLANS.starter.monthlyCredits, 20);
  assert.equal(CORPORATE_PLANS.growth.monthlyCredits, 100);
  assert.equal(CORPORATE_PLANS.growth.requiresApproval, true);
  assert.equal(CORPORATE_PLANS.enterprise.monthlyCredits, 1000);
});

test('6. Audit log entry formatting', () => {
  const log = buildAuditLog({
    businessId: 'biz_123',
    actorUid: 'admin_uid',
    actorEmail: 'admin@lovelycrafts.in',
    action: 'BUSINESS_APPROVED',
    details: { slug: 'acme-technologies' },
  });

  assert.equal(log.business_id, 'biz_123');
  assert.equal(log.actor_email, 'admin@lovelycrafts.in');
  assert.equal(log.action, 'BUSINESS_APPROVED');
  assert.equal(log.details.slug, 'acme-technologies');
  assert.equal(Boolean(log.created_at), true);
});
