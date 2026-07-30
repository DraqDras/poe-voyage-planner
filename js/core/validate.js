/**
 * Connection validation.
 *
 * "All placed charts must have valid connections to each other; broken connections will show a
 * red indicator on the edge of the chart, and prevent beginning the Voyage." - poewiki
 *
 * An internal edge is valid when both sides agree: both open (a passage) or both closed (a wall).
 * A one-sided opening is broken.
 */

import { hasEdge, DIR_NAME } from './shapes.js';
import { CELLS, INTERNAL_EDGES, cellLabel, outwardDirs } from './board.js';

export const EDGE_STATUS = {
  LINK: 'link',       // both sides open
  WALL: 'wall',       // both sides closed
  BROKEN: 'broken',   // one side open, the other closed
  PENDING: 'pending', // at least one side has no chart yet
};

/**
 * @param {Array<{i:number, mask:number}>} cells
 * @param {{openEdgesAllowed?: boolean}} [settings]
 */
export function validateBoard(cells, settings = {}) {
  const openEdgesAllowed = settings.openEdgesAllowed !== false;
  const maskOf = (i) => cells[i]?.mask ?? 0;
  const placed = (i) => maskOf(i) !== 0;

  const edges = INTERNAL_EDGES.map(({ a, b, dir, back }) => {
    let status;
    if (!placed(a) || !placed(b)) {
      status = EDGE_STATUS.PENDING;
    } else {
      const openA = hasEdge(maskOf(a), dir);
      const openB = hasEdge(maskOf(b), back);
      if (openA && openB) status = EDGE_STATUS.LINK;
      else if (!openA && !openB) status = EDGE_STATUS.WALL;
      else status = EDGE_STATUS.BROKEN;
    }
    return { a, b, dir, back, status };
  });

  // Openings pointing off the board. Whether the game treats those as broken is unconfirmed,
  // so they are a soft warning by default (see settings.openEdgesAllowed).
  const outward = [];
  for (const i of CELLS) {
    if (!placed(i)) continue;
    for (const dir of outwardDirs(i)) {
      if (hasEdge(maskOf(i), dir)) outward.push({ cell: i, dir });
    }
  }

  const broken = edges.filter((e) => e.status === EDGE_STATUS.BROKEN);
  const emptyCount = CELLS.filter((i) => !placed(i)).length;
  const outwardIsError = !openEdgesAllowed;

  const problems = [];
  for (const e of broken) {
    problems.push({
      severity: 'error',
      text: `Zerwane połączenie: ${cellLabel(e.a)} ↔ ${cellLabel(e.b)}`,
    });
  }
  for (const o of outward) {
    problems.push({
      severity: outwardIsError ? 'error' : 'warning',
      text: `${cellLabel(o.cell)}: wyjście poza planszę (${DIR_NAME[o.dir]})`,
    });
  }
  if (emptyCount > 0) {
    problems.push({
      severity: 'warning',
      text: `Brakuje ${emptyCount} ${emptyCount === 1 ? 'chartu' : 'chartów'} — Voyage wymaga 9.`,
    });
  }

  const errorCount = problems.filter((p) => p.severity === 'error').length;

  return {
    edges,
    outward,
    problems,
    brokenCount: broken.length,
    emptyCount,
    /** True when the board could actually start a Voyage. */
    canBegin: errorCount === 0 && emptyCount === 0,
  };
}

/** Per-cell edge status map, for rendering the markers on the tile. */
export function edgeStatusByCell(result) {
  const byCell = new Map(CELLS.map((i) => [i, {}]));
  for (const e of result.edges) {
    byCell.get(e.a)[e.dir] = e.status;
    byCell.get(e.b)[e.back] = e.status;
  }
  return byCell;
}
