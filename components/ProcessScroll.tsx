import React, { useRef, useEffect, useState } from 'react';
import { Search, Layout, Rocket } from 'lucide-react';

const ProcessScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      id: '01',
      title: 'Discovery',
      desc: 'We begin with a forensic analysis of your current financial health, identifying risks, inefficiencies, and opportunities.',
      icon: <Search size={40} className="text-brand-moss" />
    },
    {
      id: '02',
      title: 'Strategy',
      desc: 'We formulate a bespoke roadmap. This isn’t a template; it’s a strategic framework engineered for your specific growth targets.',
      icon: <Layout size={40} className="text-brand-moss" />
    },
    {
      id: '03',
      title: 'Execution',
      desc: 'Deployment. We implement the strategy with rigorous precision, ensuring compliance while unlocking value.',
      icon: <Rocket size={40} className="text-brand-moss" />
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActivePhase(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Trigger when 60% visible
      }
    );

    const elements = containerRef.current?.querySelectorAll('.snap-section');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Dynamic styling based on active phase
  const getTheme = (index: number) => {
    if (index === 0) return 'bg-brand-bg text-brand-dark';
    if (index === 1) return 'bg-brand-mossLight text-brand-dark';
    return 'bg-brand-dark text-brand-surface';
  };

  return (
    <div className={`relative w-full transition-colors duration-700 ease-in-out ${getTheme(activePhase)}`}>
      
      {/* Sticky Progress Indicator */}
      <div className="absolute top-10 left-4 md:left-10 z-20 flex flex-col gap-2 pointer-events-none">
         <span className="text-xs font-bold uppercase tracking-widest opacity-50">The Methodology</span>
         <div className="flex gap-2">
            {phases.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === activePhase ? 'w-8 bg-current opacity-100' : 'w-2 bg-current opacity-30'}`}
              />
            ))}
         </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory w-full h-screen no-scrollbar scroll-smooth"
      >
        {phases.map((phase, i) => (
          <div 
            key={i} 
            data-index={i}
            className="snap-section snap-center shrink-0 w-full h-screen flex flex-col justify-center items-center px-6 relative"
          >
             <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                <div className="order-2 md:order-1">
                    <div className="mb-6 p-6 rounded-full border border-current inline-block opacity-80">
                         {phase.icon}
                    </div>
                    <h3 className="text-4xl md:text-7xl font-heading font-bold mb-6 leading-tight">
                        {phase.title}
                    </h3>
                    <p className="text-xl md:text-2xl opacity-80 leading-relaxed max-w-xl">
                        {phase.desc}
                    </p>
                </div>
                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                    <div className="font-serif italic text-[10rem] md:text-[15rem] leading-none opacity-10 select-none">
                        {phase.id}
                    </div>
                </div>
             </div>
          </div>
        ))}
        
        {/* Results Slide */}
        <div 
           data-index={phases.length} // Treat as last index for styling
           className="snap-section snap-center shrink-0 w-full h-screen flex justify-center items-center bg-brand-dark text-white px-6"
        >
             <h3 className="text-5xl md:text-8xl font-serif italic opacity-50 text-center">
                Results Delivered.
             </h3>
        </div>
      </div>
    </div>
  );
};

export default ProcessScroll;