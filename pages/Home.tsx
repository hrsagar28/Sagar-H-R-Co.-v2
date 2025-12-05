
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Shield, TrendingUp, CheckCircle2, ArrowRight, Check 
} from 'lucide-react';
import { 
  Marquee, Reveal, MagneticButton, OptimizedImage, SEO, 
  Parallax, ScrollyTelling, HorizontalScroll,
  FounderSection, IndustrySpotlight, 
  FAQPreview, LocationStrip, ConsultationBanner 
} from '../components';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useInsights } from '../hooks';

const { useNavigate, Link } = ReactRouterDOM;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { insights } = useInsights();
  const recentInsights = insights.slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AccountingService",
        "@id": "https://casagar.co.in/#organization",
        "name": CONTACT_INFO.name,
        "url": "https://casagar.co.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://casagar.co.in/logo.png"
        },
        "description": "Chartered Accountancy Firm in Mysuru specializing in Audit, Taxation, and Advisory.",
        "foundingDate": CONTACT_INFO.stats.established,
        "founder": {
          "@type": "Person",
          "name": CONTACT_INFO.founder.name
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": CONTACT_INFO.address.street,
          "addressLocality": CONTACT_INFO.address.city,
          "postalCode": CONTACT_INFO.address.zip,
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": CONTACT_INFO.geo.latitude,
          "longitude": CONTACT_INFO.geo.longitude
        },
        "telephone": CONTACT_INFO.phone.value,
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "10:00",
            "closes": "20:00"
          }
        ],
        "priceRange": "$$"
      },
      {
        "@type": "WebSite",
        "@id": "https://casagar.co.in/#website",
        "url": "https://casagar.co.in",
        "name": CONTACT_INFO.name,
        "publisher": { "@id": "https://casagar.co.in/#organization" }
      }
    ]
  };

  // ScrollyTelling Data
  const ethosItems = [
    {
      id: 'integrity',
      title: 'Professional Integrity',
      description: "Adhering to the ethical standards of the ICAI.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-brand-moss/80 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(26,77,46,0.3)] flex flex-col items-center justify-center p-8 relative overflow-hidden group backdrop-blur-xl">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
           <div className="relative z-10 p-6 rounded-full border border-[#4ADE80]/30 bg-[#4ADE80]/10 mb-8 shadow-[0_0_30px_rgba(74,222,128,0.2)] animate-pulse">
              <Shield size={48} className="text-[#4ADE80]" strokeWidth={1.5} />
           </div>
           <div className="absolute top-0 left-0 w-full h-1 bg-[#4ADE80]/50 shadow-[0_0_15px_#4ADE80] animate-[blob_3s_infinite_ease-in-out] opacity-50"></div>
           <div className="w-full space-y-3 relative z-10">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#4ADE80] w-[90%] animate-[expandWidth_2s_ease-out_forwards]"></div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: 'Statutory Compliance',
      description: "Assistance with reporting and filings.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-blue-900/40 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col items-center justify-center p-8 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           <div className="w-full space-y-4 relative z-10">
              {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:bg-white/10 group">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                       <Check size={14} />
                    </div>
                    <div className="h-2 bg-blue-200/20 rounded-full w-full relative overflow-hidden">
                       <div className="absolute inset-0 bg-blue-400/50 w-full origin-left animate-[expandWidth_1s_ease-out_forwards]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    </div>
                 </div>
              ))}
           </div>
           <div className="absolute bottom-0 right-0 p-8 opacity-20">
              <CheckCircle2 size={120} className="text-blue-500" />
           </div>
        </div>
      )
    },
    {
      id: 'advisory',
      title: 'Business Advisory',
      description: "Guidance for business structuring.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-purple-900/40 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col justify-end p-8 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           <div className="flex items-end justify-between gap-3 h-48 w-full relative z-10 pb-4">
              {[30, 45, 60, 40, 75, 90, 100].map((h, i) => (
                 <div key={i} className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md relative group">
                    <div className="w-full bg-purple-500 absolute bottom-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ height: `${h}%` }}></div>
                 </div>
              ))}
           </div>
           <div className="flex items-center gap-3 relative z-10 border-t border-white/10 pt-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                 <TrendingUp size={24} />
              </div>
              <div>
                 <span className="block text-xs text-purple-200/60 uppercase tracking-wider">Analysis</span>
              </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-brand-bg">
      <SEO 
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name} - Chartered Accountants in Mysuru. Providing services in Audit, Taxation, and Regulatory Compliance.`}
        schema={schema}
      />
      
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-6 overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
           <Parallax speed={0.4} className="w-full h-[120%] -top-[10%] relative">
             <OptimizedImage 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
              alt="Corporate Architecture" 
              priority={true}
              className="w-full h-full opacity-80 object-cover" 
             />
           </Parallax>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.95)_100%)] z-10 pointer-events-none"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80 z-10 pointer-events-none"></div>
        </div>

        <Parallax speed={-0.1} className="container mx-auto max-w-7xl relative z-20 mt-12 md:mt-0">
           <div className="max-w-6xl">
              <Reveal delay={0.1} variant="fade-up">
                <div className="flex flex-col gap-2 mb-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-xs font-bold uppercase tracking-[0.2em] text-white/90 w-fit">
                    <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_12px_#4ADE80]"></div>
                    <span>Mysuru</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white/80 tracking-wide font-heading">
                    Sagar H R & Co.
                  </h2>
                </div>
              </Reveal>
              
              {/* Dynamic Service-Based Headline */}
              <div className="mb-10">
                <Reveal variant="reveal-mask" delay={0.2} duration={1}>
                  <h1 className="font-heading font-bold text-white tracking-tighter leading-[0.9] drop-shadow-2xl overflow-hidden max-w-full">
                    <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">Audit.</span>
                  </h1>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.3} duration={1}>
                  <h1 className="font-heading font-bold text-white tracking-tighter leading-[0.9] drop-shadow-2xl overflow-hidden max-w-full">
                    <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">Taxation.</span>
                  </h1>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.4} duration={1}>
                  <h1 className="font-serif italic font-normal text-[#E8F5E9] tracking-tighter leading-[0.9] drop-shadow-2xl overflow-hidden max-w-full">
                    <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">Advisory.</span>
                  </h1>
                </Reveal>
              </div>
              
              <div className="flex flex-col items-start gap-8">
                 <Reveal delay={0.6}>
                   <div className="flex items-center gap-4 text-white/80 text-lg md:text-xl font-medium border-l-2 border-[#4ADE80] pl-6">
                      <span className="block">Chartered Accountants based in Mysuru. Providing services in Audit, Taxation, and Regulatory Compliance.</span>
                   </div>
                 </Reveal>

                 <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full mt-4">
                    <Reveal delay={0.8}>
                      <MagneticButton onClick={() => navigate('/contact')}>
                        Contact Us
                      </MagneticButton>
                    </Reveal>

                    <Reveal delay={0.9} variant="fade-up">
                      <div className="w-full md:w-auto overflow-hidden">
                        <div className="flex flex-wrap gap-4 px-6 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">GST</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">Income Tax</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">Company Law</span>
                        </div>
                      </div>
                    </Reveal>
                 </div>
              </div>
           </div>
        </Parallax>
      </section>

      {/* 2. FOUNDER SECTION */}
      <FounderSection />

      {/* 3. PHILOSOPHY SCROLLYTELLING */}
      <ScrollyTelling items={ethosItems} />

      {/* 4. IMMERSIVE SERVICES (Horizontal Scroll) */}
      <section className="bg-brand-black text-white relative z-30 pt-32 pb-20">
         <div className="container mx-auto max-w-7xl relative z-10 px-4 mb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
               <Reveal>
                  <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Practice Areas</span>
                  <h2 className="text-5xl md:text-7xl font-heading font-bold text-white">
                     Services
                  </h2>
               </Reveal>
               <Reveal delay={0.2} className="md:w-1/3">
                 <p className="text-white/60 font-medium text-lg leading-relaxed text-right md:text-left">
                    Scroll to view our professional services.
                 </p>
               </Reveal>
            </div>
         </div>

         <HorizontalScroll>
            {SERVICES.map((service, index) => (
                <Link 
                  key={service.id}
                  to={service.link}
                  className="shrink-0 w-[300px] md:w-[400px] aspect-[3/4] bg-brand-dark border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-[#4ADE80]/50 hover:bg-brand-surface-dark-hover transition-all duration-500 group snap-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#4ADE80] group-hover:scale-110 transition-transform duration-500 mb-8 border border-white/5 shadow-lg shadow-black/20">
                            {React.cloneElement(service.icon as React.ReactElement<{size?: number}>, { size: 32 })}
                        </div>
                        
                        <div className="mb-auto">
                            <h3 className="text-2xl md:text-3xl font-heading font-bold leading-tight text-white group-hover:text-[#4ADE80] transition-colors mb-4">
                                {service.title}
                            </h3>
                            <p className="text-white/50 text-base font-medium leading-relaxed line-clamp-3 group-hover:text-white/70 transition-colors">
                                {service.description}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">View Details</span>
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#4ADE80] group-hover:text-black group-hover:border-[#4ADE80] transition-all duration-300 shadow-[0_0_20px_rgba(74,222,128,0)] group-hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                                <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            <div className="shrink-0 w-[300px] md:w-[400px] aspect-[3/4] flex items-center justify-center snap-center">
               <Link to="/services" className="text-center group">
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white group-hover:text-black transition-all duration-500">
                     <ArrowRight size={32} />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-white group-hover:text-[#4ADE80] transition-colors">
                     View All Services
                  </h3>
               </Link>
            </div>
         </HorizontalScroll>
      </section>

      {/* 5. INDUSTRY SPOTLIGHT (COMPACT VARIANT) */}
      <IndustrySpotlight variant="compact" />

      {/* 6. RECENT INSIGHTS */}
      {recentInsights.length > 0 && (
        <section className="py-32 px-4 md:px-6 bg-white relative overflow-hidden border-t border-brand-border/60">
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
          
          <div className="container mx-auto max-w-7xl relative z-10">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
              <div>
                <Reveal>
                  <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Knowledge Base</span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="text-5xl md:text-7xl font-heading font-bold text-brand-dark">
                    Latest <span className="font-serif italic font-normal text-brand-stone">Updates.</span>
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <Link to="/insights" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark hover:text-brand-moss transition-colors group">
                  View All
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentInsights.map((insight, i) => (
                <Reveal key={insight.id} delay={i * 0.1} width="100%">
                  <Link 
                    to={`/insights/${insight.slug}`}
                    className="group block h-full"
                  >
                    <article className="h-full relative bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden hover:border-brand-moss/30 hover:shadow-2xl hover:shadow-brand-dark/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                      
                      <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-brand-moss to-[#4ADE80] transition-all duration-700" />
                      
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-6">
                          <span className="px-3 py-1 bg-brand-moss/10 text-brand-moss text-xs font-bold uppercase tracking-wider rounded-full">
                            {insight.category}
                          </span>
                          <span className="text-brand-stone text-xs font-bold uppercase tracking-wider">
                            {insight.readTime}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-heading font-bold text-brand-dark mb-4 leading-tight group-hover:text-brand-moss transition-colors line-clamp-2">
                          {insight.title}
                        </h3>
                        
                        <p className="text-brand-stone font-medium leading-relaxed line-clamp-3 mb-6 flex-grow">
                          {insight.summary}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-brand-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-moss/10 flex items-center justify-center text-brand-moss text-xs font-bold">
                              {insight.author.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-stone">{insight.date}</span>
                          </div>
                          
                          <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-brand-stone group-hover:bg-brand-moss group-hover:border-brand-moss group-hover:text-white transition-all duration-300">
                            <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                      
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
            
          </div>
        </section>
      )}

      {/* 7. FAQ PREVIEW */}
      <FAQPreview />
      
      {/* 8. MARQUEE */}
      <Marquee />

      {/* 9. LOCATION STRIP */}
      <LocationStrip />

      {/* 10. CONSULTATION BANNER */}
      <ConsultationBanner />
    </div>
  );
};

export default Home;
