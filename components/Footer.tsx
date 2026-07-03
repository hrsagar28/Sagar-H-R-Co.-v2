import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowUp } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { toRomanNumeral } from '../utils/toRomanNumeral';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Footer: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const scrollToTop = () => {
    // UX-6: honour prefers-reduced-motion (Contact.tsx already does this).
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer className="bg-brand-bg pt-20">
      {/* Main Footer Container */}
      <div className="relative overflow-hidden rounded-t-[3rem] bg-[#0f0f0f] text-white">
        {/* Navigation Grid */}
        <div className="relative z-10 px-6 py-20 md:px-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-8">
            {/* Column 1: Address & Brand */}
            <div className="space-y-8 md:col-span-4 lg:col-span-5">
              <Link to="/" className="group inline-block">
                <div className="font-heading text-3xl font-bold">Sagar H R & Co.</div>
              </Link>
              <address className="max-w-sm text-lg font-medium not-italic leading-relaxed text-zinc-400">
                {CONTACT_INFO.address.street},<br />
                {CONTACT_INFO.address.city} - {CONTACT_INFO.address.zip}
                <br />
                {CONTACT_INFO.address.state}, {CONTACT_INFO.address.country}
              </address>
              <div className="flex gap-4">
                <a
                  href={CONTACT_INFO.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-brand-dark"
                  aria-label="LinkedIn Profile (opens in new window)"
                >
                  <Share2 size={20} />
                </a>
              </div>
            </div>

            {/* Columns 2 & 3: Explore + Resources — side-by-side on mobile, back into 12-col grid on md+ */}
            <div className="grid grid-cols-2 gap-8 md:contents">
              {/* Column 2: Explore (Main Pages) */}
              <div className="md:col-span-2 lg:col-span-2">
                <h3 className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-400">Explore</h3>
                <ul className="space-y-4">
                  {[
                    { name: 'Home', path: '/' },
                    { name: 'About Firm', path: '/about' },
                    { name: 'Services', path: '/services' },
                    { name: 'Insights', path: '/insights' },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="group inline-flex items-center gap-2 text-lg font-medium text-zinc-300 transition-colors hover:text-brand-brass"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Resources */}
              <div className="md:col-span-3 lg:col-span-2">
                <h3 className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-400">Resources</h3>
                <ul className="space-y-4">
                  {[
                    { name: 'Client Resources', path: '/resources' },
                    { name: 'FAQs', path: '/faqs' },
                    { name: 'Careers', path: '/careers' },
                    { name: 'Contact Us', path: '/contact' },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="group inline-flex items-center gap-2 text-lg font-medium text-zinc-300 transition-colors hover:text-brand-brass"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 4: Quick Contact */}
            <div className="md:col-span-3 lg:col-span-3">
              <h3 className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-400">Contact</h3>
              <ul className="space-y-6">
                <li>
                  <span className="mb-1 block text-sm text-zinc-400">Email</span>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="font-heading text-xl font-bold text-white transition-colors hover:text-brand-brass"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </li>
                <li>
                  <span className="mb-1 block text-sm text-zinc-400">Phone</span>
                  <a
                    href={`tel:${CONTACT_INFO.phone.value}`}
                    className="font-heading text-xl font-bold text-white transition-colors hover:text-brand-brass"
                  >
                    {CONTACT_INFO.phone.display}
                  </a>
                </li>
                <li>
                  <span className="mb-1 block text-sm text-zinc-400">Office Hours</span>
                  <p className="text-lg font-medium text-zinc-300">{CONTACT_INFO.hours.display}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal */}
        <div className="relative z-10 px-6 pb-10 md:px-20">
          <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-zinc-300 md:justify-start">
              <div className="mr-4 flex flex-col gap-1 text-zinc-300">
                <span>
                  &copy;{' '}
                  {new Date().getFullYear() === 2023
                    ? 'MMXXIII'
                    : `MMXXIII–${toRomanNumeral(new Date().getFullYear())}`}{' '}
                  · Sagar H R & Co.
                </span>
              </div>
              {/* UX-6: hover now lightens to white for a visible state (was
                  hover:text-zinc-300 on a zinc-300 parent — a no-op). */}
              <Link to="/privacy" className="transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-white">
                Terms of Service
              </Link>
              <Link to="/disclaimer" className="transition-colors hover:text-white">
                Disclaimer
              </Link>
              <a
                href="https://portal.casagar.co.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Staff Portal (opens in new window)"
                className="transition-colors hover:text-white"
              >
                Staff Portal
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:text-brand-brass"
            >
              Back to Top
              <ArrowUp size={16} className="transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>

        {/* Large Watermark Text — A11Y-5: decorative, hidden from assistive tech. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full select-none overflow-hidden leading-none opacity-[0.03]"
        >
          {/* Mobile View: Stacked */}
          <div className="flex w-full flex-col items-center justify-end pb-10 md:hidden">
            <span className="block text-center font-heading text-[18vw] font-bold tracking-tighter">SAGAR H R</span>
            <span className="-mt-[2vw] block text-center font-heading text-[18vw] font-bold tracking-tighter">
              & CO.
            </span>
          </div>
          {/* Desktop View: Single Line */}
          <span className="-ml-10 hidden whitespace-nowrap font-heading text-[15vw] font-bold tracking-tighter text-white md:block">
            SAGAR H R & CO.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
