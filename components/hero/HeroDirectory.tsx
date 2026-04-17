import React from 'react';
import { WordReveal } from '../motion/WordReveal';
import type { DirectoryHeroProps } from './types';
import { GhostWord } from '../ui/GhostWord';

export const HeroDirectory: React.FC<DirectoryHeroProps> = ({ eyebrow, title, blurb, contacts, coordinates, ghostWord = 'Engage.', accentTone }) => {
  return (
    <section aria-labelledby="hero-directory-title" className="relative pt-32 md:pt-48 pb-32 px-4 md:px-12 zone-bg zone-text overflow-hidden min-h-[85vh] flex items-end">
      
      <GhostWord position={{ bottom: '-10%', right: '-5%' }} className="text-[35vw]" color="var(--zone-accent)">
         {ghostWord}
      </GhostWord>
      
      <div className="container mx-auto max-w-7xl relative z-10 w-full">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b zone-border pb-12 mb-12">
            <div className="md:w-3/5">
                {eyebrow && (
                   <div className="font-mono text-eyebrow uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                      {eyebrow}
                   </div>
                )}
                <h1 id="hero-directory-title" className="font-heading text-display-xl leading-[0.9] tracking-[-0.02em] text-balance mb-6 animate-fade-in-up [&_em]:font-serif [&_em]:italic [&_em]:font-normal" style={{ animationDelay: '0.1s' }}>
               <WordReveal>{title}</WordReveal>
                </h1>
                {blurb && (
                   <p className="text-lead zone-text-muted max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      {blurb}
                   </p>
                )}
            </div>
            {coordinates && (
              <div className="md:w-2/5 flex md:justify-end font-mono text-xs uppercase tracking-[0.2em] zone-text-muted animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                 {coordinates}
              </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {contacts.map((contact, i) => {
               const Content = contact.href ? 'a' : 'div';
               return (
                 <Content 
                   key={i} 
                   href={contact.href} 
                   className={`flex flex-col gap-4 border-l zone-border pl-6 ${contact.href ? 'group transition-colors' : ''}`}
                 >
                    <style>{`
                      .group:hover { border-left-color: var(--zone-accent); }
                      .group:hover .hover-zone-accent { color: var(--zone-accent); }
                    `}</style>
                    <span className="font-mono text-xs uppercase tracking-[0.1em] zone-text-muted">
                       {contact.label}
                    </span>
                    <span className="font-heading text-2xl transition-colors hover-zone-accent">
                       {contact.value}
                    </span>
                 </Content>
               );
            })}
         </div>
      </div>
    </section>
  );
};

