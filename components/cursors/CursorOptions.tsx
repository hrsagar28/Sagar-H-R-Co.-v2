import React, { useEffect, useRef, useState } from 'react';
import { cursorModeFor, type CursorMode } from './cursorMode';

// The alternative cursors offered for review. Styles in index.css (.cur-*).

/**
 * Copper dot: replaces the arrow with a small copper dot that moves with the
 * pointer, no lag. Over links it opens into a copper ring; over text the
 * normal I-beam returns so text can be selected.
 */
export const DotCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>('default');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    document.body.classList.add('cur-dot-on');
    const move = (event: MouseEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      setShown(true);
      setMode(cursorModeFor(event.target));
    };
    const leave = () => setShown(false);
    document.addEventListener('mousemove', move);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      document.body.classList.remove('cur-dot-on');
      document.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  return <div ref={ref} className={`cur-dot ${shown ? '' : 'off'} ${mode}`} aria-hidden="true" />;
};

/**
 * Plain dot: the current cursor's colour (white, inverted against the page),
 * with no trailing ring. It moves with the pointer, no lag. Over links it
 * opens into a see-through circle, which tightens while the button is held.
 * Over text it narrows into a text cursor; over maps the dot hides and the
 * normal cursor returns.
 *
 * It draws the text cursor itself rather than handing over to the browser's,
 * because the browser only redraws its own cursor when the mouse moves: text
 * scrolling under a still mouse would otherwise leave no cursor at all.
 *
 * It changes its own classes directly rather than through React state, so a
 * mouse movement costs one style write and no re-render.
 */
export const PlainDotCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    document.body.classList.add('cur-plain-on');
    const at = { x: -1, y: -1 };
    let mode: CursorMode = 'default';
    let shown = false;
    let down = false;
    let frame = 0;
    let timer = 0;

    const paint = () => {
      const next = `cur-dot plain${shown ? '' : ' off'} ${mode}${down ? ' down' : ''}`;
      if (el.className !== next) el.className = next;
    };
    // What is under the pointer can change while the mouse stays still: the
    // page scrolls, or a click opens another page. Look again at that point.
    const recheck = () => {
      frame = 0;
      if (!shown) return;
      mode = cursorModeFor(document.elementFromPoint(at.x, at.y));
      paint();
    };
    const move = (event: MouseEvent) => {
      // Browsers can report a "move" to the same spot after scrolling or a
      // focus change; ignore it so a dot hidden for keyboard use stays hidden.
      if (!shown && event.clientX === at.x && event.clientY === at.y) return;
      at.x = event.clientX;
      at.y = event.clientY;
      el.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      shown = true;
      mode = cursorModeFor(event.target);
      paint();
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
    const leave = () => {
      shown = false;
      paint();
    };
    // Someone moving through the page with Tab: hide the dot until the mouse
    // moves again, rather than leave it frozen where the mouse last was.
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && shown) leave();
    };

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('scroll', scroll, { passive: true, capture: true });
    document.documentElement.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);
    window.addEventListener('blur', release);
    // Pressing on a link and dragging starts the browser's own link drag,
    // which ends without a mouseup.
    window.addEventListener('dragstart', release);
    window.addEventListener('dragend', release);
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.body.classList.remove('cur-plain-on');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('scroll', scroll, { capture: true });
      document.documentElement.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', press);
      window.removeEventListener('mouseup', release);
      window.removeEventListener('blur', release);
      window.removeEventListener('dragstart', release);
      window.removeEventListener('dragend', release);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return <div ref={ref} className="cur-dot plain off default" aria-hidden="true" />;
};

/**
 * Copper ring: the normal arrow stays; a thin copper ring follows it closely
 * and fills lightly over links. It fades away over text.
 */
export const RingCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>('default');
  const [shown, setShown] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const target = { x: -100, y: -100 };
    const at = { x: -100, y: -100 };
    let raf = 0;
    const step = () => {
      at.x += (target.x - at.x) * 0.35;
      at.y += (target.y - at.y) * 0.35;
      if (ref.current) ref.current.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
      // Stop the loop once the ring has caught up, so nothing runs while idle.
      raf = Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > 0.3 ? requestAnimationFrame(step) : 0;
    };
    const move = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (at.x < -50) {
        at.x = target.x;
        at.y = target.y;
      }
      if (!raf) raf = requestAnimationFrame(step);
      setShown(true);
      setMode(cursorModeFor(event.target));
    };
    const leave = () => setShown(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    document.addEventListener('mousemove', move);
    document.documentElement.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', press);
      window.removeEventListener('mouseup', release);
    };
  }, []);

  return (
    <div ref={ref} className={`cur-ring ${shown ? '' : 'off'} ${mode} ${down ? 'down' : ''}`} aria-hidden="true">
      <i />
    </div>
  );
};

/**
 * Link glow: the normal arrow throughout. Only over a link or button does a
 * soft copper glow appear under the pointer.
 */
export const GlowCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      setOn(cursorModeFor(event.target) === 'link');
    };
    const leave = () => setOn(false);
    document.addEventListener('mousemove', move);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      document.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  return <div ref={ref} className={`cur-glow ${on ? 'on' : ''}`} aria-hidden="true" />;
};

/**
 * Brand arrow: no script at all. The arrow itself is redrawn in the site's
 * colours (dark with a cream edge), and turns copper over links. Text keeps
 * the normal I-beam.
 */
export const ArrowCursor: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('cur-arrow-on');
    return () => document.documentElement.classList.remove('cur-arrow-on');
  }, []);
  return null;
};
