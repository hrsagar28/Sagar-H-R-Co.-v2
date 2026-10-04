import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RdHeader from './RdHeader';
import RdFooter from './RdFooter';
import { hasLightHeader } from './routes';
import './redesign.css';

/**
 * Layout for the pages rebuilt in the 2026 redesign (see ./routes.ts). It
 * replaces the site-wide Navbar and Footer on those routes, keeping the top
 * bar and footer outside <main> so they stay banner / contentinfo landmarks
 * and the skip link still skips them.
 *
 * App.tsx loads this lazily so the redesign's stylesheet and fonts are only
 * fetched by the pages that use them.
 */
const RedesignLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mirrors the slim bar's visibility so sticky headings inside the page
  // can drop below it (`.rd.bar-on` in redesign.css).
  const [barOn, setBarOn] = useState(false);
  const { pathname } = useLocation();
  const lightHeader = hasLightHeader(pathname);

  // RouteHandler focuses #main-content one frame after a route change. On the
  // first visit to a redesigned page this lazy layout may not have arrived by
  // then, so pick that focus up here instead of leaving it on <body>.
  useEffect(() => {
    if (!document.activeElement || document.activeElement === document.body) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div className={`rd rd-shell ${barOn ? 'bar-on' : ''} ${lightHeader ? 'head-light' : ''}`}>
      <RdHeader barOn={barOn} onBarChange={setBarOn} />
      {/* Own stacking context: the global :focus-visible rule lifts the
          focused <main> to z-index 999, which would otherwise cover the top bar. */}
      <div className="rd-main">{children}</div>
      <RdFooter />
    </div>
  );
};

export default RedesignLayout;
