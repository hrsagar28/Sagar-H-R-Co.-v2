import React from 'react';
import { Link } from 'react-router-dom';
import { warmContactRoute } from './warmContact';
import Reveal from '../../components/Reveal';

export const Cta: React.FC = () => (
  <section id="contact-cta" aria-labelledby="contact-cta-heading" className="zone-bg px-4 py-24 md:px-6">
    <div className="container mx-auto max-w-7xl">
      {/* Audit AB-26: panel uses the editorial palette's rust (zone-accent-alt)
          instead of the off-zone moss green. AB-27: the invisible shadow-2xl
          was dropped — the colour block defines itself. */}
      <div className="relative overflow-hidden rounded-bento bg-brand-rust p-12 text-center md:p-24">
        <div className="bg-noise absolute inset-0 opacity-20 mix-blend-multiply" aria-hidden="true"></div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal delay={0}>
            <h2 id="contact-cta-heading" className="mb-8 font-heading text-4xl font-bold text-brand-paper md:text-6xl">
              Start a conversation
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mb-12 text-xl font-medium leading-relaxed text-brand-paper/85">
              You don't need to have everything organised before reaching out. Share what you have. We'll figure out the
              rest from there.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Link
              to="/contact"
              onMouseEnter={warmContactRoute}
              onFocus={warmContactRoute}
              className="inline-block rounded-full bg-brand-paper px-10 py-4 text-lg font-bold text-brand-rust shadow-lg transition-colors duration-300 hover:bg-brand-brass hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-rust motion-reduce:transition-none"
            >
              Reach Out
            </Link>
          </Reveal>
          {/* Audit AB-19: a low-emphasis secondary path for visitors who
              aren't ready to make contact yet — doubles as an internal
              link to the Services page. */}
          <Reveal delay={0.24}>
            <p className="mt-8">
              <Link
                to="/services"
                className="font-medium text-brand-paper/80 underline decoration-brand-paper/40 underline-offset-4 transition-colors hover:text-brand-paper hover:decoration-brand-paper motion-reduce:transition-none"
              >
                Or explore the services we offer
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);
