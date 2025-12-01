
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, TrendingUp, CheckCircle2, BarChart3, Calculator, ArrowRight, Check } from 'lucide-react';
import { Marquee, Reveal, MagneticButton, OptimizedImage, SEO, Parallax, ScrollyTelling } from '../components';
import { CONTACT_INFO } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();

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

  // ScrollyTelling Data - Enhanced Visuals
  const ethosItems = [
    {
      id: 'integrity',
      title: 'Uncompromising Integrity',
      description: "We don't cut corners. We build fortresses. Adhering to the highest standards of the ICAI to protect your reputation and ours.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-brand-moss/80 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(26,77,46,0.3)] flex flex-col items-center justify-center p-8 relative overflow-hidden group backdrop-blur-xl">
           {/* Abstract Grid */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
           
           {/* Main Icon with Glow */}
           <div className="relative z-10 p-6 rounded-full border border-[#4ADE80]/30 bg-[#4ADE80]/10 mb-8 shadow-[0_0_30px_rgba(74,222,128,0.2)] animate-pulse">
              <Shield size={48} className="text-[#4ADE80]" strokeWidth={1.5} />
           </div>

           {/* Laser Scan Effect */}
           <div className="absolute top-0 left-0 w-full h-1 bg-[#4ADE80]/50 shadow-[0_0_15px_#4ADE80] animate-[blob_3s_infinite_ease-in-out] opacity-50"></div>
           
           <div className="w-full space-y-3 relative z-10">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#4ADE80] w-[90%] animate-[expandWidth_2s_ease-out_forwards]"></div>
              </div>
              <div className="h-1.5 w-2/3 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#4ADE80] w-[80%] animate-[expandWidth_2s_ease-out_0.2s_forwards]"></div>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#4ADE80] tracking-widest mt-2">
                 <span>Security</span>
                 <span>100%</span>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: 'Precision Compliance',
      description: "In our line of work, details aren't just details. They are the difference between a clean slate and a costly penalty.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-blue-900/40 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col items-center justify-center p-8 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           
           {/* Checklist Items */}
           <div className="w-full space-y-4 relative z-10">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:bg-white/10 group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 delay-${i*100} ${'bg-blue-500 text-white'}`}>
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
      id: 'growth',
      title: 'Strategic Growth',
      description: "We structure finances to fuel expansion. Your business goals become our professional mission.",
      visual: (
        <div className="w-72 h-96 md:w-80 md:h-[28rem] bg-gradient-to-br from-purple-900/40 to-brand-black rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col justify-end p-8 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
           
           {/* Rising Graph Animation */}
           <div className="flex items-end justify-between gap-3 h-48 w-full relative z-10 pb-4">
              {[30, 45, 60, 40, 75, 90, 100].map((h, i) => (
                 <div key={i} className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md relative group">
                    <div className="absolute top-0 w-full h-full bg-white/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div 
                      className="w-full bg-purple-500 absolute bottom-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                      style={{ height: `${h}%`, animation: `growUp 1s ease-out ${i * 0.1}s backwards` }}
                    ></div>
                 </div>
              ))}
           </div>

           <div className="flex items-center gap-3 relative z-10 border-t border-white/10 pt-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                 <TrendingUp size={24} />
              </div>
              <div>
                 <span className="block text-xs text-purple-200/60 uppercase tracking-wider">Growth Rate</span>
                 <span className="text-xl font-bold text-white">+124%</span>
              </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full bg-brand-bg">
      <SEO 
        title={`${CONTACT_INFO.name} | Premium Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name} - Trusted financial advisors in Mysuru. Expert services in Audit, Taxation, GST, and Business Advisory for modern businesses.`}
        schema={schema}
      />
      
      {/* 1. CINEMATIC HERO SECTION WITH PARALLAX */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-6 overflow-hidden pt-20">
        
        {/* Parallax Background Image - Moves slower than scroll (-0.3 speed) */}
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
           <Parallax speed={0.4} className="w-full h-[120%] -top-[10%] relative">
             <OptimizedImage 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
              alt="Corporate Architecture" 
              priority={true}
              className="w-full h-full opacity-80 object-cover" 
             />
           </Parallax>
           {/* Dark Black Vignette & Overlays */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.95)_100%)] z-10 pointer-events-none"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80 z-10 pointer-events-none"></div>
        </div>

        {/* Content with Parallax - Moves slightly faster than scroll to create separation */}
        <Parallax speed={-0.1} className="container mx-auto max-w-7xl relative z-20 mt-12 md:mt-0">
           <div className="max-w-6xl">
              
              {/* Animated Badge */}
              <Reveal delay={0.1} variant="fade-up">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-8">
                  <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_12px_#4ADE80]"></div>
                  <span>Chartered Accountants</span>
                </div>
              </Reveal>
              
              {/* Masked Text Reveal - Huge Typography */}
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
        </Parallax>
      </section>

      {/* 2. PHILOSOPHY - SCROLLYTELLING SECTION (IMPROVED) */}
      <ScrollyTelling items={ethosItems} />

      {/* 3. IMMERSIVE SERVICES - DARK MODE */}
      <section className="py-32 px-4 md:px-6 bg-brand-black text-white rounded-t-[4rem] relative overflow-hidden -mt-24 z-30">
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
                        <div className="p-10 rounded-[2.5rem] bg-brand-dark border border-white/5 hover:bg-brand-surface-dark-hover hover:border-[#4ADE80]/30 transition-all duration-500 group h-full flex flex-col justify-between hover:-translate-y-2">
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

      {/* 4. CTA SECTION WITH PARALLAX BLOB */}
      <section className="py-32 px-4 md:px-6 bg-brand-bg relative overflow-hidden">
         <div className="container mx-auto max-w-7xl">
            <Reveal variant="scale">
              <div className="bg-brand-moss rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-moss/30 group">
                 {/* Parallax Background blob */}
                 <div className="absolute inset-0 z-0">
                    <Parallax speed={-0.1} className="w-full h-full">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[80px] animate-blob"></div>
                    </Parallax>
                 </div>
                 <div className="absolute inset-0 bg-noise opacity-20 mix-blend-multiply pointer-events-none"></div>
                 
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
