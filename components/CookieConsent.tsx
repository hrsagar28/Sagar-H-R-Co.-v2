import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, useReturnFocus } from '../hooks';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local storage for consent on mount
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small timeout to allow initial animations to complete before showing
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else if (consent === 'granted') {
      loadGoogleAnalytics();
    }
  }, []);

  const loadGoogleAnalytics = () => {
    if (window.gtag) return; // Already loaded

    const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!id) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtag: Gtag = (...args) => {
      window.dataLayer?.push(args);
    };
    gtag('js', new Date());
    gtag('config', id);
    window.gtag = gtag;
  };

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    window.dispatchEvent(
      new CustomEvent('cookie-consent-change', { detail: { key: 'cookie_consent', value: 'granted' } }),
    );
    setIsVisible(false);
    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    window.dispatchEvent(
      new CustomEvent('cookie-consent-change', { detail: { key: 'cookie_consent', value: 'declined' } }),
    );
    setIsVisible(false);
  };

  useReturnFocus(isVisible);
  useFocusTrap(isVisible, dialogRef, handleDecline);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleDecline();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1200] animate-fade-in-up p-4 md:p-6 print:hidden">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-title"
        aria-describedby="cc-desc"
        className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-2xl md:flex-row"
      >
        {/* Subtle Decorative Elements */}
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-moss opacity-5 blur-3xl"></div>

        <div className="flex-1">
          <h2 id="cc-title" className="mb-2 font-heading text-lg font-bold text-brand-dark">
            We value your privacy
          </h2>
          <p id="cc-desc" className="max-w-3xl text-sm font-medium leading-relaxed text-brand-stone">
            We use Google Analytics to understand how our website is being used to improve our services. By clicking
            "Accept All", you consent to our use of these tracking cookies. Declining will disable this tracking.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleDecline}
            className="rounded-xl border border-brand-border px-6 py-3 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-bg"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-brand-dark px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-dark/10 transition-colors hover:bg-brand-brass"
          >
            Accept All
          </button>

          <button
            onClick={handleDecline}
            className="absolute right-4 top-4 rounded-md text-brand-stone opacity-70 hover:text-brand-dark hover:opacity-100 focus-visible:text-brand-dark focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 md:hidden"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
