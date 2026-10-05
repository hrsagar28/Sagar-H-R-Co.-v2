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
    './components/PageLoader.tsx',
    './components/TopProgressBar.tsx',
    './components/NetworkStatus.tsx',
    './components/Toast.tsx',
    './components/ToastContainer.tsx',
    // MNT-9: LiveRegion renders globally (via AnnounceProvider) but was unscanned;
    // it only survived by coincidence (its lone `sr-only` class is used elsewhere).
    './components/LiveRegion.tsx',
    './components/ErrorBoundary.tsx',
    './components/RouteErrorBoundary.tsx',
    './components/Reveal.tsx',
    './components/HorizontalScroll.tsx',
    './components/Marquee.tsx',
    './components/SEO.tsx',
    './components/VisuallyHidden.tsx',
    './components/CustomCursor.tsx',
    './components/cursors/*.tsx',
    './components/home/**/*.{ts,tsx}',
    './components/ui/AccentTitle.tsx',
    './components/ui/BigCTA.tsx',
    './components/ui/Grain.tsx',
    './components/skeletons/**/*.{ts,tsx}',
  ],
} satisfies Config;
