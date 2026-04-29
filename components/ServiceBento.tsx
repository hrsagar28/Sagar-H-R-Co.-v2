
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../constants';
import Reveal from './Reveal';

const { Link } = ReactRouterDOM;

type Variant = {
  span: string;
  container: string;
  textTitle: string;
  textDesc: string;
  arrowBtn: string;
};

const DEFAULT_VARIANT: Variant = {
  span: 'md:col-span-1 lg:col-span-1',
  container: 'bg-gradient-to-br from-white to-zinc-50 border-brand-border/40 hover:border-brand-border',
  textTitle: 'text-brand-dark',
  textDesc: 'text-brand-stone',
  arrowBtn: 'border-brand-border text-brand-dark group-hover:bg-brand-dark group-hover:text-white group-hover:border-brand-dark bg-white/50 backdrop-blur-sm',
};

const VARIANT: Record<string, Variant> = {
  gst: {
    span: 'md:col-span-2 lg:col-span-2 md:order-1 lg:order-1',
    container: 'bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border-zinc-200 hover:border-brand-moss/30',
    textTitle: 'text-brand-dark',
    textDesc: 'text-brand-stone',
    arrowBtn: DEFAULT_VARIANT.arrowBtn,
  },
  'income-tax': {
    span: 'md:col-span-1 lg:col-span-1 md:order-2 lg:order-2',
    container: 'bg-card-moss-deep border-transparent',
    textTitle: 'text-white',
    textDesc: 'text-white/85',
    arrowBtn: 'border-white/20 text-white group-hover:bg-white group-hover:text-brand-moss group-hover:border-white bg-white/10',
  },
  'company-law': {
    span: 'md:col-span-1 lg:col-span-1 md:order-3 lg:order-3',
    container: DEFAULT_VARIANT.container,
    textTitle: DEFAULT_VARIANT.textTitle,
    textDesc: DEFAULT_VARIANT.textDesc,
    arrowBtn: DEFAULT_VARIANT.arrowBtn,
  },
  litigation: {
    span: 'md:col-span-2 lg:col-span-2 md:order-4 lg:order-7',
    container: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-brand-black border-zinc-700 hover:border-zinc-600',
    textTitle: 'text-white',
    textDesc: 'text-zinc-300',
    arrowBtn: 'border-white/20 text-white group-hover:bg-brand-brass group-hover:text-white group-hover:border-brand-brass bg-white/5',
  },
  advisory: {
    span: 'md:col-span-1 lg:col-span-1 md:order-5 lg:order-5',
    container: 'bg-gradient-to-br from-[#fafaf9] to-[#e7e5e4] border-transparent hover:border-brand-moss/20',
    textTitle: 'text-brand-dark',
    textDesc: 'text-brand-stone',
    arrowBtn: 'border-brand-border text-brand-dark group-hover:bg-brand-moss group-hover:text-white group-hover:border-brand-moss bg-white/50',
  },
  audit: {
    span: 'md:col-span-1 lg:col-span-1 md:order-6 lg:order-4',
    container: 'bg-gradient-to-br from-white to-slate-50 border-brand-border/40 hover:border-brand-border',
    textTitle: DEFAULT_VARIANT.textTitle,
    textDesc: DEFAULT_VARIANT.textDesc,
    arrowBtn: DEFAULT_VARIANT.arrowBtn,
  },
  bookkeeping: {
    span: 'md:col-span-1 lg:col-span-1 md:order-7 lg:order-6',
    container: DEFAULT_VARIANT.container,
    textTitle: DEFAULT_VARIANT.textTitle,
    textDesc: DEFAULT_VARIANT.textDesc,
    arrowBtn: DEFAULT_VARIANT.arrowBtn,
  },
  payroll: {
    span: 'md:col-span-1 lg:col-span-1 md:order-8 lg:order-8',
    container: 'bg-gradient-to-br from-neutral-900 to-brand-black border-neutral-800 hover:border-neutral-700',
    textTitle: 'text-white',
    textDesc: 'text-zinc-300',
    arrowBtn: 'border-white/20 text-white group-hover:bg-brand-brass group-hover:text-white group-hover:border-brand-brass bg-white/5',
  },
};

const ServiceBento: React.FC = () => {
  return (
    // LAYOUT INTENT: service.id controls visual weight and responsive ordering; card order in constants can change without breaking the bento rhythm.
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {SERVICES.map((service, index) => {
        const v = VARIANT[service.id] ?? DEFAULT_VARIANT;

        return (
          <Reveal 
            key={service.id} 
            delay={index * 0.05}
            className={v.span}
            variant="fade-up"
            width="100%"
          >
            <Link
              to={service.link}
              className={`
                group relative flex flex-col justify-between p-6 md:p-8 h-full min-h-[220px] md:min-h-[260px] rounded-[2rem] border 
                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                card-surface-hover
                overflow-hidden ${v.container}
              `}
              aria-label={`View details for ${service.title}`}
            >
              {/* 3C. Top Border Reveal */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-brand-moss to-[#4ADE80] transition-all duration-700 ease-out group-hover:w-full z-20"></div>

              {/* 4. Arrow Button */}
              <div className="relative z-10 flex justify-end mb-4">
                <div className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center 
                  transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                  group-hover:rotate-45 shadow-sm backdrop-blur-sm
                  ${v.arrowBtn}
                `}>
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 mt-auto">
                <h3 className={`
                  text-2xl md:text-4xl font-heading font-bold mb-3 leading-tight tracking-tight
                  transition-transform duration-500 group-hover:translate-x-1
                  ${v.textTitle}
                `}>
                  {service.title}
                </h3>
                <p className={`
                  font-medium text-sm md:text-base leading-relaxed max-w-sm
                  transition-all duration-500 group-hover:opacity-100 opacity-90
                  ${v.textDesc}
                `}>
                  {service.description}
                </p>
              </div>
            </Link>
          </Reveal>
        );
      })}

      {/* NEW CTA CARD - Fills the last slot next to Payroll */}
      <Reveal 
        delay={0.4} 
        className="md:col-span-2 lg:col-span-1 md:order-9 lg:order-9"
        variant="fade-up"
        width="100%"
      >
        <Link 
          to="/contact" 
          className="group relative flex flex-col justify-between p-6 md:p-8 h-full min-h-[220px] md:min-h-[260px] rounded-[2rem] border border-transparent bg-card-moss-cta overflow-hidden hover:shadow-2xl hover:shadow-brand-moss/30 transition-all duration-500"
        >
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[40px] pointer-events-none translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-[40px] pointer-events-none -translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>

          <div className="relative z-10">
             <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-4">
               Get Started
             </span>
             <h3 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
                Need Expert <br/> Guidance?
             </h3>
          </div>

          <div className="relative z-10 flex justify-end mt-auto">
             <div className="px-5 py-3 bg-white text-brand-moss rounded-full font-bold text-sm flex items-center gap-2 group-hover:bg-brand-dark group-hover:text-white transition-all duration-300 shadow-lg group-hover:shadow-xl">
                Book Consultation <ArrowUpRight size={16} />
             </div>
          </div>
        </Link>
      </Reveal>
    </div>
  );
};

export default ServiceBento;
