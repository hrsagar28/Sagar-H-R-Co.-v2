
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';
import Parallax from '../Parallax';

const { Link } = ReactRouterDOM;

const FounderSection: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-brand-surface">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Visual - Simplified */}
          <div className="relative">
            <Parallax speed={-0.1}>
              {/* Large decorative letter */}
              <div className="absolute -top-20 -left-10 text-[15rem] md:text-[20rem] font-heading font-bold text-brand-moss/5 select-none leading-none -z-10">
                S
              </div>
            </Parallax>
            
            <div className="relative group">
              <div className="relative bg-brand-bg rounded-[2.5rem] p-8 md:p-12 border border-brand-border">
                <div className="relative z-10">
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark">{CONTACT_INFO.founder.name}</h3>
                    <p className="text-brand-stone font-medium text-lg border-b border-brand-border pb-4 inline-block">{CONTACT_INFO.founder.title}</p>
                    
                    {/* Credential tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {CONTACT_INFO.founder.qualifications.map((q, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-brand-border rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-brand-dark">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Editorial text */}
          <div className="space-y-8">
            <Reveal variant="fade-up">
              <span className="text-brand-moss font-bold tracking-widest uppercase text-xs">Principal Partner</span>
            </Reveal>
            
            <Reveal variant="reveal-mask" delay={0.1}>
              <h2 className="text-5xl md:text-6xl font-heading font-bold text-brand-dark leading-[0.9]">
                Professional <br/>
                <span className="font-serif italic font-normal text-brand-stone">Expertise.</span>
              </h2>
            </Reveal>
            
            <Reveal delay={0.3}>
              <p className="text-xl text-brand-stone font-medium leading-relaxed border-l-2 border-brand-moss pl-6">
                {CONTACT_INFO.founder.bio}
              </p>
            </Reveal>
            
            <Reveal delay={0.4}>
              <div className="flex flex-wrap gap-3 pt-4">
                {CONTACT_INFO.founder.specializations.map((spec, i) => (
                  <span key={i} className="px-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm font-bold text-brand-dark cursor-default">
                    {spec}
                  </span>
                ))}
              </div>
            </Reveal>
            
            <Reveal delay={0.5}>
              <Link to="/about" className="inline-flex items-center gap-3 group mt-4">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-dark group-hover:text-brand-moss transition-colors">
                  View Profile
                </span>
                <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center group-hover:bg-brand-moss group-hover:border-brand-moss group-hover:text-white transition-all duration-300">
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </Reveal>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
