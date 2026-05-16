import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';

/**
 * FounderSection
 * --------------
 * Closes the biggest trust gap on the previous version of the home page: the
 * founder was present only as an abstract "S" watermark. This version puts
 * a real portrait into the card, frames it with a brass hairline (Zone B
 * token), captions it in JetBrains Mono, and adds a single Fraunces italic
 * line anchoring the practice in Mysuru.
 *
 * The portrait variants are generated from `/public/images/founder-source.jpg`
 * by `scripts/generate-responsive-images.ts`.
 */

const FounderSection: React.FC = () => {
  'use memo';
  return (
    <section className="relative overflow-hidden bg-brand-surface py-32">
      {/* Subtle grid background */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
          {/* Left: Portrait + caption + credentials */}
          <div className="mx-auto w-full max-w-[300px] lg:mx-0">
            <Reveal variant="fade-up">
              <figure className="relative">
                {/* Brass hairline frame — a 1px ring with a small inset echo so
                    the portrait reads as "framed", not just cropped. */}
                <div className="relative rounded-[4px] border border-brand-brass/60 bg-brand-bg p-[5px] shadow-[0_20px_40px_-24px_rgba(17,17,17,0.35)]">
                  {/* aspect-[3/4] on a 9:16 source keeps more vertical content
                      visible than 4:5, so the full head (including hair) shows.
                      `object-position: 50% 18%` pulls the crop higher, letting
                      the torso be the thing that gets trimmed — not the hair. */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-brand-border">
                    <picture>
                      <source
                        type="image/avif"
                        srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                      />
                      <source
                        type="image/webp"
                        srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                      />
                      <img
                        src="/images/founder-800.jpg"
                        srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                        alt="Portrait of CA Sagar H R, Founder & Principal"
                        loading="lazy"
                        decoding="async"
                        width="1080"
                        height="1920"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: '50% 18%' }}
                        // If the image fails to load, quietly hide it so the
                        // brass frame remains as a graceful placeholder
                        // instead of a broken-image icon.
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                        }}
                      />
                    </picture>
                    {/* Soft inner vignette — adds a little depth on light
                        backgrounds without tinting skin tones. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(10,9,8,0.08) 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Caption — sits below the frame, JetBrains Mono */}
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-brass/50 to-brand-brass/70" />
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-brand-dark/80 md:text-[11px]">
                    {CONTACT_INFO.founder.name} · {CONTACT_INFO.founder.title}
                  </span>
                </figcaption>
              </figure>
            </Reveal>

            {/* Credentials — sit directly under the caption as a quiet footer
                to the portrait, rather than in a parallel card. */}
            <Reveal variant="fade-up" delay={0.1}>
              <div className="mt-6 flex flex-wrap gap-2">
                {CONTACT_INFO.founder.qualifications.map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-dark shadow-sm"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: Editorial text */}
          <div className="space-y-8">
            <Reveal variant="fade-up">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-moss">Principal</span>
            </Reveal>

            <Reveal variant="reveal-mask" delay={0.1}>
              <h2 className="font-heading text-5xl font-bold leading-[0.9] text-brand-dark md:text-6xl">
                Professional <br />
                <span className="font-serif font-normal italic text-brand-stone">Expertise.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="border-l-2 border-brand-moss pl-6 text-xl font-medium leading-relaxed text-brand-stone">
                {CONTACT_INFO.founder.bio}
              </p>
            </Reveal>

            {/* Single editorial italic line, anchoring the practice to place */}
            <Reveal delay={0.35}>
              <p className="border-l border-brand-brass/60 pl-6 font-serif text-lg italic text-brand-dark/80 md:text-xl">
                A Mysuru practice, serving SMEs across Karnataka.
              </p>
            </Reveal>

            <Reveal delay={0.55}>
              <Link to="/about" className="group mt-2 inline-flex items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-dark transition-colors group-hover:text-brand-moss">
                  View Profile
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border transition-all duration-300 group-hover:border-brand-moss group-hover:bg-brand-moss group-hover:text-white">
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
