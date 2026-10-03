// Pages rebuilt in the 2026 redesign. They render inside RedesignLayout (its own
// top bar, sticky bar, phone menu and footer) instead of the site-wide Navbar
// and Footer. Add a path here as each page moves over.
export const REDESIGNED_ROUTES = ['/faqs', '/contact', '/privacy', '/terms', '/disclaimer'];

export const isRedesignedRoute = (pathname: string): boolean =>
  REDESIGNED_ROUTES.includes(pathname.replace(/\/+$/, '') || '/');
