import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../constants';

const ServiceAccordion: React.FC = () => {
  return (
    <div className="relative w-full border-t border-brand-dark">
      {/* Accordion List */}
      {SERVICES.map((service, index) => (
        <Link 
          to={service.link} 
          key={service.id}
          className="group block w-full border-b border-brand-dark/20 py-10 md:py-16 relative overflow-hidden transition-colors duration-500 hover:bg-brand-surface"
        >
           <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div className="flex items-baseline gap-6 md:gap-12">
                 <span className="text-sm md:text-lg font-bold text-brand-stone/50 font-serif italic">
                   0{index + 1}
                 </span>
                 <h3 className="text-3xl md:text-6xl font-heading font-bold text-brand-dark group-hover:text-brand-moss transition-colors duration-300">
                   {service.title}
                 </h3>
              </div>
              
              <div className="flex items-center gap-6 md:gap-12 self-end md:self-center">
                 <div className="hidden md:block max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-brand-stone font-medium text-sm leading-relaxed text-right">
                    {service.description}
                 </div>
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-brand-dark/20 flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <ArrowUpRight size={24} />
                 </div>
              </div>
           </div>
        </Link>
      ))}
    </div>
  );
};

export default ServiceAccordion;