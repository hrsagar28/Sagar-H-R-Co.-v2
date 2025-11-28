
import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, ArrowUp } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const Footer: React.FC = React.memo(() => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-bg pt-20">
      {/* Main Footer Container */}
      <div className="bg-[#0f0f0f] text-white rounded-t-[3rem] relative overflow-hidden">
        
        {/* Navigation Grid - Moved to top of footer content since CTA is removed */}
        <div className="px-6 md:px-20 py-20">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
              
              {/* Column 1: Brand & Address */}
              <div className="md:col-span-4 lg:col-span-5 space-y-8">
                 <Link to="/" className="inline-block">
                    <div className="w-12 h-12 bg-white text-brand-dark rounded-xl flex items-center justify-center font-heading font-bold text-2xl">S</div>
                 </Link>
                 <address className="not-italic text-zinc-400 text-lg leading-relaxed max-w-sm font-medium">
                    {CONTACT_INFO.address.street},<br/>
                    {CONTACT_INFO.address.city} - {CONTACT_INFO.address.zip}<br/>
                    {CONTACT_INFO.address.state}, {CONTACT_INFO.address.country}
                 </address>
                 <div className="flex gap-4">
                    <a href={CONTACT_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-brand-dark transition-all" aria-label="LinkedIn Profile">
                       <Linkedin size={20} />
                    </a>
                 </div>
              </div>

              {/* Column 2: Explore (Main Pages) */}
              <div className="md:col-span-2 lg:col-span-2">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">Explore</h3>
                 <ul className="space-y-4">
                    {[
                       { name: "Home", path: "/" },
                       { name: "About Firm", path: "/about" },
                       { name: "Our Services", path: "/services" },
                       { name: "Insights", path: "/insights" },
                    ].map(link => (
                       <li key={link.name}>
                          <Link to={link.path} className="text-lg font-medium text-zinc-300 hover:text-[#4ADE80] transition-colors inline-flex items-center gap-2 group">
                             {link.name}
                          </Link>
                       </li>
                    ))}
                 </ul>
              </div>

              {/* Column 3: Resources */}
              <div className="md:col-span-3 lg:col-span-2">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">Resources</h3>
                 <ul className="space-y-4">
                    {[
                       { name: "Client Resources", path: "/resources" },
                       { name: "FAQs", path: "/faqs" },
                       { name: "Careers", path: "/careers" },
                       { name: "Contact Us", path: "/contact" },
                    ].map(link => (
                       <li key={link.name}>
                          <Link to={link.path} className="text-lg font-medium text-zinc-300 hover:text-[#4ADE80] transition-colors inline-flex items-center gap-2 group">
                             {link.name}
                          </Link>
                       </li>
                    ))}
                 </ul>
              </div>

              {/* Column 4: Quick Contact */}
              <div className="md:col-span-3 lg:col-span-3">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">Get in touch</h3>
                 <ul className="space-y-6">
                    <li>
                       <span className="block text-sm text-zinc-500 mb-1">Email</span>
                       <a href={`mailto:${CONTACT_INFO.email}`} className="text-xl font-heading font-bold text-white hover:text-[#4ADE80] transition-colors">{CONTACT_INFO.email}</a>
                    </li>
                    <li>
                       <span className="block text-sm text-zinc-500 mb-1">Phone</span>
                       <a href={`tel:${CONTACT_INFO.phone.value}`} className="text-xl font-heading font-bold text-white hover:text-[#4ADE80] transition-colors">{CONTACT_INFO.phone.display}</a>
                    </li>
                 </ul>
              </div>

           </div>
        </div>

        {/* Bottom Section: Huge Typography & Legal */}
        <div className="px-6 md:px-20 pb-10">
           <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm font-medium text-zinc-500">
                 <span>&copy; {new Date().getFullYear()} {CONTACT_INFO.name}</span>
                 <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                 <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                 <Link to="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
              </div>

              <button 
                 onClick={scrollToTop} 
                 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-[#4ADE80] transition-colors group"
              >
                 Back to Top 
                 <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
              </button>
           </div>

           {/* Watermark Text - Outline Style for Premium Look */}
           <div className="relative overflow-hidden select-none pb-4">
              <h1 
                className="text-[12vw] leading-[0.8] font-heading font-bold text-center tracking-tighter opacity-20"
                style={{ 
                   WebkitTextStroke: '1px rgba(255, 255, 255, 0.5)', 
                   color: 'transparent' 
                }}
              >
                 SAGAR H R & CO.
              </h1>
           </div>
        </div>

      </div>
    </footer>
  );
});

export default Footer;
