import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

/**
 * Append the Google Tag Manager script and bootstrap `gtag` / `dataLayer`.
 *
 * Lifted to module scope so it isn't recreated on every render. The check
 * for `window.gtag` makes it idempotent — calling twice is harmless. No-ops
 * when `VITE_GA_MEASUREMENT_ID` isn't configured (dev / preview builds).
 */
const loadGoogleAnalytics = () => {
  if (typeof window === 'undefined' || window.gtag) return;

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

const CookieConsent: React.FC = () => {
  'use memo';
  const [isVisible, setIsVisible] = useState(false);

  // Audit K-01: handlers are declared BEFORE the hooks that consume them.
  // Previously `useFocusTrap(isVisible, dialogRef, handleDecline)` was
  // called above `const handleDecline = ...`, which works at runtime
  // (functions hoist closures) but the React Compiler flagged it as
  // "cannot access variable before declared" and bailed out of compiling
  // the whole component. Wrapping in useCallback gives stable references.
  const handleAccept = useCallback(() => {
    localStorage.setItem('cookie_consent', 'granted');
    setIsVisible(false);
    // Audit K-02: load analytics BEFORE dispatching the change event so
    // any listener that reads `window.gtag` synchronously gets a defined
    // reference. The script itself is async, but the global hook is set
    // up before the event fires either way.
    loadGoogleAnalytics();
    window.dispatchEvent(
      new CustomEvent('cookie-consent-change', { detail: { key: 'cookie_consent', value: 'granted' } }),
    );
  }, []);

  const handleDecline = useCallback(() => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
    window.dispatchEvent(
      new CustomEvent('cookie-consent-change', { detail: { key: 'cookie_consent', value: 'declined' } }),
    );
  }, []);

  useEffect(() => {
    // Check local storage for consent on mount
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const showBanner = () => setIsVisible(true);
      const idleWindow = window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (idleWindow.requestIdleCallback) {
        const idleId = idleWindow.requestIdleCallback(showBanner, { timeout: 250 });
        return () => idleWindow.cancelIdleCallback?.(idleId);
      }

      const timer = setTimeout(showBanner, 250);
      return () => clearTimeout(timer);
    } else if (consent === 'granted') {
      loadGoogleAnalytics();
    }
  }, []);

  // A11Y-3: the banner is a NON-modal notice — the rest of the page stays
  // usable — so we no longer trap focus or grab it on mount (which yanked
  // keyboard/SR users off the skip link). Escape still dismisses it as a
  // convenience while it is visible.
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleDecline();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleDecline]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-consent animate-fade-in-up p-3 md:p-6 print:hidden">
      {/* A11Y-3: a labelled region, not a modal dialog — the page behind it is
          still fully operable, so aria-modal/role=dialog would misrepresent it. */}
      <div
        role="region"
        aria-labelledby="cc-title"
        aria-describedby="cc-desc"
        className="relative mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-4 shadow-2xl md:flex-row md:items-center md:gap-6 md:rounded-2xl md:p-6"
      >
        {/* Subtle Decorative Elements — audit K-03: aria-hidden + role
            "presentation" so it never appears in the AT tree. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-moss opacity-5 blur-3xl"
        ></div>

        <div className="flex-1">
          <h2 id="cc-title" className="mb-2 font-heading text-lg font-bold text-brand-dark">
            We value your privacy
          </h2>
          {/* Audit K-04: the mobile "Details" toggle expanded the paragraph
              but didn't reveal new information — the line clamp was the
              only thing it removed. Replaced with a real "Privacy Policy"
              link that takes the user to the actual policy. */}
          <p id="cc-desc" className="max-w-3xl text-sm font-medium leading-relaxed text-brand-stone">
            <span className="line-clamp-2 md:line-clamp-none">
              We use Google Analytics to understand how our website is being used to improve our services. By clicking
              "Accept All", you consent to our use of these tracking cookies. Declining will disable this tracking.
            </span>
            <Link
              to="/privacy"
              className="ml-1 inline-block font-bold text-brand-dark underline underline-offset-2 hover:text-brand-moss"
            >
              Privacy policy
            </Link>
          </p>
          {/* A11Y-3: on mobile the action buttons now follow the consent text
              they act on (DOM + reading order), not precede it. */}
          <div className="mt-3 flex shrink-0 items-center gap-2 md:hidden">
            <button
              onClick={handleDecline}
              className="flex-1 rounded-xl border border-brand-border px-4 py-3 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-bg"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 rounded-xl bg-brand-dark px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-dark/10 transition-colors hover:bg-brand-brass"
            >
              Accept All
            </button>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
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
        </div>

        <button
          onClick={handleDecline}
          className="absolute right-4 top-4 rounded-md text-brand-stone opacity-70 hover:text-brand-dark hover:opacity-100 focus-visible:text-brand-dark focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 md:hidden"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
