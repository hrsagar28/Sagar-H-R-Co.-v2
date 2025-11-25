import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceBento from '../components/ServiceBento';
import { INDUSTRIES } from '../constants';
import { ArrowUpRight } from 'lucide-react';

const Services: React.FC = () => {
  // SEO & Schema
  useEffect(() => {
    document.title = "Professional CA Services in Mysuru | Audit, Tax & Advisory";
    
    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Comprehensive financial services including GST, Income Tax Filing, Company Law, Auditing, and Business Advisory. Expert solutions for individuals and businesses.");
    }

    // JSON-LD Schema for Services
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Accounting and Financial Services",
      "provider": {
        "@type": "AccountingService",
        "name": "Sagar H R & Co."
      },
      "areaServed": {
        "@type": "City",
        "name": "Mysuru"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Financial Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "GST Registration & Filing" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Income Tax Compliance" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Audit & Assurance" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Company Law & ROC" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Advisory & Consulting" } }
        ]
      }
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
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* 1. HERO SECTION - Standard Clean Grid */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
         <div className="container mx-auto max-w-7xl relative z-10">
            <div className="max-w-5xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                 <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                 Our Expertise
               </div>
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 Comprehensive <br/>
                 <span className="font-serif italic font-normal text-brand-stone opacity-60">Solutions.</span>
               </h1>
               <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Explore our specialized services tailored to optimize your personal and business requirements.
               </p>
            </div>
         </div>
      </section>

      {/* 2. SERVICES LIST - BENTO GRID */}
      <section className="bg-brand-bg pt-20 pb-32">
         <div className="container mx-auto max-w-7xl px-4 md:px-6 mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Core Capabilities</span>
                    <h2 className="text-4xl md:text-6xl font-heading font-bold text-brand-dark">What We Do</h2>
                </div>
                <p className="text-brand-stone font-medium max-w-md text-lg">
                    A holistic suite of financial services designed to navigate the complexities of the modern economic landscape.
                </p>
            </div>
         </div>
         <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <ServiceBento />
         </div>
      </section>

      {/* 3. INDUSTRIES - Dark Theme with Rounded Corners & High Contrast Green */}
      <div className="px-2 md:px-4 pb-4 bg-brand-bg">
        <section className="py-24 px-4 md:px-10 bg-[#0A0A0A] text-white rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden">
          <div className="container mx-auto max-w-7xl relative z-10">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-8 border-b border-white/10 pb-12">
               <div className="max-w-2xl">
                  <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">SECTORS</span>
                  <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-0">Industries We Serve</h2>
               </div>
               <p className="text-white/60 font-medium text-lg max-w-xs text-right md:text-left leading-relaxed">
                  Specialized knowledge across diverse verticals ensures relevant and impactful advice.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {INDUSTRIES.map((ind, i) => (
                <div key={i} className="p-8 rounded-3xl bg-[#111111] hover:bg-[#161616] border border-white/5 transition-all duration-300 group flex flex-col items-start h-full hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#4ADE80] mb-6 bg-[#4ADE80]/10 border border-[#4ADE80]/20 group-hover:scale-105 transition-transform">
                    {React.cloneElement(ind.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white mb-3">{ind.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">{ind.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 flex justify-center">
               <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white hover:text-black transition-all duration-300 group">
                  Industry not listed? Contact Us <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[#4ADE80] group-hover:text-black"/>
               </Link>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default Services;