import React from 'react';
import { WordReveal } from '../Reveal';
import { Eyebrow } from '../ui/Eyebrow';
import { AccentTitle } from '../ui/AccentTitle';
import type { BasicHeroProps } from './types';

export const HeroBasic: React.FC<BasicHeroProps & { className?: string, children?: React.ReactNode }> = ({ 
  tag, 
  title, 
  subtitle, 
  description,
  blurb,
  eyebrow,
  className = "",
  children
}) => {
  const displayTag = tag || eyebrow;
  const displayDesc = description || blurb;
  
  return (
    <section className={`pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg relative overflow-hidden ${className}`}>
        {/* Faded Grid Background */}
        <div 
          className="absolute inset-0 bg-grid pointer-events-none" 
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', 
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' 
          }} 
        />
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              {displayTag && (
                <Eyebrow className="mb-8 animate-fade-in-up">
                  {displayTag}
                </Eyebrow>
              )}
              <AccentTitle className="text-6xl md:text-8xl lg:text-9xl text-brand-dark mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
                {subtitle && (
                  <>
                    <br/>
                    <span className="font-serif italic font-normal text-brand-stone opacity-60">{subtitle}</span>
                  </>
                )}
              </AccentTitle>
              {displayDesc && (
                <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                   {displayDesc}
                </p>
              )}
           </div>
           {children}
        </div>
    </section>
  );
};


