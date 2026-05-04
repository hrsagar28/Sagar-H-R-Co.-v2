import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { SERVICE_DETAILS } from '../constants';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { CONTACT_INFO } from '../constants';
import { PageHero } from '../components/hero';
import { SERVICE_HERO_META } from '../constants/serviceHeroMeta';
import NotFound from './NotFound';

const { useParams, Link } = ReactRouterDOM;

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const service = slug ? SERVICE_DETAILS[slug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!service) return <NotFound />;

  return (
    <div className="bg-grid min-h-screen bg-brand-bg px-4 pb-20 pt-32 md:px-6 md:pt-40 print:h-auto print:bg-white print:pb-0 print:pt-0">
      <SEO
        title={`${service.title} | ${CONTACT_INFO.name}`}
        description={service.shortDescription}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
          { name: service.title, url: window.location.pathname },
        ]}
        service={{
          name: service.title,
          description: service.shortDescription,
          areaServed: 'Mysuru, Karnataka',
        }}
      />

      <div className="container mx-auto max-w-7xl print:max-w-full print:p-0">
        {/* Header */}
        <div className="mb-12">
          <PageHero
            variant="split"
            eyebrow={slug ? `Practice · ${slug.toUpperCase()}` : 'Practice'}
            title={
              service.title.includes(' ') ? (
                <>
                  {service.title.split(' ')[0]} <em>{service.title.substring(service.title.indexOf(' ') + 1)}</em>
                </>
              ) : (
                <>
                  <em>{service.title}</em>
                </>
              )
            }
            blurb={service.shortDescription}
            meta={SERVICE_HERO_META[slug || ''] || []}
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 print:block">
          {/* Left Column: Editorial Description */}
          <div className="order-2 lg:order-1 lg:col-span-5 print:mb-8">
            <div className="sticky top-32 space-y-10 print:static print:space-y-6">
              <div className="rounded-[2rem] border border-brand-border bg-brand-surface p-10 shadow-lg print:rounded-none print:border-0 print:p-0 print:shadow-none">
                <h3 className="mb-6 font-heading text-2xl font-bold text-brand-dark print:mb-3 print:text-xl">
                  Overview
                </h3>
                <p className="text-lg font-medium leading-relaxed text-brand-stone print:text-base print:text-black">
                  {service.longDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Features Grid */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <h3 className="mb-10 font-heading text-3xl font-bold text-brand-dark print:mb-6 print:text-2xl">
              Services Included
            </h3>
            <div className="grid gap-6 print:grid-cols-1 print:gap-4">
              {service.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative break-inside-avoid overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface p-8 shadow-sm transition-all duration-300 hover:border-brand-moss hover:shadow-xl md:p-10 print:rounded-lg print:border-black print:p-4 print:shadow-none"
                >
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-brand-moss/5 transition-transform duration-700 group-hover:scale-150 print:hidden"></div>

                  <div className="relative z-10 flex items-start gap-6 print:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-brand-moss transition-colors group-hover:bg-brand-moss group-hover:text-white print:h-8 print:w-8 print:border-black print:bg-white print:text-black">
                      <CheckCircle2 size={24} strokeWidth={1.5} className="print:h-5 print:w-5" />
                    </div>
                    <div>
                      <h4 className="mb-3 font-heading text-xl font-bold text-brand-dark transition-colors group-hover:text-brand-moss md:text-2xl print:mb-1 print:text-lg print:text-black">
                        {feature.title}
                      </h4>
                      <p className="text-base font-medium leading-relaxed text-brand-stone md:text-lg print:text-sm print:text-black">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 hidden border-t border-black pt-8 text-center text-sm font-bold uppercase tracking-widest print:block">
          {CONTACT_INFO.name} • Chartered Accountants • {CONTACT_INFO.address.city}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
