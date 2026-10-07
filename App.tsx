import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { PageLoader, ToastContainer, NetworkStatus, RouteErrorBoundary, TopProgressBar } from './components';
import { ToastProvider } from './context/ToastContext';
import { AnnounceProvider } from './context/AnnounceContext';
import { useAnnounce } from './hooks';
import { ABOUT_PATH } from './components/redesign/routes';
import RdPageSkeleton from './components/redesign/RdPageSkeleton';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Insights = lazy(() => import('./pages/Insights'));
const InsightDetail = lazy(() => import('./pages/InsightDetail'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Resources = lazy(() => import('./pages/Resources'));
const ChecklistDetail = lazy(() => import('./pages/ChecklistDetail'));
const ResourceTool = lazy(() => import('./pages/ResourceTool'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CustomCursor = lazy(() => import('./components/CustomCursor'));
// The header, sticky bar, menu and footer around every page. Lazy so its
// stylesheet arrives in a file of its own.
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
        pageName = `Checklist`;
      } else if (pathname.startsWith('/resources/')) {
        pageName = (parts[1] || '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) || 'Resources';
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

  return (
    <main id="main-content" className="relative z-base w-full flex-grow" tabIndex={-1}>
      {/* Each page has its own skeleton below; this one covers NotFound, which
          opens on the light header. */}
      <Suspense fallback={<PageLoader tone="paper" />}>
        {/* Audit MA-16: a short (~220ms) fade/lift on the routed view when
            the path changes, so navigation feels composed rather than an
            instant cut. Keyed by pathname so the `route-fade` animation
            re-triggers each navigation. The persistent chrome (top bar,
            footer, fixed elements) sits outside this wrapper and never
            animates. Reduced-motion users get an instant swap via the
            global prefers-reduced-motion override in index.css. */}
        <div key={pathname} className="route-fade">
          <Routes>
            <Route
              path="/"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Home />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            {/* The About page is now a section of the home page. netlify.toml
                redirects the old address; this covers a link followed inside
                the app. */}
            <Route path="/about" element={<Navigate to={ABOUT_PATH} replace />} />
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
                  <Suspense fallback={<RdPageSkeleton />}>
                    <Resources />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/resources/checklist/:slug"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <ChecklistDetail />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/resources/:tool"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<RdPageSkeleton />}>
                    <ResourceTool />
                  </Suspense>
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
 * Persistent chrome around the routed view: RedesignLayout brings the top
 * bar and the footer, and everything else here is shared. There is no floating
 * WhatsApp button; WhatsApp is offered on the Contact page and the home page.
 */
const SiteLayout = () => (
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

    <div className="print:hidden">
      <ToastContainer />
    </div>

    <Suspense fallback={<PageLoader tone="ink" />}>
      <RedesignLayout>
        <MainContent />
      </RedesignLayout>
    </Suspense>
  </>
);

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
