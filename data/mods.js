import { ADJACENT_IMPLICITS } from './adjacent-implicits.js';
import { VOYAGE_IMPLICITS } from './voyage-implicits.js';
import { BORDER_MODS } from './border-mods.js';

export { ADJACENT_IMPLICITS, VOYAGE_IMPLICITS, BORDER_MODS };

/** Every implicit a chart can carry (adjacent + voyage). Border mods are not chart implicits. */
export const CHART_IMPLICITS = [...ADJACENT_IMPLICITS, ...VOYAGE_IMPLICITS];

export const ALL_MODS = [...CHART_IMPLICITS, ...BORDER_MODS];

const BY_ID = new Map(ALL_MODS.map((m) => [m.id, m]));

/**
 * Looks up a mod by id. Unknown ids resolve to a placeholder rather than undefined, so a
 * layout saved against a newer data set still loads instead of blowing up.
 */
export function getMod(id) {
  if (!id) return null;
  return (
    BY_ID.get(id) || {
      id,
      scope: 'unknown',
      category: 'misc',
      short: `? ${id}`,
      text: `Unknown modifier (${id})`,
      stack: 'flag',
      unknown: true,
    }
  );
}

export const CATEGORIES = {
  strongbox: 'Strongboxy',
  essence: 'Esencje',
  packs: 'Packi potworów',
  density: 'Gęstość / trudność',
  unique: 'Uniki',
  currency: 'Currency',
  loot: 'Loot',
  quality: 'Jakość',
  misc: 'Pozostałe',
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES);
