import React from 'react';
import { WordReveal } from '../Reveal';
import type { LedgerHeroProps } from './types';
import { Link } from 'react-router-dom';
import { borderAccentClass, ledgerCtaAccentClass, textAccentClass } from './accentClasses';

export const HeroLedger: React.FC<LedgerHeroProps> = ({
  eyebrow,
  title,
  blurb,
  stats,
  ctaLabel,
  ctaHref,
  accentTone,
}) => {
  const accentClass = accentTone ? textAccentClass[accentTone] : 'zone-accent';
  const borderClass = accentTone ? borderAccentClass[accentTone] : 'border-t-transparent';
  const ctaAccentClass = accentTone ? ledgerCtaAccentClass[accentTone] : 'hero-ledger-cta-zone';

  return (
    <section
      aria-labelledby="hero-ledger-title"
      className="zone-bg zone-text relative overflow-hidden px-4 pb-20 pt-32 md:px-12 md:pt-48"
    >
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-between pb-20 pt-32">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="zone-hairline h-px w-full opacity-50"></div>
        ))}
      </div>

      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-16 md:gap-24">
        <div className="flex flex-col items-end justify-between gap-12 md:flex-row">
          <div className="md:w-3/5">
            {eyebrow && (
              <div className="mb-8 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]">{eyebrow}</div>
            )}
            <h1
              id="hero-ledger-title"
              className="animate-fade-in-up text-balance font-heading text-display-md leading-[1] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
              style={{ animationDelay: '0.1s' }}
            >
              <WordReveal>{title}</WordReveal>
            </h1>
          </div>
          <div className="flex animate-fade-in-up gap-8 md:w-2/5" style={{ animationDelay: '0.2s' }}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col border-l pl-4 ${accentTone ? borderClass : ''}`}
                style={!accentTone ? { borderLeftColor: 'var(--zone-accent)' } : {}}
              >
                <span className="mb-2 font-heading text-display-sm leading-none">{stat.num}</span>
                <span className="zone-text-muted font-mono text-eyebrow uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="zone-border flex flex-col items-center justify-between gap-12 border-t pt-8 md:flex-row">
          <div className="md:w-1/2">
            {blurb && (
              <p
                className="zone-text-muted animate-fade-in-up text-lead leading-relaxed"
                style={{ animationDelay: '0.3s' }}
              >
                {blurb}
              </p>
            )}
          </div>
          <div className="flex w-full animate-fade-in-up justify-end md:w-1/4" style={{ animationDelay: '0.4s' }}>
            {ctaLabel && (
              <Link
                to={ctaHref || '#'}
                className={`hero-ledger-cta group block w-full border-y py-6 text-center ${accentTone ? borderClass : ''} ${accentClass} font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${ctaAccentClass}`}
                style={
                  !accentTone ? { borderTopColor: 'var(--zone-accent)', borderBottomColor: 'var(--zone-accent)' } : {}
                }
              >
                <span className="relative z-10 transition-colors duration-300" style={{ color: 'inherit' }}>
                  {ctaLabel}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
