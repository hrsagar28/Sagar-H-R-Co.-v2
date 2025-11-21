import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
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
      <SmoothScroll>
        <div className="relative bg-brand-bg min-h-screen flex flex-col">
          {/* Global Noise Overlay for texture */}
          <div className="fixed inset-0 bg-noise opacity-[0.4] pointer-events-none z-[1] mix-blend-multiply" />
          
          {/* Navbar - Moved outside the content wrapper to ensure fixed positioning works relative to viewport */}
          {/* We apply the same entrance animation so it rises with the content */}
          <Navbar className="animate-content-reveal delay-2000" />
          
          {/* Main Content Wrapper with Entrance Animation */}
          <div className="animate-content-reveal delay-2000 relative z-10 flex flex-col min-h-screen">
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
              </Routes>
            </main>
            
            <Footer />
          </div>
        </div>
      </SmoothScroll>
    </HashRouter>
  );
};

export default App;