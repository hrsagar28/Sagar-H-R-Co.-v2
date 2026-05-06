import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Disable browser scroll restoration so React Router's useLayoutEffect
// controls scroll position on every navigation, including direct URL loads.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Ensure the page always starts at top on initial load
window.scrollTo(0, 0);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

const preloadHero = document.getElementById('preload-hero');
if (preloadHero) {
  if (window.location.pathname !== '/') {
    preloadHero.remove();
  } else {
    const startedAt = performance.now();
    const removeWhenHeroIsReady = () => {
      const heroWords = new Set(
        Array.from(rootElement.querySelectorAll('span')).map((element) => element.textContent?.trim()),
      );
      const heroReady = ['Audit.', 'Taxation.', 'Advisory.'].every((word) => heroWords.has(word));

      if (heroReady || performance.now() - startedAt > 5000) {
        window.requestAnimationFrame(() => preloadHero.remove());
        return;
      }

      window.setTimeout(removeWhenHeroIsReady, 100);
    };

    removeWhenHeroIsReady();
  }
}
