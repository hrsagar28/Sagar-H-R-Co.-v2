import React, { useState, useRef, useEffect } from 'react';
import { INDUSTRIES } from '../constants';

const IndustrySpotlight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 }); // Start off-screen
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
     setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative bg-black text-white py-32 px-4 overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
       <div className="container mx-auto max-w-7xl relative z-20">
          <div className="mb-20">
             <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Sectors</span>
             <h2 className="text-5xl md:text-7xl font-heading font-bold mt-4 text-zinc-800">
                Industry Expertise
             </h2>
          </div>

          {/* Base Layer (Dark/Hidden) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 opacity-20 pointer-events-none">
             {INDUSTRIES.map((ind, i) => (
                <div key={i} className="border border-zinc-800 p-8 rounded-3xl aspect-square flex flex-col justify-end">
                   <span className="text-2xl font-bold text-zinc-700">{ind.title}</span>
                </div>
             ))}
          </div>
       </div>

       {/* Spotlight Layer (Revealed) */}
       <div 
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
             background: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0) 10%, rgba(0,0,0,0.98) 100%)`
          }}
       ></div>
       
       {/* Content that lights up (Duplicate Grid on top) */}
       <div 
         className="absolute inset-0 z-10 flex items-center justify-center py-32 px-4"
         style={{
             maskImage: isTouch ? 'none' : `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`,
             WebkitMaskImage: isTouch ? 'none' : `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 100%, transparent 100%)`
         }}
       >
          <div className="container mx-auto max-w-7xl h-full">
              <div className="mb-20">
                <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Sectors</span>
                <h2 className="text-5xl md:text-7xl font-heading font-bold mt-4 text-white">
                    Industry Expertise
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {INDUSTRIES.map((ind, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-700 p-8 rounded-3xl aspect-square flex flex-col justify-between hover:bg-zinc-800 transition-colors">
                        <div className="text-green-400">
                            {React.cloneElement(ind.icon as React.ReactElement<any>, { size: 32 })}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{ind.title}</h3>
                            <p className="text-xs md:text-sm text-zinc-400">{ind.description}</p>
                        </div>
                    </div>
                ))}
              </div>
          </div>
       </div>
       
       {/* Flashlight Glow at cursor */}
       {!isTouch && (
         <div 
            className="absolute w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePos.x, top: mousePos.y }}
         ></div>
       )}
    </div>
  );
};

export default IndustrySpotlight;