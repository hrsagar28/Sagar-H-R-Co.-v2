// Audit CQ-09 — vestigial. The barrel now lives at `constants/index.ts`
// so the repo root no longer carries both `constants.tsx` (file) and
// `constants/` (directory) under the same name.
//
// Kept as a thin re-export so existing imports continue to resolve
// through one rebase cycle. **Safe to delete** once tooling is happy;
// `from '../constants'` falls back to `constants/index.ts` automatically.
export * from './constants/index';
