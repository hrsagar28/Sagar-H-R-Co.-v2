import React, { useRef, useEffect } from 'react';
import { INDUSTRIES } from '../constants';

const IndustrySpotlight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smooth updates without layout thrashing
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        container.style.setProperty('--mouse-x', `${x}px`);
        container.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative bg-[#050505] text-white py-32 px-4 overflow-hidden group"
      style={{ '--mouse-x': '-500px', '--mouse-y': '-500px' } as React.CSSProperties}
    >
       {/* 
          Spotlight Effect Logic:
          A radial gradient background follows the mouse via CSS variables.
          We use mix-blend-mode to "light up" the content or create a glow.
          The 'after' pseudo-element creates the glow.
       */}
       <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(26, 77, 46, 0.15), transparent 40%)`
          }}
       />

       <div className="container mx-auto max-w-7xl relative z-10">
          <div className="mb-20">
             <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Sectors</span>
             <h2 className="text-5xl md:text-7xl font-heading font-bold mt-4 text-zinc-100">
                Industry Expertise
             </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             {INDUSTRIES.map((ind, i) => (
                <div 
                  key={i} 
                  className="relative p-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition-colors hover:border-brand-moss/50 hover:bg-white/10 group/card"
                >
                   {/* Card-specific hover glow */}
                   <div className="absolute inset-0 bg-brand-moss/20 blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                   
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="text-green-500 mb-6 group-hover/card:scale-110 transition-transform duration-300 origin-left">
                          {React.cloneElement(ind.icon as React.ReactElement<any>, { size: 32 })}
                      </div>
                      <div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{ind.title}</h3>
                          <p className="text-xs md:text-sm text-zinc-400 group-hover/card:text-zinc-200 transition-colors leading-relaxed">
                            {ind.description}
                          </p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default IndustrySpotlight;