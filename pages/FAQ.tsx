import React, { useState, useEffect } from 'react';
import { FAQS } from '../constants';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Group FAQs by category
  const categories = Array.from(new Set(FAQS.map(item => item.category)));

  const toggleAccordion = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  // Inject JSON-LD for SEO
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="pt-40 pb-20 px-4 md:px-6 bg-brand-bg">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl md:text-8xl font-heading font-bold text-brand-dark mb-6 md:mb-8 text-center tracking-tighter">
          Frequently Asked <span className="text-brand-moss">Questions</span>
        </h1>
        <p className="text-brand-stone text-center max-w-2xl mx-auto mb-16 text-lg md:text-xl font-medium">
          Clear answers to your financial queries. From tax planning to compliance, we have got you covered.
        </p>

        {/* Grouped Accordion */}
        <div className="space-y-16">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="animate-fade-in-up">
              <h2 className="text-2xl font-heading font-bold text-brand-dark mb-6 pl-2 border-l-4 border-brand-moss">
                {category}
              </h2>
              <div className="space-y-4">
                {FAQS.filter(f => f.category === category).map((faq, index) => {
                  // Calculate a unique index for the whole list to manage open state if needed
                  // But here we just use a simple combined key for toggle
                  const uniqueId = FAQS.indexOf(faq);
                  
                  return (
                    <div 
                      key={uniqueId} 
                      className={`bg-brand-surface border rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg ${activeIndex === uniqueId ? 'border-brand-moss shadow-md' : 'border-brand-border'}`}
                    >
                      <button 
                        className="w-full flex justify-between items-start md:items-center text-left focus:outline-none group gap-4"
                        onClick={() => toggleAccordion(uniqueId)}
                      >
                        <span className={`text-lg md:text-xl font-heading font-bold transition-colors leading-tight ${activeIndex === uniqueId ? 'text-brand-moss' : 'text-brand-dark'}`}>
                          {faq.question}
                        </span>
                        <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${activeIndex === uniqueId ? 'bg-brand-moss text-white rotate-180' : 'bg-brand-bg text-brand-dark'}`}>
                          {activeIndex === uniqueId ? <Minus size={20} /> : <Plus size={20} />}
                        </span>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === uniqueId ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}
                      >
                        <div className="text-brand-stone leading-relaxed font-medium text-base md:text-lg">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fallback CTA */}
        <div className="mt-20 text-center bg-brand-surface border border-brand-border p-10 rounded-[2.5rem] shadow-sm">
            <h2 className="text-3xl font-heading font-bold text-brand-dark mb-4">Still have questions?</h2>
            <p className="text-brand-stone mb-8 font-medium text-lg">
                If you can't find the answer you're looking for, please don't hesitate to reach out.
            </p>
            <a href="#/contact" className="inline-block px-8 py-4 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-moss transition-all duration-300 shadow-lg">
                Schedule a Consultation
            </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;