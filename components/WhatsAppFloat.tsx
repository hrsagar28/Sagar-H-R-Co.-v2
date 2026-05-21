import React from 'react';
import { CONTACT_INFO } from '../constants';
import { useScrollPosition } from '../hooks/useScrollPosition';

const WhatsAppFloat: React.FC = () => {
  'use memo';
  const { direction } = useScrollPosition();
  // Audit W-01: derived state, not a setState-in-effect. Previously this
  // component held an `isVisible` useState that mirrored `direction !==
  // 'down'` via a useEffect — the textbook anti-pattern that disables the
  // React Compiler on this file. Computing the value directly each render
  // is cheaper and lets the Compiler memoize the surrounding scope.
  //
  // Audit W-02: instead of translating the pill off-screen on scroll-down
  // (high-intent moment for a user actively reading), we just fade to 60%
  // opacity. The affordance stays present and tappable; users mid-scroll
  // can still grab it without scrolling back up.
  const isDeprioritised = direction === 'down';

  return (
    <a
      href={CONTACT_INFO.social.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in new window)"
      // Safari on iOS has a dynamic bottom URL bar and a home-indicator
      // inset on notched devices. env(safe-area-inset-*) offsets the pill
      // above both; unsupported browsers get 0 + the regular inset.
      // Audit MA-10: transition was `transition-opacity`, so the hover
      // scale never animated (transform was not a transitioned property)
      // and snapped instantly. Now transitions opacity, transform and
      // box-shadow together, with an active:scale-95 press affordance.
      className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] right-[calc(env(safe-area-inset-right,0px)+1.5rem)] z-fixed flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-[opacity,transform,box-shadow] duration-300 ease-out hover:scale-110 hover:opacity-100 hover:shadow-2xl active:scale-95 motion-reduce:hover:scale-100 md:bottom-[calc(env(safe-area-inset-bottom,0px)+2.5rem)] md:right-[calc(env(safe-area-inset-right,0px)+2.5rem)] md:h-16 md:w-16 ${isDeprioritised ? 'opacity-60' : 'opacity-100'} `}
    >
      {/*
        Audit W-03: aria-hidden so screen readers don't re-announce
        "image" / SVG noise after the parent <a>'s aria-label already
        spelled out the action. focusable=false keeps it out of the
        IE/Edge legacy tab order.
      */}
      <svg
        aria-hidden="true"
        focusable={false}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8 md:h-9 md:w-9"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
};

export default WhatsAppFloat;
