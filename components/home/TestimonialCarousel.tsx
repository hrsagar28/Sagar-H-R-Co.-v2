
import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../../constants/testimonials';
import Reveal from '../Reveal';

const TestimonialCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 bg-brand-black text-white relative overflow-hidden">
      {/* Dynamic background based on active testimonial */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out" 
        style={{
          background: `radial-gradient(800px circle at ${(activeIndex + 1) * (100 / TESTIMONIALS.length)}% 50%, rgba(74, 222, 128, 0.08) 0%, transparent 60%)`
        }} 
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <Reveal>
            <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Testimonials</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-5xl md:text-7xl font-heading font-bold">
              Client <span className="font-serif italic font-normal text-white/60">stories.</span>
            </h2>
          </Reveal>
        </div>
        
        {/* Testimonial Stage */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Large quote mark decoration */}
          <div className="absolute -top-20 -left-10 text-[15rem] font-serif text-white/5 leading-none select-none pointer-events-none font-bold">
            "
          </div>
          
          {/* Cards with 3D stack effect */}
          <div className="relative h-[450px] md:h-[400px] perspective-[1000px]">
            {TESTIMONIALS.map((testimonial, i) => {
              const offset = i - activeIndex;
              const isActive = offset === 0;
              
              return (
                <div
                  key={testimonial.id}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: `
                      translateX(${offset * 60}px) 
                      translateZ(${-Math.abs(offset) * 100}px) 
                      rotateY(${offset * -5}deg)
                      scale(${1 - Math.abs(offset) * 0.1})
                    `,
                    opacity: Math.abs(offset) > 1 ? 0 : 1 - Math.abs(offset) * 0.4,
                    zIndex: TESTIMONIALS.length - Math.abs(offset),
                    pointerEvents: isActive ? 'auto' : 'none',
                    visibility: Math.abs(offset) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  <div className={`
                    h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl 
                    border border-white/10 rounded-[2.5rem] p-10 md:p-14
                    ${isActive ? 'shadow-2xl shadow-[#4ADE80]/10' : ''}
                    flex flex-col justify-between
                  `}>
                    
                    <div>
                      {/* Star rating */}
                      <div className="flex gap-1 mb-8">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            size={20} 
                            className={starIdx < testimonial.rating ? 'text-[#4ADE80] fill-[#4ADE80]' : 'text-white/20'} 
                          />
                        ))}
                      </div>
                      
                      {/* Quote */}
                      <p className="text-xl md:text-3xl font-medium leading-relaxed text-white/90 mb-6">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    
                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4ADE80] to-brand-moss flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{testimonial.name}</div>
                        <div className="text-white/50 text-sm font-medium">{testimonial.company} • {testimonial.industry}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-12">
            <button 
              onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
              disabled={activeIndex === 0}
              aria-label="Previous Testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            
            {/* Progress dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === activeIndex ? 'w-8 bg-[#4ADE80]' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setActiveIndex(prev => Math.min(TESTIMONIALS.length - 1, prev + 1))}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
              disabled={activeIndex === TESTIMONIALS.length - 1}
              aria-label="Next Testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
