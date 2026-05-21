import React, { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { INDUSTRIES } from '../constants';
import { useSpotlight } from '../hooks';
import Reveal from './Reveal';

interface IndustrySpotlightProps {
  variant?: 'default' | 'compact';
}

export const IndustryChips: React.FC = () => (
  <section className="relative overflow-hidden bg-brand-bg px-4 py-24 md:px-6">
    <div className="container mx-auto max-w-6xl text-center">
      <Reveal variant="fade-up">
        <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-brand-moss">Sectors We Serve</span>
        <h2 className="mb-12 font-heading text-4xl font-bold text-brand-dark md:text-5xl">
          Expertise across <span className="font-serif font-normal italic text-brand-stone">industries.</span>
        </h2>
      </Reveal>

      <div className="flex flex-wrap justify-center gap-4">
        {INDUSTRIES.map((ind, index) => (
          <Reveal key={ind.title} delay={index * 0.05} variant="scale" width="fit-content">
            <div className="group flex cursor-default items-center gap-3 rounded-full border border-brand-border bg-white py-2 pl-2 pr-6 transition-[border-color,box-shadow] duration-300 hover:border-brand-moss hover:shadow-lg hover:shadow-brand-moss/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg text-brand-moss transition-colors group-hover:bg-brand-moss group-hover:text-white">
                <ind.Icon size={18} aria-hidden="true" focusable={false} />
              </div>
              <span className="text-sm font-bold text-brand-dark transition-colors group-hover:text-brand-moss">
                {ind.title}
              </span>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.4} variant="scale" width="fit-content">
          <Link
            to="/services"
            className="group flex items-center gap-2 rounded-full bg-brand-dark px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-brand-moss"
          >
            View All{' '}
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
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
    <div className="bg-brand-bg px-2 pb-4 md:px-4">
      <section
        ref={containerRef}
        className="group relative overflow-hidden rounded-[2.5rem] bg-brand-black px-4 py-24 text-white md:rounded-[3rem] md:px-10"
        style={{ '--mouse-x': '-500px', '--mouse-y': '-500px' } as CSSProperties}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(184, 146, 76, 0.15), transparent 40%)',
          }}
        />

        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-start">
            <div className="max-w-2xl">
              <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-brass">SECTORS</span>
              <h2 className="mb-0 font-heading text-4xl font-bold text-white md:text-6xl">Industries We Serve</h2>
            </div>
            <p className="max-w-xs text-left text-lg font-medium leading-relaxed text-white/60">
              Specialized knowledge across diverse verticals ensures relevant and impactful advice.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((ind) => (
              <Link
                key={ind.title}
                to="/contact"
                className="group/card relative flex h-full flex-col items-start overflow-hidden rounded-[2rem] border border-white/5 bg-brand-dark p-8 transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-brand-surface-dark-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-brass"
                aria-label={`Discuss ${ind.title} services`}
              >
                <div className="pointer-events-none absolute inset-0 bg-brand-brass/5 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
                <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-brass/20 bg-brand-brass/10 text-brand-brass transition-transform group-hover/card:scale-105">
                  <ind.Icon size={24} aria-hidden="true" focusable={false} />
                </div>
                <h3 className="relative z-10 mb-3 font-heading text-xl font-bold text-white">{ind.title}</h3>
                <p className="relative z-10 text-sm font-medium leading-relaxed text-zinc-300">{ind.description}</p>
              </Link>
            ))}
          </div>

          <div className="relative z-10 mt-20 flex justify-center">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Industry not listed? Contact Us{' '}
              <ArrowUpRight
                size={16}
                className="text-brand-brass transition-[transform,color] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-moss"
                aria-hidden="true"
                focusable={false}
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const IndustrySpotlight: React.FC<IndustrySpotlightProps> = ({ variant = 'default' }) =>
  variant === 'compact' ? <IndustryChips /> : <IndustryGridDark />;

export default IndustrySpotlight;
