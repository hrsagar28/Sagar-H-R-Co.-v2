// Audit CQ-09 — vestigial. The real type definitions now live in
// `types/index.ts` (alongside `types/react-augmentation.d.ts`), so the
// repo root no longer has both a file and a directory with the same name.
//
// This stub stays only so that any old git stashes / IDE state with
// imports already resolved against `types.ts` keep working through one
// extra rename cycle. **Safe to delete once everything is rebased.**
// When deleted, `from '../types'` resolves to `types/index.ts` instead.
export * from './types/index';
