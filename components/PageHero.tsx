import React from 'react';
import { Eyebrow } from './ui/Eyebrow';
import { AccentTitle } from './ui/AccentTitle';

interface PageHeroProps {
  tag: string;
  title: React.ReactNode;
  subtitle: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ 
  tag, 
  title, 
  subtitle, 
  description, 
  className = "",
  children
}) => {
  return (
    <section className={`pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60 ${className}`}>
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <Eyebrow className="mb-8 animate-fade-in-up">
                {tag}
              </Eyebrow>
              <AccentTitle className="text-6xl md:text-8xl lg:text-9xl text-brand-dark mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {title}
                {subtitle && (
                  <>
                    <br/>
                    <span className="font-serif italic font-normal text-brand-stone opacity-60">{subtitle}</span>
                  </>
                )}
              </AccentTitle>
              {description && (
                <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                   {description}
                </p>
              )}
           </div>
           {children}
        </div>
    </section>
  );
};

export default PageHero;