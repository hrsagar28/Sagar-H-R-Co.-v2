import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Preloader,
  PageLoader,
  ToastContainer,
  NetworkStatus,
  RouteErrorBoundary,
  TopProgressBar,
  ServiceDetailSkeleton,
  InsightDetailSkeleton,
  ContactSkeleton,
  FAQSkeleton,
  ResourcesSkeleton,
  WhatsAppFloat,
  CookieConsent,
} from './components';
import { ToastProvider } from './context/ToastContext';
import { AnnounceProvider } from './context/AnnounceContext';
import { useAnnounce } from './hooks';
import { Grain } from './components/ui/Grain';

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
const CustomCursor = lazy(() => import('./components/CustomCursor'));

const RouteHandler = () => {
  const { pathname } = useLocation();
  const { announce } = useAnnounce();

  useEffect(() => {
    let rafId = 0;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    rafId = window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  // Accessibility Announcement for Route Change
  useEffect(() => {
    let pageName = 'Home';
    if (pathname !== '/') {
      // Improve page name extraction
      const parts = pathname.substring(1).split('/');

      // Handle known routes
      if (pathname.startsWith('/services/')) {
        const serviceSlug = parts[1] || '';
        pageName = `Service: ${serviceSlug
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')}`;
      } else if (pathname.startsWith('/insights/')) {
        pageName = `Insight Article`;
      } else if (pathname.startsWith('/resources/checklist/')) {
        pageName = `Checklist Resource`;
      } else {
        // Generic fallback: Capitalize words
        const firstPart = parts[0] || '';
        pageName = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
        if (pageName === 'Faqs') pageName = 'FAQ';
      }
    }

    announce(`Navigated to ${pageName}`);
  }, [pathname, announce]);

  return null;
};

const MainContent = () => {
  const { pathname } = useLocation();
  const mainZone = pathname === '/about' ? 'editorial' : undefined;
  const loaderTone = pathname === '/' ? 'ink' : 'paper';

  return (
    <main
      id="main-content"
      data-zone={mainZone}
      className={`relative z-base w-full flex-grow ${mainZone ? 'zone-bg zone-text' : ''}`}
      tabIndex={-1}
    >
      <Suspense fallback={<PageLoader tone={loaderTone} />}>
        <Routes>
          <Route
            path="/"
            element={
              <RouteErrorBoundary>
                <Home />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/about"
            element={
              <RouteErrorBoundary>
                <About />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/services"
            element={
              <RouteErrorBoundary>
                <Services />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<ServiceDetailSkeleton />}>
                  <ServiceDetail />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/insights"
            element={
              <RouteErrorBoundary>
                <Insights />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/insights/:slug"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<InsightDetailSkeleton />}>
                  <InsightDetail />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/faqs"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<FAQSkeleton />}>
                  <FAQ />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/resources"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<ResourcesSkeleton />}>
                  <Resources />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/resources/checklist/:slug"
            element={
              <RouteErrorBoundary>
                <ChecklistDetail />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/careers"
            element={
              <RouteErrorBoundary>
                <Careers />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/contact"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<ContactSkeleton />}>
                  <Contact />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/disclaimer"
            element={
              <RouteErrorBoundary>
                <Disclaimer />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/privacy"
            element={
              <RouteErrorBoundary>
                <Privacy />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="/terms"
            element={
              <RouteErrorBoundary>
                <Terms />
              </RouteErrorBoundary>
            }
          />
          <Route
            path="*"
            element={
              <RouteErrorBoundary>
                <NotFound />
              </RouteErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </main>
  );
};

const App: React.FC = () => {
  const [showCursor, setShowCursor] = React.useState(false);

  useEffect(() => {
    // Render custom cursor only after first paint
    const timer = setTimeout(() => setShowCursor(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnnounceProvider>
      <ToastProvider>
        <BrowserRouter>
          <TopProgressBar />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-preloader focus:rounded-full focus:bg-brand-moss focus:px-6 focus:py-3 focus:font-bold focus:text-white focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white print:hidden"
          >
            Skip to content
          </a>
          <RouteHandler />
          <div className="print:hidden">
            <NetworkStatus />
            <Preloader />
            <Suspense fallback={null}>{showCursor && <CustomCursor />}</Suspense>
            <WhatsAppFloat />
            <CookieConsent />
          </div>

          {/* Fixed Elements */}
          <div className="pointer-events-none fixed left-0 top-0 z-fixed w-full print:hidden">
            <Navbar className="animate-fade-in-up delay-200" />
          </div>

          <div className="print:hidden">
            <ToastContainer />
          </div>

          {/* Global Background Noise */}
          <div className="bg-noise pointer-events-none fixed inset-0 z-0 opacity-[0.4] mix-blend-multiply print:hidden" />
          <Grain opacity={0.05} />

          {/* Main Layout */}
          <div className="relative z-base flex min-h-screen w-full flex-col bg-brand-bg print:bg-white">
            <MainContent />

            <div className="print:hidden">
              <Footer />
            </div>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AnnounceProvider>
  );
};

export default App;
