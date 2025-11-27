import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
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
    <div className="px-2 md:px-4 pb-4 bg-brand-bg">
      <section 
        ref={containerRef} 
        className="relative py-24 px-4 md:px-10 bg-[#0A0A0A] text-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group"
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px' } as React.CSSProperties}
      >
        {/* 
            Spotlight Effect Logic:
            A radial gradient background follows the mouse via CSS variables.
        */}
        <div 
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(26, 77, 46, 0.15), transparent 40%)`
            }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-8 border-b border-white/10 pb-12">
            <div className="max-w-2xl">
                <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">SECTORS</span>
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-0">Industries We Serve</h2>
            </div>
            <p className="text-white/60 font-medium text-lg max-w-xs text-right md:text-left leading-relaxed">
                Specialized knowledge across diverse verticals ensures relevant and impactful advice.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRIES.map((ind, i) => (
              <div 
                key={i} 
                className="relative p-8 rounded-3xl bg-[#111111] hover:bg-[#161616] border border-white/5 transition-all duration-300 group/card flex flex-col items-start h-full hover:-translate-y-1 overflow-hidden"
              >
                {/* Card-specific hover glow */}
                <div className="absolute inset-0 bg-brand-moss/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-[#4ADE80] mb-6 bg-[#4ADE80]/10 border border-[#4ADE80]/20 group-hover/card:scale-105 transition-transform">
                  {React.cloneElement(ind.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <h3 className="relative z-10 text-xl font-heading font-bold text-white mb-3">{ind.title}</h3>
                <p className="relative z-10 text-zinc-400 text-sm leading-relaxed font-medium">{ind.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 flex justify-center relative z-10">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white hover:text-black transition-all duration-300 group">
                Industry not listed? Contact Us <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[#4ADE80] group-hover:text-black"/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndustrySpotlight;