import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../../constants/faq';
import Reveal from '../Reveal';

const FAQPreview: React.FC = () => {
  // Get top 3 General FAQs
  const featuredFaqs = FAQS.filter((f) => f.category === 'General & Onboarding').slice(0, 3);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Open first FAQ by default on desktop only
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setOpenIndex(0);
    }
  }, []);

  return (
    <section className="relative bg-brand-bg px-4 py-32 md:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <Reveal>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-moss">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-heading text-5xl font-bold text-brand-dark md:text-6xl">
              Quick <span className="font-serif font-normal italic text-brand-stone">answers.</span>
            </h2>
          </Reveal>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          {featuredFaqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.1} width="100%">
              <div
                className={`overflow-hidden rounded-[1.5rem] border bg-white transition-all duration-500 ${
                  openIndex === i
                    ? 'scale-[1.02] border-brand-moss shadow-xl shadow-brand-moss/10'
                    : 'border-brand-border hover:border-brand-moss/30 hover:shadow-lg'
                } `}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="group flex w-full items-center justify-between gap-4 p-6 text-left focus:outline-none md:p-8"
                  aria-expanded={openIndex === i}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                        openIndex === i
                          ? 'bg-brand-moss text-white'
                          : 'bg-brand-bg text-brand-stone group-hover:bg-brand-moss/10 group-hover:text-brand-moss'
                      } `}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3
                      className={`font-heading text-lg font-bold transition-colors md:text-xl ${
                        openIndex === i ? 'text-brand-moss' : 'text-brand-dark'
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                      openIndex === i
                        ? 'rotate-180 border-brand-moss bg-brand-moss text-white'
                        : 'border-brand-border text-brand-stone group-hover:border-brand-moss group-hover:text-brand-moss'
                    } `}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {/* Expandable answer */}
                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} `}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-8 pt-0 md:px-8">
                      <div className="border-l-2 border-brand-moss/20 pl-14">
                        <p className="text-lg font-medium leading-relaxed text-brand-stone">{faq.answer}</p>
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
          <div className="mt-12 text-center">
            <Link
              to="/faqs"
              className="group inline-flex items-center gap-3 rounded-full border border-brand-border bg-white px-8 py-4 font-bold text-brand-dark shadow-lg transition-all duration-300 hover:border-brand-moss hover:bg-brand-moss hover:text-white hover:shadow-xl"
            >
              View All FAQs
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FAQPreview;
