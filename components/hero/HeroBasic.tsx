import React from 'react';
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
    <section aria-labelledby="hero-title" className={`pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60 ${className}`}>
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              {displayTag && (
                <Eyebrow className="mb-8 animate-fade-in-up">
                  {displayTag}
                </Eyebrow>
              )}
              <AccentTitle id="hero-title" className="text-6xl md:text-8xl lg:text-9xl text-brand-dark mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {title}
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
