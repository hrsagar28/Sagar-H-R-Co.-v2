import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { startCursorEarly } from './components/cursors/early';
import './index.css';

// Disable browser scroll restoration so React Router's useLayoutEffect
// controls scroll position on every navigation, including direct URL loads.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Ensure the page always starts at top on initial load
window.scrollTo(0, 0);

startCursorEarly();

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

// Whether the first-visit splash (components/Preloader.tsx) is about to
// show: the same two conditions it checks for itself.
const splashDue = () => {
  try {
    return (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches && sessionStorage.getItem('preloader_done') !== '1'
    );
  } catch {
    return false;
  }
};

// The first-paint overlay in index.html. It starts in the splash's black so
// the splash arrives without a flash. Once the splash is up (it holds for a
// second and a half), or straight away when none is due, the overlay turns to
// the page's limestone on the home page and goes altogether on the others,
// so the curtain never lifts onto black.
const preloadHero = document.getElementById('preload-hero');
if (preloadHero) {
  const home = window.location.pathname === '/';
  const settle = () => {
    if (home) preloadHero.classList.add('page');
    else preloadHero.remove();
  };
  if (splashDue()) window.setTimeout(settle, 400);
  else settle();

  if (home) {
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
