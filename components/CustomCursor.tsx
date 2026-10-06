import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cursorModeFor, type CursorMode } from './cursors/cursorMode';
import { pointer } from './cursors/early';

/**
 * The site's cursor: a small white dot, inverted against the page (dark on
 * light sections, light on dark ones), that moves with the pointer with no
 * lag. Over links it opens into a see-through circle, which tightens while
 * the button is held. Over text it narrows into a text cursor. Over maps and
 * the page scrollbar it hides and the browser's cursor shows. Styles in
 * index.css (.cur-dot).
 *
 * It draws every cursor itself, and index.css hides the browser's own from
 * the first paint, because the browser only redraws its cursor when the mouse
 * moves: text scrolling under a still mouse would otherwise leave none.
 *
 * It changes its own classes directly rather than through React state, so a
 * mouse movement costs one style write and no re-render.
 */
const DotCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    document.body.classList.add('cur-on');
    root.classList.remove('cur-native');
    const at = { x: -1, y: -1 };
    let mode: CursorMode = 'default';
    let shown = false;
    let keyboard = false;
    let down = false;
    let frame = 0;
    let timer = 0;

    const paint = () => {
      const next = `cur-dot${shown ? '' : ' off'} ${mode}${down ? ' down' : ''}`;
      if (el.className !== next) el.className = next;
    };
    const modeAt = (target: EventTarget | null): CursorMode =>
      // Over the page's scrollbar the browser always shows its own arrow.
      at.x >= root.clientWidth || at.y >= root.clientHeight ? 'hide' : cursorModeFor(target);
    const place = (x: number, y: number, target: EventTarget | null) => {
      at.x = x;
      at.y = y;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      shown = true;
      mode = modeAt(target);
      paint();
    };
    // What is under the pointer can change while the mouse stays still: the
    // page scrolls, or a click opens another page. Look again at that point.
    const recheck = () => {
      frame = 0;
      if (!shown) return;
      mode = modeAt(document.elementFromPoint(at.x, at.y));
      paint();
    };
    const move = (event: MouseEvent) => {
      // Browsers can report a "move" to the same spot after scrolling or a
      // focus change; ignore it so a dot hidden for keyboard use stays hidden.
      if (keyboard && event.clientX === at.x && event.clientY === at.y) return;
      keyboard = false;
      place(event.clientX, event.clientY, event.target);
    };
    // Sent when the page loads or scrolls under a still mouse.
    const over = (event: MouseEvent) => {
      if (!keyboard) place(event.clientX, event.clientY, event.target);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(recheck);
    };
    const press = (event: MouseEvent) => {
      if (event.button !== 0) return;
      down = true;
      paint();
    };
    const release = () => {
      if (!down) return;
      down = false;
      paint();
      window.clearTimeout(timer);
      timer = window.setTimeout(recheck, 400);
    };
    // Dragging selected text, an image or a link hands the pointer to the
    // system's drag cursor, which a page cannot restyle. Nothing on the site
    // is meant to be dragged, so those drags are off while this cursor runs
    // (an element marked draggable="true" still can be).
    const drag = (event: DragEvent) => {
      const source = event.target;
      if (!(source instanceof HTMLElement && source.getAttribute('draggable') === 'true')) event.preventDefault();
      release();
    };
    const leave = () => {
      shown = false;
      paint();
    };
    // Someone moving through the page with Tab: hide the dot until the mouse
    // moves again, rather than leave it frozen where the mouse last was.
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !shown) return;
      keyboard = true;
      leave();
    };

    // The mouse may already be over the page, reported before this loaded.
    if (pointer.known) place(pointer.x, pointer.y, document.elementFromPoint(pointer.x, pointer.y));

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('scroll', scroll, { passive: true, capture: true });
    root.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);
    window.addEventListener('blur', release);
    window.addEventListener('dragstart', drag);
    window.addEventListener('dragend', release);
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.body.classList.remove('cur-on');
      // Unmounted (reduced motion switched on, or the site crashed): give the
      // browser's cursor back.
      root.classList.add('cur-native');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('scroll', scroll, { capture: true });
      root.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', press);
      window.removeEventListener('mouseup', release);
      window.removeEventListener('blur', release);
      window.removeEventListener('dragstart', drag);
      window.removeEventListener('dragend', release);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return <div ref={ref} className="cur-dot off default" aria-hidden="true" />;
};

/** Only for a mouse or trackpad; phones and tablets keep their own behaviour. */
const useFinePointer = () => {
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches);
  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)');
    const change = (event: MediaQueryListEvent) => setFine(event.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return fine;
};

const CustomCursor: React.FC = () => {
  const fine = useFinePointer();
  const reducedMotion = useReducedMotion();
  // The same conditions as the rule in index.css that hides the browser's
  // cursor: a mouse or trackpad, motion allowed.
  if (!fine || reducedMotion) return null;
  return <DotCursor />;
};

export default CustomCursor;
