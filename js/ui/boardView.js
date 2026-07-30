/** The 3x3 board plus the 12 border segments around it. */

import { store, update, updateUI, toast } from '../state.js';
import { CELLS, cellLabel, rowOf, colOf } from '../core/board.js';
import { BORDER_SLOTS } from '../core/borders.js';
import { SHAPE_ORDER, SHAPES, orientationsOf, rotate, describeMask } from '../core/shapes.js';
import { edgeStatusByCell } from '../core/validate.js';
import { influenceOf } from '../core/resolve.js';
import { getMod, BORDER_MODS } from '../../data/mods.js';
import { tileSvg } from './tile.js';
import { openPicker, escapeHtml, escapeAttr } from './picker.js';

let boardEl = null;
const cellNodes = new Map();
const slotNodes = new Map();

export function mount(container) {
  boardEl = document.createElement('div');
  boardEl.className = 'board';
  boardEl.id = 'board';

  for (const slot of BORDER_SLOTS) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `bslot bslot-${slot.side}`;
    node.dataset.slot = slot.id;
    node.style.gridArea = slotGridArea(slot);
    node.addEventListener('click', () => openBorderPicker(slot.id));
    node.addEventListener('mouseenter', () => setHighlight([slot.cell]));
    node.addEventListener('mouseleave', clearHighlight);
    boardEl.appendChild(node);
    slotNodes.set(slot.id, node);
  }

  for (const i of CELLS) {
    const node = document.createElement('div');
    node.className = 'cell';
    node.dataset.cell = String(i);
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.style.gridArea = `${rowOf(i) + 2} / ${colOf(i) + 2}`;
    wireCell(node, i);
    boardEl.appendChild(node);
    cellNodes.set(i, node);
  }

  container.appendChild(boardEl);
}

function slotGridArea(slot) {
  switch (slot.side) {
    case 'N': return `1 / ${slot.index + 2}`;
    case 'S': return `5 / ${slot.index + 2}`;
    case 'W': return `${slot.index + 2} / 1`;
    default: return `${slot.index + 2} / 5`;
  }
}

/* ------------------------------------------------------------------ interactions */

function wireCell(node, i) {
  node.addEventListener('click', () => {
    const cell = store.layout.cells[i];
    const armed = store.ui.armedMod;
    if (armed) {
      if (cell.mask === 0) {
        toast('Najpierw postaw chart na tym polu.', 'warn');
        return;
      }
      assignImplicit(i, armed);
      updateUI((ui) => {
        ui.armedMod = null;
      });
      return;
    }
    if (cell.mask === 0) {
      openShapePicker(i);
      return;
    }
    updateUI((ui) => {
      ui.selectedCell = ui.selectedCell === i ? null : i;
    });
  });

  node.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    const cell = store.layout.cells[i];
    if (cell.mask === 0) {
      openShapePicker(i);
      return;
    }
    rotateCell(i, ev.shiftKey ? -1 : 1);
  });

  node.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      node.click();
      return;
    }
    onCellKey(ev, i);
  });

  node.addEventListener('mouseenter', () => {
    const cell = store.layout.cells[i];
    if (!cell.implicit) return;
    setHighlight(influenceOf(i, getMod(cell.implicit), store.layout.cells, store.layout.settings));
  });
  node.addEventListener('mouseleave', clearHighlight);

  node.addEventListener('dragover', (ev) => {
    const modId = currentDragMod();
    if (!modId) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = store.layout.cells[i].mask === 0 ? 'none' : 'copy';
    node.classList.add('is-droptarget');
    if (store.layout.cells[i].mask !== 0) {
      setHighlight(influenceOf(i, getMod(modId), store.layout.cells, store.layout.settings));
    }
  });
  node.addEventListener('dragleave', () => {
    node.classList.remove('is-droptarget');
  });
  node.addEventListener('drop', (ev) => {
    ev.preventDefault();
    node.classList.remove('is-droptarget');
    clearHighlight();
    const modId = ev.dataTransfer.getData('text/x-voyage-mod') || currentDragMod();
    if (!modId) return;
    if (store.layout.cells[i].mask === 0) {
      toast('Najpierw postaw chart na tym polu.', 'warn');
      return;
    }
    assignImplicit(i, modId);
  });
}

let dragModId = null;
export function setDragMod(id) {
  dragModId = id;
}
function currentDragMod() {
  return dragModId;
}

function onCellKey(ev, i) {
  const cell = store.layout.cells[i];
  const key = ev.key;

  if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
    const dr = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0;
    const dc = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
    const r = rowOf(i) + dr;
    const c = colOf(i) + dc;
    if (r >= 0 && r < 3 && c >= 0 && c < 3) {
      ev.preventDefault();
      cellNodes.get(r * 3 + c)?.focus();
    }
    return;
  }
  if (key === 'r' || key === 'R') {
    if (cell.mask === 0) return;
    ev.preventDefault();
    rotateCell(i, ev.shiftKey ? -1 : 1);
    return;
  }
  if (key === 'Delete' || key === 'Backspace') {
    if (cell.mask === 0) return;
    ev.preventDefault();
    update((layout) => {
      layout.cells[i] = { i, mask: 0, label: '', areaLevel: null, implicit: null };
    });
    return;
  }
  if (key >= '1' && key <= '5') {
    ev.preventDefault();
    const shapeId = SHAPE_ORDER[Number(key) - 1];
    setMask(i, orientationsOf(shapeId)[0]);
  }
}

export function rotateCell(i, steps) {
  update((layout) => {
    layout.cells[i].mask = rotate(layout.cells[i].mask, steps);
  });
}

export function setMask(i, mask) {
  update((layout) => {
    const cell = layout.cells[i];
    cell.mask = mask;
    if (mask === 0) {
      cell.implicit = null;
      cell.label = '';
      cell.areaLevel = null;
    }
  });
  updateUI((ui) => {
    ui.selectedCell = mask === 0 ? null : i;
  });
}

export function assignImplicit(i, modId) {
  update((layout) => {
    layout.cells[i].implicit = modId || null;
  });
  updateUI((ui) => {
    ui.selectedCell = i;
  });
}

/* ------------------------------------------------------------------ pickers */

export function openShapePicker(i) {
  const current = store.layout.cells[i].mask;
  const items = SHAPE_ORDER.flatMap((shapeId) =>
    orientationsOf(shapeId).map((mask) => ({
      key: String(mask),
      html: tileSvg(mask, { className: 'picker-tile' }),
      label: describeMask(mask),
      selected: mask === current,
    }))
  );
  items.push({ key: '0', html: '<span class="picker-empty">∅</span>', label: 'Usuń chart' });

  openPicker({
    title: `Wybierz kształt chartu — pole ${cellLabel(i)}`,
    hint: 'Wszystkie 15 orientacji. Na planszy: PPM obraca o 90°, Shift+PPM w drugą stronę.',
    columns: 5,
    items,
    onPick: (key) => setMask(i, Number(key)),
  });
}

export function openBorderPicker(slotId) {
  const slot = BORDER_SLOTS.find((s) => s.id === slotId);
  const current = store.layout.borders.find((b) => b.slot === slotId)?.modId || null;
  const items = [
    { key: '', html: '<span class="picker-empty">∅</span>', label: 'Brak', selected: !current },
    ...BORDER_MODS.map((m) => ({
      key: m.id,
      html: `<span class="picker-mod">${escapeHtml(m.short)}</span>`,
      label: m.text,
      selected: m.id === current,
    })),
  ];
  openPicker({
    title: `Border — ${slot.name}`,
    hint: 'Border mody są w grze losowe. Wybierz ten, który wypadł u Ciebie.',
    columns: 2,
    items,
    onPick: (key) => {
      update((layout) => {
        const entry = layout.borders.find((b) => b.slot === slotId);
        entry.modId = key || null;
      });
    },
  });
}

/* ------------------------------------------------------------------ highlight */

export function setHighlight(indices) {
  const set = new Set(indices);
  for (const [i, node] of cellNodes) node.classList.toggle('is-affected', set.has(i));
}

export function clearHighlight() {
  for (const node of cellNodes.values()) node.classList.remove('is-affected');
}

/* ------------------------------------------------------------------ render */

/**
 * Everything that shows up inside a chart: its own implicit first, then what it inherits.
 * Border mods are deliberately left out - they live on the perimeter slots, and repeating them
 * inside the tile would triple the clutter on corner cells.
 */
function cellModRows(i, info) {
  const rows = [];
  if (info.own) {
    rows.push({ mod: info.own, kind: 'own', from: null });
  }
  for (const e of info.fromNeighbors) {
    rows.push({ mod: e.mod, kind: 'inherited', from: e.from });
  }
  for (const e of info.voyage) {
    // The chart's own voyage implicit is already listed as "own".
    if (e.from === i) continue;
    rows.push({ mod: e.mod, kind: 'inherited', from: e.from });
  }
  return rows;
}

/** Polish plural: 1 modyfikator, 2-4 modyfikatory, 5+ modyfikatorów. */
function pluralMods(n) {
  const tens = n % 100;
  const ones = n % 10;
  if (n === 1) return 'modyfikator';
  if (ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)) return 'modyfikatory';
  return 'modyfikatorów';
}

function modRowHtml(row) {
  const { mod, kind, from } = row;
  const title = kind === 'own' ? mod.text : `${mod.text}\n(dziedziczone z ${cellLabel(from)})`;
  return `<span class="cell-mod is-${kind} scope-${mod.scope}" title="${escapeAttr(title)}">
      <span class="scope-dot" aria-hidden="true"></span>
      <span class="cell-mod-text">${escapeHtml(mod.short)}</span>
      ${from !== null ? `<span class="cell-mod-from">${cellLabel(from)}</span>` : ''}
    </span>`;
}

export function render(resolved) {
  const { layout, ui } = store;
  const statuses = edgeStatusByCell(resolved.validation);

  for (const i of CELLS) {
    const cell = layout.cells[i];
    const node = cellNodes.get(i);
    const mod = cell.implicit ? getMod(cell.implicit) : null;
    const placed = cell.mask !== 0;
    const rows = placed ? cellModRows(i, resolved.perCell[i]) : [];

    node.classList.toggle('is-empty', !placed);
    node.classList.toggle('is-selected', ui.selectedCell === i);
    node.classList.toggle('has-voyage-mod', !!mod && mod.scope === 'voyage');

    const inheritedCount = rows.filter((r) => r.kind === 'inherited').length;
    const aria = placed
      ? `Pole ${cellLabel(i)}, ${describeMask(cell.mask)}` +
        `${mod ? `, własny mod: ${mod.short}` : ''}` +
        `${inheritedCount ? `, dziedziczy ${inheritedCount} ${pluralMods(inheritedCount)}` : ''}`
      : `Pole ${cellLabel(i)}, puste. Enter aby wybrać kształt.`;
    node.setAttribute('aria-label', aria);
    node.title = placed
      ? `${cellLabel(i)} — ${describeMask(cell.mask)}\nPPM: obrót • Del: usuń`
      : `${cellLabel(i)} — puste\nKliknij, aby wybrać kształt`;

    node.innerHTML = placed
      ? `${tileSvg(cell.mask, { statuses: statuses.get(i), showMarkers: true })}
         <span class="cell-tag">${cellLabel(i)}</span>
         ${cell.label ? `<span class="cell-name">${escapeHtml(cell.label)}</span>` : ''}
         ${cell.areaLevel ? `<span class="cell-ilvl">L:${cell.areaLevel}</span>` : ''}
         ${rows.length ? `<div class="cell-mods">${rows.map(modRowHtml).join('')}</div>` : ''}`
      : `<span class="cell-tag">${cellLabel(i)}</span>
         <span class="cell-plus">+</span>
         <span class="cell-hint">${escapeHtml(SHAPES.EMPTY.name)}</span>`;
  }

  for (const slot of BORDER_SLOTS) {
    const node = slotNodes.get(slot.id);
    const modId = layout.borders.find((b) => b.slot === slot.id)?.modId;
    const mod = modId ? getMod(modId) : null;
    node.classList.toggle('is-set', !!mod);
    node.textContent = mod ? mod.short : '+';
    node.title = mod ? `${slot.name}\n${mod.text}` : `${slot.name} — kliknij, aby wybrać border mod`;
    node.setAttribute('aria-label', node.title);
  }
}
