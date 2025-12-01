
import React from 'react';
import { CONTACT_INFO } from '../../constants';
import Reveal from '../Reveal';
import { useCountUp } from '../../hooks/useCountUp';

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const { count, ref } = useCountUp(value, 2.5);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {count}{suffix}
    </span>
  );
};

const TrustBar: React.FC = () => {
  // Parse stats from constants
  const yearsExp = new Date().getFullYear() - parseInt(CONTACT_INFO.stats.established);
  const clients = parseInt(CONTACT_INFO.stats.clientsServed.replace(/\D/g, ''));
  const filings = parseInt(CONTACT_INFO.stats.filingsDone.replace(/\D/g, ''));
  const satisfaction = parseInt(CONTACT_INFO.stats.satisfactionRate.replace(/\D/g, ''));

  const stats = [
    { value: yearsExp, suffix: '+', label: 'Years Experience' },
    { value: clients, suffix: '+', label: 'Happy Clients' },
    { value: filings, suffix: '+', label: 'Filings Done' },
    { value: satisfaction, suffix: '%', label: 'Retention Rate' },
  ];

  return (
    <section className="relative -mt-20 z-30 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="relative">
          {/* Ambient glow behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-moss/20 via-transparent to-brand-moss/20 blur-3xl -z-10" />
          
          {/* Main container - glassmorphism */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl shadow-brand-dark/10 p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <Reveal key={i} delay={i * 0.1} variant="fade-up">
                  <div className="text-center group cursor-default">
                    {/* Animated counter effect */}
                    <div className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-2 tabular-nums">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs md:text-sm font-medium text-brand-stone uppercase tracking-widest">
                      {stat.label}
                    </div>
                    {/* Hover underline */}
                    <div className="h-0.5 w-0 group-hover:w-full bg-brand-moss mx-auto mt-3 transition-all duration-500 ease-out" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
