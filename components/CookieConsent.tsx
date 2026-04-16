import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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
    if ((window as any).gtag) return; // Already loaded

    const id = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;
    if (!id) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', id);
    (window as any).gtag = gtag;
  };

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setIsVisible(false);
    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1200] p-4 md:p-6 print:hidden animate-fade-in-up">
      <div className="max-w-7xl mx-auto bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-moss opacity-5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-1">
          <h4 className="text-brand-dark font-heading font-bold text-lg mb-2">We value your privacy</h4>
          <p className="text-brand-stone text-sm font-medium leading-relaxed max-w-3xl">
            We use Google Analytics to understand how our website is being used to improve our services. By clicking "Accept All", you consent to our use of these tracking cookies. Declining will disable this tracking. 
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handleDecline}
            className="px-6 py-3 rounded-xl border border-brand-border text-brand-dark font-bold hover:bg-brand-bg transition-colors text-sm"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="px-6 py-3 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-moss transition-colors shadow-lg shadow-brand-dark/10 text-sm"
          >
            Accept All
          </button>
          
          <button 
            onClick={handleDecline}
            className="absolute top-4 right-4 text-brand-stone hover:text-brand-dark md:hidden"
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
