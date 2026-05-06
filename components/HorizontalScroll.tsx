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
  const scrollRaf = useRef(0);
  const mobileScrollRaf = useRef(0);

  // Cached layout metrics
  const metrics = useRef({
    top: 0,
    maxTranslate: 0,
    ready: false,
  });

  useEffect(() => {
    let resizeRaf = 0;

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

    const scheduleCheckMobile = () => {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        checkMobile();
      });
    };

    scheduleCheckMobile();
    window.addEventListener('resize', scheduleCheckMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', scheduleCheckMobile);
      window.cancelAnimationFrame(resizeRaf);
    };
  }, []);

  // Calculate layout dimensions
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;
    const container = containerRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!container || !scrollContainer) return;

    let measureRaf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hasMeasured = false;

    const measure = () => {
      const objectWidth = scrollContainer.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDist = Math.max(0, objectWidth - viewportWidth);
      const rect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      metrics.current = {
        top: rect.top + scrollTop,
        maxTranslate: scrollDist,
        ready: true,
      };

      setDynamicHeight(`${scrollDist + viewportWidth * 0.5}px`);
      hasMeasured = true;
    };

    const scheduleMeasure = () => {
      if (measureRaf) return;
      measureRaf = window.requestAnimationFrame(() => {
        measureRaf = 0;
        measure();
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasMeasured) return;
        scheduleMeasure();
        timer = setTimeout(scheduleMeasure, 500);
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(container);
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.cancelAnimationFrame(measureRaf);
      if (timer) clearTimeout(timer);
    };
  }, [children, isMobile, shouldReduceMotion]);

  // Handle Scroll (Desktop Sticky)
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const updateScroll = () => {
      scrollRaf.current = 0;
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

    const handleScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = 0;
    };
  }, [isMobile, shouldReduceMotion]);

  // Handle Mobile Scroll to hide hint and update progress
  const handleMobileScroll = useCallback(() => {
    if (mobileScrollRaf.current) return;
    mobileScrollRaf.current = window.requestAnimationFrame(() => {
      mobileScrollRaf.current = 0;
      if (showSwipeHint) {
        setShowSwipeHint(false);
      }

      const el = scrollContainerRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    });
  }, [showSwipeHint]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(mobileScrollRaf.current);
    };
  }, []);

  // Desktop: nudge scroll position left/right via arrow buttons
  const nudgeScroll = useCallback(
    (direction: 'left' | 'right') => {
      if (!metrics.current.ready) return;
      const nudgeAmount = window.innerWidth * 0.4; // scroll ~40vw per click
      const targetOffset =
        direction === 'right'
          ? Math.min(translateX + nudgeAmount, metrics.current.maxTranslate)
          : Math.max(translateX - nudgeAmount, 0);
      const targetScrollY = metrics.current.top + targetOffset;
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    },
    [translateX],
  );

  const isDisabled = isMobile || shouldReduceMotion;
  const focusAfterServices = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById('after-services')?.focus({ preventScroll: true });
    }, 0);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: isDisabled ? 'auto' : dynamicHeight }}
    >
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-brand-dark focus:shadow-xl"
        href="#after-services"
        onClick={focusAfterServices}
      >
        Skip services rail
      </a>

      {/*
        Desktop: sticky flex-col pane that holds the header at the top and
        fills the remaining height with the horizontally-scrolling cards.
        Using `h-[100dvh]` (with h-screen fallback) avoids iOS Safari's
        bottom URL bar eating into the sticky region.
        Mobile: no sticky — content flows normally; header sits above cards.
      */}
      <div className={`${isDisabled ? '' : 'sticky top-0 h-[100dvh] h-screen'} flex flex-col overflow-hidden`}>
        {header && <div className="w-full shrink-0">{header}</div>}

        {/* Cards viewport — this is the positioning context for arrows,
            swipe hint and progress bar. */}
        <div className="relative flex min-h-0 w-full flex-1 items-center overflow-hidden">
          {/* Minimalistic Mobile Swipe Indicator */}
          {isMobile && (
            <div
              className={`pointer-events-none absolute right-2 top-1/2 z-20 -translate-y-1/2 transition-opacity duration-700 ease-out ${showSwipeHint ? 'opacity-100' : 'opacity-0'} `}
            >
              <div className="animate-bounce-x rounded-full border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md">
                <ChevronsRight size={20} className="text-white/90" />
              </div>
            </div>
          )}

          {/* Desktop: Left Arrow (hidden at start) */}
          {!isDisabled && (
            <button
              onClick={() => nudgeScroll('left')}
              aria-label="Scroll left"
              className={`absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${scrollProgress > 0.02 ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'} `}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Desktop: Right Arrow (hidden at end) */}
          {!isDisabled && (
            <button
              onClick={() => nudgeScroll('right')}
              aria-label="Scroll right"
              className={`absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${scrollProgress < 0.98 ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0'} `}
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={isMobile ? handleMobileScroll : undefined}
            className={`flex gap-8 px-4 md:px-20 ${
              isDisabled
                ? 'no-scrollbar w-full snap-x snap-mandatory flex-nowrap overflow-x-auto pb-12'
                : 'will-change-transform'
            } `}
            style={{ transform: isDisabled ? 'none' : `translate3d(-${translateX}px, 0, 0)` }}
          >
            {children}
          </div>

          {/* Scroll Progress Bar — bottom of the cards viewport */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
            <div
              className="h-full rounded-full bg-[#4ADE80] transition-all duration-100 ease-linear"
              style={{ width: `${scrollProgress * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${Math.round(scrollProgress * 100)}% through services`}
              aria-label="Horizontal scroll progress"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;
