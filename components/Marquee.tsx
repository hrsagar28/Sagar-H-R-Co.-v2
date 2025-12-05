
import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInView } from '../hooks/useInView';

const Marquee: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();
  const [ref, isVisible] = useInView({ rootMargin: '100px' });

  const services = [
    "Statutory Audit",
    "Direct Tax",
    "GST",
    "Company Law",
    "Business Advisory",
    "Internal Audit"
  ];

  const ItemGroup = () => (
    <>
      {services.map((item, i) => (
        <div key={i} className="flex items-center gap-6 mx-8">
           <span className="font-heading font-medium text-3xl md:text-5xl text-brand-dark tracking-tight whitespace-nowrap">
             {item}
           </span>
           <div className="w-2 h-2 rounded-full bg-brand-moss ml-8"></div>
        </div>
      ))}
    </>
  );

  const isPlaying = isVisible && !shouldReduceMotion;
  const animationStyle = { 
    animationPlayState: isPlaying ? 'running' : 'paused' 
  };

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="py-16 bg-brand-bg border-y border-brand-border/60 relative overflow-hidden flex select-none group"
    >
       {/* Gradient Masks for smooth fade in/out */}
       <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-brand-bg to-transparent z-10 pointer-events-none"></div>
       <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-brand-bg to-transparent z-10 pointer-events-none"></div>

       <div 
         className="animate-marquee flex items-center shrink-0 group-hover:[animation-play-state:paused]"
         style={animationStyle}
       >
          <ItemGroup />
       </div>
       <div 
         className="animate-marquee flex items-center shrink-0 group-hover:[animation-play-state:paused]"
         style={animationStyle}
       >
          <ItemGroup />
       </div>
    </div>
  );
});

export default Marquee;
