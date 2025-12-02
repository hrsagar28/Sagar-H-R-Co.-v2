import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInView } from '../hooks/useInView';

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
 * Optimized to pause calculations when off-screen.
 */
const Parallax: React.FC<ParallaxProps> = ({ 
  speed = 0.5, 
  children, 
  className = "",
  disabled = false
}) => {
  // Use useInView to detect visibility. We pass the ref to the hook.
  const [ref, isInView] = useInView({ threshold: 0, rootMargin: '100px' });
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    if (shouldReduceMotion || disabled || !isInView) return;

    let rAFId: number;
    const target = ref.current as HTMLElement;

    const updatePosition = () => {
      // We calculate offset based on global scroll Y.
      // Ideally, we only want to calculate relative to when it entered the view,
      // but standard parallax usually maps directly to scrollY.
      const scrollY = window.scrollY;
      const newOffset = scrollY * speed;
      
      if (target) {
        target.style.transform = `translate3d(0, ${newOffset}px, 0)`;
      }
      
      rAFId = requestAnimationFrame(updatePosition);
    };

    rAFId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [speed, shouldReduceMotion, disabled, isInView]);

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={`will-change-transform ${className}`}
      style={{ transform: shouldReduceMotion || disabled ? 'none' : undefined }}
    >
      {children}
    </div>
  );
};

export default Parallax;