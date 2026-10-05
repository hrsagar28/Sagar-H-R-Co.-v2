// The custom cursor's code is lazy-loaded, but two things must start with the
// page itself (called from index.tsx):
//
// - Where the mouse is. Browsers report it (mouseover) when a page loads or
//   scrolls under a still mouse, often before the cursor's code has arrived,
//   so it is recorded here and the dot can appear without waiting for the
//   mouse to move.
// - A safety net. index.css hides the browser's own cursor from the first
//   paint; if the custom one has not started within a few seconds (its file
//   failed to download), html.cur-native gives the browser's cursor back.

export const pointer = { x: 0, y: 0, known: false };

const record = (event: MouseEvent) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.known = true;
};

export const startCursorEarly = () => {
  document.addEventListener('mouseover', record, { passive: true, capture: true });
  document.addEventListener('mousemove', record, { passive: true, capture: true });
  window.setTimeout(() => {
    if (!document.body.classList.contains('cur-plain-on')) {
      document.documentElement.classList.add('cur-native');
    }
  }, 5000);
};
