// What the pointer is over decides how the cursor looks (CustomCursor.tsx):
// links and buttons get the see-through circle, text gets the text cursor,
// maps (data-hide-cursor) keep the browser's own, anything else the dot.
export type CursorMode = 'default' | 'link' | 'text' | 'hide';

export const cursorModeFor = (target: EventTarget | null): CursorMode => {
  const el = target instanceof Element ? target : null;
  if (!el) return 'default';
  if (el.closest('[data-hide-cursor="true"]') && !el.closest('[data-show-cursor="true"]')) return 'hide';
  // A control that cannot be used right now (a Send button while sending)
  // does not get the "can click" look.
  const control = el.closest('a, button, [role="button"], summary, label, select, .cursor-pointer');
  if (control) return control.matches(':disabled, [aria-disabled="true"]') ? 'default' : 'link';
  if (el.closest('input, textarea, [contenteditable="true"]')) return 'text';
  if (el.closest('p, li, td, th, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, address, figcaption, pre, code')) {
    return 'text';
  }
  return 'default';
};
