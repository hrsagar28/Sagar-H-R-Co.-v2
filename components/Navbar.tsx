import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { NAV_LINKS, CONTACT_INFO } from '../constants';
import { Menu, X, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { useFocusTrap, useReturnFocus, useScrollPosition } from '../hooks';

const { Link, useLocation } = ReactRouterDOM;

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
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  // Focus Management Hooks
  useReturnFocus(isOpen);
  useFocusTrap(isOpen, menuRef, () => setIsOpen(false));

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
    };
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
    <nav
      className={`pointer-events-none fixed left-0 top-4 z-fixed flex w-full justify-center px-2 md:top-6 md:px-4 ${className}`}
    >
      <div
        className={`pointer-events-auto relative flex items-center justify-between rounded-full px-2 py-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-3 md:py-3 ${
          scrolled
            ? 'w-full max-w-6xl border border-brand-border/50 bg-brand-surface/90 shadow-xl shadow-brand-dark/5 backdrop-blur-xl'
            : 'w-full max-w-7xl border border-brand-border/20 bg-brand-surface/70 backdrop-blur-md md:border-transparent'
        } `}
      >
        {/* Logo - Left Pill */}
        <Link
          to="/"
          className="group flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-brand-border/30 bg-brand-surface/50 px-3 py-2 shadow-none transition-all hover:border-brand-moss/30 md:gap-3 md:border md:bg-brand-surface md:px-5 md:shadow-sm"
          aria-label="Sagar H R & Co. Home"
        >
          <h1 className="block whitespace-nowrap font-heading text-sm font-bold tracking-tight text-brand-dark md:text-lg">
            Sagar H R & Co.
          </h1>
        </Link>

        {/* Desktop Menu - Center Pill (Rolling Text Effect) */}
        <nav
          aria-label="Primary Navigation"
          className="nav-links mx-2 hidden items-center rounded-full border border-brand-border/30 bg-brand-surface/80 px-1 py-1 shadow-sm backdrop-blur-md lg:flex"
        >
          {NAV_LINKS.slice(0, 7).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={location.pathname === link.path ? 'page' : undefined}
              className={`group relative flex min-h-[44px] items-center overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
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
        </nav>

        {/* Actions - Right Pill */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop CTA - New Pill with Icon Circle */}
          <Link
            to="/contact"
            className="group hidden min-h-[44px] items-center gap-3 rounded-full bg-brand-dark py-1.5 pl-6 pr-1.5 text-sm font-bold text-brand-inverse shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:bg-brand-dark/90 hover:ring-4 hover:ring-brand-border/20 md:flex"
            aria-label="Contact Us"
          >
            <span className="pl-1 transition-transform duration-300 group-hover:translate-x-0.5">Contact</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-moss text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-dark">
              <MessageSquare size={14} className="transition-transform duration-300 group-hover:rotate-12" />
            </div>
          </Link>

          {/* Mobile specific Call Button - Increased Touch Target */}
          <a
            href={`tel:${CONTACT_INFO.phone.value}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-moss text-brand-inverse shadow-md transition-transform active:scale-95 md:hidden"
            aria-label="Call Now"
          >
            <Phone size={20} />
          </a>

          {/* Mobile Toggle - Increased Touch Target */}
          <button
            ref={buttonRef}
            className="relative z-dropdown flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-dark transition-colors hover:bg-brand-bg active:scale-90 lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
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
            const touch = e.touches[0];
            if (!touch) return;
            touchStartX.current = touch.clientX;
            touchStartY.current = touch.clientY;
            touchEndX.current = touch.clientX;
            touchEndY.current = touch.clientY;
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            if (!touch) return;
            touchEndX.current = touch.clientX;
            touchEndY.current = touch.clientY;
          }}
          onTouchEnd={() => {
            const xDiff = touchEndX.current - touchStartX.current;
            const yDiff = Math.abs(touchEndY.current - touchStartY.current);

            // Close menu only if swipe is significantly horizontal (>100px)
            // and minimally vertical (<50px) to prevent closing while scrolling lists.
            if (xDiff > 100 && yDiff < 50) {
              setIsOpen(false);
            }
          }}
          className={`absolute right-0 top-full mt-4 flex w-[calc(100vw-32px)] origin-top-right flex-col gap-2 rounded-[2rem] border border-brand-border/60 bg-brand-surface/95 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] md:w-80 ${isOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'pointer-events-none invisible -translate-y-4 scale-95 opacity-0'} `}
        >
          {NAV_LINKS.filter((link) => link.name !== 'Contact').map((link, idx) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={location.pathname === link.path ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
              // Staggered reveal animation logic integrated into styling
              className={`group flex min-h-[60px] items-center justify-between rounded-xl px-4 py-4 font-heading text-xl font-bold text-brand-dark transition-all duration-500 ease-out hover:bg-brand-bg hover:text-brand-moss ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} `}
              style={{ transitionDelay: isOpen ? `${idx * 75}ms` : '0ms' }}
            >
              {link.name}
              <ArrowRight
                size={20}
                className="-translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </Link>
          ))}
          <div
            className={`mt-4 border-t border-brand-border/50 pt-4 transition-all delay-300 duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-xl bg-brand-dark py-5 text-lg font-bold text-white shadow-lg transition-transform active:scale-95"
            >
              Contact <MessageSquare size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      <div
        className={`fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  );
});

export default Navbar;
