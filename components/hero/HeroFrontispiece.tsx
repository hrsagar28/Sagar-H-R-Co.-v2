import React from 'react';
import { WordReveal } from '../Reveal';
import type { FrontispieceHeroProps } from './types';

export const HeroFrontispiece: React.FC<FrontispieceHeroProps> = ({ eyebrow, title, blurb, metaStrip, accentTone = 'rust' }) => {
  const accentClass = `text-brand-${accentTone}`; 
  
  return (
    <section aria-labelledby="hero-frontispiece-title" className="relative pt-40 md:pt-56 pb-24 px-4 md:px-12 overflow-hidden flex flex-col items-center justify-center text-center">
      <style>{`
        [data-zone="editorial"] #frontispiece-section { background-color: var(--brand-rust); color: var(--brand-paper); }
        [data-zone="editorial-paper"] #frontispiece-section { background-color: var(--brand-rust); color: var(--brand-paper); }
      `}</style>
      
      <div id="frontispiece-section" className="absolute inset-0 z-0 zone-bg zone-text transition-colors duration-500">
         <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border zone-border pointer-events-none opacity-50"></div>
         <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border zone-border pointer-events-none opacity-30"></div>
      </div>
      
      <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center">
         {eyebrow && (
           <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {eyebrow}
           </div>
         )}
         
         <h1 id="hero-frontispiece-title" className="font-heading text-display-lg leading-[0.95] tracking-[-0.02em] text-balance mb-8 animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.2s' }}>
               <WordReveal>{title}</WordReveal>
         </h1>
         
         {blurb && (
            <p className="text-lead zone-text-muted max-w-2xl leading-relaxed mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {blurb}
            </p>
         )}
         
         {metaStrip && metaStrip.length > 0 && (
           <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {metaStrip.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  {i > 0 && <span className={`w-1 h-1 rounded-full bg-brand-stone opacity-30`}></span>}
                  <span className={`font-mono text-xs uppercase tracking-[0.15em] ${accentClass}`}>{item}</span>
                </div>
              ))}
           </div>
         )}
      </div>
    </section>
  );
};

