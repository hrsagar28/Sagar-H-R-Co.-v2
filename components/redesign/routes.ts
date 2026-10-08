// Which header a page opens with. Every page renders inside RedesignLayout: its
// own top bar, sticky bar, phone menu and footer. An address that has no page
// shows NotFound in the same layout.

const clean = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

const matches = (path: string, routes: string[], prefixes: string[]) =>
  routes.includes(path) || prefixes.some((prefix) => path.startsWith(prefix));

// Pages whose header is light: only the top bar stays dark and the title sits
// on the limestone page. Plain documents read better this way than under a
// dark band. RedesignLayout marks these routes with `.head-light`, so their
// loading skeleton is light too. A page can also turn its own header light by
// carrying `.head-light` itself, as NotFound does (it shows on any address,
// including /services/<unknown>).
export const LIGHT_HEADER_ROUTES = ['/privacy', '/terms', '/disclaimer'];
// The Insights articles are documents too.
const LIGHT_HEADER_PREFIXES = ['/insights/'];

export const hasLightHeader = (pathname: string): boolean =>
  matches(clean(pathname), LIGHT_HEADER_ROUTES, LIGHT_HEADER_PREFIXES);

/**
 * The home page opens on the limestone with no dark strip at all, and its
 * title is the firm's name, so the top bar there drops the wordmark.
 * RedesignLayout marks it with `.head-home`.
 */
export const isHomeRoute = (pathname: string): boolean => clean(pathname) === '/';

/** Where the old /about address now leads: the section on the home page. */
export const ABOUT_PATH = '/#about';
