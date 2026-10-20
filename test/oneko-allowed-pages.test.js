import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isOnekoAllowed } from '../lib/oneko-config.js';

describe('Oneko Page Allowlist Enforcement', () => {
  test('allows Oneko cat only on main page and related discovery pages', () => {
    // Main Homepage
    assert.equal(isOnekoAllowed('/'), true);
    assert.equal(isOnekoAllowed(''), false);

    // Related discovery and content pages
    assert.equal(isOnekoAllowed('/templates'), true);
    assert.equal(isOnekoAllowed('/templates/'), true);
    assert.equal(isOnekoAllowed('/templates/birthday'), true);
    assert.equal(isOnekoAllowed('/blog'), true);
    assert.equal(isOnekoAllowed('/blog/gift-ideas'), true);
    assert.equal(isOnekoAllowed('/about'), true);
    assert.equal(isOnekoAllowed('/faq'), true);
    assert.equal(isOnekoAllowed('/contact'), true);
    assert.equal(isOnekoAllowed('/content-ideas'), true);
    assert.equal(isOnekoAllowed('/arcade'), true);
    assert.equal(isOnekoAllowed('/creators'), true);
  });

  test('strictly blocks Oneko cat on private, creation, transaction, and account pages', () => {
    // Private reveal & reaction pages
    assert.equal(isOnekoAllowed('/p/some-surprise-id'), false);
    assert.equal(isOnekoAllowed('/p/some-surprise-id/react'), false);

    // Experience builder & preview
    assert.equal(isOnekoAllowed('/create'), false);
    assert.equal(isOnekoAllowed('/preview'), false);

    // Checkout, success, and invoices
    assert.equal(isOnekoAllowed('/checkout'), false);
    assert.equal(isOnekoAllowed('/success'), false);
    assert.equal(isOnekoAllowed('/invoice'), false);
    assert.equal(isOnekoAllowed('/invoice/INV-1002'), false);

    // Account & corporate
    assert.equal(isOnekoAllowed('/profile'), false);
    assert.equal(isOnekoAllowed('/business'), false);
    assert.equal(isOnekoAllowed('/c/tenant-slug'), false);

    // Legal policies
    assert.equal(isOnekoAllowed('/terms'), false);
    assert.equal(isOnekoAllowed('/privacy'), false);
    assert.equal(isOnekoAllowed('/refund'), false);
    assert.equal(isOnekoAllowed('/shipping'), false);
    assert.equal(isOnekoAllowed('/cookies'), false);
  });
});
