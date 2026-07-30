import test from 'node:test';
import assert from 'node:assert/strict';

import { N, E, S, W, FULL } from '../js/core/shapes.js';
import { CELLS, emptyCells } from '../js/core/board.js';
import { validateBoard, edgeStatusByCell, EDGE_STATUS } from '../js/core/validate.js';

const board = (masks) => masks.map((mask, i) => ({ i, mask, label: '', areaLevel: null, implicit: null }));

test('nine crosses connect everywhere', () => {
  const result = validateBoard(board(Array(9).fill(FULL)));
  assert.equal(result.brokenCount, 0);
  assert.equal(result.emptyCount, 0);
  assert.ok(result.edges.every((e) => e.status === EDGE_STATUS.LINK));
  assert.equal(result.canBegin, true);
});

test('a one-sided opening is a broken connection', () => {
  // A1 opens east, B1 does not open west.
  const masks = Array(9).fill(FULL);
  masks[0] = E;
  masks[1] = E;
  const result = validateBoard(board(masks));
  const edge = result.edges.find((e) => e.a === 0 && e.b === 1);
  assert.equal(edge.status, EDGE_STATUS.BROKEN);
  assert.ok(result.brokenCount >= 1);
  assert.equal(result.canBegin, false);
});

test('wall against wall is valid, not broken', () => {
  // A1 opens south only, B1 opens south only: the shared vertical edge is closed on both sides.
  const masks = Array(9).fill(FULL);
  masks[0] = S;
  masks[1] = S;
  const result = validateBoard(board(masks));
  const edge = result.edges.find((e) => e.a === 0 && e.b === 1);
  assert.equal(edge.status, EDGE_STATUS.WALL);
});

test('an empty cell leaves its edges pending instead of broken', () => {
  const masks = Array(9).fill(FULL);
  masks[4] = 0;
  const result = validateBoard(board(masks));
  assert.equal(result.brokenCount, 0);
  assert.equal(result.emptyCount, 1);
  assert.equal(result.canBegin, false, 'a Voyage needs all nine charts');
  const touchingCentre = result.edges.filter((e) => e.a === 4 || e.b === 4);
  assert.equal(touchingCentre.length, 4);
  assert.ok(touchingCentre.every((e) => e.status === EDGE_STATUS.PENDING));
});

test('openings pointing off the board are a warning by default and an error when disallowed', () => {
  const masks = Array(9).fill(FULL);
  const lenient = validateBoard(board(masks), { openEdgesAllowed: true });
  assert.equal(lenient.outward.length, 12, 'every perimeter opening is reported');
  assert.equal(lenient.canBegin, true);
  assert.ok(lenient.problems.every((p) => p.severity !== 'error'));

  const strict = validateBoard(board(masks), { openEdgesAllowed: false });
  assert.equal(strict.canBegin, false);
  assert.ok(strict.problems.some((p) => p.severity === 'error'));
});

test('a sealed board — every internal edge open, nothing pointing outward — is fully valid', () => {
  const masks = [
    E | S,     E | S | W,     S | W,
    N | E | S, FULL,          N | S | W,
    N | E,     N | E | W,     N | W,
  ];
  const result = validateBoard(board(masks), { openEdgesAllowed: false });
  assert.equal(result.brokenCount, 0);
  assert.equal(result.outward.length, 0);
  assert.equal(result.problems.length, 0);
  assert.equal(result.canBegin, true);
});

test('a plausible-looking layout still catches an asymmetric opening', () => {
  // A1 opens south, but A2 is a straight east-west and has no north opening.
  const masks = [E | S, E | S | W, S | W, E | W, FULL, N | S | W, N | E, N | E | W, N | W];
  const result = validateBoard(board(masks));
  const edge = result.edges.find((e) => e.a === 0 && e.b === 3);
  assert.equal(edge.status, EDGE_STATUS.BROKEN);
  assert.equal(result.canBegin, false);
});

test('edgeStatusByCell reports both sides of every edge', () => {
  const result = validateBoard(board(Array(9).fill(FULL)));
  const byCell = edgeStatusByCell(result);
  assert.equal(byCell.get(4)[N], EDGE_STATUS.LINK);
  assert.equal(byCell.get(4)[E], EDGE_STATUS.LINK);
  assert.equal(byCell.get(4)[S], EDGE_STATUS.LINK);
  assert.equal(byCell.get(4)[W], EDGE_STATUS.LINK);
  assert.equal(byCell.get(0)[N], undefined, 'perimeter directions have no internal edge');
});

test('an empty board is not startable', () => {
  const result = validateBoard(emptyCells());
  assert.equal(result.emptyCount, CELLS.length);
  assert.equal(result.canBegin, false);
});
