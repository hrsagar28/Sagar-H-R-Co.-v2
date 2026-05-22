import React, { Children, isValidElement, useRef, useEffect, useState, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Hard upper bound, in ms, on how long content inside a Reveal is allowed
 * to stay invisible before we force it to render. Audit R-01: under
 * normal scroll the IntersectionObserver fires within a frame or two of
 * the element entering view, but bots, AT browsing modes, very narrow
 * viewports, and certain `content-visibility: auto` reflow timings can
 * silently prevent the observer from ever firing. This safety net makes
 * sure content is never hidden indefinitely.
 */
const REVEAL_SAFETY_TIMEOUT_MS = 1500;

interface RevealProps {
  /** The content to be animated */
  children: ReactNode;
  /** Width of the container. Default: 'fit-content' */
  width?: 'fit-content' | '100%';
  /** Delay in seconds before animation starts. Default: 0 */
  delay?: number;
  /** Duration in seconds of the animation. Default: 0.8 */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Animation style variant. Default: 'fade-up' */
  variant?: 'fade-up' | 'slide-up' | 'scale' | 'reveal-mask';
  /** Render immediately without observing or animating. Default: false */
  eager?: boolean;
}

interface WordRevealProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

/**
 * Reveal Component
 *
 * Uses IntersectionObserver to trigger premium entrance animations when elements scroll into view.
 * Respects prefers-reduced-motion media query settings.
 *
 * @example
 * <Reveal variant="fade-up" delay={0.2}>
 *   <h1>Animated Heading</h1>
 * </Reveal>
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  width = 'fit-content',
  delay = 0,
  // Audit MA-11: dropped from 0.8s to 0.55s. 800ms was a cinematic
  // duration; current interface-motion practice favours shorter, more
  // confident content entrances (~350-550ms). The hero passes an
  // explicit `duration` so it can still run a touch slower.
  duration = 0.55,
  className = '',
  variant = 'fade-up',
  eager = false,
}) => {
  'use memo';
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (eager) return;

    const element = ref.current;
    if (!element) return;

    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Audit CQ-03: this helper transitions the component to its visible
     * state. The setState call inside is reachable from an
     * IntersectionObserver callback AND from a setTimeout — both are
     * asynchronous boundaries that fire AFTER the effect has settled, so
     * they're functionally event handlers, not synchronous-in-effect
     * mutations. The eslint `react-hooks/set-state-in-effect` rule can't
     * statically distinguish "setState during effect setup" from
     * "setState in an async callback set up by the effect", so the rule
     * fires here. The React Compiler annotation mode bails on this file
     * for the same reason. Both are accepted: this is the canonical
     * IntersectionObserver-to-state-machine bridge and there's no
     * cleaner shape that doesn't reintroduce a different anti-pattern
     * (e.g., useSyncExternalStore with a per-element observer is a
     * heavier rewrite for no behavioural gain). Each Reveal owns a
     * single IntersectionObserver that disconnects the moment it has
     * fired, so there is no pooling layer to preserve here.
     */
    const reveal = () => {
      setIsVisible(true);
      observer.disconnect();
      if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(element);

    // Audit R-01: belt-and-braces — if the observer hasn't fired within
    // REVEAL_SAFETY_TIMEOUT_MS, reveal anyway. Prevents the failure mode
    // where the wrapping content-visibility:auto parent never reflows
    // the Reveal into the viewport and the user is left looking at an
    // invisible block.
    safetyTimer = setTimeout(reveal, REVEAL_SAFETY_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [eager, shouldReduceMotion]);

  useEffect(() => {
    if (!isVisible || shouldReduceMotion) return;

    const el = ref.current;
    if (!el) return;

    const inner = variant === 'reveal-mask' ? (el.firstElementChild as HTMLElement | null) : el;
    if (!inner) return;

    const onEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') return;

      inner.style.willChange = 'auto';
    };

    inner.addEventListener('transitionend', onEnd, { once: true });
    return () => inner.removeEventListener('transitionend', onEnd);
  }, [isVisible, shouldReduceMotion, variant]);

  if (eager) {
    if (variant === 'reveal-mask') {
      return (
        <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, minHeight: '1lh' }}>
          <div style={{ opacity: 1 }}>{children}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className={className} style={{ width, opacity: 1 }}>
        {children}
      </div>
    );
  }

  // Define transition styles based on visibility
  const getTransformStyle = () => {
    if (shouldReduceMotion) return 'none';
    if (isVisible) return 'translate(0, 0) scale(1)';

    switch (variant) {
      case 'slide-up':
        return 'translate(0, 40px)';
      case 'scale':
        return 'scale(0.95)';
      case 'reveal-mask':
        return 'translate(0, 100%)';
      case 'fade-up':
      default:
        return 'translate(0, 20px)';
    }
  };

  const getOpacityStyle = () => {
    if (shouldReduceMotion) return 1;
    if (variant === 'reveal-mask') return 1; // Mask reveals don't usually fade opacity
    return isVisible ? 1 : 0;
  };

  const style: React.CSSProperties = {
    transitionProperty: 'transform, opacity',
    transitionDuration: shouldReduceMotion ? '0s' : `${duration}s`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: shouldReduceMotion ? '0s' : `${delay}s`,
    opacity: getOpacityStyle(),
    transform: getTransformStyle(),
    willChange: shouldReduceMotion || isVisible ? undefined : 'transform, opacity',
  };

  // For mask reveal, we need an overflow-hidden wrapper
  if (variant === 'reveal-mask') {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, minHeight: '1lh' }}>
        <div style={style}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ width, ...style }}>
      {children}
    </div>
  );
};

export const WordReveal: React.FC<WordRevealProps> = ({ children, delay = 0.15, stagger = 0.12, className = '' }) => {
  'use memo';
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          setIsVisible(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const words: ReactNode[] = [];

  const extractWords = (node: ReactNode) => {
    if (typeof node === 'string') {
      node
        .split(/\s+/)
        .filter(Boolean)
        .forEach((part) => words.push(part));
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(extractWords);
      return;
    }

    if (isValidElement<{ children?: ReactNode }>(node)) {
      if (node.type === React.Fragment) {
        extractWords(node.props.children);
        return;
      }

      words.push(node);
      return;
    }

    if (node !== null && node !== undefined) {
      words.push(String(node));
    }
  };

  Children.forEach(children, extractWords);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <span className="-mb-[0.25em] inline-flex overflow-hidden pb-[0.25em] align-bottom">
            <span
              className="inline-block whitespace-nowrap transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40%)',
                transitionDelay: isVisible ? `${delay + index * stagger}s` : '0s',
              }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </span>
  );
};

export default Reveal;
