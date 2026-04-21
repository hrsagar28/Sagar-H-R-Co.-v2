
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Optional header rendered at the top of the sticky viewport on desktop
   * (and above the cards on mobile). Keeping the heading inside the sticky
   * region means the section title stays visible while cards scroll
   * horizontally, instead of being pushed off-screen by the 100vh pane.
   */
  header?: React.ReactNode;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '', header }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState('auto');
  const [translateX, setTranslateX] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Disable sticky scroll on mobile for better UX
  const [isMobile, setIsMobile] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Cached layout metrics
  const metrics = useRef({
    top: 0,
    maxTranslate: 0,
    ready: false
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Only show hint on mobile if we haven't scrolled yet
      if (mobile && scrollContainerRef.current && scrollContainerRef.current.scrollLeft === 0) {
        setShowSwipeHint(true);
      } else {
        setShowSwipeHint(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate layout dimensions
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const measure = () => {
      if (scrollContainerRef.current && containerRef.current) {
        const objectWidth = scrollContainerRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDist = objectWidth - viewportWidth;

        // We add viewport height to allow full scroll through + padding
        setDynamicHeight(`${scrollDist + viewportWidth * 0.5}px`);

        // Cache absolute position and max translation
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        metrics.current = {
          top: rect.top + scrollTop,
          maxTranslate: scrollDist,
          ready: true
        };
      }
    };

    measure();
    // Re-measure after a slight delay to ensure children content (like images) might have loaded/shifted
    const timer = setTimeout(measure, 500);
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, [children, isMobile, shouldReduceMotion]);

  // Handle Scroll (Desktop Sticky)
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const handleScroll = () => {
      if (!metrics.current.ready) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Calculate offset based on absolute positions rather than querying DOM
      // The container is sticky, so we check how far the wrapper has scrolled
      const offset = scrollTop - metrics.current.top;

      // Clamp translation between 0 and maxTranslate
      const translate = Math.max(0, Math.min(offset, metrics.current.maxTranslate));
      setTranslateX(translate);
      setScrollProgress(metrics.current.maxTranslate > 0 ? translate / metrics.current.maxTranslate : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, shouldReduceMotion]);

  // Handle Mobile Scroll to hide hint and update progress
  const handleMobileScroll = useCallback(() => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
    }
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const max = el.scrollWidth - el.clientWidth;
      setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    }
  }, [showSwipeHint]);

  // Desktop: nudge scroll position left/right via arrow buttons
  const nudgeScroll = useCallback((direction: 'left' | 'right') => {
    if (!metrics.current.ready) return;
    const nudgeAmount = window.innerWidth * 0.4; // scroll ~40vw per click
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    const targetOffset = direction === 'right'
      ? Math.min(translateX + nudgeAmount, metrics.current.maxTranslate)
      : Math.max(translateX - nudgeAmount, 0);
    const targetScrollY = metrics.current.top + targetOffset;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  }, [translateX]);

  const isDisabled = isMobile || shouldReduceMotion;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: isDisabled ? 'auto' : dynamicHeight }}
    >
      {/*
        Desktop: sticky flex-col pane that holds the header at the top and
        fills the remaining height with the horizontally-scrolling cards.
        Using `h-[100dvh]` (with h-screen fallback) avoids iOS Safari's
        bottom URL bar eating into the sticky region.
        Mobile: no sticky — content flows normally; header sits above cards.
      */}
      <div
        className={`${
          isDisabled ? '' : 'sticky top-0 h-screen h-[100dvh]'
        } flex flex-col overflow-hidden`}
      >
        {header && (
          <div className="shrink-0 w-full">
            {header}
          </div>
        )}

        {/* Cards viewport — this is the positioning context for arrows,
            swipe hint and progress bar. */}
        <div className="relative flex-1 flex items-center overflow-hidden w-full min-h-0">
          {/* Minimalistic Mobile Swipe Indicator */}
          {isMobile && (
            <div
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none
                transition-opacity duration-700 ease-out
                ${showSwipeHint ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg animate-bounce-x">
                <ChevronsRight size={20} className="text-white/90" />
              </div>
            </div>
          )}

          {/* Desktop: Left Arrow (hidden at start) */}
          {!isDisabled && (
            <button
              onClick={() => nudgeScroll('left')}
              aria-label="Scroll left"
              className={`
                absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full
                bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                flex items-center justify-center text-white
                hover:bg-white/20 transition-all duration-300
                ${scrollProgress > 0.02 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
              `}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Desktop: Right Arrow (hidden at end) */}
          {!isDisabled && (
            <button
              onClick={() => nudgeScroll('right')}
              aria-label="Scroll right"
              className={`
                absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full
                bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                flex items-center justify-center text-white
                hover:bg-white/20 transition-all duration-300
                ${scrollProgress < 0.98 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
              `}
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={isMobile ? handleMobileScroll : undefined}
            className={`
              flex gap-8 px-4 md:px-20
              ${isDisabled
                ? 'overflow-x-auto pb-12 flex-nowrap w-full snap-x snap-mandatory no-scrollbar'
                : 'will-change-transform'
              }
            `}
            style={{ transform: isDisabled ? 'none' : `translate3d(-${translateX}px, 0, 0)` }}
          >
            {children}
          </div>

          {/* Scroll Progress Bar — bottom of the cards viewport */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
            <div
              className="h-full bg-[#4ADE80] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${scrollProgress * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Horizontal scroll progress"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;
