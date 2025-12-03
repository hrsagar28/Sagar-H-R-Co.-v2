
import React, { useRef, useEffect, useState } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import CareerForm from '../components/forms/CareerForm';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';

const Careers: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  // --- OPTIMIZED STICKY SCROLL LOGIC ---
  useEffect(() => {
    let rAFId: number;
    let currentY = 0;
    let targetY = 0;

    const loop = () => {
      if (!containerRef.current || !sidebarRef.current || window.innerWidth < 1024) {
        if (sidebarRef.current) sidebarRef.current.style.transform = 'translate3d(0,0,0)';
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const stickyTopOffset = 120; 
      const maxTranslate = containerRef.current.offsetHeight - sidebarRef.current.offsetHeight;

      if (maxTranslate <= 0) {
         rAFId = requestAnimationFrame(loop);
         return;
      }
      
      if (containerRect.top < stickyTopOffset) {
        targetY = stickyTopOffset - containerRect.top;
      } else {
        targetY = 0;
      }

      if (targetY > maxTranslate) {
        targetY = maxTranslate;
      }
      if (targetY < 0) targetY = 0;

      currentY += (targetY - currentY) * 0.2;

      if (Math.abs(targetY - currentY) < 0.1) {
        currentY = targetY;
      }

      sidebarRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      rAFId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(rAFId);
  }, []);

  const handleApplyClick = (role: string) => {
    setSelectedPosition(role);
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Careers | Join Sagar H R & Co."
        description="Career opportunities for Chartered Accountants, Articles, and Audit Associates in Mysuru."
      />

      {/* UNIFIED HERO SECTION */}
      <PageHero
        tag="Careers"
        title="Work With"
        subtitle="Us."
        description="We are looking for dedicated professionals passionate about finance and accounting."
        className="z-base"
      />

      <div className="py-20 px-4 md:px-6">
       <div className="container mx-auto max-w-7xl">
          <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
             
             {/* Left Column: Jobs & Application Form */}
             <div className="lg:col-span-2 space-y-12">
                <div className="space-y-6">
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
                         <button 
                            onClick={() => handleApplyClick(job.role)}
                            className="flex items-center gap-2 text-brand-dark font-bold text-sm group-hover:gap-4 transition-all relative z-10 hover:text-brand-moss focus:outline-none"
                         >
                           Apply Now <ArrowRight size={16} />
                         </button>
                      </div>
                    ))}
                </div>

                {/* APPLICATION FORM SECTION */}
                <div className="pt-10" ref={formSectionRef}>
                    <CareerForm initialPosition={selectedPosition} />
                </div>
             </div>
             
             {/* Right Column: Sticky Sidebar */}
             <div className="lg:col-span-1 z-base">
                <div 
                  ref={sidebarRef}
                  className="bg-brand-dark text-brand-surface p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden will-change-transform"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[60px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-heading font-bold mb-8">Why Join Us?</h3>
                    <ul className="space-y-6 text-brand-surface/80 text-lg font-medium">
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Mentorship</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Corporate Exposure</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Continuous Learning</li>
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
