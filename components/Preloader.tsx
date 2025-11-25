import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Preloader: React.FC = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion is preferred, we skip the preloader entirely to avoid transition sickness
    if (shouldReduceMotion) {
      setHidden(true);
      return;
    }

    // Sequence:
    // 0s: Mount (Black screen)
    // 1.5s: Start lifting curtain (Reduced for snappier UX)
    // 2.0s: Remove from DOM
    const timer = setTimeout(() => {
      setAnimateOut(true);
    }, 1500);

    const cleanup = setTimeout(() => {
      setHidden(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [shouldReduceMotion]);

  if (hidden) return null;

  return (
    <div 
      className={`fixed inset-0 z-preloader flex items-center justify-center bg-[#0a0a0a] transition-transform duration-[800ms] ease-[cubic-bezier(0.83,0,0.17,1)] will-change-transform ${animateOut ? '-translate-y-full' : 'translate-y-0'}`}
      role="presentation"
    >
      <div className={`flex flex-col items-center justify-center transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Title - Using the new Serif font for editorial elegance */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight mb-8 animate-fade-in-up flex items-baseline gap-4">
          <span className="italic font-medium">Sagar</span> 
          <span className="font-normal">H R & Co.</span>
        </h1>
        
        <div className="h-[1px] w-0 bg-white/30 animate-expand-width rounded-full mb-6"></div>
        
        <p className="text-white/70 text-xs md:text-sm font-sans font-bold uppercase tracking-[0.4em] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Chartered Accountants
        </p>
      </div>
    </div>
  );
};

export default Preloader;