
import React from 'react';
import { INDUSTRIES } from '../../constants';
import Reveal from '../Reveal';

const TrustBar: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-brand-border/60 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <Reveal width="100%">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-brand-stone mb-8">
            Trusted advisor to businesses across sectors
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {INDUSTRIES.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-dark group-hover:text-brand-moss transition-colors">
                  {React.cloneElement(item.icon as React.ReactElement<{size?: number}>, { size: 24 })}
                </div>
                <span className="font-heading font-bold text-brand-dark text-sm hidden md:block">{item.title}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TrustBar;
