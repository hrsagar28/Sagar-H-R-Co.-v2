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
export * from './insights';
export * from './faq';
export * from './resources';
export * from './contact';
