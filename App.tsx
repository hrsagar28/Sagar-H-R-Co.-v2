
import React, { useEffect, useLayoutEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Navbar, Footer, CustomCursor, SmoothScroll, Preloader, WhatsAppWidget, 
  PageLoader, ToastContainer, NetworkStatus, RouteErrorBoundary, TopProgressBar,
  ServiceDetailSkeleton, InsightDetailSkeleton, ContactSkeleton, FAQSkeleton, ResourcesSkeleton
} from './components';
import { ToastProvider } from './context/ToastContext';
import { AnnounceProvider } from './context/AnnounceContext';
import { useAnnounce } from './hooks';

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
  const { announce } = useAnnounce();
  
  useLayoutEffect(() => {
    // Force instant scroll to top on route change, ignoring smooth scroll preferences
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    // Focus management for accessibility
    // Focus the main content wrapper to announce page change to screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [pathname]);

  // Accessibility Announcement for Route Change
  useEffect(() => {
    let pageName = 'Home';
    if (pathname !== '/') {
      // Improve page name extraction
      const parts = pathname.substring(1).split('/');
      
      // Handle known routes
      if (pathname.startsWith('/services/')) {
        pageName = `Service: ${parts[1].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`;
      } else if (pathname.startsWith('/insights/')) {
        pageName = `Insight Article`;
      } else if (pathname.startsWith('/resources/checklist/')) {
        pageName = `Checklist Resource`;
      } else {
        // Generic fallback: Capitalize words
        pageName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (pageName === 'Faqs') pageName = 'FAQ';
      }
    }
    
    announce(`Navigated to ${pageName}`);
  }, [pathname, announce]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <AnnounceProvider>
      <ToastProvider>
        <HashRouter>
          <TopProgressBar />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-preloader focus:px-6 focus:py-3 focus:bg-brand-moss focus:text-white focus:font-bold focus:rounded-full focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white print:hidden">
            Skip to content
          </a>
          <RouteHandler />
          <div className="print:hidden">
            <NetworkStatus />
            <Preloader />
            <CustomCursor />
          </div>
          
          {/* Fixed Elements must be OUTSIDE the SmoothScroll wrapper to avoid transform context issues */}
          <div className="fixed top-0 left-0 w-full z-fixed pointer-events-none print:hidden">
            <Navbar className="animate-content-reveal delay-2000 pointer-events-auto" />
          </div>

          <div className="print:hidden">
            <WhatsAppWidget />
            <ToastContainer />
          </div>

          {/* Global Background Noise */}
          <div className="fixed inset-0 bg-noise opacity-[0.4] pointer-events-none z-0 mix-blend-multiply print:hidden" />

          <SmoothScroll>
            {/* Added overflow-x-hidden to prevent horizontal scroll on mobile */}
            <div className="animate-content-reveal delay-2000 relative z-base flex flex-col min-h-screen bg-brand-bg w-full overflow-x-hidden print:bg-white">
              <main id="main-content" className="flex-grow relative z-base w-full" tabIndex={-1}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
                    <Route path="/about" element={<RouteErrorBoundary><About /></RouteErrorBoundary>} />
                    <Route path="/services" element={<RouteErrorBoundary><Services /></RouteErrorBoundary>} />
                    <Route path="/services/:slug" element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<ServiceDetailSkeleton />}>
                          <ServiceDetail />
                        </Suspense>
                      </RouteErrorBoundary>
                    } />
                    <Route path="/insights" element={<RouteErrorBoundary><Insights /></RouteErrorBoundary>} />
                    <Route path="/insights/:slug" element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<InsightDetailSkeleton />}>
                          <InsightDetail />
                        </Suspense>
                      </RouteErrorBoundary>
                    } />
                    <Route path="/faqs" element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<FAQSkeleton />}>
                          <FAQ />
                        </Suspense>
                      </RouteErrorBoundary>
                    } />
                    <Route path="/resources" element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<ResourcesSkeleton />}>
                          <Resources />
                        </Suspense>
                      </RouteErrorBoundary>
                    } />
                    <Route path="/resources/checklist/:slug" element={<RouteErrorBoundary><ChecklistDetail /></RouteErrorBoundary>} />
                    <Route path="/careers" element={<RouteErrorBoundary><Careers /></RouteErrorBoundary>} />
                    <Route path="/contact" element={
                      <RouteErrorBoundary>
                        <Suspense fallback={<ContactSkeleton />}>
                          <Contact />
                        </Suspense>
                      </RouteErrorBoundary>
                    } />
                    <Route path="/disclaimer" element={<RouteErrorBoundary><Disclaimer /></RouteErrorBoundary>} />
                    <Route path="/privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
                    <Route path="/terms" element={<RouteErrorBoundary><Terms /></RouteErrorBoundary>} />
                    <Route path="*" element={<RouteErrorBoundary><NotFound /></RouteErrorBoundary>} />
                  </Routes>
                </Suspense>
              </main>
              
              <div className="print:hidden">
                <Footer />
              </div>
            </div>
          </SmoothScroll>
        </HashRouter>
      </ToastProvider>
    </AnnounceProvider>
  );
};

export default App;