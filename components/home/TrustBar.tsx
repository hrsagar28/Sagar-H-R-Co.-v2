import React from 'react';
import { INDUSTRIES } from '../../constants';
import Reveal from '../Reveal';

const TRUSTBAR_HEADING_ID = 'home-trustbar-heading';

const TrustBar: React.FC = () => {
  'use memo';
  return (
    <section
      aria-labelledby={TRUSTBAR_HEADING_ID}
      className="overflow-hidden border-b border-brand-border/60 bg-white py-12"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <Reveal width="100%">
          {/* Audit T-02: one voice instead of an sr-only heading saying
              "Industries we serve" + a visible eyebrow with different words.
              The eyebrow style is preserved visually; the element is now
              an h2 so the heading outline doesn't have a gap. */}
          <h2
            id={TRUSTBAR_HEADING_ID}
            className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-brand-dark"
          >
            Trusted advisor to businesses across sectors
          </h2>

          {/* Audit T-01: <ul>/<li> instead of flex of divs. Screen readers
              announce "List, 8 items" and crawlers can parse the set.
              Audit S-05: <item.Icon /> replaces React.cloneElement. */}
          <ul className="flex flex-wrap justify-center gap-4 md:gap-16">
            {INDUSTRIES.map((item) => (
              <li key={item.title} className="group flex items-center gap-3">
                <div className="rounded-lg bg-brand-bg p-2 text-brand-dark transition-colors group-hover:text-brand-moss">
                  <item.Icon size={24} aria-hidden="true" focusable={false} />
                </div>
                <span className="font-heading text-xs font-bold text-brand-dark md:text-sm">{item.title}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

export default TrustBar;
