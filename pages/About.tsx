
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, ShieldCheck, TrendingUp, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-brand-surface/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                The Firm
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                More Than <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">Numbers.</span>
              </h1>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="lg:col-span-7">
                 <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-brand-border bg-brand-surface shadow-2xl group">
                    <div className="absolute inset-0 bg-brand-moss/5 transition-colors group-hover:bg-brand-moss/10"></div>
                    <div className="absolute top-0 right-0 w-full h-full opacity-30">
                        <div className="absolute top-10 right-10 w-32 h-32 border-4 border-brand-dark/10 rounded-full"></div>
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-moss/10 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                        <span className="font-heading font-bold text-4xl md:text-6xl text-brand-dark mb-2">Est. 2023</span>
                        <span className="font-serif italic text-xl text-brand-stone">Mysuru, Karnataka</span>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-5 pb-4">
                 <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed mb-8">
                   Sagar H R & Co. bridges the gap between regulatory complexity and strategic business growth.
                 </p>
                 <div className="flex flex-col gap-4 border-l border-brand-border pl-6">
                    <p className="text-brand-stone/80 text-lg">
                       Founded with a singular ambition: to disrupt the traditional "compliance-only" model of accountancy. We are architects of financial stability.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-4 md:px-6 bg-brand-dark text-brand-surface relative overflow-hidden">
         <div className="absolute inset-0 bg-noise opacity-[0.15]"></div>
         <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
               <div className="md:w-1/3">
                  <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Our Philosophy</span>
                  <h2 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
                     Radical <br/> Transparency.
                  </h2>
               </div>
               <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10 pt-12">
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <Target className="text-brand-moss" /> Precision
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        We aim for perfection in every filing. In our line of work, details aren't just details; they are the difference between compliance and penalty.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <ShieldCheck className="text-brand-moss" /> Integrity
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        Adhering to the highest ethical standards of the ICAI. We provide honest, unbiased advice that puts your long-term interest first.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="text-brand-moss" /> Growth
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        Your business goals become our professional mission. We structure finances to fuel expansion, not just to satisfy the taxman.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="text-brand-moss" /> Knowledge
                     </h3>
                     <p className="text-white/60 leading-relaxed">
                        Continuous learning ensures we master the latest laws and amendments, giving you the advantage of foresight.
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
               
               <div className="lg:w-2/5 relative min-h-[400px] lg:min-h-auto border-b lg:border-b-0 lg:border-r border-brand-border group overflow-hidden">
                  <img 
                    src="/sagar-hr.jpg" 
                    alt="CA Sagar H R" 
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-moss/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
               </div>

               <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center">
                  <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Principal Partner</span>
                  <h2 className="text-4xl md:text-6xl font-heading font-bold text-brand-dark mb-2">CA Sagar H R</h2>
                  <p className="text-brand-stone font-bold text-sm uppercase tracking-widest mb-8">B.Com, ACA</p>
                  
                  <div className="space-y-6 text-lg text-brand-stone font-medium leading-relaxed">
                     <p>
                        With a deep-rooted expertise in Corporate Taxation and Statutory Audit, CA Sagar H R established the firm to bring a fresh perspective to financial advisory.
                     </p>
                     <p>
                        "We don't just look at the books; we look at the business. Understanding the operational reality behind the numbers allows us to offer advice that is practical, actionable, and transformative."
                     </p>
                  </div>

                  <div className="mt-12 pt-10 border-t border-brand-border grid grid-cols-2 gap-6">
                     <div>
                        <h4 className="font-bold text-brand-dark mb-2">Expertise</h4>
                        <ul className="text-sm text-brand-stone space-y-1">
                           <li>• Direct Taxation</li>
                           <li>• GST Compliance</li>
                           <li>• Startup Structuring</li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold text-brand-dark mb-2">Affiliations</h4>
                        <ul className="text-sm text-brand-stone space-y-1">
                           <li>• Fellow Member, ICAI</li>
                           <li>• Mysuru Branch, SIRC</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 md:px-6 border-t border-brand-border bg-brand-surface">
         <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
               <div className="space-y-2">
                  <span className="block text-5xl md:text-7xl font-heading font-bold text-brand-dark">50+</span>
                  <span className="text-brand-stone text-xs font-bold uppercase tracking-widest">Corporate Clients</span>
               </div>
               <div className="space-y-2">
                  <span className="block text-5xl md:text-7xl font-heading font-bold text-brand-dark">100%</span>
                  <span className="text-brand-stone text-xs font-bold uppercase tracking-widest">Compliance Rate</span>
               </div>
               <div className="space-y-2">
                  <span className="block text-5xl md:text-7xl font-heading font-bold text-brand-dark">12+</span>
                  <span className="text-brand-stone text-xs font-bold uppercase tracking-widest">Industries Served</span>
               </div>
               <div className="space-y-2">
                  <span className="block text-5xl md:text-7xl font-heading font-bold text-brand-dark">24/7</span>
                  <span className="text-brand-stone text-xs font-bold uppercase tracking-widest">Digital Support</span>
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
                  <h2 className="text-4xl md:text-7xl font-heading font-bold text-white mb-8">Ready to build?</h2>
                  <p className="text-white/80 text-xl mb-12 leading-relaxed font-medium">
                     Experience the difference of a partner who is as invested in your growth as you are.
                  </p>
                  <Link to="/contact" className="inline-block px-10 py-4 bg-white text-brand-moss font-bold rounded-full text-lg hover:bg-brand-dark hover:text-white transition-all duration-300 shadow-lg">
                     Schedule Consultation
                  </Link>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default About;
