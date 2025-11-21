import React from 'react';
import { Link } from 'react-router-dom';
import { INSIGHTS_MOCK } from '../constants';
import { ArrowUpRight, Calendar } from 'lucide-react';

const Insights: React.FC = () => {
  return (
    <div className="pt-40 pb-20 min-h-screen px-4 md:px-6 bg-brand-bg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
           <div>
              <h1 className="text-6xl md:text-8xl font-heading font-bold text-brand-dark mb-4 tracking-tighter">Insights</h1>
              <p className="text-xl text-brand-stone font-medium">Analysis and updates from our research desk.</p>
           </div>
           <div className="hidden md:block w-1/3 h-[1px] bg-brand-border mb-4"></div>
        </div>
        
        <div className="grid gap-6">
          {INSIGHTS_MOCK.map((insight) => (
            <Link to={`/insights/${insight.slug}`} key={insight.id} className="group bg-brand-surface rounded-[2rem] p-8 md:p-12 border border-brand-border hover:border-brand-moss hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-8 md:gap-12 items-start relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-moss/0 group-hover:bg-brand-moss/[0.02] transition-colors"></div>
              
              <div className="md:w-1/4 relative z-10">
                <span className="inline-block px-4 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider mb-4">{insight.category}</span>
                <div className="flex items-center gap-2 text-brand-stone text-sm font-bold">
                  <Calendar size={14} />
                  {insight.date}
                </div>
              </div>
              <div className="md:w-2/4 relative z-10">
                <h2 className="text-2xl md:text-3xl text-brand-dark font-heading font-bold mb-4 group-hover:text-brand-moss transition-colors leading-tight">
                  {insight.title}
                </h2>
                <p className="text-brand-stone leading-relaxed font-medium">
                  {insight.summary}
                </p>
              </div>
              <div className="md:w-1/4 flex justify-start md:justify-end w-full relative z-10">
                 <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-dark group-hover:bg-brand-moss group-hover:text-brand-inverse group-hover:scale-110 transition-all duration-300">
                   <ArrowUpRight size={20} />
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;