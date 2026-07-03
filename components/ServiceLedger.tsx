import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../constants';
import { SERVICE_HERO_META } from '../constants/serviceHeroMeta';
import Reveal from './Reveal';
import { Eyebrow } from './ui/Eyebrow';
import { staggerDelay } from '../utils/stagger';

/**
 * ServiceLedger — the services section presented as an editorial register:
 * a numbered index with a ruled column header, the discipline tag, the
 * service title and a real engagement status per row.
 *
 * This is the "D2" direction. The previous bento grid (ServiceBento) is
 * still in the repo; Services.tsx chooses between them via SERVICES_LAYOUT.
 *
 * Audit findings folded in here:
 *  - SV-05  every row renders its discipline icon (the data was unused).
 *  - SV-09  the eight services are a real semantic list (<ol>/<li>).
 *  - SV-10  the eyebrow goes through the shared <Eyebrow> component.
 *  - SV-04  a linear list — DOM order is the visual/tab order by construction.
 *  - SV-24  fully data-driven from SERVICES + SERVICE_HERO_META; no
 *           hand-tuned per-card variant map to keep in sync.
 *
 * Copy (the eyebrow, the h2, the supporting line, the CTA wording) is a
 * placeholder for CA Sagar to finalise.
 */

// Read a labelled value out of a service's hero-meta. 'Discipline' and
// 'Status' are present for every service — see constants/serviceHeroMeta.ts.
const metaValue = (id: string, label: string): string => {
  const entry = SERVICE_HERO_META[id]?.find((m) => m.label === label);
  return typeof entry?.value === 'string' ? entry.value : '';
};

// Recurring practice vs. engagement-based work — drives the status dot.
const isRecurring = (status: string): boolean => !/selective|assignment/i.test(status);

const ServiceLedger: React.FC = () => {
  return (
    <section
      aria-labelledby="services-index-heading"
      className="relative bg-gradient-to-b from-[#fbfaf8] to-brand-paper pb-32 pt-20"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Masthead */}
        <header className="mb-12 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <Reveal delay={0}>
              <Eyebrow className="mb-4">Index of disciplines</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="services-index-heading"
                className="font-heading text-4xl font-bold leading-[1.02] tracking-tight text-brand-dark md:text-6xl"
              >
                What we do.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-md text-base font-medium leading-relaxed text-[#5f594f] md:text-lg">
              Eight disciplines of chartered-accountancy practice — audit, tax, GST, company law and advisory — handled
              directly from our Mysuru office.
            </p>
          </Reveal>
        </header>

        {/* Register */}
        <div className="relative">
          {/* Ruled column header — decorative scaffolding for the register. */}
          <div
            aria-hidden="true"
            className="hidden border-b border-brand-dark/15 pb-3 lg:flex lg:items-end lg:gap-6 lg:px-6"
          >
            <span className="w-14 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#5f594f]">No.</span>
            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_9rem] gap-x-6">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#5f594f]">Discipline</span>
              <span aria-hidden="true" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#5f594f]">Status</span>
            </div>
            <span className="w-10 shrink-0" />
          </div>

          {/* The eight disciplines */}
          <ol role="list" className="mt-2 space-y-1.5">
            {SERVICES.map((service, index) => {
              const numeral = String(index + 1).padStart(2, '0');
              const discipline = metaValue(service.id, 'Discipline');
              const status = metaValue(service.id, 'Status');
              const recurring = isRecurring(status);

              return (
                <li key={service.id}>
                  <Reveal width="100%" delay={staggerDelay(index, 0.05, 0.35)}>
                    <Link
                      to={service.link}
                      aria-labelledby={`ledger-${service.id}-title`}
                      aria-describedby={`ledger-${service.id}-desc`}
                      className="group/row relative flex items-start gap-4 overflow-hidden rounded-2xl bg-[linear-gradient(to_right,#fdfbf7,#f6f2e9)] p-4 transition-[box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-14px_rgba(10,9,8,0.22)] lg:items-center lg:gap-6 lg:px-6 lg:py-5"
                    >
                      {/* Hover surface — opacity transitions cleanly where a gradient swap cannot. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#fafaf9,#eae5d9)] opacity-0 transition-opacity duration-500 ease-out-expo group-hover/row:opacity-100"
                      />
                      {/* Moss accent rail */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-brand-moss to-brand-accent transition-transform duration-500 ease-out-expo group-hover/row:scale-y-100"
                      />

                      {/* Numeral */}
                      <span
                        aria-hidden="true"
                        className="relative z-10 w-12 shrink-0 font-serif text-[2.4rem] italic leading-none text-brand-dark/80 transition-transform duration-500 ease-out-expo group-hover/row:translate-x-1 lg:w-14 lg:text-[3rem]"
                      >
                        {numeral}
                      </span>

                      {/* Body — stacks below lg, becomes the register row at lg+ */}
                      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_9rem] lg:items-center lg:gap-x-6 lg:gap-y-0">
                        {/* Identity */}
                        <div className="flex items-start gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-moss shadow-sm ring-1 ring-brand-dark/10 transition-colors duration-300 group-hover/row:bg-brand-moss group-hover/row:text-white group-hover/row:ring-brand-moss">
                            <service.Icon size={18} strokeWidth={1.5} aria-hidden="true" focusable={false} />
                          </span>
                          <div className="min-w-0">
                            <p className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-brand-moss">
                              {discipline}
                            </p>
                            <h3
                              id={`ledger-${service.id}-title`}
                              className="font-heading text-xl font-medium leading-snug tracking-tight text-brand-dark lg:text-2xl"
                            >
                              {service.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          id={`ledger-${service.id}-desc`}
                          className="text-sm font-medium leading-relaxed text-[#5f594f]"
                        >
                          {service.description}
                        </p>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              recurring ? 'bg-brand-moss' : 'bg-brand-brass'
                            }`}
                          />
                          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#5f594f]">
                            {status}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-dark/15 bg-white/60 text-brand-dark transition-[background-color,border-color,color] duration-500 ease-out-expo group-hover/row:border-brand-moss group-hover/row:bg-brand-moss group-hover/row:text-white">
                        <ArrowRight size={15} strokeWidth={1.5} aria-hidden="true" focusable={false} />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Closing CTA — the ninth line of the register */}
        <Reveal width="100%" delay={0.1}>
          <Link
            to="/contact"
            aria-labelledby="ledger-cta-title"
            className="group/cta relative mt-4 flex flex-col gap-5 overflow-hidden rounded-2xl bg-card-moss-cta p-6 text-white outline-none transition-shadow duration-500 hover:shadow-[0_22px_44px_-18px_rgba(26,77,46,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-paper md:flex-row md:items-center md:gap-6 md:px-8 md:py-7"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/15 blur-[60px]"
            />
            <span
              aria-hidden="true"
              className="relative z-10 w-14 shrink-0 font-serif text-[3rem] italic leading-none text-white/85"
            >
              09
            </span>
            <div className="relative z-10 min-w-0 flex-1">
              <p className="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/70">Get started</p>
              <h3
                id="ledger-cta-title"
                className="font-heading text-2xl font-medium leading-snug tracking-tight md:text-3xl"
              >
                Book a consultation.
              </h3>
              <p className="mt-1.5 max-w-md text-sm font-medium leading-relaxed text-white/80">
                A 30-minute call to scope the right engagement — retainer or assignment.
              </p>
            </div>
            <span className="relative z-10 inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-moss shadow-lg transition-colors duration-300 group-hover/cta:bg-brand-dark group-hover/cta:text-white md:self-auto">
              Schedule a call
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" focusable={false} />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default ServiceLedger;
