import type { Config } from 'tailwindcss';
import baseConfig from './tailwind.config';

// The one Tailwind config in use: index.css activates it with
// `@config './tailwind.home.config.ts'`. It spreads the base config and
// narrows `content` to the few files outside the redesign that still use
// Tailwind classes (the app shell and the shared pieces). The pages
// themselves are styled by components/redesign/redesign.css, which is plain
// CSS and never purged.
export default {
  ...baseConfig,
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/PageLoader.tsx',
    './components/Preloader.tsx',
    './components/TopProgressBar.tsx',
    './components/NetworkStatus.tsx',
    './components/Toast.tsx',
    './components/ToastContainer.tsx',
    // MNT-9: LiveRegion renders globally (via AnnounceProvider) but was unscanned;
    // it only survived by coincidence (its lone `sr-only` class is used elsewhere).
    './components/LiveRegion.tsx',
    './components/ErrorBoundary.tsx',
    './components/RouteErrorBoundary.tsx',
    './components/SEO.tsx',
    './components/CustomCursor.tsx',
  ],
} satisfies Config;
