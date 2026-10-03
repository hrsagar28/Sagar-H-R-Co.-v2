// Pages rebuilt in the 2026 redesign. They render inside RedesignLayout (its own
// top bar, sticky bar, phone menu and footer) instead of the site-wide Navbar
// and Footer. Add a path here as each page moves over.
export const REDESIGNED_ROUTES = ['/services', '/careers', '/faqs', '/contact', '/privacy', '/terms', '/disclaimer'];

// Every page under these paths is redesigned too. ServiceDetail renders its own
// "not found" page for an unknown slug, so the old NotFound never lands inside
// the new layout.
const REDESIGNED_PREFIXES = ['/services/'];

export const isRedesignedRoute = (pathname: string): boolean => {
  const path = pathname.replace(/\/+$/, '') || '/';
  return REDESIGNED_ROUTES.includes(path) || REDESIGNED_PREFIXES.some((prefix) => path.startsWith(prefix));
};
