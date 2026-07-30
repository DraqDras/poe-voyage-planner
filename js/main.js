import { store, subscribe, loadLocal, updateUI } from './state.js';
import { resolve } from './core/resolve.js';
import { getMod } from '../data/mods.js';
import * as boardView from './ui/boardView.js';
import * as modPanel from './ui/modPanel.js';
import * as areaPanel from './ui/areaPanel.js';
import * as ioControls from './ui/ioControls.js';
import { escapeHtml } from './ui/picker.js';

const els = {
  toolbar: document.getElementById('toolbar'),
  area: document.getElementById('area-panel'),
  boardHost: document.getElementById('board-host'),
  mods: document.getElementById('mod-panel'),
  armed: document.getElementById('armed-banner'),
  toast: document.getElementById('toast'),
};

ioControls.mount(els.toolbar);
areaPanel.mount(els.area);
boardView.mount(els.boardHost);
modPanel.mount(els.mods);

loadLocal();

function render() {
  const resolved = resolve(store.layout);

  ioControls.render();
  boardView.render(resolved);
  areaPanel.render(resolved);
  modPanel.render();

  renderArmed();
  renderToast();
}

function renderArmed() {
  const id = store.ui.armedMod;
  if (!id) {
    els.armed.hidden = true;
    els.armed.innerHTML = '';
    return;
  }
  const mod = getMod(id);
  els.armed.hidden = false;
  els.armed.innerHTML = `
    <span class="scope-dot scope-${mod.scope}"></span>
    <strong>${escapeHtml(mod.short)}</strong> — kliknij chart, na który ma trafić.
    <button type="button" id="armed-cancel">Anuluj</button>`;
  els.armed.querySelector('#armed-cancel').addEventListener('click', () => {
    updateUI((ui) => {
      ui.armedMod = null;
    });
  });
}

function renderToast() {
  const t = store.ui.toast;
  if (!t) {
    els.toast.hidden = true;
    els.toast.textContent = '';
    return;
  }
  els.toast.hidden = false;
  els.toast.className = `toast toast-${t.kind}`;
  els.toast.textContent = t.message;
}

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && store.ui.armedMod) {
    updateUI((ui) => {
      ui.armedMod = null;
    });
  }
});

subscribe(render);
render();
