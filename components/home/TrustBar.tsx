import React from 'react';
import { INDUSTRIES } from '../../constants';
import Reveal from '../Reveal';

const TrustBar: React.FC = () => {
  return (
    <section className="overflow-hidden border-b border-brand-border/60 bg-white py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <Reveal width="100%">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-brand-dark">
            Trusted advisor to businesses across sectors
          </p>

          <div className="flex flex-wrap justify-center gap-4 transition-all duration-500 md:gap-16 lg:opacity-60 lg:grayscale lg:hover:opacity-100 lg:hover:grayscale-0">
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
