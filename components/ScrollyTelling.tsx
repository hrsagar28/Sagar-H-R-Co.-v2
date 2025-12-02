
import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Reveal from './Reveal';

interface ScrollyItem {
  id: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}

interface ScrollyTellingProps {
  items: ScrollyItem[];
  className?: string;
}

const ScrollyTelling: React.FC<ScrollyTellingProps> = ({ items, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0); // Float value: 0.0 to (items.length - 1)
  const shouldReduceMotion = useReducedMotion();
  
  // Cache layout metrics to avoid getBoundingClientRect in scroll loop
  const metrics = useRef({
    top: 0,
    height: 0,
    viewportHeight: 0
  });

  useEffect(() => {
    // Only run scroll logic on desktop to save resources
    if (window.innerWidth < 768 || shouldReduceMotion) return;

    // 1. Measure dimensions once (or on resize)
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      metrics.current = {
        top: rect.top + scrollTop, // Absolute position in document
        height: rect.height,
        viewportHeight: window.innerHeight
      };
    };

    // 2. Pure math scroll handler
    const handleScroll = () => {
      const { top, height, viewportHeight } = metrics.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Calculate how far into the container we are
      // We want the effect to start when the container hits the top (or slightly before)
      const relativeScroll = scrollTop - top;
      
      const totalScrollableDistance = height - viewportHeight;
      
      if (totalScrollableDistance <= 0) return;

      // Calculate progress (0 to 1)
      let rawProgress = relativeScroll / totalScrollableDistance;
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // Map progress to the index range
      const totalIndices = items.length - 1;
      const mappedPos = rawProgress * totalIndices;

      setScrollPos(mappedPos);
    };

    measure(); // Initial measurement
    handleScroll(); // Initial position

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measure); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measure);
    };
  }, [items.length, shouldReduceMotion]);

  return (
    <div className={`w-full bg-brand-black text-white relative z-20 ${className}`}>
      
      {/* --- MOBILE LAYOUT (Vertical Stack) --- */}
      <div className="md:hidden flex flex-col gap-20 py-20 px-4">
        {items.map((item, i) => (
          <div key={item.id} className="flex flex-col gap-8">
            <Reveal variant="scale" width="100%">
              <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-brand-dark/50 border border-white/10 shadow-2xl relative">
                 {/* Visual Wrapper */}
                 <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="scale-75 origin-center w-full h-full flex items-center justify-center">
                      {item.visual}
                    </div>
                 </div>
                 {/* Number Watermark */}
                 <span className="absolute top-4 right-6 text-6xl font-heading font-bold text-white/5 select-none leading-none">
                    0{i + 1}
                 </span>
              </div>
            </Reveal>
            
            <Reveal variant="fade-up">
              <div className="px-2">
                <h2 className="text-3xl font-heading font-bold mb-4 text-white">
                  {item.title}
                </h2>
                <p className="text-lg text-zinc-400 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* --- DESKTOP LAYOUT (Sticky ScrollyTelling) --- */}
      <div 
        ref={containerRef} 
        className="hidden md:block relative w-full"
        // Height multiplier: 150vh per item for comfortable scroll speed
        style={{ height: `${items.length * 150}vh` }} 
      >
        <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-row bg-brand-black">
          
          {/* PROGRESS BAR (Left Edge) */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 h-64 w-[2px] bg-white/10 z-30 rounded-full">
             <div 
               className="w-full bg-[#4ADE80] rounded-full transition-all duration-100 ease-linear shadow-[0_0_15px_#4ADE80]"
               style={{ 
                 height: `${Math.min(100, Math.max(0, (scrollPos / (items.length - 1)) * 100))}%` 
               }}
             ></div>
          </div>

          {/* LEFT: Text Content */}
          <div className="w-1/2 h-full flex items-center justify-center p-20 relative z-20 pl-32">
            <div className="relative w-full max-w-lg">
              {items.map((item, i) => {
                // Calculate distance from current scroll position
                const distance = scrollPos - i;
                const absDistance = Math.abs(distance);
                
                // We introduce a "safe zone" of 0.3 units where the item is fully visible.
                const safeZone = 0.3;
                const decayRate = 2.5; // How fast it fades after the safe zone
                
                let opacity = 1;
                if (absDistance > safeZone) {
                    opacity = Math.max(0, 1 - (absDistance - safeZone) * decayRate);
                }
                
                // Blur text slightly as it leaves
                const blur = absDistance > safeZone ? (absDistance - safeZone) * 10 : 0;
                
                // Translation: Text slides up slightly as it leaves
                const translateY = distance * -30;

                // Pointer events
                const isActive = opacity > 0.1;

                return (
                  <div 
                    key={item.id}
                    className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 will-change-transform transition-opacity duration-100"
                    style={{
                      opacity: opacity,
                      filter: `blur(${blur}px)`,
                      transform: `translateY(calc(-50% + ${translateY}px))`,
                      zIndex: isActive ? 10 : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                      visibility: opacity <= 0 ? 'hidden' : 'visible'
                    }}
                  >
                    {/* Big Background Number */}
                    <span className="absolute -top-24 -left-16 text-[12rem] font-heading font-bold text-white/5 select-none -z-10 leading-none">
                      0{i + 1}
                    </span>

                    <h2 className="text-5xl lg:text-7xl font-heading font-bold mb-8 tracking-tight leading-none text-white drop-shadow-xl">
                      {item.title}
                    </h2>
                    <p className="text-xl text-zinc-300 font-medium leading-relaxed max-w-md border-l-2 border-[#4ADE80] pl-6">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Visual Morphing Area (3D Stack) */}
          <div className="w-1/2 h-full relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden perspective-[1000px]">
             
             {/* Dynamic Ambient Background Light */}
             <div 
               className="absolute w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-700 ease-out opacity-20 pointer-events-none"
               style={{ 
                 background: `radial-gradient(circle, ${scrollPos < 0.5 ? '#4ADE80' : scrollPos < 1.5 ? '#3b82f6' : '#a855f7'} 0%, transparent 70%)`,
                 transform: `translate(${Math.sin(scrollPos) * 50}px, ${Math.cos(scrollPos) * 50}px)`
               }} 
             />
             
             {/* Grid Pattern Overlay */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

             <div className="relative w-full max-w-md aspect-square md:aspect-[4/5] flex items-center justify-center">
                {items.map((item, i) => {
                  // Stack Logic
                  const offset = i - scrollPos; // Postive = Future item, Negative = Past item
                  const absOffset = Math.abs(offset);
                  
                  // Style calculation
                  let scale = 1;
                  let y = 0;
                  let rotateX = 0;
                  let opacity = 1;
                  let blur = 0;
                  let zIndex = items.length - i;

                  const safeZone = 0.25; // Wider safe zone for visuals

                  if (offset > 0) {
                      // FUTURE ITEM (Coming from bottom)
                      // It stays mostly hidden/scaled down until it enters the safe zone
                      if (offset > safeZone) {
                          scale = 0.8 + (0.2 * (1 - Math.min(1, offset)));
                          y = offset * 80;
                          rotateX = offset * -15;
                          opacity = 1 - offset * 0.8;
                      } else {
                          // Within safe zone (approaching 0), it snaps to 1
                          scale = 1;
                          y = 0;
                          rotateX = 0;
                          opacity = 1;
                      }
                      zIndex = items.length - i;
                  } else {
                      // PAST ITEM (Leaving to top)
                      // It stays clear for a bit (safe zone) then flies away
                      if (absOffset > safeZone) {
                          const decayOffset = absOffset - safeZone;
                          scale = 1 + decayOffset * 0.1;
                          y = decayOffset * -100; // Moves up
                          rotateX = decayOffset * 10;
                          opacity = 1 - decayOffset * 2;
                          blur = decayOffset * 15;
                      } else {
                          // Within safe zone
                          scale = 1;
                          y = 0;
                          rotateX = 0;
                          opacity = 1;
                          blur = 0;
                      }
                      zIndex = i; 
                  }

                  // Clamp opacity
                  opacity = Math.max(0, Math.min(1, opacity));

                  return (
                    <div 
                      key={item.id}
                      className="absolute inset-0 flex items-center justify-center will-change-transform"
                      style={{
                        opacity: opacity,
                        transform: `translateY(${y}%) scale(${scale}) perspective(1000px) rotateX(${rotateX}deg)`,
                        zIndex: zIndex,
                        filter: blur > 0 ? `blur(${blur}px)` : 'none',
                        // Add transition for smoother slight movements
                        transition: 'transform 0.1s linear, opacity 0.1s linear, filter 0.1s linear'
                      }}
                    >
                      {item.visual}
                    </div>
                  );
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScrollyTelling;
