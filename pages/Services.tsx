
import React, { useMemo } from 'react';
import ServiceBento from '../components/ServiceBento';
import { IndustryGridDark } from '../components/IndustrySpotlight';
import { SERVICES, CONTACT_INFO } from '../constants';
import { buildServicesSchema } from '../constants/servicesSchema';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import ConsultationBanner from '../components/ConsultationBanner';

const Services: React.FC = () => {
  const schema = useMemo(() => buildServicesSchema(), []);

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`Services - Audit · Tax · GST · Advisory | ${CONTACT_INFO.name}`}
        description="Eight disciplines of chartered-accountancy practice from Mysuru: GST, Income Tax, Company Law, Litigation, Advisory, Audit, Bookkeeping, and Payroll. Engagement options: retainer or assignment."
        schema={schema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
        ]}
      />
      
      {/* 1. HERO SECTION */}
      <PageHero
        tag="Services"
        title={<>Four disciplines, one <em>practice</em>.</>}
        description="A small practice across tax, audit, corporate, and advisory - each engagement led by the proprietor."
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
      <IndustryGridDark />

      {/* 4. CTA */}
      <ConsultationBanner />

    </div>
  );
};

export default Services;

