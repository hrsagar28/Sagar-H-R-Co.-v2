import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import {
  Navbar,
  Footer,
  PageLoader,
  ToastContainer,
  NetworkStatus,
  RouteErrorBoundary,
  TopProgressBar,
  ResourcesSkeleton,
} from './components';
import { ToastProvider } from './context/ToastContext';
import { AnnounceProvider } from './context/AnnounceContext';
import { useAnnounce } from './hooks';
import { Grain } from './components/ui/Grain';
import { isRedesignedRoute } from './components/redesign/routes';
import RdPageSkeleton from './components/redesign/RdPageSkeleton';

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
// 2026 redesign: header, sticky bar, menu and footer for the rebuilt pages.
// Lazy so its stylesheet and fonts stay out of every other page's bundle.
const RedesignLayout = lazy(() => import('./components/redesign/RedesignLayout'));

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
  // UX-2: /about renders in the dark editorial zone, so its loader must be the
  // dark ('ink') tone too — a 'paper' loader flashed light before the dark page.
  const loaderTone = pathname === '/' || pathname === '/about' ? 'ink' : 'paper';

  return (
    <main
      id="main-content"
      data-zone={mainZone}
      className={`relative z-base w-full flex-grow ${mainZone ? 'zone-bg zone-text' : ''}`}
      tabIndex={-1}
    >
      <Suspense fallback={<PageLoader tone={loaderTone} />}>
        {/* Audit MA-16: a short (~220ms) fade/lift on the routed view when
            the path changes, so navigation feels composed rather than an
            instant cut. Keyed by pathname so the `route-fade` animation
            re-triggers each navigation. The persistent chrome (Navbar,
            Footer, fixed elements) sits outside this wrapper and never
            animates. Reduced-motion users get an instant swap via the
            global prefers-reduced-motion override in index.css. */}
        <div key={pathname} className="route-fade">
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
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Services />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/services/:slug"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <ServiceDetail />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/insights"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Insights />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/insights/:slug"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <InsightDetail />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/faqs"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
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
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Careers />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/contact"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Contact />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/disclaimer"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Disclaimer />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/privacy"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Privacy />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/terms"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Terms />
                  </Suspense>
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
        </div>
      </Suspense>
    </main>
  );
};

/**
 * Persistent chrome around the routed view. The redesigned pages (see
 * components/redesign/routes.ts) bring their own top bar and footer, so the
 * floating Navbar, the noise overlay and the old Footer are left out there;
 * everything else is shared. There is no floating WhatsApp button; WhatsApp
 * is offered on the Contact page.
 */
const SiteLayout = () => {
  const { pathname } = useLocation();
  const redesigned = isRedesignedRoute(pathname);

  return (
    <>
      <div className="print:hidden">
        <NetworkStatus />
        {/* Audit CQ-12: CustomCursor is lazy-loaded via React.lazy at
            the top of this file, so its chunk fetch is already
            deferred to a separate request. The previous
            useState+useEffect+setTimeout(0) gate was derived state
            that delayed the React mount by a frame without changing
            what hit the network. Suspense + lazy do the same job
            without the rules-of-React noise. */}
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      </div>

      {/* Fixed Elements */}
      {!redesigned && (
        <div className="pointer-events-none fixed left-0 top-0 z-fixed w-full print:hidden">
          <Navbar className="animate-fade-in-up delay-200" />
        </div>
      )}

      <div className="print:hidden">
        <ToastContainer />
      </div>

      {redesigned ? (
        <Suspense fallback={<PageLoader tone="ink" />}>
          <RedesignLayout>
            <MainContent />
          </RedesignLayout>
        </Suspense>
      ) : (
        <>
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
        </>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AnnounceProvider>
      <ToastProvider>
        <BrowserRouter>
          <TopProgressBar />
          <a href="#main-content" className="sx-skip">
            Skip to content
          </a>
          <RouteHandler />
          <SiteLayout />
        </BrowserRouter>
      </ToastProvider>
    </AnnounceProvider>
  );
};

export default App;
