import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getClientCountry, isIndiaRequest } from '../lib/geo.js';

describe('Geo-restriction logic (India Only Purchases)', () => {
  test('Identifies India correctly via x-vercel-ip-country', () => {
    const mockReq = {
      headers: new Headers({
        'x-vercel-ip-country': 'IN',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, true);
    assert.equal(result.country, 'IN');
    assert.equal(isIndiaRequest(mockReq), true);
  });

  test('Blocks non-India countries via x-vercel-ip-country', () => {
    const mockReq = {
      headers: new Headers({
        'x-vercel-ip-country': 'US',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, false);
    assert.equal(result.country, 'US');
    assert.equal(isIndiaRequest(mockReq), false);
  });

  test('Identifies India correctly via cf-ipcountry', () => {
    const mockReq = {
      headers: new Headers({
        'cf-ipcountry': 'IN',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, true);
    assert.equal(result.country, 'IN');
    assert.equal(isIndiaRequest(mockReq), true);
  });

  test('Blocks non-India countries via cf-ipcountry (e.g. GB, DE, SG, AU)', () => {
    for (const c of ['GB', 'DE', 'SG', 'AU', 'AE']) {
      const mockReq = {
        headers: new Headers({
          'cf-ipcountry': c,
        }),
      };
      const result = getClientCountry(mockReq);
      assert.equal(result.isIndia, false, `Country ${c} should be blocked`);
      assert.equal(result.country, c);
      assert.equal(isIndiaRequest(mockReq), false);
    }
  });

  test('Respects URL test simulation parameters for QA & testing', () => {
    const mockReqUS = {
      url: 'https://lovelycrafts.in/preview?id=test-note&test_country=US',
      headers: new Headers({ 'x-vercel-ip-country': 'IN' }), // Even if CDN says IN, test param overrides
    };
    const resultUS = getClientCountry(mockReqUS);
    assert.equal(resultUS.isIndia, false);
    assert.equal(resultUS.country, 'US');
    assert.equal(resultUS.isOverridden, true);

    const mockReqIN = {
      url: 'https://lovelycrafts.in/preview?id=test-note&test_country=IN',
      headers: new Headers({ 'x-vercel-ip-country': 'US' }),
    };
    const resultIN = getClientCountry(mockReqIN);
    assert.equal(resultIN.isIndia, true);
    assert.equal(resultIN.country, 'IN');
    assert.equal(resultIN.isOverridden, true);
  });

  test('Respects x-test-country header for testing', () => {
    const mockReq = {
      headers: new Headers({
        'x-test-country': 'FR',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, false);
    assert.equal(result.country, 'FR');
    assert.equal(result.isOverridden, true);
  });

  test('Allows local development / private IP by default', () => {
    const mockReq = {
      headers: new Headers({
        'x-forwarded-for': '127.0.0.1',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, true);
    assert.equal(result.country, 'IN');
  });
});
