# Audit Plan — `pages/About.tsx` (Round 2)

> Scope: Re-audit of the **About Us** page after Sagar's first round of fixes. Round 1 plan = `AUDIT-ABOUT.md`.
>
> Files re-reviewed:
> `pages/About.tsx`, `pages/about/{Snapshot,HowWeWork,Values,Principal,Office,Cta}.tsx`, `pages/about/schema.ts`,
> `components/Breadcrumbs.tsx`, `components/SEO.tsx`, `components/hero/HeroFolio.tsx`,
> `components/motion/WordReveal.tsx`, `components/OptimizedImage.tsx`,
> `App.tsx` (`MainContent`), `tailwind.config.ts`, `index.css`, `constants/contact.ts`,
> `hooks/useCountUp.ts`, `pages/About.test.tsx`.
>
> Page route: `/about`. Zone: `data-zone="editorial"` (now applied at the `<main>` from `App.tsx`).

---

## 0. Round-1 → Round-2 Status Ledger

Confirmed fixed (no further work needed):

- **A1 / A14 / A-A11Y-1** — `<main id="main-content" tabIndex={-1} data-zone="editorial">` is now provided by `App.tsx` for `/about`. ✅
- **A2 / A6 / A-UI-1** — channel-form `--zone-text-rgb`, `--zone-text-muted-rgb`, `--zone-accent-rgb` declared in `index.css`; Tailwind `colors` registers them as `zone-text`, `zone-text-muted`, `zone-accent` so `text-zone-text-muted/80` etc. now resolve. ✅
- **A3 / A-A11Y-3** — Lucide icons in Values/Principal/Office have `aria-hidden="true" focusable="false"`. ✅
- **A4 / A19 / A-SEO-1** — Schema split into `AboutPage` + `AccountingService` + `Person` triple in `pages/about/schema.ts`, memoized at the call site. ✅
- **A5 / A-IA-2 / A-IA-5** — `CONTACT_INFO.founder.icaiMembershipNo` now `"273511"`; bio/quote moved into the constant; Snapshot `<dl>` reads from live data. ✅
- **A7 / A-A11Y-7** — `index.css` lines 366–382: reduced-motion media query disables `animate-blob`, `animate-fade-in-up`, `[data-animate]`, plus a global `*` clamp. ✅
- **A8 / A-CTA-1** — CTA copy + button now points at `/contact`; hover state is `hover:bg-brand-dark hover:text-white` (legible). ✅
- **A11 / A-UI-4** — `selection:text-zone-text` is now a real utility (channel-form makes it work). ✅
- **A12** — `WordReveal` early-returns a plain `<span>` when `useReducedMotion()` is true (verified in `motion/WordReveal.tsx`). ✅
- **A13 / A-PERF-1** — `OptimizedImage` accepts and forwards `width`/`height`; Principal passes `width={320} height={400} aspectRatio="4/5" priority generateSrcSet srcAvif srcWebp`. ✅
- **A15 / A-A11Y-5** — Founder pull-quote is now a `<blockquote>` with attribution `<footer>`. ✅
- **A18** — CTA pill no longer collapses on hover. ✅
- **A-A11Y-9** — `HeroFolio` sideText has an `<span className="sr-only">` mirror plus `aria-hidden` on the rotated visual span. ✅
- **A-IA-3 / A-IA-4** — "How we work" + "Office & visiting" sections added; map gated behind explicit consent. ✅
- **A-IA-1 / A-CQ-1** — page split into `pages/about/{Snapshot,HowWeWork,Values,Principal,Office,Cta}.tsx`; schema lives in `pages/about/schema.ts`. ✅
- **A-CQ-3** — `pages/About.test.tsx` smoke test exists, asserts main / h1 / breadcrumb / CTA. ✅
- **A-I18N-1** — `heroBlurb` computes years-in-practice; `ordinalSuffix` correctly handles 11th/12th/13th. ✅
- **A-PERF-2** — schema `useMemo`'d. ✅
- **A-PERF-3** — `<link rel="prefetch" href="/contact">` injected via `useEffect` (with caveats — see R2-PERF-1). ⚠️
- **A-SEC-2** — `SEO.tsx` now ships `stringifyJsonLd` which escapes `</` to `<`. ✅
- LinkedIn link in Principal carries `rel="me noopener noreferrer"`, target blank, sr-only "(opens in new tab)" hint. ✅

Still missing or partially fixed:

- **A-UI-2** — `text-brand-moss` was supposed to be replaced with `text-zone-accent` page-wide. Mostly done in the new modules, but `Cta.tsx` keeps `bg-brand-moss` / `text-brand-moss` (deliberate brand anchor, per `ZONE.md`); `Values.tsx` retains `border-white/10` which is wrong outside editorial zone (see R2-UI-3).
- **A-UI-5** — `max-w-prose` applied in Snapshot/Principal copy; missing on the Office address `<dd>`s (long lines on wide screens).
- **A-UI-6** — `rounded-card` and `rounded-bento` are tokenized in `tailwind.config.ts` and used. ✅ (one stray `rounded-full` is fine for pills.)
- **A-IA-2** — Snapshot stat for `Established: 2023` count-up animates **0 → 2023** which is jarring and is rendered with `toLocaleString('en-IN')` as `"2,023"` — that's a year, not a quantity (see R2-BUG-1, severity High).
- **A-SEO-2** — Breadcrumbs are passed to `<SEO>`, which emits a `BreadcrumbList` JSON-LD; **`Breadcrumbs.tsx` ALSO emits its own** `BreadcrumbList` script — duplicate structured data on the same page (see R2-SEO-1).

---

## 1. Round-2 Severity Heatmap

| # | Issue | Axis | Severity | Effort |
|---|---|---|---|---|
| R2-BUG-1 | Snapshot animates the **year** "2023" as a counter and renders it via `en-IN` locale → "2,023" with a thousands separator (a year is not a quantity) | UX / data hygiene | **High** | XS |
| R2-SEO-1 | **Two `BreadcrumbList` JSON-LDs** on the page — one from `<SEO breadcrumbs={...}>`, one injected by `<Breadcrumbs>` itself | SEO | High | S |
| R2-IA-1 | Outer wrapper `<div className="min-h-screen zone-bg zone-text ...">` in `pages/About.tsx` re-applies what `<main>` already provides; produces redundant cascade and a stray div around the page content | code quality | Medium | XS |
| R2-A11Y-1 | `useCountUp` runs even when `prefers-reduced-motion: reduce` is set — counts are JS-driven and bypass the CSS gate | a11y | High | XS |
| R2-A11Y-2 | `Snapshot` section has **no heading** at all — screen-reader users cannot identify what this region is for | a11y / UX | Medium | XS |
| R2-A11Y-3 | `CountUpStat` updates `<dd>` text every frame; default `aria-live` is "off" so SR doesn't announce, but interim partial values can leak in tab-summary patterns and the announcement of the final value is lost. Wire `aria-live="off"` explicitly + render final value to SR via sr-only mirror | a11y | Low | XS |
| R2-A11Y-4 | `Office` "Open in Google Maps" link uses `target="_blank"` but has no "(opens in new tab)" sr-only hint (Principal LinkedIn link has it — inconsistent) | a11y | Low | XS |
| R2-A11Y-5 | `Office` "Load map" button focus-visible ring (`focus-visible:ring-2 focus-visible:ring-white`) has no offset and lives on a white background — focus ring is invisible | a11y | High | XS |
| R2-A11Y-6 | Skip link target mismatch: `<main id="main-content">` but the project has historically used `#main` in skip links (verify in `Navbar`) | a11y | Medium (verify) | XS |
| R2-UI-1 | Combined `pt-28 md:pt-32` on the breadcrumbs container **and** `pt-32 md:pt-48` inside `HeroFolio` produces ~14rem (mobile) / ~20rem (desktop) of dead space above the H1 | UI / UX | High | S |
| R2-UI-2 | Snapshot `lg:col-span-7` left card vs `lg:col-span-5` right intro at `items-end` makes the right column hug the bottom of the left card; on `lg` the snapshot stats are visually higher than the intro paragraph — looks unintentional | UI | Low | XS |
| R2-UI-3 | `Values.tsx` line 38: `border-t border-white/10` hard-codes white over the editorial zone surface; in any other zone (or if the page is later reused outside editorial) this border vanishes against light backgrounds | UI bug | Medium | XS |
| R2-UI-4 | `Office` iframe has `min-h-[420px] aspect-[16/10]` AND its wrapper has `min-h-[420px]` — both compete; on tall viewports the iframe gets boxed by min-height and the aspect-ratio is ignored | UI | Low | XS |
| R2-UI-5 | `Office` iframe `grayscale contrast-125` filter is a stylistic choice that reduces label legibility (street names) — accessibility / readability concern for users with low vision | a11y / UX | Low | XS |
| R2-UI-6 | `selection:bg-brand-moss` in editorial zone is a green selection over a brass-accented dark page; `selection:bg-zone-accent` would honor the zone | UI | Low | XS |
| R2-UI-7 | `HowWeWork` cards rendered as `<article>` — they're 30-word descriptors, not self-contained articles. Use `<div>` (or `<li>` inside a `<ul role="list">`) | semantics | Low | XS |
| R2-UI-8 | None of the page sections expose stable `id`s (`#snapshot`, `#how-we-work`, …) so deep-links from menus/anchors aren't possible | UX / SEO | Low | S |
| R2-SEO-2 | `priceRange: 'INR'` in `AccountingService` schema is a currency code; Schema.org expects a price-band token like `'₹₹'` or an actual range. Validators accept it but it conveys nothing to consumers of the LD | SEO | Medium | XS |
| R2-SEO-3 | `addressCountry: "India"` should be `"IN"` (ISO 3166-1 alpha-2) per Schema.org best practice | SEO | Low | XS |
| R2-SEO-4 | `OG_IMAGE` is `/og-contact.png` — a copy-paste from the Contact page; the About page should ship its own `/og-about.png` (or use a generic firm card) | SEO / branding | Medium | S |
| R2-SEO-5 | `primaryImageOfPage` for AboutPage is set to the OG image, not the actual key visual (founder portrait at `/images/founder.jpg`). LD's `primaryImageOfPage` should be the in-content image | SEO | Low | XS |
| R2-SEO-6 | `AboutPage` schema lacks `@id`, `mainEntity` (pointing at the Person), and `isPartOf` (pointing at a `WebSite`) — graph linking is incomplete | SEO | Medium | S |
| R2-SEO-7 | `pages/about/schema.ts` hard-codes `SITE_URL = 'https://casagar.co.in'`; `SEO.tsx` reads `VITE_SITE_URL` env override. Staging/preview builds will produce schema with the wrong host | SEO / DRY | Medium | S |
| R2-SEO-8 | `Breadcrumbs.tsx` injects its own JSON-LD via `script.text = JSON.stringify(...)` **without** the `<` escape that `SEO.tsx` applies. Less critical because the source data is static, but it's a regression of the round-1 SEC-2 fix | security / SEO | Low | XS |
| R2-PERF-1 | `useEffect` adds `<link rel="prefetch" href="/contact">` — but `/contact` is a Vite SPA route; the response is the same `index.html`, not the route's JS chunk. The prefetch is effectively a no-op for first-meaningful-paint of the next route | perf | Medium | S |
| R2-PERF-2 | `WordReveal` uses framer-motion `LazyMotion` per usage; the hero re-enters the DOM each navigation. Consider lifting LazyMotion once in `App.tsx` | perf | Low | S |
| R2-PERF-3 | `Snapshot` lazy-counts via RAF for 4 stats simultaneously; cheap but uncoordinated. A shared timeline or `Promise.all`-style would let them finish on the same frame | perf | Trivial | S |
| R2-CQ-1 | `pages/About.tsx` outer `<div>` duplicates the `<main>`'s `zone-bg zone-text` (see R2-IA-1). Replace with `<>` | code quality | Low | XS |
| R2-CQ-2 | `Snapshot` `parseCountValue('2023')` produces `{ end: 2023, suffix: '' }` — there is no contract distinguishing "year" from "magnitude". Add a typed `Stat` shape | code quality | Medium | S |
| R2-CQ-3 | `useCountUp` returns an untyped `ref` (`{ ref: ... }`) which `Snapshot` casts via `as React.RefObject<HTMLDivElement>` — fragile. Make `useCountUp` generic over the element type | code quality | Low | XS |
| R2-CQ-4 | `About.test.tsx` mocks `PageHero` to a static `<h1>` — useful for unit testing but loses coverage of the actual hero. Add a second test that renders the real hero | testing | Low | S |
| R2-CQ-5 | Test mocks `useCountUp` to return `{ end, ref: { current: null } }` — `current: null` is fine, but the spec for `RefObject` makes this a subtle type mismatch in TS strict mode | code quality | Trivial | XS |
| R2-CQ-6 | No axe/Pa11y assertion in the test. Add `vitest-axe` and assert no critical issues on the rendered tree | testing | Medium | S |
| R2-CONTENT-1 | Hero blurb tail "He reads every working paper and signs every certificate" — strong line, but the rest of Snapshot copy ("intentionally direct …") is now competing with the same idea. Pick one home | content | Low | S |
| R2-CONTENT-2 | Office "Open in Google Maps" anchor reuses `geo.mapEmbedUrl` (the embed URL with `output=embed`). When opened in a new tab, that URL renders an embed-only chrome, not a real Maps page. Provide a separate `geo.mapShareUrl` | UX / data | Medium | XS |
| R2-CONTENT-3 | Founder bio is "passion for simplifying complex financial matters … technology-driven" — generic. Replace with two specific lines: articleship lineage (firm where Sagar trained) + concrete focus (e.g., "advises owner-led MSMEs in Karnataka on direct-tax, GST, and ROC compliance"). Sagar to draft | content | Medium | M |
| R2-FEAT-1 | The page no longer surfaces a "Contact / call / WhatsApp" trifecta; only the bottom CTA exists. For users halfway down the Office section, the nearest CTA is at the top (Navbar) or the bottom (CTA). Add an inline phone/WhatsApp pill inside the Office card | UX / conversion | Medium | S |
| R2-FEAT-2 | No "Engagement timeline" or "What happens after you message us" — answered partially by the Cta blurb but not visualized. Optional addition | UX | Low | M |
| R2-FEAT-3 | No on-page table of contents; six sections is enough to benefit from a sticky right-rail TOC on `lg+` | UX | Low | M |
| R2-OPS-1 | Map iframe consent is read once on mount via `localStorage`. If a global cookie banner grants consent later, this section won't react until reload | code quality / UX | Medium | S |
| R2-OPS-2 | Two consent flags coexist: `cookie_consent` (global) and `maps_embed_consent` (component-local). The component-local flag survives a global consent revocation — the user "ungranted everything" but the map still loads | privacy | Medium | XS |
| R2-OPS-3 | No "revoke consent / unload map" affordance once the map is loaded | privacy / UX | Low | S |

Severity scale: High = visible defect or a11y/SEO regression; Medium = correctness / quality; Low = polish.

---

## 2. Detailed Findings & Fix-It-Now

### R2-BUG-1 — Snapshot turns "Established 2023" into "2,023"

**Where:** `pages/about/Snapshot.tsx:13–28` (`CountUpStat`) used at line 36 with `value={CONTACT_INFO.stats.established}` (= `"2023"`).

**Why it breaks:**
1. `parseCountValue("2023")` returns `{ end: 2023, suffix: "" }`.
2. `useCountUp(2023, 1.4)` animates 0 → 2023 over 1.4 seconds. A year animating like a counter looks like a UI glitch, especially when the other stats are quantities.
3. `count.toLocaleString('en-IN')` formats integers with thousand separators per Indian English: `1,000+` for engagements (correct), `2,023` for established (wrong — years are never grouped).

**Fix (two-line change):** introduce a typed `Stat` and skip count-up + grouping for non-counting stats.

```tsx
// Snapshot.tsx
type Stat =
  | { kind: 'count';  label: string; value: string }   // counts up, locale-grouped, suffix preserved
  | { kind: 'static'; label: string; value: string };  // rendered as-is

const stats: Stat[] = [
  { kind: 'static', label: 'Established',  value: CONTACT_INFO.stats.established },
  { kind: 'count',  label: 'Engagements',  value: CONTACT_INFO.stats.consultations },
  { kind: 'count',  label: 'Industries',   value: CONTACT_INFO.stats.industriesServed },
  { kind: 'static', label: 'Office',       value: CONTACT_INFO.address.city },
];
```

Render with a tiny dispatch:

```tsx
{stats.map(s =>
  s.kind === 'count' ? <CountUpStat key={s.label} {...s} /> : <StaticStat key={s.label} {...s} />
)}
```

`StaticStat` is the same `<dt>/<dd>` markup minus the count-up. Acceptance: "Established" reads literally `2023`, "Office" reads `Mysuru`, the two count stats animate as before.

---

### R2-SEO-1 — Duplicate `BreadcrumbList` structured data

**Where:**
- `pages/About.tsx:63` passes `breadcrumbs={aboutBreadcrumbs}` to `<SEO>`. `SEO.tsx:141–152` injects `<script id="json-ld-breadcrumbs" data-dynamic-schema="true">…</script>`.
- `pages/About.tsx:67` renders `<Breadcrumbs items={[{ label: 'About' }]}>`. `Breadcrumbs.tsx:39–56` injects its own `<script id="json-ld-breadcrumbs">…</script>`.

Both scripts have the same DOM id `json-ld-breadcrumbs`, which means inserting the second one creates a duplicate id (HTML invalid). The script content is also inconsistent: SEO.tsx prepends the host using `aboutBreadcrumbs`, while `Breadcrumbs.tsx` builds its own list independently from the visible breadcrumb props.

**Fix — pick one source of truth:**

Option A (recommended) — let `<SEO>` own the schema; strip it from `<Breadcrumbs>`.

1. In `Breadcrumbs.tsx`, delete the `useEffect` block that creates `script[id="json-ld-breadcrumbs"]`. The component becomes a presentational `<nav>` only.
2. Keep `breadcrumbs={aboutBreadcrumbs}` on `<SEO>`. Remove the older `data-dynamic-schema="true"` cleanup-collision guard test if any.

Option B — let `<Breadcrumbs>` own the schema; stop passing `breadcrumbs` to `<SEO>`.
- This keeps the schema next to the visible breadcrumbs but spreads JSON-LD generation across components, which makes the previously-shared `stringifyJsonLd` helper irrelevant.

Pick Option A.

Acceptance: exactly one `script[type="application/ld+json"]` containing `BreadcrumbList` in the DOM after navigation to `/about`.

---

### R2-IA-1 / R2-CQ-1 — Drop the redundant outer `<div>` in `About.tsx`

**Where:** `pages/About.tsx:55–87`, the wrapper:

```tsx
return (
  <div className="min-h-screen zone-bg zone-text selection:bg-brand-moss selection:text-zone-text">
    <SEO ... />
    <div className="container mx-auto max-w-7xl px-4 md:px-6 pt-28 md:pt-32">
      <Breadcrumbs items={[{ label: 'About' }]} />
    </div>
    <PageHero ... />
    <Snapshot /> ...
  </div>
);
```

The `<main>` from `App.tsx` already supplies `data-zone="editorial"` plus `zone-bg zone-text`. The outer `<div>` re-applies them, adds `min-h-screen` (also already on `<main>` via `flex-grow`), and adds the `selection:` utilities — only the selection rule is unique to this wrapper.

**Fix:**

```tsx
return (
  <>
    <SEO ... />
    <div className="container mx-auto max-w-7xl px-4 md:px-6 pt-12 md:pt-16">
      <Breadcrumbs items={[{ label: 'About' }]} />
    </div>
    <PageHero ... />
    <Snapshot />
    <HowWeWork />
    <Values />
    <Principal />
    <Office />
    <Cta />
  </>
);
```

If the `selection:` rule must persist, move it into `index.css` under `[data-zone="editorial"] ::selection { ... }` so it's a zone concern, not a page concern:

```css
[data-zone="editorial"] ::selection {
  background-color: rgb(var(--zone-accent-rgb) / 0.35);
  color: var(--zone-text);
}
```

---

### R2-A11Y-1 — `useCountUp` ignores `prefers-reduced-motion`

**Where:** `hooks/useCountUp.ts`.

**Fix:** import the existing `useReducedMotion` hook and short-circuit the RAF loop.

```ts
import { useReducedMotion } from './useReducedMotion';

export const useCountUp = (end: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView({ triggerOnce: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reduce) { setCount(end); return; }
    let raf: number; let start: number | undefined;
    const animate = (t: number) => {
      start ??= t;
      const p = Math.min((t - start) / (duration * 1000), 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(end * ease));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration, reduce]);

  return { count, ref };
};
```

Acceptance: with OS-level "reduce motion" enabled, the stat shows the final value on first paint inside the viewport.

---

### R2-A11Y-2 — `Snapshot` section has no heading

**Where:** `pages/about/Snapshot.tsx`.

**Fix:** add a visually-hidden h2 so AT users get a landmark name and the heading hierarchy stays continuous. Optional: lift it into a visible eyebrow.

```tsx
<section
  aria-labelledby="snapshot-heading"
  className="container mx-auto max-w-7xl px-4 md:px-6 pb-24"
>
  <h2 id="snapshot-heading" className="sr-only">Practice at a glance</h2>
  ...
</section>
```

Apply the same pattern to `Cta.tsx` (which already has a visible h2 `"Talk to the principal."`) — ensure each section is `aria-labelledby`d.

---

### R2-A11Y-3 — `CountUpStat` updates `<dd>` text repeatedly

**Where:** `pages/about/Snapshot.tsx:22–25`.

**Fix:** mark the animated number container `aria-hidden`, mirror the final value to SR.

```tsx
<dd className="font-heading text-2xl mt-1 text-zone-text">
  <span aria-hidden="true">
    {count.toLocaleString('en-IN')}{suffix}
  </span>
  <span className="sr-only">{end.toLocaleString('en-IN')}{suffix}</span>
</dd>
```

Acceptance: VoiceOver/NVDA reads `1000+` once when entering the cell, regardless of where the count animation is.

---

### R2-A11Y-5 — Office "Load map" focus ring is invisible

**Where:** `pages/about/Office.tsx:71`.

**Fix:** add an offset and a ring color that contrasts with the white button background — and the editorial-dark surrounding card.

```tsx
className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold
           text-brand-moss transition-colors
           hover:bg-brand-dark hover:text-white
           focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-zone-accent focus-visible:ring-offset-2
           focus-visible:ring-offset-zone-surface
           motion-reduce:transition-none"
```

While here, add the same `focus-visible:` pattern to the Cta `<Link>` (currently `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white` — fine over the moss card but redundant offset color).

---

### R2-A11Y-4 — "Open in Google Maps" lacks new-tab affordance

**Where:** `pages/about/Office.tsx:78–86`.

**Fix:**

```tsx
<a
  href={geo.mapShareUrl ?? geo.mapEmbedUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="text-zone-accent font-bold hover:text-zone-text transition-colors"
>
  Open in Google Maps
  <span className="sr-only"> (opens in new tab)</span>
</a>
```

(Pair this with R2-CONTENT-2 — provide a real share URL.)

---

### R2-A11Y-6 — Verify skip-link target

**Where:** `App.tsx:88` declares `<main id="main-content" tabIndex={-1}>`. The skip link (probably in `Navbar.tsx`) needs to be `<a href="#main-content">Skip to main content</a>`. If it currently says `#main`, the skip link no-ops.

**Fix:** open `components/Navbar.tsx`, search for `Skip to`, ensure `href="#main-content"`. Otherwise rename `<main>` to `id="main"` (less invasive). Either is fine but they must agree.

---

### R2-UI-1 — Massive whitespace above the H1

**Where:**
- `About.tsx:66` — outer container `pt-28 md:pt-32` (top spacer for Breadcrumbs).
- `HeroFolio.tsx:10` — section `pt-32 md:pt-48`.

Mobile cumulative top space: `7rem + 8rem = 15rem` (= 240 px) before "On the principal, briefly." appears. On desktop it's ~20 rem. The Navbar is fixed so some top space is required, but not this much.

**Fix:** reduce the breadcrumbs container to clear-the-navbar-only padding (`pt-24 md:pt-28`) and reduce HeroFolio's top padding when used after a breadcrumbs row. Cleanest is to thread a `compact?: boolean` prop to `HeroFolio`:

```tsx
// HeroFolio.tsx — accept and use:
compact?: boolean;
className={`relative ${compact ? 'pt-12 md:pt-20' : 'pt-32 md:pt-48'} pb-20 px-4 md:px-12 zone-bg zone-text overflow-hidden`}
```

Then:

```tsx
<PageHero variant="folio" compact ... />
```

Update `PageHeroProps` (`components/hero/types.ts`) to allow the prop.

Acceptance: at 375 px viewport the H1 begins ≤ 8 rem from the navbar bottom.

---

### R2-UI-3 — `border-white/10` outside editorial zone

**Where:** `pages/about/Values.tsx:38`.

**Fix:** swap to `border-t zone-border`. This makes the section robust if the page is later reused outside `data-zone="editorial"` and is consistent with the rest of the page's hairlines.

---

### R2-UI-4 — Office iframe min-height vs aspect-ratio

**Where:** `pages/about/Office.tsx:52` (wrapper) and `:61` (iframe).

**Fix:** keep the aspect ratio on the iframe and let the wrapper grow with content. Drop `min-h-[420px]` from the wrapper, keep it on the iframe so the consent placeholder shares the same minimum height:

```tsx
<div className="lg:col-span-7 zone-surface rounded-bento border zone-border overflow-hidden flex flex-col">
  ...
  <iframe
    ...
    className="w-full aspect-[16/10] grayscale-[40%] contrast-110"
  />
</div>
```

The `grayscale-[40%]` softens the readability hit (R2-UI-5).

---

### R2-UI-7 — `<article>` for "How we work" cards

**Where:** `pages/about/HowWeWork.tsx:27`.

**Fix:** semantically these are 3 short labels — use a `<ul>`:

```tsx
<ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {workCards.map((card) => (
    <li key={card.title} className="zone-surface rounded-bento border zone-border p-8 md:p-10">
      <h3 className="text-2xl font-heading font-bold zone-text mb-4">{card.title}</h3>
      <p className="text-zone-text-muted/90 leading-relaxed">{card.body}</p>
    </li>
  ))}
</ul>
```

(`role="list"` defends against Safari's list-style-removal anti-feature where `<ul>` is no longer announced as a list when `list-style: none`.)

---

### R2-UI-8 — Section `id`s for deep-linking

**Where:** all six section components.

**Fix:** add stable ids:

| Component | id |
|---|---|
| Snapshot | `snapshot` |
| HowWeWork | `how-we-work` |
| Values | `values` |
| Principal | `principal` |
| Office | `office` |
| Cta | `contact-cta` |

Then any future TOC, sticky right-rail (R2-FEAT-3), or campaign URL can link `/about#values` reliably.

---

### R2-SEO-2..7 — Schema improvements

Update `pages/about/schema.ts`:

```ts
// Replace 'INR' with a price band:
priceRange: '₹₹',

// Use ISO country code:
addressCountry: 'IN',

// Give AboutPage an @id, mainEntity, isPartOf and a primary image that's actually in the page:
{
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#webpage`,
  url: `${SITE_URL}/about`,
  name: `About ${contact.name}`,
  description: `Profile of ${contact.name}, a Chartered Accountancy practice in Mysuru, Karnataka.`,
  primaryImageOfPage: `${SITE_URL}/images/founder.jpg`,
  about: { '@id': `${SITE_URL}/#founder` },
  mainEntity: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
}
```

And centralize the host:

```ts
// pages/about/schema.ts
const SITE_URL = (
  (import.meta as any).env?.VITE_SITE_URL ?? 'https://casagar.co.in'
).replace(/\/$/, '');
```

Add a real OG image: ship `/og-about.png` (1200×630) and update `ABOUT_OG_IMAGE = `${SITE_URL}/og-about.png``.

---

### R2-SEO-8 — `Breadcrumbs.tsx` JSON-LD escape

**Where:** `components/Breadcrumbs.tsx:50`.

If we keep `Breadcrumbs.tsx` injecting its own JSON-LD (i.e., we go with R2-SEO-1 Option B), share the helper:

```ts
// utils/jsonLd.ts
export const sanitizeJsonLd = (...): unknown => { /* same as SEO.tsx */ };
export const stringifyJsonLd = (data: object) =>
  JSON.stringify(sanitizeJsonLd(data)).replace(/</g, '\\u003c');
```

Use it in both `SEO.tsx` and `Breadcrumbs.tsx`.

If we go with R2-SEO-1 Option A (recommended), this finding is moot because the schema generation lives entirely in `SEO.tsx`.

---

### R2-PERF-1 — Prefetch `/contact` doesn't actually prefetch the route module

**Where:** `pages/About.tsx:41–53`.

The prefetch hits the SPA's `index.html` (same response for every route in a Vite static SPA). What we actually want is to warm the lazy chunk for `/contact`.

**Fix:** use `import()` to warm the chunk; React's bundler turns this into the chunk's URL and executes the resolution.

```tsx
useEffect(() => {
  let cancelled = false;
  // Schedule after first paint so we don't compete with the LCP.
  const run = () => {
    if (!cancelled) { void import('../pages/Contact'); }
  };
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1500);
  }
  return () => { cancelled = true; };
}, []);
```

Confirm `App.tsx`'s router uses `React.lazy(() => import('./pages/Contact'))` so the chunk-warming actually shares the same module URL.

Acceptance: in the Network panel, navigating from About to Contact does **not** trigger a chunk request (it was warmed).

---

### R2-CONTENT-2 — Map share URL

**Where:** `constants/contact.ts:54` (`geo.mapEmbedUrl`).

**Fix:** add a separate share URL for click-throughs:

```ts
geo: {
  latitude: 12.3051,
  longitude: 76.6551,
  mapEmbedUrl: "https://maps.google.com/maps?q=12.300430367886586,76.65174852128196&t=&z=15&ie=UTF8&iwloc=&output=embed",
  mapShareUrl: "https://maps.app.goo.gl/<short-link>",  // generated from Google Maps "Share"
}
```

If a short-link isn't available, use a non-embed query URL like:

```ts
mapShareUrl: "https://www.google.com/maps/place/?q=place_id:<PLACE_ID>"
// or
mapShareUrl: "https://www.google.com/maps?q=12.300430,76.651748"
```

Update `Office.tsx` to prefer `mapShareUrl` for the `<a>` and keep `mapEmbedUrl` for the iframe.

---

### R2-OPS-1..3 — Consent gating

**Where:** `pages/about/Office.tsx:8–20`.

Three improvements, in priority order:

1. **React to global consent changes.** Promote the localStorage check to a custom hook:

```ts
// hooks/useCookieConsent.ts
export function useConsent(key: 'cookie_consent' | 'maps_embed_consent') {
  const [granted, setGranted] = useState(() =>
    typeof window !== 'undefined' && window.localStorage.getItem(key) === 'granted'
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setGranted(e.newValue === 'granted');
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string; value?: string } | undefined;
      if (detail?.key === key) setGranted(detail.value === 'granted');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('cookie-consent-change', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie-consent-change', onCustom as EventListener);
    };
  }, [key]);
  const grant  = () => { localStorage.setItem(key, 'granted');  setGranted(true);  window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { key, value: 'granted' }})); };
  const revoke = () => { localStorage.removeItem(key);          setGranted(false); window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { key, value: 'revoked' }})); };
  return { granted, grant, revoke };
}
```

2. **Subordinate the maps flag to global consent.** In `Office.tsx`:

```ts
const global = useConsent('cookie_consent');
const local  = useConsent('maps_embed_consent');
const canLoadMap = global.granted || local.granted;
```

If global consent is revoked, `canLoadMap` becomes `false` once the next render cycle picks it up via the storage event.

3. **Provide an "unload map / revoke" button** beside "Open in Google Maps":

```tsx
{canLoadMap && (
  <button onClick={() => { local.revoke(); }} className="ml-4 text-zone-text-muted underline">
    Hide map
  </button>
)}
```

---

### R2-CQ-3 — Type `useCountUp` generically

**Where:** `hooks/useCountUp.ts` and `hooks/useInView.ts`.

**Fix:**

```ts
export const useCountUp = <E extends HTMLElement = HTMLDivElement>(end: number, duration = 2) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView<E>({ triggerOnce: true });
  // ...
  return { count, ref };
};
```

Then in `Snapshot.tsx` drop the cast:

```ts
const { count, ref } = useCountUp<HTMLDivElement>(end, 1.4);
return <div ref={ref}>...</div>;
```

(Requires `useInView` to be generic in the same way; trivial change.)

---

### R2-CQ-6 — Add axe assertion to the test

**Where:** `pages/About.test.tsx`.

```bash
npm i -D vitest-axe @axe-core/react
```

```tsx
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend({ toHaveNoViolations });

it('renders no axe violations for static markup', async () => {
  const { container } = render(<MemoryRouter initialEntries={['/about']}><main><About /></main></MemoryRouter>);
  expect(await axe(container)).toHaveNoViolations();
});
```

Acceptance: `npm run test` fails when a regression introduces a critical/serious violation.

---

## 3. Concrete Codex Worklist (R2-ordered)

> Quick wins first; structural last. Suggested commits at marked checkpoints.

1. **R2-BUG-1** — Add `Stat` discriminated union to `Snapshot.tsx`; render "Established" + "Office" via `StaticStat`. [⏸ commit]
2. **R2-A11Y-1** — Gate `useCountUp` on `useReducedMotion`.
3. **R2-A11Y-2** — Add `aria-labelledby` + `sr-only` h2 to `Snapshot`. Apply same pattern to `Cta.tsx`, `HowWeWork.tsx`, `Office.tsx` for symmetry.
4. **R2-A11Y-3** — `aria-hidden` the animated count, sr-only mirror with the final value.
5. **R2-A11Y-4** — Add "(opens in new tab)" sr-only to "Open in Google Maps".
6. **R2-A11Y-5** — Fix focus-visible ring on the "Load map" button (offset + zone-aware ring color).
7. **R2-A11Y-6** — Verify Navbar skip-link `href="#main-content"`. [⏸ commit]
8. **R2-IA-1 / R2-CQ-1** — Drop the outer `<div>` in `About.tsx`; move selection rule to `index.css` zone block.
9. **R2-UI-1** — Add `compact` prop to `HeroFolio` and use it on About; reduce breadcrumbs container `pt-`.
10. **R2-UI-3** — `border-white/10` → `zone-border` in `Values.tsx`.
11. **R2-UI-4 / R2-UI-5** — Office iframe: drop wrapper `min-h-[420px]`; soften `grayscale` to `grayscale-[40%]`.
12. **R2-UI-6** — `selection:bg-brand-moss` → `selection:bg-zone-accent/30` (or move into `index.css` per R2-IA-1).
13. **R2-UI-7** — `HowWeWork` cards as `<li>`/`<ul role="list">`.
14. **R2-UI-8** — Add ids: `snapshot`, `how-we-work`, `values`, `principal`, `office`, `contact-cta`. [⏸ commit]
15. **R2-SEO-1** — Remove the JSON-LD `useEffect` from `Breadcrumbs.tsx` (Option A).
16. **R2-SEO-2..7** — Update `pages/about/schema.ts`: `priceRange: '₹₹'`, `addressCountry: 'IN'`, AboutPage `@id` + `mainEntity` + `isPartOf` + correct `primaryImageOfPage`, `SITE_URL` from env, ship `/og-about.png` and reference it. [⏸ commit]
17. **R2-PERF-1** — Replace prefetch `<link>` with `import('../pages/Contact')` in `requestIdleCallback`.
18. **R2-OPS-1..3** — Extract `useConsent`, subordinate the maps flag to the global flag, add a "Hide map" affordance.
19. **R2-CONTENT-2** — Add `geo.mapShareUrl` in `constants/contact.ts`; use it for "Open in Google Maps".
20. **R2-CONTENT-1 / R2-CONTENT-3** — Tighten hero blurb vs Snapshot copy; rewrite founder bio with concrete specifics. (Sagar drafts.)
21. **R2-CQ-3** — Make `useCountUp` and `useInView` generic; drop the cast in `Snapshot.tsx`.
22. **R2-CQ-6** — Add `vitest-axe`; assert no violations in `About.test.tsx`.
23. **R2-CQ-4** — Add a second test that renders the real `PageHero` and verifies the WordReveal animation falls back to plain text under reduced motion (mock `useReducedMotion` to return `true`). [⏸ commit]
24. **R2-FEAT-1** — Add inline phone/WhatsApp pill inside the Office card.
25. **R2-FEAT-3** *(optional)* — Sticky in-page TOC on `lg+` linking the new section ids.
26. **R2-PERF-2 / R2-PERF-3** *(optional polish)*.

---

## 4. Acceptance Criteria — Round 2

The page is "shippable from About" when:

- Lighthouse mobile (cold cache) on `/about`: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100.
- axe DevTools (in browser) and `vitest-axe` (in CI) both report 0 critical / 0 serious issues.
- Exactly **one** `BreadcrumbList` JSON-LD on the page; `AboutPage`/`AccountingService`/`Person` triple validates in Google Rich Results.
- The Snapshot reads literally `2023` and `Mysuru` for the static stats; the count-up stats animate only when motion is allowed.
- `prefers-reduced-motion: reduce` produces a fully-static page with no counters, no fade-up, no WordReveal motion, no smooth scroll.
- Top space between the navbar and the H1 is ≤ 8 rem on a 375 px viewport.
- Skip-link → `<main id="main-content" tabIndex={-1}>` works on first activation.
- The Office iframe loads only after explicit consent **and** is hidden again if global consent is revoked from another tab (storage event).
- Hovering "Book Consultation" warms the Contact route chunk (verifiable via Performance panel).
- `npm run test` includes an axe assertion and a reduced-motion assertion for the hero.
- Schema URLs are produced from `VITE_SITE_URL` and match the canonical link tag emitted by `<SEO>` in any environment.

---

## 5. Out-of-scope spotted while re-auditing (parking lot)

- `App.tsx` zone selection is a string switch on `pathname`. As more pages adopt `data-zone`, this should become a route-level convention (e.g., a `meta.zone` field on the route definition).
- `Breadcrumbs.tsx` builds its own LD and visible nav from different data — even after R2-SEO-1, the visible breadcrumb passes only `[{ label: 'About' }]` while the LD lives off `aboutBreadcrumbs`. Consider a single source: `<Breadcrumbs items={aboutBreadcrumbs} />` and have the SEO emission read the same prop.
- `useReducedMotion` is implemented locally; `framer-motion` exports its own. They probably agree, but two sources of truth is one too many.
- `OptimizedImage` always renders a blurred placeholder layer above the `<img>` even when `priority` is set; for above-the-fold portraits this delays perceived render. Consider skipping the blur when `priority && !srcAvif && !srcWebp`.
- The `pt-28 md:pt-32` on the breadcrumbs container is a per-page navbar offset; once the Navbar exposes its height as a CSS variable (`--nav-h`), every page can align off the same number.
- `Cta.tsx` could share with `ConsultationBanner.tsx` (used on Services); right now the two CTAs diverge stylistically and stay in sync only by accident.
- `<Breadcrumbs items={[{ label: 'About' }]}>` doesn't pass `path`; the visible nav looks fine but if a future page adds `[{ label: 'Team', path: '/about/team' }, { label: 'Sagar H R' }]`, current logic handles it correctly. Worth a unit test in `Breadcrumbs.test.tsx`.
- The 1.4 s count-up duration is shorter than the 0.8 s fade-in delay chain in Snapshot (`animationDelay: '0.2s'` then RAF). Tighten or extend so the page feels coordinated.
- `og-image.jpg` is the global default in `SEO.tsx`; verify it actually exists at `/og-image.jpg`. The current page overrides to `/og-contact.png` (R2-SEO-4) — fix together.
