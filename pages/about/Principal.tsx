import React from 'react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../../components/Reveal';

export const Principal: React.FC = () => {
  const { founder } = CONTACT_INFO;

  return (
    <section id="principal" aria-labelledby="principal-heading" className="zone-bg px-4 py-24 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="zone-surface zone-border flex flex-col overflow-hidden rounded-bento border lg:flex-row">
          <div className="zone-border flex items-stretch justify-center border-b p-6 md:p-8 lg:w-2/5 lg:border-b-0 lg:border-r">
            <div className="zone-border zone-bg relative w-full max-w-sm overflow-hidden rounded-card border lg:max-w-none">
              <div className="relative aspect-[3/4] min-h-[320px] md:min-h-[420px] lg:min-h-full">
                <picture>
                  <source
                    type="image/avif"
                    srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 384px, 100vw"
                  />
                  <source
                    type="image/webp"
                    srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 384px, 100vw"
                  />
                  <img
                    src="/images/founder-800.jpg"
                    srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 384px, 100vw"
                    alt="Portrait of CA Sagar H R, Founder and Principal."
                    loading="lazy"
                    decoding="async"
                    width="1080"
                    height="1440"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: '50% 18%' }}
                  />
                </picture>
                {/* Audit AB-15: bottom-edge gradient strengthened from 8%
                    to 32% so it actually grounds the portrait against the
                    card instead of being imperceptible. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(10,9,8,0) 55%, rgba(10,9,8,0.32) 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-10 md:p-16 lg:w-3/5">
            <Reveal delay={0}>
              <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-zone-accent">Principal</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="principal-heading" className="zone-text mb-2 font-heading text-4xl font-bold md:text-6xl">
                {founder.name}
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mb-8 text-sm font-bold uppercase tracking-widest text-zone-text-muted">ACA</p>

              <div className="max-w-prose space-y-6 text-lg font-medium leading-relaxed text-zone-text-muted/90">
                <p>{founder.bio}</p>
                <blockquote className="zone-border border-l-2 pl-6 italic text-zone-text">
                  <p>{founder.quote}</p>
                  <footer className="mt-2 text-sm not-italic text-zone-text-muted">
                    - {founder.name}, {founder.title}
                  </footer>
                </blockquote>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
