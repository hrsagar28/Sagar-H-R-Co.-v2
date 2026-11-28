// Audit NOV-05: this barrel carries every FAQ, every service page and the
// year's due dates. A file that needs only the firm's details imports
// CONTACT_INFO from '../config/contact' instead; if a file of the first
// screen (App.tsx, the splash, the layout) imports from here, all of that
// content joins the first download. eslint.config.js enforces this for the
// shell files.
// Constants barrel. Audit CQ-09: previously this barrel lived at
// `constants.tsx` in the repo root, alongside the `constants/` directory
// it pointed at. Moved here so the root contains directory-level units
// only. Node / TypeScript / Vite all resolve `from '../constants'` to
// either `../constants.ts(x)` or `../constants/index.ts`, so callers
// don't need to change.
export * from './services';
export * from './servicesSchema';
export * from './faq';
export * from './resources';
// MNT-5: point straight at the source of truth (was a one-line re-export in
// constants/contact.ts, now deleted).
export * from '../config/contact';
// MNT-7: previously omitted from the barrel despite living in this directory.
export * from './careers';
