
import { useState, useEffect, useRef, RefObject, useMemo } from 'react';

interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to track whether an element is currently in the viewport.
 * 
 * @param {UseInViewOptions} [options] - IntersectionObserver options.
 * @returns {[RefObject<HTMLElement | null>, boolean]} A ref to attach to the element and a boolean visibility state.
 */
export function useInView(options: UseInViewOptions = {}): [RefObject<HTMLElement | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  // Memoize options to prevent unnecessary re-subscriptions
  const observerOptions = useMemo(() => ({
    threshold,
    rootMargin,
  }), [threshold, rootMargin]);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      const inView = entry.isIntersecting;
      setIsInView(inView);
      
      if (inView && triggerOnce) {
        observer.unobserve(currentRef);
      }
    }, observerOptions);
    
    observer.observe(currentRef);
    
    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [observerOptions, triggerOnce]);
  
  return [ref, isInView];
}
