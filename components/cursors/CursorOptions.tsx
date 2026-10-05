import React, { useEffect, useRef, useState } from 'react';
import { cursorModeFor, type CursorMode } from './cursorMode';

// The alternative cursors offered for review. Styles in index.css (.cur-*).

/**
 * Copper dot: replaces the arrow with a small copper dot that moves with the
 * pointer, no lag. Over links it opens into a copper ring; over text the
 * normal I-beam returns so text can be selected.
 *
 * Plain dot (tone="plain"): the same, in the current cursor's colour (white,
 * inverted against whatever is underneath), with no trailing ring. Over links
 * the dot itself grows into a solid inverting disc.
 */
export const DotCursor: React.FC<{ tone?: 'copper' | 'plain' }> = ({ tone = 'copper' }) => {
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

  return (
    <div
      ref={ref}
      className={`cur-dot ${tone === 'plain' ? 'plain' : ''} ${shown ? '' : 'off'} ${mode}`}
      aria-hidden="true"
    />
  );
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
