// MNT-5: single home for the Vite base-URL lookup. Previously the
// `(import.meta as any)?.env?.BASE_URL || '/'` cast was copy-pasted across
// several data hooks. `import.meta.env.BASE_URL` is Vite's configured base
// path (defaults to '/'), used to prefix fetches to files in /public.
export const getBaseUrl = (): string => (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
