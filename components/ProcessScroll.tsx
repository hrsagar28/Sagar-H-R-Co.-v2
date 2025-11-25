import React, { useRef, useEffect, useState } from 'react';
import { Search, Layout, Rocket } from 'lucide-react';

const ProcessScroll: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate how far we've scrolled *into* the section (sticky logic)
      // We want the animation to start when section hits top of viewport
      // And end when the bottom of section hits bottom of viewport
      
      const scrollDistance = -sectionTop; 
      const maxScroll = sectionHeight - windowHeight;
      
      let p = scrollDistance / maxScroll;
      
      // Clamp
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Dynamic background color based on progress
  // 0-0.33: Light, 0.33-0.66: Moss Light, 0.66-1: Dark
  let bgClass = "bg-brand-bg";
  if (progress > 0.6) bgClass = "bg-brand-dark text-brand-surface";
  else if (progress > 0.3) bgClass = "bg-brand-mossLight text-brand-dark";

  return (
    <div ref={sectionRef} className="relative h-[300vh] w-full">
       <div className={`sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center transition-colors duration-700 ${bgClass}`}>
          
          <div className="absolute top-10 left-10 z-10">
             <span className="text-xs font-bold uppercase tracking-widest opacity-50">The Methodology</span>
          </div>

          <div className="container mx-auto max-w-7xl px-4 relative">
             
             {/* Horizontal Movement Container */}
             <div 
               className="flex gap-20 md:gap-40 will-change-transform"
               style={{ transform: `translateX(-${progress * 200}%)` }} // Move 2 full widths roughly
             >
               {phases.map((phase, i) => (
                  <div key={i} className="min-w-[80vw] md:min-w-[40vw] shrink-0">
                      <div className="mb-8 opacity-50 font-serif italic text-6xl md:text-8xl">
                        {phase.id}
                      </div>
                      <div className="mb-8 p-6 rounded-full border border-current inline-block opacity-80">
                         {phase.icon}
                      </div>
                      <h3 className="text-4xl md:text-7xl font-heading font-bold mb-6 leading-tight">
                        {phase.title}
                      </h3>
                      <p className="text-xl md:text-2xl opacity-80 leading-relaxed max-w-xl">
                        {phase.desc}
                      </p>
                  </div>
               ))}
               
               {/* Final decorative slide */}
               <div className="min-w-[50vw] shrink-0 flex items-center">
                   <div className="text-4xl md:text-6xl font-serif italic opacity-50">
                      Results Delivered.
                   </div>
               </div>
             </div>

             {/* Progress Line */}
             <div className="absolute bottom-0 left-0 w-full h-[1px] bg-current opacity-20 mt-20">
                <div 
                  className="h-full bg-brand-moss transition-all duration-100 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                ></div>
             </div>

          </div>
       </div>
    </div>
  );
};

export default ProcessScroll;