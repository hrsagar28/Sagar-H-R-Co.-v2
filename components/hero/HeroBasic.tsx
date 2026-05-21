import React from 'react';
import { WordReveal } from '../Reveal';
import { Eyebrow } from '../ui/Eyebrow';
import { AccentTitle } from '../ui/AccentTitle';
import type { BasicHeroProps } from './types';

export const HeroBasic: React.FC<BasicHeroProps & { className?: string; children?: React.ReactNode }> = ({
  tag,
  title,
  subtitle,
  description,
  blurb,
  eyebrow,
  className = '',
  children,
}) => {
  const displayTag = tag || eyebrow;
  const displayDesc = description || blurb;

  return (
    <section className={`relative overflow-hidden bg-brand-bg px-4 pb-20 pt-32 md:px-6 md:pt-48 ${className}`}>
      {/* Faded Grid Background */}
      <div
        className="bg-grid pointer-events-none absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      />
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="max-w-5xl">
          {displayTag && <Eyebrow className="mb-8 animate-fade-in-up">{displayTag}</Eyebrow>}
          {/* Audit MA-04: the title's entrance is now WordReveal alone — the
              block-level `animate-fade-in-up` was removed so the headline no
              longer plays two stacked entrances. The optional ghost subtitle
              keeps a single fade of its own. */}
          <AccentTitle className="mb-10 text-6xl text-brand-dark md:text-8xl lg:text-9xl">
            <WordReveal>{title}</WordReveal>
            {subtitle && (
              <>
                <br />
                <span
                  className="inline-block animate-fade-in-up font-serif font-normal italic text-brand-stone opacity-60"
                  style={{ animationDelay: '0.25s' }}
                >
                  {subtitle}
                </span>
              </>
            )}
          </AccentTitle>
          {displayDesc && (
            <p
              className="max-w-2xl animate-fade-in-up text-xl font-medium leading-relaxed text-brand-stone md:text-2xl"
              style={{ animationDelay: '0.2s' }}
            >
              {displayDesc}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
};
