import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
import WhatsAppWidget from './components/WhatsAppWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Insights from './pages/Insights';
import InsightDetail from './pages/InsightDetail';
import FAQ from './pages/FAQ';
import Resources from './pages/Resources';
import ChecklistDetail from './pages/ChecklistDetail';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Disclaimer from './pages/Disclaimer';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-brand-moss focus:text-white focus:font-bold focus:rounded-full focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white">
        Skip to content
      </a>
      <ScrollToTop />
      <Preloader />
      <CustomCursor />
      
      {/* Fixed Elements must be OUTSIDE the SmoothScroll wrapper to avoid transform context issues */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        <Navbar className="animate-content-reveal delay-2000 pointer-events-auto" />
      </div>

      <WhatsAppWidget />

      {/* Global Background Noise */}
      <div className="fixed inset-0 bg-noise opacity-[0.4] pointer-events-none z-[1] mix-blend-multiply" />

      <SmoothScroll>
        <div className="animate-content-reveal delay-2000 relative z-10 flex flex-col min-h-screen bg-brand-bg">
          <main id="main-content" className="flex-grow relative z-10" tabIndex={-1}>
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
          </main>
          
          <Footer />
        </div>
      </SmoothScroll>
    </HashRouter>
  );
};

export default App;