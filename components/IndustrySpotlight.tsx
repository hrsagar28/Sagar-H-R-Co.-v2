import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { INDUSTRIES } from '../constants';
import { useSpotlight } from '../hooks';
import Reveal from './Reveal';

const { Link } = ReactRouterDOM;

interface IndustrySpotlightProps {
  variant?: 'default' | 'compact';
}

export const IndustryChips: React.FC = () => (
  <section className="py-24 px-4 md:px-6 bg-brand-bg relative overflow-hidden">
    <div className="container mx-auto max-w-6xl text-center">
      <Reveal variant="fade-up">
        <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-6 block">Sectors We Serve</span>
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-12">
          Expertise across <span className="font-serif italic font-normal text-brand-stone">industries.</span>
        </h2>
      </Reveal>

      <div className="flex flex-wrap justify-center gap-4">
        {INDUSTRIES.map((ind, index) => (
          <Reveal key={ind.title} delay={index * 0.05} variant="scale" width="fit-content">
            <div className="group flex items-center gap-3 pl-2 pr-6 py-2 bg-white border border-brand-border rounded-full hover:border-brand-moss hover:shadow-lg hover:shadow-brand-moss/10 transition-all duration-300 cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-moss group-hover:bg-brand-moss group-hover:text-white transition-colors">
                {React.cloneElement(ind.icon as React.ReactElement<{ size?: number }>, { size: 18 })}
              </div>
              <span className="text-sm font-bold text-brand-dark group-hover:text-brand-moss transition-colors">
                {ind.title}
              </span>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.4} variant="scale" width="fit-content">
          <Link to="/services" className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-dark text-white font-bold text-sm hover:bg-brand-moss transition-all shadow-md group">
            View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </Reveal>
      </div>
    </div>
  </section>
);

export const IndustryGridDark: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  useSpotlight(containerRef);

  return (
    <div className="px-2 md:px-4 pb-4 bg-brand-bg">
      <section
        ref={containerRef}
        className="relative py-24 px-4 md:px-10 bg-brand-black text-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group"
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px' } as React.CSSProperties}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(184, 146, 76, 0.15), transparent 40%)' }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-8 border-b border-white/10 pb-12">
            <div className="max-w-2xl">
              <span className="text-brand-brass font-bold tracking-widest uppercase text-xs mb-4 block">SECTORS</span>
              <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-0">Industries We Serve</h2>
            </div>
            <p className="text-white/60 font-medium text-lg max-w-xs text-left leading-relaxed">
              Specialized knowledge across diverse verticals ensures relevant and impactful advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRIES.map((ind) => (
              <Link key={ind.title} to="/contact" className="relative p-8 rounded-[2rem] bg-brand-dark hover:bg-brand-surface-dark-hover border border-white/5 transition-all duration-300 group/card flex flex-col items-start h-full hover:-translate-y-1 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-brass" aria-label={`Discuss ${ind.title} services`}>
                <div className="absolute inset-0 bg-brand-brass/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-brand-brass mb-6 bg-brand-brass/10 border border-brand-brass/20 group-hover/card:scale-105 transition-transform">
                  {React.cloneElement(ind.icon as React.ReactElement<{ size?: number }>, { size: 24 })}
                </div>
                <h3 className="relative z-10 text-xl font-heading font-bold text-white mb-3">{ind.title}</h3>
                <p className="relative z-10 text-zinc-300 text-sm leading-relaxed font-medium">{ind.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-20 flex justify-center relative z-10">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white hover:text-black transition-all duration-300 group">
              Industry not listed? Contact Us <ArrowUpRight size={16} className="text-brand-brass group-hover:text-brand-moss group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" aria-hidden="true" focusable={false} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const IndustrySpotlight: React.FC<IndustrySpotlightProps> = ({ variant = 'default' }) => (
  variant === 'compact' ? <IndustryChips /> : <IndustryGridDark />
);

export default IndustrySpotlight;
