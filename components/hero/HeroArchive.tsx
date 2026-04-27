import React from 'react';
import { WordReveal } from '../Reveal';
import type { ArchiveHeroProps } from './types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

export const HeroArchive: React.FC<ArchiveHeroProps> = ({ eyebrow, title, blurb, items, totalLabel, accentTone }) => {
  return (
    <section aria-labelledby="hero-archive-title" className="relative pt-32 md:pt-48 pb-20 px-4 md:px-12 zone-bg zone-text overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row gap-16 md:gap-24">
         
         <div className="md:w-5/12 flex flex-col items-start border-b md:border-b-0 md:border-r zone-border pr-0 md:pr-16 pb-12 md:pb-0">
            {eyebrow && (
               <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                  {eyebrow}
               </div>
            )}
            <h1 id="hero-archive-title" className="font-heading text-display-md leading-[1] tracking-[-0.02em] text-balance mb-8 animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
            </h1>
            {blurb && (
               <p className="text-lead zone-text-muted leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {blurb}
               </p>
            )}
            {totalLabel && (
               <div className="mt-12 font-mono text-xs uppercase tracking-[0.2em] zone-text-muted animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  [{totalLabel}]
               </div>
            )}
         </div>

         <div className="md:w-7/12 flex flex-col">
            <style>{`
              .archive-item:hover { transform: translateX(0.5rem); }
              .archive-item { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
              :root .archive-item:hover { background: linear-gradient(to right, rgba(26, 77, 46, 0.05), transparent); }
              [data-zone="editorial"] .archive-item:hover { background: linear-gradient(to right, rgba(184, 146, 76, 0.1), transparent); }
              [data-zone="editorial-paper"] .archive-item:hover { background: linear-gradient(to right, rgba(139, 58, 47, 0.05), transparent); }
            `}</style>
            
            <div className="flex flex-col border-t zone-border animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
               {items.map((item, i) => (
                  <Link 
                     key={i} 
                     to={item.href}
                     className="archive-item grid grid-cols-[60px_1fr_auto] items-center gap-6 py-6 border-b zone-border group"
                  >
                     <div className="font-mono text-xs zone-text-muted">
                        {item.num}
                     </div>
                     <div className="font-heading text-lg group-hover:zone-text transition-colors [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ color: 'var(--zone-accent)' }}>
                        <span className="text-[var(--zone-text)] transition-colors group-hover:text-[var(--zone-accent)]">{item.title}</span>
                     </div>
                     <div className="font-mono text-xs zone-text-muted uppercase tracking-[0.15em] text-right">
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

