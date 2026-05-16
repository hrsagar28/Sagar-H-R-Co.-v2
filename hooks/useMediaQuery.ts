import { useState, useEffect } from 'react';

/**
 * Hook to track whether a CSS media query currently matches.
 *
 * Mirrors the pattern of `useReducedMotion`: reads synchronously on first
 * render (so there is no flash) and subscribes to changes so the value stays
 * correct across viewport resizes / orientation changes.
 *
 * @param query A media query string, e.g. '(min-width: 768px)'.
 * @returns {boolean} True while the query matches.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
};
