// Shared by the cursor options: what the pointer is over decides how the
// cursor looks. Text keeps the system I-beam so selecting and copying work;
// links and buttons get the "can click" look; maps opt out entirely.
export type CursorMode = 'default' | 'link' | 'text' | 'hide';

export const cursorModeFor = (target: EventTarget | null): CursorMode => {
  const el = target instanceof Element ? target : null;
  if (!el) return 'default';
  if (el.closest('[data-hide-cursor="true"]') && !el.closest('[data-show-cursor="true"]')) return 'hide';
  if (el.closest('a, button, [role="button"], summary, label, select, .cursor-pointer')) return 'link';
  if (el.closest('input, textarea, [contenteditable="true"]')) return 'text';
  if (el.closest('p, li, td, th, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, address, figcaption, pre, code')) {
    return 'text';
  }
  return 'default';
};
