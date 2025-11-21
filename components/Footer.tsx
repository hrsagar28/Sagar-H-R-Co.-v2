import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Facebook, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-bg pt-10 md:pt-20 pb-6 md:pb-10 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl bg-brand-surface rounded-[2rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden relative shadow-sm">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 p-8 md:p-20 relative z-10">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <Link to="/" className="flex items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-dark text-brand-inverse rounded-lg flex items-center justify-center font-heading font-bold text-lg md:text-xl">S</div>
               <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-dark tracking-tight">
                Sagar H R & Co.
              </h2>
            </Link>
            <p className="text-brand-stone text-base md:text-lg max-w-md leading-relaxed">
              Architecting financial stability through precision audit, strategic tax planning, and regulatory foresight.
            </p>
            <div className="flex gap-4 pt-2 md:pt-4">
              {[
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Facebook, label: "Facebook" }
              ].map(({ Icon, label }, i) => (
                <a 
                  key={i} 
                  href="#" 
                  aria-label={`Visit our ${label} page`}
                  className="w-10 h-10 md:w-12 md:h-12 border border-brand-border rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all duration-300 group"
                >
                  <Icon size={18} className="md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold text-brand-dark text-base md:text-lg mb-4 md:mb-6 uppercase tracking-wider">Firm</h3>
            <ul className="space-y-3 md:space-y-4 text-brand-stone font-medium text-sm md:text-base">
              <li><Link to="/about" className="hover:text-brand-moss transition-colors flex items-center gap-1 group">About Us <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/></Link></li>
              <li><Link to="/services" className="hover:text-brand-moss transition-colors flex items-center gap-1 group">Expertise <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/></Link></li>
              <li><Link to="/careers" className="hover:text-brand-moss transition-colors flex items-center gap-1 group">Careers <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/></Link></li>
              <li><Link to="/contact" className="hover:text-brand-moss transition-colors flex items-center gap-1 group">Contact <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-brand-dark text-base md:text-lg mb-4 md:mb-6 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 md:space-y-4 text-brand-stone font-medium text-sm md:text-base">
              <li><Link to="/privacy" className="hover:text-brand-moss transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-moss transition-colors">Terms of Engagement</Link></li>
              <li><Link to="/disclaimer" className="hover:text-brand-moss transition-colors">ICAI Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border p-6 md:p-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-brand-stone/80 relative z-10 bg-brand-bg/50 backdrop-blur-sm gap-4 md:gap-0 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Sagar H R & Co. Chartered Accountants.</p>
          <p>Designed with Precision.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;