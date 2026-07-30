/**
 * Voyage area level.
 *
 * "The Voyage will have an area level equal to the average area levels of the nine charts
 * used + 10, up to the highest area level used." - poewiki
 *
 * Rounding is unconfirmed; we floor the average (see D4 in DEV_PLAN.md).
 */

export const AREA_LEVEL_BONUS = 10;

export function computeAreaLevel(cells) {
  const levels = cells
    .filter((c) => c.mask !== 0 && Number.isFinite(c.areaLevel))
    .map((c) => c.areaLevel);

  if (levels.length === 0) return null;

  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  const max = Math.max(...levels);
  const raw = Math.floor(avg) + AREA_LEVEL_BONUS;

  return {
    level: Math.min(raw, max),
    average: avg,
    highest: max,
    /** True when the +10 got clipped by the highest chart used. */
    capped: raw > max,
    chartCount: levels.length,
  };
}
