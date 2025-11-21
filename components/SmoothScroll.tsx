import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const location = useLocation();
  
  // We disable inertia scroll on mobile/touch devices as native scroll is superior there
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. Measure content height to sync the body scrollbar
  useEffect(() => {
    if (isMobile) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [location.pathname, isMobile]);

  // 2. Apply height to body so native scrollbar works
  useEffect(() => {
    if (isMobile) {
      document.body.style.height = '';
      return;
    }
    document.body.style.height = `${contentHeight}px`;
    
    return () => {
      document.body.style.height = '';
    };
  }, [contentHeight, isMobile]);

  // 3. The Animation Loop (Inertia)
  useEffect(() => {
    if (isMobile) return;

    let currentScroll = 0;
    let targetScroll = 0;
    let request: number;

    // The "Ease" factor. Lower = heavier/smoother. Higher = snappier.
    const ease = 0.07; 

    const update = () => {
      targetScroll = window.scrollY;
      
      // Linear Interpolation (Lerp)
      // current = current + (target - current) * ease
      currentScroll += (targetScroll - currentScroll) * ease;

      // Snap to target if very close to stop micro-jitters
      if (Math.abs(targetScroll - currentScroll) < 0.1) {
        currentScroll = targetScroll;
      }

      if (contentRef.current) {
        // Use translate3d for hardware acceleration
        contentRef.current.style.transform = `translate3d(0, -${currentScroll}px, 0)`;
      }

      request = requestAnimationFrame(update);
    };

    request = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(request);
      if (contentRef.current) {
        contentRef.current.style.transform = '';
      }
    };
  }, [isMobile]);

  // Render
  if (isMobile) {
    return <main className="w-full min-h-screen relative">{children}</main>;
  }

  return (
    <>
      <div 
        ref={contentRef}
        className="fixed top-0 left-0 w-full will-change-transform z-0"
        style={{ backfaceVisibility: 'hidden' }}
      >
         {children}
      </div>
    </>
  );
};

export default SmoothScroll;