
import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

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

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress relative to the container
      // Container height is set to multiple viewports to allow scrolling time
      const offsetTop = rect.top;
      const totalScrollableDistance = rect.height - viewportHeight;
      
      // Calculate progress (0 to 1) through the container
      let rawProgress = -offsetTop / totalScrollableDistance;
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // Map progress to the index range (e.g., 0.0 to 2.0 for 3 items)
      // We add a little buffer at the end to ensure the last item stays fully visible for a bit
      const totalIndices = items.length - 1;
      const mappedPos = rawProgress * totalIndices;

      setScrollPos(mappedPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full bg-brand-black text-white ${className}`}
      // Height multiplier: more height = slower animation speed
      style={{ height: `${items.length * 100 + 50}vh` }} 
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col md:flex-row">
        
        {/* PROGRESS BAR (Left Edge) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-48 w-[2px] bg-white/10 hidden md:block z-30 rounded-full">
           <div 
             className="w-full bg-[#4ADE80] rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_#4ADE80]"
             style={{ 
               height: `${Math.min(100, Math.max(0, (scrollPos / (items.length - 1)) * 100))}%` 
             }}
           ></div>
        </div>

        {/* LEFT: Text Content */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-8 md:p-20 relative z-20">
          <div className="relative w-full max-w-lg">
            {items.map((item, i) => {
              // Calculate distance from current scroll position
              const distance = scrollPos - i;
              
              // Only active if we are roughly within range [-0.5, 0.5] of this index
              // But for smoothness, we interpolate opacity
              // 0 means active. 
              
              // Opacity logic: 
              // 1 when distance is 0. 
              // 0 when distance is > 0.6 or < -0.6
              const opacity = Math.max(0, 1 - Math.abs(distance) * 2);
              
              // Blur logic
              const blur = Math.abs(distance) * 20;
              
              // Translation: Text slides up slightly as it leaves
              const translateY = distance * -50;

              // Pointer events
              const isActive = opacity > 0.5;

              return (
                <div 
                  key={item.id}
                  className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 will-change-transform"
                  style={{
                    opacity: opacity,
                    filter: `blur(${blur}px)`,
                    transform: `translateY(calc(-50% + ${translateY}px))`,
                    zIndex: isActive ? 10 : 0,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  {/* Big Background Number */}
                  <span className="absolute -top-20 -left-10 text-[10rem] font-heading font-bold text-white/5 select-none -z-10 leading-none">
                    0{i + 1}
                  </span>

                  <h2 className="text-4xl md:text-7xl font-heading font-bold mb-6 tracking-tight leading-none text-white drop-shadow-xl">
                    {item.title}
                  </h2>
                  <p className="text-lg md:text-2xl text-zinc-300 font-medium leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Visual Morphing Area (3D Stack) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden perspective-[1000px]">
           
           {/* Dynamic Ambient Background Light */}
           <div 
             className="absolute w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-700 ease-out opacity-20 pointer-events-none"
             style={{ 
               background: `radial-gradient(circle, ${scrollPos < 0.5 ? '#4ADE80' : scrollPos < 1.5 ? '#3b82f6' : '#a855f7'} 0%, transparent 70%)`,
               transform: `translate(${Math.sin(scrollPos) * 100}px, ${Math.cos(scrollPos) * 100}px)`
             }} 
           />
           
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

           <div className="relative w-full max-w-md aspect-square md:aspect-[4/5] flex items-center justify-center">
              {items.map((item, i) => {
                // Stack Logic
                const offset = i - scrollPos; // Postive = Future item, Negative = Past item
                
                // Style calculation
                let scale = 1;
                let y = 0;
                let rotateX = 0;
                let opacity = 1;
                let zIndex = items.length - i; // Natural stack order

                if (offset > 0) {
                    // FUTURE ITEM (Coming from bottom)
                    // Scale down slightly, pushed down, faded out
                    // It enters 'stage' as offset approaches 0
                    scale = 0.8 + (0.2 * (1 - Math.min(1, offset))); // 0.8 -> 1
                    y = offset * 100; // 100% -> 0% (relative to container really, but using px for simplicity)
                    rotateX = offset * -10; // Tilted back
                    opacity = 1 - offset; // Fade in as it arrives
                    zIndex = items.length - i;
                } else {
                    // PAST ITEM (Leaving to top)
                    // Scale up slightly and fade out quickly
                    scale = 1 + Math.abs(offset) * 0.1;
                    y = offset * 100; // Moves up (negative y)
                    rotateX = offset * 10; // Tilted forward
                    opacity = 1 - Math.abs(offset) * 1.5; // Fade out faster
                    zIndex = i; // Lower z-index so next item covers it? No, previous item should fade away *behind* or *above*?
                    // Let's make it fade away 'into the camera' (blur)
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
                      filter: offset < 0 ? `blur(${Math.abs(offset) * 10}px)` : 'none'
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
  );
};

export default ScrollyTelling;
