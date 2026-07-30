/** Toolbar: layout name, view switch, settings, JSON save/load, clear. */

import { store, update, updateUI, replaceLayout, toast, clearLocal } from '../state.js';
import { createEmptyState, toJSON, fromJSON, suggestFilename, LayoutError } from '../core/serialize.js';

let el = null;

export function mount(container) {
  el = container;
  el.innerHTML = `
    <input id="layout-name" class="layout-name" type="text" placeholder="Nazwa layoutu"
           aria-label="Nazwa layoutu" maxlength="60" autocomplete="off">

    <div class="view-tabs" role="tablist" aria-label="Widok">
      <button type="button" data-view="board" role="tab">Plansza</button>
      <button type="button" data-view="summary" role="tab">Podsumowanie</button>
    </div>

    <div class="toolbar-settings">
      <label class="check" title="Czy 'adjacent' to wszyscy czterej sąsiedzi, czy tylko połączeni przejściem.">
        <input type="checkbox" id="opt-connected"> tylko połączeni sąsiedzi
      </label>
      <label class="check" title="Czy wyjście ścieżki poza planszę ma blokować start Voyage.">
        <input type="checkbox" id="opt-open-edges"> wyjścia poza planszę = błąd
      </label>
    </div>

    <div class="toolbar-actions">
      <button type="button" id="btn-save" class="primary-btn">Zapisz JSON</button>
      <button type="button" id="btn-load" class="ghost-btn">Wczytaj JSON</button>
      <button type="button" id="btn-clear" class="ghost-btn danger">Wyczyść</button>
      <input type="file" id="file-input" accept="application/json,.json" hidden>
    </div>`;

  el.querySelector('#layout-name').addEventListener('input', (ev) => {
    update((layout) => {
      layout.name = ev.target.value;
    });
  });

  el.querySelectorAll('.view-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateUI((ui) => {
        ui.view = btn.dataset.view;
      });
    });
  });

  el.querySelector('#opt-connected').addEventListener('change', (ev) => {
    update((layout) => {
      layout.settings.adjacency = ev.target.checked ? 'connected' : 'orthogonal';
    });
  });

  el.querySelector('#opt-open-edges').addEventListener('change', (ev) => {
    update((layout) => {
      layout.settings.openEdgesAllowed = !ev.target.checked;
    });
  });

  el.querySelector('#btn-save').addEventListener('click', saveToFile);
  el.querySelector('#btn-load').addEventListener('click', () => el.querySelector('#file-input').click());
  el.querySelector('#file-input').addEventListener('change', (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (file) readFile(file);
  });

  el.querySelector('#btn-clear').addEventListener('click', () => {
    const hasContent =
      store.layout.cells.some((c) => c.mask !== 0) || store.layout.borders.some((b) => b.modId);
    if (hasContent && !confirm('Wyczyścić całą planszę? Tej operacji nie da się cofnąć.')) return;
    clearLocal();
    replaceLayout(createEmptyState());
    toast('Plansza wyczyszczona.');
  });

  // Dropping a .json anywhere on the page loads it.
  document.addEventListener('dragover', (ev) => {
    if (ev.dataTransfer?.types.includes('Files')) ev.preventDefault();
  });
  document.addEventListener('drop', (ev) => {
    const file = ev.dataTransfer?.files?.[0];
    if (!file) return;
    if (!/\.json$/i.test(file.name)) return;
    ev.preventDefault();
    readFile(file);
  });
}

function saveToFile() {
  const data = toJSON(store.layout);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestFilename(store.layout);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Zapisano ${a.download}`, 'ok');
}

async function readFile(file) {
  try {
    const text = await file.text();
    const { state, warnings } = fromJSON(text);
    replaceLayout(state);
    if (warnings.length) {
      toast(`Wczytano z zastrzeżeniami: ${warnings[0]}`, 'warn');
      console.warn('[voyage-planner] ostrzeżenia przy wczytywaniu:', warnings);
    } else {
      toast(`Wczytano ${file.name}`, 'ok');
    }
  } catch (err) {
    const message = err instanceof LayoutError ? err.message : `Nie udało się wczytać pliku: ${err.message}`;
    toast(message, 'bad');
  }
}

export function render() {
  const { layout, ui } = store;

  const nameInput = el.querySelector('#layout-name');
  if (document.activeElement !== nameInput && nameInput.value !== layout.name) {
    nameInput.value = layout.name || '';
  }

  el.querySelectorAll('.view-tabs button').forEach((btn) => {
    const active = btn.dataset.view === ui.view;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  el.querySelector('#opt-connected').checked = layout.settings.adjacency === 'connected';
  el.querySelector('#opt-open-edges').checked = layout.settings.openEdgesAllowed === false;
}
