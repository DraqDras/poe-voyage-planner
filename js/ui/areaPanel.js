/** Left-hand panel: everything that applies to the selected area, plus board-wide status. */

import { store, update, updateUI } from '../state.js';
import { cellLabel } from '../core/board.js';
import { slotsOfCell } from '../core/borders.js';
import { describeMask } from '../core/shapes.js';
import { computeAreaLevel } from '../core/level.js';
import { formatTotal } from '../core/resolve.js';
import { CHART_IMPLICITS, CATEGORIES } from '../../data/mods.js';
import { openPicker, escapeHtml, escapeAttr } from './picker.js';
import { assignImplicit, openShapePicker } from './boardView.js';

let el = null;

export function mount(container) {
  el = container;
  el.innerHTML = `
    <div class="panel-head">
      <h2>Area Modifiers</h2>
      <p class="panel-sub" id="area-subtitle">Zaznacz pole na planszy.</p>
    </div>

    <div id="area-body" hidden>
      <div class="field-row">
        <label for="cell-label">Nazwa chartu</label>
        <input id="cell-label" type="text" maxlength="40" placeholder="np. Lost Ruins" autocomplete="off">
      </div>
      <div class="field-row">
        <label for="cell-ilvl">Area level</label>
        <input id="cell-ilvl" type="number" min="1" max="100" placeholder="83">
      </div>
      <div class="field-row">
        <label>Implicit</label>
        <button type="button" id="cell-implicit" class="ghost-btn">Wybierz…</button>
      </div>
      <div class="field-row field-row-actions">
        <button type="button" id="cell-shape" class="ghost-btn">Zmień kształt</button>
        <button type="button" id="cell-clear" class="ghost-btn danger">Usuń chart</button>
      </div>

      <h3 class="area-h3">Działa na tym polu</h3>
      <div id="area-mods"></div>
    </div>

    <div id="area-status" class="area-status"></div>`;

  el.querySelector('#cell-label').addEventListener('input', (ev) => {
    const i = store.ui.selectedCell;
    if (i === null) return;
    update((layout) => {
      layout.cells[i].label = ev.target.value;
    });
  });

  el.querySelector('#cell-ilvl').addEventListener('input', (ev) => {
    const i = store.ui.selectedCell;
    if (i === null) return;
    const value = ev.target.value === '' ? null : Number(ev.target.value);
    update((layout) => {
      layout.cells[i].areaLevel = Number.isFinite(value) ? value : null;
    });
  });

  el.querySelector('#cell-implicit').addEventListener('click', () => {
    const i = store.ui.selectedCell;
    if (i === null) return;
    openImplicitPicker(i);
  });

  el.querySelector('#cell-shape').addEventListener('click', () => {
    const i = store.ui.selectedCell;
    if (i !== null) openShapePicker(i);
  });

  el.querySelector('#cell-clear').addEventListener('click', () => {
    const i = store.ui.selectedCell;
    if (i === null) return;
    update((layout) => {
      layout.cells[i] = { i, mask: 0, label: '', areaLevel: null, implicit: null };
    });
    updateUI((ui) => {
      ui.selectedCell = null;
    });
  });
}

function openImplicitPicker(i) {
  const current = store.layout.cells[i].implicit;
  const items = [
    {
      key: '',
      html: '<span class="picker-empty">∅</span>',
      label: 'Brak implicitu',
      group: 'Wyczyść',
      selected: !current,
    },
    ...CHART_IMPLICITS.map((m) => ({
      key: m.id,
      html: `<span class="picker-mod scope-${m.scope}"><span class="scope-dot"></span>${escapeHtml(m.short)}</span>`,
      label: `${m.text} — i${m.ilvl}`,
      group: `${CATEGORIES[m.category]} — ${m.scope === 'voyage' ? 'Voyage' : 'Adjacent'}`,
      selected: m.id === current,
    })),
  ];
  openPicker({
    title: `Implicit — pole ${cellLabel(i)}`,
    hint: 'Zielona kropka = Adjacent (działa na sąsiadów), pomarańczowa = Voyage (całe Voyage).',
    columns: 2,
    searchable: true,
    items,
    onPick: (key) => assignImplicit(i, key || null),
  });
}

function modLine(entry, extra = '') {
  const { mod } = entry;
  return `<li class="area-mod scope-${mod.scope}" title="${escapeAttr(mod.text)}">
      <span class="scope-dot" aria-hidden="true"></span>
      <span class="area-mod-text">${escapeHtml(mod.text)}</span>
      ${extra ? `<span class="area-mod-src">${escapeHtml(extra)}</span>` : ''}
    </li>`;
}

export function render(resolved) {
  const { layout, ui } = store;
  const i = ui.selectedCell;
  const body = el.querySelector('#area-body');
  const subtitle = el.querySelector('#area-subtitle');

  if (i === null || layout.cells[i].mask === 0) {
    body.hidden = true;
    subtitle.textContent = 'Zaznacz pole na planszy, aby zobaczyć jego modyfikatory.';
  } else {
    const cell = layout.cells[i];
    const info = resolved.perCell[i];
    body.hidden = false;
    subtitle.textContent = `${cellLabel(i)} — ${describeMask(cell.mask)}`;

    const labelInput = el.querySelector('#cell-label');
    if (document.activeElement !== labelInput) labelInput.value = cell.label || '';
    const ilvlInput = el.querySelector('#cell-ilvl');
    if (document.activeElement !== ilvlInput) ilvlInput.value = cell.areaLevel ?? '';

    const implicitBtn = el.querySelector('#cell-implicit');
    implicitBtn.textContent = info.own ? info.own.short : 'Wybierz…';
    implicitBtn.className = `ghost-btn${info.own ? ` has-mod scope-${info.own.scope}` : ''}`;
    implicitBtn.title = info.own ? info.own.text : 'Przypisz implicit do tego chartu';

    const own = info.own
      ? `<p class="area-own scope-${info.own.scope}">
           <strong>Własny implicit:</strong> ${escapeHtml(info.own.text)}
           <em>${info.own.scope === 'voyage' ? '(działa też tutaj)' : '(działa na sąsiadów, nie tutaj)'}</em>
         </p>`
      : '<p class="area-own is-none">Ten chart nie ma przypisanego implicitu.</p>';

    const sections = [];
    if (info.fromNeighbors.length) {
      sections.push(`<h4>Od sąsiadów</h4><ul>${info.fromNeighbors
        .map((e) => modLine(e, cellLabel(e.from)))
        .join('')}</ul>`);
    }
    if (info.fromBorders.length) {
      sections.push(`<h4>Z obrzeża</h4><ul>${info.fromBorders
        .map((e) => modLine(e, e.slot))
        .join('')}</ul>`);
    }
    if (info.voyage.length) {
      sections.push(`<h4>Voyage-wide</h4><ul>${info.voyage
        .map((e) => modLine(e, cellLabel(e.from)))
        .join('')}</ul>`);
    }
    const stacked = info.aggregated.filter((g) => g.count > 1);
    if (stacked.length) {
      sections.push(
        `<h4>Stackuje się</h4><ul>${stacked
          .map(
            (g) =>
              `<li class="area-mod is-stacked" title="${escapeAttr(g.mod.text)}">
                 <span class="stack-count">×${g.count}</span>
                 <span class="area-mod-text">${escapeHtml(g.mod.short)}</span>
                 <span class="area-mod-src">${escapeHtml(formatTotal(g.total))}</span>
               </li>`
          )
          .join('')}</ul>`
      );
    }
    if (sections.length === 0) {
      sections.push('<p class="area-none">Nic nie działa na to pole.</p>');
    }

    const borderSlots = slotsOfCell(i);
    const slotNote = `<p class="area-note">Sloty borderowe przy tym polu: ${
      borderSlots.length ? borderSlots.map((s) => s.id).join(', ') : 'brak (środek planszy)'
    }</p>`;

    el.querySelector('#area-mods').innerHTML = own + sections.join('') + slotNote;
  }

  renderStatus(resolved);
}

function renderStatus(resolved) {
  const status = el.querySelector('#area-status');
  const lvl = computeAreaLevel(store.layout.cells);
  const problems = resolved.validation.problems;

  const levelHtml = lvl
    ? `<div class="status-level">
         <span class="status-level-value">${lvl.level}</span>
         <span class="status-level-label">Area level Voyage</span>
         <span class="status-level-note">
           śr. ${lvl.average.toFixed(1)} + 10${lvl.capped ? `, obcięte do max ${lvl.highest}` : ''}
           · ${lvl.chartCount}/9 chartów z poziomem
         </span>
       </div>`
    : `<div class="status-level is-none">
         <span class="status-level-label">Area level Voyage</span>
         <span class="status-level-note">Uzupełnij area level chartów.</span>
       </div>`;

  const begin = resolved.validation.canBegin;
  const badge = `<p class="status-badge ${begin ? 'ok' : 'bad'}">${
    begin ? '✓ Voyage gotowy do startu' : '✗ Voyage nie wystartuje'
  }</p>`;

  const list = problems.length
    ? `<ul class="status-problems">${problems
        .map((p) => `<li class="sev-${p.severity}">${escapeHtml(p.text)}</li>`)
        .join('')}</ul>`
    : '';

  status.innerHTML = levelHtml + badge + list;
}
