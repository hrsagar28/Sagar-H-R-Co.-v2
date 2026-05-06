# Codex Prompts — Lift PageSpeed score from 85 → 95+ (desktop)

Source report: PageSpeed Insights for `https://casagar.co.in/` captured 5 May 2026 (Desktop, Lighthouse 13.0.1).

## What the report actually says

The visible metrics are fine: FCP 0.5 s, LCP 0.6 s, CLS 0. The score is being dragged down by two things only:

- **Total Blocking Time = 270 ms** (orange). Drivers: 5 long tasks on the main thread (three of them 100–125 ms in `react-vendor`), forced reflows totalling ~210 ms attributed to `react-vendor` + `index.js`, ~487 ms in Style & Layout, and ~508 ms in Script Evaluation.
- **Speed Index = 2.1 s** (orange). Drivers: 19.1 KiB render-blocking CSS (80 ms), critical request chain of 1,573 ms (fonts only discovered after CSS parses), 37 KiB of waste in `founder.avif` (1080×1920 served for a 307×545 box), and 42 KiB of unused JS from a markdown chunk that should not be on the home critical path at all.

LCP-element render delay is **1,530 ms** even though TTFB is 0 ms. That is the single most diagnostic number in the report: the LCP element (`<span>Taxation.</span>` in the hero) is not being held back by the network — it is being held back by JS-driven reveal animations gating paint until after hydration.

The prompts below are ordered by impact. Run them sequentially and re-test PageSpeed after each — that way you can attribute each delta to a specific change.

---

## Prompt 1 — Stop the hero "reveal" animation from gating LCP paint

**Why this is first:** the Lighthouse trace shows TTFB = 0 ms but LCP element render delay = 1,530 ms. The HTML and CSS arrive instantly; the LCP element is still invisible until JS hydrates and the `Reveal` component's animation triggers. Fixing this alone should drop LCP into the 0.3–0.4 s zone and noticeably improve Speed Index.

> **Codex prompt:**
>
> Repository: a Vite + React 18 + TypeScript site (`Sagar-H-R-Co.-v2`). The home page hero in `pages/Home.tsx` (around lines 130–156) renders the LCP element — three `<span class="block text-[12vw] md:text-[7rem] lg:text-[9rem]">` words "Audit.", "Taxation.", "Advisory." — each wrapped in a `<Reveal variant="reveal-mask" delay={0.1|0.18|0.26} duration={0.7}>` component. Lighthouse reports the LCP element render delay is 1,530 ms despite TTFB ≈ 0 ms. The reveal animation is starting from `opacity: 0` / clipped, so paint is gated behind JS hydration.
>
> Refactor so the hero LCP text is **painted in its final position and fully opaque on first frame**, before any JS runs. Specifically:
>
> 1. Open `components/Reveal.tsx` (or wherever `Reveal` is defined — search for `variant="reveal-mask"`). Add a new prop `eager?: boolean` (default `false`). When `eager` is true, the component must render its children with no transform, no clip-path, no opacity transition — just the children inside whatever wrapper it normally uses, with `style={{ opacity: 1 }}`. Do **not** start an IntersectionObserver and do **not** schedule a `requestAnimationFrame` in `eager` mode.
> 2. In `pages/Home.tsx`, pass `eager` to the three `Reveal` components that wrap "Audit.", "Taxation.", "Advisory." in the hero. Below-the-fold `Reveal` usages elsewhere on the page must remain animated — only the hero changes.
> 3. While you are in `Reveal.tsx`, audit it for forced reflows: any code that reads `offsetWidth`, `offsetHeight`, `getBoundingClientRect`, or `scrollHeight` after a DOM mutation in the same synchronous block should be moved into a `requestAnimationFrame` callback so reads happen in the next frame. Lighthouse blames `react-vendor` for 111 ms and `index.js` for 109 ms of forced-reflow time on this page; the Reveal observer is the most likely source.
> 4. If `Reveal` uses `IntersectionObserver`, ensure the observer is created lazily (inside `useEffect`, not at module top-level) and is disconnected on unmount.
>
> **Acceptance checks** (do all of them):
>
> - `npm run build` succeeds with no new warnings.
> - Open `dist/index.html` and `dist/assets/Home-*.js` after build and confirm the hero text classes still render. Take a screenshot of the page on first paint (use `npx serve dist` + Chrome DevTools Performance recording with CPU 4× throttling) and confirm "Audit. Taxation. Advisory." is fully visible at the FCP frame.
> - Run `npx lighthouse https://localhost:PORT/ --only-categories=performance --preset=desktop --view` and verify LCP element render delay is < 200 ms and TBT is reduced.
> - No regression in the visual reveal of below-the-fold sections — open the home page and scroll; reveals on Founder section, FAQ, etc. must still animate as before.

---

## Prompt 2 — Stop the markdown vendor chunk from loading on the home page

**Why this matters:** Lighthouse flags `/assets/markdown-….js` at **51.8 KiB transferred / 42.5 KiB unused** on the home route. The repo already manual-chunks `react-markdown`, `remark-gfm`, `remark-directive`, `rehype-sanitize`, and `unist-util-visit` into `markdown-vendor`, and `react-markdown` is only imported by `pages/InsightDetail.tsx` (lazy) and `pages/ChecklistDetail.tsx`. So the chunk is reaching the home network waterfall via either (a) Vite's `modulepreload` polyfill speculatively preloading sibling lazy chunks, or (b) a transitive import — most likely an "Insights" or "Resources" preview component on Home that pulls in `MarkdownRenderer` or `react-markdown` directly to render a snippet.

> **Codex prompt:**
>
> Repository: same Vite + React project. Lighthouse on `https://casagar.co.in/` reports the chunk `/assets/markdown-….js` (51.8 KiB) is loaded on the home page with 42.5 KiB unused. `vite.config.ts` defines `markdown-vendor: ['react-markdown', 'remark-gfm', 'remark-directive', 'rehype-sanitize', 'unist-util-visit']`. `react-markdown` is imported in `pages/InsightDetail.tsx` (lazy) and `pages/ChecklistDetail.tsx`. The home route is `pages/Home.tsx`.
>
> Investigate why this chunk reaches the home page and eliminate it.
>
> 1. Run `npm run build` and inspect `dist/assets/Home-*.js` plus the generated `dist/index.html`. Identify whether the markdown chunk is being pulled in via:
>    - a `<link rel="modulepreload">` tag in `index.html` for the home bundle,
>    - a static import inside any component used by Home (search the codebase for `react-markdown`, `MarkdownRenderer`, `remark-`, `rehype-`),
>    - or a re-export barrel (e.g. an `index.ts` in `components/` or `pages/` that re-exports `MarkdownRenderer` and is imported by Home).
> 2. Report the root cause as a code comment in your PR description, then fix it:
>    - If a Home component renders markdown snippets (likely an "Insights teaser" or "Latest articles" widget), replace `<ReactMarkdown>` with a plain stripped-text preview — the preview only needs the article excerpt as plain text, not full markdown rendering. Strip markdown to plain text at build time using a simple regex (`/[*_`#>\[\]\(\)]/g` etc.) inside the data layer, not at render time.
>    - If the cause is a barrel re-export, change the barrel so `MarkdownRenderer` is not re-exported from a file Home imports; or have Home import directly from the leaf file.
>    - If Vite is speculatively preloading the chunk via `modulepreload` polyfill, configure Rollup `output.experimentalMinChunkSize` and/or set `build.modulePreload.polyfill = false` only if the project doesn't need to support browsers without native modulepreload support (it does not — the project targets evergreen browsers).
> 3. Verify by re-running `npm run build` and checking that no `markdown-*.js` request appears in the network waterfall when loading `/` (use Chrome DevTools Network tab, filter by JS, hard reload). The chunk must still load when visiting `/insights/:slug` or `/resources/checklist/:slug`.
>
> **Acceptance checks:**
>
> - Build output shows the home page initial JS payload reduced by ~50 KiB transferred.
> - Lighthouse "Reduce unused JavaScript" no longer lists `markdown-*.js` for the home URL.
> - Visiting an article detail page still renders markdown correctly.

---

## Prompt 3 — Make the founder portrait responsive

**Why:** the report literally says: _"This image file is larger than it needs to be (1080×1438) for its displayed dimensions (307×545)."_ That is 37.5 KiB of pure waste. A `srcset` with three widths — 400w, 800w, 1080w — covers 1×, 2×, and 3× DPI cases without overshooting.

> **Codex prompt:**
>
> Repository: same project. The founder portrait is rendered in `components/home/FounderSection.tsx` as a `<picture>` element with `<source srcSet="/images/founder.avif">`, `<source srcSet="/images/founder.webp">`, and `<img src="/images/founder.jpg" width="1080" height="1920" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover" style="object-position: 50% 18%;">`. The intrinsic source is 1080×1920 but the rendered box on desktop home is 307×545 CSS px. Lighthouse reports 37.5 KiB savings.
>
> Implement responsive image variants for the founder portrait.
>
> 1. Generate three width variants per format using `sharp` (already a devDependency). Add a script `scripts/generate-responsive-images.ts` that:
>    - Reads `public/images/founder-source.<ext>` (move the existing 1080-wide source there as the master if not already done — or fall back to `public/images/founder.jpg` as input if no separate master exists).
>    - Outputs `founder-{400,800,1080}.{avif,webp,jpg}` into `public/images/`.
>    - AVIF: `quality: 50, effort: 6`. WebP: `quality: 75`. JPG: `quality: 80, mozjpeg: true, progressive: true`.
>    - Skips writing if the output is newer than the source (cheap mtime check).
> 2. Wire the script into `package.json` "build" before `vite build` (so Netlify builds regenerate them).
> 3. Update `FounderSection.tsx` to emit a proper responsive `<picture>`:
>    ```tsx
>    <picture>
>      <source
>        type="image/avif"
>        srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
>        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
>      />
>      <source
>        type="image/webp"
>        srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
>        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
>      />
>      <img
>        src="/images/founder-800.jpg"
>        srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
>        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
>        width="1080"
>        height="1920"
>        loading="lazy"
>        decoding="async"
>        alt="Portrait of CA Sagar H R, Founder & Principal"
>        className="absolute inset-0 h-full w-full object-cover"
>        style={{ objectPosition: '50% 18%' }}
>      />
>    </picture>
>    ```
>    Verify the actual rendered CSS width on desktop (looks like ~307 px) and adjust the `sizes` attribute if the value differs — measure in DevTools, do not guess.
> 4. Add the new generated files to `.gitignore` if they are pure build artefacts; otherwise commit them.
>
> **Acceptance checks:**
>
> - `npm run build` produces all 9 variant files.
> - DevTools Network tab on a 1× DPI 1280-wide viewport shows the browser fetching `founder-400.avif` (≈ 5–8 KiB), not the original 1080-wide file.
> - Lighthouse "Improve image delivery" no longer flags `founder.avif` for the home URL.

---

## Prompt 4 — Cut render-blocking CSS and ship the right font preloads

**Why:** 19.1 KiB CSS in the critical path (80 ms), 12 KiB of which is unused on the home route. The HTML preloads `fraunces-latin-400-italic`, `plus-jakarta-sans-latin-400-normal`, and `plus-jakarta-sans-latin-700-normal` — but the LCP-frame text actually uses `fraunces-latin-400-normal`, `fraunces-latin-500-normal`, and `plus-jakarta-sans-latin-500-normal`. So the preloads are missing the fonts that render LCP, and pre-loading fonts that aren't used in the first paint.

> **Codex prompt:**
>
> Repository: same project. Files involved: `index.html`, `index.css`, `index.tsx`, `pages/Home.tsx` and home-page subcomponents under `components/home/`.
>
> Two changes — do both.
>
> **A. Fix font preloads in `index.html`.**
>
> Inspect every text element rendered above the fold on the home page (hero "Audit. Taxation. Advisory.", the cookie consent banner text, the navigation links, the strapline "Chartered Accountants based in Mysuru…"). For each, determine the resolved Tailwind class chain → CSS variable → `font-family` declaration → which `@font-face` block in `index.css` matches → which `.woff2` file URL.
>
> Then in `index.html`:
>
> 1. Replace the existing 3 `<link rel="preload" as="font">` tags so they preload **exactly** the fonts that render the LCP and above-the-fold text — most likely `fraunces-latin-400-normal.woff2`, `fraunces-latin-500-normal.woff2`, and `plus-jakarta-sans-latin-500-normal.woff2`. Do not preload more than 4 font files total. All preloads must use `crossorigin` and `type="font/woff2"`.
> 2. Remove preloads for fonts that are **not** rendered on first paint of the home route (e.g. italic, mono, weight 400 of jakarta if 500 is what's actually used in the visible chrome).
> 3. Keep `font-display: optional` for `jetbrains-mono` and italic variants (these are non-critical) and `font-display: swap` for the rest.
>
> **B. Cut unused CSS from the home critical path.**
>
> Lighthouse reports 11.7 KiB unused in `index-DimccROT.css` on the home URL. The most likely culprits: the `[data-zone="editorial"]` block (only used on the About page), the `.bg-grid` and `.bg-noise` SVG turbulence utilities, and the `.hero-ledger-cta` / `.archive-item` / `.custom-cursor-active` classes if they aren't used by the home route.
>
> 1. Audit `index.css` against the home page DOM. For each custom utility / scoped block, grep the codebase for the class name; if it appears only in non-home routes, move it to a route-scoped CSS file (e.g. `pages/About.css`) and `import` that CSS file from inside the lazy-loaded route component. Vite will code-split the CSS automatically when imported from inside a `React.lazy`-loaded module.
> 2. For Tailwind, ensure `tailwind.config.js` `content` glob includes only paths that are actually used; do not add `**/*` patterns that pull dead code into the production CSS.
> 3. Re-run `npm run build`. Confirm the home `index-*.css` shrinks. Re-run Lighthouse and confirm the "Reduce unused CSS" estimated savings drops below 4 KiB.
>
> **Acceptance checks:**
>
> - Build succeeds.
> - DevTools Network shows the preloaded fonts being used on first paint (no `swap` glyph flicker on hero text).
> - "Render-blocking requests" estimated savings under 30 ms.
> - Visual diff of `/`, `/about`, `/services` shows no missing styles.

---

## Prompt 5 — Hunt down and fix the forced reflows in `react-vendor` and `index.js`

**Why:** Lighthouse blames `react-vendor.js` for 111 ms and `index.js` for 109 ms of forced-reflow time, plus 88 ms unattributed. That is ~310 ms of layout thrash on the critical path. Forced reflows almost always come from one of: a custom hook that reads `offsetWidth` after setting state, an `IntersectionObserver` callback that reads `getBoundingClientRect`, scroll-position math run in a `useLayoutEffect`, or measuring a child immediately after mounting it.

> **Codex prompt:**
>
> Repository: same project. Lighthouse reports forced reflows totalling ~310 ms on the home page, attributed to `react-vendor` (111 ms top function call) and `assets/index-*.js` (109 ms top function call, 88 ms unattributed).
>
> Do a focused audit of the home route's component tree for layout-thrash patterns. Components likely involved (open and read each one): `App.tsx` (TopProgressBar, RouteHandler), `pages/Home.tsx`, every component under `components/home/`, and any custom hooks under `hooks/` or `lib/` referenced from those.
>
> For each file, search for:
>
> 1. **Read-after-write within the same synchronous block:** patterns like `el.style.x = y; const w = el.offsetWidth;` or `setState(...); const r = el.getBoundingClientRect();`.
> 2. **Measurement inside `useEffect` or `useLayoutEffect` without `requestAnimationFrame`:** any layout read that happens immediately after mount and immediately triggers a state update.
> 3. **Scroll handlers that read layout on every event:** `onScroll` reading `scrollY` and an element's `offsetTop` in the same callback without `passive: true` or `requestAnimationFrame` batching.
> 4. **`ResizeObserver` callbacks that mutate the DOM and then re-read it.**
> 5. **Cookie consent banner / `WhatsApp float` / `TopProgressBar`** — these often measure themselves on mount.
>
> For each pattern found, refactor so:
>
> - Layout reads happen inside `requestAnimationFrame` after writes, not in the same tick.
> - Scroll/resize handlers use `passive: true` and batch reads via `rAF`.
> - `useLayoutEffect` is downgraded to `useEffect` unless the read genuinely must run before paint.
> - If a component measures itself only to set a CSS variable, prefer pure CSS (`vh`, `cqi`, `clamp()`, `aspect-ratio`) when possible.
>
> Also check `Reveal.tsx` (already covered by Prompt 1, but verify here too) and any "marquee" / "ticker" / "stat counter" component on the home page — counters that read element dimensions per frame to drive animation are common offenders.
>
> **Acceptance checks:**
>
> - List every pattern you found and what you changed, file-by-file, in the PR description.
> - Re-run Lighthouse on `https://localhost:PORT/`. The "Forced reflow" insight should either disappear or drop below 50 ms total reflow time.
> - TBT should drop into the 100–150 ms range.
> - No visual or behavioural regression — manually verify scroll, hover, accordion expand, and cookie banner all still work.

---

## Prompt 6 — Composite the FAQ accordion animation and trim DOM size

**Why:** Lighthouse flags 4 non-composited animation properties on the FAQ accordion: `grid-template-rows`, `border-color`, `box-shadow`, `color` — all of these force layout/paint per frame. Also: 1,118 DOM elements is high, and Style & Layout took 487 ms on this page.

This is lower-priority than 1–5 (CLS is already 0, so the score isn't being directly punished), but it cleans up a real source of jank when users expand an FAQ.

> **Codex prompt:**
>
> Repository: same project. File: `components/home/FAQPreview.tsx` line 82, the accordion content uses `grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grid-rows-[1fr]/grid-rows-[0fr]` to animate expand/collapse, plus `transition-colors` on borders, color, and box-shadow on hover. Lighthouse "Avoid non-composited animations" lists 4 elements / 8+ properties.
>
> Refactor for compositor-only animation.
>
> 1. **Accordion expand/collapse.** Replace the `grid-rows-[1fr]/grid-rows-[0fr]` trick with a `max-height` transition driven by a measured content height. Pattern:
>    - On open, measure the content `scrollHeight` once, set `style.height = '${scrollHeight}px'`, then on `transitionend` set `style.height = 'auto'`.
>    - On close, set `style.height = '${scrollHeight}px'` synchronously, force a reflow once via `void el.offsetHeight`, then in the next `rAF` set `style.height = '0px'`.
>    - Animate `height` and `opacity` only. Do not animate `grid-template-rows`.
>    - All measurement reads must be batched in `requestAnimationFrame` to avoid forced reflows. Measurement should run lazily on first open, then be cached.
> 2. **Hover states.** The border and box-shadow transitions on the FAQ card are nice but they paint on hover, not LCP — keep them, but switch to `transition-[transform,opacity]` and use a `::before` pseudo-element with a pre-applied shadow that fades in via `opacity` instead of animating `box-shadow` itself. Same trick for border colour: layer a second border via `box-shadow: inset 0 0 0 1px <color>` on a pseudo-element and crossfade it.
>    - If this gets too elaborate, leave hover styles alone (they don't affect LCP/TBT) and only fix the open/close.
> 3. **DOM size.** The page has 1,118 elements with a depth of 18. Walk the home tree and identify any sections that render dozens of items eagerly when only a few are visible above the fold:
>    - The "Revenue from Operations" / invoice ticker section was flagged as a "Most children" hotspot with 14 children inside `.absolute.inset-0.overflow-hidden`. If this is a decorative scrolling element, consider rendering only the visible ~5 items and recycling them, or rendering fewer items at smaller breakpoints.
>    - Below-the-fold sections (FAQPreview, FounderSection if it's far down, anything after the third viewport) can be wrapped in `content-visibility: auto` with `contain-intrinsic-size` set to a sensible default. This lets the browser skip layout/paint until the section scrolls near the viewport. Apply via a Tailwind arbitrary class: `[content-visibility:auto] [contain-intrinsic-size:auto_800px]`.
>
> **Acceptance checks:**
>
> - Open and close each FAQ on a 4× CPU throttled DevTools profile and confirm no "Layout shift" entries during animation.
> - Total DOM elements drops below 900 (verify via `document.querySelectorAll('*').length` in console after page load).
> - Lighthouse "Avoid non-composited animations" no longer lists `grid-template-rows`.
> - No visual regression — accordion still expands smoothly with the same easing curve.

---

## Verification protocol after all prompts land

Run all of these once the branch is merged and deployed to staging:

1. `npm run build && npx serve dist -p 4173` then `npx lighthouse http://localhost:4173/ --preset=desktop --view --only-categories=performance` — three runs, take the median. Target: ≥ 95.
2. Same for mobile preset — the report shipped was desktop, so confirm mobile also improved (it should, by more than desktop).
3. Chrome DevTools → Performance → record a cold load with CPU 4× and Network "Fast 3G" → check the Frames track for any single frame > 50 ms after the LCP frame.
4. Open `/`, `/about`, `/services`, `/insights`, `/insights/<some-slug>`, `/resources`, and confirm no missing styles or broken images.
5. Re-pull `https://casagar.co.in/` in PageSpeed Insights once deployed and screenshot the new report for the file.

## Quick summary of expected gains

| Prompt                                          | Metric impact     | Expected savings                             |
| ----------------------------------------------- | ----------------- | -------------------------------------------- |
| 1 — Hero LCP gating                             | LCP, SI           | LCP 0.6 s → 0.3 s; SI ~ −400 ms              |
| 2 — Markdown chunk leak                         | TBT, SI           | TBT ~ −40 ms; ~50 KiB JS off the wire        |
| 3 — Responsive image                            | LCP, byte weight  | 37 KiB saved                                 |
| 4 — Render-blocking CSS + correct font preloads | FCP, LCP, SI      | ~80 ms render-blocking, font swap eliminated |
| 5 — Forced reflows                              | TBT               | TBT ~ −150 ms                                |
| 6 — Accordion + DOM                             | TBT, runtime jank | TBT ~ −30 ms, smoother interaction           |

Aggregate target: Performance score 95–100, TBT < 100 ms, Speed Index ≤ 1.3 s.
