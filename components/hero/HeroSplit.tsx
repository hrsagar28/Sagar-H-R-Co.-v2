import React from 'react';
import { WordReveal } from '../Reveal';
import type { SplitHeroProps } from './types';
import { Crosshair } from '../ui/Crosshair';
import { textAccentClass } from './accentClasses';

export const HeroSplit: React.FC<SplitHeroProps> = ({ eyebrow, title, blurb, meta, accentTone }) => {
  const accentClass = accentTone ? textAccentClass[accentTone] : 'zone-accent';

  return (
    <section
      aria-labelledby="hero-split-title"
      className="zone-bg zone-text zone-border relative overflow-hidden border-b px-4 pb-20 pt-32 md:px-12 md:pt-48"
    >
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="relative border border-transparent">
          <Crosshair position="tl" />
          <Crosshair position="tr" />
          <Crosshair position="bl" />
          <Crosshair position="br" />

          <div className="relative flex flex-col md:flex-row">
            <div className="zone-hairline absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 md:block"></div>

            <div className="zone-border relative mb-12 border-b pb-12 pr-0 md:mb-0 md:w-1/2 md:border-b-0 md:pb-0 md:pr-16">
              {eyebrow && (
                <div className="mb-8 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]">
                  {eyebrow}
                </div>
              )}
              {/* Audit MA-04: WordReveal is the headline's only entrance —
                  the block-level animate-fade-in-up was removed. */}
              <h1
                id="hero-split-title"
                className="text-balance font-heading text-display-md leading-[1] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
              >
                <WordReveal>{title}</WordReveal>
              </h1>
            </div>

            <div className="flex flex-col justify-end pl-0 md:w-1/2 md:pl-16">
              {blurb && (
                <p
                  className="zone-text-muted mb-16 max-w-lg animate-fade-in-up text-lead leading-relaxed"
                  style={{ animationDelay: '0.2s' }}
                >
                  {blurb}
                </p>
              )}

              <div
                className={`grid grid-cols-2 gap-8 ${meta.length > 2 ? 'grid-rows-2' : 'grid-rows-1'} animate-fade-in-up`}
                style={{ animationDelay: '0.3s' }}
              >
                {meta.map((m, i) => (
                  <div key={i} className="zone-border flex flex-col gap-2 border-t pt-4">
                    <span className={`font-mono text-eyebrow uppercase tracking-[0.2em] ${accentClass}`}>
                      {m.label}
                    </span>
                    <span className="font-heading text-[1.5rem] leading-snug [&_em]:font-serif [&_em]:font-normal [&_em]:italic">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
