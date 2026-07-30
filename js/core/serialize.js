/** Save / load / validate the layout JSON. */

import { CELL_COUNT, emptyCells } from './board.js';
import { BORDER_SLOT_IDS, emptyBorders, getSlot } from './borders.js';
import { FULL } from './shapes.js';

export const SCHEMA_VERSION = 1;
export const APP_ID = 'poe-voyage-planner';

export const DEFAULT_SETTINGS = {
  /** 'orthogonal' = all four neighbours; 'connected' = only neighbours joined by an open passage. */
  adjacency: 'orthogonal',
  /** Openings pointing off the board: warning (true) or hard error (false). */
  openEdgesAllowed: true,
};

export function createEmptyState(name = '') {
  return {
    name,
    settings: { ...DEFAULT_SETTINGS },
    cells: emptyCells(),
    borders: emptyBorders(),
  };
}

export function toJSON(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    app: APP_ID,
    savedAt: new Date().toISOString(),
    name: state.name || '',
    settings: { ...DEFAULT_SETTINGS, ...state.settings },
    cells: state.cells.map((c) => ({
      i: c.i,
      mask: c.mask,
      label: c.label || '',
      areaLevel: Number.isFinite(c.areaLevel) ? c.areaLevel : null,
      implicit: c.implicit || null,
    })),
    borders: BORDER_SLOT_IDS.map((slot) => ({
      slot,
      modId: state.borders.find((b) => b.slot === slot)?.modId || null,
    })),
  };
}

export class LayoutError extends Error {}

/**
 * Parses a saved layout. Throws LayoutError with a readable message on structural problems;
 * recoverable oddities (missing cells, unknown slots, out-of-range values) are repaired and
 * reported in `warnings` so a slightly-off file still opens.
 */
export function fromJSON(raw) {
  const warnings = [];
  let data = raw;

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      throw new LayoutError(`Plik nie jest poprawnym JSON-em: ${err.message}`);
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new LayoutError('Plik nie zawiera obiektu z layoutem.');
  }
  if (data.app && data.app !== APP_ID) {
    warnings.push(`Plik pochodzi z innej aplikacji ("${data.app}"). Próbuję wczytać mimo to.`);
  }
  if (!Array.isArray(data.cells)) {
    throw new LayoutError('Brak tablicy "cells" — to nie jest layout Voyage.');
  }
  const version = Number(data.schemaVersion) || 1;
  if (version > SCHEMA_VERSION) {
    warnings.push(
      `Layout zapisano nowszą wersją narzędzia (schemaVersion ${version} > ${SCHEMA_VERSION}). ` +
        'Nieznane pola zostaną pominięte.'
    );
  }

  const state = createEmptyState(typeof data.name === 'string' ? data.name : '');

  if (data.settings && typeof data.settings === 'object') {
    if (data.settings.adjacency === 'connected' || data.settings.adjacency === 'orthogonal') {
      state.settings.adjacency = data.settings.adjacency;
    }
    if (typeof data.settings.openEdgesAllowed === 'boolean') {
      state.settings.openEdgesAllowed = data.settings.openEdgesAllowed;
    }
  }

  const seen = new Set();
  for (const rawCell of data.cells) {
    if (!rawCell || typeof rawCell !== 'object') continue;
    const i = Number(rawCell.i);
    if (!Number.isInteger(i) || i < 0 || i >= CELL_COUNT) {
      warnings.push(`Pominięto pole o niepoprawnym indeksie: ${JSON.stringify(rawCell.i)}`);
      continue;
    }
    if (seen.has(i)) {
      warnings.push(`Pole ${i} występuje więcej niż raz — użyto pierwszego wystąpienia.`);
      continue;
    }
    seen.add(i);

    let mask = Number(rawCell.mask);
    if (!Number.isInteger(mask) || mask < 0 || mask > FULL) {
      warnings.push(`Pole ${i}: niepoprawna maska (${rawCell.mask}), wyczyszczono pole.`);
      mask = 0;
    }
    let areaLevel = rawCell.areaLevel === null ? null : Number(rawCell.areaLevel);
    if (areaLevel !== null && (!Number.isFinite(areaLevel) || areaLevel < 1 || areaLevel > 100)) {
      warnings.push(`Pole ${i}: area level poza zakresem (${rawCell.areaLevel}), wyczyszczono.`);
      areaLevel = null;
    }

    state.cells[i] = {
      i,
      mask,
      label: typeof rawCell.label === 'string' ? rawCell.label : '',
      areaLevel,
      implicit: mask === 0 ? null : rawCell.implicit || null,
    };
  }
  if (seen.size !== CELL_COUNT) {
    warnings.push(`Layout zawierał ${seen.size} z ${CELL_COUNT} pól — reszta jest pusta.`);
  }

  if (Array.isArray(data.borders)) {
    for (const b of data.borders) {
      if (!b || typeof b !== 'object') continue;
      if (!getSlot(b.slot)) {
        warnings.push(`Pominięto nieznany slot borderowy: ${JSON.stringify(b.slot)}`);
        continue;
      }
      const target = state.borders.find((x) => x.slot === b.slot);
      target.modId = b.modId || null;
    }
  }

  return { state, warnings };
}

export function suggestFilename(state) {
  const slug =
    (state.name || 'voyage')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'voyage';
  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-${date}.json`;
}
