# Home page — Review and Codex prompts

Scope reviewed: `pages/Home.tsx` plus the components it composes (`StarField`, `ChaosToOrder`, `FounderSection`, `HorizontalScroll`, service cards, `TrustBar`, recent-insights block, `FAQPreview`, `Marquee`, `LocationStrip`), the shared `Reveal` / `BigCTA` / `AccentTitle` / `VisuallyHidden` / `Marquee` / `SEO` components, `index.html`, and `netlify.toml`. The PERF-CODEX-PROMPTS.md already on disk covers Lighthouse-specific fixes — this document is complementary and focuses on issues those prompts don't touch.

The prompts are ordered by impact. Each one is self-contained: Codex can run them sequentially without re-reading this document. Run `npm run lint`, `npm test`, and `npm run build` after each prompt and commit before moving on.

---

## Executive summary — honest review

What is genuinely good:

- The hero is striking and the editorial voice (Fraunces italic on "Advisory.", JetBrains Mono captions, brass hairlines) is rare for a CA firm site and earns trust without screaming.
- `ChaosToOrder` is a clever value proposition demo — visceral, on-brand, accessible (keyboard slider, reduced-motion path, real document chrome rather than generic placeholders).
- Performance scaffolding is mostly correct: `content-visibility`, `containIntrinsicSize`, `IntersectionObserver` lazy mounts, save-data detection in `StarField`, reduced-motion paths almost everywhere.
- SEO scaffolding is comprehensive: structured `AccountingService` graph, FAQPage / Article schemas via the `SEO` component, sitemap, robots.txt, OG images per route.

The things actually pulling the page down (in priority order):

1. **The visible LCP headline is a `<div>`, not an `<h1>`.** Screen readers and crawlers see a visually-hidden h1 with different wording. This is a real SEO and accessibility regression that PERF-CODEX-PROMPTS.md doesn't address.
2. **Color contrast on the dark hero / `LocationStrip` / services rail fails WCAG AA in several places** (`text-white/55`, `/60`, `/65` used for body copy).
3. **The CSP in `netlify.toml` will block the inline `<style>` in `index.html`.** `style-src 'self'` with only `style-src-attr 'unsafe-inline'` does not cover `<style>` elements; this either silently breaks the preload hero CSS or relies on an undocumented browser quirk.
4. **Focus / tab-order traps in `HorizontalScroll`**: arrow buttons stay in the tab order when invisible (`opacity-0` + `pointer-events-none` doesn't remove them), and service cards translated off-screen on desktop still receive focus.
5. **Section comment numbering is broken** (1, 2, 3, 4, 5, 7, 8, 9, 11 — missing 6 and 10), a small but telling sign that the page was edited in passes without a final cleanup.
6. **Hard-coded hex colors (`#0a0908`, `#b8924c`, `#8b3a2f`, `#4ADE80`, `#06070a`, `#E8F5E9`)** scattered across `Home.tsx`, `ChaosToOrder.tsx`, `LocationStrip.tsx`. These bypass the Tailwind theme tokens you've already defined and make future palette changes a search-and-replace job.
7. **`bg-brand-accent shadow-[0_0_12px_brand-accent]`** in the hero status pill is an invalid Tailwind arbitrary value — `brand-accent` is a Tailwind token name, not a CSS color literal, so the shadow won't render.
8. **`min-h-[100svh] min-h-screen`** on the hero is a duplicate class; only one applies. `100dvh` would also be safer than `100svh` for the cinematic frame.
9. **Performance: `ChaosToOrder` drifts the divider via `setState` every animation frame**, forcing a React render per frame for a 1.2% sine wobble. This should be a pure CSS animation.
10. **FAQPreview opens the first item via `useEffect` + `matchMedia` post-mount**, which causes a visible "all closed → first opens" flash on desktop first paint and ties the open-state to viewport at mount, not viewport at any later moment.

---

## Prompt 1 — Make the visible headline the real `<h1>` (a11y + SEO)

> **Codex prompt:**
>
> Repository: Vite + React 18 + TypeScript site (`Sagar-H-R-Co.-v2`). On the home page (`pages/Home.tsx`), the hero currently renders the visible headline through `<AccentTitle as="div">…</AccentTitle>` and exposes a different headline to assistive tech via `<VisuallyHidden as="h1">Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory.</VisuallyHidden>`. This means crawlers and screen readers see one headline while sighted users see another, and the page has no visible `<h1>`. Fix this so the visible "Audit. Taxation. Advisory." block IS the `<h1>` and the `VisuallyHidden` wrapper is removed.
>
> Concretely:
>
> 1. Open `pages/Home.tsx`. Locate the block currently containing `<VisuallyHidden as="h1">…</VisuallyHidden>` (around lines 180–206 — the three `<Reveal variant="reveal-mask" eager>` wrappers around "Audit.", "Taxation.", "Advisory.").
> 2. Replace the three sibling `<AccentTitle as="div">` calls with a **single** semantic `<h1>` that contains all three lines and an accessible-name attribute summarising the practice. Use `aria-label` to give screen-reader users the descriptive form ("Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory.") while the visible content remains the cinematic three-word stack. Example structure:
>
>    ```tsx
>    <h1
>      className="font-heading font-light leading-[1] tracking-[-0.02em] text-white drop-shadow-2xl"
>      aria-label="Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory."
>    >
>      <Reveal variant="reveal-mask" delay={0.1} duration={0.7} eager>
>        <span
>          aria-hidden="true"
>          className="block max-w-full overflow-hidden text-[12vw] md:text-[7rem] lg:text-[9rem]"
>        >
>          Audit.
>        </span>
>      </Reveal>
>      <Reveal variant="reveal-mask" delay={0.18} duration={0.7} eager>
>        <span
>          aria-hidden="true"
>          className="block max-w-full overflow-hidden text-[12vw] md:text-[7rem] lg:text-[9rem]"
>        >
>          Taxation.
>        </span>
>      </Reveal>
>      <Reveal variant="reveal-mask" delay={0.26} duration={0.7} eager>
>        <span
>          aria-hidden="true"
>          className="block max-w-full overflow-hidden text-[12vw] md:text-[7rem] lg:text-[9rem]"
>        >
>          <em className="font-serif font-normal italic text-[#E8F5E9]">Advisory.</em>
>        </span>
>      </Reveal>
>    </h1>
>    ```
>
>    The three `<span>` elements are `aria-hidden="true"` so the accessible name comes entirely from the `aria-label` — this avoids the screen reader announcing "Audit period. Taxation period. Advisory period." while still letting the visible text drive the visual hierarchy.
>
> 3. Remove the `<VisuallyHidden as="h1">` block. Remove the `VisuallyHidden` import from `pages/Home.tsx` if it is no longer used.
> 4. The "Sagar H R & Co." text currently rendered as `<h2 className="font-heading text-xl …">` above the headline (in the status pill block) should be demoted to a `<p>` because the page now has a real `<h1>`. The "Services" heading inside `HorizontalScroll` and downstream `<h2>` elements remain at level 2, which is now correct.
> 5. Confirm `pages/Home.tsx` still compiles, has only one `<h1>` in its rendered output, and that the `<h2>` chain (`Services` / `Latest Updates` / `Quick answers` / `Visit our office`) is unchanged.
>
> **Acceptance checks:**
>
> - `npm run lint` and `npm test` pass.
> - In a dev build, run `document.querySelectorAll('h1').length` from DevTools on `/` — it must equal 1.
> - VoiceOver / NVDA reads "Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory., heading level 1" when entering the hero.
> - Lighthouse Accessibility audit no longer flags "Document does not have a main heading" or "Heading elements appear in a sequentially-descending order".

---

## Prompt 2 — Fix the CSP so the inline `<style>` in `index.html` is allowed

> **Codex prompt:**
>
> Repository: Vite + React site. `netlify.toml` sets a strict CSP for `/*`:
>
> ```toml
> Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://formsubmit.co https://api.botpoison.com; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; report-uri /.netlify/functions/csp-report; upgrade-insecure-requests;"
> ```
>
> `index.html` contains an inline `<style>…#preload-hero {…}…</style>` block. `style-src-attr 'unsafe-inline'` covers inline `style=""` attributes but does NOT cover `<style>` elements — those are gated by `style-src-elem`, which falls back to `style-src 'self'`. So this CSP will block the preload hero CSS in browsers that strictly enforce CSP3, which can cause an unstyled flash on first paint.
>
> Fix this by adding a SHA-256 hash for the inline style block to the CSP, OR (less ideal but acceptable for a marketing site) explicitly allowing `'unsafe-inline'` for style elements only.
>
> Concretely:
>
> 1. Read the entire contents of the `<style>…</style>` block in `index.html`. Compute its SHA-256 hash. (Easiest: run `node -e "const s=require('fs').readFileSync('index.html','utf8'); const m=s.match(/<style>([\\s\\S]*?)<\\/style>/); console.log(require('crypto').createHash('sha256').update(m[1]).digest('base64'));"`.)
> 2. In `netlify.toml`, update the `Content-Security-Policy` header to add a `style-src-elem 'self' 'sha256-…'` directive (using the hash you just computed), keeping `style-src` and `style-src-attr` intact:
>
>    ```toml
>    Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self'; style-src-elem 'self' 'sha256-<HASH>'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://formsubmit.co https://api.botpoison.com; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; report-uri /.netlify/functions/csp-report; upgrade-insecure-requests;"
>    ```
>
> 3. Add a comment in `netlify.toml` above the header block documenting that the hash must be regenerated whenever the `<style>` block in `index.html` is edited. Add a small `scripts/check-csp-hash.ts` script that re-computes the hash and fails if it does not match the one in `netlify.toml`, and wire it into the `build` script so a stale hash breaks CI rather than production.
> 4. Also tighten the `Permissions-Policy` header in the same block to:
>
>    ```toml
>    Permissions-Policy = "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()"
>    ```
>
>    These additions cost nothing and silence common policy-audit findings.
>
> **Acceptance checks:**
>
> - `npm run build` succeeds; the new `check-csp-hash` script passes.
> - Deploy preview shows no CSP violations in DevTools Console for `/`.
> - The "Audit. Taxation. Advisory." preload hero (`#preload-hero`) is fully styled on first paint.

---

## Prompt 3 — Fix focus / tab-order issues in `HorizontalScroll`

> **Codex prompt:**
>
> In `components/HorizontalScroll.tsx`, the left and right arrow buttons fade out via `opacity-0` + `pointer-events-none` when at the start/end of the rail, but they remain in the tab order — keyboard users can focus an invisible button. Also, on desktop the children (service cards) are translated horizontally via `translate3d(-${translateX}px, 0, 0)` while still in normal document flow, so when a card receives focus the browser triggers `scrollIntoView` and the page jumps awkwardly.
>
> Fix both:
>
> 1. The two arrow buttons (`aria-label="Scroll left"` and `aria-label="Scroll right"`) currently use:
>
>    ```tsx
>    className={`absolute … ${scrollProgress > 0.02 ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'} `}
>    ```
>
>    Add `aria-hidden` and `tabIndex={-1}` (and the `inert` attribute where available) when they are visually hidden. Move the visibility flag into a derived constant so both buttons read identically:
>
>    ```tsx
>    const showLeft = scrollProgress > 0.02;
>    const showRight = scrollProgress < 0.98;
>    // …
>    <button
>      type="button"
>      onClick={() => nudgeScroll('left')}
>      aria-label="Scroll services left"
>      aria-hidden={!showLeft}
>      tabIndex={showLeft ? 0 : -1}
>      {...(!showLeft ? { inert: '' as unknown as boolean } : {})}
>      className={`absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${showLeft ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'}`}
>    >
>      <ChevronLeft size={22} />
>    </button>;
>    ```
>
>    Do the same for the right button.
>
> 2. The scroll-progress indicator currently has `role="progressbar"` but is purely decorative — it duplicates information already conveyed by the cards themselves. Either keep the role and add `aria-hidden` to the outer wrapper of the strip (`<div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">`), or remove `role` and just leave it as visual chrome. Pick "decorative" and remove the role / aria attributes — it's not meaningful progress.
> 3. Inside the desktop sticky pane, child service `<Link>` cards translated off-screen still receive focus. Wrap the scroll viewport so off-screen cards become non-focusable on desktop only:
>    - Compute `const cardVisibility = (index: number) => …` from `translateX`, `metrics.current.maxTranslate`, and the card index. Cards more than ~1.5 viewport widths away are effectively off-screen.
>    - Simpler alternative (preferred): pass an `onFocus` handler on each card link that calls `nudgeScroll` to bring the card into view. Implement this by attaching a `focusin` listener on `scrollContainerRef.current` (inside the existing desktop `useEffect`) that reads `e.target.getBoundingClientRect()` inside `requestAnimationFrame` and adjusts `window.scrollTo` so the focused card is centred horizontally. This keeps keyboard navigation usable without changing the children's API.
>
>    Pseudocode:
>
>    ```ts
>    useEffect(() => {
>      if (isMobile || shouldReduceMotion) return;
>      const sc = scrollContainerRef.current;
>      if (!sc) return;
>      const onFocusIn = (e: FocusEvent) => {
>        const target = e.target as HTMLElement | null;
>        if (!target || !sc.contains(target)) return;
>        requestAnimationFrame(() => {
>          const cardRect = target.getBoundingClientRect();
>          const viewportCentre = window.innerWidth / 2;
>          const cardCentre = cardRect.left + cardRect.width / 2;
>          const delta = cardCentre - viewportCentre;
>          if (Math.abs(delta) < 40) return;
>          const targetOffset = Math.max(0, Math.min(metrics.current.maxTranslate, translateX + delta));
>          window.scrollTo({ top: metrics.current.top + targetOffset, behavior: 'smooth' });
>        });
>      };
>      sc.addEventListener('focusin', onFocusIn);
>      return () => sc.removeEventListener('focusin', onFocusIn);
>    }, [isMobile, shouldReduceMotion, translateX]);
>    ```
>
> 4. Also add a `focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black` class set on the service `<Link>` cards in `pages/Home.tsx` so the focus ring is visible against the dark rail. Currently they have `hover:` states but no `focus-visible:` states.
>
> **Acceptance checks:**
>
> - Tab through `/` with only the keyboard, starting at the page top. Every focused element must be visible at the moment it receives focus.
> - Left/right arrow buttons disappear from the tab order when at the rail extremes.
> - `npm test` passes (no a11y regressions in the existing Vitest + vitest-axe suite).

---

## Prompt 4 — Raise text-on-dark contrast to WCAG AA on hero, `LocationStrip`, services rail

> **Codex prompt:**
>
> Several places use `text-white/55`, `text-white/60`, `text-white/65` for body or supporting copy on dark backgrounds. Against `#06070a` (hero) or `#0a0908` (services / location strip), these compute to contrast ratios in the 3.2–4.1 range, which is below WCAG AA's 4.5:1 requirement for normal text. The brand accent green `text-[#4ADE80]` against `#0a0908` is fine (>9:1); the white-with-alpha values are the offenders.
>
> Replace every `text-white/55`, `text-white/60`, `text-white/65` used for body or label text on a dark background with `text-white/80` (5.3:1 on `#06070a`) or `text-white/90` for the smallest type. Decorative dividers / hairlines may stay at `/40` or below.
>
> Specific files and lines to fix:
>
> 1. `pages/Home.tsx`:
>    - Hero status pill: `text-white/90` is fine.
>    - Hero kicker `<h2 className="font-heading text-xl font-bold tracking-wide text-white/80 …">` — keep or raise to `text-white`.
>    - Hero subhead `<span className="block">` inside `border-l-2 border-brand-accent` — currently `text-white/80`, OK.
>    - Marquee items inside hero pill: `text-white/90` — OK.
>    - Services rail card descriptions: `text-white/65` → change to `text-white/85`. Hover state `group-hover:text-white/80` → `group-hover:text-white`.
>    - Inside `HorizontalScroll` header: `text-white/60` on the helper paragraph → `text-white/85`.
> 2. `components/home/LocationStrip.tsx`:
>    - "Visit our / office." italic: `text-white/60` → `text-white/85`.
>    - Contact card labels: `text-white/50` → `text-white/75`.
>    - Contact card border `border-white/10` and `border-white/5` are decorative — leave.
> 3. `components/home/StarField.tsx` — no text changes, but verify the nebula colour and star alphas don't render any text behind them. They don't, so no change.
>
> Run `npm test`. If `vitest-axe` is wired to any home-page test, it will now stop flagging contrast issues for these elements.
>
> **Acceptance checks:**
>
> - On dark sections, no body text computes below 4.5:1 against its actual background (use the Chrome DevTools "Inspect" → Contrast picker on each changed element).
> - Visual diff: type feels slightly brighter but the editorial mood is preserved — the goal is legibility, not punchy whites everywhere.

---

## Prompt 5 — Replace hard-coded hex colors on the home page with Tailwind theme tokens

> **Codex prompt:**
>
> The home page composition uses ad-hoc hex colors that bypass the existing brand tokens in `tailwind.home.config.ts` / `tailwind.config.ts`. This makes future palette changes a search-and-replace exercise and lets the design drift over time.
>
> Audit and replace, file by file:
>
> 1. **`pages/Home.tsx`**:
>    - `text-[#E8F5E9]` (on "Advisory." em) → add a new token `brand-paper-mint` in `tailwind.home.config.ts` (`'#E8F5E9'`) and use `text-brand-paper-mint`.
>    - `shadow-[0_0_12px_brand-accent]` is an **invalid Tailwind arbitrary value** — `brand-accent` is a token name, not a CSS color literal, so the shadow is not rendering. Replace with `shadow-[0_0_12px_var(--color-brand-accent)]` if you expose the token via CSS variable, or with a hex literal (e.g. `shadow-[0_0_12px_#4ADE80]`). The current code silently produces no shadow on the status-pill dot.
> 2. **`components/home/ChaosToOrder.tsx`**: all inline hex colors `#0a0908`, `#b8924c`, `#8b3a2f`, `#f4f1ea`, `#e5dfd0`, `#f5ecd6`, `#fbf7ec`, `#1A4D2E`, `#f8f5ec` — these are the Zone B palette and are already documented in the file header. Either:
>    - Promote them to tokens in `tailwind.home.config.ts` (`brand-ink`, `brand-brass`, `brand-rust`, `brand-paper`, `brand-paper-warm`, `brand-paper-yellowed`, `brand-paper-cream`, `brand-moss-deep`, `brand-paper-cream-2`) and replace usages, OR
>    - Move all of them into a single `colors` object exported from `components/home/ChaosToOrder.tsx` and reference that object from inline styles. The component-scoped palette is intentional — it's an editorial set — so option B is acceptable if the tokens are not used elsewhere. Pick option B if these hex codes appear only in this one file; otherwise option A.
> 3. **`components/home/LocationStrip.tsx`**:
>    - `bg-brand-moss/20`, `bg-[#4ADE80]/10`, `text-[#4ADE80]`, `bg-[#4ADE80]/20` — `#4ADE80` is the brand accent green. Add `brand-accent: '#4ADE80'` to `tailwind.config.ts` if not already there, then replace these with `text-brand-accent`, `bg-brand-accent/10`, `bg-brand-accent/20`.
> 4. **`components/home/StarField.tsx`**: `const BG = '#06070a'`, `const NEBULA_COLOR = 'rgba(90,110,180,0.06)'`. These are canvas-painted, not CSS — leave them as JS constants but extract them to a named export at the top of the file (`export const STARFIELD_BG`, `export const STARFIELD_NEBULA`) so any downstream consumer (e.g. the `index.html` preload hero) reads from a single source of truth.
> 5. **`index.html`**: the `#preload-hero { background: #06070a; }` value must match `STARFIELD_BG`. Add an HTML comment immediately above the rule pointing to `components/home/StarField.tsx` and a CI guard in `scripts/check-csp-hash.ts` (or a new `scripts/check-preload-hero.ts`) that reads both values and fails the build if they drift apart.
>
> Do not touch the tokens used inside the dark services rail card hover gradient (`from-white/5 to-transparent`) — those are alpha values on neutrals and changing them risks visual regression.
>
> **Acceptance checks:**
>
> - `grep -nE "#[0-9a-fA-F]{3,8}" pages/Home.tsx components/home/*.tsx` returns zero results, or only entries inside the new `colors` object you introduced.
> - The hero status pill now shows the green halo around the pulsing dot (verify visually).
> - `npm run build` succeeds; visual snapshot of `/` matches the previous design within tolerance.

---

## Prompt 6 — Rewrite `ChaosToOrder` idle drift as a pure CSS animation

> **Codex prompt:**
>
> `components/home/ChaosToOrder.tsx` runs a `requestAnimationFrame` loop that calls `setDivider(50 + Math.sin(t) * 1.2)` every frame until the user interacts. Each tick triggers a React render, an inline style mutation on the divider line and the clip-path on the Order layer, and a paint. This is wasteful for a 1.2% sine wobble.
>
> Refactor so the idle drift is a CSS animation on the **divider line and the Order-pane clip-path**, driven by a single CSS custom property `--divider`. React state only takes over after the user actually drags, taps, or keys.
>
> Concretely:
>
> 1. Replace the `divider` state with a `dividerRef = useRef<HTMLDivElement>(null)` pointing at the container, plus a CSS variable `--divider` set on that container.
> 2. While `!hasInteracted && !prefersReduced`, the container gets a class `chaos-drift` that animates `--divider` via:
>
>    ```css
>    @keyframes chaos-drift {
>      0%,
>      100% {
>        --divider: 51.2%;
>      }
>      50% {
>        --divider: 48.8%;
>      }
>    }
>    .chaos-drift {
>      animation: chaos-drift 7s ease-in-out infinite;
>    }
>    @property --divider {
>      syntax: '<percentage>';
>      inherits: false;
>      initial-value: 50%;
>    }
>    @media (prefers-reduced-motion: reduce) {
>      .chaos-drift {
>        animation: none;
>      }
>    }
>    ```
>
>    Add these rules to `index.css` (or a new `components/home/ChaosToOrder.css` imported at the top of the component).
>
> 3. The Order pane's `clipPath` and the divider line's `left` both read from `var(--divider)` directly, no inline style:
>
>    ```tsx
>    <div className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 var(--divider))', WebkitClipPath: 'inset(0 0 0 var(--divider))' }}>
>      <OrderPane />
>    </div>
>    <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-[#0a0908]/40" style={{ left: 'var(--divider)' }} />
>    <button … style={{ left: 'var(--divider)' }} … />
>    ```
>
> 4. On the first user interaction (`onContainerPointerDown`, `onHandlePointerDown`, `onHandleKeyDown`), remove the `chaos-drift` class and switch to imperative writes: `containerRef.current.style.setProperty('--divider', `${pct}%`)`. Keep the `aria-valuenow` and the slider semantics — store the current numeric value in a ref so the keyboard handler can read it without a re-render.
> 5. Replace the existing `IntersectionObserver` that started/stopped the rAF loop with `content-visibility: auto` on the outer section — the CSS animation will automatically pause when off-screen via Browser optimisations, no manual work needed.
> 6. Delete the now-unused `useEffect`, `setDivider`, `divider` state. Keep `hasInteracted`, `isDragging`, and the React state for those — they're only set on real events, not every frame.
>
> **Acceptance checks:**
>
> - Open `/`, scroll to ChaosToOrder, and watch in Chrome DevTools Performance → JS calls. Before this change there are ~60 React renders/sec; after, there should be 0 until you interact.
> - The divider still wobbles ±1.2% on a ~7s cycle until the first interaction, then snaps to wherever the user puts it.
> - Reduced-motion users see no wobble (verify by toggling `prefers-reduced-motion` in DevTools → Rendering).
> - Keyboard slider (left/right/Home/End) still works and updates `aria-valuenow`.

---

## Prompt 7 — FAQ preview: render first item open on the server-side default; eliminate the mount flash

> **Codex prompt:**
>
> `components/home/FAQPreview.tsx` initialises `openIndex` to `null` and then opens the first item via:
>
> ```ts
> useEffect(() => {
>   if (window.matchMedia('(min-width: 768px)').matches) {
>     setOpenIndex(0);
>   }
> }, []);
> ```
>
> This causes a visible "all collapsed → first opens" flash on desktop first paint. It also bakes the viewport-at-mount into state — a user who resizes the window won't see the behaviour update.
>
> Fix:
>
> 1. Replace the empty initial state with a lazy initialiser that reads `window.matchMedia` on first render (still client-only — the site is SPA-only so SSR is not a concern):
>
>    ```ts
>    const [openIndex, setOpenIndex] = useState<number | null>(() => {
>      if (typeof window === 'undefined') return null;
>      return window.matchMedia('(min-width: 768px)').matches ? 0 : null;
>    });
>    ```
>
> 2. Remove the `useEffect` that called `setOpenIndex(0)` after mount.
> 3. Add `aria-controls` linking each FAQ button to its panel, and give the panel an `id` and `role="region"` with `aria-labelledby` pointing back to the button. Currently the button has `aria-expanded` but no `aria-controls`, so screen readers don't know what is being expanded:
>
>    ```tsx
>    const panelId = `faq-preview-panel-${index}`;
>    const buttonId = `faq-preview-button-${index}`;
>    // button
>    <button
>      id={buttonId}
>      aria-expanded={isOpen}
>      aria-controls={panelId}
>      onClick={onToggle}
>      …
>    >
>    // panel
>    <div
>      id={panelId}
>      role="region"
>      aria-labelledby={buttonId}
>      ref={panelRef}
>      …
>    >
>    ```
>
> 4. Replace the JS-driven height animation with `interpolate-size: allow-keywords` + `height: 0 → auto` transitions where supported, falling back to the existing scrollHeight measurement only when `CSS.supports('interpolate-size', 'allow-keywords')` is false. The current measurement code has cached-height logic and a double `requestAnimationFrame` — fine as a fallback, but unnecessary in modern Chromium.
>
>    ```ts
>    const supportsAutoHeight = typeof CSS !== 'undefined' && CSS.supports('interpolate-size', 'allow-keywords');
>    ```
>
>    If `supportsAutoHeight`, set `style.height = isOpen ? 'auto' : '0px'` directly and let CSS transition handle the rest. Add `transition: height 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms;` and `interpolate-size: allow-keywords` to the panel's style.
>
> **Acceptance checks:**
>
> - First paint on desktop shows the first FAQ already open; no flash, no layout shift.
> - On mobile, all FAQs start closed (CLS = 0 either way).
> - Screen readers announce "Expanded, [panel content]" when an FAQ is opened.

---

## Prompt 8 — Use the SITE_URL constant in JSON-LD; sync `theme-color` with the hero

> **Codex prompt:**
>
> Two small but visible inconsistencies:
>
> 1. `pages/Home.tsx`'s `schema` constant hardcodes `'https://casagar.co.in'` in five places (`@id`, `url`, `logo.url`, `image`, the WebSite block). The rest of the site uses `SITE_URL` from `config/site.ts`, which defaults to the same value but is overridable via `VITE_SITE_URL` for staging deploys. Replace every hardcoded `'https://casagar.co.in'` inside the `schema` object with `${SITE_URL}`. The file already imports `SITE_URL` — just use it. Example:
>
>    ```ts
>    const schema = {
>      '@context': 'https://schema.org',
>      '@graph': [
>        {
>          '@type': 'AccountingService',
>          '@id': `${SITE_URL}/#organization`,
>          name: CONTACT_INFO.name,
>          url: SITE_URL,
>          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
>          image: `${SITE_URL}/og/og-default.png`,
>          // …
>        },
>        {
>          '@type': 'WebSite',
>          '@id': `${SITE_URL}/#website`,
>          url: SITE_URL,
>          name: CONTACT_INFO.name,
>          publisher: { '@id': `${SITE_URL}/#organization` },
>        },
>      ],
>    };
>    ```
>
>    While editing the schema, also add:
>    - `priceRange: '₹₹'` on the `AccountingService` node (Google Business Profile reads this).
>    - `dateModified: new Date().toISOString().slice(0, 10)` on the `WebSite` node, set from a static build-time constant if you don't want it to rebuild every minute — easiest is to import the last commit date from `import.meta.env.VITE_BUILD_DATE` set in `vite.config.ts`.
>    - `availableLanguage: CONTACT_INFO.languages` on the `AccountingService` node.
>
> 2. `index.html` sets `<meta name="theme-color" content="#1A4D2E" />` (moss green). The hero is `#06070a` (near-black). On mobile, the iOS / Android address bar tints to moss green while the page is near-black — a jarring mismatch. Either:
>    - Change the meta to the hero colour: `<meta name="theme-color" content="#06070a" media="(prefers-color-scheme: dark)" />` and add a `light` variant `<meta name="theme-color" content="#F2F2F0" media="(prefers-color-scheme: light)" />`, OR
>    - Keep moss green as a brand statement and accept the mismatch.
>
>    Pick option A — the dark hero is the dominant first impression on a phone.
>
> **Acceptance checks:**
>
> - `grep -n "casagar.co.in" pages/Home.tsx` returns zero hits (except inside string templates that use `SITE_URL`).
> - Google's Rich Results test parses the home page schema with no errors.
> - On a real phone, the address bar matches the hero background on first load.

---

## Prompt 9 — Clean up the Home composition: section comments, duplicate classes, redundant wrappers

> **Codex prompt:**
>
> Tidy `pages/Home.tsx` so the file reads cleanly. None of these change behaviour, but they remove signals of half-finished work that a careful reader will notice.
>
> Concretely:
>
> 1. The numbered section comments are `1, 2, 3, 4, 5, 7, 8, 9, 11` — `6` and `10` are missing. Renumber the comments in order starting at 1, and delete the trailing-newline gap between blocks. The current set is:
>    - 1. Cinematic hero
>    - 2. ChaosToOrder
>    - 3. Founder section
>    - 4. Services horizontal scroll
>    - 5. Trust bar
>    - 7. Recent insights → 6
>    - 8. FAQ preview → 7
>    - 9. Marquee → 8
>    - 11. Location strip → 9
> 2. The hero `<section>` has `min-h-[100svh] min-h-screen` — both classes resolve to the same property. Keep only one. Prefer `min-h-[100dvh]` (dynamic viewport units, falls back to `100vh` in Tailwind) which is more correct for mobile chrome that resizes. So the final class string for that section is:
>
>    ```html
>    <section
>      data-hero-dark
>      class="relative flex min-h-[100dvh] flex-col justify-start overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-32 md:justify-center md:px-6 md:pb-0 md:pt-20"
>    ></section>
>    ```
>
> 3. Multiple sections have BOTH the `LazyHomeSection` wrapper and a `[content-visibility:auto]` class on their inner `<section>` element. The wrapper already applies `content-visibility: auto` via its `className`. Remove the redundant `[contain-intrinsic-size:auto_…px] [content-visibility:auto]` from the inner `<section>` elements for:
>    - Services rail (`relative z-30 bg-brand-black …`)
>    - Recent insights (`relative overflow-hidden border-t border-brand-border/60 bg-white …`)
>
>    These were duplicated when `LazyHomeSection` was introduced. Same applies to the `[contain-intrinsic-size:auto_900px] [content-visibility:auto]` on the standalone `<div>` around `ChaosToOrder` — that section already uses an internal `IntersectionObserver` for its drift loop, so the outer `content-visibility` is fine, but the wrapping `<div>` could be replaced with `<LazyHomeSection intrinsicSize="auto 900px" rootMargin="200px 0px">` for consistency.
>
> 4. The `recentInsights` block sits inside `{recentInsights.length > 0 && (…)}`. If `useInsights()` is async and starts as empty, the block is unmounted on first render and the page jumps when it mounts. Either:
>    - Always render a `<LazyHomeSection intrinsicSize="auto 700px">` placeholder and conditionally render its children, OR
>    - Wait for `insights.loading` from `useInsights()` if it exists, and render a skeleton.
>
>    Pick option A (cheaper, no skeleton needed for a 700px hint).
>
> 5. Update the JSDoc-style header on each section to match the new numbering, and delete commentary that no longer applies (the long "items-start so the heading and caption hug the left edge instead of being pushed right by the desktop `items-end` baseline" paragraph belongs in the component, not the consumer — move it to `HorizontalScroll.tsx` if it's not already there, then delete from `Home.tsx`).
>
> **Acceptance checks:**
>
> - `npm run lint` and `npm test` pass.
> - `pages/Home.tsx` reads top-to-bottom as 9 numbered sections, in order, with no decorative gaps in numbering and no duplicate utility classes.
> - The hero is exactly one min-height class on mobile and desktop.

---

## Prompt 10 — TrustBar: don't hide trust signals until hover

> **Codex prompt:**
>
> `components/home/TrustBar.tsx` currently dims and desaturates the entire industries row on desktop (`lg:opacity-60 lg:grayscale lg:hover:opacity-100 lg:hover:grayscale-0`) and only restores it on hover. This is a common editorial-styling habit that backfires on a trust bar: the whole point is for the visitor to read the sectors at a glance, not to find them after a mouse-over.
>
> Remove the conditional dimming. Keep the icons readable on first paint. If the design needs a subtler treatment than full-strength brand colour, lower the _icon_ container background contrast rather than greying out the text.
>
> Concretely, replace the outer wrapper class:
>
> ```tsx
> <div className="flex flex-wrap justify-center gap-4 transition-all duration-500 md:gap-16 lg:opacity-60 lg:grayscale lg:hover:opacity-100 lg:hover:grayscale-0">
> ```
>
> with:
>
> ```tsx
> <div className="flex flex-wrap justify-center gap-4 md:gap-16">
> ```
>
> Inside each industry block, swap `bg-brand-bg` for `bg-brand-bg/60` if the icons feel too loud — that's a one-line tuning step, not a hidden-by-default pattern. Keep the existing `group-hover:text-brand-moss` transition for the desktop hover state — that's a fine reward, not a prerequisite for legibility.
>
> Also: above the icons, the eyebrow text `"Trusted advisor to businesses across sectors"` is `<p>` — promote it to a real heading for the section. Wrap the `<section>` content with `<h2 className="sr-only">Industries we serve</h2>` to give the bar a heading without changing visuals, and keep the existing decorative eyebrow as an `aria-hidden="true"` `<p>`.
>
> **Acceptance checks:**
>
> - On desktop, all industry names and icons are at full opacity / colour on first paint.
> - Screen readers announce "Industries we serve" as an h2 region before the icons.
> - No JS or hover state is required to read the trust bar.

---

## Prompt 11 — Reveal: cheaper transition properties; remove forced reflow risk

> **Codex prompt:**
>
> `components/Reveal.tsx` uses `transitionProperty: 'all'`. That transitions every animatable property — layout-affecting ones included — which is more expensive than transitioning only `transform, opacity`. The component animates exactly those two properties, so the `'all'` is gratuitously broad.
>
> Also, the `reveal-mask` variant uses an overflow-hidden wrapper and translates the inner element from `translate(0, 100%)` to `translate(0, 0)`. That's fine, but the wrapper has no explicit dimensions on first render, which can cause a 1-frame layout shift in some Safari versions.
>
> Fix:
>
> 1. Change the style object in `Reveal.tsx` to:
>
>    ```ts
>    const style = {
>      transitionProperty: 'transform, opacity',
>      transitionDuration: shouldReduceMotion ? '0s' : `${duration}s`,
>      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
>      transitionDelay: shouldReduceMotion ? '0s' : `${delay}s`,
>      opacity: getOpacityStyle(),
>      transform: getTransformStyle(),
>      willChange: shouldReduceMotion ? undefined : 'transform, opacity',
>    };
>    ```
>
>    Adding `will-change: transform, opacity` on the animated wrapper gives the browser permission to promote each Reveal to its own compositor layer for the duration of the animation. Drop `will-change` on completion using a `transitionend` listener (otherwise long-lived `will-change` is itself a perf liability):
>
>    ```ts
>    useEffect(() => {
>      if (!isVisible) return;
>      const el = ref.current;
>      if (!el) return;
>      const onEnd = (e: TransitionEvent) => {
>        if (e.propertyName !== 'transform') return;
>        el.style.willChange = 'auto';
>      };
>      el.addEventListener('transitionend', onEnd, { once: true });
>      return () => el.removeEventListener('transitionend', onEnd);
>    }, [isVisible]);
>    ```
>
> 2. Audit `Reveal.tsx` once more for any synchronous DOM read after a mutation (e.g. `el.offsetWidth` to flush a reflow before starting a transition). If found, wrap the read in `requestAnimationFrame`. The Lighthouse report quoted in `PERF-CODEX-PROMPTS.md` blames `index.js` for ~109 ms of forced-reflow time, and Reveal is the most plausible source.
> 3. For the `reveal-mask` variant, add an explicit `minHeight` of `1lh` on the wrapper so the mask line-clip doesn't collapse to zero on first frame:
>
>    ```tsx
>    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, minHeight: '1lh' }}>
>    ```
>
> **Acceptance checks:**
>
> - DevTools Performance recording on `/` shows Reveal compositor layers being promoted only when animating, then released.
> - No new CLS regressions on first paint.
> - Lighthouse desktop run shows reduced TBT and reduced forced-reflow attribution to `index.js`.

---

## Prompt 12 — Marquee inside the hero: don't duplicate the services link list

> **Codex prompt:**
>
> The hero's inner pill currently runs a `Marquee` of `SERVICES.map(s => s.title)`. Two sections down (`HorizontalScroll`) the user sees the same services as full cards. Below the FAQ, the page runs the default `Marquee` again (`DEFAULT_ITEMS = ['Statutory Audit', 'Direct Tax', 'GST', 'Company Law', 'Business Advisory', 'Internal Audit']`) — which is essentially the same list a third time.
>
> The hero marquee is doing emotional work (it animates and feels alive) but it's not informational because the services rail does that better. The bottom marquee is doing decorative work but it's the third time we've named the same offerings.
>
> Pick one of:
>
> 1. **Recommended:** keep the hero marquee for kinetic interest, change its items to softer practice-area phrases that complement rather than duplicate the services list (e.g. `['Notice replies', 'Faceless assessments', 'Statutory audit', 'GST returns', 'TDS / TCS', 'ROC filings', 'CMA reports', '15CB / 15CA']`). Keep the bottom Marquee, but change its content to client-friendly phrasing (`['Returns filed on time', 'Reconciled to the rupee', 'Books that close every month', 'Notices answered, not ignored', 'Audits without surprises']`) — sentiment statements that don't overlap with the cards.
> 2. Delete the bottom Marquee entirely and use the rescued vertical space for a small "Talk to us" rail with the founder portrait + a single CTA.
>
> Pick option 1 unless you want to lose a section.
>
> Concretely, edit `pages/Home.tsx`:
>
> - Replace the hero Marquee `items={SERVICES.map((service) => service.title)}` with a new constant in `constants/services.tsx`:
>
>   ```ts
>   export const HERO_MARQUEE_ITEMS = [
>     'Notice replies',
>     'Faceless assessments',
>     'Statutory audit',
>     'GST returns',
>     'TDS / TCS',
>     'ROC filings',
>     'CMA reports',
>     '15CB / 15CA',
>   ] as const;
>   ```
>
> - Replace `DEFAULT_ITEMS` in `components/Marquee.tsx` with a `FOOT_MARQUEE_ITEMS` constant exported from `constants/marquee.ts` (new file), containing the sentiment statements above. Update the bottom `Marquee` usage to pass these explicitly.
> - Run `npm run lint:schema` to make sure the structured-data export still validates.
>
> **Acceptance checks:**
>
> - The home page no longer names the same service in three places.
> - The hero marquee still animates and reads as kinetic — its items are now finer-grained than the cards, not a replica.
> - Visual diff is a content change only.

---

## Prompt 13 — `BigCTA` and copy: make the primary CTA unambiguous

> **Codex prompt:**
>
> The hero primary CTA reads `Engage the practice` in italic Fraunces. It's elegant and on-brand but it's also unusual phrasing for a CA firm site — users who land from a search like "CA in Mysuru for GST" want a button that says what it does. The italic-only treatment also loses visual weight against the headline.
>
> Two changes:
>
> 1. Change the CTA label to `Book a consultation` (or `Start a conversation` if you want to keep some warmth). The italic styling stays — it's a brand signal — but the words have to do the click-bait work.
> 2. The `BigCTA` component currently has `tone="paper"` rendering a paper-coloured outline with a paper-coloured hover fill (which becomes invisible against the dark hero background). Add a `dark` variant where the resting state is paper-on-transparent and the hover fill is paper-on-paper-ink (so the contrast inverts on hover): edit `components/ui/BigCTA.tsx` to add a new tone:
>
>    ```ts
>    case 'paper-on-dark':
>      return {
>        container: 'border-brand-paper text-brand-paper bg-transparent',
>        fillBg: 'bg-brand-paper',
>        labelOnFill: 'group-hover:text-brand-ink',
>      };
>    ```
>
>    and switch the hero CTA to `tone="paper-on-dark"`.
>
> 3. While editing `BigCTA`, give the disabled state an `aria-disabled` attribute (currently only `disabled` is set on the `<button>`, but the `<Link>` and `<a>` branches don't surface the disabled state at all). For `<Link>` and `<a>`, render a `<span role="button" aria-disabled="true" tabIndex={-1}>` instead when `disabled` is true — `<Link>` doesn't accept a `disabled` prop and React-Router will navigate anyway today.
>
> **Acceptance checks:**
>
> - Hero CTA reads `Book a consultation`, sits on a transparent rounded border, and fills to paper-on-ink on hover with a smooth scale.
> - `<BigCTA to="/x" disabled>…</BigCTA>` renders something non-navigable with `aria-disabled="true"`.
> - No regressions on other pages that use `BigCTA` — search the repo with `grep -rn "BigCTA" pages components` and visually QA each call site.

---

## Prompt 14 — StarField: cap pixel-density on high-DPR mobile

> **Codex prompt:**
>
> `components/home/StarField.tsx` sizes its canvas to `clientWidth * devicePixelRatio`. On a 3× device (most modern Androids and recent iPhones) and a 400 × 800 viewport, that allocates 1200 × 2400 = ~2.9M canvas pixels. The fill-rect + nebula + 90 stars + 20 mid-stars + occasional shooter loop pays a per-frame cost proportional to that surface.
>
> Cap DPR at 2 for the StarField canvas. The visual difference between DPR 2 and DPR 3 for soft star dots is imperceptible; the GPU cost is not.
>
> Concretely:
>
> 1. In `StarField.tsx`, replace every:
>
>    ```ts
>    const dpr = window.devicePixelRatio || 1;
>    // …
>    canvas.width = w * dpr;
>    canvas.height = h * dpr;
>    ctx.scale(dpr, dpr);
>    ```
>
>    with:
>
>    ```ts
>    const dpr = Math.min(window.devicePixelRatio || 1, 2);
>    // …
>    canvas.width = Math.round(w * dpr);
>    canvas.height = Math.round(h * dpr);
>    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
>    ```
>
>    (`setTransform` is already used in the animated path — apply the same in `drawStatic`.)
>
> 2. While in this file, lower the mobile star counts further on `liteMode`: `backStars: 60` and `midStars: 14` for the lite path. The static branch is what most low-end / save-data users will see; it doesn't animate, but the seed count still affects paint cost.
> 3. The `IntersectionObserver` already pauses the loop when off-screen. Add a `document.visibilityState !== 'visible'` check at the top of `loop()` to also pause when the tab is backgrounded — `requestAnimationFrame` already throttles on most browsers, but explicit is cheaper.
> 4. Verify the canvas still fills the hero correctly on resize and orientation change.
>
> **Acceptance checks:**
>
> - On a real 3× phone, DevTools Performance recording shows reduced GPU compositing time for the hero.
> - The StarField visually looks identical to before on retina screens.
> - The static (reduced-motion / save-data) variant still draws all stars.

---

## Prompt 15 — Surface a quick-contact bar above the fold for non-cinematic visitors

> **Codex prompt:**
>
> The hero takes the full viewport. Phone and email are reachable only after either (a) opening the navbar menu, (b) scrolling all the way to the `LocationStrip`, or (c) using the floating WhatsApp button. For a CA firm site, a fast contact path is the whole game. Add a discreet always-visible quick-contact line in the hero — below the marquee pill, above the fold on a 6.7" phone.
>
> Concretely, in `pages/Home.tsx` hero (after the existing Reveal with the marquee pill, before the closing `</section>`), add:
>
> ```tsx
> <Reveal delay={0.75} className="mt-10 md:mt-12">
>   <div className="flex flex-col items-start gap-3 text-xs font-medium uppercase tracking-[0.2em] text-white/70 sm:flex-row sm:items-center sm:gap-6">
>     <a
>       href={`tel:${CONTACT_INFO.phone.value}`}
>       className="group inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
>     >
>       <Phone size={14} aria-hidden="true" />
>       <span>{CONTACT_INFO.phone.display}</span>
>     </a>
>     <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:inline-block" />
>     <a
>       href={`mailto:${CONTACT_INFO.email}`}
>       className="group inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
>     >
>       <Mail size={14} aria-hidden="true" />
>       <span>{CONTACT_INFO.email}</span>
>     </a>
>     <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:inline-block" />
>     <span className="inline-flex items-center gap-2 text-white/55">
>       <MapPin size={14} aria-hidden="true" />
>       <span>{CONTACT_INFO.hours.display}</span>
>     </span>
>   </div>
> </Reveal>
> ```
>
> Import `Phone`, `Mail`, `MapPin` from `lucide-react` (or use the icons already imported elsewhere in the file). The colour `text-white/55` on hours respects the contrast fix from Prompt 4 only if hours is non-essential — bump it to `text-white/70` if the contrast linter flags it.
>
> This block should NOT be inside the existing `Reveal` that wraps the headline — keep it as a sibling so its appearance is independent of the cinematic animation cascade.
>
> **Acceptance checks:**
>
> - On a 390 × 844 viewport (iPhone 14 Pro), phone + email are visible without scrolling.
> - Tabbing from the headline lands on the CTA, then the marquee, then phone, then email.
> - The floating WhatsApp button is still present but no longer carries the entire weight of "how do I reach them."

---

## Prompt 16 — Add real performance / a11y tests for the home page

> **Codex prompt:**
>
> Add a Vitest test file `pages/Home.test.tsx` that uses `@testing-library/react` and `vitest-axe` to guard against regressions in the items fixed by Prompts 1–15. The dependencies (`@testing-library/react`, `@testing-library/jest-dom`, `vitest-axe`, `jsdom`) are already in `package.json` devDependencies.
>
> The test file must:
>
> 1. Render the `<Home />` page wrapped in `<MemoryRouter>` and the providers it needs (`ToastProvider`, `AnnounceProvider`).
> 2. Assert exactly one `<h1>` exists with an accessible name matching `/Chartered Accountants in Mysuru/`.
> 3. Assert that `axe(container)` returns no violations (with the default ruleset). Reduced-motion can be set on JSDOM via `window.matchMedia` mock if any flake appears.
> 4. Assert that the visible service titles appear in document order (`Audit & Assurance`, `GST Registration & Filing`, `Income Tax Services`, etc.) — this guards against the section-numbering / composition cleanup from Prompt 9.
> 5. Mock `IntersectionObserver` and `ResizeObserver` (StarField, ChaosToOrder, HorizontalScroll, Reveal all touch them); see `vitest.d.ts` for the existing pattern. If a mock isn't already provided, add one in `vitest.setup.ts`.
> 6. Add an `npm run test:a11y` script in `package.json` that runs `vitest --run pages/Home.test.tsx` — useful for CI gating.
>
> Skeleton:
>
> ```tsx
> import { render, screen } from '@testing-library/react';
> import { MemoryRouter } from 'react-router-dom';
> import { axe } from 'vitest-axe';
> import { ToastProvider } from '../context/ToastContext';
> import { AnnounceProvider } from '../context/AnnounceContext';
> import Home from './Home';
>
> describe('Home page', () => {
>   const renderHome = () =>
>     render(
>       <MemoryRouter>
>         <AnnounceProvider>
>           <ToastProvider>
>             <Home />
>           </ToastProvider>
>         </AnnounceProvider>
>       </MemoryRouter>,
>     );
>
>   it('has exactly one h1 naming the practice', () => {
>     renderHome();
>     const headings = screen.getAllByRole('heading', { level: 1 });
>     expect(headings).toHaveLength(1);
>     expect(headings[0]).toHaveAccessibleName(/Chartered Accountants in Mysuru/);
>   });
>
>   it('has no axe violations', async () => {
>     const { container } = renderHome();
>     expect(await axe(container)).toHaveNoViolations();
>   });
> });
> ```
>
> **Acceptance checks:**
>
> - `npm test` passes; `npm run test:a11y` passes.
> - Re-running after intentionally reverting Prompt 1 (deleting the h1) makes the first test fail. Re-revert.

---

## Things I deliberately did NOT prompt for

- **Rewriting the entire visual system.** The Zone B paper / Zone A ink split is intentional, recognisable, and a competitive differentiator in the CA firm category. Keep it.
- **Removing the cinematic hero.** Lighthouse may want it gone; the brand needs it. The PERF prompts already on disk show you can keep the hero AND hit a 95+ score by removing JS-gated paint.
- **Adding a chatbot.** The WhatsApp float covers the same need at a fraction of the complexity.
- **Adding case studies / testimonials section.** Real ones would be welcome; fake ones are worse than nothing for a regulated profession. Defer until you have signed-off quotes.

## Suggested order of execution

For a 1–2 day pass with Codex: 1 → 2 → 3 → 4 → 8 → 9 → 7 → 13 → 15 → 16. That sequence ships the high-impact a11y + SEO + security wins first, the visible UX improvements next, and the test guardrails last.

For a follow-up pass: 5 → 6 → 10 → 11 → 12 → 14. These are polish and perf — each is small but they compound.
