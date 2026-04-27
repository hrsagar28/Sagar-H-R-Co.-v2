import React, { Children, isValidElement, useRef, useEffect, useState, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type RevealCallback = () => void;

const revealCallbacks = new Map<Element, RevealCallback>();
let sharedObserver: IntersectionObserver | null = null;

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const callback = revealCallbacks.get(entry.target);
        if (callback) callback();
        revealCallbacks.delete(entry.target);
        sharedObserver?.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  }

  return sharedObserver;
};

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
  duration = 0.8,
  className = "",
  variant = 'fade-up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }

    const observer = getSharedObserver();
    revealCallbacks.set(element, () => setIsVisible(true));
    observer.observe(element);

    return () => {
      revealCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, [shouldReduceMotion]);

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

export const WordReveal: React.FC<WordRevealProps> = ({
  children,
  delay = 0.15,
  stagger = 0.12,
  className = '',
}) => {
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

    const observer = getSharedObserver();
    revealCallbacks.set(element, () => setIsVisible(true));
    observer.observe(element);

    return () => {
      revealCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const words: ReactNode[] = [];

  const extractWords = (node: ReactNode) => {
    if (typeof node === 'string') {
      node.split(/\s+/).filter(Boolean).forEach((part) => words.push(part));
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(extractWords);
      return;
    }

    if (isValidElement(node)) {
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
          <span className="inline-flex overflow-hidden pb-[0.25em] -mb-[0.25em] align-bottom">
            <span
              className="inline-block whitespace-nowrap transition-transform duration-700 ease-out motion-reduce:transition-none"
              style={{
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
