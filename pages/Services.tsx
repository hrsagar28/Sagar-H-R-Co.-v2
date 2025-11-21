import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, INDUSTRIES } from '../constants';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-5xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                Our Expertise
             </div>
             <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark mb-8 tracking-tighter leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
               Holistic <br/>
               <span className="text-brand-stone opacity-50 font-serif italic">Solutions.</span>
             </h1>
             <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl">
                   We architect financial stability. From regulatory compliance to high-level strategic advisory, our services are designed for the modern enterprise.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Services Index */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
           <div className="flex flex-col gap-4">
              {SERVICES.map((service, idx) => (
                <Link 
                  to={service.link} 
                  key={idx}
                  className="group relative bg-brand-surface rounded-[2rem] p-8 md:p-16 border border-brand-border hover:border-brand-moss transition-all duration-500 hover:shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-20"
                >
                   <div className="absolute inset-0 bg-brand-moss/0 group-hover:bg-brand-moss/[0.02] transition-colors duration-500"></div>

                   <div className="relative z-10 flex-1 max-w-4xl">
                      <h3 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark mb-6 group-hover:text-brand-moss transition-colors duration-300 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-brand-stone text-lg md:text-xl font-medium leading-relaxed group-hover:text-brand-dark transition-colors duration-300 max-w-2xl">
                        {service.description}
                      </p>
                      
                      <div className="mt-8 flex items-center gap-3 text-brand-moss font-bold text-sm uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                         Explore Service <ArrowRight size={16} />
                      </div>
                   </div>

                   <div className="relative z-10 shrink-0 self-start md:self-center border-t md:border-t-0 md:border-l border-brand-border/40 pt-6 md:pt-0 md:pl-16 w-full md:w-auto text-right md:text-left">
                      <span className="block text-6xl md:text-9xl font-heading font-bold text-brand-border/50 group-hover:text-brand-moss/20 transition-colors duration-500 tabular-nums tracking-tighter leading-none">
                         {idx < 9 ? `0${idx + 1}` : idx + 1}
                      </span>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-brand-surface border-y border-brand-border">
         <div className="container mx-auto max-w-7xl">
            <div className="mb-16 md:mb-24 max-w-4xl">
                <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Our Methodology</span>
                <h2 className="text-4xl md:text-7xl font-heading font-bold text-brand-dark mb-8 tracking-tighter">
                    Precision in Process.
                </h2>
                <p className="text-xl text-brand-stone font-medium leading-relaxed max-w-2xl">
                    We believe in a proactive engagement model. We don't wait for deadlines; we plan for them. Our process is designed to ensure accuracy, foresight, and strategic advantage.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-brand-border/60">
                {[
                    { phase: '01', title: 'Discovery', desc: 'We dive deep into your business structure and financial history to identify needs, risks, and opportunities.' },
                    { phase: '02', title: 'Strategy', desc: 'We architect a tailored compliance and growth roadmap aligned with your specific business goals.' },
                    { phase: '03', title: 'Execution', desc: 'We implement solutions with rigorous attention to detail, ensuring full regulatory adherence and efficiency.' }
                ].map((step, i) => (
                    <div key={i} className="group p-10 md:p-16 border-r border-b border-brand-border/60 bg-brand-bg/10 hover:bg-brand-bg transition-colors duration-500 relative flex flex-col justify-between min-h-[300px]">
                         <div>
                            <span className="block text-xs font-bold uppercase tracking-widest text-brand-stone/60 mb-8 group-hover:text-brand-moss transition-colors">
                                Phase {step.phase}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-6 group-hover:translate-x-2 transition-transform duration-500">
                                {step.title}
                            </h3>
                         </div>
                         <p className="text-brand-stone font-medium leading-relaxed text-lg border-t border-brand-border/30 pt-8 mt-8">
                            {step.desc}
                         </p>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 px-4 md:px-6 bg-brand-dark text-brand-surface rounded-t-[3rem] md:rounded-t-[5rem] relative -mt-20 z-20 shadow-2xl">
        <div className="container mx-auto max-w-7xl">
           <div className="mb-16 md:mb-24 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                 <span className="text-green-400 font-bold tracking-widest uppercase text-sm mb-3 block">Sectors</span>
                 <h2 className="text-4xl md:text-7xl font-heading font-bold tracking-tighter text-white">Industries We Serve</h2>
              </div>
              <p className="text-zinc-400 max-w-md text-lg text-right md:text-left font-medium">
                 Specialized knowledge across diverse verticals ensures relevant and impactful advice.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {INDUSTRIES.map((industry, idx) => (
                 <div key={idx} className="group p-8 md:p-10 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 hover:border-white/20">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-green-400 mb-8 group-hover:scale-110 group-hover:bg-green-400 group-hover:text-brand-dark transition-all duration-300 shadow-lg shadow-black/20">
                       {React.cloneElement(industry.icon as React.ReactElement<any>, { size: 26, strokeWidth: 1.5 })}
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-3 text-white group-hover:text-green-400 transition-colors">{industry.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium group-hover:text-zinc-300">{industry.description}</p>
                 </div>
              ))}
           </div>
           
           <div className="mt-20 flex justify-center">
              <Link to="/contact" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-brand-dark transition-all duration-300 text-white font-bold">
                Industry not listed? Contact Us <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Services;