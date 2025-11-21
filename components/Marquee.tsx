import React from 'react';

interface MarqueeProps {
  text: string;
}

const Marquee: React.FC<MarqueeProps> = ({ text }) => {
  return (
    <div className="py-20 overflow-hidden bg-brand-bg relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-[1px] bg-brand-border/50"></div>
      </div>
      <div className="relative flex overflow-x-hidden py-8 bg-brand-dark rotate-1 hover:rotate-0 transition-transform duration-700 border-y border-brand-stone/30">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          <span className="text-7xl md:text-9xl font-heading font-bold text-brand-bg mx-4 uppercase tracking-tighter opacity-90">{text}</span>
          <span className="text-7xl md:text-9xl font-heading font-bold text-brand-bg mx-4 uppercase tracking-tighter opacity-90">{text}</span>
        </div>
        <div className="absolute top-0 py-8 animate-marquee2 whitespace-nowrap flex gap-8">
           <span className="text-7xl md:text-9xl font-heading font-bold text-brand-bg mx-4 uppercase tracking-tighter opacity-90">{text}</span>
           <span className="text-7xl md:text-9xl font-heading font-bold text-brand-bg mx-4 uppercase tracking-tighter opacity-90">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;