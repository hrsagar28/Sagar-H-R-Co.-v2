# Home page — Round 2 review and Codex prompts

Re-audit after the first-round fixes. This pass:

- Confirms what landed cleanly,
- Lists round-1 items still outstanding,
- Adds new issues that only became visible after the cleanup.

## What landed cleanly (round 1 → round 2)

These can be considered closed. No further work needed.

- **h1 fix** — the visible "Audit. / Taxation. / Advisory." stack is now the real `<h1>` with an `aria-label` describing the practice, and the inner spans are `aria-hidden`. `VisuallyHidden` no longer in `Home.tsx`. The kicker "Sagar H R & Co." correctly demoted to `<p>`.
- **CSP hardening** — `style-src-elem 'self' 'sha256-…'` is in place. `Permissions-Policy` now includes `payment`, `usb`, `interest-cohort`.
- **HorizontalScroll keyboard correctness** — arrow buttons now toggle `aria-hidden` / `tabIndex` / `inert` at the rail extremes. The `focusin` handler centres focused cards on desktop. Service cards have `focus-visible` rings against the dark rail.
- **Contrast bumps** — body and supporting copy on dark sections moved from `text-white/55–/65` to `text-white/85` in hero, services rail, LocationStrip.
- **Token hygiene** — `CHAOS_COLORS` map extracted in `ChaosToOrder`; `brand-paper-mint` added; `LocationStrip` uses `brand-accent`; `STARFIELD_BG` exported and referenced from a comment in `index.html`.
- **ChaosToOrder rewrite** — divider is driven by a `--divider` CSS custom property; idle drift is a `chaos-drift` class; React state only updates `aria-valuenow`. No more per-frame React renders.
- **FAQPreview** — lazy initialiser reads `matchMedia` synchronously; first item is open on desktop with no flash; `aria-controls` and `aria-labelledby` connect buttons to panels.
- **JSON-LD** — `SITE_URL` used throughout; `priceRange`, `availableLanguage`, `dateModified` (from `BUILD_DATE`) added; theme-color split into dark / light media variants.
- **Composition cleanup** — section comments now run 1–9 in order; hero uses a single `min-h-[100dvh]`; duplicate `content-visibility` removed from most inner sections; recent-insights now sits **inside** the `LazyHomeSection` so the placeholder height holds even with zero insights.
- **CTA** — `BigCTA` gained the `paper-on-dark` tone; hero label is `Book a consultation`.
- **StarField perf** — DPR capped at 2; `document.visibilityState !== 'visible'` pauses the loop; static path uses 60 / 14 stars on mobile.
- **Home.test.tsx exists** — one-h1 check, axe pass, services-in-source-order check. Good baseline.

## Outstanding from round 1

Four prompts from the first document were not executed. Each is small and standalone.

### Outstanding-1 — TrustBar still hides itself until hover (round 1 Prompt 10)

`components/home/TrustBar.tsx` line 14 still reads:

```tsx
<div className="flex flex-wrap justify-center gap-4 transition-all duration-500 md:gap-16 lg:opacity-60 lg:grayscale lg:hover:opacity-100 lg:hover:grayscale-0">
```

> **Codex prompt:**
>
> In `components/home/TrustBar.tsx`, remove the `lg:opacity-60 lg:grayscale lg:hover:opacity-100 lg:hover:grayscale-0` classes and the `transition-all duration-500` from the wrapper `<div>` containing the industry icons. The final wrapper class string should be exactly:
>
> ```tsx
> <div className="flex flex-wrap justify-center gap-4 md:gap-16">
> ```
>
> Also add a screen-reader-only heading immediately inside the `<section>` so the bar has a landmark heading. Above the existing eyebrow `<p>`, add:
>
> ```tsx
> <h2 className="sr-only">Industries we serve</h2>
> ```
>
> Then add `aria-hidden="true"` to the existing eyebrow `<p className="… text-brand-dark">Trusted advisor to businesses across sectors</p>` so screen readers don't read both the eyebrow and the sr-only heading.
>
> **Acceptance checks:**
>
> - On desktop, all industry names and icons are at full opacity and full colour on first paint — no hover required.
> - `npm test` passes; the new sr-only `<h2>` does not introduce an axe violation (it is allowed because it is a real landmark heading).

---

### Outstanding-2 — Reveal still uses `transitionProperty: 'all'` (round 1 Prompt 11)

`components/Reveal.tsx` line 123 still reads `transitionProperty: 'all'`. The `will-change` cleanup pattern wasn't added either.

> **Codex prompt:**
>
> In `components/Reveal.tsx`, change the inline `style` object so it only transitions `transform, opacity` and adds a managed `will-change`:
>
> ```ts
> const style: React.CSSProperties = {
>   transitionProperty: 'transform, opacity',
>   transitionDuration: shouldReduceMotion ? '0s' : `${duration}s`,
>   transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
>   transitionDelay: shouldReduceMotion ? '0s' : `${delay}s`,
>   opacity: getOpacityStyle(),
>   transform: getTransformStyle(),
>   willChange: shouldReduceMotion || isVisible ? undefined : 'transform, opacity',
> };
> ```
>
> Then add a `useEffect` that drops `will-change` after the entrance animation finishes (long-lived `will-change` itself becomes a perf liability):
>
> ```ts
> useEffect(() => {
>   if (!isVisible || shouldReduceMotion) return;
>   const el = ref.current;
>   if (!el) return;
>   const inner = variant === 'reveal-mask' ? (el.firstElementChild as HTMLElement | null) : el;
>   if (!inner) return;
>   const onEnd = (e: TransitionEvent) => {
>     if (e.propertyName !== 'transform') return;
>     inner.style.willChange = 'auto';
>   };
>   inner.addEventListener('transitionend', onEnd, { once: true });
>   return () => inner.removeEventListener('transitionend', onEnd);
> }, [isVisible, shouldReduceMotion, variant]);
> ```
>
> For the `reveal-mask` variant, also add `minHeight: '1lh'` to the outer wrapper so the mask line-clip doesn't collapse to zero on first frame in Safari:
>
> ```tsx
> <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, minHeight: '1lh' }}>
> ```
>
> Leave the `WordReveal` subcomponent alone.
>
> **Acceptance checks:**
>
> - DevTools Performance recording on `/` shows compositor layers being promoted only during reveal animation, then released on completion.
> - No new CLS regression on `/`.
> - `npm test` passes.

---

### Outstanding-3 — Services list still appears three times (round 1 Prompt 12)

Hero pill marquee uses `SERVICES.map(s => s.title)`, the services rail shows the same nine titles as full cards, and the bottom `Marquee` defaults to a near-identical list inside `components/Marquee.tsx`:

```ts
const DEFAULT_ITEMS = ['Statutory Audit', 'Direct Tax', 'GST', 'Company Law', 'Business Advisory', 'Internal Audit'];
```

> **Codex prompt:**
>
> Reduce duplication of the services list on the home page by giving the hero marquee and the bottom marquee distinct content.
>
> Concretely:
>
> 1. Create a new file `constants/marquee.ts`:
>
>    ```ts
>    export const HERO_MARQUEE_ITEMS = [
>      'Notice replies',
>      'Faceless assessments',
>      'Statutory audit',
>      'GST returns',
>      'TDS / TCS',
>      'ROC filings',
>      'CMA reports',
>      '15CB / 15CA',
>    ] as const;
>
>    export const FOOT_MARQUEE_ITEMS = [
>      'Returns filed on time',
>      'Reconciled to the rupee',
>      'Books that close every month',
>      'Notices answered, not ignored',
>      'Audits without surprises',
>    ] as const;
>    ```
>
>    Export both from `constants.tsx` by adding `export * from './constants/marquee';` to that barrel file.
>
> 2. In `pages/Home.tsx`, import `HERO_MARQUEE_ITEMS` and `FOOT_MARQUEE_ITEMS`. Change the hero Marquee's `items` prop:
>
>    ```tsx
>    items={HERO_MARQUEE_ITEMS as unknown as string[]}
>    ```
>
>    And change the bottom Marquee to pass items explicitly:
>
>    ```tsx
>    <LazyHomeSection intrinsicSize="auto 220px">
>      <Marquee items={FOOT_MARQUEE_ITEMS as unknown as string[]} ariaLabel="What our practice delivers" />
>    </LazyHomeSection>
>    ```
>
> 3. In `components/Marquee.tsx`, change `DEFAULT_ITEMS` to be the same `FOOT_MARQUEE_ITEMS` (re-import from the new constants file), so a `<Marquee />` with no props still renders something sensible.
> 4. Update `pages/Home.test.tsx` if any assertion happens to rely on the bottom marquee containing service names — it currently does not, so this should be a content-only change.
>
> **Acceptance checks:**
>
> - `git grep "Statutory Audit" -- '*.tsx'` should return no hits inside the home page composition (the words may still appear elsewhere — that's fine).
> - The hero marquee animates with the new fine-grained practice phrases; the bottom marquee shows sentiment statements.
> - `npm test` passes.

---

### Outstanding-4 — Quick-contact bar above the fold (round 1 Prompt 15)

The hero is still full-viewport with no phone / email visible without scrolling. WhatsApp float is the only fast contact path on mobile.

> **Codex prompt:**
>
> In `pages/Home.tsx`, add a discreet quick-contact row inside the hero, after the existing `Reveal` that wraps the marquee pill and before the closing `</div>` of `<div className="max-w-6xl">`.
>
> 1. Add `Phone`, `Mail`, `MapPin` to the existing `lucide-react` import:
>
>    ```tsx
>    import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
>    ```
>
> 2. Add the row immediately after the closing `</Reveal>` that wraps the marquee pill:
>
>    ```tsx
>    <Reveal delay={0.75} className="mt-10 md:mt-12">
>      <div className="flex flex-col items-start gap-3 text-xs font-medium uppercase tracking-[0.2em] text-white/85 sm:flex-row sm:items-center sm:gap-6">
>        <a
>          href={`tel:${CONTACT_INFO.phone.value}`}
>          className="group inline-flex items-center gap-2 rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
>          aria-label={`Call ${CONTACT_INFO.phone.display}`}
>        >
>          <Phone size={14} aria-hidden="true" />
>          <span>{CONTACT_INFO.phone.display}</span>
>        </a>
>        <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:inline-block" />
>        <a
>          href={`mailto:${CONTACT_INFO.email}`}
>          className="group inline-flex items-center gap-2 rounded-sm transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
>          aria-label={`Email ${CONTACT_INFO.email}`}
>        >
>          <Mail size={14} aria-hidden="true" />
>          <span>{CONTACT_INFO.email}</span>
>        </a>
>        <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:inline-block" />
>        <span className="inline-flex items-center gap-2 text-white/75">
>          <MapPin size={14} aria-hidden="true" />
>          <span>{CONTACT_INFO.hours.display}</span>
>        </span>
>      </div>
>    </Reveal>
>    ```
>
> 3. Visually verify on a 390 × 844 viewport (iPhone 14 Pro) and a 1440 × 900 viewport that the row sits comfortably below the marquee pill and is fully visible without scrolling.
>
> **Acceptance checks:**
>
> - Phone and email are reachable in one tap from the landing viewport.
> - Tabbing from the CTA reaches the marquee, phone, email in that order.
> - `npm test` passes (existing axe assertion will still pass — both anchors have accessible names).

---

## New issues found in round 2

Cleanup tends to surface things that were buried before. Each of these is small.

### New-1 — `HorizontalScroll` has a duplicate height class

`components/HorizontalScroll.tsx` line 259:

```tsx
<div className={`${isDisabled ? '' : 'sticky top-0 h-[100dvh] h-screen'} flex flex-col overflow-hidden`}>
```

`h-[100dvh]` and `h-screen` both set `height`. The second wins because it comes later in the class string, defeating the dvh fix.

> **Codex prompt:**
>
> In `components/HorizontalScroll.tsx`, line 259, replace `'sticky top-0 h-[100dvh] h-screen'` with `'sticky top-0 h-screen h-[100dvh]'` so the `100dvh` value wins on browsers that support it while `h-screen` (which Tailwind compiles to `100vh`) acts as a fallback for older browsers. Tailwind's class order matters here because both produce the same CSS property; whichever comes last in the cascade wins.
>
> Or, better, use a single arbitrary value with fallbacks:
>
> ```tsx
> <div className={`${isDisabled ? '' : 'sticky top-0 h-[100vh] h-[100dvh]'} flex flex-col overflow-hidden`}>
> ```
>
> Pick the second form. Remove the `h-screen` token entirely.
>
> **Acceptance checks:**
>
> - On iOS Safari, the sticky pane height does not jump when the bottom URL bar appears / disappears.
> - On a desktop browser with no `dvh` support (unlikely in 2026 but possible), the layout still works because `100vh` is the fallback.

---

### New-2 — `FounderSection` has a real indentation bug at the right column

`components/home/FounderSection.tsx` lines 109–112:

```tsx
          </div>

            {/* Right: Editorial text */}
            <div className="space-y-8">
              <Reveal variant="fade-up">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-moss">Principal</span>
            </Reveal>
```

The `{/* Right: Editorial text */}` comment, the opening `<div className="space-y-8">`, and the first `<Reveal>` are indented two extra spaces relative to their siblings. The closing `</Reveal>` and the `<span>` inside it are at the wrong levels relative to each other.

> **Codex prompt:**
>
> Fix the indentation in `components/home/FounderSection.tsx` lines ~108–145 so the right-column block matches the left-column indentation. After the fix, the structure should read:
>
> ```tsx
>           </div>
>
>           {/* Right: Editorial text */}
>           <div className="space-y-8">
>             <Reveal variant="fade-up">
>               <span className="text-xs font-bold uppercase tracking-widest text-brand-moss">Principal</span>
>             </Reveal>
>
>             <Reveal variant="reveal-mask" delay={0.1}>
>               <h2 className="font-heading text-5xl font-bold leading-[0.9] text-brand-dark md:text-6xl">
>                 Professional <br />
>                 <span className="font-serif font-normal italic text-brand-stone">Expertise.</span>
>               </h2>
>             </Reveal>
>
>             {/* … rest of right column at the same indent level … */}
>           </div>
>         </div>
>       </div>
>     </section>
> ```
>
> Run `npx prettier --write components/home/FounderSection.tsx` to lock the formatting in.
>
> **Acceptance checks:**
>
> - `git diff` shows only whitespace changes.
> - `npm run lint` and `npm test` pass.

---

### New-3 — The hero status-pill dot probably still has no halo

`pages/Home.tsx` line 170:

```tsx
<div className="h-2 w-2 animate-pulse rounded-full bg-brand-accent shadow-[0_0_12px_var(--color-brand-accent)]"></div>
```

This uses the CSS custom property `--color-brand-accent`. Tailwind 3 does **not** expose theme colors as CSS variables by default. Unless `tailwind.home.config.ts` was extended to do so (no evidence it was), this variable is `undefined` at runtime, so the shadow falls back to `none` and the dot has no glow.

> **Codex prompt:**
>
> Verify whether `--color-brand-accent` is actually defined in CSS at runtime. Open `npm run dev`, inspect the hero status-pill dot in DevTools, and check whether `box-shadow` resolves to `0px 0px 12px <colour>` or to `0px 0px 12px <unset>`.
>
> If the variable resolves: leave as-is, but document it. Open `tailwind.home.config.ts` (or the file that defines `brand-accent`) and confirm a CSS variable is exposed via the `theme.colors` config or via `@layer base` in `index.css`. Add a comment in `index.css` documenting that consumers may reference `var(--color-brand-accent)`.
>
> If the variable does NOT resolve (most likely outcome): change line 170 of `pages/Home.tsx` to one of these forms:
>
> **Option A (preferred — works without theme plumbing):**
>
> ```tsx
> <div className="h-2 w-2 animate-pulse rounded-full bg-brand-accent shadow-[0_0_12px_theme('colors.brand.accent')]"></div>
> ```
>
> Tailwind's arbitrary-value `theme()` helper resolves at build time. This requires Tailwind ≥ 3.2 (we are well past that).
>
> **Option B (if `theme()` in arbitrary values is not supported in your Tailwind config):**
>
> ```tsx
> <div className="h-2 w-2 animate-pulse rounded-full bg-brand-accent shadow-[0_0_12px_#4ADE80]"></div>
> ```
>
> Hard-codes the green hex — acceptable here because the accent colour is unlikely to change and is documented elsewhere.
>
> **Acceptance checks:**
>
> - DevTools shows a non-zero, green `box-shadow` on the dot at first paint.
> - The "Mysuru" status pill reads as a glowing dot, not a flat one.

---

### New-4 — `Home.test.tsx` mock for `useInsights` is loose

`pages/Home.test.tsx` lines 15–46 define `mockInsights` inline. The home page reads `insight.author`, `insight.category`, `insight.date`, `insight.readTime`, `insight.summary`, `insight.slug`, `insight.title`, `insight.id` — all covered. But the mock is typed as an array of inline object literals, not as the real `Insight` type. If the type gains a field that the page reads (e.g. `coverImage`), the mock keeps compiling but the home page crashes at runtime in tests.

> **Codex prompt:**
>
> In `pages/Home.test.tsx`, find the existing `mockInsights` definition. Make it typed against the real `Insight` (or whatever the constants export) type so any future required field forces a test update.
>
> 1. Find the type. Run:
>
>    ```
>    git grep -nE "export (interface|type) Insight\b" -- '*.ts' '*.tsx'
>    ```
>
>    Note the file path.
>
> 2. Import the type at the top of `Home.test.tsx`:
>
>    ```ts
>    import type { Insight } from '../constants/insights'; // adjust path to wherever Insight is exported
>    ```
>
> 3. Type the mock:
>
>    ```ts
>    const mockInsights = vi.hoisted((): Insight[] => [
>      {
>        /* … */
>      } satisfies Insight,
>      {
>        /* … */
>      } satisfies Insight,
>      {
>        /* … */
>      } satisfies Insight,
>    ]);
>    ```
>
>    If `vi.hoisted` rejects the generic, alternative:
>
>    ```ts
>    const mockInsights: Insight[] = vi.hoisted(() => [...]);
>    ```
>
>    Fill in any required fields the existing literals are missing.
>
> 4. Run `npm test`. Tests must still pass.
>
> **Acceptance checks:**
>
> - `Home.test.tsx` no longer infers `mockInsights` as `any[]`.
> - If the `Insight` type changes upstream, this test fails at TypeScript compile, not at runtime.

---

### New-5 — Service rail still uses raw Tailwind amber tokens

In the services rail (`pages/Home.tsx` lines 272–311) the eyebrow uses `text-amber-400` and the "View Details" label uses `text-amber-300`. Everywhere else in the file we now reference brand tokens. These two are the last hard-coded Tailwind palette references on the home page.

> **Codex prompt:**
>
> Add a brand brass-light token to the home Tailwind config and use it in place of the raw amber values on the services rail.
>
> 1. Open `tailwind.home.config.ts` (or whichever Tailwind config governs the home page — search with `git grep "brand-paper-mint" -- '*.ts'` and use the same file). In `theme.extend.colors.brand`, add:
>
>    ```ts
>    'brass-light': '#FBBF24',  // matches amber-400 — the eyebrow
>    'brass-soft':  '#FCD34D',  // matches amber-300 — view-details label
>    ```
>
>    Pick exact hex values matching `amber-400` and `amber-300` so this is a no-op visually.
>
> 2. In `pages/Home.tsx`, replace:
>    - `text-amber-400` → `text-brand-brass-light`
>    - `text-amber-300` → `text-brand-brass-soft`
> 3. `git grep -nE "text-amber-(300|400)" -- pages/ components/` — should return zero hits in the home composition. If hits remain elsewhere (e.g. services page), leave them — that's a separate file's concern.
>
> **Acceptance checks:**
>
> - Visual diff: zero. The colours render identically.
> - The home page no longer pulls Tailwind core amber tokens for brand-coloured chrome.

---

### New-6 — StarField liteMode could be lighter on desktop

`components/home/StarField.tsx`'s static path (used when `prefers-reduced-motion` or `liteMode`) seeds `isMobile ? 60 : 180` background stars. For users on a metered connection or `prefers-reduced-motion`, painting 180 background stars on desktop is overkill given they'll never animate.

> **Codex prompt:**
>
> In `components/home/StarField.tsx`, find the `drawStatic` callback. Currently it does:
>
> ```ts
> const isMobile = w < MOBILE_BP;
> const backStars = seedBack(w, h, isMobile ? 60 : 180);
> const midStars = seedMid(w, h, isMobile ? 14 : 40);
> ```
>
> Halve the desktop static counts:
>
> ```ts
> const isMobile = w < MOBILE_BP;
> const backStars = seedBack(w, h, isMobile ? 60 : 90);
> const midStars = seedMid(w, h, isMobile ? 14 : 20);
> ```
>
> The animated path (line 187 in the resize function) keeps `isMobile ? 90 : 180` and `isMobile ? 20 : 40` for users who are actually getting animation.
>
> **Acceptance checks:**
>
> - Toggle `prefers-reduced-motion: reduce` in DevTools → Rendering. Reload `/`. The starfield is visibly populated but uses ~half the stars on desktop.
> - Lighthouse "Reduced motion" check is unaffected.

---

## Things deliberately left alone

- The `Marquee` inside the hero pill still pulses through the services list verbatim. Outstanding-3 fixes this — pick it up when you address the marquee duplication.
- The `LazyHomeSection` reserves 700px for `recentInsights` even when `insights.length === 0`. This is correct — it prevents CLS if insights load asynchronously later.
- The `react-router-dom@6.23` warning about `v7_startTransition` and `v7_relativeSplatPath` flags is not flagged here. It will be handled when you do the React 19 / React Router 7 migration.

## Suggested execution order

1. Outstanding-1 (TrustBar) — one-line change, biggest visible UX win.
2. Outstanding-3 (Marquee duplication) — content-only, low risk.
3. Outstanding-4 (Quick-contact bar) — adds real conversion surface.
4. New-1 (HorizontalScroll dvh fix) — one-line correctness fix.
5. New-3 (Hero pill dot shadow) — verify first; might be a no-op or might fix the missing glow.
6. New-2 (FounderSection indentation) — Prettier handles it.
7. Outstanding-2 (Reveal transitionProperty) — do this BEFORE you enable the React Compiler during the React 19 migration.
8. New-5 (amber tokens), New-6 (StarField static counts) — polish, do whenever.
9. New-4 (test typing) — do alongside the React 19 migration since `@types/react@19` will likely surface adjacent typing issues anyway.

Total work, with Codex doing the writing: ~2 hours of effort, less if you batch 1+3+4 into a single PR.
