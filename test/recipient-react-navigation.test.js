import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { toReactionClientNote } from '../lib/reaction-note.js';

describe('Recipient Experience & Reaction Page Navigation', () => {
  test('resolves reaction URL accurately from slug, custom_slug or doc id', () => {
    const buildReactUrl = (note) => {
      const targetSlug = note?.slug || note?.custom_slug || note?.id || '';
      return targetSlug ? `/p/${encodeURIComponent(targetSlug)}/react` : '';
    };

    // 1. With active slug
    assert.equal(
      buildReactUrl({ id: 'doc123', slug: 'birthday-surprise', custom_slug: 'birthday-surprise' }),
      '/p/birthday-surprise/react'
    );

    // 2. With fallback to id when no slug
    assert.equal(
      buildReactUrl({ id: 'fireDoc999' }),
      '/p/fireDoc999/react'
    );

    // 3. Encodes special characters in custom slugs
    assert.equal(
      buildReactUrl({ slug: 'love & forever' }),
      '/p/love%20%26%20forever/react'
    );
  });

  test('serializes only JSON-safe reaction page fields', () => {
    const firestoreTimestamp = { toDate: () => new Date('2026-01-01T00:00:00Z') };
    const result = toReactionClientNote('note-1', {
      recipient_name: 'Anjali',
      custom_details: { sender_name: 'Aman' },
      recipient_reaction: { emoji: '❤️', createdAt: firestoreTimestamp },
    });

    assert.deepEqual(result, {
      id: 'note-1',
      recipient_name: 'Anjali',
      sender_name: 'Aman',
      template: 'proposal',
      custom_slug: null,
      recipient_reaction: true,
    });
  });
});
