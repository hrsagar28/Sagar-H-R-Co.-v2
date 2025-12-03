
import { useState, useEffect, useRef } from 'react';

interface ScrollState {
  scrollY: number;
  direction: 'up' | 'down' | null;
}

/**
 * Hook to track window scroll position and direction.
 * Uses requestAnimationFrame to optimize performance while ensuring 
 * the final scroll state (like 0 when hitting top) is captured accurately.
 * 
 * @param _throttleMs - Deprecated: rAF handles throttling naturally to refresh rate.
 */
export const useScrollPosition = (_throttleMs: number = 100): ScrollState => {
  const [scrollData, setScrollData] = useState<ScrollState>({
    scrollY: 0,
    direction: null,
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Initial value synchronization on mount
    const initialY = window.scrollY;
    lastScrollY.current = initialY;
    setScrollData({ scrollY: initialY, direction: null });

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      
      setScrollData({
        scrollY: currentScrollY,
        direction: currentScrollY === lastScrollY.current ? null : direction
      });

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollData;
};
