import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
import WhatsAppWidget from './components/WhatsAppWidget';
import PageLoader from './components/PageLoader';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Insights = lazy(() => import('./pages/Insights'));
const InsightDetail = lazy(() => import('./pages/InsightDetail'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Resources = lazy(() => import('./pages/Resources'));
const ChecklistDetail = lazy(() => import('./pages/ChecklistDetail'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteHandler = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Focus management for accessibility
    // Focus the main content wrapper to announce page change to screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [pathname]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-preloader focus:px-6 focus:py-3 focus:bg-brand-moss focus:text-white focus:font-bold focus:rounded-full focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white print:hidden">
        Skip to content
      </a>
      <RouteHandler />
      <div className="print:hidden">
        <Preloader />
        <CustomCursor />
      </div>
      
      {/* Fixed Elements must be OUTSIDE the SmoothScroll wrapper to avoid transform context issues */}
      <div className="fixed top-0 left-0 w-full z-fixed pointer-events-none print:hidden">
        <Navbar className="animate-content-reveal delay-2000 pointer-events-auto" />
      </div>

      <div className="print:hidden">
        <WhatsAppWidget />
      </div>

      {/* Global Background Noise */}
      <div className="fixed inset-0 bg-noise opacity-[0.4] pointer-events-none z-0 mix-blend-multiply print:hidden" />

      <SmoothScroll>
        {/* Added overflow-x-hidden to prevent horizontal scroll on mobile */}
        <div className="animate-content-reveal delay-2000 relative z-base flex flex-col min-h-screen bg-brand-bg w-full overflow-x-hidden print:bg-white">
          <main id="main-content" className="flex-grow relative z-base w-full" tabIndex={-1}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/:slug" element={<InsightDetail />} />
                <Route path="/faqs" element={<FAQ />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/checklist/:slug" element={<ChecklistDetail />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          
          <div className="print:hidden">
            <Footer />
          </div>
        </div>
      </SmoothScroll>
    </HashRouter>
  );
};

export default App;