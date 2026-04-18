
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';

const { Link } = ReactRouterDOM;

/**
 * FounderSection
 * --------------
 * Closes the biggest trust gap on the previous version of the home page: the
 * founder was present only as an abstract "S" watermark. This version puts
 * a real portrait into the card, frames it with a brass hairline (Zone B
 * token), captions it in JetBrains Mono, and adds a single Fraunces italic
 * line anchoring the practice in Mysuru.
 *
 * The photo file is expected at `/public/images/founder.jpg`, which Vite
 * serves from `/images/founder.jpg` at runtime.
 */

const FOUNDER_PHOTO_SRC = '/images/founder.jpg';

const FounderSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-brand-surface">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-20 items-start">

          {/* Left: Portrait + caption + credentials */}
          <div className="mx-auto lg:mx-0 w-full max-w-[300px]">
            <Reveal variant="fade-up">
              <figure className="relative">
                {/* Brass hairline frame — a 1px ring with a small inset echo so
                    the portrait reads as "framed", not just cropped. */}
                <div className="relative p-[5px] rounded-[4px] bg-brand-bg shadow-[0_20px_40px_-24px_rgba(17,17,17,0.35)] border border-[#b8924c]/60">
                  {/* aspect-[3/4] on a 9:16 source keeps more vertical content
                      visible than 4:5, so the full head (including hair) shows.
                      `object-position: 50% 18%` pulls the crop higher, letting
                      the torso be the thing that gets trimmed — not the hair. */}
                  <div className="relative overflow-hidden rounded-[2px] aspect-[3/4] bg-brand-border">
                    <img
                      src={FOUNDER_PHOTO_SRC}
                      alt={`Portrait of ${CONTACT_INFO.founder.name}, ${CONTACT_INFO.founder.title}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: '50% 18%' }}
                      // If the image fails to load, quietly hide it so the
                      // brass frame remains as a graceful placeholder
                      // instead of a broken-image icon.
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                      }}
                    />
                    {/* Soft inner vignette — adds a little depth on light
                        backgrounds without tinting skin tones. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(10,9,8,0.08) 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Caption — sits below the frame, JetBrains Mono */}
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b8924c]/50 to-[#b8924c]/70" />
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-brand-dark/80 whitespace-nowrap">
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
                    className="px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-brand-dark"
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
              <span className="text-brand-moss font-bold tracking-widest uppercase text-xs">Principal Partner</span>
            </Reveal>

            <Reveal variant="reveal-mask" delay={0.1}>
              <h2 className="text-5xl md:text-6xl font-heading font-bold text-brand-dark leading-[0.9]">
                Professional <br/>
                <span className="font-serif italic font-normal text-brand-stone">Expertise.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="text-xl text-brand-stone font-medium leading-relaxed border-l-2 border-brand-moss pl-6">
                {CONTACT_INFO.founder.bio}
              </p>
            </Reveal>

            {/* Single editorial italic line, anchoring the practice to place */}
            <Reveal delay={0.35}>
              <p className="font-serif italic text-lg md:text-xl text-brand-dark/80 pl-6 border-l border-[#b8924c]/60">
                A Mysuru practice, serving SMEs across Karnataka.
              </p>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="flex flex-wrap gap-3 pt-2">
                {CONTACT_INFO.founder.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm font-bold text-brand-dark cursor-default"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.55}>
              <Link to="/about" className="inline-flex items-center gap-3 group mt-2">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-dark group-hover:text-brand-moss transition-colors">
                  View Profile
                </span>
                <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center group-hover:bg-brand-moss group-hover:border-brand-moss group-hover:text-white transition-all duration-300">
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
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
