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
export function openPicker({ title, hint, items, columns = 5, searchable = false, onPick }) {
  const el = ensureRoot();
  lastFocus = document.activeElement;
  el.hidden = false;

  const itemHtml = (it) => `
    <button type="button" class="picker-item${it.selected ? ' is-selected' : ''}"
            data-key="${escapeAttr(it.key)}" data-search="${escapeAttr(
              `${it.label} ${it.group || ''} ${it.key}`.toLowerCase()
            )}" title="${escapeAttr(it.label)}">
      ${it.html}
      <span class="picker-label">${escapeHtml(it.label)}</span>
    </button>`;

  // Items carrying a `group` are rendered under headings; a mixed list would be ambiguous,
  // so grouping kicks in only when every item declares one.
  const grouped = items.length > 0 && items.every((it) => it.group);
  let body;
  if (grouped) {
    const order = [];
    const buckets = new Map();
    for (const it of items) {
      if (!buckets.has(it.group)) {
        buckets.set(it.group, []);
        order.push(it.group);
      }
      buckets.get(it.group).push(it);
    }
    body = order
      .map(
        (g) => `<section class="picker-group">
            <h3>${escapeHtml(g)}</h3>
            <div class="picker-grid" style="--picker-cols:${columns}">${buckets
              .get(g)
              .map(itemHtml)
              .join('')}</div>
          </section>`
      )
      .join('');
  } else {
    body = `<div class="picker-grid" style="--picker-cols:${columns}">${items.map(itemHtml).join('')}</div>`;
  }

  el.innerHTML = `
    <div class="picker-backdrop" data-close="1"></div>
    <div class="picker-dialog" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
      <header class="picker-head">
        <h2>${escapeHtml(title)}</h2>
        <button type="button" class="picker-close" data-close="1" aria-label="Zamknij">×</button>
      </header>
      ${hint ? `<p class="picker-hint">${escapeHtml(hint)}</p>` : ''}
      ${
        searchable
          ? `<input type="search" class="picker-search" placeholder="Szukaj… (${items.length} pozycji)"
                    aria-label="Szukaj w liście" autocomplete="off">
             <p class="picker-empty-msg" hidden>Nic nie pasuje do wyszukiwania.</p>`
          : ''
      }
      <div class="picker-body">${body}</div>
    </div>`;

  const search = el.querySelector('.picker-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      for (const item of el.querySelectorAll('.picker-item')) {
        const match = !q || item.dataset.search.includes(q);
        item.hidden = !match;
        if (match) visible++;
      }
      // Hide a group heading once all of its items are filtered out.
      for (const group of el.querySelectorAll('.picker-group')) {
        group.hidden = ![...group.querySelectorAll('.picker-item')].some((i) => !i.hidden);
      }
      el.querySelector('.picker-empty-msg').hidden = visible > 0;
    });
    search.focus();
  } else {
    el.querySelector('.picker-item')?.focus();
  }

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

/**
 * In-app confirmation. Native `confirm()` is unreliable - embedded/preview browser contexts
 * return false without ever showing a dialog, which silently swallows the action.
 */
export function confirmDialog({ title, hint, confirmLabel = 'Tak', cancelLabel = 'Anuluj', onConfirm }) {
  openPicker({
    title,
    hint,
    columns: 2,
    items: [
      { key: 'cancel', html: '<span class="picker-choice">✕</span>', label: cancelLabel },
      { key: 'confirm', html: '<span class="picker-choice is-danger">✓</span>', label: confirmLabel },
    ],
    onPick: (key) => {
      if (key === 'confirm') onConfirm();
    },
  });
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
