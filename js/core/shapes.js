/**
 * Chart tile geometry.
 *
 * A chart is a square with an opening on zero or more of its four edges. That is all a tile is:
 * a 4-bit mask. The five in-game shapes (dead end / straight / corner / tee / cross) are just
 * the non-empty subsets of {N,E,S,W}, so shape and rotation are *derived* from the mask instead
 * of being stored alongside it. Rotating by 90 deg is a bit rotation.
 */

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

export const DIRS = [N, E, S, W];
export const DIR_NAME = { [N]: 'N', [E]: 'E', [S]: 'S', [W]: 'W' };
export const DIR_PL = { [N]: 'góra', [E]: 'prawo', [S]: 'dół', [W]: 'lewo' };

export const EMPTY = 0;
export const FULL = N | E | S | W;

/** Rotates a mask clockwise by `steps` * 90 degrees. Negative steps rotate counter-clockwise. */
export function rotate(mask, steps = 1) {
  const s = ((steps % 4) + 4) % 4;
  const m = mask & FULL;
  return ((m << s) | (m >> (4 - s))) & FULL;
}

/** The direction facing back at you from the neighbouring tile. */
export function opposite(dir) {
  return rotate(dir, 2);
}

export function hasEdge(mask, dir) {
  return (mask & dir) !== 0;
}

export function edgeCount(mask) {
  let n = 0;
  for (const d of DIRS) if (hasEdge(mask, d)) n++;
  return n;
}

export const SHAPES = {
  EMPTY: { id: 'EMPTY', name: 'Puste pole', edges: 0, rotations: 1 },
  DEAD_END: { id: 'DEAD_END', name: 'Ślepy zaułek', edges: 1, rotations: 4 },
  STRAIGHT: { id: 'STRAIGHT', name: 'Prosta', edges: 2, rotations: 2 },
  CORNER: { id: 'CORNER', name: 'Zakręt', edges: 2, rotations: 4 },
  TEE: { id: 'TEE', name: 'Trójnóg', edges: 3, rotations: 4 },
  CROSS: { id: 'CROSS', name: 'Skrzyżowanie', edges: 4, rotations: 1 },
};

/** Order used by the shape picker and the 1-5 keyboard shortcuts. */
export const SHAPE_ORDER = ['DEAD_END', 'STRAIGHT', 'CORNER', 'TEE', 'CROSS'];

export function shapeOf(mask) {
  const m = mask & FULL;
  switch (edgeCount(m)) {
    case 0:
      return SHAPES.EMPTY;
    case 1:
      return SHAPES.DEAD_END;
    case 2:
      return m === (N | S) || m === (E | W) ? SHAPES.STRAIGHT : SHAPES.CORNER;
    case 3:
      return SHAPES.TEE;
    default:
      return SHAPES.CROSS;
  }
}

/** All distinct masks of a given shape, in clockwise order starting from the canonical one. */
export function orientationsOf(shapeId) {
  const base = {
    DEAD_END: N,
    STRAIGHT: N | S,
    CORNER: N | E,
    TEE: N | E | S,
    CROSS: FULL,
  }[shapeId];
  if (base === undefined) return [];
  const out = [];
  for (let i = 0; i < 4; i++) {
    const m = rotate(base, i);
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

/** All 15 placeable masks, grouped shape by shape. Used by the "pick an orientation" list. */
export function allOrientations() {
  return SHAPE_ORDER.flatMap((id) => orientationsOf(id).map((mask) => ({ shapeId: id, mask })));
}

/** Short human label, e.g. "Trójnóg (N-E-S)". */
export function describeMask(mask) {
  const shape = shapeOf(mask);
  if (shape.id === 'EMPTY') return shape.name;
  const dirs = DIRS.filter((d) => hasEdge(mask, d)).map((d) => DIR_NAME[d]);
  return `${shape.name} (${dirs.join('-')})`;
}

/** Compact ASCII glyph for the summary table. */
export function glyphOf(mask) {
  const map = {
    0: '·',
    [N]: '╵', [E]: '╶', [S]: '╷', [W]: '╴',
    [N | S]: '│', [E | W]: '─',
    [N | E]: '└', [E | S]: '┌', [S | W]: '┐', [W | N]: '┘',
    [N | E | S]: '├', [E | S | W]: '┬', [S | W | N]: '┤', [W | N | E]: '┴',
    [FULL]: '┼',
  };
  return map[mask & FULL] ?? '?';
}
