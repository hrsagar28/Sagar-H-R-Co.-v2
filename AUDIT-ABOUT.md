# Audit Plan — `pages/About.tsx`

> Scope: Exhaustive multi-axis audit of the **About Us** page. Each finding is paired with a concrete *what to do* and *how to do it* so it can be executed verbatim by Codex (ChatGPT) with no further clarification.
>
> File under review: `pages/About.tsx` (≈210 LoC) plus its direct dependencies — `components/hero/HeroFolio.tsx`, `components/SEO.tsx`, `components/OptimizedImage.tsx`, `constants/contact.ts`.
>
> Page route: `/about`. Zone: `data-zone="editorial"` (dark editorial palette).

---

## 0. TL;DR — Severity Heatmap

| # | Issue | Axis | Severity | Effort |
|---|---|---|---|---|
| A1 | Multiple `<h1>` / wrong heading order on page | a11y / SEO | High | S |
| A2 | "Mission Statement" cards use opacity utilities that fail WCAG contrast in editorial zone | a11y / UI | High | S |
| A3 | Decorative SVG/blob elements lack `aria-hidden="true"` | a11y | Medium | XS |
| A4 | Schema mixes `AboutPage` mainEntity → `AccountingService` but does not include `address`, `telephone`, `image`, `url` | SEO | High | S |
| A5 | Hard-coded copy contradicts existing `CONTACT_INFO.founder` / `stats` data | content/data | Medium | S |
| A6 | Magic-string class soup with `zone-text/60`, `zone-text-muted/80`, `zone-text-muted` mixed inconsistently — Tailwind opacity-on-CSS-var only works with CSS-var-with-channel format | UI / code quality | High | M |
| A7 | Decorative animated blob runs even when `prefers-reduced-motion: reduce` | a11y | Medium | XS |
| A8 | CTA "Book Consultation" uses non-semantic styling on `<Link>` and is the only end-of-page action — no secondary path (call/email/WhatsApp) | UX | Medium | S |
| A9 | "Est. 2023" hero card is a glorified placeholder where a portrait or office image should live | UX / content | Medium | S |
| A10 | No breadcrumbs / no skip link awareness; page hero has `pt-32 md:pt-48` but the navbar height is unknown to it (potential overlap on small screens) | a11y / UX | Medium | S |
| A11 | `selection:zone-text` is invalid Tailwind (no such utility); selection rule silently ignored | UI bug | Low | XS |
| A12 | Hero `WordReveal` animation does not check `prefers-reduced-motion` consistently — first paint can hide content for users with assistive tech | a11y / perf | Medium | S |
| A13 | Image `/sagar-hr.jpg` has no `width`/`height`/`fetchpriority`/`srcSet`; CLS risk and slow LCP | perf | High | S |
| A14 | No `<main>` landmark — page is wrapped in `<div>` only | a11y | High | XS |
| A15 | Founder bio block hardcodes a faux quote in italics — should be marked up as `<blockquote>` with `<cite>` | semantics / SEO | Low | XS |
| A16 | "Continuous professional development" / values copy is generic; differentiation absent | content | Medium | M |
| A17 | No "Why Mysuru" / "Office details" / "Visiting" anchor — typical CA-firm About page expects an office-info block linking to map | UX | Medium | M |
| A18 | Outbound CTA card uses `bg-brand-moss` with white pill button; pill text is set with `hover:zone-bg hover:zone-text` which collapses to dark-on-dark in editorial zone (illegible on hover) | a11y / UI bug | High | XS |
| A19 | Page has no JSON-LD `Person` for the founder *separately* from the firm — limits Knowledge-Graph eligibility | SEO | Low | S |
| A20 | Editorial zone text uses `font-medium leading-relaxed` and `text-xl md:text-2xl` but no max measure → lines exceed 90 ch on wide screens | UX (readability) | Low | S |

---

## 1. Information Architecture & Content Strategy

### 1.1 Findings

1. The page has **five sections**: hero (`HeroFolio`), small profile card with "Est. 2023", a "Professional Ethics" values grid, a "Principal Partner" leadership card, and a "Contact Us" CTA.
2. The narrative jumps awkwardly: hero says *"third year of practice"*, ethics section says *"Continuous professional development"*, leadership section says *"With expertise in Corporate Taxation and Statutory Audit"* (vague, repeats hero), and there is **no transition between blocks**.
3. The content does not cover any of the items a prospective client typically looks for on an About page:
   - Why Mysuru / why this firm
   - Engagement model (retainer vs assignment, fees indicative range, response times)
   - Sample client profile (industries, sizes — already exists in `INDUSTRIES` constant, not used on this page)
   - Office address / visiting hours / map
   - ICAI membership number (the constant has `icaiMembershipNo: "Member of ICAI"` — placeholder string, not a real number)
   - Founder education / CA articleship lineage
   - Languages spoken (relevant for Mysuru/Karnataka clientele)
4. Two text blocks duplicate the same idea ("dedicated to maintaining the highest standards of professional integrity and service quality" + "Adhering to the code of ethics prescribed by the ICAI").
5. The "stats" object in `CONTACT_INFO.stats` (clientsServed: 500+, industriesServed: 15+, consultations: 1000+) is **unused on About** — a missed credibility signal.

### 1.2 Plan

**A-IA-1 — Restructure into 7 narrative beats.** Replace the existing JSX between `</PageHero>` and the closing `</div>` with the following ordered sections (keep the existing hero as Section 1):

```
1. Hero (HeroFolio — keep)
2. Practice snapshot   (existing "Est. 2023" card → repurpose as 2-column "Snapshot" — see A-IA-2)
3. How we work         (NEW — engagement model, 3 short cards)
4. Values              (existing — but rewrite copy, see A-CONTENT-1)
5. The Principal       (existing — but expand, see A-CONTENT-2)
6. Office & visiting   (NEW — address, hours, map embed, languages)
7. CTA                 (existing — but de-duplicate, see A-CTA-1)
```

**A-IA-2 — Replace the empty `Est. 2023` placeholder card with a real snapshot.** It currently shows a centered "Est. 2023 / Mysuru, Karnataka" plate. Codex should change the left column to a definition list pulling live data from `CONTACT_INFO`:

```tsx
<dl className="grid grid-cols-2 gap-x-8 gap-y-6 zone-text">
  <div>
    <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">Established</dt>
    <dd className="font-heading text-2xl mt-1">{CONTACT_INFO.stats.established}</dd>
  </div>
  <div>
    <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">Engagements</dt>
    <dd className="font-heading text-2xl mt-1">{CONTACT_INFO.stats.consultations}</dd>
  </div>
  <div>
    <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">Industries</dt>
    <dd className="font-heading text-2xl mt-1">{CONTACT_INFO.stats.industriesServed}</dd>
  </div>
  <div>
    <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">Office</dt>
    <dd className="font-heading text-2xl mt-1">{CONTACT_INFO.address.city}</dd>
  </div>
</dl>
```

Wrap those numbers with `useCountUp` (already exists at `hooks/useCountUp.ts`) on first reveal so the figures animate.

**A-IA-3 — Add "How we work" block.** New section between snapshot and values. Three editorial cards using the same `zone-surface rounded-[3rem] border zone-border` system already in use:

| Title | Body (≤ 30 words) |
|---|---|
| Single point of contact | The proprietor leads every engagement — quotes, working papers, certificates, and the call you make at 7 PM. No relationship managers, no junior hand-offs. |
| Retainer or assignment | Most clients take an annual retainer covering tax, GST and ROC. We also accept stand-alone engagements — audits, due-diligence, one-off filings. |
| Working from Mysuru, India-wide | Filings, e-assessments and ITAT representations are handled remotely; physical attendance is offered across Karnataka and to ICAI-member panels nationwide. |

**A-IA-4 — Add "Office & visiting" section.** Pull from `CONTACT_INFO.address`, `CONTACT_INFO.hours`, `CONTACT_INFO.geo.mapEmbedUrl`. Iframe must include `loading="lazy"`, `title="Office location on Google Maps"`, `referrerPolicy="no-referrer-when-downgrade"`, and a fallback link `<a href={geo.mapEmbedUrl}>Open in Google Maps</a>` for users who block third-party iframes.

**A-IA-5 — Surface ICAI membership number.** Update `constants/contact.ts → CONTACT_INFO.founder.icaiMembershipNo` from the placeholder `"Member of ICAI"` to the real numeric M.No. (passed in by Sagar). Reference it in the Principal section as `<dt>ICAI M.No.</dt><dd>{founder.icaiMembershipNo}</dd>`.

---

## 2. UI / Visual Design

### 2.1 Findings

1. **Opacity-on-CSS-variable bug (A6).** The page uses `zone-text/60`, `zone-text-muted/80`, `text-white/10` etc. These work when the underlying class resolves to a single Tailwind color, but `zone-text` is a custom utility set as `color: var(--zone-text)`. Tailwind's slash-opacity syntax silently fails on arbitrary `color: var(...)` declarations unless the variable is declared with the `<r> <g> <b>` channel form and the utility is wired to use `color: rgb(var(--zone-text-rgb) / <alpha-value>)`. The file uses both forms inconsistently → many "muted" texts render at full opacity in editorial zone.
2. **Decorative element bleed.** `<div className="absolute top-0 right-0 w-full h-full opacity-30">` inside the hero plate has `<div ... blur-2xl animate-blob>` which is a heavy filter on a large rect; when paired with the editorial dark zone the blob is barely visible but still costs paint.
3. **Inconsistent rounding.** Cards alternate between `rounded-[2.5rem]`, `rounded-[3rem]`, `rounded-lg`, `rounded-full`. No design token.
4. **`text-brand-moss`** appears in editorial zone (lines 88, 96, 103, 111, 119, 148). Editorial zone's stated accent is `brand-brass` (per `ZONE.md`). The page accepts `accentTone="brass"` for the hero, but the rest of the page hard-codes `brand-moss`. This breaks the zoning convention.
5. **Hover state on the CTA pill (A18):** `bg-white text-brand-moss ... hover:zone-bg hover:zone-text`. In editorial zone `zone-bg` is dark and `zone-text` is light → the *hovered* state is white-on-dark on top of a moss-colored card, but Tailwind applies `bg` and `text` to the same `<Link>`, so the pill becomes dark-on-dark with the moss card behind it. The button visibly disappears on hover.
6. **Selection rule (A11):** `selection:bg-brand-moss selection:zone-text` — `selection:zone-text` is not a real utility (Tailwind's `selection:` variant requires a real color class). The rule silently fails; selection text falls back to default.
7. **Drop shadow `shadow-2xl shadow-brand-moss/30`** on a moss-colored card (line 188) → near-invisible glow, wasted paint cost.
8. **Footer of the leadership card uses a 2-col grid for "Expertise" and "Affiliations" lists** but the affiliations bullets are inconsistent: first item has no `•`, others do.
9. **Long-line measure (A20).** `<p className="text-xl md:text-2xl ... font-medium leading-relaxed mb-8">` has no `max-w-prose` / `max-w-2xl`. On 1440 px display, lines run > 95 ch — uncomfortable.

### 2.2 Plan

**A-UI-1 — Convert all `zone-*` color utilities to channel form.** In `index.css` (or wherever zone tokens are declared), replace direct `color: var(--zone-text)` declarations with channel-aware ones:

```css
/* BEFORE */
.zone-text { color: var(--zone-text); }

/* AFTER */
:root[data-zone="editorial"] {
  --zone-text-rgb: 244 241 234; /* #f4f1ea */
  --zone-text-muted-rgb: 209 200 184;
  --zone-accent-rgb: 184 146 76;
}
.zone-text       { color: rgb(var(--zone-text-rgb) / <alpha-value>); }
.zone-text-muted { color: rgb(var(--zone-text-muted-rgb) / <alpha-value>); }
```

Then in `tailwind.config.cjs`, register them as colors so `zone-text/60` works:

```js
// tailwind.config.cjs
extend: {
  colors: {
    'zone-text':       'rgb(var(--zone-text-rgb) / <alpha-value>)',
    'zone-text-muted': 'rgb(var(--zone-text-muted-rgb) / <alpha-value>)',
    'zone-accent':     'rgb(var(--zone-accent-rgb) / <alpha-value>)',
  },
},
```

Then in `About.tsx`, replace every `zone-text/60`, `zone-text-muted/80` etc. with `text-zone-text/60`, `text-zone-text-muted/80`. The current usage *as a class* (without the `text-` prefix) is also wrong — the component file uses `className="zone-text/60"` which is not a real utility either.

**A-UI-2 — Replace all hard-coded `text-brand-moss` accents in About with `text-zone-accent`.** Hits: lines 88, 96, 103, 111, 119, 148. This makes the page faithful to `data-zone="editorial"`.

**A-UI-3 — Fix CTA hover bug (A18).** Change `hover:zone-bg hover:zone-text` to a safe contrast pair:

```tsx
className="inline-block px-10 py-4 bg-white text-brand-moss font-bold rounded-full text-lg
           hover:bg-brand-dark hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2
           focus-visible:ring-white transition-all duration-300 shadow-lg
           motion-reduce:transition-none"
```

**A-UI-4 — Remove invalid selection variant.** Replace `selection:zone-text` with `selection:text-zone-text` after A-UI-1 lands, OR simply drop it and rely on the global selection style.

**A-UI-5 — Add `max-w-prose` to long paragraphs.** The intro paragraph at lines 70–72 and the founder bio paragraphs at lines 153–158 should use `max-w-prose` (≈ 65 ch).

**A-UI-6 — Normalize border radii.** Introduce `rounded-card` (= `2rem`) and `rounded-bento` (= `3rem`) tokens in tailwind config, then replace bracketed radii in this file.

**A-UI-7 — Fix the affiliations list (line 172–177).** Either prefix every item with the bullet inside JSX or use a styled `<ul role="list" className="list-disc pl-5">`.

---

## 3. Accessibility (a11y)

### 3.1 Findings

1. **No `<main>` landmark (A14).** The whole page is wrapped in `<div data-zone="editorial">`. Screen-reader users cannot jump to main content; the global "skip to main" link (if any) has nowhere to land.
2. **Heading hierarchy (A1).** `HeroFolio` emits `<h1 id="hero-folio-title">`. The page then has four `<h2>`s (Professional Ethics, CA Sagar H R, Contact Us) — fine. But Values cards each have `<h3>` (good), and the leadership card has `<h2>CA Sagar H R</h2>` followed by an `<h4>Expertise</h4>` and `<h4>Affiliations</h4>` — H3 is skipped.
3. **Decorative icons (A3).** `<Target />`, `<ShieldCheck />`, `<TrendingUp />`, `<BookOpen />` are inline-rendered without `aria-hidden`. NVDA/JAWS announce them as "image, image, image".
4. **Decorative blobs/circles** in the hero plate (lines 60–62) lack `role="presentation"` / `aria-hidden`.
5. **Image alt text (A13).** `<OptimizedImage src="/sagar-hr.jpg" alt="CA Sagar H R" />` — alt is acceptable but the surrounding container is purely decorative wrapping; consider `alt="Portrait of CA Sagar H R, Principal Partner."` for context.
6. **Quote without semantic markup (A15).** The quote on line 157 is wrapped in `<p>`. Should be `<blockquote>` with `<cite>` so AT users get the right semantic.
7. **Focus states.** Every `<Link>` and `<button>` on this page relies on the browser default focus ring; the hero CTA explicitly removes/styles its own without a `:focus-visible` outline.
8. **Animations & reduced motion (A7, A12).** `animate-blob` on the hero plate, `animate-fade-in-up` everywhere, and `WordReveal` inside the hero do not all gate on `prefers-reduced-motion: reduce`. `useReducedMotion` exists but is only used by `Reveal` and (presumably) the count-up. Quick scan: `animate-fade-in-up` is a CSS keyframe — it must be wrapped in `@media (prefers-reduced-motion: no-preference) {...}` in `index.css`.
9. **Color contrast (A2).** `zone-text-muted/80` over `bg-noise opacity-[0.15]` over editorial dark bg yields effective ~3.8 : 1, below AA for body text.
10. **Tab order.** No `tabIndex` overrides — fine. But the hero's vertical sideText (`writing-mode: vertical-rl; transform: rotate(180deg)`) is announced backwards by some AT.

### 3.2 Plan

**A-A11Y-1 — Wrap the page in `<main id="main">` instead of `<div>`.** Apply the `data-zone` attribute directly to that `<main>`. Ensure there is exactly one `<main>` on the page.

**A-A11Y-2 — Fix heading hierarchy.** Change `<h4>` at lines 163 and 171 to `<h3>`. The implicit hierarchy then becomes: h1 (hero) → h2 (Professional Ethics, Principal Partner, Contact Us) → h3 (each value card, Expertise, Affiliations).

**A-A11Y-3 — Mark all decorative icons with `aria-hidden="true"` and `focusable="false"`.** Lucide icons accept these props. Apply to every icon inside Values cards and inside any decorative spot.

**A-A11Y-4 — `aria-hidden="true"` on decorative wrappers** (lines 58–62 and 189). They contain only blobs, circles, and noise overlays.

**A-A11Y-5 — Convert the founder pull-quote to a `<blockquote>`:**

```tsx
<blockquote className="border-l-2 zone-border pl-6 italic">
  <p>{founder.quote}</p>
  <footer className="mt-2 not-italic text-sm zone-text-muted">
    — {founder.name}, {founder.title}
  </footer>
</blockquote>
```

Add `quote: "..."` to `CONTACT_INFO.founder` so the string is data-driven.

**A-A11Y-6 — Add a global focus-visible style** in `index.css`:

```css
:focus-visible {
  outline: 2px solid var(--zone-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
```

Then ensure no component does `outline-none` without re-providing a visible focus indicator.

**A-A11Y-7 — Gate keyframe-driven animations on `prefers-reduced-motion`** in `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-blob,
  .animate-fade-in-up,
  [data-animate] { animation: none !important; transition: none !important; }
}
```

**A-A11Y-8 — Color contrast.** Stop layering `bg-noise opacity-[0.15]` over body text regions; restrict the noise to background-only sections with an inner solid surface for text. Bump muted text to a token whose contrast is verified against editorial zone bg:

```css
:root[data-zone="editorial"] { --zone-text-muted-rgb: 218 211 195; } /* AA on #0a0908 */
```

**A-A11Y-9 — sideText rotation.** Wrap the rotated string in `<span aria-hidden="true">` and provide an `<span className="sr-only">` mirror with the same content in correct reading order. Update `HeroFolio.tsx` accordingly.

---

## 4. Performance

### 4.1 Findings

1. **LCP candidate is unclear.** The hero is text-only (good) but the largest paint on first viewport is likely the hero plate at line 57 (16:9 box). Ensure no shifting.
2. **`/sagar-hr.jpg`** is loaded via `OptimizedImage` without `width`, `height`, or `aspectRatio` props — so the wrapper div has no intrinsic ratio → CLS risk on the leadership section as the image arrives.
3. The image has no AVIF / WebP source set. `OptimizedImage` supports `srcAvif` / `srcWebp` — they're just not passed.
4. **Animated blob (`animate-blob`)** uses `filter: blur(2rem)` on a 16rem element — composited but expensive on low-end devices.
5. **Schema JSON** is created in render and re-stringified by `SEO` on every render. Memoize.
6. **No prefetching** of `/contact` route — the only outbound link from this page.
7. Lucide icons are tree-shakeable but `Target, ShieldCheck, TrendingUp, BookOpen` are 4 separate imports — fine.
8. The CSS-zone system runs on every component as cascading vars — fine, but the page sets `data-zone="editorial"` on a non-root element; if `<body>` was already tagged, this adds an extra cascade.

### 4.2 Plan

**A-PERF-1 — Set image dimensions explicitly.**

```tsx
<OptimizedImage
  src="/sagar-hr.jpg"
  srcWebp="/sagar-hr.webp"
  srcAvif="/sagar-hr.avif"
  alt="Portrait of CA Sagar H R, Principal Partner."
  width={320}
  height={400}
  aspectRatio="4/5"
  priority
  generateSrcSet
/>
```

This requires extending `OptimizedImage` props to forward `width`/`height` to the `<img>` element (currently they aren't on the type). Add and forward.

**A-PERF-2 — Memoize schema.** Replace `const schema = { ... }` with `const schema = useMemo(() => ({ ... }), [])`.

**A-PERF-3 — Prefetch the contact route.** Add `<link rel="prefetch" href="/contact">` to `SEO`'s effect when `currentPath === '/about'`, OR add a `prefetch` prop on `<Link>` (React Router 6.4+ with the data router; otherwise use a simple `useEffect` that imports the lazy-loaded route module).

**A-PERF-4 — Defer `animate-blob`** to `content-visibility: auto` on the parent and stop animating off-screen:

```tsx
<section className="..." style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}>
```

**A-PERF-5 — Generate AVIF/WebP variants** at build time using `vite-imagetools` or an explicit script. Add `/sagar-hr.{avif,webp}` to `public/`.

---

## 5. SEO & Structured Data

### 5.1 Findings

1. **Schema is incomplete (A4).** The `AccountingService` `mainEntity` lacks: `address` (PostalAddress), `telephone`, `email`, `url`, `image`, `priceRange`, `openingHoursSpecification`, `geo`, `sameAs`. Google Local Business preview won't render.
2. **No `Person` entity for the founder (A19).** Add a separate `Person` JSON-LD with `worksFor` linking the firm.
3. **No breadcrumbs** are passed to `<SEO>` even though the prop exists.
4. **Canonical URL** defaults to `window.location.href` (good) but ogImage is hard-coded — verify `/og-image.jpg` exists at the deployed root.
5. **Title tag is generic.** "About Sagar H R & Co. | Our Firm" — no Mysuru, no service vertical. Lower CTR.
6. **Description** does not contain "Mysuru" twice or the founder name; loses local-search relevance.
7. The page does not have an `og:type="profile"` though it's the founder's page.
8. **No `lang`-attribute review** at the page level (lives in `index.html`).

### 5.2 Plan

**A-SEO-1 — Replace the schema block** with a richer LocalBusiness + AboutPage + Person triple:

```ts
const schema = useMemo(() => [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://casagar.co.in/about",
    "name": `About ${CONTACT_INFO.name}`,
    "description": `Profile of ${CONTACT_INFO.name}, a Chartered Accountancy practice in Mysuru, Karnataka.`,
    "primaryImageOfPage": "https://casagar.co.in/og-image.jpg"
  },
  {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": "https://casagar.co.in/#organization",
    "name": CONTACT_INFO.name,
    "url": "https://casagar.co.in",
    "telephone": CONTACT_INFO.phone.value,
    "email": CONTACT_INFO.email,
    "image": "https://casagar.co.in/og-image.jpg",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT_INFO.address.street,
      "addressLocality": CONTACT_INFO.address.city,
      "addressRegion": CONTACT_INFO.address.state,
      "postalCode": CONTACT_INFO.address.zip,
      "addressCountry": CONTACT_INFO.address.country
    },
    "geo": { "@type": "GeoCoordinates",
             "latitude": CONTACT_INFO.geo.latitude,
             "longitude": CONTACT_INFO.geo.longitude },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "10:00", "closes": "20:00"
    }],
    "sameAs": [CONTACT_INFO.social.linkedin],
    "knowsAbout": ["Taxation","Audit","Financial Advisory","GST","Company Law"],
    "founder": { "@id": "https://casagar.co.in/#founder" }
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://casagar.co.in/#founder",
    "name": "CA Sagar H R",
    "givenName": "Sagar",
    "familyName": "H R",
    "jobTitle": "Principal Partner",
    "worksFor": { "@id": "https://casagar.co.in/#organization" },
    "memberOf": { "@type": "Organization", "name": "Institute of Chartered Accountants of India" },
    "image": "https://casagar.co.in/sagar-hr.jpg",
    "sameAs": [CONTACT_INFO.social.linkedin]
  }
], []);
```

**A-SEO-2 — Pass breadcrumbs to `<SEO>`:**

```tsx
breadcrumbs={[
  { name: 'Home',  url: '/' },
  { name: 'About', url: '/about' },
]}
```

**A-SEO-3 — Better title & description:**

```tsx
title={`${CONTACT_INFO.name} — Chartered Accountants in Mysuru | About the Firm & Principal`}
description={`${CONTACT_INFO.founder.name}, ACA, leads ${CONTACT_INFO.name} from Mysuru — a small practice in audit, tax, GST and ROC compliance. Read about how we work.`}
ogType="profile"
```

**A-SEO-4 — Render visible breadcrumbs** above the hero using `components/Breadcrumbs.tsx` (already exists per the file listing).

---

## 6. Code Quality & Maintainability

### 6.1 Findings

1. `import * as ReactRouterDOM from 'react-router-dom';` then `const { Link } = ReactRouterDOM;` is a Vite-friendly workaround but the rest of the codebase has at least three other patterns (`import { Link }`, `import { Link as RRDLink }`, etc). Inconsistent.
2. The schema literal is built inside the component on every render.
3. JSX has heavy inline string concatenation in className. Hard to scan, hard to lint for typos like `selection:zone-text`.
4. There is **no test** for `pages/About.tsx` (others exist: `Contact.test.tsx`, `FAQ.test.tsx`).
5. There is no Storybook story or visual regression test.
6. Magic numbers in `style={{ animationDelay: '0.2s' }}` are scattered — a `Stagger` helper would be cleaner.
7. `OptimizedImage` requires `imgClassName` for `object-cover` — easy to forget.
8. The file is heading toward the *"god page"* anti-pattern. It should be split into `pages/About.tsx` (composition) and `pages/about/{Snapshot,Values,Principal,Office,Cta}.tsx`.

### 6.2 Plan

**A-CQ-1 — Split file.** Create `pages/about/` directory with:
- `Snapshot.tsx`
- `HowWeWork.tsx`
- `Values.tsx`
- `Principal.tsx`
- `Office.tsx`
- `Cta.tsx`
- `schema.ts`

Then `pages/About.tsx` just composes them in order.

**A-CQ-2 — Move schema to `pages/about/schema.ts`** as a pure function `buildAboutSchema(contact: typeof CONTACT_INFO)` returning `(object | object[])`. Memoize at the call site.

**A-CQ-3 — Add a Vitest smoke test** at `pages/About.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from './About';

test('renders the About page hero', () => {
  render(<MemoryRouter><About /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /book consultation/i })).toBeInTheDocument();
});
```

**A-CQ-4 — Remove `import * as ReactRouterDOM`.** Use `import { Link } from 'react-router-dom'` and configure Vite's `optimizeDeps.include` if the workaround was for ESM CJS interop.

**A-CQ-5 — Replace inline animation delays** with a `<Stagger delay={0.1}>` helper that maps children to `style.animationDelay`.

**A-CQ-6 — Lint rules.** Add `eslint-plugin-tailwindcss` so invalid utilities (`zone-text/60` without `text-` prefix, `selection:zone-text`) get flagged.

---

## 7. Security & Privacy

### 7.1 Findings

1. The page has **no user-supplied content / no forms / no third-party iframes today** — surface is small.
2. Once the office map iframe is added (A-IA-4), three security items must be handled: `sandbox`, `referrerPolicy`, and consent gating (Google Maps sets cookies).
3. JSON-LD is injected via `script.text = JSON.stringify(data)` in `SEO.tsx` — safe from XSS as long as the source object is statically authored, but if any future field comes from URL params, sanitize. Add a `JSON.stringify` replacer that strips function/Date.
4. `<a href={`tel:${CONTACT_INFO.phone.value}`}>` (introduced in `ConsultationBanner`) — verify `phone.value` has no spaces / dashes to avoid odd phone-app behavior. Currently `+919482359455` — good.
5. Image `<img src="/sagar-hr.jpg">` — make sure CSP allows `'self'` for img-src once a CSP is added.
6. Outbound LinkedIn link (when the founder section is enriched) needs `rel="me noopener noreferrer"` and `target="_blank"`.

### 7.2 Plan

**A-SEC-1 — Map iframe attributes.**

```tsx
<iframe
  title="Office location, Sagar H R & Co., Mysuru"
  src={CONTACT_INFO.geo.mapEmbedUrl}
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  allowFullScreen
  className="w-full aspect-[16/10] rounded-card"
  sandbox="allow-scripts allow-same-origin allow-popups"
/>
```

Wrap behind a `CookieConsent` gate using the existing `components/CookieConsent.tsx` if not already.

**A-SEC-2 — JSON-LD safety.** Update `SEO.tsx` to escape `</` sequences in JSON to avoid premature `</script>` interpretation: `JSON.stringify(data).replace(/</g, '\\u003c')`.

**A-SEC-3 — External link hygiene.** When LinkedIn link is rendered in the Principal section, use `rel="me noopener noreferrer" target="_blank"` and an off-site icon plus `<span className="sr-only"> (opens in new tab)</span>`.

---

## 8. Internationalization, Localization & Tone

### 8.1 Findings

1. Page mixes British English ("organisation"-style spelling not used; uses "practises" — British) with Indian-English idioms. Pick one and stay consistent.
2. The hero blurb says *"third year of practice"* — this will become stale automatically. Better expressed as `Est. 2023` or computed from `CURRENT_FY`.
3. Currency, dates, and phone formatting are India-correct. Good.
4. No `lang` markers on phrase mixes (e.g. quoted ICAI text). Not critical.

### 8.2 Plan

**A-I18N-1 — Compute "year of practice"** instead of hard-coding:

```tsx
const yearsInPractice = new Date().getFullYear() - Number(CONTACT_INFO.stats.established);
const blurb = `Sagar H R practises as the sole proprietor of the firm. ACA member of the ICAI; ${yearsInPractice}${ordinalSuffix(yearsInPractice)} year of practice. He reads every working paper and signs every certificate.`;
```

**A-I18N-2 — Spelling pass.** Run through the page once for British English consistency (`practise/practice`, `organisation`, `programme`).

---

## 9. Analytics, Telemetry & Conversion

### 9.1 Findings

1. The page has a single CTA ("Book Consultation"). No tracking — we can't tell whether users scroll past Values to the CTA.
2. The "Contact Us" CTA leads to `/contact` but there is no fallback for users who want to talk *now* (no tel/WhatsApp here — `ConsultationBanner` has them but is not used on About).

### 9.2 Plan

**A-ANALYTICS-1 — Replace the bespoke CTA section** with `<ConsultationBanner />` (already exists, used on Services). It includes the WhatsApp/phone fallback.

**A-ANALYTICS-2 — Wire scroll-depth analytics.** Add a `useTrackScrollDepth('about')` hook (light, 25/50/75/100 markers) that posts to whatever analytics endpoint is wired in `utils/api.ts` (or no-ops if disabled).

**A-ANALYTICS-3 — Add `data-cta="about-bottom-book"` and `data-cta="about-call"`** attributes to the CTAs so events can be tagged once analytics ships.

---

## 10. Concrete Codex Worklist (ordered)

> Each item references the finding ID. Codex should execute top-to-bottom and create commits at the marked checkpoints.

1. **A-A11Y-1** — Wrap page in `<main id="main">` and move `data-zone="editorial"` onto it.
2. **A-A11Y-2** — Promote the two `<h4>`s in the Principal section to `<h3>`.
3. **A-A11Y-3** — Add `aria-hidden="true"` to all Lucide icons in this file.
4. **A-A11Y-4** — Add `aria-hidden="true"` to decorative wrappers at lines 58–62 and 189.
5. **A-UI-3 (A18)** — Fix CTA hover classes (illegibility bug). [⏸ commit]
6. **A-UI-4 (A11)** — Replace `selection:zone-text` with `selection:text-zone-text` (and rely on A-UI-1).
7. **A-UI-1 (A6)** — Convert all `zone-*` color utilities to channel form across `index.css`, `tailwind.config.cjs`, and this file. Run a search/replace for `zone-text/`, `zone-text-muted/` → `text-zone-text/`, `text-zone-text-muted/`.
8. **A-UI-2** — Replace hard-coded `text-brand-moss` with `text-zone-accent` on all 6 occurrences in this file.
9. **A-UI-5** — Add `max-w-prose` to long paragraphs at lines 70–72 and 153–158.
10. **A-PERF-1 (A13)** — Extend `OptimizedImage` to forward `width`/`height` and pass them in. Add `srcWebp`/`srcAvif`. [⏸ commit]
11. **A-PERF-2** — Memoize schema with `useMemo`.
12. **A-A11Y-5 (A15)** — Convert founder quote to `<blockquote>` and add `quote` to `CONTACT_INFO.founder`.
13. **A-A11Y-7** — Add reduced-motion gate in `index.css`.
14. **A-A11Y-9** — Fix `HeroFolio` sideText for AT.
15. **A-SEO-1 (A4, A19)** — Replace schema with the LocalBusiness + AboutPage + Person triple in a new `pages/about/schema.ts`. [⏸ commit]
16. **A-SEO-2** — Pass `breadcrumbs` prop to `<SEO>`.
17. **A-SEO-3** — Update `title` and `description` props.
18. **A-CQ-1** — Split into `pages/about/{Snapshot,HowWeWork,Values,Principal,Office,Cta}.tsx`. (A-IA-1 lands as part of this split.) [⏸ commit]
19. **A-IA-2** — Replace placeholder Est. card with the snapshot dl.
20. **A-IA-3** — New "How we work" section.
21. **A-IA-4 / A-SEC-1** — New "Office & visiting" section + map iframe.
22. **A-IA-5** — Add real ICAI M.No. to `CONTACT_INFO.founder`.
23. **A-ANALYTICS-1** — Replace bespoke bottom CTA with `<ConsultationBanner />`.
24. **A-CQ-3** — Add `pages/About.test.tsx` smoke test.
25. **A-I18N-1** — Compute years-in-practice dynamically.
26. **A-CQ-6** — Enable `eslint-plugin-tailwindcss`. [⏸ commit]

---

## 11. Acceptance Criteria

The audit is "done" when, on the deployed branch:

- Lighthouse (mobile): Performance ≥ 90, A11y = 100, Best Practices ≥ 95, SEO = 100.
- axe DevTools: 0 critical/serious issues.
- Pa11y CI: 0 errors at AA.
- Page renders one `<main>`, one `<h1>`, no skipped heading levels.
- Rich Results test passes for AccountingService + Person + AboutPage.
- The page passes a manual run-through with `prefers-reduced-motion: reduce`, `forced-colors: active`, and screen reader (NVDA + Voiceover) — every section announces a meaningful name and the founder pull-quote is announced as a quotation.
- A new client landing on `/about` cold can answer in ≤ 30 seconds: who runs the firm, where it is, what it does, how to engage.

---

## 12. Out-of-scope items spotted while auditing (parking lot)

- `OptimizedImage` does not currently forward `width`/`height` to `<img>` — fix in shared component, not About-specific.
- `HeroFolio` re-defines the accent line with two patterns; consolidate.
- `ZONE.md` says `brand-moss` is the default action even in editorial zone — but the convention is broken in many other pages. Worth a separate sweep.
- `SEO.tsx` rebuilds the schema scripts on every prop change with `data-dynamic-schema`; cleanup is correct, but the function should accept arrays cleanly (current signature accepts `object | object[]`, but the inner code only handles a single object via `addSchema('schema', schema)` — verify behavior with array inputs).
- `useInsights`/`useResourceData` should expose a stale-while-revalidate cache; cross-page concern.
