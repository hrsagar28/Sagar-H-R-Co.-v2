
import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ParallaxProps {
  speed?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Parallax Component
 * 
 * Moves its children vertically at a different speed relative to the scrolling content.
 * 
 * @param speed - The speed factor. Negative values move slower/reverse (backgrounds), positive values move faster (foregrounds). 
 *                Example: -0.5 means it moves at half speed in reverse direction (standard parallax bg).
 */
const Parallax: React.FC<ParallaxProps> = ({ 
  speed = 0.5, 
  children, 
  className = "",
  disabled = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || disabled) return;

    let rAFId: number;

    const handleScroll = () => {
      // Calculate offset based on scroll position
      // We use simple window.scrollY for global parallax feel
      const scrollY = window.scrollY;
      const newOffset = scrollY * speed;
      
      // Update DOM directly for performance (bypass React render cycle for 60fps)
      if (ref.current) {
        ref.current.style.transform = `translate3d(0, ${newOffset}px, 0)`;
      }
    };

    const loop = () => {
      handleScroll();
      rAFId = requestAnimationFrame(loop);
    };

    // Start loop
    loop();

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [speed, shouldReduceMotion, disabled]);

  return (
    <div 
      ref={ref} 
      className={`will-change-transform ${className}`}
      style={{ transform: shouldReduceMotion || disabled ? 'none' : undefined }}
    >
      {children}
    </div>
  );
};

export default Parallax;
