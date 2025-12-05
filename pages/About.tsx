
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Target, ShieldCheck, TrendingUp, BookOpen } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { CONTACT_INFO } from '../constants';

const { Link } = ReactRouterDOM;

const About: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "AccountingService",
      "name": CONTACT_INFO.name,
      "legalName": CONTACT_INFO.name,
      "founder": {
         "@type": "Person",
         "name": "CA Sagar H R",
         "jobTitle": "Principal Partner"
      },
      "areaServed": {
        "@type": "City",
        "name": CONTACT_INFO.address.city,
        "sameAs": "https://en.wikipedia.org/wiki/Mysore"
      },
      "knowsAbout": ["Taxation", "Audit", "Financial Advisory", "GST", "Company Law"],
      "description": `${CONTACT_INFO.name} is a Chartered Accountancy firm in Mysuru providing audit, tax, and advisory services.`
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`About ${CONTACT_INFO.name} | Our Firm`}
        description={`Learn about ${CONTACT_INFO.name}, a Chartered Accountancy firm in Mysuru. Discover our mission and the team.`}
        schema={schema}
      />
      
      {/* UNIFIED HERO SECTION */}
      <PageHero
        tag="The Firm"
        title="About"
        subtitle="Us."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <div className="lg:col-span-7">
              <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-brand-border bg-brand-surface shadow-2xl group">
                 <div className="absolute inset-0 bg-brand-moss/5 transition-colors group-hover:bg-brand-moss/10"></div>
                 <div className="absolute top-0 right-0 w-full h-full opacity-30">
                     <div className="absolute top-10 right-10 w-32 h-32 border-4 border-brand-dark/10 rounded-full"></div>
                     <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-moss/10 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
                 </div>
                 <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                     <span className="font-heading font-bold text-4xl md:text-6xl text-brand-dark mb-2">Est. {CONTACT_INFO.stats.established}</span>
                     <span className="font-serif italic text-xl text-brand-stone">Mysuru, Karnataka</span>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-5 pb-4">
              <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed mb-8">
                {CONTACT_INFO.name} provides professional services in regulatory compliance and business advisory.
              </p>
              <div className="flex flex-col gap-4 border-l border-brand-border pl-6">
                 <p className="text-brand-stone/80 text-lg">
                    We are dedicated to maintaining the highest standards of professional integrity and service quality.
                 </p>
              </div>
           </div>
        </div>
      </PageHero>

      {/* Mission Statement */}
      <section className="py-24 px-4 md:px-6 bg-brand-dark text-brand-surface relative overflow-hidden">
         <div className="absolute inset-0 bg-noise opacity-[0.15]"></div>
         <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
               <div className="md:w-1/3">
                  <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Our Values</span>
                  <h2 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
                     Professional <br/> Ethics.
                  </h2>
               </div>
               <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10 pt-12">
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <Target className="text-brand-moss" /> Accuracy
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        We strive for accuracy in all our professional engagements and reporting.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <ShieldCheck className="text-brand-moss" /> Integrity
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        Adhering to the code of ethics prescribed by the ICAI.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="text-brand-moss" /> Objectivity
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        We provide unbiased professional advice based on facts and regulations.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="text-brand-moss" /> Knowledge
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        Continuous professional development to stay updated with laws and amendments.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Leadership */}
      <section className="py-24 px-4 md:px-6 bg-brand-bg">
         <div className="container mx-auto max-w-7xl">
            <div className="bg-brand-surface rounded-[3rem] border border-brand-border overflow-hidden flex flex-col lg:flex-row">
               
               <div className="lg:w-2/5 p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-brand-border">
                  <div className="w-32 h-40 relative rounded-lg border border-brand-border shadow-sm overflow-hidden bg-brand-bg">
                    <OptimizedImage 
                      src="/sagar-hr.jpg" 
                      alt="CA Sagar H R" 
                      className="w-full h-full"
                      imgClassName="object-cover"
                    />
                  </div>
               </div>

               <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
                  <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Principal Partner</span>
                  <h2 className="text-4xl md:text-6xl font-heading font-bold text-brand-dark mb-2">CA Sagar H R</h2>
                  <p className="text-brand-stone font-bold text-sm uppercase tracking-widest mb-8">ACA</p>
                  
                  <div className="space-y-6 text-lg text-brand-stone font-medium leading-relaxed">
                     <p>
                        With expertise in Corporate Taxation and Statutory Audit, CA Sagar H R leads the firm with a focus on compliance and advisory services.
                     </p>
                     <p>
                        "Our approach is to provide practical solutions that align with regulatory requirements while understanding the client's business context."
                     </p>
                  </div>

                  <div className="mt-12 pt-10 border-t border-brand-border grid grid-cols-2 gap-6">
                     <div>
                        <h4 className="font-bold text-brand-dark mb-2">Expertise</h4>
                        <ul className="text-sm text-brand-stone space-y-1">
                           <li>• Direct Taxation</li>
                           <li>• GST Compliance</li>
                           <li>• Audit Assurance</li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold text-brand-dark mb-2">Affiliations</h4>
                        <ul className="text-sm text-brand-stone space-y-2">
                           <li className="flex items-center gap-2">
                              Associate Member, ICAI
                           </li>
                           <li>• Mysuru Branch, SIRC</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-6 bg-brand-bg">
         <div className="container mx-auto max-w-7xl">
            <div className="bg-brand-moss rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-moss/30">
               <div className="absolute inset-0 bg-noise opacity-20 mix-blend-multiply"></div>
               
               <div className="relative z-10 max-w-3xl mx-auto">
                  <h2 className="text-4xl md:text-7xl font-heading font-bold text-white mb-8">Contact Us</h2>
                  <p className="text-white/80 text-xl mb-12 leading-relaxed font-medium">
                     Get in touch for professional assistance.
                  </p>
                  <Link to="/contact" className="inline-block px-10 py-4 bg-white text-brand-moss font-bold rounded-full text-lg hover:bg-brand-dark hover:text-white transition-all duration-300 shadow-lg">
                     Book Consultation
                  </Link>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default About;
