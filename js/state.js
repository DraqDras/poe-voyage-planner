/** Tiny pub/sub store. One layout, one UI slice, one notify. */

import { createEmptyState, toJSON, fromJSON } from './core/serialize.js';

const STORAGE_KEY = 'poe-voyage-planner:autosave';

const listeners = new Set();

export const store = {
  layout: createEmptyState(),
  ui: {
    selectedCell: null,      // index 0..8
    pickerCell: null,        // cell whose shape picker is open
    borderSlot: null,        // slot whose mod picker is open
    armedMod: null,          // mod id armed by click (click-to-place fallback for drag & drop)
    highlight: null,         // { cells: number[], source?: number }
    search: '',
    scopeFilter: 'all',      // 'all' | 'adjacent' | 'voyage'
    toast: null,
  },
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  for (const fn of listeners) fn(store);
}

/** Applies a mutation to the layout, autosaves and re-renders. */
export function update(mutator) {
  mutator(store.layout);
  saveLocal();
  notify();
}

/** Applies a mutation to the UI slice and re-renders (never autosaved). */
export function updateUI(mutator) {
  mutator(store.ui);
  notify();
}

export function replaceLayout(layout) {
  store.layout = layout;
  store.ui.selectedCell = null;
  store.ui.pickerCell = null;
  store.ui.borderSlot = null;
  store.ui.armedMod = null;
  store.ui.highlight = null;
  saveLocal();
  notify();
}

export function toast(message, kind = 'info') {
  store.ui.toast = { message, kind, at: Date.now() };
  notify();
  const stamp = store.ui.toast.at;
  setTimeout(() => {
    if (store.ui.toast?.at === stamp) {
      store.ui.toast = null;
      notify();
    }
  }, 4000);
}

export function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toJSON(store.layout)));
  } catch {
    /* private mode / quota - autosave is a nicety, never a hard failure */
  }
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { state } = fromJSON(raw);
    store.layout = state;
    // Write the migrated shape straight back, so the stored copy stops being a legacy one.
    saveLocal();
    return true;
  } catch {
    return false;
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
