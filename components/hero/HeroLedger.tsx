import React from 'react';
import { WordReveal } from '../Reveal';
import type { LedgerHeroProps } from './types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

export const HeroLedger: React.FC<LedgerHeroProps> = ({ eyebrow, title, blurb, stats, ctaLabel, ctaHref, accentTone }) => {
  const accentClass = accentTone ? `text-brand-${accentTone}` : 'zone-accent';
  const borderClass = accentTone ? `border-brand-${accentTone}` : 'border-t-transparent'; // Fallback logic handled in inline styles for dynamic zone vars if needed.
  
  return (
    <section aria-labelledby="hero-ledger-title" className="relative pt-32 md:pt-48 pb-20 px-4 md:px-12 zone-bg zone-text overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-between pt-32 pb-20">
         {[...Array(8)].map((_, i) => (
           <div key={i} className="h-px w-full zone-hairline opacity-50"></div>
         ))}
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col gap-16 md:gap-24">
         
         <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="md:w-3/5">
                {eyebrow && (
                   <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                      {eyebrow}
                   </div>
                )}
                <h1 id="hero-ledger-title" className="font-heading text-display-md leading-[1] tracking-[-0.02em] text-balance animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
                </h1>
            </div>
            <div className="md:w-2/5 flex gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               {stats.map((stat, i) => (
                 <div 
                   key={i} 
                   className={`flex flex-col pl-4 border-l ${accentTone ? borderClass : ''}`}
                   style={!accentTone ? { borderLeftColor: 'var(--zone-accent)' } : {}}
                  >
                    <span className="font-heading text-display-sm leading-none mb-2">{stat.num}</span>
                    <span className="font-mono text-eyebrow uppercase tracking-[0.2em] zone-text-muted">{stat.label}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-t zone-border pt-8">
            <div className="md:w-1/2">
               {blurb && (
                 <p className="text-lead zone-text-muted leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {blurb}
                 </p>
               )}
            </div>
            <div className="md:w-1/4 flex justify-end animate-fade-in-up w-full" style={{ animationDelay: '0.4s' }}>
               {ctaLabel && (
                  <Link 
                    to={ctaHref || '#'} 
                    className={`group block w-full text-center py-6 border-y ${accentTone ? borderClass : ''} ${accentClass} font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300`}
                    style={!accentTone ? { borderTopColor: 'var(--zone-accent)', borderBottomColor: 'var(--zone-accent)' } : {}}
                  >
                     <span className="relative z-10 transition-colors duration-300" style={{ color: 'inherit' }}>{ctaLabel}</span>
                     {/* The simplest cross-browser way to invert colors with CSS vars is using an absolute pseudo-element or just simple react state, but we'll stick to CSS hover. 
                         Since we can't reliably do hover:bg-[var(--zone-accent)] in arbitrary values safely across all tailwind versions, we'll use a style hack: */}
                     <style>{`
                       .group:hover .relative.z-10 { color: ${accentTone ? 'var(--brand-surface)' : 'var(--zone-bg)'} !important; }
                       .group { position: relative; overflow: hidden; }
                       .group::after { content: ''; position: absolute; inset: 0; background: ${accentTone ? `var(--brand-${accentTone})` : 'var(--zone-accent)'}; transform: scaleY(0); transform-origin: bottom; transition: transform 0.3s ease; z-index: 0; }
                       .group:hover::after { transform: scaleY(1); }
                     `}</style>
                  </Link>
               )}
            </div>
         </div>

      </div>
    </section>
  );
};

