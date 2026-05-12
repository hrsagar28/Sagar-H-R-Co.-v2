import React from 'react';
import { INDUSTRIES } from '../../constants';
import Reveal from '../Reveal';

const TrustBar: React.FC = () => {
  return (
    <section className="overflow-hidden border-b border-brand-border/60 bg-white py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <Reveal width="100%">
          <h2 className="sr-only">Industries we serve</h2>
          <p
            aria-hidden="true"
            className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-brand-dark"
          >
            Trusted advisor to businesses across sectors
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-16">
            {INDUSTRIES.map((item, idx) => (
              <div key={idx} className="group flex items-center gap-3">
                <div className="rounded-lg bg-brand-bg p-2 text-brand-dark transition-colors group-hover:text-brand-moss">
                  {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 24 })}
                </div>
                <span className="font-heading text-xs font-bold text-brand-dark md:text-sm">{item.title}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TrustBar;
