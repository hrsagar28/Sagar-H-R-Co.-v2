# Audit Plan — `pages/About.tsx` (Round 3)

> Scope: Round-3 audit driven by **PageSpeed Insights** (mobile, Slow 4G, Moto G Power emulation, captured 27 Apr 2026). Round 1 plan = `AUDIT-ABOUT.md`, Round 2 plan = `AUDIT-ABOUT-R2.md`.
>
> Files re-reviewed:
> `index.html`, `pages/About.tsx`, `pages/about/{Snapshot,HowWeWork,Values,Principal,Office,Cta}.tsx`, `pages/about/schema.ts`, `pages/about/warmContact.ts` (new since R2),
> `components/{TopProgressBar,Preloader,CookieConsent,SEO,Breadcrumbs,OptimizedImage}.tsx`,
> `components/hero/HeroFolio.tsx`, `components/motion/WordReveal.tsx`,
> `index.css`, `tailwind.config.ts`, `App.tsx`, `constants/contact.ts`.

---

## 0. PSI scoreboard — `https://casagar.co.in/about` (Mobile)

| Score | Value | Status |
|---|---|---|
| **Performance** | **80** | Orange — needs ≥ 90 |
| Accessibility | 97 | Green — 1 contrast failure (footer) |
| Best Practices | 92 | Green — CSP / HSTS / COOP gaps |
| SEO | 100 | Pass |

**Core Web Vitals (mobile, lab):**

| Metric | Value | Threshold | Status |
|---|---|---|---|
| First Contentful Paint | **3.2 s** | ≤ 1.8 s | Fail |
| Largest Contentful Paint | **3.8 s** | ≤ 2.5 s | Fail |
| Total Blocking Time | 0 ms | ≤ 200 ms | Pass |
| Cumulative Layout Shift | 0.002 | ≤ 0.1 | Pass |
| Speed Index | 4.9 s | ≤ 3.4 s | Fail |

**LCP element:** the hero blurb `<p class="text-lead zone-text-muted ... animate-fade-in-up" style="animation-delay: 0.2s;">`.
**LCP breakdown:** TTFB 0 ms · *Element render delay* **1,930 ms** — 100 % of LCP comes from font-load + CSS-blocking + animation-delay, not from the network. This is the single most-fixable problem.

---

## 1. Round-2 → Round-3 status ledger

Confirmed in current codebase:

- **R2-IA-1** — outer `<div>` removed; `About.tsx` returns `<>...</>`. ✅
- **R2-UI-1** — `HeroFolio` accepts `compact` prop; About uses `compact`; breadcrumbs row reduced to `pt-24 md:pt-28`. ✅
- **R2-BUG-1** — `Snapshot` has typed `Stat` discriminated union; "Established" + "Office" are static, "Engagements" + "Industries" count up. ✅
- **R2-A11Y-3** — count-up cell uses `aria-hidden="true"` on the animated number with an `sr-only` mirror of the final value. ✅
- **R2-A11Y-2 / R2-UI-8** — section ids (`#snapshot`) and `aria-labelledby` heading present at least on Snapshot. ⚠️ Verify across HowWeWork, Values, Principal, Office, Cta.
- **R2-PERF-1** — prefetch `<link>` replaced by `pages/about/warmContact.ts` warming the chunk via `requestIdleCallback`. ✅

Still relevant after PSI lens:

- The hero blurb still ships `style={{ animationDelay: '0.2s' }}` — **this is the LCP element** and the animation-delay is now the most expensive line on the page.
- Image `width={320} height={400}` is correct as an HTML attribute but the file delivered is 1080×1354 — see **R3-PERF-3**.
- `selection:bg-brand-moss` (R2-UI-6) — verify; not visible in current `About.tsx` (the wrapper that carried it was removed).

---

## 2. Round-3 Severity Heatmap

| # | Issue | Axis | PSI tag | Severity | Effort |
|---|---|---|---|---|---|
| R3-PERF-1 | LCP element has `animation-delay: 0.2s` and `opacity: 0 → 1` keyframe — the LCP paint is gated on the hero blurb's fade-in keyframe, not on content arriving | LCP | Element render delay 1,930 ms | **Critical** | XS |
| R3-PERF-2 | 5 web-font woff2 files (~178 KiB) load through Google Fonts; one font (`tDbV2o-fl…woff2`, 40 KiB) sits at the deepest critical path = **1,913 ms** — tied for the LCP delay | LCP / FCP | Network dependency tree, 3rd-party 182 KiB | **Critical** | M |
| R3-PERF-3 | Founder portrait file is **1080×1354** for a slot that paints **221×392** — ~3× over-sized; PSI says 39.5 KiB savings | LCP | Improve image delivery | High | S |
| R3-PERF-4 | Render-blocking 1st-party CSS (`/assets/index-BfFJbeGC.css`, 18.2 KiB, 420 ms) plus blocking Google Fonts CSS (2.0 KiB, 750 ms) — combined critical path = ~1,470 ms | FCP / LCP | Render blocking requests | High | M |
| R3-PERF-5 | Two **unused preconnect** hints in `<head>`: `images.unsplash.com` and `maps.google.com` — both wasted on `/about`; preconnect budget is "no more than 4" and these spend it | FCP | Preconnect candidates | Medium | XS |
| R3-PERF-6 | Unused CSS: 13.9 KiB (≈ 82 % of `index-BfFJbeGC.css`) — Tailwind purge not running effectively, or shipping all zone palettes for routes that only use one | LCP / FCP | Reduce unused CSS | Medium | M |
| R3-PERF-7 | Unused JS: 29.3 KiB (≈ 62 % of `ui-vendor-BWE4iKJs.js`) — vendor bundle ships modules `/about` doesn't need (likely framer-motion's full feature set, lucide icon set, or React Router's data-router code) | LCP / FCP | Reduce unused JavaScript | Medium | M |
| R3-PERF-8 | **Forced reflow** of 55 ms inside `react-vendor-BBnwokUo.js:18:1872` — most likely framer-motion measuring `getBoundingClientRect()` mid-WordReveal mount | TBT (latent) | Forced reflow | Low | S |
| R3-PERF-9 | One long main-thread task (57 ms) inside `react-vendor` at 1,999 ms — this is the React commit that mounts the route. Below the 50 ms long-task threshold by a hair; will cross it on slower devices | TBT | Avoid long main-thread tasks | Low | S |
| R3-PERF-10 | Three non-composited animations: `OptimizedImage`'s `filter` blur transition on `/images/founder.avif`, `Preloader`'s `animate-expand-width` (animates `width`), `TopProgressBar` (animates inline `width: %`) — each forces layout/paint and can jank CLS on slower devices | CLS / paint | Avoid non-composited animations | Medium | S |
| R3-PERF-11 | `index.html` ships **5 Google Fonts CSS requests** in two separate `<link>`s — one for the full family list, one preload for "critical Fraunces" — but the preload's URL doesn't match the families the page actually uses, so it doesn't reuse the connection. Preload becomes dead weight | LCP | Manual review | Medium | XS |
| R3-PERF-12 | `<script type="importmap">` in `index.html` advertises CDN imports for `react`, `react-dom`, `react-router-dom`, `lucide-react`, `dompurify`, `react-markdown`, `vitest`, etc. from `aistudiocdn.com`. This is dead weight (Vite bundles produce hashed assets that ignore the import map at runtime) and *adds* an inline-script CSP hit | perf / security | Manual review | High | XS |
| R3-A11Y-1 | Footer headings ("EXPLORE", "RESOURCES", "CONTACT") and the copyright notice use `text-zinc-500` (#71717a) on `bg-[#0f0f0f]` — **3.96 : 1**, fails WCAG AA for normal text. Cookie-banner body copy is also flagged | a11y / contrast | "Background and foreground colors do not have a sufficient contrast ratio" | High | XS |
| R3-SEC-1 | Inline script at `/about:98:0` violates `script-src 'self' https://www.googletagmanager.com`. Likely the runtime-injected JSON-LD scripts from `SEO.tsx` (their text content is set via `script.text = …` which counts as inline). Console error every page load | security | Browser errors logged to console | High | M |
| R3-SEC-2 | CSP uses host allow-list (`script-src 'self' https://www.googletagmanager.com`) — PSI flags it as bypass-prone; recommends nonce or hash + `'strict-dynamic'` | security | Ensure CSP is effective | High | M |
| R3-SEC-3 | HSTS header has no `includeSubDomains` and no `preload` — page is upgrading HTTPS only for `casagar.co.in`; subdomains (e.g. a future `staging.casagar.co.in`) can be downgraded | security | Use a strong HSTS policy | Medium | XS |
| R3-SEC-4 | No `Cross-Origin-Opener-Policy` header set | security | Ensure proper origin isolation with COOP | Medium | XS |
| R3-SEC-5 | No `require-trusted-types-for` directive in CSP — any `dangerouslySetInnerHTML`, `el.innerHTML = …`, `script.text = …` is a potential DOM-XSS sink | security | Mitigate DOM-based XSS with Trusted Types | Medium | M |
| R3-IA-1 | The `<script type="importmap">` in `index.html` imports `vitest` and `@vitejs/plugin-react` — dev-only modules referenced from the production HTML. The importmap is not honored by Vite's bundle, but it ships in every page, including `/about`, increasing parse time and CSP noise | code quality | (PSI: console error) | High | XS |
| R3-IA-2 | `index.html` `<title>` and OG tags are **firm-level**, not page-level. SEO.tsx mutates them at runtime, so on first paint search engines / preview crawlers see "Sagar H R & Co. \| Chartered Accountants \| Mysuru" instead of "About …". Run a Twitter / WhatsApp share preview to confirm | SEO | Manual review | Medium | S |
| R3-IA-3 | Static `<script type="application/ld+json">` in `index.html` has duplicate `@id` (`#organization`) with the dynamic schema injected by `pages/about/schema.ts`. Two competing entities with the same `@id` is non-deterministic for crawlers | SEO | Manual review | Medium | XS |
| R3-CQ-1 | `pages/About.tsx` imports `warmContactRoute` from a one-line file `pages/about/warmContact.ts` that didn't exist when round-2 was written. Verify it actually performs a `() => import('../Contact')` (so Vite emits a chunk URL) rather than a fetch on `/contact` | code quality | — | Verify | XS |
| R3-CQ-2 | `Preloader` keeps animating `width` on a fixed `<div>` after the route is rendered — animates `width: 0 → 6rem` via `expandWidth` keyframe. This is the same root cause as R3-PERF-10 (non-composited width animation) and the same bar shows up in the PSI screenshot 5× | code quality / perf | — | Medium | XS |
| R3-CQ-3 | `TopProgressBar` simulates progress with `setTimeout(50, 200, 400, 600)` regardless of actual route load time. On a fully-warmed SPA navigation it overshoots; on a cold load it understates. Consider replacing with React Router's `<NavigationProgress>`-style hook off `useNavigation()` (data router) | code quality / UX | — | Low | S |

---

## 3. Detailed findings & fix-it-now

### R3-PERF-1 — Stop animating the LCP element

**Where:** `components/hero/HeroFolio.tsx:35`

```tsx
<p className="text-lead zone-text-muted max-w-lg leading-relaxed animate-fade-in-up"
   style={{ animationDelay: '0.2s' }}>
   {blurb}
</p>
```

**Why it dominates LCP:** the keyframe `fadeInUp` (defined in `tailwind.config.ts:102–105`) starts at `opacity: 0 / translateY(20px)` and ends at `opacity: 1 / translateY(0)`. Until the keyframe completes the paragraph is invisible — and PSI uses *visible content* to measure LCP. With a 200 ms delay + 800 ms duration + ~1.9 s font swap waiting on Fraunces, LCP can't paint earlier than ~2.0 s on a fast device and 3.8 s on a Moto G Power.

**Fix:**

1. **Don't animate the LCP candidate.** Drop the `animate-fade-in-up` and `animationDelay` from the hero blurb only. Leave the H1 animation (the H1 is not the LCP because text-balance + WordReveal stagger spreads paint across many spans).

2. **Or** keep the animation but set the at-rest state to `opacity: 1` and only animate the entrance via `translateY` (no opacity), so that LCP can register as soon as text is laid out — the lift doesn't gate visibility:

   ```js
   // tailwind.config.ts — keyframes
   fadeInUp: {
     '0%':   { opacity: '1', transform: 'translateY(8px)' },
     '100%': { opacity: '1', transform: 'translateY(0)' },
   },
   ```

3. **Apply the same pattern to the H1** (`HeroFolio.tsx:31`) — `WordReveal` already self-disables under `prefers-reduced-motion`, but its non-reduced path uses framer-motion `opacity: 0 → 1` per word. Switch the variant to `y` only:

   ```ts
   const itemVariants = {
     hidden: { opacity: 1, y: '40%' },
     visible: { opacity: 1, y: '0%', transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } },
   };
   ```

   The `overflow-hidden` wrapper around each word still produces the curtain-up reveal; opacity-1 just lets LCP paint earlier.

Acceptance: PSI re-run shows *Element render delay* ≤ 600 ms; LCP ≤ 2.5 s.

---

### R3-PERF-2 — Self-host fonts (or aggressively reduce them)

**Where:** `index.html:99–108`.

The page currently asks the browser to:
1. resolve `fonts.googleapis.com`,
2. download the family CSS (~2 KiB but at +750 ms cross-origin RTT),
3. resolve `fonts.gstatic.com`,
4. download **5 woff2 files** (Fraunces 67 KiB, Plus Jakarta Sans 22 KiB ×2, Playfair Display 27 KiB, JetBrains Mono 22 KiB),
5. swap from fallback at unpredictable times.

The deepest font (`tDbV2o-fl…woff2`) is the chain that gives PSI its **1,913 ms** maximum critical path latency.

**Fix — pick one of three escalations:**

**A. Minimum (1-day fix).** Aggressively trim Google Fonts request:
- Drop **Playfair Display** entirely — Fraunces is also a serif; its italic axis renders italic editorial well. Verify by visual diff.
- Drop unused weights from each family. The current URL requests Fraunces 300/400/500 + italic 300/400; reduce to 400/500 + italic 400. Plus Jakarta Sans 400/500/600/700 → 400/500/700. JetBrains Mono 300/400/500 → 400.
- Subset to Latin only: append `&text=` if you can predict the page text (over-engineered) **or** request `subset=latin` via the `&display=swap&subset=latin` flag. Saves ~30–40 % per file.
- **Delete** the second `<link rel="preload" ...&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap" as="style" />` in `index.html:107–108` — its URL doesn't match anything the page later uses, so it's a wasted request and a dead preload warning in DevTools.

**B. Recommended (1–2 day fix).** Self-host. Run [`fontsource`](https://fontsource.org/) at build time:

```bash
npm i @fontsource/fraunces @fontsource/plus-jakarta-sans @fontsource/jetbrains-mono
```

```ts
// index.tsx (or App.tsx)
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
```

Then **delete** the `<link href="https://fonts.googleapis.com/...">` and both `<link rel="preconnect">` for fonts.googleapis/gstatic from `index.html`. Add a `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html` for the two fonts that paint above the fold (Fraunces 400 / 500). Self-hosted fonts:
- Eliminate the cross-origin RTT (the 750 ms hit).
- Allow setting `font-display: optional` for non-critical weights.
- Ship via the same HTTP/2 connection as the JS/CSS, so they're warmed by the same TCP/TLS state.

**C. Aggressive (2–3 day fix).** Subset Fraunces yourself with [`subset-font`](https://github.com/Munter/subset-font) or `pyftsubset`, generating a Latin-only WOFF2 with only U+0020-007F + a few diacritics. A 67 KiB Fraunces file becomes ~18 KiB.

Acceptance: maximum critical-path latency in PSI ≤ 700 ms; total transfer for fonts ≤ 60 KiB on `/about`.

---

### R3-PERF-3 — Founder image is 3× over-sized

**Where:** `pages/about/Principal.tsx:14–28`, served from `/images/founder.avif`.

Current state:
- File: 1080×1354 AVIF, 42 KiB.
- Wrapper: `w-32 h-40` (128×160 CSS px). Image visually paints at 221×392 (PSI's measurement — that includes whatever the layout actually allots).
- HTML attrs: `width={320} height={400}` (correct intrinsic ratio for the *small* slot, used for CLS prevention).
- `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` — wrong. The actual rendered width is ~221 px max, never 100vw and never 33vw.

**Fix:**

1. **Generate properly-sized variants.** Build script step:

   ```bash
   # public/images/founder/ (drop the source file at /images/founder-source.jpg)
   npx @squoosh/cli --avif '{"cqLevel":33}' --resize '{"width":480}' founder-source.jpg -d public/images/founder
   npx @squoosh/cli --avif '{"cqLevel":33}' --resize '{"width":320}' founder-source.jpg -d public/images/founder
   npx @squoosh/cli --avif '{"cqLevel":33}' --resize '{"width":640}' founder-source.jpg -d public/images/founder
   ```

   Yields `founder-320.avif`, `founder-480.avif`, `founder-640.avif` (≈ 5–10 KiB each).

2. **Pass an explicit `srcSet` and corrected `sizes`:**

   ```tsx
   <OptimizedImage
     src="/images/founder/founder-480.jpg"           // jpg fallback
     srcWebp="/images/founder/founder-480.webp"
     srcAvif="/images/founder/founder-480.avif"
     srcSet="/images/founder/founder-320.avif 320w, /images/founder/founder-480.avif 480w, /images/founder/founder-640.avif 640w"
     sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 160px"
     alt="Portrait of CA Sagar H R, Principal Partner."
     width={480}
     height={600}
     aspectRatio="4/5"
     priority
     ...
   />
   ```

3. **Drop the JPG fallback only if you don't care about Safari iOS < 16.** AVIF is well-supported in modern browsers (Safari 16+, Chrome 85+, FF 93+); ~2 % of the audience has older Safari iOS. Keeping a small JPG behind `<img src>` covers them at trivial cost.

Acceptance: PSI "Improve image delivery" item disappears; founder image transfer ≤ 8 KiB on mobile.

---

### R3-PERF-4 — Render-blocking CSS

**Where:** Vite emits `/assets/index-BfFJbeGC.css` (18.2 KiB) and links it via `<link rel="stylesheet">` in the HTML head. Combined with the Google Fonts CSS, both are render-blocking.

**Fix — three layers (apply all):**

1. **Inline critical CSS** for the above-the-fold paint. Tailwind users can use `critters` (Vite plugin: `vite-plugin-critters` or upgrade to Vite 5 + `vite-plugin-critical`). Configure to inline rules used by:
   - `<HeroFolio>` (folio layout, fonts, colors, `animate-fade-in-up`)
   - `<Breadcrumbs>` (links, focus styles)
   - The reduced-motion gate
   - Zone CSS variables (the `--zone-*` block)

   Defer the rest.

2. **Preload the main CSS** on the link tag so the browser starts the fetch in parallel with the HTML parse:

   ```html
   <link rel="preload" as="style" href="/assets/index-BfFJbeGC.css"
         onload="this.rel='stylesheet'" />
   <noscript><link rel="stylesheet" href="/assets/index-BfFJbeGC.css" /></noscript>
   ```

3. **Stop blocking on Google Fonts CSS** — once R3-PERF-2 lands, this entire request goes away.

Acceptance: PSI "Render blocking requests" estimated savings drops below 200 ms.

---

### R3-PERF-5 — Drop unused preconnects

**Where:** `index.html:111–114`.

```html
<link rel="preconnect" href="https://images.unsplash.com" />
<link rel="dns-prefetch" href="https://formsubmit.co" />
<link rel="dns-prefetch" href="https://maps.google.com" />
<link rel="preconnect" href="https://maps.google.com" crossorigin />
```

`/about` uses neither Unsplash images nor (until consent) Google Maps, but the connections are warmed regardless and counted against the 4-preconnect budget.

**Fix:** move both **into the components that use them**, not into the global HTML head. For Maps, run the preconnect only once consent is granted:

```tsx
// pages/about/Office.tsx — when user grants consent
useEffect(() => {
  if (!canLoadMap) return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://maps.google.com';
  link.crossOrigin = '';
  document.head.appendChild(link);
  return () => link.remove();
}, [canLoadMap]);
```

For Unsplash: only the Insights detail / hero pages use it; preconnect there, not globally.

Acceptance: PSI "Preconnected origins" lists ≤ 3 origins for `/about`, none flagged "unused".

---

### R3-PERF-6 — Unused CSS (13.9 KiB)

**Where:** `/assets/index-BfFJbeGC.css`.

**Likely root causes:**
1. The zone CSS block in `index.css:306–344` ships rules for **default + editorial + editorial-paper** zones on every route, but `/about` only uses one zone.
2. `tailwind.config.ts` `content` glob is `./*.{ts,tsx}` and `./components/**/*.{ts,tsx}` — captures `*-SurfaceLaptop7.tsx` files (e.g. `ServiceBento-SurfaceLaptop7.tsx`, `Contact-SurfaceLaptop7.tsx`, `MarkdownRenderer-SurfaceLaptop7.tsx`) which look like backups but still produce class scans.
3. `animate-marquee`, `animate-spin-slow`, `animate-blob`, `animate-scale-in` keyframes ship globally even when the route doesn't need them.

**Fix:**

1. Move the zone definitions into a per-route stylesheet (or split `index.css` into `zone-default.css`, `zone-editorial.css`, `zone-editorial-paper.css`) and dynamically import the one needed.
2. Add the `*-SurfaceLaptop7.tsx` files to `tailwind.config.ts:content` exclusion, or delete them if unused (verify):
   ```ts
   content: [
     "./index.html",
     "./*.{ts,tsx}",
     "!./**/*-SurfaceLaptop7.{ts,tsx}",
     ...
   ]
   ```
   *(Tailwind's `content` doesn't accept negation natively; alternatively delete the files.)*
3. Strip unused keyframes from `tailwind.config.ts` (`marquee`, `expand-width` once R3-CQ-2 lands).

Acceptance: `/about` ships ≤ 8 KiB CSS gzipped; PSI "Reduce unused CSS" disappears.

---

### R3-PERF-7 — Unused JS (29.3 KiB in `ui-vendor`)

**Where:** `/assets/ui-vendor-BWE4iKJs.js` (47.4 KiB).

**Likely root causes:**
1. `framer-motion`'s full feature set (drag, layout animations, AnimatePresence) ships in the vendor chunk, but `/about` uses only `WordReveal` (which already imports `LazyMotion + domAnimation` — the small surface). The full bundle is being included anyway because something else in the app imports `motion` from the main entry. Audit `import 'framer-motion'` vs `import { m, useReducedMotion, LazyMotion } from 'framer-motion'`.
2. `lucide-react` is tree-shakeable per-icon; verify your bundler is actually shaking. If it's not, switch to `lucide-react/icons/Target` style imports.
3. `react-router-dom` v7's data-router code ships even if the app uses the basic `<Routes>` API. Verify by inspecting the chunk in `npx vite build --mode analyse`.

**Fix:**

1. Run `npm run build -- --mode=analyze` (with `rollup-plugin-visualizer` configured) and tree-shake the largest contributors.
2. Switch all `framer-motion` imports to the `'framer-motion/m'` path style and use only `m.*` (already done in `WordReveal.tsx` ✅; check other files).
3. Replace any `import { Icon } from 'lucide-react'` with `import Icon from 'lucide-react/dist/esm/icons/<icon-name>'` if tree-shaking still fails.

Acceptance: `ui-vendor` chunk ≤ 25 KiB gzipped on `/about` route.

---

### R3-PERF-10 — Non-composited animations

PSI flags 3 elements:

1. **`OptimizedImage`'s `filter: blur(...)`** transition (line 159 in `OptimizedImage.tsx`: `${isLoaded ? 'opacity-100 blur-0 ...' : 'opacity-0 blur-sm ...'}`).
   **Fix:** the `blur-sm → blur-0` transition on a 480-pixel-wide image triggers full-image rasterization. Either:
   - Skip the blur-up entirely when `priority && (srcAvif || srcWebp)` — modern formats arrive fast enough that the placeholder is jarring rather than helpful.
   - Or replace `filter: blur(*)` with `transform: scale(1.05) → scale(1)` (composited) and accept that you lose the blur-up effect.

2. **`Preloader` `animate-expand-width`** (`components/Preloader.tsx:50`).
   The keyframe animates `width: 0 → 6rem` which is non-composited (layout-trigger).
   **Fix:** replace with a transform:

   ```ts
   // tailwind.config.ts
   keyframes: {
     expandWidth: {
       '0%':   { transform: 'scaleX(0)' },
       '100%': { transform: 'scaleX(1)' },
     },
   },
   animation: { 'expand-width': 'expandWidth 1s cubic-bezier(0.16,1,0.3,1) forwards' },
   ```

   ```tsx
   // Preloader.tsx
   <div className="h-[1px] w-24 origin-left scale-x-0 animate-expand-width bg-white/30 rounded-full mb-6" />
   ```

   `transform: scaleX()` is GPU-composited; PSI's "Filter-related property may move pixels" goes away.

3. **`TopProgressBar`** (`components/TopProgressBar.tsx:38–41`) animates `style={{ width: `${progress}%` }}` via `transition-all duration-300`.
   **Fix:** same trick — keep the bar at `width: 100%`, animate `transform: scaleX(progress / 100)` with `transform-origin: left`.

   ```tsx
   <div className="fixed top-0 left-0 w-full h-1 z-[2000] pointer-events-none">
     <div
       className="h-full w-full origin-left bg-brand-moss shadow-[0_0_10px_#1A4D2E] transition-transform duration-300 ease-out"
       style={{ transform: `scaleX(${progress / 100})` }}
     />
   </div>
   ```

Acceptance: PSI "Avoid non-composited animations" passes (0 elements found).

---

### R3-PERF-11 — Dead font preload

**Where:** `index.html:107–108`.

```html
<link rel="preload"
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"
  as="style" />
```

This URL is *not* the same as the family CSS used at line 102 (which requests Fraunces with italic axis 0/1, weights 300/400/500). The browser fetches both URLs as separate resources and never reuses the preload. DevTools warns: "The resource was preloaded using link preload but not used within a few seconds from the window's load event."

**Fix:** delete this preload line entirely, or rewrite to **exactly match** the family CSS URL on line 102. If you keep it, also add `crossorigin` (Google Fonts CSS doesn't actually need it but the browser preload-cache match requires it for `as="style"` from a third party).

---

### R3-PERF-12 / R3-IA-1 — Importmap pointing at `aistudiocdn.com`

**Where:** `index.html:40–58`.

```html
<script type="importmap">
{ "imports": {
  "react": "https://aistudiocdn.com/react@^19.2.0",
  "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
  ...
  "vite": "https://aistudiocdn.com/vite@^7.2.4",
  "@vitejs/plugin-react": "https://aistudiocdn.com/@vitejs/plugin-react@^5.1.1",
  "vitest": "https://aistudiocdn.com/vitest@^4.0.14",
  ...
}}
</script>
```

**Why it's broken:**
1. Vite's production build bundles every dependency into hashed chunks. The browser at runtime does *not* resolve `react` from the importmap — it loads `/assets/react-vendor-*.js` directly. The importmap is dead in production.
2. `vite`, `@vitejs/plugin-react`, and `vitest` are *build-only* dependencies; even in dev they shouldn't be in the importmap.
3. The importmap is an **inline script**. PSI's CSP flag on `/about:98:0` is *probably* this script (or one of the inline JSON-LDs around the same line). It violates `script-src 'self'` because importmaps count as inline.

**Fix:** delete the entire `<script type="importmap">` block from `index.html`. The Vite build is self-contained. Keep `<script type="module" src="./index.tsx">` only.

This single deletion is likely to:
- Resolve R3-SEC-1 (the CSP inline-script error).
- Reduce HTML parse time and bytes.
- Eliminate a confusing dead-code surface for new contributors.

Acceptance: Console is clean of CSP errors; the page still works in dev (Vite injects its own importmap in dev mode automatically — not the same one).

---

### R3-IA-2 — Static `<title>` and OG tags in `index.html`

**Where:** `index.html:20–37`.

The HTML ships:
```html
<title>Sagar H R & Co. | Chartered Accountants | Mysuru</title>
<meta property="og:title" content="Sagar H R & Co. | Chartered Accountants Mysuru" />
```

But `<SEO>` then overrides them client-side. For social-media share previews (Twitter, LinkedIn, WhatsApp) the crawler usually does **not** execute JS and reads the static tags only. So every link to `/about` previews as "Sagar H R & Co. | Chartered Accountants | Mysuru" — losing the page-specific framing.

**Fix:** there's no SSR here, so two options:

**A.** Pre-render with Vite SSG plugin (`vite-ssg` / `vite-plugin-ssr`) so static tags come from each page's `<SEO>` at build time.

**B.** Keep CSR but ship per-route share previews via a small Vercel/Netlify edge function that rewrites `<title>` / OG tags based on the URL pattern.

Option **A** is the right answer; it also helps SEO and HTTP cache.

---

### R3-IA-3 — Duplicate `@id` for the organization

**Where:** `index.html:62–97` (static AccountingService LD) **and** `pages/about/schema.ts:25` (dynamic AccountingService LD with the same `@id: "https://casagar.co.in/#organization"`).

When `<SEO>` mounts, two scripts now claim `@id: "#organization"`, but the inline static one is **not** removed (it lacks `data-dynamic-schema="true"`). Crawlers see two competing entities and may merge or pick one non-deterministically.

**Fix — pick one source of truth:**

- Either delete the static `<script type="application/ld+json">` from `index.html` and let `<SEO>` own it — recommended because it allows page-specific `@id`s for AboutPage / Person.
- Or keep the static one (good for crawlers that don't run JS), but stop emitting `AccountingService` from `pages/about/schema.ts` and instead reference `{ "@id": "https://casagar.co.in/#organization" }` only.

The second option is slightly better for non-JS crawlers but requires every dynamic schema to *reference* the static one rather than redeclare. Either is acceptable; both must agree.

---

### R3-A11Y-1 — Footer contrast (cross-cutting but visible on `/about`)

**Where:** `components/Footer.tsx` — column headings use `text-zinc-500` on `bg-[#0f0f0f]`. PSI calls out:

- "EXPLORE", "RESOURCES", "CONTACT" `<h3 class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">`
- "© MMXXIII–MMXXVI · Sagar H R & Co."
- "Privacy Policy / Terms of Service / Disclaimer / Staff Portal" links use `hover:text-zinc-300` → resting state is presumably `text-zinc-500` too.

**Computed contrast:** `#71717a` on `#0f0f0f` ≈ **3.96 : 1** (fails WCAG AA 4.5 : 1 for body; passes AA 3 : 1 for "large text" only if the heading is ≥ 18.66 px bold or 24 px regular — `text-xs` is **12 px**, so it fails).

**Fix:** raise the resting color to `text-zinc-400` (`#a1a1aa`) which gives **~6.4 : 1**. Also raise the link resting state from `text-zinc-500` → `text-zinc-300`. Cross-page change — verify on Home, Services, Insights too.

---

### R3-SEC-1..5 — Header / CSP hardening

These are not in `pages/About.tsx` but ship via the host (Cloudflare Pages / Vercel / Netlify / nginx — wherever `casagar.co.in` is served from). Add a shared `_headers` (Netlify / Cloudflare Pages) or `vercel.json` `headers` block:

```yaml
# /_headers
/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' https://www.googletagmanager.com 'strict-dynamic' 'nonce-__NONCE__';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://images.unsplash.com https://casagar.co.in;
    font-src 'self' https://fonts.gstatic.com;
    frame-src https://www.google.com https://maps.google.com;
    connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
    require-trusted-types-for 'script';
```

The `'nonce-__NONCE__'` placeholder must be replaced per-request by the host. On Cloudflare Pages, use a Worker; on Vercel, use `next.config.js`-style middleware; on Netlify, use an Edge Function.

If a per-request nonce is too heavy operationally, fall back to a **strict-hash** approach for the static inline scripts (importmap and JSON-LD): compute the SHA-256 hash of each block at build time and add `'sha256-...'` tokens to `script-src`. Vite users can use `vite-plugin-csp-guard`.

Acceptance: PSI "Ensure CSP is effective", "HSTS", "COOP", "Trusted Types" all pass; console no longer shows the inline-script CSP error.

---

### R3-CQ-2 — `Preloader` runs after first paint and is the source of the 5 layout-shift "culprits"

PSI's CLS list cites the **Preloader** bar 5 times (each is 0.000 CLS, but each is a frame where the bar is animating `width`). The Preloader is supposed to be a one-shot first-paint thing, but on a SPA with `pathname`-keyed effects it can re-mount.

**Fix:**

1. Hide the Preloader after first mount and never show it again:

   ```tsx
   // Preloader.tsx — only run once per session
   useEffect(() => {
     if (sessionStorage.getItem('preloader_done') === '1') {
       setIsExiting(true);
       return;
     }
     // ...existing animation timeline
     return () => sessionStorage.setItem('preloader_done', '1');
   }, []);
   ```

2. Apply the `transform: scaleX(...)` fix from R3-PERF-10.

3. Verify the preloader is **not rendered on every route**; if it lives in `App.tsx` outside `<MainContent>`, it should only render on the very first mount.

---

## 4. Concrete Codex Worklist (R3-ordered)

> Quick wins first; each item references its finding ID. Suggested commits at marked checkpoints.

1. **R3-PERF-12 / R3-IA-1** — Delete the `<script type="importmap">` in `index.html`. Verify `npm run build` + `npm run preview` still loads `/about`. [⏸ commit — likely also fixes R3-SEC-1]
2. **R3-PERF-11** — Delete the dead Fraunces preload `<link>` in `index.html`.
3. **R3-PERF-5** — Move Unsplash + Maps preconnects out of `index.html` into the components that use them. The Maps preconnect lives behind consent in `Office.tsx`.
4. **R3-IA-3** — Remove the static `AccountingService` `<script type="application/ld+json">` from `index.html`; let `<SEO>` own it. (Keeps a single `@id`.)
5. **R3-PERF-1** — Stop animating LCP-candidate text. In `HeroFolio.tsx:35` drop `animate-fade-in-up` + `animationDelay` from the `<p className="text-lead ...">`. Optionally migrate the `fadeInUp` keyframe to opacity-1 entrance throughout. [⏸ commit]
6. **R3-PERF-3** — Generate 320/480/640-wide AVIF/WebP/JPG variants for `founder.*`. Pass `srcSet` and corrected `sizes` in `Principal.tsx`.
7. **R3-PERF-10** — Replace `width` animations with `transform: scaleX` in `TopProgressBar.tsx` and `Preloader.tsx`. Update `tailwind.config.ts:expandWidth` keyframe to use `scaleX`.
8. **R3-PERF-10** (image) — Skip the blur-up `filter` transition in `OptimizedImage` when `priority && srcAvif`. [⏸ commit]
9. **R3-PERF-2** — Self-host fonts via `@fontsource/*`. Drop Playfair Display. Trim weights. Delete the Google Fonts CSS / preconnect lines from `index.html`. Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for Fraunces 400 and 500. [⏸ commit — biggest single LCP win]
10. **R3-PERF-4** — Add `vite-plugin-critters` (or `critical`) to inline above-the-fold CSS. Convert `<link rel="stylesheet" href="...">` to preload-then-stylesheet pattern.
11. **R3-PERF-6** — Tighten Tailwind `content` glob; delete or exclude `*-SurfaceLaptop7.tsx` files; split zone CSS by zone and load only the active one.
12. **R3-PERF-7** — Run `vite build --mode analyze`, identify the heaviest non-About modules in `ui-vendor`, code-split. [⏸ commit]
13. **R3-A11Y-1** — Footer headings: `text-zinc-500` → `text-zinc-400`. Footer links resting: `text-zinc-300`. (Cross-page change.)
14. **R3-CQ-2** — `Preloader` runs once per session via `sessionStorage`. Apply scaleX fix from step 7.
15. **R3-CQ-3** — Replace the simulated-progress timeline in `TopProgressBar` with real-progress hook tied to `useNavigation()` (data-router) or `Suspense` boundaries.
16. **R3-IA-2** — Pre-render via `vite-ssg` (or equivalent) so static `<title>` / OG come from `<SEO>` at build time. [⏸ commit]
17. **R3-SEC-3..5** — Add `_headers` with HSTS (`includeSubDomains; preload`), COOP (`same-origin`), and `Content-Security-Policy: ...; require-trusted-types-for 'script'`.
18. **R3-SEC-1 / R3-SEC-2** — Switch CSP from host-allow-list to nonce + `'strict-dynamic'`. Implement nonce injection in the host's edge layer. [⏸ commit]
19. **R3-PERF-8 / R3-PERF-9** — Investigate the 55 ms forced reflow inside react-vendor (likely framer-motion's `getBoundingClientRect` in `WordReveal`). Defer the `WordReveal` enter animation by one tick:

    ```ts
    // WordReveal.tsx
    const [armed, setArmed] = useState(false);
    useEffect(() => { const id = requestAnimationFrame(() => setArmed(true)); return () => cancelAnimationFrame(id); }, []);
    ```
20. **R3-CQ-1** — Open `pages/about/warmContact.ts` and verify it does `import('../Contact')`, not `fetch('/contact')`.

---

## 5. Acceptance Criteria — Round 3

The page is "PSI-clean" when:

- **Mobile Lighthouse (cold cache):** Performance ≥ **95**, Accessibility = **100**, Best Practices = **100**, SEO = **100**.
- **Core Web Vitals:** FCP ≤ 1.8 s, LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.1, Speed Index ≤ 3.4 s on Slow 4G / Moto G Power emulation.
- LCP element render delay ≤ 600 ms (currently 1,930 ms).
- Maximum critical-path latency ≤ 700 ms (currently 1,913 ms).
- Total font transfer on `/about` ≤ 60 KiB.
- `/images/founder.avif` request transfer ≤ 8 KiB.
- 0 render-blocking 3rd-party requests on `/about`.
- 0 unused preconnects.
- 0 non-composited animations flagged.
- 0 console errors on a clean load (no CSP violations, no preload-not-used warnings).
- CSP includes `require-trusted-types-for 'script'` and uses nonces or strict-hashes; HSTS includes `includeSubDomains; preload`; COOP `same-origin` set.
- Footer contrast ≥ 4.5 : 1 for all body text and headings.
- `link[rel="canonical"]` and `<title>` reflect the **About** page on a no-JS share-preview crawl.

---

## 6. Out-of-scope spotted while re-auditing (parking lot)

- The site has both `index.css` (active) and `index-SurfaceLaptop7.css` (likely a backup). Likewise `Contact-SurfaceLaptop7.tsx`, `MarkdownRenderer-SurfaceLaptop7.tsx`, etc. — these duplicates inflate Tailwind's content scan and produce confusing search results. Sweep & delete.
- `WordReveal` uses framer-motion — heavy for the once-per-page effect it produces. A 1-line CSS keyframe + `IntersectionObserver` (similar to `Reveal.tsx`) would do the same job at ~5 KB instead of ~30 KB.
- `Reveal.tsx` (already in the codebase) and `WordReveal` are two ways to do the same thing — pick one.
- `pages/about/warmContact.ts` should also warm `pages/Resources/HRACalculator.tsx` and other commonly-clicked routes via a tiny `prefetchRoute` helper that takes a route name.
- The `<script type="importmap">` ships even though Vite's bundle ignores it — but **AI Studio**'s CDN (`aistudiocdn.com`) suggests the file was bootstrapped from an AI Studio template. Worth a sweep: are there other AI-Studio-specific artefacts in the project?
- `index.html` mentions "Loaded Dynamically via CookieConsent" in a comment — verify no leftover Google Analytics inline script ships before consent is granted.
- The `Cross-Origin-Embedder-Policy: credentialless` recommendation may break the Maps iframe; test before committing. If it breaks, fall back to no COEP and keep COOP `same-origin`.
- Once R3-PERF-2 lands, *delete* the `font-display: swap` query param from any remaining font URLs — self-hosted fonts can use `font-display: optional` for non-critical weights, which is faster than swap.
