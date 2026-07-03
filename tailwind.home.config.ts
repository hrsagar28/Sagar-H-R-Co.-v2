import type { Config } from 'tailwindcss';
import baseConfig from './tailwind.config';

export default {
  ...baseConfig,
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './pages/Home.tsx',
    './components/Navbar.tsx',
    './components/Footer.tsx',
    './components/Preloader.tsx',
    './components/PageLoader.tsx',
    './components/TopProgressBar.tsx',
    './components/NetworkStatus.tsx',
    './components/WhatsAppFloat.tsx',
    './components/CookieConsent.tsx',
    './components/Toast.tsx',
    './components/ToastContainer.tsx',
    // MNT-9: LiveRegion renders globally (via AnnounceProvider) but was unscanned;
    // it only survived by coincidence (its lone `sr-only` class is used elsewhere).
    './components/LiveRegion.tsx',
    './components/ErrorBoundary.tsx',
    './components/RouteErrorBoundary.tsx',
    './components/Reveal.tsx',
    './components/HorizontalScroll.tsx',
    // MNT-9: IndustrySpotlight is never rendered on the home route — removed from
    // the home content list (it's still scanned by the routes config for Services).
    './components/Marquee.tsx',
    './components/SEO.tsx',
    './components/VisuallyHidden.tsx',
    './components/CustomCursor.tsx',
    './components/home/**/*.{ts,tsx}',
    './components/ui/AccentTitle.tsx',
    './components/ui/BigCTA.tsx',
    './components/ui/Grain.tsx',
    './components/skeletons/**/*.{ts,tsx}',
  ],
} satisfies Config;
