import { RefObject, useEffect, useRef } from 'react';

type SpotlightOptions = {
  disabled?: boolean;
};

const supportsFinePointer = () => (
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
);

const prefersReducedMotion = () => (
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

export const useSpotlight = (
  containerRef: RefObject<HTMLElement>,
  { disabled = false }: SpotlightOptions = {}
) => {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled || prefersReducedMotion() || !supportsFinePointer()) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        container.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        container.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        rafRef.current = 0;
      });
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [containerRef, disabled]);
};
