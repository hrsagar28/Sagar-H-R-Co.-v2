import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SERVICE_DETAILS } from '../constants';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const service = slug ? SERVICE_DETAILS[slug] : null;

  useEffect(() => {
    if (!service) {
      navigate('/services');
    }
    window.scrollTo(0, 0);
  }, [slug, service, navigate]);

  if (!service) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.longDescription,
    "provider": {
      "@type": "AccountingService",
      "name": "Sagar H R & Co.",
      "url": "https://casagar.co.in"
    },
    "areaServed": {
      "@type": "City",
      "name": "Mysuru"
    },
    "offers": {
      "@type": "Offer",
      "description": service.shortDescription
    }
  };

  return (
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg bg-grid min-h-screen print:pt-0 print:pb-0 print:bg-white print:h-auto">
      <SEO 
        title={`${service.title} | Sagar H R & Co.`}
        description={service.shortDescription}
        schema={schema}
      />

      <div className="container mx-auto max-w-7xl print:max-w-full print:p-0">
        
        {/* Breadcrumb Navigation - Hidden in print */}
        <div className="mb-12 print:hidden">
          <Breadcrumbs 
            items={[
              { label: 'Services', path: '/services' },
              { label: service.title }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="mb-20 max-w-5xl print:mb-8">
          <div className="inline-block px-4 py-1 rounded-full border border-brand-border bg-brand-surface text-xs font-bold tracking-widest uppercase mb-6 text-brand-moss print:border-black print:text-black">
            Specialized Service
          </div>
          <h1 className="text-5xl md:text-8xl font-heading font-bold text-brand-dark mb-8 tracking-tighter leading-tight print:text-4xl print:mb-4">
            {service.title}
          </h1>
          <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-3xl print:text-lg print:text-black">
            {service.shortDescription}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 print:block">
          
          {/* Left Column: Editorial Description */}
          <div className="lg:col-span-5 order-2 lg:order-1 print:mb-8">
             <div className="sticky top-32 space-y-10 print:static print:space-y-6">
                <div className="bg-brand-surface p-10 rounded-[2rem] border border-brand-border shadow-lg print:shadow-none print:border-0 print:p-0 print:rounded-none">
                  <h3 className="text-2xl font-heading font-bold text-brand-dark mb-6 print:text-xl print:mb-3">The Approach</h3>
                  <p className="text-lg text-brand-stone leading-relaxed font-medium print:text-black print:text-base">
                    {service.longDescription}
                  </p>
                </div>

                {/* CTA Card - Hidden in Print */}
                <div className="bg-brand-dark text-brand-surface p-10 rounded-[2rem] relative overflow-hidden print:hidden">
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[60px]"></div>
                   <div className="relative z-10">
                     <h3 className="text-2xl font-heading font-bold mb-6">Ready to engage?</h3>
                     <p className="mb-8 opacity-90 font-medium">
                       Book a consultation to discuss your specific requirements.
                     </p>
                     <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-moss text-white font-bold rounded-full hover:bg-white hover:text-brand-dark transition-colors w-full justify-center">
                       Start Conversation <ArrowRight size={16} />
                     </Link>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Features Grid */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <h3 className="text-3xl font-heading font-bold text-brand-dark mb-10 print:text-2xl print:mb-6">Services Included</h3>
            <div className="grid gap-6 print:grid-cols-1 print:gap-4">
              {service.features.map((feature, idx) => (
                <div key={idx} className="bg-brand-surface p-8 md:p-10 rounded-[2rem] border border-brand-border hover:border-brand-moss transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-xl print:shadow-none print:border-black print:p-4 print:rounded-lg break-inside-avoid">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-moss/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 print:hidden"></div>
                   
                   <div className="relative z-10 flex items-start gap-6 print:gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss group-hover:bg-brand-moss group-hover:text-white transition-colors print:bg-white print:border-black print:w-8 print:h-8 print:text-black">
                         <CheckCircle2 size={24} strokeWidth={1.5} className="print:w-5 print:h-5" />
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-heading font-bold text-brand-dark mb-3 group-hover:text-brand-moss transition-colors print:text-lg print:mb-1 print:text-black">
                          {feature.title}
                        </h4>
                        <p className="text-brand-stone font-medium text-base md:text-lg leading-relaxed print:text-sm print:text-black">
                          {feature.description}
                        </p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        <div className="hidden print:block mt-12 pt-8 border-t border-black text-center text-sm font-bold uppercase tracking-widest">
           Sagar H R & Co. • Chartered Accountants • Mysuru
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;