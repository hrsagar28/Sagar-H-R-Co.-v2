import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../hooks';
import { CONTACT_INFO } from '../constants';

const Preloader: React.FC = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (pathname === '/') {
      setHidden(true);
      return;
    }

    // If reduced motion is preferred, we skip the preloader entirely to avoid transition sickness
    if (shouldReduceMotion || sessionStorage.getItem('preloader_done') === '1') {
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
      sessionStorage.setItem('preloader_done', '1');
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
      sessionStorage.setItem('preloader_done', '1');
    };
  }, [pathname, shouldReduceMotion]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-preloader flex items-center justify-center bg-[#0a0a0a] transition-transform duration-[800ms] ease-[cubic-bezier(0.83,0,0.17,1)] will-change-transform ${animateOut ? '-translate-y-full' : 'translate-y-0'}`}
      role="presentation"
    >
      <div
        className={`flex flex-col items-center justify-center transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Title - Using the new Serif font for editorial elegance */}
        <h1 className="mb-8 flex animate-fade-in-up items-baseline gap-4 font-serif text-5xl tracking-tight text-white md:text-7xl lg:text-8xl">
          <span className="font-medium italic">Sagar</span>
          <span className="font-normal">H R & Co.</span>
        </h1>

        <div className="mb-6 h-[1px] w-24 origin-left scale-x-0 animate-expand-width rounded-full bg-white/30"></div>

        <p
          className="animate-fade-in-up font-sans text-xs font-bold uppercase tracking-[0.4em] text-white/70 md:text-sm"
          style={{ animationDelay: '0.3s' }}
        >
          {CONTACT_INFO.tagline}
        </p>
      </div>
    </div>
  );
};

export default Preloader;
