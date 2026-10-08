import type { Config } from 'tailwindcss';

// Tailwind styles only the app shell and the shared pieces: the files in
// `content`. The pages are styled by components/redesign/redesign.css, which
// is plain CSS and never purged. A Tailwind class used in a file that is not
// listed here is dropped silently, so list the file before using one.
export default {
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
  theme: {
    extend: {
      zIndex: {
        base: '1',
        // The first-visit splash (components/Preloader.tsx).
        preloader: '1000',
        // Above everything, including the shared pieces in index.css.
        cursor: '9700',
      },
      fontFamily: {
        // The document's default face (Tailwind's base styles put it on <html>).
        // The pages set their own in redesign.css; this is what hidden text
        // such as "Loading" renders in, so it is the face the pages already load.
        sans: ['"Host Grotesk"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        // The firm's name on the first-visit splash.
        serif: ['"Instrument Serif"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      // Both animations are the splash's: its name and tagline rise in, and a
      // rule is drawn under the name.
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'expand-width': 'expandWidth 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        expandWidth: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
