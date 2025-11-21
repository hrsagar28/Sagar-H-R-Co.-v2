import React, { useEffect, useState } from 'react';

const Preloader: React.FC = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Sequence:
    // 0s: Mount (Black screen)
    // 2.2s: Start lifting curtain
    // 3.2s: Remove from DOM
    const timer = setTimeout(() => {
      setAnimateOut(true);
    }, 2200);

    const cleanup = setTimeout(() => {
      setHidden(true);
    }, 3200);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  if (hidden) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] transition-transform duration-[1000ms] ease-[cubic-bezier(0.83,0,0.17,1)] will-change-transform ${animateOut ? '-translate-y-full' : 'translate-y-0'}`}
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