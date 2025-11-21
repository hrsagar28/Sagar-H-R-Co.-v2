import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-4 md:top-6 left-0 w-full z-50 flex justify-center px-2 md:px-4 pointer-events-none ${className}`}>
      <div className={`
        pointer-events-auto relative flex justify-between items-center px-2 py-2 md:px-3 md:py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${scrolled 
          ? 'bg-brand-surface/90 backdrop-blur-xl shadow-xl shadow-brand-dark/5 w-full max-w-6xl border border-brand-border/50' 
          : 'bg-brand-surface/70 backdrop-blur-md w-full max-w-7xl border border-brand-border/20 md:border-transparent'}
      `}>
        
        {/* Logo - Left Pill */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 bg-brand-surface/50 md:bg-brand-surface px-2 md:px-5 py-1.5 md:py-2 rounded-full md:border border-brand-border/30 shadow-none md:shadow-sm group hover:border-brand-moss/30 transition-all shrink-0">
           <div className="w-8 h-8 md:w-8 md:h-8 bg-brand-dark text-brand-inverse rounded-full flex items-center justify-center font-heading font-bold text-base md:text-lg group-hover:bg-brand-moss transition-colors duration-300 shrink-0">S</div>
           <h1 className="font-heading text-sm md:text-lg font-bold text-brand-dark tracking-tight block whitespace-nowrap">
            Sagar H R & Co.
          </h1>
        </Link>

        {/* Desktop Menu - Center Pill */}
        <div className="hidden lg:flex items-center bg-brand-surface/80 px-1 py-1 rounded-full border border-brand-border/30 shadow-sm backdrop-blur-md mx-2">
          {NAV_LINKS.slice(0, 7).map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden whitespace-nowrap ${
                location.pathname === link.path 
                  ? 'bg-brand-moss text-brand-inverse shadow-md' 
                  : 'text-brand-stone hover:text-brand-dark hover:bg-brand-bg'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions - Right Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop CTA */}
          <Link 
            to="/contact" 
            className="hidden md:flex px-5 md:px-6 py-3 bg-brand-dark text-brand-inverse text-sm font-bold rounded-full hover:bg-brand-moss transition-all duration-300 shadow-lg shadow-brand-dark/10 items-center gap-2 whitespace-nowrap"
          >
            Let's Talk
            <span className="w-1.5 h-1.5 bg-brand-moss group-hover:bg-white rounded-full transition-colors"></span>
          </Link>

          {/* Mobile specific CTA - Text Button */}
          <Link 
            to="/contact" 
            className="md:hidden px-4 py-2 bg-brand-dark text-brand-inverse text-xs font-bold rounded-full active:scale-95 transition-transform shadow-md whitespace-nowrap"
          >
             Let's Talk
          </Link>
          
          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2.5 bg-brand-surface rounded-full border border-brand-border text-brand-dark hover:bg-brand-bg transition-colors active:scale-90"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          id="mobile-menu"
          className={`absolute top-full left-0 w-full mt-4 bg-brand-surface rounded-[2rem] border border-brand-border shadow-2xl p-6 flex flex-col gap-4 transition-all duration-300 origin-top ${
            isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
          }`}
        >
           {/* Filter out 'Contact' from the list because 'Let's Talk' is already in the header */}
           {NAV_LINKS.filter(link => link.name !== 'Contact').map((link) => (
             <Link 
               key={link.name}
               to={link.path}
               onClick={() => setIsOpen(false)}
               className="text-xl font-heading font-bold text-brand-dark hover:text-brand-moss px-4 py-2 hover:bg-brand-bg rounded-xl transition-all"
             >
               {link.name}
             </Link>
           ))}
           {/* Removed redundant 'Get in Touch' button since 'Let's Talk' is persistent in the header */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;