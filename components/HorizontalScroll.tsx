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

/** Threshold percentages for when each arrow first appears / disappears.
 *  Kept symmetrical so the rail feels balanced. Audit S-01 — these gate
 *  the *only* state updates that still fire during a scroll, so we change
 *  them as rarely as possible. */
const SHOW_LEFT_AT = 0.02;
const SHOW_RIGHT_UNTIL = 0.98;

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '', header }) => {
  'use memo';
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  /** Inner translating track (desktop) / scrolling flex (mobile). We write
   *  `transform` directly to this ref on every scroll frame instead of
   *  re-rendering through React state — audit S-01. */
  const trackRef = useRef<HTMLDivElement>(null);
  /** Progress-bar fill element; receives `style.width` mutations. */
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState('auto');
  const shouldReduceMotion = useReducedMotion();

  // Desktop arrows only flip when crossing the SHOW_LEFT_AT / SHOW_RIGHT_UNTIL
  // thresholds (audit S-01). We keep the latest values in refs alongside the
  // React state so the scroll handler can do a cheap equality check before
  // dispatching a state update.
  const [showLeft, setShowLeft] = useState(false);
  const showLeftRef = useRef(false);
  const [showRight, setShowRight] = useState(true);
  const showRightRef = useRef(true);

  /** Latest desktop translate value in px, used by `nudgeScroll` and the
   *  focus-in handler. Was previously the `translateX` state. */
  const translateXRef = useRef(0);

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

  /** Write the rail's translate and progress to the DOM directly, plus
   *  update the showLeft / showRight states only if they crossed a
   *  threshold. Audit S-01: this replaces the previous setTranslateX +
   *  setScrollProgress per-frame React renders, which used to re-render
   *  every service card 60 times a second. */
  const applyProgress = useCallback((translate: number, progress: number) => {
    translateXRef.current = translate;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(-${translate}px, 0, 0)`;
    }
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${progress * 100}%`;
    }

    const nextShowLeft = progress > SHOW_LEFT_AT;
    if (nextShowLeft !== showLeftRef.current) {
      showLeftRef.current = nextShowLeft;
      setShowLeft(nextShowLeft);
    }

    const nextShowRight = progress < SHOW_RIGHT_UNTIL;
    if (nextShowRight !== showRightRef.current) {
      showRightRef.current = nextShowRight;
      setShowRight(nextShowRight);
    }
  }, []);

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
      const progress = metrics.current.maxTranslate > 0 ? translate / metrics.current.maxTranslate : 0;
      applyProgress(translate, progress);
    };

    const handleScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = window.requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Sync once on mount so the rail reflects the page's current scroll
    // position (e.g., when navigating back with scroll-restored state).
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = 0;
    };
  }, [isMobile, shouldReduceMotion, applyProgress]);

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
      const progress = max > 0 ? el.scrollLeft / max : 0;
      // Mobile path doesn't translate (the flex container scrolls natively),
      // so translate stays at 0; only the progress fill + arrows update.
      applyProgress(0, progress);
    });
  }, [showSwipeHint, applyProgress]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(mobileScrollRaf.current);
    };
  }, []);

  // Desktop: nudge scroll position left/right via arrow buttons
  const nudgeScroll = useCallback((direction: 'left' | 'right') => {
    if (!metrics.current.ready) return;
    const nudgeAmount = window.innerWidth * 0.4; // scroll ~40vw per click
    const current = translateXRef.current;
    const targetOffset =
      direction === 'right'
        ? Math.min(current + nudgeAmount, metrics.current.maxTranslate)
        : Math.max(current - nudgeAmount, 0);
    const targetScrollY = metrics.current.top + targetOffset;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  }, []);

  const isDisabled = isMobile || shouldReduceMotion;

  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let focusRaf = 0;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !scrollContainer.contains(target)) return;

      window.cancelAnimationFrame(focusRaf);
      focusRaf = window.requestAnimationFrame(() => {
        if (!metrics.current.ready) return;

        // Audit S-02: previously this scrolled the page on EVERY focus
        // event, fighting the user's own scroll position. Now we only
        // intervene when the focused card is genuinely cropped off-screen
        // (more than half of it past either viewport edge), and we use
        // `behavior: 'auto'` so it doesn't smooth-scroll over a deliberate
        // user gesture.
        const cardRect = target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const halfCardWidth = cardRect.width / 2;
        const hiddenLeft = Math.max(0, -cardRect.left);
        const hiddenRight = Math.max(0, cardRect.right - viewportWidth);
        const hidden = Math.max(hiddenLeft, hiddenRight);
        if (hidden < halfCardWidth) return;

        const viewportCenter = viewportWidth / 2;
        const cardCenter = cardRect.left + cardRect.width / 2;
        const delta = cardCenter - viewportCenter;
        const targetOffset = Math.max(0, Math.min(metrics.current.maxTranslate, translateXRef.current + delta));
        window.scrollTo({ top: metrics.current.top + targetOffset, behavior: 'auto' });
      });
    };

    scrollContainer.addEventListener('focusin', onFocusIn);
    return () => {
      scrollContainer.removeEventListener('focusin', onFocusIn);
      window.cancelAnimationFrame(focusRaf);
    };
  }, [isMobile, shouldReduceMotion]);

  /** Audit S-03: keyboard arrow support so the SR hint we render below
   *  ("Use arrow keys to navigate practice areas") is honest. When focus
   *  is anywhere inside the rail viewport and the user hits Arrow Left/
   *  Right, we nudge the rail by ~40 vw — the same step the arrow buttons
   *  apply. Disabled on mobile / reduced-motion because the rail there
   *  uses native horizontal overflow scrolling that already handles
   *  keyboard input. */
  const onWrapperKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      // Don't hijack text-input arrow keys — none of the rail cards have
      // form fields today, but this guards against future regressions.
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudgeScroll('right');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudgeScroll('left');
      }
    },
    [isDisabled, nudgeScroll],
  );

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
      // Audit S-03: keyboard arrow nudges. React's synthetic key handler
      // catches the event no matter which card / arrow inside the rail has
      // focus, so we don't need a window-level listener.
      onKeyDown={onWrapperKeyDown}
    >
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-brand-dark focus:shadow-xl"
        href="#after-services"
        onClick={focusAfterServices}
      >
        Skip services rail
      </a>

      {/* Audit S-03: this hint mirrors what the visible "Use the arrows or
          scroll" copy says on screen, but as text that screen readers can
          surface. Lives just inside the wrapper so it's tied to the focus
          context the keydown listener watches. */}
      <p className="sr-only" id="services-rail-keyboard-hint">
        Use arrow keys to navigate between practice areas.
      </p>

      {/*
        Desktop: sticky flex-col pane that holds the header at the top and
        fills the remaining height with the horizontally-scrolling cards.
        Using `h-[100vh] h-[100dvh]` avoids iOS Safari's
        bottom URL bar eating into the sticky region.
        Mobile: no sticky — content flows normally; header sits above cards.
      */}
      <div className={`${isDisabled ? '' : 'sticky top-0 h-[100dvh] h-[100vh]'} flex flex-col overflow-hidden`}>
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
              type="button"
              onClick={() => nudgeScroll('left')}
              aria-label="Scroll services left"
              aria-keyshortcuts="ArrowLeft"
              aria-describedby="services-rail-keyboard-hint"
              aria-hidden={!showLeft}
              tabIndex={showLeft ? 0 : -1}
              {...(!showLeft ? { inert: true } : {})}
              className={`absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${showLeft ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'}`}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Desktop: Right Arrow (hidden at end) */}
          {!isDisabled && (
            <button
              type="button"
              onClick={() => nudgeScroll('right')}
              aria-label="Scroll services right"
              aria-keyshortcuts="ArrowRight"
              aria-describedby="services-rail-keyboard-hint"
              aria-hidden={!showRight}
              tabIndex={showRight ? 0 : -1}
              {...(!showRight ? { inert: true } : {})}
              className={`absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${showRight ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0'}`}
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div
            ref={(node) => {
              scrollContainerRef.current = node;
              trackRef.current = node;
            }}
            onScroll={isMobile ? handleMobileScroll : undefined}
            className={`flex gap-8 px-4 md:px-20 ${
              isDisabled
                ? 'no-scrollbar w-full snap-x snap-mandatory flex-nowrap overflow-x-auto pb-12'
                : 'will-change-transform'
            } `}
            // Audit S-01: transform is now mutated directly by `applyProgress`
            // via `trackRef`. We still initialise it on mount so the first
            // paint isn't shifted by a frame of pre-effect rendering.
            style={isDisabled ? undefined : { transform: 'translate3d(0, 0, 0)' }}
          >
            {children}
          </div>

          {/* Scroll Progress Bar — bottom of the cards viewport */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
            <div
              ref={progressFillRef}
              className="h-full rounded-full bg-[#4ADE80] transition-all duration-100 ease-linear"
              // Audit S-01: width set directly via DOM by `applyProgress`.
              // Inline width here just guards against an unstyled first paint.
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;
