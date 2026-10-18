import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getClientCountry, isIndiaRequest } from '../lib/geo.js';

describe('Geo-restriction logic (Unrestricted purchases)', () => {
  test('Always allows checkout in unrestricted mode', () => {
    const mockReq = {
      headers: new Headers({
        'x-vercel-ip-country': 'FR',
      }),
    };
    const result = getClientCountry(mockReq);
    assert.equal(result.isIndia, true);
    assert.equal(result.country, 'IN');
    assert.equal(isIndiaRequest(mockReq), true);
  });
});
