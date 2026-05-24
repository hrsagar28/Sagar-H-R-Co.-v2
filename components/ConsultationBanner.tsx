import React from 'react';
import { Phone } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import Reveal from './Reveal';
import { BigCTA } from './ui/BigCTA';

const ConsultationBanner: React.FC = () => {
  return (
    <section
      aria-labelledby="consultation-heading"
      className="relative overflow-hidden bg-card-moss-deep px-4 py-20 md:px-6 print:hidden"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-white/5 blur-[100px]"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/4 translate-y-1/4 rounded-full bg-black/20 blur-[80px]"></div>

      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        <Reveal variant="scale">
          <h2
            id="consultation-heading"
            className="mb-6 font-heading text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            Professional Assistance.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/80 md:text-xl">
            Contact us for expert advice on tax, audit, and business compliance matters.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex w-full justify-center sm:w-auto">
              <BigCTA to="/contact" tone="paper-on-dark" size="lg">
                Engage on a matter
              </BigCTA>
            </div>

            <a
              href={`tel:${CONTACT_INFO.phone.value}`}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-auto"
            >
              <Phone size={18} /> {CONTACT_INFO.phone.display}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ConsultationBanner;
