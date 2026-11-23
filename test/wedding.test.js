import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, normalizeWeddingInput, publicWeddingData, WEDDING_TEMPLATES } from '../lib/wedding-schema.js';

test('Shaadi exposes six culturally distinct template families on one engine', () => {
  assert.equal(WEDDING_TEMPLATES.length, 6);
  assert.equal(new Set(WEDDING_TEMPLATES.map((item) => item.id)).size, 6);
  assert.ok(WEDDING_TEMPLATES.some((item) => item.id === 'royal-hindu'));
  assert.ok(WEDDING_TEMPLATES.some((item) => item.id === 'royal-nikah'));
});

test('public invitation slugs use a long random URL-safe token', () => {
  const first = createSlug(); const second = createSlug();
  assert.match(first, /^wedding-[a-f0-9]{24}$/);
  assert.notEqual(first, second);
});

test('invitation input validates dates, colors, maps and bounds event/media arrays', () => {
  const normalized = normalizeWeddingInput({
    templateId: 'royal-nikah', brideName: 'A', groomName: 'B', weddingDate: '2027-02-30', timezone: 'not-a-timezone',
    appearance: { accent: 'red', background: '#fff000', font: 'script' }, mapsUrl: 'javascript:alert(1)',
    events: Array.from({ length: 60 }, (_, index) => ({ id: String(index), type: 'Custom Event', date: '2027-01-01', startTime: '28:90', mapsUrl: 'https://evil.example/maps' })),
    gallery: Array.from({ length: 30 }, () => 'https://res.cloudinary.com/demo/image/upload/photo.jpg'),
  });
  assert.equal(normalized.templateId, 'royal-nikah');
  assert.equal(normalized.weddingDate, '');
  assert.equal(normalized.timezone, 'Asia/Kolkata');
  assert.equal(normalized.appearance.accent, '#c6a367');
  assert.equal(normalized.appearance.background, '#fff000');
  assert.equal(normalized.mapsUrl, '');
  assert.equal(normalized.events.length, 50);
  assert.equal(normalized.events[0].startTime, '');
  assert.equal(normalized.events[0].mapsUrl, '');
  assert.equal(normalized.gallery.length, 20);
});

test('published invitation serialization removes owner, order and revision internals', () => {
  const publicData = publicWeddingData({ ownerId: 'customer-1', ownerEmail: 'private@example.com', orderId: 'private-order', pendingOrderId: 'private-pending', publishedRevisionId: 'rev-1', paymentStatus: 'paid', status: 'published', brideName: 'Bride', slug: 'public-slug' });
  assert.deepEqual(publicData, { brideName: 'Bride', slug: 'public-slug' });
});
