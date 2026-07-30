/**
 * Board perimeter: the randomised border segments.
 *
 * The wiki describes them as "2 per corner, 1 per middle edge". Read per board side that is
 * 3 segments - one next to each of the 3 cells on that side - giving 12 slots in total:
 * corner cells touch 2 segments, edge cells 1, the centre cell none. 4*2 + 4*1 = 12.
 */

import { N, E, S, W } from './shapes.js';
import { indexAt, SIZE, cellLabel } from './board.js';

export const SIDES = [
  { id: 'N', dir: N, name: 'Góra' },
  { id: 'E', dir: E, name: 'Prawo' },
  { id: 'S', dir: S, name: 'Dół' },
  { id: 'W', dir: W, name: 'Lewo' },
];

/** Cell touched by segment `k` (0..2) of a given side. */
function cellForSegment(sideId, k) {
  switch (sideId) {
    case 'N': return indexAt(0, k);
    case 'S': return indexAt(SIZE - 1, k);
    case 'W': return indexAt(k, 0);
    case 'E': return indexAt(k, SIZE - 1);
    default: throw new Error(`Unknown side: ${sideId}`);
  }
}

/** All 12 border slots, in a stable order: N-0..N-2, E-0..E-2, S-0..S-2, W-0..W-2. */
export const BORDER_SLOTS = SIDES.flatMap((side) =>
  [0, 1, 2].map((k) => {
    const cell = cellForSegment(side.id, k);
    return {
      id: `${side.id}-${k}`,
      side: side.id,
      dir: side.dir,
      index: k,
      cell,
      name: `${side.name} ${k + 1} (${cellLabel(cell)})`,
    };
  })
);

export const BORDER_SLOT_IDS = BORDER_SLOTS.map((s) => s.id);

const SLOT_BY_ID = new Map(BORDER_SLOTS.map((s) => [s.id, s]));

export function getSlot(id) {
  return SLOT_BY_ID.get(id) || null;
}

export function cellOfSlot(id) {
  const slot = SLOT_BY_ID.get(id);
  return slot ? slot.cell : -1;
}

/** Border slots touching a given cell (2 for corners, 1 for edges, 0 for the centre). */
export function slotsOfCell(cell) {
  return BORDER_SLOTS.filter((s) => s.cell === cell);
}

/** Blank border state: every slot empty. */
export function emptyBorders() {
  return BORDER_SLOTS.map((s) => ({ slot: s.id, modId: null }));
}
