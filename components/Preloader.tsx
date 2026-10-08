import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks';
import { CONTACT_INFO } from '../constants';

/**
 * The first-visit splash: the firm's name on black, a rule drawn under it and
 * the tagline, held for a moment and then lifted away like a curtain. Shown
 * once per browser tab, and not at all to readers who ask for less motion.
 *
 * Kept at the owner's request. It was removed once, in October 2026, and he
 * asked for it back as it was, with one change he chose: the typefaces are
 * the redesign's (Instrument Serif, its italic for "Sagar", and Host Grotesk
 * for the tagline) in place of Fraunces and Plus Jakarta Sans. Do not remove,
 * shorten or restyle it without asking him. It is why the italic font, the
 * `serif` face, the `expand-width` animation and `z-preloader` are in the
 * project.
 */
/** Whether this browser tab has already had its splash. */
const alreadyShown = () => {
  try {
    return sessionStorage.getItem('preloader_done') === '1';
  } catch {
    return false;
  }
};

const markShown = () => {
  try {
    sessionStorage.setItem('preloader_done', '1');
  } catch {
    // Storage is unavailable; the splash will show again on the next load.
  }
};

const Preloader: React.FC = () => {
  const [animateOut, setAnimateOut] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  // The animated splash runs on every first load in a tab, whatever the page
  // (on the owner's direction; it once skipped the home page). Two guards:
  //   - readers who ask for less motion skip the curtain (transition sickness)
  //   - sessionStorage gates it to once per browser tab, so a reload or a
  //     second page loaded in the same tab does not show it again.
  // Both are settled before the first paint, so a visit that gets no splash
  // never sees a frame of black.
  const [hidden, setHidden] = useState(() => shouldReduceMotion || alreadyShown());

  useEffect(() => {
    if (hidden) return;

    // Sequence:
    // 0s: Mount (Black screen)
    // 1.5s: Start lifting curtain (Reduced for snappier UX)
    // 2.0s: Remove from DOM
    const timer = setTimeout(() => {
      setAnimateOut(true);
    }, 1500);

    const cleanup = setTimeout(() => {
      setHidden(true);
      markShown();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
      markShown();
    };
  }, [hidden]);

  if (hidden || shouldReduceMotion) return null;

  return (
    <div
      className={`fixed inset-0 z-preloader flex items-center justify-center bg-[#0a0a0a] transition-transform duration-[800ms] ease-[cubic-bezier(0.83,0,0.17,1)] will-change-transform ${animateOut ? '-translate-y-full' : 'translate-y-0'}`}
      role="presentation"
      // A11Y-5: the splash is purely decorative; hide it from assistive tech so
      // its wordmark doesn't surface a transient second <h1> alongside the page's.
      aria-hidden="true"
    >
      <div
        className={`flex flex-col items-center justify-center transition-opacity duration-500 ${animateOut ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Title - Using the new Serif font for editorial elegance. A11Y-5: a
            <div>, not an <h1>, so it never competes with the routed page's h1. */}
        <div className="mb-8 flex animate-fade-in-up items-baseline gap-4 font-serif text-5xl tracking-tight text-white md:text-7xl lg:text-8xl">
          <span className="font-medium italic">Sagar</span>
          <span className="font-normal">H R & Co.</span>
        </div>

        <div className="mb-6 h-[1px] w-24 origin-left scale-x-0 animate-expand-width rounded-full bg-white/30"></div>

        {/* font-medium: Host Grotesk's heaviest weight on this site (it was
            font-bold in Plus Jakarta Sans). */}
        <p
          className="animate-fade-in-up font-sans text-xs font-medium uppercase tracking-[0.4em] text-white/70 md:text-sm"
          style={{ animationDelay: '0.3s' }}
        >
          {CONTACT_INFO.tagline}
        </p>
      </div>
    </div>
  );
};

export default Preloader;
