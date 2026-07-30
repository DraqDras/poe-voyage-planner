import test from 'node:test';
import assert from 'node:assert/strict';

import { N, E, S, W } from '../js/core/shapes.js';
import {
  CELLS, CELL_COUNT, INTERNAL_EDGES, neighborIndex, neighbors, outwardDirs, cellLabel, emptyCells,
} from '../js/core/board.js';
import { BORDER_SLOTS, slotsOfCell, cellOfSlot, emptyBorders } from '../js/core/borders.js';

test('the board is 9 cells labelled A1..C3', () => {
  assert.equal(CELL_COUNT, 9);
  assert.equal(cellLabel(0), 'A1');
  assert.equal(cellLabel(2), 'C1');
  assert.equal(cellLabel(4), 'B2');
  assert.equal(cellLabel(8), 'C3');
});

test('neighbourhood respects the board edges', () => {
  assert.equal(neighborIndex(0, N), -1);
  assert.equal(neighborIndex(0, W), -1);
  assert.equal(neighborIndex(0, E), 1);
  assert.equal(neighborIndex(0, S), 3);
  assert.equal(neighbors(4).length, 4, 'centre has four neighbours');
  assert.equal(neighbors(0).length, 2, 'corner has two');
  assert.equal(neighbors(1).length, 3, 'edge has three');
});

test('neighbourhood is symmetric', () => {
  for (const i of CELLS) {
    for (const { dir, index } of neighbors(i)) {
      const back = { [N]: S, [E]: W, [S]: N, [W]: E }[dir];
      assert.equal(neighborIndex(index, back), i);
    }
  }
});

test('outward directions complete the neighbour count to four', () => {
  for (const i of CELLS) {
    assert.equal(neighbors(i).length + outwardDirs(i).length, 4);
  }
});

test('there are 12 internal edges, each listed once', () => {
  assert.equal(INTERNAL_EDGES.length, 12);
  const keys = INTERNAL_EDGES.map((e) => [e.a, e.b].sort((x, y) => x - y).join('-'));
  assert.equal(new Set(keys).size, 12);
});

test('the perimeter has 12 border slots: 2 per corner cell, 1 per edge cell, 0 in the centre', () => {
  assert.equal(BORDER_SLOTS.length, 12);
  assert.equal(new Set(BORDER_SLOTS.map((s) => s.id)).size, 12);

  for (const corner of [0, 2, 6, 8]) assert.equal(slotsOfCell(corner).length, 2, `cell ${corner}`);
  for (const edge of [1, 3, 5, 7]) assert.equal(slotsOfCell(edge).length, 1, `cell ${edge}`);
  assert.equal(slotsOfCell(4).length, 0);

  const total = CELLS.reduce((sum, i) => sum + slotsOfCell(i).length, 0);
  assert.equal(total, 12);
});

test('slot ids map back to their cell', () => {
  assert.equal(cellOfSlot('N-0'), 0);
  assert.equal(cellOfSlot('N-2'), 2);
  assert.equal(cellOfSlot('E-0'), 2);
  assert.equal(cellOfSlot('E-2'), 8);
  assert.equal(cellOfSlot('S-0'), 6);
  assert.equal(cellOfSlot('W-2'), 6);
  assert.equal(cellOfSlot('nope'), -1);
});

test('blank state has nine empty cells and twelve empty slots', () => {
  assert.equal(emptyCells().length, 9);
  assert.ok(emptyCells().every((c) => c.mask === 0 && c.implicit === null));
  assert.equal(emptyBorders().length, 12);
  assert.ok(emptyBorders().every((b) => b.modId === null));
});
