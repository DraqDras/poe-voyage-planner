/** The 3x3 Voyage Board: indices, coordinates and neighbourhood. */

import { N, E, S, W, DIRS, opposite } from './shapes.js';

export const SIZE = 3;
export const CELL_COUNT = SIZE * SIZE;
export const CELLS = Array.from({ length: CELL_COUNT }, (_, i) => i);

/** Cells are row-major: 0 1 2 / 3 4 5 / 6 7 8. */
export const rowOf = (i) => Math.floor(i / SIZE);
export const colOf = (i) => i % SIZE;
export const indexAt = (row, col) => row * SIZE + col;

/** Spreadsheet-style label used in the UI: A1 is the top-left cell. */
export function cellLabel(i) {
  return `${'ABC'[colOf(i)]}${rowOf(i) + 1}`;
}

const DELTA = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };

/** Index of the neighbour in `dir`, or -1 when it would fall off the board. */
export function neighborIndex(i, dir) {
  const [dr, dc] = DELTA[dir];
  const r = rowOf(i) + dr;
  const c = colOf(i) + dc;
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return -1;
  return indexAt(r, c);
}

/** Orthogonal neighbours that exist on the board. */
export function neighbors(i) {
  return DIRS.map((dir) => ({ dir, index: neighborIndex(i, dir) })).filter((n) => n.index >= 0);
}

/** Directions pointing off the board from cell `i`. */
export function outwardDirs(i) {
  return DIRS.filter((dir) => neighborIndex(i, dir) < 0);
}

/**
 * The 12 internal edges of the board, each listed once, as {a, b, dir} where `dir` is the
 * direction from a to b (always E or S, so every pair appears exactly once).
 */
export const INTERNAL_EDGES = (() => {
  const out = [];
  for (const i of CELLS) {
    for (const dir of [E, S]) {
      const j = neighborIndex(i, dir);
      if (j >= 0) out.push({ a: i, b: j, dir, back: opposite(dir) });
    }
  }
  return out;
})();

/** Creates a blank board state: 9 empty cells. */
export function emptyCells() {
  return CELLS.map((i) => ({ i, mask: 0, label: '', areaLevel: null, implicit: null }));
}
