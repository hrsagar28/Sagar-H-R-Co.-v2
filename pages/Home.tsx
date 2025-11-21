import React from 'react';
import { ArrowRight, ArrowUpRight, Play, Layers, Shield, Zap, TrendingUp } from 'lucide-react';
import Marquee from '../components/Marquee';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const Home: React.FC = () => {
  return (
    <div className="w-full bg-brand-bg overflow-hidden">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen w-full flex flex-col justify-center px-4 md:px-10 overflow-hidden bg-brand-dark text-brand-surface">
        
        {/* Background Photo Container with Ken Burns Effect */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Abstract Architectural Structure"
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale contrast-125 animate-[scaleIn_30s_ease-in-out_infinite_alternate]"
          />
          
          {/* Film Grain / Noise Texture Overlay - Gives it that "Magazine" feel */}
          <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay z-[5]"></div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent z-10"></div>
        </div>

        <div className="relative z-20 container mx-auto max-w-7xl h-full flex flex-col justify-center pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            
            {/* Main Typography */}
            <div className="lg:col-span-8">
              <div className="overflow-hidden mb-2">
                {/* Mix blend mode difference allows text to interact interestingly with the image behind it */}
                <h1 className="text-[14vw] lg:text-[8rem] font-heading font-bold leading-[0.8] tracking-tighter text-white animate-slide-up drop-shadow-2xl">
                  Beyond
                </h1>
              </div>
              <div className="overflow-hidden mb-6">
                <h1 className="text-[14vw] lg:text-[8rem] font-serif italic font-light leading-[0.8] text-white/90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  Numbers.
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-brand-stone font-sans font-light max-w-xl animate-fade-in-up leading-relaxed text-white/80" style={{ animationDelay: '0.3s' }}>
                Structuring financial clarity for the modern enterprise. 
                Precision audit, strategic taxation, and growth advisory.
              </p>
              
              <div className="flex flex-wrap gap-6 mt-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                 <Link to="/contact" className="group px-8 py-4 bg-white text-brand-dark rounded-full font-bold flex items-center gap-3 hover:bg-brand-moss hover:text-white transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(26,77,46,0.4)]">
                    Partner With Us <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </Link>
                 <Link to="/services" className="group px-8 py-4 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center gap-3">
                    <Play size={16} fill="currentColor" className="opacity-60" />
                    Our Expertise
                 </Link>
              </div>
            </div>

            {/* Hero Stat / Graphic - The "Seal of Excellence" */}
            <div className="lg:col-span-4 hidden lg:flex flex-col justify-end items-end pb-4 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
               <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-lg border border-white/10 max-w-xs w-full relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
                  {/* Scanning Line Effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 animate-[blob_4s_infinite]"></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <span className="text-xs font-bold uppercase tracking-widest text-brand-moss bg-white/90 px-2 py-1 rounded">Est. 2023</span>
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                  </div>
                  <div className="space-y-1 relative z-10">
                     <span className="text-5xl font-serif italic text-white">100%</span>
                     <p className="text-sm text-white/60 font-medium">Compliance Accuracy</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3 relative z-10">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full bg-brand-stone border border-brand-dark flex items-center justify-center text-[8px] text-white font-bold">CA</div>
                        ))}
                     </div>
                     <span className="text-xs text-white/50">Expert Team</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce z-20 mix-blend-difference">
           <span className="text-[10px] uppercase tracking-[0.3em] writing-vertical-lr">Scroll</span>
        </div>
      </section>

      {/* 2. THE MANIFESTO (Editorial Layout) */}
      <section className="py-24 md:py-32 px-4 md:px-10 bg-brand-bg">
         <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row gap-16 items-start">
               <div className="md:w-1/3 sticky top-32">
                  <span className="inline-block px-3 py-1 rounded-full border border-brand-dark/20 text-brand-dark text-xs font-bold uppercase tracking-widest mb-6">
                     Our Philosophy
                  </span>
                  <h2 className="text-5xl md:text-6xl font-heading font-bold text-brand-dark leading-[0.9] tracking-tight">
                     Precision in <br/> <span className="text-brand-moss font-serif italic">Motion.</span>
                  </h2>
               </div>
               <div className="md:w-2/3">
                  <p className="text-2xl md:text-4xl font-serif text-brand-dark leading-tight mb-12">
                     "In a world of volatile markets and complex regulations, static advice is obsolete. We provide dynamic financial structures that evolve with your business."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2"><Layers size={20} className="text-brand-moss"/> Structural Integrity</h3>
                        <p className="text-brand-stone leading-relaxed">
                           We build robust financial frameworks. From entity incorporation to internal audits, we ensure your business foundation is solid enough to support unlimited growth.
                        </p>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2"><Zap size={20} className="text-brand-moss"/> Proactive Strategy</h3>
                        <p className="text-brand-stone leading-relaxed">
                           We don't just report on the past; we forecast the future. Our advisory services are designed to identify tax efficiencies and funding opportunities before you need them.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. ELEGANT SERVICES (Bento Box Style) */}
      <section className="py-20 px-4 md:px-6 bg-brand-surface rounded-t-[3rem] md:rounded-t-[5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.02)] z-10 relative">
         <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-end mb-16 md:mb-24">
               <div>
                  <h2 className="text-4xl md:text-7xl font-heading font-bold text-brand-dark tracking-tighter mb-4">
                     Our Expertise
                  </h2>
                  <p className="text-brand-stone text-lg md:text-xl font-medium">Comprehensive solutions for the modern economy.</p>
               </div>
               <Link to="/services" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-brand-border hover:bg-brand-dark hover:text-white transition-all font-bold">
                  View All Services <ArrowRight size={16} />
               </Link>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Large Card 1 */}
               <div className="md:col-span-2 bg-brand-bg rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss/5 rounded-full blur-3xl group-hover:bg-brand-moss/10 transition-colors"></div>
                  <div className="relative z-10">
                     <div className="w-14 h-14 bg-brand-surface rounded-2xl flex items-center justify-center text-brand-moss mb-8 shadow-sm">
                        <Shield size={28} />
                     </div>
                     <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4 group-hover:translate-x-2 transition-transform">Audit & Assurance</h3>
                     <p className="text-brand-stone text-lg max-w-md mb-8">
                        Rigorous examination of your financial statements to ensure accuracy, compliance, and investor confidence. We provide the transparency your stakeholders demand.
                     </p>
                     <Link to="/services/audit" className="inline-flex items-center gap-2 text-brand-moss font-bold border-b border-brand-moss/20 pb-1 hover:border-brand-moss transition-colors">
                        Explore Audit <ArrowUpRight size={16} />
                     </Link>
                  </div>
                  {/* Decoration */}
                  <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className="text-[10rem] font-serif italic leading-none">01</span>
                  </div>
               </div>

               {/* Tall Card 2 */}
               <div className="md:row-span-2 bg-brand-dark text-brand-surface rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  <div className="relative z-10">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 backdrop-blur-md">
                        <TrendingUp size={28} />
                     </div>
                     <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Strategic Advisory</h3>
                     <p className="text-white/60 text-lg mb-8">
                        Beyond compliance. We help you structure deals, plan taxes, and manage risks to maximize profitability.
                     </p>
                     <ul className="space-y-3 text-white/80 font-medium mb-8">
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span> Startup Consulting</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span> Project Financing</li>
                        <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span> Business Valuation</li>
                     </ul>
                  </div>
                  <Link to="/services/advisory" className="relative z-10 w-full py-4 bg-white/10 hover:bg-white text-white hover:text-brand-dark text-center rounded-2xl font-bold backdrop-blur-md transition-all">
                     View Solutions
                  </Link>
               </div>

               {/* Card 3 */}
               <div className="bg-brand-bg rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                   <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-12 h-12 bg-brand-surface rounded-2xl flex items-center justify-center text-brand-moss shadow-sm">
                            <span className="font-heading font-bold text-xl">Tx</span>
                         </div>
                         <span className="text-brand-border font-serif italic text-6xl leading-none opacity-50">03</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-brand-dark mb-3">Taxation</h3>
                      <p className="text-brand-stone mb-6">Direct & Indirect tax planning optimized for savings and safety.</p>
                      <Link to="/services/income-tax" className="text-sm font-bold uppercase tracking-wider text-brand-dark hover:text-brand-moss">Read More &rarr;</Link>
                   </div>
               </div>

               {/* Card 4 */}
               <div className="bg-brand-moss text-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                   <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">GST Compliance</h3>
                      <p className="text-white/80 mb-6">Seamless filing, reconciliation, and dispute resolution.</p>
                      <Link to="/services/gst" className="px-6 py-2 bg-white text-brand-moss rounded-full text-sm font-bold hover:bg-brand-dark hover:text-white transition-colors inline-block">
                         Learn More
                      </Link>
                   </div>
               </div>

            </div>
         </div>
      </section>

      {/* 4. SCROLLING TICKER (Minimalist) */}
      <div className="bg-white py-8 border-y border-brand-border/50 overflow-hidden">
         <Marquee text="TRUSTED BY 50+ CORPORATE ENTITIES • 100% COMPLIANCE RATE • REGISTERED WITH ICAI • " />
      </div>

      {/* 5. MINIMALIST CTA */}
      <section className="py-32 px-4 text-center bg-brand-bg relative overflow-hidden">
         {/* Background Gradient */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-moss/10 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-heading font-bold text-brand-dark mb-8 tracking-tighter">
               Ready to <span className="font-serif italic font-normal text-brand-moss">Scale?</span>
            </h2>
            <p className="text-xl text-brand-stone font-medium mb-12 max-w-2xl mx-auto">
               Let us handle the complexity of your finances so you can focus on the simplicity of your vision.
            </p>
            <Link to="/contact" className="inline-block px-12 py-5 bg-brand-dark text-white text-lg font-bold rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300">
               Schedule Consultation
            </Link>
         </div>
      </section>

    </div>
  );
};

export default Home;