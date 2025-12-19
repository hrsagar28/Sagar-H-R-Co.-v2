
import React, { useRef } from 'react';
import { TESTIMONIALS } from '../../constants/testimonials';
import { Quote } from 'lucide-react';
import Reveal from '../Reveal';

const TestimonialCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        
        <div className="text-center mb-16">
          <Reveal>
            <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Client Stories</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-brand-dark">
              Trusted by the <span className="font-serif italic font-normal text-brand-stone">Community.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1} width="100%">
              <div className="bg-brand-surface p-8 md:p-10 rounded-[2rem] border border-brand-border hover:border-brand-moss/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative group">
                <div className="absolute top-8 right-8 text-brand-moss/10 group-hover:text-brand-moss/20 transition-colors">
                  <Quote size={48} fill="currentColor" />
                </div>
                
                <p className="text-brand-stone font-medium text-lg leading-relaxed mb-8 relative z-10">
                  "{t.text}"
                </p>
                
                <div className="mt-auto flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-dark text-white flex items-center justify-center font-heading font-bold text-lg">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-brand-dark">{t.author}</h4>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-moss">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialCarousel;
