import test from 'node:test';
import assert from 'node:assert/strict';

import {
  N, E, S, W, FULL,
  rotate, opposite, shapeOf, orientationsOf, allOrientations, describeMask, edgeCount,
} from '../js/core/shapes.js';

test('rotating four times is the identity', () => {
  for (let mask = 0; mask <= FULL; mask++) {
    assert.equal(rotate(mask, 4), mask, `mask ${mask}`);
  }
});

test('a single rotation moves N->E->S->W->N', () => {
  assert.equal(rotate(N), E);
  assert.equal(rotate(E), S);
  assert.equal(rotate(S), W);
  assert.equal(rotate(W), N);
});

test('negative steps rotate the other way', () => {
  assert.equal(rotate(N, -1), W);
  assert.equal(rotate(N, 1), rotate(N, -3));
});

test('rotation preserves the number of open edges', () => {
  for (let mask = 0; mask <= FULL; mask++) {
    for (let step = 0; step < 4; step++) {
      assert.equal(edgeCount(rotate(mask, step)), edgeCount(mask));
    }
  }
});

test('opposite flips the direction', () => {
  assert.equal(opposite(N), S);
  assert.equal(opposite(E), W);
  assert.equal(opposite(S), N);
  assert.equal(opposite(W), E);
});

test('shapeOf classifies all 16 masks', () => {
  assert.equal(shapeOf(0).id, 'EMPTY');
  assert.equal(shapeOf(N).id, 'DEAD_END');
  assert.equal(shapeOf(N | S).id, 'STRAIGHT');
  assert.equal(shapeOf(E | W).id, 'STRAIGHT');
  assert.equal(shapeOf(N | E).id, 'CORNER');
  assert.equal(shapeOf(W | N).id, 'CORNER');
  assert.equal(shapeOf(N | E | S).id, 'TEE');
  assert.equal(shapeOf(FULL).id, 'CROSS');
});

test('the cross is rotation-invariant, the straight has two orientations', () => {
  assert.equal(orientationsOf('CROSS').length, 1);
  assert.equal(orientationsOf('STRAIGHT').length, 2);
  assert.equal(orientationsOf('DEAD_END').length, 4);
  assert.equal(orientationsOf('CORNER').length, 4);
  assert.equal(orientationsOf('TEE').length, 4);
});

test('the five shapes cover exactly the 15 non-empty masks, without overlap', () => {
  const all = allOrientations().map((o) => o.mask);
  assert.equal(all.length, 15);
  assert.equal(new Set(all).size, 15);
  assert.deepEqual([...all].sort((a, b) => a - b), Array.from({ length: 15 }, (_, i) => i + 1));
});

test('every mask gets a readable, distinct description', () => {
  const seen = new Set();
  for (let mask = 0; mask <= FULL; mask++) {
    const text = describeMask(mask);
    assert.ok(text.length > 0, `mask ${mask}`);
    seen.add(text);
  }
  assert.equal(seen.size, 16);
});
