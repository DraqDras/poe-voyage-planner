import test from 'node:test';
import assert from 'node:assert/strict';

import { FULL, N, S } from '../js/core/shapes.js';
import { resolve, adjacentTargets, influenceOf, aggregate, formatTotal } from '../js/core/resolve.js';
import { getMod } from '../data/mods.js';
import { emptyBorders } from '../js/core/borders.js';

const ADJ = 'MapDeepwaterChartAdjacentStrongboxes2'; // +2-4 Strongboxes, sums
const ADJ_OTHER = 'MapDeepwaterChartAdjacentEssence1';
const VOY = 'MapDeepwaterChartVoyagePackSize1'; // 5% pack size

function makeState(overrides = {}, settings = {}) {
  const cells = Array.from({ length: 9 }, (_, i) => ({
    i,
    mask: FULL,
    label: '',
    areaLevel: null,
    implicit: null,
    ...(overrides.cells?.[i] || {}),
  }));
  return {
    cells,
    borders: overrides.borders || emptyBorders(),
    settings: { adjacency: 'orthogonal', openEdgesAllowed: true, ...settings },
  };
}

test('an adjacent implicit reaches the four orthogonal neighbours, not its own cell', () => {
  const state = makeState({ cells: { 4: { implicit: ADJ } } });
  const { perCell } = resolve(state);

  assert.deepEqual(perCell[4].influences.sort(), [1, 3, 5, 7]);
  for (const i of [1, 3, 5, 7]) {
    assert.equal(perCell[i].fromNeighbors.length, 1, `cell ${i}`);
    assert.equal(perCell[i].fromNeighbors[0].mod.id, ADJ);
    assert.equal(perCell[i].fromNeighbors[0].from, 4);
  }
  assert.equal(perCell[4].fromNeighbors.length, 0, 'does not affect its own area');
  assert.equal(perCell[4].ownAppliesHere, false);
  for (const i of [0, 2, 6, 8]) assert.equal(perCell[i].fromNeighbors.length, 0, 'diagonals excluded');
});

test('a corner chart only reaches two cells', () => {
  const state = makeState({ cells: { 0: { implicit: ADJ } } });
  const { perCell } = resolve(state);
  assert.deepEqual(perCell[0].influences.sort(), [1, 3]);
});

test('empty neighbours are not valid targets', () => {
  const state = makeState({ cells: { 4: { implicit: ADJ }, 1: { mask: 0 } } });
  const { perCell } = resolve(state);
  assert.deepEqual(perCell[4].influences.sort(), [3, 5, 7]);
});

test('a voyage implicit applies to all nine cells including its own', () => {
  const state = makeState({ cells: { 0: { implicit: VOY } } });
  const { perCell, voyageWide } = resolve(state);

  assert.equal(voyageWide.length, 1);
  assert.equal(perCell[0].influences.length, 9);
  assert.equal(perCell[0].ownAppliesHere, true);
  for (let i = 0; i < 9; i++) {
    assert.equal(perCell[i].voyage.length, 1, `cell ${i}`);
    assert.ok(perCell[i].all.some((e) => e.mod.id === VOY));
  }
});

test('connected adjacency only counts neighbours joined by an open passage', () => {
  // A2 (index 3) is a vertical straight: open north and south, walled east.
  const state = makeState(
    { cells: { 4: { implicit: ADJ }, 3: { mask: N | S } } },
    { adjacency: 'connected' }
  );
  const { perCell } = resolve(state);
  assert.deepEqual(perCell[4].influences.sort(), [1, 5, 7], 'A2 is walled off from the centre');

  const orthogonal = resolve(makeState({ cells: { 4: { implicit: ADJ }, 3: { mask: N | S } } }));
  assert.deepEqual(orthogonal.perCell[4].influences.sort(), [1, 3, 5, 7]);
});

test('border mods land on the single cell their segment touches', () => {
  const borders = emptyBorders();
  borders.find((b) => b.slot === 'N-0').modId = 'DeepwaterBorderMoreCurrency3';
  const { perCell } = resolve(makeState({ borders }));

  assert.equal(perCell[0].fromBorders.length, 1);
  assert.equal(perCell[0].fromBorders[0].mod.id, 'DeepwaterBorderMoreCurrency3');
  for (const i of [1, 2, 3, 4, 5, 6, 7, 8]) assert.equal(perCell[i].fromBorders.length, 0);
});

test('a corner cell can carry two border mods', () => {
  const borders = emptyBorders();
  borders.find((b) => b.slot === 'N-0').modId = 'DeepwaterBorderMoreCurrency3';
  borders.find((b) => b.slot === 'W-0').modId = 'DeepwaterBorderMoreRarity3';
  const { perCell } = resolve(makeState({ borders }));
  assert.equal(perCell[0].fromBorders.length, 2);
});

test('the same mod arriving twice stacks and sums', () => {
  const state = makeState({ cells: { 3: { implicit: ADJ }, 5: { implicit: ADJ } } });
  const { perCell } = resolve(state);

  const group = perCell[4].aggregated.find((g) => g.mod.id === ADJ);
  assert.equal(group.count, 2);
  assert.deepEqual(group.total, { min: 4, max: 8, unit: 'count' });
  assert.equal(formatTotal(group.total), '×4-8');
});

test('flag mods are counted but never summed', () => {
  const flagId = 'MapDeepwaterChartAdjacentPantheon';
  const state = makeState({ cells: { 3: { implicit: flagId }, 5: { implicit: flagId } } });
  const group = resolve(state).perCell[4].aggregated.find((g) => g.mod.id === flagId);
  assert.equal(group.count, 2);
  assert.equal(group.total, null);
});

test('different mods stay separate', () => {
  const state = makeState({ cells: { 3: { implicit: ADJ }, 5: { implicit: ADJ_OTHER } } });
  const groups = resolve(state).perCell[4].aggregated;
  assert.equal(groups.length, 2);
  assert.ok(groups.every((g) => g.count === 1));
});

test('a chart with no implicit contributes nothing', () => {
  const { perCell, voyageWide } = resolve(makeState());
  assert.equal(voyageWide.length, 0);
  assert.ok(perCell.every((p) => p.all.length === 0));
});

test('influenceOf drives the highlight for each scope', () => {
  const state = makeState();
  assert.deepEqual(influenceOf(4, getMod(ADJ), state.cells, state.settings).sort(), [1, 3, 5, 7]);
  assert.equal(influenceOf(4, getMod(VOY), state.cells, state.settings).length, 9);
  assert.deepEqual(influenceOf(4, getMod('DeepwaterBorderMoreCurrency3'), state.cells, state.settings), [4]);
  assert.deepEqual(influenceOf(4, null, state.cells, state.settings), []);
});

test('adjacentTargets ignores unplaced cells', () => {
  const cells = Array.from({ length: 9 }, (_, i) => ({ i, mask: i === 1 ? 0 : FULL }));
  assert.deepEqual(adjacentTargets(4, cells).sort(), [3, 5, 7]);
});

test('an unknown mod id resolves to a placeholder instead of crashing', () => {
  const state = makeState({ cells: { 4: { implicit: 'MapSomethingFromANewerPatch' } } });
  const { perCell } = resolve(state);
  assert.equal(perCell[4].own.unknown, true);
  assert.match(perCell[4].own.text, /Unknown modifier/);
});

test('aggregate handles an empty list', () => {
  assert.deepEqual(aggregate([]), []);
  assert.equal(formatTotal(null), '');
});
