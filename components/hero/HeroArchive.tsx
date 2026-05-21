import React from 'react';
import { WordReveal } from '../Reveal';
import type { ArchiveHeroProps } from './types';
import { Link } from 'react-router-dom';

export const HeroArchive: React.FC<ArchiveHeroProps> = ({ eyebrow, title, blurb, items, totalLabel }) => {
  return (
    <section
      aria-labelledby="hero-archive-title"
      className="zone-bg zone-text relative overflow-hidden px-4 pb-20 pt-32 md:px-12 md:pt-48"
    >
      <div className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-16 md:flex-row md:gap-24">
        <div className="zone-border flex flex-col items-start border-b pb-12 pr-0 md:w-5/12 md:border-b-0 md:border-r md:pb-0 md:pr-16">
          {eyebrow && (
            <div className="mb-8 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]">{eyebrow}</div>
          )}
          {/* Audit MA-04: WordReveal is the headline's only entrance. */}
          <h1
            id="hero-archive-title"
            className="mb-8 text-balance font-heading text-display-md leading-[1] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
          >
            <WordReveal>{title}</WordReveal>
          </h1>
          {blurb && (
            <p
              className="zone-text-muted animate-fade-in-up text-lead leading-relaxed"
              style={{ animationDelay: '0.2s' }}
            >
              {blurb}
            </p>
          )}
          {totalLabel && (
            <div
              className="zone-text-muted mt-12 animate-fade-in-up font-mono text-xs uppercase tracking-[0.2em]"
              style={{ animationDelay: '0.3s' }}
            >
              [{totalLabel}]
            </div>
          )}
        </div>

        <div className="flex flex-col md:w-7/12">
          <div className="zone-border flex animate-fade-in-up flex-col border-t" style={{ animationDelay: '0.4s' }}>
            {items.map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className="archive-item zone-border group grid grid-cols-[60px_1fr_auto] items-center gap-6 border-b py-6"
              >
                <div className="zone-text-muted font-mono text-xs">{item.num}</div>
                <div
                  className="group-hover:zone-text font-heading text-lg transition-colors [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
                  style={{ color: 'var(--zone-accent)' }}
                >
                  <span className="text-[var(--zone-text)] transition-colors group-hover:text-[var(--zone-accent)]">
                    {item.title}
                  </span>
                </div>
                <div className="zone-text-muted text-right font-mono text-xs uppercase tracking-[0.15em]">
                  {item.date}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
