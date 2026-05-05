import React from 'react';
import { WordReveal } from '../Reveal';
import type { DirectoryHeroProps } from './types';
import { GhostWord } from '../ui/GhostWord';

export const HeroDirectory: React.FC<DirectoryHeroProps> = ({
  eyebrow,
  title,
  blurb,
  contacts,
  coordinates,
  ghostWord = 'Engage.',
}) => {
  return (
    <section
      aria-labelledby="hero-directory-title"
      className="zone-bg zone-text relative flex min-h-[85vh] items-end overflow-hidden px-4 pb-32 pt-32 md:px-12 md:pt-48"
    >
      <GhostWord position={{ bottom: '-3%', right: '-2%' }} className="text-[18vw]" color="var(--zone-accent)">
        {ghostWord}
      </GhostWord>

      <div className="container relative z-10 mx-auto w-full max-w-7xl">
        <div className="zone-border mb-12 flex flex-col items-start justify-between gap-12 border-b pb-12 md:flex-row md:items-end">
          <div className="md:w-3/5">
            {eyebrow && (
              <div className="mb-8 animate-fade-in-up font-mono text-eyebrow uppercase tracking-[0.2em]">{eyebrow}</div>
            )}
            <h1
              id="hero-directory-title"
              className="mb-6 animate-fade-in-up text-balance font-heading text-display-xl leading-[0.9] tracking-[-0.02em] [&_em]:font-serif [&_em]:font-normal [&_em]:italic"
              style={{ animationDelay: '0.1s' }}
            >
              <WordReveal>{title}</WordReveal>
            </h1>
            {blurb && (
              <p
                className="zone-text-muted max-w-xl animate-fade-in-up text-lead leading-relaxed"
                style={{ animationDelay: '0.2s' }}
              >
                {blurb}
              </p>
            )}
          </div>
          {coordinates && (
            <div
              className="zone-text-muted flex animate-fade-in-up font-mono text-xs uppercase tracking-[0.2em] md:w-2/5 md:justify-end"
              style={{ animationDelay: '0.3s' }}
            >
              {coordinates}
            </div>
          )}
        </div>

        <div
          className="relative z-10 grid animate-fade-in-up grid-cols-1 gap-12 md:grid-cols-3"
          style={{ animationDelay: '0.4s' }}
        >
          {contacts.map((contact, i) => {
            const Content = contact.href ? 'a' : 'div';
            return (
              <Content
                key={i}
                href={contact.href}
                className={`hero-directory-contact zone-border flex flex-col gap-4 border-l pl-6 ${contact.href ? 'group transition-colors' : ''}`}
              >
                <span className="zone-text-muted font-mono text-xs uppercase tracking-[0.1em]">{contact.label}</span>
                <span className="hover-zone-accent font-heading text-2xl transition-colors">{contact.value}</span>
              </Content>
            );
          })}
        </div>
      </div>
    </section>
  );
};
