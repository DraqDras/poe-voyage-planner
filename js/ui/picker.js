/** Generic modal picker: a title, a grid of options, Esc / backdrop to dismiss. */

let root = null;
let lastFocus = null;

function ensureRoot() {
  if (!root) root = document.getElementById('picker-root');
  return root;
}

export function closePicker() {
  const el = ensureRoot();
  el.innerHTML = '';
  el.hidden = true;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

/**
 * @param {{title: string, hint?: string, columns?: number,
 *          items: Array<{key: string, html: string, label: string, selected?: boolean}>,
 *          onPick: (key: string) => void}} config
 */
export function openPicker({ title, hint, items, columns = 5, onPick }) {
  const el = ensureRoot();
  lastFocus = document.activeElement;
  el.hidden = false;
  el.innerHTML = `
    <div class="picker-backdrop" data-close="1"></div>
    <div class="picker-dialog" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
      <header class="picker-head">
        <h2>${escapeHtml(title)}</h2>
        <button type="button" class="picker-close" data-close="1" aria-label="Zamknij">×</button>
      </header>
      ${hint ? `<p class="picker-hint">${escapeHtml(hint)}</p>` : ''}
      <div class="picker-grid" style="--picker-cols:${columns}">
        ${items
          .map(
            (it) => `
          <button type="button" class="picker-item${it.selected ? ' is-selected' : ''}"
                  data-key="${escapeAttr(it.key)}" title="${escapeAttr(it.label)}">
            ${it.html}
            <span class="picker-label">${escapeHtml(it.label)}</span>
          </button>`
          )
          .join('')}
      </div>
    </div>`;

  el.querySelector('.picker-item')?.focus();

  el.onclick = (ev) => {
    const target = ev.target instanceof Element ? ev.target : null;
    if (!target) return;
    if (target.closest('[data-close]')) {
      closePicker();
      return;
    }
    const item = target.closest('.picker-item');
    if (item) {
      const key = item.getAttribute('data-key');
      closePicker();
      onPick(key);
    }
  };
}

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && root && !root.hidden) {
    ev.preventDefault();
    closePicker();
  }
});

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
