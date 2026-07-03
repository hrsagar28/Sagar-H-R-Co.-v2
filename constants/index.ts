// Constants barrel. Audit CQ-09: previously this barrel lived at
// `constants.tsx` in the repo root, alongside the `constants/` directory
// it pointed at. Moved here so the root contains directory-level units
// only. Node / TypeScript / Vite all resolve `from '../constants'` to
// either `../constants.ts(x)` or `../constants/index.ts`, so callers
// don't need to change.
export * from './navigation';
export * from './services';
export * from './servicesSchema';
export * from './industries';
export * from './faq';
export * from './resources';
// MNT-5: point straight at the source of truth (was a one-line re-export in
// constants/contact.ts, now deleted).
export * from '../config/contact';
// MNT-7: previously omitted from the barrel despite living in this directory.
export * from './careers';
export * from './serviceHeroMeta';
export * from './taxConfig';
