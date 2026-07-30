import test from 'node:test';
import assert from 'node:assert/strict';

import { computeAreaLevel } from '../js/core/level.js';
import { FULL } from '../js/core/shapes.js';

const cells = (levels) =>
  levels.map((areaLevel, i) => ({ i, mask: areaLevel === null ? 0 : FULL, areaLevel }));

test('nine identical charts give average + 10, capped at the highest used', () => {
  const result = computeAreaLevel(cells(Array(9).fill(80)));
  assert.equal(result.average, 80);
  assert.equal(result.highest, 80);
  assert.equal(result.level, 80, 'the +10 is clipped by the highest chart');
  assert.equal(result.capped, true);
});

test('the +10 applies when the highest chart leaves room for it', () => {
  const result = computeAreaLevel(cells([70, 70, 70, 70, 70, 70, 70, 70, 95]));
  assert.equal(result.highest, 95);
  assert.equal(Math.floor(result.average), 72);
  assert.equal(result.level, 82);
  assert.equal(result.capped, false);
});

test('the average is floored before the bonus', () => {
  const result = computeAreaLevel(cells([81, 82, 82, 82, 82, 82, 82, 82, 95]));
  assert.ok(result.average > 83 && result.average < 84, `average was ${result.average}`);
  assert.equal(result.level, 93, 'floor(83.33) + 10, still under the 95 cap');
});

test('empty cells and charts without a level are ignored', () => {
  const result = computeAreaLevel(cells([83, 83, null, null, null, null, null, null, null]));
  assert.equal(result.chartCount, 2);
  assert.equal(result.level, 83);
});

test('a board with no levels at all returns null', () => {
  assert.equal(computeAreaLevel(cells(Array(9).fill(null))), null);
});
