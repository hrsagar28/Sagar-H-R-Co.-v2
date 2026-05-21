import React from 'react';
import { Link } from 'react-router-dom';
import { warmContactRoute } from './warmContact';
import Reveal from '../../components/Reveal';

export const Cta: React.FC = () => (
  <section id="contact-cta" aria-labelledby="contact-cta-heading" className="zone-bg px-4 py-24 md:px-6">
    <div className="container mx-auto max-w-7xl">
      <div className="relative overflow-hidden rounded-bento bg-brand-moss p-12 text-center shadow-2xl md:p-24">
        <div className="bg-noise absolute inset-0 opacity-20 mix-blend-multiply" aria-hidden="true"></div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal delay={0}>
            <h2 id="contact-cta-heading" className="mb-8 font-heading text-4xl font-bold text-white md:text-7xl">
              Start a conversation
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mb-12 text-xl font-medium leading-relaxed text-white/85">
              You don't need to have everything organised before reaching out. Share what you have. We'll figure out the
              rest from there.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Link
              to="/contact"
              onMouseEnter={warmContactRoute}
              onFocus={warmContactRoute}
              className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-brand-moss shadow-lg transition-colors duration-300 hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-moss motion-reduce:transition-none"
            >
              Reach Out
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);
