
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { MessageSquare, Phone, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import Reveal from './Reveal';

const { Link } = ReactRouterDOM;

const ConsultationBanner: React.FC = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-br from-brand-moss to-[#0f2e1b] relative overflow-hidden print:hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/20 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-5xl relative z-10 text-center">
        <Reveal variant="scale">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 tracking-tight">
            Navigate Complexity with Confidence.
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether it's a tax audit, GST compliance, or strategic business expansion, our experts are ready to guide you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/contact" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-moss rounded-full font-bold text-base hover:bg-brand-bg transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
            >
              Book Free Consultation <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a 
              href={`tel:${CONTACT_INFO.phone.value}`}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Phone size={18} /> {CONTACT_INFO.phone.display}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ConsultationBanner;