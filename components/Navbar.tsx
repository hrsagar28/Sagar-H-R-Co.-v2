
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, CONTACT_INFO } from '../constants';
import { Menu, X, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { useFocusTrap, useReturnFocus, useScrollPosition } from '../hooks';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Use consolidated scroll hook
  const { scrollY } = useScrollPosition();
  const scrolled = scrollY > 20;
  
  // Touch tracking refs for swipe-to-close
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Focus Management Hooks
  useReturnFocus(isOpen);
  useFocusTrap(isOpen, menuRef, () => setIsOpen(false));

  // Close on scroll behavior is now handled via state derived from hook
  useEffect(() => {
    if (isOpen && scrolled) {
      setIsOpen(false);
    }
  }, [scrolled, isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Body Scroll Lock Only
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-4 md:top-6 left-0 w-full z-fixed flex justify-center px-2 md:px-4 pointer-events-none ${className}`}>
      <div className={`
        pointer-events-auto relative flex justify-between items-center px-2 py-2 md:px-3 md:py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${scrolled 
          ? 'bg-brand-surface/90 backdrop-blur-xl shadow-xl shadow-brand-dark/5 w-full max-w-6xl border border-brand-border/50' 
          : 'bg-brand-surface/70 backdrop-blur-md w-full max-w-7xl border border-brand-border/20 md:border-transparent'}
      `}>
        
        {/* Logo - Left Pill */}
        <Link 
          to="/" 
          className="flex items-center gap-2 md:gap-3 bg-brand-surface/50 md:bg-brand-surface px-3 py-2 md:px-5 rounded-full md:border border-brand-border/30 shadow-none md:shadow-sm group hover:border-brand-moss/30 transition-all shrink-0 min-h-[44px]"
          aria-label="Sagar H R & Co. Home"
        >
           <div className="w-8 h-8 md:w-8 md:h-8 bg-brand-dark text-brand-inverse rounded-full flex items-center justify-center font-heading font-bold text-base md:text-lg group-hover:scale-110 transition-transform duration-300 shrink-0">S</div>
           <h1 className="font-heading text-sm md:text-lg font-bold text-brand-dark tracking-tight block whitespace-nowrap">
            Sagar H R & Co.
          </h1>
        </Link>

        {/* Desktop Menu - Center Pill (Rolling Text Effect) */}
        <div className="hidden lg:flex items-center bg-brand-surface/80 px-1 py-1 rounded-full border border-brand-border/30 shadow-sm backdrop-blur-md mx-2" role="menubar">
          {NAV_LINKS.slice(0, 7).map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              role="menuitem"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden whitespace-nowrap group min-h-[44px] flex items-center ${
                location.pathname === link.path 
                  ? 'bg-brand-moss text-brand-inverse shadow-md' 
                  : 'text-brand-stone hover:bg-brand-bg'
              }`}
            >
              {location.pathname === link.path ? (
                // Active State: Simple text
                <span>{link.name}</span>
              ) : (
                // Inactive State: Rolling Animation
                <span className="roll-text-group">
                  <span className="original-text">{link.name}</span>
                  <span className="hover-text">{link.name}</span>
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Actions - Right Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop CTA - New Pill with Icon Circle */}
          <Link 
            to="/contact" 
            className="hidden md:flex pl-6 pr-1.5 py-1.5 bg-brand-dark text-brand-inverse text-sm font-bold rounded-full shadow-lg shadow-brand-dark/10 items-center gap-3 group transition-all duration-300 hover:bg-brand-dark/90 hover:ring-4 hover:ring-brand-border/20 min-h-[44px]"
            aria-label="Contact Us"
          >
            <span className="pl-1 group-hover:translate-x-0.5 transition-transform duration-300">Let's Talk</span>
            <div className="w-9 h-9 bg-brand-moss text-white rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-brand-dark group-hover:scale-110">
              <MessageSquare size={14} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </Link>

          {/* Mobile specific Call Button - Increased Touch Target */}
          <a
            href={`tel:${CONTACT_INFO.phone.value}`}
            className="md:hidden w-12 h-12 bg-brand-moss text-brand-inverse rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md"
            aria-label="Call Now"
          >
            <Phone size={20} />
          </a>
          
          {/* Mobile Toggle - Increased Touch Target */}
          <button 
            ref={buttonRef}
            className="lg:hidden w-12 h-12 flex items-center justify-center bg-brand-surface rounded-full border border-brand-border text-brand-dark hover:bg-brand-bg transition-colors active:scale-90 z-dropdown relative"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchEndX.current = e.touches[0].clientX; // Initialize to avoid false positives
          }}
          onTouchMove={(e) => {
            touchEndX.current = e.touches[0].clientX;
          }}
          onTouchEnd={() => {
            const swipeDistance = touchEndX.current - touchStartX.current;
            // If swiped right more than 100px, close menu
            if (swipeDistance > 100) {
              setIsOpen(false);
            }
          }}
          className={`
            absolute top-full right-0 w-[calc(100vw-32px)] md:w-80 mt-4 
            bg-brand-surface/95 backdrop-blur-2xl rounded-[2rem] border border-brand-border/60 shadow-2xl 
            p-6 flex flex-col gap-2 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] origin-top-right
            ${isOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-4 pointer-events-none'}
          `}
        >
           {NAV_LINKS.filter(link => link.name !== 'Contact').map((link, idx) => (
             <Link 
               key={link.name}
               to={link.path}
               onClick={() => setIsOpen(false)}
               // Staggered reveal animation logic integrated into styling
               className={`
                 text-xl font-heading font-bold text-brand-dark hover:text-brand-moss px-4 py-4 
                 hover:bg-brand-bg rounded-xl transition-all duration-500 ease-out flex justify-between items-center group min-h-[60px]
                 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
               `}
               style={{ transitionDelay: isOpen ? `${idx * 75}ms` : '0ms' }}
             >
               {link.name}
               <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
             </Link>
           ))}
           <div 
             className={`mt-4 pt-4 border-t border-brand-border/50 transition-all duration-500 delay-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           >
             <Link 
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full py-5 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 text-lg min-h-[60px] shadow-lg active:scale-95 transition-transform"
             >
                Let's Talk <MessageSquare size={20} />
             </Link>
           </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 transition-opacity duration-500 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
      />
    </nav>
  );
});

export default Navbar;
