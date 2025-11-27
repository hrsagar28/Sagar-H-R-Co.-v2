import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Marquee: React.FC = React.memo(() => {
  const shouldReduceMotion = useReducedMotion();

  const content = [
    { prefix: "Strategic", highlight: "Finance" },
    { prefix: "Precision", highlight: "Audit" },
    { prefix: "Expert", highlight: "Taxation" },
    { prefix: "Business", highlight: "Advisory" },
    { prefix: "Regulatory", highlight: "Compliance" },
    { prefix: "Growth", highlight: "Strategy" },
  ];

  const ItemGroup = () => (
    <>
      {content.map((item, i) => (
        <div key={i} className="flex items-center gap-6 mx-8">
           <span className="font-serif italic text-4xl md:text-6xl text-brand-stone opacity-70 font-light">
             {item.prefix}
           </span>
           <span className="font-heading font-bold text-4xl md:text-6xl text-brand-dark uppercase tracking-tight">
             {item.highlight}
           </span>
           <div className="w-3 h-3 rounded-full border border-brand-moss ml-8"></div>
        </div>
      ))}
    </>
  );

  return (
    <div className="py-20 bg-brand-bg border-y border-brand-border/60 relative overflow-hidden flex select-none group">
       {/* Gradient Masks for smooth fade in/out */}
       <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-brand-bg to-transparent z-10 pointer-events-none"></div>
       <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-brand-bg to-transparent z-10 pointer-events-none"></div>

       <div 
         className="animate-marquee flex items-center shrink-0 group-hover:[animation-play-state:paused]"
         style={shouldReduceMotion ? { animationPlayState: 'paused' } : {}}
       >
          <ItemGroup />
       </div>
       <div 
         className="animate-marquee flex items-center shrink-0 group-hover:[animation-play-state:paused]"
         style={shouldReduceMotion ? { animationPlayState: 'paused' } : {}}
       >
          <ItemGroup />
       </div>
    </div>
  );
});

export default Marquee;