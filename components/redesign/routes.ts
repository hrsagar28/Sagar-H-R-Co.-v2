// Pages rebuilt in the 2026 redesign. They render inside RedesignLayout (its own
// top bar, sticky bar, phone menu and footer) instead of the site-wide Navbar
// and Footer. Add a path here as each page moves over.
export const REDESIGNED_ROUTES = ['/services', '/careers', '/faqs', '/contact', '/privacy', '/terms', '/disclaimer'];

// Every page under these paths is redesigned too. ServiceDetail renders its own
// "not found" page for an unknown slug, so the old NotFound never lands inside
// the new layout.
const REDESIGNED_PREFIXES = ['/services/'];

// Pages still in the old design. Any address that is neither these nor a
// redesigned page has no page at all, and its "not found" screen is redesigned.
const OLD_ROUTES = ['/', '/about', '/insights', '/resources'];
const OLD_PREFIXES = ['/insights/', '/resources/checklist/'];

const clean = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

const isUnknownRoute = (path: string): boolean =>
  !OLD_ROUTES.includes(path) &&
  !OLD_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
  !REDESIGNED_ROUTES.includes(path) &&
  !REDESIGNED_PREFIXES.some((prefix) => path.startsWith(prefix));

export const isRedesignedRoute = (pathname: string): boolean => {
  const path = clean(pathname);
  return (
    REDESIGNED_ROUTES.includes(path) ||
    REDESIGNED_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    isUnknownRoute(path)
  );
};

// Redesigned pages whose header is light: only the top bar stays dark and the
// title sits on the limestone page. Plain documents read better this way than
// under a dark band. RedesignLayout marks these routes with `.head-light`.
export const LIGHT_HEADER_ROUTES = ['/privacy', '/terms', '/disclaimer'];

export const hasLightHeader = (pathname: string): boolean =>
  LIGHT_HEADER_ROUTES.includes(clean(pathname)) || isUnknownRoute(clean(pathname));
