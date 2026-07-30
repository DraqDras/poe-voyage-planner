import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createEmptyState, toJSON, fromJSON, suggestFilename, LayoutError, SCHEMA_VERSION,
} from '../js/core/serialize.js';
import { FULL, N, E, S } from '../js/core/shapes.js';

function populated() {
  const state = createEmptyState('Strongbox farm');
  state.cells[0] = { i: 0, mask: E | S, label: 'Lost Ruins', areaLevel: 83, implicit: 'MapDeepwaterChartAdjacentStrongboxes2' };
  state.cells[4] = { i: 4, mask: FULL, label: '', areaLevel: 80, implicit: 'MapDeepwaterChartVoyagePackSize1' };
  state.cells[8] = { i: 8, mask: N, label: 'Sea Pillars', areaLevel: null, implicit: null };
  state.borders.find((b) => b.slot === 'N-0').modId = 'border_currency';
  state.borders.find((b) => b.slot === 'W-2').modId = 'border_exalted';
  state.settings.adjacency = 'connected';
  return state;
}

test('round-trip preserves the layout exactly', () => {
  const original = populated();
  const { state, warnings } = fromJSON(JSON.stringify(toJSON(original)));

  assert.deepEqual(warnings, []);
  assert.equal(state.name, original.name);
  assert.deepEqual(state.settings, original.settings);
  assert.deepEqual(state.cells, original.cells);
  assert.deepEqual(state.borders, original.borders);
});

test('the saved file carries schema metadata', () => {
  const json = toJSON(populated());
  assert.equal(json.schemaVersion, SCHEMA_VERSION);
  assert.equal(json.app, 'poe-voyage-planner');
  assert.equal(json.cells.length, 9);
  assert.equal(json.borders.length, 12);
  assert.ok(Date.parse(json.savedAt) > 0);
});

test('fromJSON accepts an object as well as a string', () => {
  const { state } = fromJSON(toJSON(populated()));
  assert.equal(state.cells[0].label, 'Lost Ruins');
});

test('malformed input is rejected with a readable error', () => {
  assert.throws(() => fromJSON('{ not json'), LayoutError);
  assert.throws(() => fromJSON('[]'), LayoutError);
  assert.throws(() => fromJSON('null'), LayoutError);
  assert.throws(() => fromJSON(JSON.stringify({ app: 'poe-voyage-planner' })), /cells/);
});

test('a partial layout loads, with warnings, instead of failing', () => {
  const { state, warnings } = fromJSON(
    JSON.stringify({ cells: [{ i: 0, mask: S, implicit: 'MapDeepwaterChartAdjacentEssence1' }] })
  );
  assert.equal(state.cells[0].mask, S);
  assert.equal(state.cells[3].mask, 0);
  assert.ok(warnings.some((w) => w.includes('1 z 9')));
});

test('out-of-range values are repaired and reported', () => {
  const { state, warnings } = fromJSON(
    JSON.stringify({
      cells: [
        { i: 0, mask: 99, areaLevel: 83 },
        { i: 1, mask: N, areaLevel: 5000 },
        { i: 42, mask: N },
      ],
    })
  );
  assert.equal(state.cells[0].mask, 0);
  assert.equal(state.cells[1].areaLevel, null);
  assert.equal(warnings.filter((w) => /maska|area level|indeksie/.test(w)).length, 3);
});

test('duplicate cell indices keep the first occurrence', () => {
  const { state, warnings } = fromJSON(
    JSON.stringify({ cells: [{ i: 0, mask: N, label: 'first' }, { i: 0, mask: S, label: 'second' }] })
  );
  assert.equal(state.cells[0].label, 'first');
  assert.ok(warnings.some((w) => w.includes('więcej niż raz')));
});

test('an implicit on an empty cell is dropped', () => {
  const { state } = fromJSON(
    JSON.stringify({ cells: [{ i: 0, mask: 0, implicit: 'MapDeepwaterChartAdjacentEssence1' }] })
  );
  assert.equal(state.cells[0].implicit, null);
});

test('unknown border slots are skipped, known ones applied', () => {
  const { state, warnings } = fromJSON(
    JSON.stringify({
      cells: [],
      borders: [{ slot: 'Z-9', modId: 'border_currency' }, { slot: 'E-1', modId: 'border_crabs' }],
    })
  );
  assert.equal(state.borders.find((b) => b.slot === 'E-1').modId, 'border_crabs');
  assert.ok(warnings.some((w) => w.includes('Z-9')));
});

test('a newer schema version loads with a warning rather than an error', () => {
  const { warnings } = fromJSON(JSON.stringify({ schemaVersion: 99, cells: [] }));
  assert.ok(warnings.some((w) => w.includes('schemaVersion 99')));
});

test('a file from another app is loaded but flagged', () => {
  const { warnings } = fromJSON(JSON.stringify({ app: 'something-else', cells: [] }));
  assert.ok(warnings.some((w) => w.includes('innej aplikacji')));
});

test('unknown mod ids survive the round-trip untouched', () => {
  const { state } = fromJSON(JSON.stringify({ cells: [{ i: 0, mask: N, implicit: 'MapFuturePatchMod' }] }));
  assert.equal(state.cells[0].implicit, 'MapFuturePatchMod');
});

test('filenames are slugified and dated', () => {
  assert.match(suggestFilename({ name: 'Strongbox Farm!' }), /^strongbox-farm-\d{4}-\d{2}-\d{2}\.json$/);
  assert.match(suggestFilename({ name: '' }), /^voyage-\d{4}-\d{2}-\d{2}\.json$/);
  assert.match(suggestFilename({ name: '???' }), /^voyage-/);
});
