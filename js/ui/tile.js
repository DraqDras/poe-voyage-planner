/** SVG rendering of a chart tile, driven purely by its edge mask. */

import { DIRS, N, E, S, W, hasEdge } from '../core/shapes.js';
import { EDGE_STATUS } from '../core/validate.js';

const SIZE = 100;
const MID = SIZE / 2;

/** Midpoint of each edge, in tile coordinates. */
const EDGE_POINT = {
  [N]: [MID, 0],
  [E]: [SIZE, MID],
  [S]: [MID, SIZE],
  [W]: [0, MID],
};

/**
 * @param {number} mask
 * @param {{statuses?: Record<number,string>, stroke?: number, showMarkers?: boolean}} opts
 * @returns {string} inner SVG markup (caller supplies the <svg> wrapper)
 */
export function tilePaths(mask, opts = {}) {
  const stroke = opts.stroke ?? 15;
  const parts = [`<rect class="tile-bg" x="1" y="1" width="${SIZE - 2}" height="${SIZE - 2}" rx="4" />`];

  for (const dir of DIRS) {
    if (!hasEdge(mask, dir)) continue;
    const [x, y] = EDGE_POINT[dir];
    parts.push(
      `<line class="tile-path" x1="${MID}" y1="${MID}" x2="${x}" y2="${y}" ` +
        `stroke-width="${stroke}" stroke-linecap="butt" />`
    );
  }
  if (mask !== 0) {
    parts.push(`<circle class="tile-hub" cx="${MID}" cy="${MID}" r="${stroke / 2}" />`);
  }

  if (opts.showMarkers && opts.statuses) {
    for (const dir of DIRS) {
      const status = opts.statuses[dir];
      if (!status || status === EDGE_STATUS.PENDING) continue;
      const [x, y] = EDGE_POINT[dir];
      const horizontal = dir === N || dir === S;
      const w = horizontal ? 30 : 6;
      const h = horizontal ? 6 : 30;
      parts.push(
        `<rect class="edge-marker edge-${status}" x="${x - w / 2}" y="${y - h / 2}" ` +
          `width="${w}" height="${h}" rx="3" />`
      );
    }
  }

  return parts.join('');
}

export function tileSvg(mask, opts = {}) {
  const cls = ['tile-svg', opts.className].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">${tilePaths(mask, opts)}</svg>`;
}
