import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';

const Careers: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                Careers
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Join The <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">Elite.</span>
              </h1>
              <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 We are always looking for sharp minds. If you are passionate about finance and solving complex problems, this is your arena.
              </p>
           </div>
        </div>
      </section>

      <div className="py-20 px-4 md:px-6">
       <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-10">
                   <div className="p-2 bg-brand-moss/10 rounded-lg"><Briefcase className="text-brand-moss" size={24} /></div>
                   <h2 className="text-3xl font-heading font-bold text-brand-dark">Open Positions</h2>
                </div>
                
                {[
                  { role: 'Audit Associate', exp: '1-2 Years', type: 'Full Time' },
                  { role: 'Articled Assistant', exp: 'Fresher', type: 'Internship' }
                ].map((job, idx) => (
                  <div key={idx} className="p-10 bg-brand-surface rounded-[2rem] border border-brand-border hover:border-brand-moss hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-2xl text-brand-dark font-heading font-bold group-hover:text-brand-moss transition-colors">{job.role}</h3>
                        <span className="px-4 py-1 bg-brand-bg rounded-full text-brand-stone text-xs font-bold uppercase tracking-widest border border-brand-border group-hover:bg-brand-moss group-hover:text-white transition-colors">{job.type}</span>
                     </div>
                     <p className="text-brand-stone text-base mb-8 font-medium relative z-10">Mysuru, KA • Experience: {job.exp}</p>
                     <div className="flex items-center gap-2 text-brand-dark font-bold text-sm group-hover:gap-4 transition-all relative z-10">
                       Apply Now <ArrowRight size={16} />
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="lg:col-span-1">
                <div className="bg-brand-dark text-brand-surface p-10 rounded-[2.5rem] sticky top-32 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[60px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-heading font-bold mb-8">Why Join Us?</h3>
                    <ul className="space-y-6 text-brand-surface/80 text-lg font-medium">
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Mentorship from Partners</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Diverse Corporate Exposure</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Continuous Learning Culture</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Competitive Compensation</li>
                    </ul>
                  </div>
                </div>
             </div>
          </div>
       </div>
      </div>
    </div>
  );
};

export default Careers;