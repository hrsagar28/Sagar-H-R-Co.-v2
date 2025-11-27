import React from 'react';

interface PageHeroProps {
  tag: string;
  title: string;
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                {tag}
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {title} <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">{subtitle}</span>
              </h1>
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