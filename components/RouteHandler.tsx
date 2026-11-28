import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useAnnounce } from '../hooks';

// On every route change: the scroll position (top for a new page, the saved
// position on back and forward, Audit UX-01), focus on #main-content, and the
// screen-reader announcement. Focus and the announcement wait until the
// visitor has gone from one page to another (Audit NOV-07).

/** What the live region says after a route change: "Navigated to …". */
export const routeAnnouncement = (pathname: string): string => {
  let pageName = 'Home';
  if (pathname !== '/') {
    // Improve page name extraction
    const parts = pathname.substring(1).split('/');

    // Handle known routes
    if (pathname.startsWith('/services/')) {
      // "Service: GST", "Service: TDS and TCS", "Service: NRI taxation"
      const serviceSlug = parts[1] || '';
      const words = serviceSlug
        .split('-')
        .map((s) => (/^(gst|tds|tcs|nri|npos|llps)$/.test(s) ? s.toUpperCase() : s))
        .join(' ');
      pageName = `Service: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
    } else if (pathname.startsWith('/insights/')) {
      pageName = `Insight Article`;
    } else if (pathname.startsWith('/resources/checklist/')) {
      pageName = `Checklist`;
    } else if (pathname.startsWith('/resources/')) {
      pageName = (parts[1] || '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) || 'Resources';
    } else {
      // Generic fallback: Capitalize words
      const firstPart = parts[0] || '';
      pageName = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
      if (pageName === 'Faqs') pageName = 'FAQ';
    }
  }

  return `Navigated to ${pageName}`;
};

// Where each page was scrolled to, so that the back and forward buttons return
// there (index.tsx sets history.scrollRestoration to 'manual', which turns the
// browser's own restoration off).
const SCROLL_KEY = 'scroll:';

const readScroll = (pathname: string): number | null => {
  try {
    const raw = sessionStorage.getItem(`${SCROLL_KEY}${pathname}`);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
};

const RouteHandler = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const { announce } = useAnnounce();
  // Audit NOV-07: on arrival the keyboard starts at the top of the document,
  // so the skip link and the menu come first; moving focus into <main> then
  // put both behind the starting point. Focus moves to the page, and the
  // page is announced, only once the visitor has navigated within the site.
  // (Not `key === 'default'`: after a reload the browser hands back the
  // entry's earlier key. Refs also hold through StrictMode's second run.)
  const arrivalKey = useRef(key);
  const navigated = useRef(false);

  // Remember the position as the visitor scrolls.
  useEffect(() => {
    const save = () => {
      // Right after a navigation the browser may clamp the scroll position to
      // the new, shorter page before this listener is removed; that event
      // belongs to the new page, not this one.
      if (window.location.pathname !== pathname) return;
      try {
        sessionStorage.setItem(`${SCROLL_KEY}${pathname}`, String(Math.round(window.scrollY)));
      } catch {
        // Storage blocked: the back button then lands at the top, as before.
      }
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [pathname]);

  useEffect(() => {
    let rafId = 0;
    const stored = navigationType === 'POP' ? readScroll(pathname) : null;
    if (key !== arrivalKey.current) navigated.current = true;
    const arrival = !navigated.current;

    if (stored === null) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      if (arrival) return;

      rafId = window.requestAnimationFrame(() => {
        document.getElementById('main-content')?.focus({ preventScroll: true });
      });

      return () => window.cancelAnimationFrame(rafId);
    }

    // Back or forward: the page is lazy-loaded, so wait until it is tall
    // enough to hold the old position (at most about a second), then restore.
    let tries = 0;
    const restore = () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      if (maxY >= stored || tries > 60) {
        window.scrollTo({ top: stored, left: 0, behavior: 'instant' });
        if (!arrival) document.getElementById('main-content')?.focus({ preventScroll: true });
        return;
      }
      tries += 1;
      rafId = window.requestAnimationFrame(restore);
    };
    rafId = window.requestAnimationFrame(restore);

    return () => window.cancelAnimationFrame(rafId);
    // `key` is read, not listed: a move within one page (/#about) changes it,
    // and Home.tsx places those itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, navigationType]);

  // Accessibility Announcement for Route Change. Not on arrival: the screen
  // reader reads the page's title then, and "Navigated to …" would be noise.
  // (The effect above runs first and has already noted a navigation.)
  useEffect(() => {
    if (!navigated.current) return;
    announce(routeAnnouncement(pathname));
  }, [pathname, announce]);

  return null;
};

export default RouteHandler;
