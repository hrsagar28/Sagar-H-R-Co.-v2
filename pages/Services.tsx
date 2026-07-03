import React, { useMemo } from 'react';
import ServiceBento from '../components/ServiceBento';
import ServiceLedger from '../components/ServiceLedger';
import ServiceFolios from '../components/ServiceFolios';
import { IndustryGridDark } from '../components/IndustrySpotlight';
import { CONTACT_INFO } from '../constants';
import { buildServicesSchema } from '../constants/servicesSchema';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import ConsultationBanner from '../components/ConsultationBanner';
import Reveal from '../components/Reveal';
import './route-styles.css';
import '../components/hero/PageHero.css';
import '../components/ServiceBento.css';

/**
 * Services section layout.
 *  - 'folios' — the dark folio grid (ServiceFolios). Current design.
 *  - 'ledger' — the editorial register (ServiceLedger).
 *  - 'bento'  — the original bento grid (ServiceBento).
 * All three components are kept in the repo; change this single value to
 * switch — the swap is instant and lossless.
 */
type ServicesLayout = 'folios' | 'ledger' | 'bento';
// `as ServicesLayout` keeps the type the full union. A plain annotated const
// (`const X: Union = 'folios'`) is control-flow-narrowed by TypeScript to the
// literal 'folios', which then flags the 'ledger'/'bento' branches below as
// "no overlap" (TS2367). The widening cast preserves the switchable intent.
const SERVICES_LAYOUT = 'folios' as ServicesLayout;

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

      {/* 2. SERVICES — chosen via the SERVICES_LAYOUT toggle defined above. */}
      {SERVICES_LAYOUT === 'folios' && <ServiceFolios />}
      {SERVICES_LAYOUT === 'ledger' && <ServiceLedger />}
      {SERVICES_LAYOUT === 'bento' && (
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
      )}

      {/* 3. INDUSTRIES - Consolidated Component */}
      <IndustryGridDark />

      {/* 4. CTA */}
      <ConsultationBanner />
    </div>
  );
};

export default Services;
