import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RdHeader from './RdHeader';
import RdFooter from './RdFooter';
import { hasLightHeader, isHomeRoute } from './routes';
import './redesign.css';

/**
 * Layout for every page: the top bar, the sticky bar, the phone menu and the
 * footer, kept outside <main> so they stay banner / contentinfo landmarks and
 * the skip link still skips them. ./routes.ts says which header a page has.
 *
 * App.tsx loads this lazily, so the stylesheet arrives in its own file.
 */
const RedesignLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mirrors the slim bar's visibility so sticky headings inside the page
  // can drop below it (`.rd.bar-on` in redesign.css).
  const [barOn, setBarOn] = useState(false);
  const { pathname } = useLocation();
  const head = isHomeRoute(pathname) ? 'head-home' : hasLightHeader(pathname) ? 'head-light' : '';

  // RouteHandler focuses #main-content one frame after a route change. On the
  // first visit to a redesigned page this lazy layout may not have arrived by
  // then, so pick that focus up here instead of leaving it on <body>.
  useEffect(() => {
    if (!document.activeElement || document.activeElement === document.body) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div className={`rd rd-shell ${barOn ? 'bar-on' : ''} ${head}`}>
      <RdHeader barOn={barOn} onBarChange={setBarOn} />
      {/* Own stacking context: the global :focus-visible rule lifts the
          focused <main> to z-index 999, which would otherwise cover the top bar. */}
      <div className="rd-main">{children}</div>
      <RdFooter />
    </div>
  );
};

export default RedesignLayout;
