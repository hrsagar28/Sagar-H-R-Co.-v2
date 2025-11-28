import React from 'react';
import ServiceBento from '../components/ServiceBento';
import IndustrySpotlight from '../components/IndustrySpotlight';
import { SERVICES, CONTACT_INFO } from '../constants';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';

const Services: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Financial Services",
    "description": "Comprehensive suite of financial services including GST, Income Tax, Audit, and Advisory.",
    "provider": {
      "@type": "AccountingService",
      "name": CONTACT_INFO.name
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": SERVICES.map((service, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Service",
          "name": service.title,
          "description": service.description,
          "url": `https://casagar.co.in/services/${service.id}`
        }
      }))
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Professional CA Services in Mysuru | Audit, Tax & Advisory"
        description="Comprehensive financial services including GST, Income Tax Filing, Company Law, Auditing, and Business Advisory. Expert solutions for individuals and businesses."
        schema={schema}
      />
      
      {/* 1. HERO SECTION */}
      <PageHero
        tag="Our Expertise"
        title="Comprehensive"
        subtitle="Solutions."
        description="Explore our specialized services tailored to optimize your personal and business requirements."
      />

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

      {/* 3. INDUSTRIES - Consolidated Component */}
      <IndustrySpotlight />

    </div>
  );
};

export default Services;