import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, CONTACT_INFO } from '../constants';
import { Menu, X, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { useFocusTrap, useReturnFocus, useScrollPosition } from '../hooks';

/**
 * Total wall-clock time the mobile menu stagger reveal is allowed to use,
 * irrespective of how many links there are. Audit N-04: previously each
 * link's `transitionDelay` was a hard-coded `idx * 75ms`, which meant 6
 * links → 375 ms before the last one appeared. That felt sluggish on
 * mid-tier phones. Capping the cumulative delay at this value keeps the
 * reveal snappy without losing the cascade feel.
 */
const MOBILE_MENU_STAGGER_TOTAL_MS = 200;

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  'use memo';
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /** Whether we're currently sitting on the home route. Drives the
   *  `aria-current` / `aria-label` swap on the logo link (audit N-02)
   *  so screen readers don't read "Home, current page" alongside the
   *  visible "Sagar H R & Co." text every load. */
  const isHomeRoute = location.pathname === '/';

  // Filter out the Contact entry from the mobile menu link list once,
  // not on every render. The result also feeds the stagger delay
  // calculation so each link's delay scales to MOBILE_MENU_STAGGER_TOTAL_MS.
  const mobileMenuLinks = NAV_LINKS.filter((link) => link.name !== 'Contact');
  const mobileStaggerStep =
    mobileMenuLinks.length > 1 ? MOBILE_MENU_STAGGER_TOTAL_MS / (mobileMenuLinks.length - 1) : 0;

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

  // Body scroll lock. Audit CQ-06: this effect mutates `document.body.style`
  // — a global DOM property React doesn't track — and the React Compiler's
  // purity rule flags it. The escape hatch is intentional: locking the
  // page scroll while the mobile menu sheet is open is the only sensible
  // way to keep the underlying content from rubber-banding on iOS while
  // the user pans inside the overlay. The cleanup branch unconditionally
  // resets `overflow` so the lock can never leak across unmounts.
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
    // A11Y-5: this is a positioning wrapper, not a landmark. Demoted from <nav>
    // to <div> so it no longer creates a second, unnamed navigation landmark
    // around the named "Primary Navigation" nav below.
    <div
      className={`pointer-events-none fixed left-0 top-4 z-fixed flex w-full justify-center px-2 md:top-6 md:px-4 ${className}`}
    >
      <div
        className={`pointer-events-auto relative flex items-center justify-between rounded-full px-2 py-2 transition-[max-width,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-3 md:py-3 ${
          scrolled ? 'glass-strong w-full max-w-6xl' : 'glass w-full max-w-7xl'
        } `}
      >
        {/* Logo - Left Pill. Audit N-02: on the home route, drop the
            duplicate `aria-label="Sagar H R & Co. Home"` and switch to
            `aria-current="page"` so screen readers don't double-announce
            ("Sagar H R & Co., Home, current page"). On any other route
            we still want the explicit "Home" hint because clicking the
            logo navigates back to /. */}
        <Link
          to="/"
          className="group flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-brand-border/30 bg-brand-surface/50 px-3 py-2 shadow-none transition-colors hover:border-brand-moss/30 md:gap-3 md:border md:bg-brand-surface md:px-5 md:shadow-sm"
          aria-current={isHomeRoute ? 'page' : undefined}
          aria-label={isHomeRoute ? undefined : 'Sagar H R & Co. Home'}
        >
          <span className="block whitespace-nowrap font-heading text-sm font-bold tracking-tight text-brand-dark md:text-lg">
            Sagar H R & Co.
          </span>
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
              className={`group relative flex min-h-[44px] items-center overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 ${
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
          {/*
            Desktop CTA — dark pill with moss-green icon badge.

            Audit N-03 deliberately declined: the audit suggested unifying
            this with the moss-toned CTA used in the hero / LocationStrip
            to reduce style proliferation. After review, the dark pill on
            this white-bg navbar is the only style that reads as a real
            primary action against the surrounding neutrals — a moss pill
            here would visually demote to "secondary" because the navbar
            background already sits in the warm-neutral family. Each of
            the three home-page Contact CTAs (this one, the hero, the
            LocationStrip footer) is locally optimal for its background
            context, so the on-paper inconsistency is a deliberate
            trade-off for click-conversion.
          */}
          <Link
            to="/contact"
            className="group hidden min-h-[44px] items-center gap-3 rounded-full bg-brand-dark py-1.5 pl-6 pr-1.5 text-sm font-bold text-brand-inverse shadow-lg shadow-brand-dark/10 transition-[background-color,box-shadow] duration-300 hover:bg-brand-dark/90 hover:ring-4 hover:ring-brand-border/20 md:flex"
            aria-label="Contact Us"
          >
            <span className="pl-1 transition-transform duration-300 group-hover:translate-x-0.5">Contact</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-moss text-white transition-[transform,background-color,color] duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-dark">
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
          // A11Y-5: only present as a modal dialog while actually open; when
          // closed it's inert and makes no dialog/modal claim.
          role={isOpen ? 'dialog' : undefined}
          aria-modal={isOpen ? true : undefined}
          aria-label="Mobile Navigation"
          inert={!isOpen}
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
          className={`absolute right-0 top-full mt-4 flex max-h-[calc(100dvh-8rem)] w-[calc(100vw-32px)] origin-top-right flex-col gap-2 overflow-y-auto overscroll-contain rounded-[2rem] border border-brand-border/60 bg-brand-surface/95 p-6 shadow-2xl backdrop-blur-2xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] md:w-80 ${isOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'pointer-events-none invisible -translate-y-4 scale-95 opacity-0'} `}
        >
          {mobileMenuLinks.map((link, idx) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={location.pathname === link.path ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
              // Staggered reveal animation logic integrated into styling.
              // Audit N-04: previous `idx * 75ms` ran to 375 ms on six
              // links. `mobileStaggerStep` distributes the same cascade
              // across MOBILE_MENU_STAGGER_TOTAL_MS (200 ms) so the last
              // link lands much sooner on slow phones.
              className={`group flex min-h-[60px] items-center justify-between rounded-xl px-4 py-4 font-heading text-xl font-bold text-brand-dark transition-[transform,opacity,background-color,color] duration-500 ease-out hover:bg-brand-bg hover:text-brand-moss ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} `}
              style={{ transitionDelay: isOpen ? `${idx * mobileStaggerStep}ms` : '0ms' }}
            >
              {link.name}
              <ArrowRight
                size={20}
                className="-translate-x-2 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </Link>
          ))}
          <div
            className={`mt-4 border-t border-brand-border/50 pt-4 transition-[transform,opacity] delay-300 duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
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
    </div>
  );
};

export default Navbar;
