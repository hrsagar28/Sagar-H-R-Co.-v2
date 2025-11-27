import React from 'react';
import { Link } from 'react-router-dom';
import { INSIGHTS_MOCK } from '../constants';
import { ArrowUpRight, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { CONTACT_INFO } from '../config/contact';

const Insights: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Insights & Knowledge Base",
    "description": "Analysis, regulatory updates, and strategic commentary from our research desk.",
    "publisher": {
      "@type": "Organization",
      "name": CONTACT_INFO.name
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": INSIGHTS_MOCK.map((insight, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://casagar.co.in/insights/${insight.slug}`,
        "name": insight.title
      }))
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`Insights & Updates | ${CONTACT_INFO.name}`}
        description="Stay ahead with the latest updates on Income Tax, GST, and economic trends. Expert analysis and commentary from CA Sagar H R."
        schema={schema}
      />
      
      {/* UNIFIED HERO SECTION */}
      <PageHero
        tag="Knowledge Base"
        title="Strategic"
        subtitle="Insights."
        description="Analysis, regulatory updates, and strategic commentary from our research desk to help you stay ahead."
      />

      {/* Insights Grid */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
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
      </section>
    </div>
  );
};

export default Insights;