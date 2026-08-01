import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADJACENT_IMPLICITS, VOYAGE_IMPLICITS, BORDER_MODS, CHART_IMPLICITS, ALL_MODS, getMod, CATEGORIES,
} from '../data/mods.js';

test('the data set matches the counts in the wiki Cargo tables', () => {
  assert.equal(ADJACENT_IMPLICITS.length, 43, 'adjacent implicit modifiers');
  assert.equal(VOYAGE_IMPLICITS.length, 19, 'voyage implicit modifiers');
  // 66 DeepwaterBorder* mods exist; TreasureAnchorsHardMode is a byte-identical duplicate.
  assert.equal(BORDER_MODS.length, 65, 'border modifiers');
  assert.equal(CHART_IMPLICITS.length, 62);
});

test('border mods use the real internal ids, not hand-made ones', () => {
  for (const mod of BORDER_MODS) {
    assert.match(mod.id, /^DeepwaterBorder[A-Za-z0-9]+$/, `${mod.id}`);
  }
});

test('the Hard Mode Treasure Anchor duplicate stays out of the list', () => {
  assert.equal(
    BORDER_MODS.some((m) => m.id === 'DeepwaterBorderTreasureAnchorsHardMode'),
    false
  );
  const texts = BORDER_MODS.map((m) => m.text);
  assert.equal(new Set(texts).size, texts.length, 'two border mods share the same text');
});

test('"more" multipliers are never summed', () => {
  for (const mod of BORDER_MODS) {
    if (/\bmore\b/.test(mod.text)) {
      assert.equal(mod.stack, 'flag', `${mod.id}: "more" is multiplicative, it must not sum`);
    }
  }
});

test('every id is unique', () => {
  assert.equal(new Set(ALL_MODS.map((m) => m.id)).size, ALL_MODS.length);
});

test('every mod has the fields the UI depends on', () => {
  for (const mod of ALL_MODS) {
    assert.ok(mod.id, 'id');
    assert.ok(mod.text?.length > 0, `${mod.id}: text`);
    assert.ok(mod.short?.length > 0, `${mod.id}: short`);
    assert.ok(mod.short.length <= 26, `${mod.id}: short is too long for a tile badge ("${mod.short}")`);
    assert.ok(['sum', 'flag'].includes(mod.stack), `${mod.id}: stack`);
    assert.ok(CATEGORIES[mod.category], `${mod.id}: unknown category "${mod.category}"`);
  }
});

test('scopes are assigned by list membership, not by text', () => {
  assert.ok(ADJACENT_IMPLICITS.every((m) => m.scope === 'adjacent'));
  assert.ok(VOYAGE_IMPLICITS.every((m) => m.scope === 'voyage'));
  assert.ok(BORDER_MODS.every((m) => m.scope === 'border'));

  // These two do not mention "adjacent" anywhere in their text but are adjacent-scoped.
  assert.equal(getMod('MapDeepwaterChartAdjacentCorrupted').scope, 'adjacent');
  assert.equal(getMod('MapDeepwaterChartAdjacentWisps1').scope, 'adjacent');
});

test('summable mods carry a numeric range, flags do not need one', () => {
  for (const mod of ALL_MODS) {
    if (mod.stack !== 'sum') continue;
    assert.ok(mod.numeric, `${mod.id}: stack "sum" without numeric`);
    assert.ok(Number.isFinite(mod.numeric.min), `${mod.id}: numeric.min`);
    assert.ok(mod.numeric.max >= mod.numeric.min, `${mod.id}: numeric range reversed`);
    assert.ok(['%', 'count'].includes(mod.numeric.unit), `${mod.id}: numeric.unit`);
  }
});

test('chart implicits carry item level and spawn weight', () => {
  for (const mod of CHART_IMPLICITS) {
    assert.ok(Number.isInteger(mod.ilvl) && mod.ilvl >= 1, `${mod.id}: ilvl`);
    assert.ok(Number.isInteger(mod.weight) && mod.weight >= 1, `${mod.id}: weight`);
  }
});

test('the wiki typo is preserved separately from the display text', () => {
  const quantity = getMod('MapDeepwaterChartVoyageQuantity1');
  assert.match(quantity.textWiki, /Qauntity/);
  assert.match(quantity.text, /Quantity/);
});

test('getMod returns a safe placeholder for unknown ids', () => {
  const unknown = getMod('MapDeepwaterChartFromTheFuture');
  assert.equal(unknown.unknown, true);
  assert.equal(unknown.scope, 'unknown');
  assert.ok(unknown.short.length > 0);
  assert.equal(getMod(null), null);
});
