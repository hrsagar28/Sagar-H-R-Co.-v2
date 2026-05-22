/**
 * Warms the Contact route's lazy chunk so navigating from the About page
 * to /contact does not pay a chunk-fetch wait. Called on idle from
 * About.tsx and on hover / focus of the CTA from Cta.tsx.
 */
export const warmContactRoute = () => {
  void import('../Contact');
};
