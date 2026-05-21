import React from 'react';
import { WordReveal } from '../Reveal';
import type { FrontispieceHeroProps } from './types';
import { textAccentClass } from './accentClasses';

export const HeroFrontispiece: React.FC<FrontispieceHeroProps> = ({
  eyebrow,
  title,
  blurb,
  metaStrip,
  accentTone = 'rust',
}) => {
  const accentClass = textAccentClass[accentTone];

  return (
    <section
      aria-labelledby="hero-frontispiece-title"
      className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-40 text-center md:px-12 md:pt-56"
    >
      <div id="frontispiece-section" className="zone-bg zone-text absolute inset-0 z-0 transition-colors duration-500">
        <div className="zone-border pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-50"></div>
        <div className="zone-border pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-30"></div>
      </div>

      <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        {eyebrow && (
          <div
            className="mb-6 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]"
            style={{ animationDelay: '0.1s' }}
          >
            {eyebrow}
          </div>
        )}

        {/* Audit MA-04: WordReveal is the headline's only entrance. */}
        <h1
          id="hero-frontispiece-title"
          className="mb-8 text-balance font-heading text-display-lg leading-[0.95] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
        >
          <WordReveal>{title}</WordReveal>
        </h1>

        {blurb && (
          <p
            className="zone-text-muted mb-16 max-w-2xl animate-fade-in-up text-lead leading-relaxed"
            style={{ animationDelay: '0.3s' }}
          >
            {blurb}
          </p>
        )}

        {metaStrip && metaStrip.length > 0 && (
          <div
            className="flex animate-fade-in-up flex-wrap justify-center gap-x-8 gap-y-4"
            style={{ animationDelay: '0.4s' }}
          >
            {metaStrip.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                {i > 0 && <span className={`h-1 w-1 rounded-full bg-brand-stone opacity-30`}></span>}
                <span className={`font-mono text-xs uppercase tracking-[0.15em] ${accentClass}`}>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
