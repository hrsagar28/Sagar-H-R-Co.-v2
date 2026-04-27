
import { useState, useEffect } from 'react';
import { useInView } from './useInView';
import { useReducedMotion } from './useReducedMotion';

export const useCountUp = <E extends HTMLElement = HTMLDivElement>(end: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView<E>({ triggerOnce: true });
  const reduce = useReducedMotion();
  
  useEffect(() => {
    if (!isInView) return;
    if (reduce) {
      setCount(end);
      return;
    }

    let startTime: number | undefined;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * ease));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration, reduce]);

  return { count, ref };
};
