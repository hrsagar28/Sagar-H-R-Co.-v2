# Home page — Round 3 review + React 19 completion

This pass covers two things:

1. **React 19 migration — completed the remaining work.** Prompts 5–7 of `REACT-19-CODEX-PROMPTS.md` were the outstanding ones. Prompt 5 (drop `React.memo`) was already done by Codex. Prompt 6 (React Compiler) is now implemented in this turn. Prompt 7 (verification) was run as a static pass — results below.
2. **Round 3 home-page audit** — what round 2 fixed, what's still outstanding, what's newly visible, and one regression Codex introduced.

> ⚠️ **Environment note — OneDrive "Files On-Demand".** A large number of files in this repo are currently **cloud-only placeholders** that have not been downloaded to local disk, so they are unreadable/uneditable from this environment. Confirmed dehydrated: `index.css`, `tsconfig.json`, `types/react-augmentation.d.ts`, `vite-env.d.ts`, `vitest.d.ts`, `constants.tsx`, `config/site.ts`, `package-lock.json`, `.prettierrc.json`, `.lintstagedrc.json`, `netlify/functions/csp-report.ts`, `utils/jsonLd.ts`, `components/VisuallyHidden.tsx`, and ~25 more. **Nothing is corrupt** — they just need hydrating. Fix: in File Explorer, right-click the project folder → **"Always keep on this device"**, let OneDrive sync, then everything is readable again. Anything below that I could not edit directly because of this is marked **[CLOUD-ONLY]** with a paste-ready snippet.

---

## Part 1 — React 19 migration: completion status

### Done by Codex (prompts 1–5), verified this pass

| Item                                                                                 | Status                                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react` / `react-dom`                                                                | `^19.2.6` ✓                                                                                                                                                            |
| `@types/react` / `@types/react-dom`                                                  | `^19.2.14` / `^19.2.3` ✓                                                                                                                                               |
| `react-router-dom`                                                                   | `^7.15.0` ✓                                                                                                                                                            |
| `@testing-library/react`                                                             | `^16.3.2` ✓                                                                                                                                                            |
| `@testing-library/jest-dom`                                                          | `^6.9.1` ✓                                                                                                                                                             |
| `lucide-react`                                                                       | `^1.14.0` ✓                                                                                                                                                            |
| `forwardRef` usages                                                                  | **zero** — all migrated to ref-as-prop ✓                                                                                                                               |
| `React.memo` usages                                                                  | **zero** — `Navbar`, `Marquee` unwrapped ✓                                                                                                                             |
| `ReactDOM.render`                                                                    | not used — `createRoot` in `index.tsx` ✓                                                                                                                               |
| `defaultProps` / `propTypes` / string refs / `useFormState` / `react-dom/test-utils` | **none found** ✓                                                                                                                                                       |
| `SEO.tsx`                                                                            | rewritten to native React 19 document metadata (`<title>`, `<meta>`, `<link>`, JSON-LD `<script>` rendered as JSX; no more `document.head` mutation, no `useEffect`) ✓ |
| `inert` attribute in `HorizontalScroll`                                              | uses the clean boolean form `inert={true}` ✓                                                                                                                           |

### Done in this turn — Prompt 6, React Compiler

- **`package.json`** — added `"babel-plugin-react-compiler": "^1.0.0"` to `devDependencies`.
- **`vite.config.ts`** — wired the compiler into `@vitejs/plugin-react`'s Babel plugins, in **`compilationMode: 'annotation'`** (opt-in per file — un-annotated files are untouched, so the rollout is safe and incremental).
- **`'use memo'` directives** added to the home-page component tree (13 components across 10 files): `Home`, `LazyHomeSection`, `Navbar`, `Marquee`, `HorizontalScroll`, `ChaosToOrder`, `FAQPreview`, `FAQPreviewItem`, `StarField`, `FounderSection`, `LocationStrip`, `TrustBar`.
- **`components/Marquee.tsx`** — fixed a real anti-pattern while I was in there: `ItemGroup` was a component **defined inside** `Marquee`, so its type was recreated every render (remounting the whole marquee track). Hoisted it to a module-scope `MarqueeItems` component with explicit props. This also makes the file compiler-friendly.

> **You must run `npm install` before the next build** — `babel-plugin-react-compiler` is referenced in `vite.config.ts` but not yet in `node_modules`. If `npm install` fails to resolve `^1.0.0`, run `npm install -D babel-plugin-react-compiler@latest` and let it set the version. Until then the dev/build will error with "Cannot find package 'babel-plugin-react-compiler'".

### Prompt 7 — verification, what could NOT be checked here

I can't run `npm run build` / `npm test` / `lighthouse` in this environment, and `tsconfig.json` is cloud-only so I couldn't read the compiler options. **You still need to run, locally:**

```
npm install
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Watch for: (a) the React Compiler logging each annotated file as compiled in the Vite build output; (b) any `[react-compiler]` "bailout" warnings — a bailout means that file has a Rules-of-React violation worth fixing; (c) TS errors from the augmentation file (see R3-04 below).

---

## Part 2 — Round 3 home-page audit

### What round 2 fixed cleanly (verified)

`TrustBar` no longer hides itself until hover and has a real `sr-only` `<h2>` landmark. `Reveal` now transitions only `transform, opacity`, manages `will-change`, and adds `minHeight: 1lh` for `reveal-mask`. `FounderSection` indentation is fixed. `StarField` static counts dropped to 60/90 + 14/20 and the DPR cap holds. The bottom decorative `Marquee` section was removed entirely. `brand-brass-light` / `brand-brass-soft` / `brand-paper-mint` tokens are in `tailwind.config.ts` and used. The `inert` workaround was cleaned up to a real boolean.

### Regressions & bugs (priority order)

#### R3-01 — `HorizontalScroll` height class order is backwards (regression)

`components/HorizontalScroll.tsx` line ~259:

```tsx
<div className={`${isDisabled ? '' : 'sticky top-0 h-[100dvh] h-[100vh]'} flex flex-col overflow-hidden`}>
```

Both classes set `height`. Tailwind emits them in source order, so **`h-[100vh]` wins** because it comes last — which defeats the whole point of the dvh fix. The comment directly above even says _"Using `h-[100vh] h-[100dvh]`"_ — the comment is right, the code is wrong. Order must be `h-[100vh] h-[100dvh]` so the modern `dvh` value is the one that applies and `vh` is only the fallback.

**Fix (next turn):** swap to `'sticky top-0 h-[100vh] h-[100dvh]'`.

#### R3-02 — `chaos-drift` keyframes appear to be missing **[CLOUD-ONLY]**

`components/home/ChaosToOrder.tsx` conditionally applies the class `chaos-drift` to hint the divider can be dragged. I could not find a `@keyframes chaos-drift` / `.chaos-drift` rule anywhere readable, and `tailwind.config.ts` does not define it. The most likely place is `index.css` — which is **cloud-only and unreadable here**, so I can't confirm. If it's missing, the idle-drift affordance is silently dead (the divider just sits at 50% until interacted with).

**Action:** hydrate `index.css` and search it for `chaos-drift`. If absent, add:

```css
@property --divider {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 50%;
}

@keyframes chaos-drift {
  0%,
  100% {
    --divider: 51.2%;
  }
  50% {
    --divider: 48.8%;
  }
}

.chaos-drift {
  animation: chaos-drift 7s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .chaos-drift {
    animation: none;
  }
}
```

#### R3-03 — Hero status-pill dot shadow is still dead (round-2 New-3 not actually fixed)

`pages/Home.tsx` line ~170:

```tsx
<div className="h-2 w-2 animate-pulse rounded-full bg-brand-accent shadow-[0_0_12px_var(--color-brand-accent)]"></div>
```

`--color-brand-accent` is **not defined anywhere** — Tailwind 3 does not expose theme colours as CSS custom properties, and nothing in `tailwind.config.ts` or (readable) CSS declares it. So the `box-shadow` resolves to nothing and the "Mysuru" pill dot has no glow.

**Fix (next turn):** use a build-time-resolved value —
`shadow-[0_0_12px_theme(colors.brand.accent)]` (preferred), or hard-code `shadow-[0_0_12px_#4ADE80]`.

#### R3-04 — `types/react-augmentation.d.ts` is now redundant and may break `tsc` **[CLOUD-ONLY]**

The file declares:

```ts
declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }
  interface ImgHTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}
```

Both `inert` and `fetchPriority` are **native in `@types/react@19`**. A duplicate ambient augmentation is at best dead code and at worst triggers `TS2717: Subsequent property declarations must have the same type` if React 19's declared type differs even slightly (React 19 types `inert` as `boolean | undefined`; `fetchPriority` casing matches). It's cloud-only so I couldn't delete it.

**Action:** once hydrated, delete the file (and remove any `include` reference to it in `tsconfig.json`), or empty it to `export {};`. Then `npx tsc --noEmit` to confirm nothing depended on it.

#### R3-05 — ESLint has all React Compiler rules switched off

`eslint.config.js` disables `react-hooks/set-state-in-effect`, `react-hooks/static-components`, `react-hooks/immutability`, `react-hooks/refs`, and `react-hooks/purity`. These ship in `eslint-plugin-react-hooks@7` and are exactly the rules that catch the Rules-of-React violations that make the React Compiler **bail out of a file**. With the compiler now enabled, flying blind on these is counter-productive.

**Action (not now — it will surface an unknown number of warnings):** turn them from `'off'` to `'warn'`, run `npm run lint`, and work through what surfaces. Do this as its own focused pass, not bundled with anything else.

### Round 2 items still outstanding

#### R3-06 — Hero marquee still duplicates the services list (round-2 Outstanding-3, partial)

Round 2 deleted the bottom decorative `Marquee` (good — one duplication gone). But the **hero pill marquee still uses `SERVICES.map((service) => service.title)`**, so the nine service titles still appear twice on the page: once scrolling in the hero pill, once as full cards in the rail. `constants/marquee.ts` was never created.

**Fix (next turn):** give the hero marquee finer-grained phrases that complement rather than mirror the rail — e.g. `Notice replies`, `Faceless assessments`, `GST returns`, `TDS / TCS`, `ROC filings`, `CMA reports`, `15CB / 15CA`. Put them in `constants/marquee.ts`.

#### R3-07 — No quick-contact path above the fold (round-2 Outstanding-4, not done)

The hero is still full-viewport with no phone/email visible without scrolling. On mobile the WhatsApp float is the only fast contact route. The round-2 doc has the exact JSX for a discreet phone/email/hours row to drop into the hero — still worth doing.

### New in round 3

#### R3-08 — `ChaosToOrder` sets `--divider` in two places, one of them dead

`CHAOS_STYLE_VARS` (applied to the outer `<section>`) includes `'--divider': '50%'`, and the inner panel `<div>` _also_ has `style={{ '--divider': '50%' }}`. Only the inner one matters — `writeDivider` mutates it via `containerRef`, and the clip-path / divider line / handle all read the inner div's variable. The `--divider` entry in `CHAOS_STYLE_VARS` is dead weight.

**Fix (next turn):** remove `'--divider': '50%'` from the `CHAOS_STYLE_VARS` object; keep it only on the panel `<div>`.

#### R3-09 — `Home.test.tsx` `useInsights` mock is still loosely typed (round-2 New-4 not done)

The `mockInsights` array is inline object literals, not typed against the real `Insight` type. If `Insight` gains a required field the home page reads, the mock keeps compiling and the test crashes at runtime instead of failing at compile. Type it with `satisfies Insight` (or `Insight[]`). Also: with `@testing-library/react@16` the test still uses an inline `beforeAll` mock setup — fine, but consider extracting the `IntersectionObserver` / `ResizeObserver` / `matchMedia` / canvas mocks into a shared `vitest.setup.ts` referenced from `vite.config.ts`'s `test.setupFiles`, since the React 19 components lean on those observers more heavily now.

#### R3-10 — Compiler annotation coverage could extend to shared home components

I annotated the 10 home-section components. Not yet annotated but used heavily on the home page and safe to add `'use memo'` to once you've confirmed the build is green: `Reveal` / `WordReveal` (`components/Reveal.tsx`), `BigCTA` (`components/ui/BigCTA.tsx`), `AccentTitle` (`components/ui/AccentTitle.tsx`). Do this only **after** the first compiled build passes — that way if something does go wrong you know it's in the first batch, not the second.

#### R3-11 — `recentInsights` mounts both the mobile and desktop trees

`pages/Home.tsx` renders the recent-insights list twice — a `md:hidden` mobile list and a `hidden md:grid` desktop grid — each mapping the same 3 insights, each item wrapped in its own `Reveal` (so 6 `Reveal` instances, 6 `IntersectionObserver`s, for 3 articles). Only one tree is ever visible. This is a pre-existing pattern, not a regression, and the cost is small — noting it for completeness. If you touch this section, render the list once and let CSS handle the layout difference, or gate with a `matchMedia` so only one tree mounts.

---

## Suggested order for the next turn (round-3 fixes)

Fast, mechanical, zero-risk first: **R3-01** (class order), **R3-03** (dot shadow), **R3-08** (dead `--divider`). Then **R3-02** + **R3-04** once `index.css` and `types/react-augmentation.d.ts` are hydrated. Then the round-2 carry-overs **R3-06** (hero marquee) and **R3-07** (quick-contact bar). Leave **R3-05** (ESLint compiler rules) and **R3-10** (extend annotations) for their own dedicated passes after the first compiled build is confirmed green.

Before any of that: **hydrate the OneDrive files** and run `npm install` so the React Compiler dependency resolves.
