/**
 * Turns a board state into "what actually applies where".
 *
 * Three sources feed every cell:
 *   - the chart's own implicit (adjacent-scope implicits do NOT affect their own cell)
 *   - adjacent implicits carried by neighbouring charts
 *   - border modifiers on the segments touching the cell
 * plus voyage-scope implicits, which apply to all nine cells at once.
 */

import { getMod } from '../../data/mods.js';
import { CELLS, neighbors } from './board.js';
import { slotsOfCell } from './borders.js';
import { validateBoard, EDGE_STATUS } from './validate.js';

/**
 * Cells reached by an adjacent-scope mod placed on `cell`.
 * @param {'orthogonal'|'connected'} adjacency
 */
export function adjacentTargets(cell, cells, adjacency = 'orthogonal', validation = null) {
  const list = neighbors(cell).filter((n) => (cells[n.index]?.mask ?? 0) !== 0);
  if (adjacency !== 'connected') return list.map((n) => n.index);

  const v = validation || validateBoard(cells);
  return list
    .filter((n) =>
      v.edges.some(
        (e) =>
          e.status === EDGE_STATUS.LINK &&
          ((e.a === cell && e.b === n.index) || (e.b === cell && e.a === n.index))
      )
    )
    .map((n) => n.index);
}

/** Cells lit up when a mod with the given scope sits on `cell`. Used for the green highlight. */
export function influenceOf(cell, mod, cells, settings = {}) {
  if (!mod) return [];
  if (mod.scope === 'voyage') return [...CELLS];
  if (mod.scope === 'border') return [cell];
  return adjacentTargets(cell, cells, settings.adjacency);
}

/** Groups identical mods, counting stacks and summing numeric ranges where that makes sense. */
export function aggregate(entries) {
  const byId = new Map();
  for (const entry of entries) {
    const { mod } = entry;
    if (!byId.has(mod.id)) byId.set(mod.id, { mod, count: 0, sources: [] });
    const group = byId.get(mod.id);
    group.count += 1;
    group.sources.push(entry);
  }
  return [...byId.values()].map((g) => {
    const { mod, count } = g;
    let total = null;
    if (mod.stack === 'sum' && mod.numeric && count > 1) {
      total = {
        min: mod.numeric.min * count,
        max: mod.numeric.max * count,
        unit: mod.numeric.unit,
      };
    }
    return { ...g, total };
  });
}

export function formatTotal(total) {
  if (!total) return '';
  const value = total.min === total.max ? `${total.min}` : `${total.min}-${total.max}`;
  return total.unit === '%' ? `${value}%` : `×${value}`;
}

/**
 * @param {{cells: Array, borders: Array, settings: object}} state
 */
export function resolve(state) {
  const { cells, borders, settings = {} } = state;
  const validation = validateBoard(cells, settings);

  const voyageWide = [];
  const incoming = new Map(CELLS.map((i) => [i, { fromNeighbors: [], fromBorders: [] }]));
  const outgoing = new Map(CELLS.map((i) => [i, []]));

  for (const cell of cells) {
    if (!cell.implicit || cell.mask === 0) continue;
    const mod = getMod(cell.implicit);
    if (mod.scope === 'voyage') {
      voyageWide.push({ from: cell.i, mod });
      outgoing.set(cell.i, [...CELLS]);
      continue;
    }
    const targets = adjacentTargets(cell.i, cells, settings.adjacency, validation);
    outgoing.set(cell.i, targets);
    for (const t of targets) {
      incoming.get(t).fromNeighbors.push({ from: cell.i, mod });
    }
  }

  const borderById = new Map((borders || []).map((b) => [b.slot, b.modId]));
  for (const i of CELLS) {
    for (const slot of slotsOfCell(i)) {
      const modId = borderById.get(slot.id);
      if (!modId) continue;
      incoming.get(i).fromBorders.push({ slot: slot.id, mod: getMod(modId) });
    }
  }

  const perCell = CELLS.map((i) => {
    const cell = cells[i];
    const own = cell.implicit ? getMod(cell.implicit) : null;
    const { fromNeighbors, fromBorders } = incoming.get(i);
    const all = [
      ...fromNeighbors.map((e) => ({ ...e, source: 'neighbor' })),
      ...fromBorders.map((e) => ({ ...e, source: 'border' })),
      ...voyageWide.map((e) => ({ ...e, source: 'voyage' })),
    ];
    return {
      i,
      cell,
      own,
      /** Adjacent implicits do not apply to their own area; voyage ones do. */
      ownAppliesHere: !!own && own.scope === 'voyage',
      fromNeighbors,
      fromBorders,
      voyage: voyageWide,
      all,
      aggregated: aggregate(all),
      influences: outgoing.get(i),
    };
  });

  return { perCell, voyageWide, validation, outgoing };
}
