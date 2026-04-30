import React from 'react';
import { WordReveal } from '../Reveal';
import type { SplitHeroProps } from './types';
import { Crosshair } from '../ui/Crosshair';

export const HeroSplit: React.FC<SplitHeroProps> = ({ eyebrow, title, blurb, meta, accentTone }) => {
  const accentClass = accentTone ? `text-brand-${accentTone}` : 'zone-accent';
  
  return (
    <section aria-labelledby="hero-split-title" className="relative pt-32 md:pt-48 pb-20 px-4 md:px-12 zone-bg zone-text overflow-hidden border-b zone-border">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        <div className="relative border border-transparent">
           <Crosshair position="tl" />
           <Crosshair position="tr" />
           <Crosshair position="bl" />
           <Crosshair position="br" />
           
           <div className="flex flex-col md:flex-row relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px zone-hairline -translate-x-1/2"></div>
              
              <div className="md:w-1/2 pr-0 md:pr-16 pb-12 md:pb-0 mb-12 md:mb-0 border-b md:border-b-0 zone-border relative">
                 {eyebrow && (
                    <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                       {eyebrow}
                    </div>
                 )}
                 <h1 id="hero-split-title" className="font-heading text-display-md leading-[1] tracking-[-0.02em] text-balance animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
                 </h1>
              </div>

              <div className="md:w-1/2 pl-0 md:pl-16 flex flex-col justify-end">
                {blurb && (
                  <p className="text-lead zone-text-muted mb-16 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {blurb}
                  </p>
                )}
                
                <div className={`grid grid-cols-2 gap-8 ${meta.length > 2 ? 'grid-rows-2' : 'grid-rows-1'} animate-fade-in-up`} style={{ animationDelay: '0.3s' }}>
                   {meta.map((m, i) => (
                     <div key={i} className="flex flex-col gap-2 border-t zone-border pt-4">
                        <span className={`font-mono text-eyebrow uppercase tracking-[0.2em] ${accentClass}`}>{m.label}</span>
                        <span className="font-heading text-[1.5rem] leading-snug [&_em]:font-serif [&_em]:italic [&_em]:font-normal">
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

