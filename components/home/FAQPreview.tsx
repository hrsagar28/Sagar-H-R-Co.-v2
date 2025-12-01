
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../../constants/faq';
import Reveal from '../Reveal';

const FAQPreview: React.FC = () => {
  // Get top 3 General FAQs
  const featuredFaqs = FAQS.filter(f => f.category === 'General & Onboarding').slice(0, 3);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-32 px-4 md:px-6 bg-brand-bg relative">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-brand-dark">
              Quick <span className="font-serif italic font-normal text-brand-stone">answers.</span>
            </h2>
          </Reveal>
        </div>
        
        {/* FAQ Cards */}
        <div className="space-y-4">
          {featuredFaqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.1} width="100%">
              <div 
                className={`
                  bg-white border rounded-[1.5rem] overflow-hidden transition-all duration-500
                  ${openIndex === i 
                    ? 'border-brand-moss shadow-xl shadow-brand-moss/10 scale-[1.02]' 
                    : 'border-brand-border hover:border-brand-moss/30 hover:shadow-lg'
                  }
                `}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 md:p-8 flex items-center justify-between gap-4 text-left group focus:outline-none"
                  aria-expanded={openIndex === i}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${openIndex === i 
                        ? 'bg-brand-moss text-white' 
                        : 'bg-brand-bg text-brand-stone group-hover:bg-brand-moss/10 group-hover:text-brand-moss'
                      }
                    `}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className={`text-lg md:text-xl font-heading font-bold transition-colors ${
                      openIndex === i ? 'text-brand-moss' : 'text-brand-dark'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  
                  <div className={`
                    w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500
                    ${openIndex === i 
                      ? 'bg-brand-moss border-brand-moss text-white rotate-180' 
                      : 'border-brand-border text-brand-stone group-hover:border-brand-moss group-hover:text-brand-moss'
                    }
                  `}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                {/* Expandable answer */}
                <div className={`
                  grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                `}>
                  <div className="overflow-hidden">
                    <div className="px-6 md:px-8 pb-8 pt-0">
                      <div className="pl-14 border-l-2 border-brand-moss/20">
                        <p className="text-brand-stone font-medium leading-relaxed text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        
        {/* View All CTA */}
        <Reveal delay={0.4}>
          <div className="text-center mt-12">
            <Link 
              to="/faqs" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-brand-border rounded-full font-bold text-brand-dark hover:bg-brand-moss hover:text-white hover:border-brand-moss transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              View All FAQs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
        
      </div>
    </section>
  );
};

export default FAQPreview;
