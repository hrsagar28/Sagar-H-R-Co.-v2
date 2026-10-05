// Pages rebuilt in the 2026 redesign. They render inside RedesignLayout (its own
// top bar, sticky bar, phone menu and footer) instead of the site-wide Navbar
// and Footer. Add a path here as each page moves over.
export const REDESIGNED_ROUTES = [
  '/services',
  '/insights',
  '/careers',
  '/faqs',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
];

// Every page under these paths is redesigned too. ServiceDetail and
// InsightDetail show the redesigned NotFound for an unknown slug.
const REDESIGNED_PREFIXES = ['/services/', '/insights/'];

// Pages still in the old design. Remove a path here when it moves to
// REDESIGNED_ROUTES. An address that is in neither list has no page, and its
// "not found" screen (pages/NotFound.tsx) is redesigned.
const OLD_ROUTES = ['/', '/about', '/resources'];
const OLD_PREFIXES = ['/resources/checklist/'];

const clean = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

const matches = (path: string, routes: string[], prefixes: string[]) =>
  routes.includes(path) || prefixes.some((prefix) => path.startsWith(prefix));

export const isRedesignedRoute = (pathname: string): boolean => {
  const path = clean(pathname);
  return matches(path, REDESIGNED_ROUTES, REDESIGNED_PREFIXES) || !matches(path, OLD_ROUTES, OLD_PREFIXES);
};

// Redesigned pages whose header is light: only the top bar stays dark and the
// title sits on the limestone page. Plain documents read better this way than
// under a dark band. RedesignLayout marks these routes with `.head-light`, so
// their loading skeleton is light too. A page can also turn its own header
// light by carrying `.head-light` itself, as NotFound does (it shows on any
// address, including /services/<unknown>).
export const LIGHT_HEADER_ROUTES = ['/privacy', '/terms', '/disclaimer'];
// The Insights articles are documents too.
const LIGHT_HEADER_PREFIXES = ['/insights/'];

export const hasLightHeader = (pathname: string): boolean =>
  matches(clean(pathname), LIGHT_HEADER_ROUTES, LIGHT_HEADER_PREFIXES);
