import React from 'react';
import { WordReveal } from '../motion/WordReveal';
import type { FolioHeroProps } from './types';

export const HeroFolio: React.FC<FolioHeroProps> = ({ eyebrow, title, blurb, number, sideText, accentTone }) => {
  const accentClass = accentTone ? `text-brand-${accentTone}` : 'zone-accent';
  const accentAltClass = accentTone ? `text-brand-${accentTone}` : 'zone-accent-alt'; 
  
  return (
    <section aria-labelledby="hero-folio-title" className="relative pt-32 md:pt-48 pb-20 px-4 md:px-12 zone-bg zone-text overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row items-stretch">
         
         <div className={`hidden md:flex w-1/4 items-start ${accentAltClass} font-serif italic text-display-xl leading-none opacity-80 select-none animate-fade-in-up`}>
           {number}
         </div>

         <div className="w-full md:w-2/4 flex flex-col justify-center">
            {eyebrow && (
               <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                  <span className={`inline-block w-6 h-px mr-3 align-middle ${accentClass.replace('text-', 'bg-').replace('zone-accent', '')}`} style={!accentTone ? { backgroundColor: 'var(--zone-accent)'} : {}}></span>
                  {eyebrow}
               </div>
            )}
            <h1 id="hero-folio-title" className="font-heading text-display-md leading-[1] tracking-[-0.02em] text-balance mb-8 animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
            </h1>
            {blurb && (
               <p className="text-lead zone-text-muted max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {blurb}
               </p>
            )}
         </div>

         <div className="hidden md:flex w-1/4 justify-end items-end pb-8">
            {sideText && (
               <div className="font-mono text-eyebrow uppercase tracking-[0.2em] zone-text-muted animate-fade-in-up" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', animationDelay: '0.3s' }}>
                  {sideText}
               </div>
            )}
         </div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative mt-20">
         <div className="h-px w-full zone-hairline flex items-center justify-between">
           <div className={`w-2 h-2 rounded-full ${accentAltClass.replace('text-', 'bg-')} -translate-x-1`} style={!accentTone ? { backgroundColor: 'var(--zone-accent-alt)' } : {}}></div>
           <div className={`w-2 h-2 rounded-full ${accentAltClass.replace('text-', 'bg-')} translate-x-1`} style={!accentTone ? { backgroundColor: 'var(--zone-accent-alt)' } : {}}></div>
         </div>
      </div>
    </section>
  );
};

