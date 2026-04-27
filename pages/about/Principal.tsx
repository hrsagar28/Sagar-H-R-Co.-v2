import React from 'react';
import { CONTACT_INFO } from '../../constants';

const FOUNDER_PHOTO_SRC = '/images/founder.jpg';

export const Principal: React.FC = () => {
  const { founder } = CONTACT_INFO;

  return (
    <section id="principal" aria-labelledby="principal-heading" className="py-24 px-4 md:px-6 zone-bg">
      <div className="container mx-auto max-w-7xl">
        <div className="zone-surface rounded-bento border zone-border overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-2/5 p-6 md:p-8 flex items-stretch justify-center border-b lg:border-b-0 lg:border-r zone-border">
            <div className="w-full max-w-sm lg:max-w-none relative rounded-card border zone-border shadow-sm overflow-hidden zone-bg">
              <div className="relative aspect-[3/4] min-h-[320px] md:min-h-[420px] lg:min-h-full">
                <picture>
                  <source srcSet="/images/founder.avif" type="image/avif" />
                  <source srcSet="/images/founder.webp" type="image/webp" />
                  <img
                    src={FOUNDER_PHOTO_SRC}
                    alt="Portrait of CA Sagar H R, Founder and Principal."
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: '50% 18%' }}
                  />
                </picture>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(10,9,8,0.08) 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
            <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">Principal</span>
            <h2 id="principal-heading" className="text-4xl md:text-6xl font-heading font-bold zone-text mb-2">{founder.name}</h2>
            <p className="text-zone-text-muted font-bold text-sm uppercase tracking-widest mb-8">ACA</p>

            <div className="space-y-6 text-lg text-zone-text-muted/90 font-medium leading-relaxed max-w-prose">
              <p>{founder.bio}</p>
              <blockquote className="border-l-2 zone-border pl-6 italic text-zone-text">
                <p>{founder.quote}</p>
                <footer className="mt-2 not-italic text-sm text-zone-text-muted">
                  - {founder.name}, {founder.title}
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
