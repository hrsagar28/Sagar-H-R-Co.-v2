import React from 'react';
import { Link } from 'react-router-dom';
import { warmContactRoute } from './warmContact';

export const Cta: React.FC = () => (
  <section id="contact-cta" aria-labelledby="contact-cta-heading" className="py-24 px-4 md:px-6 zone-bg">
    <div className="container mx-auto max-w-7xl">
      <div className="bg-brand-moss rounded-bento p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-multiply" aria-hidden="true"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 id="contact-cta-heading" className="text-4xl md:text-7xl font-heading font-bold text-white mb-8">Start a conversation</h2>
          <p className="text-white/85 text-xl mb-12 leading-relaxed font-medium">
            You don't need to have everything organised before reaching out. Share what you have. We'll figure out the rest from there.
          </p>
          <Link
            to="/contact"
            onMouseEnter={warmContactRoute}
            onFocus={warmContactRoute}
            className="inline-block px-10 py-4 bg-white text-brand-moss font-bold rounded-full text-lg hover:bg-brand-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zone-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-moss transition-all duration-300 shadow-lg motion-reduce:transition-none"
          >
            Reach Out
          </Link>
        </div>
      </div>
    </div>
  </section>
);
