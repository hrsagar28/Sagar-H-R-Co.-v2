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
    // Audit H-02: previous implementation polled the DOM every 100 ms looking
    // for the literal hero words ("Audit.", "Taxation.", "Advisory.") as
    // text content, which broke silently any time the hero copy changed.
    // Now `<Home />` dispatches `app:hero-ready` after its first paint, and
    // we remove the preload overlay on the next frame. A 5 s safety timer
    // covers the case where the event never fires (crash before first
    // paint, navigating away mid-mount, etc.).
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      window.removeEventListener('app:hero-ready', remove);
      window.clearTimeout(safetyTimer);
      window.requestAnimationFrame(() => preloadHero.remove());
    };
    const safetyTimer = window.setTimeout(remove, 5000);
    window.addEventListener('app:hero-ready', remove, { once: true });
  }
}
