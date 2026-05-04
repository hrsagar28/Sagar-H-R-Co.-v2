import React from 'react';
import { WordReveal } from '../Reveal';
import type { FolioHeroProps } from './types';
import { bgAccentClass, textAccentClass } from './accentClasses';

export const HeroFolio: React.FC<FolioHeroProps> = ({
  eyebrow,
  title,
  blurb,
  number,
  sideText,
  accentTone,
  compact = false,
}) => {
  const accentAltClass = accentTone ? textAccentClass[accentTone] : 'zone-accent-alt';
  const accentDotClass = accentTone ? bgAccentClass[accentTone] : '';

  return (
    <section
      aria-labelledby="hero-folio-title"
      className={`relative ${
        compact ? 'pb-12 pt-8 md:pb-14 md:pt-12' : 'pb-20 pt-32 md:pt-48'
      } zone-bg zone-text overflow-hidden px-4 md:px-12`}
    >
      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-stretch md:flex-row">
        <div
          className={`hidden w-1/4 items-start md:flex ${accentAltClass} animate-fade-in-up select-none font-serif text-display-xl italic leading-none opacity-80`}
          aria-hidden="true"
        >
          {number}
        </div>

        <div className="flex w-full flex-col justify-center md:w-2/4">
          {eyebrow && (
            <div className="mb-8 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]">{eyebrow}</div>
          )}
          <h1
            id="hero-folio-title"
            className="mb-8 animate-fade-in-up text-balance font-heading text-display-md leading-[1] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
            style={{ animationDelay: '0.1s' }}
          >
            <WordReveal>{title}</WordReveal>
          </h1>
          {blurb && <p className="zone-text-muted max-w-lg text-lead leading-relaxed">{blurb}</p>}
        </div>

        <div className="hidden w-1/4 items-end justify-end pb-8 md:flex">
          {sideText && (
            <>
              <span className="sr-only">{sideText}</span>
              <div
                className="zone-text-muted animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', animationDelay: '0.3s' }}
                aria-hidden="true"
              >
                {sideText}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`container relative mx-auto max-w-7xl ${compact ? 'mt-10 md:mt-12' : 'mt-20'}`}>
        <div className="zone-hairline flex h-px w-full items-center justify-between" aria-hidden="true">
          <div
            className={`h-2 w-2 rounded-full ${accentDotClass} -translate-x-1`}
            style={!accentTone ? { backgroundColor: 'var(--zone-accent-alt)' } : {}}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${accentDotClass} translate-x-1`}
            style={!accentTone ? { backgroundColor: 'var(--zone-accent-alt)' } : {}}
          ></div>
        </div>
      </div>
    </section>
  );
};
