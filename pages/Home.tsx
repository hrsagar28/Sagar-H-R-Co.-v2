
import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, TrendingUp, CheckCircle2, BarChart3, Calculator, ArrowRight } from 'lucide-react';
import { Marquee, Reveal, MagneticButton, OptimizedImage, SEO } from '../components';
import { CONTACT_INFO } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  // Parallax effect for Hero text
  const heroTextRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (heroTextRef.current) {
        const scrolled = window.scrollY;
        // Subtle parallax, not too aggressive
        heroTextRef.current.style.transform = `translateY(${scrolled * 0.2}px)`;
        heroTextRef.current.style.opacity = `${1 - scrolled / 700}`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        "description": "Premium Chartered Accountancy Firm in Mysuru specializing in Audit, Taxation, and Advisory.",
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

  return (
    <div className="w-full bg-brand-bg overflow-x-hidden">
      <SEO 
        title={`${CONTACT_INFO.name} | Premium Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name} - Trusted financial advisors in Mysuru. Expert services in Audit, Taxation, GST, and Business Advisory for modern businesses.`}
        schema={schema}
      />
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-6 overflow-hidden pt-20">
        
        {/* Stylized Background Image */}
        <div className="absolute inset-0 z-0 bg-black">
           {/* Darker, professional architecture image */}
           <OptimizedImage 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Corporate Architecture" 
            priority={true}
            className="w-full h-full opacity-60" 
           />
           {/* Dark Black Vignette & Overlays */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.95)_100%)]"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80"></div>
        </div>

        {/* Content */}
        <div ref={heroTextRef} className="container mx-auto max-w-7xl relative z-10 will-change-transform mt-12 md:mt-0">
           <div className="max-w-6xl">
              
              {/* Animated Badge */}
              <Reveal delay={0.1} variant="fade-up">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-8">
                  <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_12px_#4ADE80]"></div>
                  <span>Chartered Accountants</span>
                </div>
              </Reveal>
              
              {/* Masked Text Reveal - Huge Typography */}
              {/* Added break-all/words and overflow protection for small screens */}
              <h1 className="font-heading font-bold text-white tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl overflow-hidden max-w-full">
                <Reveal variant="reveal-mask" delay={0.2} duration={1}>
                  <span className="block text-[13vw] md:text-[8rem] lg:text-[10rem]">
                    Trusted
                  </span>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.35} duration={1}>
                  <span className="block text-[13vw] md:text-[8rem] lg:text-[10rem] text-[#E8F5E9] italic font-serif -mt-2 md:-mt-6">
                    Advisors.
                  </span>
                </Reveal>
              </h1>
              
              <div className="flex flex-col items-start gap-8">
                 <Reveal delay={0.6}>
                   <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-xl border-l-2 border-[#4ADE80] pl-6 drop-shadow-md">
                      Expert Tax Planning, Audit, and Compliance for Mysuru’s Modern Businesses.
                   </p>
                 </Reveal>

                 <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full mt-4">
                    <Reveal delay={0.8}>
                      <MagneticButton onClick={() => navigate('/contact')}>
                        Let's Talk
                      </MagneticButton>
                    </Reveal>

                    {/* Services Ticker - Text Only Glassmorphism */}
                    <Reveal delay={0.9} variant="fade-up">
                      <div className="w-full md:w-auto overflow-hidden">
                        <div className="flex flex-wrap gap-4 px-6 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">GST</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">Income Tax</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">Audit</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">Company Law</span>
                        </div>
                      </div>
                    </Reveal>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* 2. PHILOSOPHY - STICKY STACK EFFECT */}
      <section className="py-24 bg-brand-bg relative z-10">
         <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <Reveal className="mb-20">
               <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">The Foundation</span>
               <h2 className="text-5xl md:text-7xl font-heading font-bold text-brand-dark">Our Ethos</h2>
            </Reveal>

            {/* Sticky Container */}
            <div className="space-y-32 lg:space-y-0">
               
               {/* Card 1 */}
               <Reveal variant="scale" delay={0.1} className="lg:sticky lg:top-32 w-full">
                 <div className="bg-brand-dark text-brand-surface p-8 md:p-20 rounded-[3rem] border border-white/10 shadow-2xl transform transition-transform hover:scale-[1.02] origin-top duration-500 ease-premium">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                       <div>
                          <div className="w-16 h-16 bg-brand-surface/10 rounded-2xl flex items-center justify-center text-[#4ADE80] mb-8">
                             <Shield size={32} />
                          </div>
                          <h3 className="text-4xl md:text-6xl font-heading font-bold mb-6">Uncompromising <br/> Integrity</h3>
                       </div>
                       <p className="text-xl md:text-2xl text-white/60 max-w-md leading-relaxed font-medium mt-4">
                          We don't cut corners. We build fortresses. Adhering to the highest standards of the ICAI to protect your reputation and ours.
                       </p>
                    </div>
                    <div className="mt-20 pt-10 border-t border-white/10 flex justify-between items-end">
                       <span className="text-[6rem] md:text-[10rem] font-serif italic opacity-10 leading-none -mb-6 md:-mb-10">01</span>
                    </div>
                 </div>
               </Reveal>

               {/* Card 2 */}
               <Reveal variant="scale" delay={0.1} className="lg:sticky lg:top-40 w-full">
                 <div className="bg-[#1A4D2E] text-white p-8 md:p-20 rounded-[3rem] border border-white/10 shadow-2xl transform transition-transform hover:scale-[1.02] origin-top lg:rotate-1 duration-500 ease-premium">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                       <div>
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8">
                             <CheckCircle2 size={32} />
                          </div>
                          <h3 className="text-4xl md:text-6xl font-heading font-bold mb-6">Precision <br/> Compliance</h3>
                       </div>
                       <p className="text-xl md:text-2xl text-white/80 max-w-md leading-relaxed font-medium mt-4">
                          In our line of work, details aren't just details. They are the difference between a clean slate and a costly penalty.
                       </p>
                    </div>
                    <div className="mt-20 pt-10 border-t border-white/10 flex justify-between items-end">
                       <span className="text-[6rem] md:text-[10rem] font-serif italic opacity-10 leading-none -mb-6 md:-mb-10">02</span>
                    </div>
                 </div>
               </Reveal>

               {/* Card 3 */}
               <Reveal variant="scale" delay={0.1} className="lg:sticky lg:top-48 w-full">
                 <div className="bg-[#F2F2F0] text-brand-dark p-8 md:p-20 rounded-[3rem] border border-brand-dark/10 shadow-2xl transform transition-transform hover:scale-[1.02] origin-top lg:-rotate-1 duration-500 ease-premium">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                       <div>
                          <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-8">
                             <TrendingUp size={32} />
                          </div>
                          <h3 className="text-4xl md:text-6xl font-heading font-bold mb-6">Strategic <br/> Growth</h3>
                       </div>
                       <p className="text-xl md:text-2xl text-brand-stone max-w-md leading-relaxed font-medium mt-4">
                          We structure finances to fuel expansion. Your business goals become our professional mission.
                       </p>
                    </div>
                    <div className="mt-20 pt-10 border-t border-brand-dark/10 flex justify-between items-end">
                       <span className="text-[6rem] md:text-[10rem] font-serif italic text-brand-dark opacity-5 leading-none -mb-6 md:-mb-10">03</span>
                    </div>
                 </div>
               </Reveal>

            </div>
         </div>
      </section>

      {/* 3. IMMERSIVE SERVICES - DARK MODE */}
      <section className="py-32 px-4 md:px-6 bg-[#0A0A0A] text-white rounded-t-[4rem] relative overflow-hidden">
         <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6 border-b border-white/10 pb-10">
               <Reveal>
                  <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Expertise</span>
                  <h2 className="text-5xl md:text-7xl font-heading font-bold text-white">
                     Service Matrix
                  </h2>
               </Reveal>
               <Reveal delay={0.2} className="md:w-1/3">
                 <p className="text-white/60 font-medium text-lg leading-relaxed text-right md:text-left">
                    Comprehensive financial architecture for businesses that demand excellence.
                 </p>
               </Reveal>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'GST Filing & Registration', icon: <BarChart3 className="text-[#4ADE80]" />, desc: "End-to-end GST compliance and planning." },
                    { title: 'Income Tax Advisory', icon: <Calculator className="text-[#4ADE80]" />, desc: "Strategic tax planning to maximize savings." },
                    { title: 'Audit & Assurance', icon: <Shield className="text-[#4ADE80]" />, desc: "Statutory, Tax, and Internal audits." }
                ].map((s, i) => (
                    <Reveal key={i} delay={i * 0.1} variant="slide-up">
                        <div className="p-10 rounded-[2.5rem] bg-[#111111] border border-white/5 hover:bg-[#161616] hover:border-[#4ADE80]/30 transition-all duration-500 group h-full flex flex-col justify-between hover:-translate-y-2">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    {React.cloneElement(s.icon as React.ReactElement<{size?: number}>, { size: 28 })}
                                </div>
                                <h3 className="text-2xl font-heading font-bold mb-4">{s.title}</h3>
                                <p className="text-white/50 font-medium leading-relaxed">{s.desc}</p>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#4ADE80] group-hover:text-black group-hover:border-[#4ADE80] transition-all duration-300">
                                    <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
            
            <Reveal className="mt-20 text-center" delay={0.4}>
                <Link to="/services" className="inline-block relative group">
                    <span className="text-2xl font-heading font-bold text-white group-hover:text-[#4ADE80] transition-colors">View All Services</span>
                    <div className="h-[2px] w-full bg-[#4ADE80] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left mt-2"></div>
                </Link>
            </Reveal>
         </div>
      </section>
      
      <Marquee />

      {/* 4. CTA SECTION */}
      <section className="py-32 px-4 md:px-6 bg-brand-bg">
         <div className="container mx-auto max-w-7xl">
            <Reveal variant="scale">
              <div className="bg-brand-moss rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-moss/30">
                 {/* Animated Background blob */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[80px] animate-blob"></div>
                 <div className="absolute inset-0 bg-noise opacity-20 mix-blend-multiply"></div>
                 
                 <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <h2 className="text-5xl md:text-8xl font-heading font-bold text-white mb-10 tracking-tight leading-[0.9]">
                       Ready to scale <br/> with confidence?
                    </h2>
                    <MagneticButton onClick={() => navigate('/contact')} className="border-white/40">
                        Schedule Consultation
                    </MagneticButton>
                 </div>
              </div>
            </Reveal>
         </div>
      </section>
    </div>
  );
};

export default Home;
