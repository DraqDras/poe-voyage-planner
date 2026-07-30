/** Summary view: who affects what, at a glance and in detail. */

import { store } from '../state.js';
import { CELLS, cellLabel } from '../core/board.js';
import { glyphOf, describeMask } from '../core/shapes.js';
import { formatTotal } from '../core/resolve.js';
import { computeAreaLevel } from '../core/level.js';
import { escapeHtml, escapeAttr } from './picker.js';

let el = null;

export function mount(container) {
  el = container;
}

export function render(resolved) {
  const { layout } = store;
  const lvl = computeAreaLevel(layout.cells);
  const placed = layout.cells.filter((c) => c.mask !== 0).length;

  el.innerHTML = `
    <div class="summary-inner">
      <header class="summary-head">
        <h2>${escapeHtml(layout.name || 'Layout bez nazwy')}</h2>
        <p>
          ${placed}/9 chartów ·
          ${lvl ? `area level <strong>${lvl.level}</strong>` : 'brak area levelu'} ·
          ${
            resolved.validation.canBegin
              ? '<span class="ok">połączenia OK</span>'
              : `<span class="bad">${resolved.validation.brokenCount} zerwanych połączeń</span>`
          }
        </p>
      </header>

      ${renderVoyageWide(resolved)}
      ${renderMatrix(resolved)}
      ${renderTable(resolved)}
      ${renderLegend()}
    </div>`;
}

function renderVoyageWide(resolved) {
  if (resolved.voyageWide.length === 0) {
    return `<section class="summary-block">
        <h3>Voyage-wide</h3>
        <p class="muted">Żaden chart nie ma implicitu o zasięgu Voyage.</p>
      </section>`;
  }
  return `<section class="summary-block">
      <h3>Voyage-wide <span class="muted">— działa na wszystkie 9 pól</span></h3>
      <ul class="summary-voyage">
        ${resolved.voyageWide
          .map(
            (e) => `<li>
              <span class="chart-chip" data-chart-color="${e.from % 9}">${cellLabel(e.from)}</span>
              ${escapeHtml(e.mod.text)}
            </li>`
          )
          .join('')}
      </ul>
    </section>`;
}

function renderMatrix(resolved) {
  const cellsHtml = CELLS.map((i) => {
    const cell = store.layout.cells[i];
    const info = resolved.perCell[i];
    if (cell.mask === 0) {
      return `<div class="matrix-cell is-empty"><span class="matrix-tag">${cellLabel(i)}</span></div>`;
    }
    const dots = [
      ...info.fromNeighbors.map(
        (e) =>
          `<span class="dot" data-chart-color="${e.from % 9}" title="${escapeAttr(
            `${cellLabel(e.from)} → ${e.mod.text}`
          )}">${cellLabel(e.from)}</span>`
      ),
      ...info.fromBorders.map(
        (e) => `<span class="dot is-border" title="${escapeAttr(`${e.slot} → ${e.mod.text}`)}">⚓</span>`
      ),
      ...info.voyage.map(
        (e) =>
          `<span class="dot is-voyage" title="${escapeAttr(
            `${cellLabel(e.from)} (voyage) → ${e.mod.text}`
          )}">◍</span>`
      ),
    ];
    return `<div class="matrix-cell" data-chart-color="${i % 9}">
        <span class="matrix-tag">${cellLabel(i)}</span>
        <span class="matrix-glyph" title="${escapeAttr(describeMask(cell.mask))}">${glyphOf(cell.mask)}</span>
        ${cell.label ? `<span class="matrix-name">${escapeHtml(cell.label)}</span>` : ''}
        <span class="matrix-dots">${dots.join('') || '<span class="muted">—</span>'}</span>
      </div>`;
  }).join('');

  return `<section class="summary-block">
      <h3>Kto na kogo wpływa</h3>
      <p class="muted">Każdy chart ma swój kolor. Kropki na polu = źródła modyfikatorów, które tam docierają.</p>
      <div class="matrix">${cellsHtml}</div>
    </section>`;
}

function renderTable(resolved) {
  const rows = CELLS.map((i) => {
    const cell = store.layout.cells[i];
    const info = resolved.perCell[i];
    if (cell.mask === 0) {
      return `<tr class="is-empty">
          <td>${cellLabel(i)}</td><td colspan="7" class="muted">puste pole</td>
        </tr>`;
    }
    const list = (entries, srcFn) =>
      entries.length
        ? `<ul class="cellmods">${entries
            .map(
              (e) =>
                `<li title="${escapeAttr(e.mod.text)}"><span class="src">${escapeHtml(
                  srcFn(e)
                )}</span>${escapeHtml(e.mod.short)}</li>`
            )
            .join('')}</ul>`
        : '<span class="muted">—</span>';

    const stacks = info.aggregated.filter((g) => g.count > 1);

    return `<tr data-chart-color="${i % 9}">
        <td class="col-cell"><span class="chart-chip" data-chart-color="${i % 9}">${cellLabel(i)}</span></td>
        <td class="col-name">${escapeHtml(cell.label || '—')}</td>
        <td class="col-shape" title="${escapeAttr(describeMask(cell.mask))}">${glyphOf(cell.mask)}</td>
        <td class="col-ilvl">${cell.areaLevel ?? '—'}</td>
        <td class="col-own">${
          info.own
            ? `<span class="mod-pill scope-${info.own.scope}" title="${escapeAttr(
                info.own.text
              )}">${escapeHtml(info.own.short)}</span>`
            : '<span class="muted">—</span>'
        }</td>
        <td>${list(info.fromNeighbors, (e) => cellLabel(e.from))}</td>
        <td>${list(info.fromBorders, (e) => e.slot)}</td>
        <td>${
          stacks.length
            ? `<ul class="cellmods">${stacks
                .map(
                  (g) =>
                    `<li title="${escapeAttr(g.mod.text)}"><span class="src">×${g.count}</span>${escapeHtml(
                      g.mod.short
                    )} ${escapeHtml(formatTotal(g.total))}</li>`
                )
                .join('')}</ul>`
            : '<span class="muted">—</span>'
        }</td>
      </tr>`;
  }).join('');

  return `<section class="summary-block">
      <h3>Szczegóły pól</h3>
      <div class="table-scroll">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Pole</th><th>Chart</th><th>Kształt</th><th>iLvl</th>
              <th>Własny implicit</th><th>Od sąsiadów</th><th>Z obrzeża</th><th>Stacki</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="muted">Voyage-wide mody działają na każde pole — są wypisane osobno u góry, żeby nie dublować ich w 9 wierszach.</p>
    </section>`;
}

function renderLegend() {
  return `<section class="summary-block legend">
      <h3>Legenda</h3>
      <ul>
        <li><span class="scope-dot scope-adjacent"></span> Adjacent — działa na sąsiednie pola (nie na własne)</li>
        <li><span class="scope-dot scope-voyage"></span> Voyage — działa na wszystkie 9 pól, łącznie z własnym</li>
        <li><span class="dot is-border">⚓</span> border mod z obrzeża planszy</li>
        <li>Kształty: ╵ ╶ ╷ ╴ ślepy zaułek · │ ─ prosta · └ ┌ ┐ ┘ zakręt · ├ ┬ ┤ ┴ trójnóg · ┼ skrzyżowanie</li>
      </ul>
    </section>`;
}
