import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import CurrentCursor from './cursors/CurrentCursor';
import { ArrowCursor, DotCursor, GlowCursor, RingCursor } from './cursors/CursorOptions';

// PREVIEW ONLY (cursor choice): the deploy preview can switch between the
// current cursor and four alternatives (CursorSwitcher). Once one is chosen,
// the others and this switching are deleted.
export type CursorVariant = 'current' | 'dot' | 'ring' | 'glow' | 'arrow';

export const CURSOR_VARIANTS: { id: CursorVariant; label: string }[] = [
  { id: 'current', label: 'Current' },
  { id: 'dot', label: 'Copper dot' },
  { id: 'ring', label: 'Copper ring' },
  { id: 'glow', label: 'Link glow' },
  { id: 'arrow', label: 'Brand arrow' },
];

const DEFAULT_VARIANT: CursorVariant = 'current';
const KEY = 'cursor-variant';
const EVENT = 'cursor-variant';

const readVariant = (): CursorVariant => {
  try {
    const value = sessionStorage.getItem(KEY) as CursorVariant | null;
    return value && CURSOR_VARIANTS.some((v) => v.id === value) ? value : DEFAULT_VARIANT;
  } catch {
    return DEFAULT_VARIANT;
  }
};

export const setCursorVariant = (variant: CursorVariant) => {
  try {
    sessionStorage.setItem(KEY, variant);
  } catch {
    // Private mode: the choice lasts until reload.
  }
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
};

export const useCursorVariant = () => useSyncExternalStore(subscribe, readVariant, () => DEFAULT_VARIANT);

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
  const variant = useCursorVariant();
  const fine = useFinePointer();
  const reducedMotion = useReducedMotion();

  if (!fine) return null;
  if (variant === 'arrow') return <ArrowCursor />;
  // The moving cursors respect "reduce motion"; the system cursor stays.
  if (reducedMotion) return null;
  if (variant === 'dot') return <DotCursor />;
  if (variant === 'ring') return <RingCursor />;
  if (variant === 'glow') return <GlowCursor />;
  return <CurrentCursor />;
};

export default CustomCursor;
