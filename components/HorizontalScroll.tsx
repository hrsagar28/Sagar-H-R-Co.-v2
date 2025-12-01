
import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState('auto');
  const [translateX, setTranslateX] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  
  // Disable sticky scroll on mobile for better UX
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate required height for the sticky scroll effect
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const calcHeight = () => {
      if (scrollContainerRef.current) {
        const objectWidth = scrollContainerRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDist = objectWidth - viewportWidth;
        // We add viewport height to allow full scroll through + padding
        setDynamicHeight(`${scrollDist + viewportWidth * 0.5}px`);
      }
    };

    calcHeight();
    const timer = setTimeout(calcHeight, 200); // Debounce for content load
    window.addEventListener('resize', calcHeight);
    
    return () => {
      window.removeEventListener('resize', calcHeight);
      clearTimeout(timer);
    };
  }, [children, isMobile, shouldReduceMotion]);

  // Handle Scroll
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportTop = 0; // Top of viewport
      
      // Calculate how far the container top is from the viewport top
      const offset = -rect.top;
      
      if (scrollContainerRef.current) {
        const objectWidth = scrollContainerRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const maxTranslate = objectWidth - viewportWidth;
        
        // Map scroll distance to translation
        // We stop translating when we reach the end of the scrollable height
        // But we want the sticky effect to hold until then
        // The container height is (maxTranslate + viewportHeight) essentially
        
        // Clamp translation between 0 and maxTranslate
        const translate = Math.max(0, Math.min(offset, maxTranslate));
        setTranslateX(translate);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, shouldReduceMotion, dynamicHeight]);

  const isDisabled = isMobile || shouldReduceMotion;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${className}`} 
      style={{ height: isDisabled ? 'auto' : dynamicHeight }}
    >
      <div className={`${isDisabled ? '' : 'sticky top-0 h-screen'} flex items-center overflow-hidden`}>
        <div 
          ref={scrollContainerRef} 
          className={`flex gap-8 px-4 md:px-20 ${isDisabled ? 'overflow-x-auto pb-12 flex-nowrap w-full snap-x snap-mandatory' : 'will-change-transform'}`}
          style={{ transform: isDisabled ? 'none' : `translate3d(-${translateX}px, 0, 0)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;
