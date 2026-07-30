/** Right-hand panel: the implicit library, drag source for the board. */

import { store, updateUI } from '../state.js';
import { CHART_IMPLICITS, CATEGORIES, CATEGORY_ORDER } from '../../data/mods.js';
import { CELLS } from '../core/board.js';
import { setDragMod, setHighlight, clearHighlight } from './boardView.js';
import { escapeHtml, escapeAttr } from './picker.js';

let panelEl = null;

export function mount(container) {
  panelEl = container;
  panelEl.innerHTML = `
    <div class="panel-head">
      <h2>Implicity chartów</h2>
      <p class="panel-sub">Przeciągnij na chart w siatce — albo kliknij mod, potem pole.</p>
    </div>
    <div class="mod-controls">
      <input type="search" id="mod-search" class="mod-search" placeholder="Szukaj: strongbox, essence, rarity…"
             aria-label="Szukaj modyfikatorów" autocomplete="off">
      <div class="scope-tabs" role="tablist" aria-label="Zakres modyfikatora">
        <button type="button" data-scope="all" role="tab">Wszystkie</button>
        <button type="button" data-scope="adjacent" role="tab">Adjacent</button>
        <button type="button" data-scope="voyage" role="tab">Voyage</button>
      </div>
    </div>
    <div class="mod-list" id="mod-list"></div>`;

  panelEl.querySelector('#mod-search').addEventListener('input', (ev) => {
    updateUI((ui) => {
      ui.search = ev.target.value;
    });
  });

  panelEl.querySelectorAll('.scope-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateUI((ui) => {
        ui.scopeFilter = btn.dataset.scope;
      });
    });
  });

  const list = panelEl.querySelector('#mod-list');

  list.addEventListener('dragstart', (ev) => {
    const item = ev.target.closest('.mod-item');
    if (!item) return;
    const id = item.dataset.modId;
    setDragMod(id);
    ev.dataTransfer.effectAllowed = 'copy';
    ev.dataTransfer.setData('text/x-voyage-mod', id);
    ev.dataTransfer.setData('text/plain', item.dataset.modText || id);
    item.classList.add('is-dragging');
  });

  list.addEventListener('dragend', (ev) => {
    setDragMod(null);
    clearHighlight();
    ev.target.closest('.mod-item')?.classList.remove('is-dragging');
  });

  list.addEventListener('click', (ev) => {
    const item = ev.target.closest('.mod-item');
    if (!item) return;
    const id = item.dataset.modId;
    updateUI((ui) => {
      ui.armedMod = ui.armedMod === id ? null : id;
    });
  });

  list.addEventListener('mouseover', (ev) => {
    const item = ev.target.closest('.mod-item');
    if (!item) return;
    // Adjacent mods have no meaningful preview until they sit on a cell.
    if (item.dataset.scope === 'voyage') setHighlight(CELLS);
  });
  list.addEventListener('mouseout', (ev) => {
    if (ev.target.closest('.mod-item')) clearHighlight();
  });
}

function matches(mod, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    mod.text.toLowerCase().includes(q) ||
    mod.short.toLowerCase().includes(q) ||
    mod.id.toLowerCase().includes(q) ||
    (CATEGORIES[mod.category] || '').toLowerCase().includes(q)
  );
}

let lastListKey = null;

export function render() {
  const { ui } = store;
  const list = panelEl.querySelector('#mod-list');

  panelEl.querySelectorAll('.scope-tabs button').forEach((btn) => {
    const active = btn.dataset.scope === ui.scopeFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  const search = panelEl.querySelector('#mod-search');
  if (search.value !== ui.search) search.value = ui.search;

  // The list only depends on the filters; rebuilding it on unrelated board edits would
  // reset the scroll position mid-browse.
  const listKey = `${ui.scopeFilter}|${ui.search}`;
  if (listKey === lastListKey) {
    list.querySelectorAll('.mod-item').forEach((item) => {
      item.classList.toggle('is-armed', item.dataset.modId === ui.armedMod);
    });
    return;
  }
  lastListKey = listKey;

  const visible = CHART_IMPLICITS.filter(
    (m) => (ui.scopeFilter === 'all' || m.scope === ui.scopeFilter) && matches(m, ui.search)
  );

  if (visible.length === 0) {
    list.innerHTML = '<p class="mod-empty">Brak modyfikatorów dla tego filtra.</p>';
    return;
  }

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    name: CATEGORIES[cat],
    mods: visible.filter((m) => m.category === cat),
  })).filter((g) => g.mods.length > 0);

  list.innerHTML = groups
    .map(
      (g) => `
      <section class="mod-group">
        <h3>${escapeHtml(g.name)} <span class="mod-count">${g.mods.length}</span></h3>
        ${g.mods
          .map(
            (m) => `
          <div class="mod-item scope-${m.scope}${ui.armedMod === m.id ? ' is-armed' : ''}"
               draggable="true" data-mod-id="${escapeAttr(m.id)}" data-scope="${m.scope}"
               data-mod-text="${escapeAttr(m.text)}" title="${escapeAttr(m.text)}">
            <span class="scope-dot" aria-hidden="true"></span>
            <span class="mod-short">${escapeHtml(m.short)}</span>
            <span class="mod-ilvl">i${m.ilvl}</span>
            <span class="mod-text">${escapeHtml(m.text)}</span>
          </div>`
          )
          .join('')}
      </section>`
    )
    .join('');
}
