
import { useState, useEffect } from 'react';
import { useInView } from './useInView';

export const useCountUp = (end: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView({ triggerOnce: true });
  
  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / (duration * 1000), 1);
        
        // Easing function (easeOutExpo)
        // 1 - Math.pow(2, -10 * percentage)
        const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
        
        setCount(Math.floor(end * ease));

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return { count, ref };
};
