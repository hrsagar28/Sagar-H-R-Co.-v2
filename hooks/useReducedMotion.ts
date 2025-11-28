
import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user has requested reduced motion in their OS preferences.
 * 
 * @returns {boolean} True if 'prefers-reduced-motion: reduce' matches.
 */
export const useReducedMotion = (): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMatches(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return matches;
};
