
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
          
          {/* Left: Visual with layered elements */}
          <div className="relative">
            <Parallax speed={-0.1}>
              {/* Large decorative letter */}
              <div className="absolute -top-20 -left-10 text-[15rem] md:text-[20rem] font-heading font-bold text-brand-moss/5 select-none leading-none -z-10">
                S
              </div>
            </Parallax>
            
            {/* Stacked card effect */}
            <div className="relative group perspective-[1000px]">
              {/* Background card */}
              <div className="absolute inset-4 bg-brand-moss/10 rounded-[2.5rem] -rotate-3 transition-transform duration-700 group-hover:rotate-0" />
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-brand-moss to-[#0f2e1b] rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                {/* Noise texture */}
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
                
                {/* Floating orbs */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-blob" />
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-[#4ADE80]/20 rounded-full blur-xl animate-blob animation-delay-2000" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 text-3xl font-heading font-bold shadow-lg">
                    SHR
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-heading font-bold">{CONTACT_INFO.founder.name}</h3>
                    <p className="text-white/70 font-medium text-lg border-b border-white/10 pb-4 inline-block">{CONTACT_INFO.founder.title}</p>
                    
                    {/* Credential tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {CONTACT_INFO.founder.qualifications.map((q, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 shadow-sm">
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
              <span className="text-brand-moss font-bold tracking-widest uppercase text-xs">Meet the Expert</span>
            </Reveal>
            
            <Reveal variant="reveal-mask" delay={0.1}>
              <h2 className="text-5xl md:text-7xl font-heading font-bold text-brand-dark leading-[0.9]">
                Precision meets <br/>
                <span className="font-serif italic font-normal text-brand-stone">passion.</span>
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
                  <span key={i} className="px-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm font-bold text-brand-dark hover:bg-brand-moss hover:text-white hover:border-brand-moss transition-all duration-300 cursor-default">
                    {spec}
                  </span>
                ))}
              </div>
            </Reveal>
            
            <Reveal delay={0.5}>
              <Link to="/about" className="inline-flex items-center gap-3 group mt-4">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-dark group-hover:text-brand-moss transition-colors">
                  Full Profile
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