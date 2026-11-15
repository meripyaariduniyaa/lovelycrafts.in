import test from 'node:test';
import assert from 'node:assert/strict';
import { tools, TOOL_CATEGORIES, getToolBySlug, getToolsByCategory, getCategoryById } from '../lib/tools.js';

test('Tools Catalog and Categories validation', async (t) => {
  await t.test('has exactly 12 tools configured', () => {
    assert.equal(tools.length, 12);
  });

  await t.test('every tool has valid structure and unique slugs', () => {
    const slugs = new Set();
    const validCategoryIds = new Set(TOOL_CATEGORIES.map((c) => c.id));

    for (const tool of tools) {
      assert.ok(tool.slug, `Tool is missing slug: ${JSON.stringify(tool)}`);
      assert.ok(!slugs.has(tool.slug), `Duplicate slug found: ${tool.slug}`);
      slugs.add(tool.slug);

      assert.ok(tool.title, `Tool ${tool.slug} is missing title`);
      assert.ok(tool.description, `Tool ${tool.slug} is missing description`);
      assert.ok(tool.emoji, `Tool ${tool.slug} is missing emoji`);
      assert.ok(tool.category, `Tool ${tool.slug} is missing category`);
      assert.ok(validCategoryIds.has(tool.category), `Tool ${tool.slug} has invalid category: ${tool.category}`);

      assert.ok(Array.isArray(tool.keywords) && tool.keywords.length > 0, `Tool ${tool.slug} missing keywords array`);

      assert.ok(tool.giftCta, `Tool ${tool.slug} is missing giftCta`);
      assert.ok(tool.giftCta.text, `Tool ${tool.slug} giftCta is missing text`);
      assert.ok(tool.giftCta.href && tool.giftCta.href.startsWith('/templates'), `Tool ${tool.slug} giftCta href must start with /templates`);
    }
  });

  await t.test('getToolBySlug returns correct tool or null', () => {
    const loveCalc = getToolBySlug('love-calculator');
    assert.ok(loveCalc);
    assert.equal(loveCalc.title, 'Love Calculator');

    const nonExistent = getToolBySlug('non-existent-tool');
    assert.equal(nonExistent, null);
  });

  await t.test('getToolsByCategory filters accurately', () => {
    const loveTools = getToolsByCategory('love');
    assert.ok(loveTools.length >= 3);
    for (const tool of loveTools) {
      assert.equal(tool.category, 'love');
    }

    const bdayTools = getToolsByCategory('birthday');
    assert.ok(bdayTools.length >= 3);
    for (const tool of bdayTools) {
      assert.equal(tool.category, 'birthday');
    }
  });

  await t.test('getCategoryById returns matching category', () => {
    const loveCat = getCategoryById('love');
    assert.ok(loveCat);
    assert.equal(loveCat.label, 'Love & Relationship');

    const nonCat = getCategoryById('nonexistent');
    assert.equal(nonCat, null);
  });
});

