
import { useState, useEffect, useRef } from 'react';

interface ScrollState {
  scrollY: number;
  direction: 'up' | 'down' | null;
}

/**
 * Hook to track window scroll position and direction.
 * Uses throttling to improve performance.
 * 
 * @param throttleMs - Throttle delay in milliseconds (default: 100ms)
 */
export const useScrollPosition = (throttleMs: number = 100): ScrollState => {
  const [scrollData, setScrollData] = useState<ScrollState>({
    scrollY: 0,
    direction: null,
  });

  const lastScrollY = useRef(0);
  const lastRun = useRef(0);

  useEffect(() => {
    // Initial value
    lastScrollY.current = window.scrollY;
    setScrollData({ scrollY: window.scrollY, direction: null });

    const handleScroll = () => {
      const now = Date.now();
      
      if (now - lastRun.current >= throttleMs) {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
        
        setScrollData({
          scrollY: currentScrollY,
          direction: currentScrollY === lastScrollY.current ? null : direction
        });

        lastScrollY.current = currentScrollY;
        lastRun.current = now;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttleMs]);

  return scrollData;
};
