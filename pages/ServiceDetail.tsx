import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SERVICE_DETAILS } from '../constants';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

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
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://casagar.co.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://casagar.co.in/services"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": service.title
          }
        ]
      },
      {
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
      }
    ]
  };

  return (
    <div className="pt-32 md:pt-40 pb-20 px-4 md:px-6 bg-brand-bg bg-grid min-h-screen">
      <SEO 
        title={`${service.title} | Sagar H R & Co.`}
        description={service.shortDescription}
        schema={schema}
      />

      <div className="container mx-auto max-w-7xl">
        
        {/* Breadcrumb / Back */}
        <div className="mb-12">
          <Link to="/services" className="inline-flex items-center gap-2 text-brand-stone hover:text-brand-dark font-bold text-sm uppercase tracking-wider transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>
        </div>

        {/* Header */}
        <div className="mb-20 max-w-5xl">
          <div className="inline-block px-4 py-1 rounded-full border border-brand-border bg-brand-surface text-xs font-bold tracking-widest uppercase mb-6 text-brand-moss">
            Specialized Service
          </div>
          <h1 className="text-5xl md:text-8xl font-heading font-bold text-brand-dark mb-8 tracking-tighter leading-tight">
            {service.title}
          </h1>
          <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-3xl">
            {service.shortDescription}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Editorial Description */}
          <div className="lg:col-span-5 order-2 lg:order-1">
             <div className="sticky top-32 space-y-10">
                <div className="bg-brand-surface p-10 rounded-[2rem] border border-brand-border shadow-lg">
                  <h3 className="text-2xl font-heading font-bold text-brand-dark mb-6">The Approach</h3>
                  <p className="text-lg text-brand-stone leading-relaxed font-medium">
                    {service.longDescription}
                  </p>
                </div>

                <div className="bg-brand-dark text-brand-surface p-10 rounded-[2rem] relative overflow-hidden">
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
            <h3 className="text-3xl font-heading font-bold text-brand-dark mb-10">Services Included</h3>
            <div className="grid gap-6">
              {service.features.map((feature, idx) => (
                <div key={idx} className="bg-brand-surface p-8 md:p-10 rounded-[2rem] border border-brand-border hover:border-brand-moss transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-moss/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                   
                   <div className="relative z-10 flex items-start gap-6">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss group-hover:bg-brand-moss group-hover:text-white transition-colors">
                         <CheckCircle2 size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-heading font-bold text-brand-dark mb-3 group-hover:text-brand-moss transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-brand-stone font-medium text-base md:text-lg leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;