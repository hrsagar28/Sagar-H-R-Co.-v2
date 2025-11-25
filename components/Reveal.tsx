import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface RevealProps {
  children: ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number; // Delay in seconds
  duration?: number; // Duration in seconds
  className?: string;
  variant?: 'fade-up' | 'slide-up' | 'scale' | 'reveal-mask';
}

/**
 * Reveal Component
 * Uses IntersectionObserver to trigger premium entrance animations when elements scroll into view.
 * Respects prefers-reduced-motion.
 */
const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = 'fit-content',
  delay = 0,
  duration = 0.8,
  className = "",
  variant = 'fade-up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Trigger when even 10% of the element is visible
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Once visible, we can stop observing to prevent re-triggering
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  // Define transition styles based on visibility
  const getTransformStyle = () => {
    if (shouldReduceMotion) return 'none';
    if (isVisible) return 'translate(0, 0) scale(1)';
    
    switch (variant) {
      case 'slide-up': return 'translate(0, 40px)';
      case 'scale': return 'scale(0.95)';
      case 'reveal-mask': return 'translate(0, 100%)';
      case 'fade-up': default: return 'translate(0, 20px)';
    }
  };

  const getOpacityStyle = () => {
    if (shouldReduceMotion) return 1;
    if (variant === 'reveal-mask') return 1; // Mask reveals don't usually fade opacity
    return isVisible ? 1 : 0;
  };

  const style = {
    transitionProperty: 'all',
    transitionDuration: shouldReduceMotion ? '0s' : `${duration}s`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // Premium ease
    transitionDelay: shouldReduceMotion ? '0s' : `${delay}s`,
    opacity: getOpacityStyle(),
    transform: getTransformStyle(),
  };

  // For mask reveal, we need an overflow-hidden wrapper
  if (variant === 'reveal-mask') {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width }}>
        <div style={style}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ width, ...style }}>
      {children}
    </div>
  );
};

export default Reveal;