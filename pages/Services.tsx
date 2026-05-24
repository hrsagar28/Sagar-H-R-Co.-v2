import React, { useMemo } from 'react';
import ServiceBento from '../components/ServiceBento';
import { IndustryGridDark } from '../components/IndustrySpotlight';
import { SERVICES, CONTACT_INFO } from '../constants';
import { buildServicesSchema } from '../constants/servicesSchema';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import ConsultationBanner from '../components/ConsultationBanner';
import Reveal from '../components/Reveal';
import './route-styles.css';
import '../components/hero/PageHero.css';
import '../components/ServiceBento.css';

const Services: React.FC = () => {
  const schema = useMemo(() => buildServicesSchema(), []);

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
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
        title={
          <>
            Our <em>Services.</em>
          </>
        }
      />

      {/* 2. SERVICES LIST - BENTO GRID */}
      <section aria-labelledby="what-we-do-heading" className="bg-brand-bg pb-32 pt-20">
        <div className="container mx-auto mb-16 max-w-7xl px-4 md:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Reveal delay={0}>
                <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-moss">
                  Core Capabilities
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 id="what-we-do-heading" className="font-heading text-4xl font-bold text-brand-dark md:text-6xl">
                  What We Do
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.16}>
              <p className="max-w-md text-lg font-medium text-brand-stone">
                A holistic suite of financial services designed to navigate the complexities of the modern economic
                landscape.
              </p>
            </Reveal>
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
