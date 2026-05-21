// Hooks barrel. Audit CQ-10: every entry below is a static `export *`,
// and a grep across hooks/*.ts for module-level `window.addEventListener`
// / `document.addEventListener` / `setTimeout` / `setInterval` /
// `requestIdleCallback` returned zero hits — all side effects live inside
// hook bodies and only run when a consumer actually calls them. Vite +
// Rollup tree-shake unused hooks out of the build by static analysis,
// so importing a single hook through `from '../hooks'` does not pull in
// the rest. If a future hook needs module-level state (e.g., a singleton
// observer pool like utils/sharedIntersectionObserver.ts), prefer
// putting it in `utils/` and re-exporting only the hook wrapper here, so
// this property continues to hold.
export * from './useAnnounce';
export * from './useFocusTrap';
export * from './useFormDraft';
export * from './useFormValidation';
export * from './useInView';
export * from './useLocalStorage';
export * from './useMediaQuery';
export * from './useRateLimit';
export * from './useReducedMotion';
export * from './useReturnFocus';
export * from './useToast';
export * from './useTaxConfig';
export * from './useInsights';
export * from './useArticleBody';
export * from './useScrollPosition';
export * from './useCountUp';
export * from './useConsent';
export * from './useSpotlight';
