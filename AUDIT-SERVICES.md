# Audit Plan — `pages/Services.tsx`

> Scope: Exhaustive multi-axis audit of the **Services** page. Each finding is paired with a concrete *what to do* and *how to do it* so it can be executed verbatim by Codex (ChatGPT) with no further clarification.
>
> Files in scope: `pages/Services.tsx` (≈85 LoC) + tightly-coupled descendants `components/ServiceBento.tsx`, `components/IndustrySpotlight.tsx`, `components/ConsultationBanner.tsx`, `components/hero/HeroSplit.tsx`, plus the data layer `constants/services.tsx` and `constants/industries.tsx`.
>
> Page route: `/services`. Default zone (no `data-zone`): "Moss" / `brand-moss` accents.

---

## 0. TL;DR — Severity Heatmap

| # | Issue | Axis | Severity | Effort |
|---|---|---|---|---|
| S1 | `ServiceBento` switches card styles by **array index** — re-ordering services breaks the layout silently | code quality / maintainability | High | M |
| S2 | "Premium dark" cards (Litigation, Payroll) use `text-zinc-500` for description on `bg-brand-black` → 3.4:1 contrast (fails AA body text) | a11y | High | XS |
| S3 | Service cards rendered as `<Link>` with `aria-label="View details for X"`, then place a heading inside — heading content is hidden from AT (overridden by `aria-label`) | a11y | High | XS |
| S4 | "GST Services" service has copy duplicated between card title (`GST Services`) and `SERVICE_DETAILS` title (`GST Registration & Filing`) — inconsistent surface | content | Medium | S |
| S5 | `IndustrySpotlight` mouse-tracking effect runs even on mobile / touch — wasted RAF | perf | Low | XS |
| S6 | The eight services are stuffed into a 9-cell bento where the 9th is a "Need Expert Guidance?" CTA — but on `md` breakpoint the layout breaks (see math below) | UI bug | High | S |
| S7 | No service-level filtering, no industry filtering, no "what fits me" wizard — the page is purely brochure-like | features | Medium | L |
| S8 | Service icons defined in `constants/services.tsx` are **never rendered** in `ServiceBento` (icons are imported but the component does not display them) | UI bug | High | XS |
| S9 | `IndustrySpotlight` clones icons via `React.cloneElement(ind.icon as React.ReactElement<{size?: number}>, { size: 18 })` but the icon is created with `<Factory className="w-6 h-6" />` — `size` and `className` then conflict | UI bug | Low | S |
| S10 | Schema `CollectionPage > ItemList` doesn't include `image`, `serviceType`, `provider.address`, or pricing range | SEO | Medium | S |
| S11 | Service URLs in schema use `https://casagar.co.in/services/${id}` — but the actual route emits `service.link` (which is also `/services/{id}`); duplication is fine but if the link constant ever changes the schema goes stale | code quality | Low | XS |
| S12 | `<ConsultationBanner />` runs a 500x500 + 300x300 blurred radial which paints on every page with the banner; no `prefers-reduced-motion` gate | perf / a11y | Low | XS |
| S13 | No `<main>` landmark on this page either; same as About | a11y | High | XS |
| S14 | "Industries We Serve" card grid uses `<div>` with no role / no link — clickable feel without action; users will try to click | UX | Medium | M |
| S15 | "Industry not listed? Contact Us" CTA tone uses `text-brand-brass` accent — fine, but on hover the entire button inverts to `bg-white text-black` and the brass turns black: arrow icon vanishes against white because of inheritance | UI | Low | XS |
| S16 | `ServiceBento` is a `React.memo` with no props → memoization is vacuous (component never re-renders anyway). Cargo-cult code. | code quality | Low | XS |
| S17 | `index === 6` (Bookkeeping) has no override — accidental cell. Combined with S6 makes the layout look unintentional. | UI / content | Medium | S |
| S18 | No internal cross-links between related services (e.g., GST ↔ Litigation when notice received; Audit ↔ Income Tax for tax audit) | UX / SEO interlinking | Medium | M |
| S19 | No "engagement model / fees" section — biggest pre-sale question for a CA firm is unanswered | UX / conversion | High | M |
| S20 | `aria-labelledby="hero-split-title"` references a heading that may not exist if hero variant is overridden in future | a11y | Low | XS |
| S21 | `IndustrySpotlight` listens to `mousemove` but never debounces; also reads `getBoundingClientRect()` in the RAF — fine, but no `passive: true` flag | perf | Low | XS |
| S22 | Schema generator iterates `SERVICES` but `ServiceDetail` route is registered as `/services/:id` — confirm route param name matches `service.id` | bug-risk | Low | XS |
| S23 | No mention of FY 2025-26 / AY 2026-27 anywhere on the page even though `CONTACT_INFO.assessmentYear`/`financialYear` are computed; opportunity for "current-period readiness" copy | content | Medium | S |
| S24 | The page is a pure brochure — there is no comparison matrix, no scope vs. out-of-scope list, no SLA, nothing that a B2B buyer would screen-grab | UX / conversion | Medium | L |
| S25 | "Industries We Serve" intro copy uses tabular alignment `text-right md:text-left` — the right-alignment on small screens looks like a typo | UI | Low | XS |

---

## 1. Information Architecture & Content Strategy

### 1.1 Findings

1. **Three-section structure today:** Hero (`HeroSplit`) → Bento grid (`ServiceBento`) → Industries (`IndustrySpotlight`) → CTA (`ConsultationBanner`). For a CA firm services page, the expected sections are: hero → service grid → engagement model → industries → fees / packages → testimonials → FAQ → CTA. Today only 4 of 8 are present.
2. **Service cards are flat.** Each card shows title + 1-line description + arrow. No icon, no bullets, no fee hint, no compliance calendar. Once a user lands on a card they have no reason to click — they cannot tell whether it's a one-time filing, a retainer, or both.
3. **Discovery is poor.** `INDUSTRIES` (8 verticals) and `SERVICES` (8 disciplines) are siloed. A real visitor thinks vertically ("I'm a startup → which services do I need?") not horizontally ("I want GST → where do I go?").
4. **No FAQ on the services page.** `constants/faq.ts` exists; the page does not pull from it.
5. **Missing reassurance signals:** ICAI affiliation, response SLA, sample reports, audit timeline.
6. **Service titles inconsistent** with their detail pages (S4): "GST Services" vs detail "GST Registration & Filing", "Litigation Support" vs detail "Litigation Support" (consistent), "Audit & Assurance" vs "Audit & Assurance" (consistent), "Bookkeeping" vs "Bookkeeping & Accounting", "Payroll" vs "Payroll Management".

### 1.2 Plan

**S-IA-1 — Extend the page to 7 narrative sections.** Add between `<IndustrySpotlight />` and `<ConsultationBanner />`:

```
A. Hero (HeroSplit, kept)
B. Service grid (ServiceBento, but redesigned — see S-UI-1)
C. Engagement model (NEW — retainer vs assignment, pricing tiers, response SLA)
D. By industry (rotated IndustrySpotlight — clickable, each card opens a filtered service list)
E. FAQ (NEW — pulls from constants/faq.ts, top 5 questions tagged "services")
F. What we don't do (NEW — boundaries, e.g., "We do not undertake forensic audits, we do not represent before SEBI")
G. CTA (ConsultationBanner, kept)
```

**S-IA-2 — Rename services to match their canonical detail-page titles.** Update `constants/services.tsx → SERVICES[i].title` to match `SERVICE_DETAILS[i].title`:

| current | rename to |
|---|---|
| GST Services | GST Registration & Filing |
| Income Tax | Income Tax Services |
| Bookkeeping | Bookkeeping & Accounting |
| Payroll | Payroll Management |

**S-IA-3 — Add a `tags` field per service** in the data layer to enable industry × service filtering:

```ts
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  tags?: Array<'startup' | 'msme' | 'individual' | 'export-import' | 'real-estate' | 'professional' | 'manufacturing' | 'retail' | 'tech' | 'healthcare'>;
  cadence?: 'one-time' | 'monthly' | 'quarterly' | 'annual' | 'event-based';
  feeBand?: 'individual' | 'msme' | 'corporate';
}
```

**S-IA-4 — Per-card metadata strip.** Each bento card should display 3 micro-tags: `Cadence · Typical client · Indicative fee band`. This solves S19/S24 in a single move.

**S-IA-5 — Add a 1-line "starts at" indicative fee** per service (Codex should ask Sagar before committing real numbers; for now use placeholder `₹—` and a `data-needs-figure="true"` attribute so it's grep-able).

---

## 2. UI / Visual Design

### 2.1 Findings

1. **Index-based styling (S1)** is fragile. `ServiceBento.tsx` line 25–66 hard-codes `if (index === 0)`, `if (index === 1)`, etc. Reorder a service in `constants/services.tsx` and the visual hierarchy collapses.
2. **`md` breakpoint math is wrong (S6).** With 8 services + 1 CTA = 9 cells:
   - `index 0` (GST) takes **2 cols** → row 1 fully used.
   - `index 1` (Income Tax) → 1 col on row 2.
   - `index 2` (Company Law) → 1 col on row 2 (row 2 full at md).
   - `index 3` (Litigation) → **2 cols** → row 3 fully used.
   - `index 4` (Advisory) → 1 col on row 4.
   - `index 5` (Audit) → 1 col on row 4 (row 4 full at md).
   - `index 6` (Bookkeeping) → 1 col on row 5.
   - `index 7` (Payroll) → **2 cols** → wraps to row 6, leaving an awkward orphan in row 5.
   - CTA → 1 col on row 6 next to Payroll.
   At `md`, this leaves Bookkeeping floating on its own row. At `lg` (3-col), the math also produces a half-empty row. Verify visually.
3. **Icons defined but never rendered (S8).** The card UI shows only an `ArrowUpRight` button; the lovingly-curated `<FileText>`/`<Calculator>`/`<Building2>`/etc. icons in `SERVICES[i].icon` go unused.
4. **Contrast on dark cards (S2).** `text-zinc-500` (#71717a) on `from-zinc-800 ... to-brand-black` ≈ 3.4:1 → **fails WCAG AA for body text** (need 4.5:1).
5. **Top-border reveal animation** (`group-hover:w-full`) is a slick effect but on the dark cards it uses a green→lime gradient that competes with brass-themed accents in IndustrySpotlight just below.
6. **`rounded-[2rem]`** here vs `rounded-[3rem]` in About vs `rounded-3xl` in IndustrySpotlight cards — three border-radii within 200 px of vertical scroll.
7. **CTA card "Need Expert Guidance?"** uses `bg-gradient-to-br from-brand-moss to-[#15803d]` — that second hex is Tailwind's `green-700`. Using a non-brand color directly is a tokenization smell.
8. **Industries cards are `<div>` not links (S14).** They have `group/card` hover transform and a brass-tinted hover overlay → users *expect* clickability.
9. **Right-aligned blurb on mobile (S25)** in `IndustrySpotlight`: `text-right md:text-left`. Should be `text-left` always or rephrased so it reads on its own.
10. **`hover:bg-white hover:text-black`** on the bottom "Industry not listed?" pill — when text becomes `black`, the brass arrow icon (set as a child via `text-brand-brass group-hover:text-black`) becomes black-on-white, but the arrow becomes invisible on the same white pill if the user moves over the icon directly.

### 2.2 Plan

**S-UI-1 — Re-key card variants by `service.id`, not array index.** In `ServiceBento.tsx`, replace the `if (index === 0)…else if (index === 7)…` chain with:

```ts
const VARIANT: Record<string, {
  span: string;
  container: string;
  textTitle: string;
  textDesc: string;
  arrowBtn: string;
}> = {
  'gst':         { span: 'md:col-span-2', container: '...', textTitle: '...', textDesc: '...', arrowBtn: '...' },
  'income-tax':  { span: 'md:col-span-1', container: 'bg-gradient-to-br from-brand-moss to-[#0f2e1b] ...', /* … */ },
  'company-law': { span: 'md:col-span-1', container: '...', /* … */ },
  'litigation':  { span: 'md:col-span-2', container: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-brand-black ...', /* … */ },
  'advisory':    { /* … */ },
  'audit':       { /* … */ },
  'bookkeeping': { /* … */ },
  'payroll':     { span: 'md:col-span-2', /* … */ },
};
const v = VARIANT[service.id] ?? VARIANT['_default'];
```

This makes order in `constants/services.tsx` decoupled from layout intent.

**S-UI-2 — Render the icon inside each card.** Top-left of the card:

```tsx
<div className="relative z-10 flex justify-between items-start mb-6">
  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.iconWrap}`}>
    {React.cloneElement(service.icon as React.ReactElement<{size?: number; className?: string}>, {
      size: 18,
      className: undefined,   // strip the w-6 h-6 the constant carries
      'aria-hidden': true,
    })}
  </div>
  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border ${v.arrowBtn}`}>...</div>
</div>
```

Update `constants/services.tsx` so icons are stored as **components** (not elements) to avoid the `cloneElement`/className collision:

```ts
icon: FileText, // not <FileText className="w-6 h-6" />
```

Then `<service.icon size={18} aria-hidden="true" />` at render time. Also fixes S9 in IndustrySpotlight when applied there.

**S-UI-3 — Fix dark-card description contrast (S2).** Change `text-zinc-400`, `text-zinc-500` to `text-zinc-300` (4.6:1 on `#0a0908`) and re-test with axe.

**S-UI-4 — Layout math (S6/S17).** Decide the bento layout intentionally. Recommended grid (8 services + CTA):

```
md (2 cols, 6 rows):                   lg (3 cols, 4 rows):
┌─────────────┬──────┐                 ┌──────────┬──────────┬──────────┐
│ GST (2)             │                 │ GST (2)             │ INC-TAX  │
├──────┬──────────────┤                 ├──────────┴──────────┼──────────┤
│ I-TAX│ COMPLAW      │                 │ COMPLAW  │ AUDIT    │ ADVISORY │
├──────┴──────────────┤                 ├──────────┼──────────┴──────────┤
│ LITIG (2)           │                 │ BOOKKP   │ LITIG (2)           │
├──────┬──────────────┤                 ├──────────┼──────────┬──────────┤
│ ADV  │ AUDIT        │                 │ PAYROLL  │ CTA      │  ←       │
├──────┴──────┬───────┤                 └──────────┴──────────┴──────────┘
│ BOOKKP      │ PAYRL │
├─────────────┴───────┤
│ CTA                 │
└─────────────────────┘
```

Or simpler: **make every card 1×1 and remove the 2-col wide cards** so the layout is bulletproof and reads as a clean 4×2 + CTA grid.

**S-UI-5 — Make industry cards clickable (S14).** Convert `<div>` to `<Link to={`/services?industry=${slug(ind.title)}`}>` and add `hover:-translate-y-1 focus-visible:ring-2`.

**S-UI-6 — Normalize border radii** — see About audit S2, same fix applies.

**S-UI-7 — Fix the "Industries We Serve" intro copy alignment** (S25): change `text-right md:text-left` to `text-left`.

**S-UI-8 — Fix the bottom outline pill (S15).** Replace the brass arrow with a fixed-color version that has its own contrast story:

```tsx
<ArrowUpRight size={16} className="text-brand-brass group-hover:text-brand-moss transition-colors" />
```

---

## 3. Accessibility (a11y)

### 3.1 Findings

1. **No `<main>`** wrapping the content (S13).
2. **Service-card heading hidden by `aria-label`** (S3). When a `<Link aria-label="View details for GST Services">` contains an `<h3>GST Services</h3>` and `<p>...</p>`, AT users hear only "View details for GST Services, link" — the description is dropped.
3. **Cards' clickable area is the whole `<Link>`** but they also include nested interactive elements? — Today, no, just decoration. Good.
4. **`aria-labelledby="hero-split-title"`** on the section is correct but if `HeroSplit`'s structure changes the label could break silently (S20).
5. **Lucide icons everywhere lack `aria-hidden="true"`** (same finding as About).
6. **`mousemove` spotlight on `IndustrySpotlight`** has no keyboard equivalent — fine, it's purely decorative; just ensure the page is fully usable without a pointer.
7. **Industry "cards" have no role** but get hover transform — confusing to AT users.
8. **Color is the only signal of card category.** Premium dark cards vs light cards convey something (Litigation = serious, Advisory = warm, GST = featured) but there's no text equivalent. AT users miss the hierarchy entirely.
9. **The "Need Expert Guidance?" CTA card** has no `aria-label`. The visible text "Book Consultation" + heading "Need Expert Guidance?" is reasonable, but if the small "Get Started" pill is decorative it should be `aria-hidden`.
10. **Focus order** in the bento depends on grid cell order, which is not the visual order on `md:col-span-2` cards. Verify with keyboard.

### 3.2 Plan

**S-A11Y-1 — Wrap page in `<main id="main">`** as in About audit.

**S-A11Y-2 — Drop `aria-label` from service `<Link>`** so heading and description are read. Add an `<span className="sr-only">View details</span>` near the arrow icon for the "click to enter" affordance:

```tsx
<Link to={service.link} className="...">
  ...
  <h3>{service.title}</h3>
  <p>{service.description}</p>
  <span className="sr-only">View details about {service.title}</span>
</Link>
```

**S-A11Y-3 — Mark all decorative Lucide icons** with `aria-hidden="true"` and `focusable="false"`. Add a Vitest unit-test that asserts every `lucide-react` icon imported into this file is rendered with `aria-hidden`.

**S-A11Y-4 — Make industry tiles tabbable links** (see S-UI-5). Add `aria-describedby` if the description is too long for the link name.

**S-A11Y-5 — Ensure focus ring is visible on dark cards.** Add to global CSS:

```css
.card-surface-hover:focus-visible {
  outline: 2px solid var(--zone-accent);
  outline-offset: 4px;
}
```

**S-A11Y-6 — Provide a non-color hierarchy cue.** Add an eyebrow line above each title saying its category (`Tax · Compliance · Advisory · Audit`). Already grouped logically; surface in text:

```tsx
<span className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">{service.group}</span>
```

**S-A11Y-7 — Skip-link target.** If the global skip-link points at `#main`, ensure the wrapping `<main>` has `id="main"` and `tabIndex={-1}` so focus lands there cleanly.

---

## 4. Performance

### 4.1 Findings

1. **`IndustrySpotlight` mouse-tracker (S5/S21)** runs even on touch devices and even when the section is off-screen. RAF + getBoundingClientRect is cheap but compounds with the 4×4 hover transitions.
2. **`ConsultationBanner`** has two large blurred radials (`blur-[100px]`, `blur-[80px]`) that paint every frame on color-managed displays.
3. **Eight services × Reveal × IntersectionObserver = 8+ observers in the bento.** Reveal uses a *shared* observer — verified in `Reveal.tsx`. Good.
4. **`React.memo(ServiceBento)` (S16)** is meaningless — no props.
5. **No prefetching** of `/services/{id}` routes when a card is hovered. With 8 cards, hover prefetch is a strong UX win.
6. **Schema generation** runs on every render (no `useMemo`).
7. The page is 4 large sections; consider `content-visibility: auto` on Industries and CTA banner.

### 4.2 Plan

**S-PERF-1 — Gate the spotlight effect on hover-capable pointer**:

```ts
useEffect(() => {
  if (variant === 'compact') return;
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq.matches) return;
  // ...existing handler
}, [variant]);
```

Also bail if `prefers-reduced-motion: reduce`.

**S-PERF-2 — Remove `React.memo` from `ServiceBento`.**

**S-PERF-3 — Memoize schema** with `useMemo` keyed on `SERVICES`.

**S-PERF-4 — Hover-prefetch service routes.** In each card:

```tsx
const navigate = useNavigate();
const prefetch = useCallback(() => {
  // If routes are lazy: import('../pages/ServiceDetail');
  // Or: link rel=prefetch to the data JSON.
}, [service.id]);

<Link to={service.link} onMouseEnter={prefetch} onFocus={prefetch}>
```

**S-PERF-5 — Add `content-visibility: auto`** on `<IndustrySpotlight>` and `<ConsultationBanner>` containers with `contain-intrinsic-size: 800px`.

**S-PERF-6 — Use `React.Profiler`** in dev mode to verify no waste re-renders when scrolling. (One-time check.)

---

## 5. SEO & Structured Data

### 5.1 Findings

1. **`CollectionPage`-only schema (S10).** Each service should have its own `Service` schema (handled by detail pages) but the index page should include enough to chain them. Include `provider`, `areaServed`, `priceRange` at the parent level.
2. **No `ItemList` `numberOfItems`** — Google ignores partial lists.
3. **Schema URL is hard-coded** (`https://casagar.co.in/services/${id}`) duplicating `service.link` (S11).
4. **Title** "Professional CA Services in Mysuru | Audit, Tax & Advisory" — good keywords, but lacks branded suffix. Should end with the firm name.
5. **No FAQ schema** despite the FAQ section we are about to add.
6. **No internal-link breadcrumb passed to SEO**.
7. **No `og:image` per page** — defaults to global `og-image.jpg`, fine if the image was designed to represent services.

### 5.2 Plan

**S-SEO-1 — Replace schema with the ItemList + provider + breadcrumb triple:**

```ts
const SITE = 'https://casagar.co.in';
const schema = useMemo(() => [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Professional CA Services",
    "url": `${SITE}/services`,
    "description": "Audit, GST, Income Tax, Company Law, Advisory, Bookkeeping, Payroll services from Mysuru.",
    "isPartOf": { "@id": `${SITE}/#website` },
    "about": SERVICES.map(s => s.title),
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": SERVICES.length,
      "itemListElement": SERVICES.map((service, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE}${service.link}`,
        "name": service.title,
        "description": service.description
      }))
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${SITE}/#organization`,
    "name": CONTACT_INFO.name,
    "areaServed": "Karnataka, India",
    "telephone": CONTACT_INFO.phone.value,
    "address": { "@type":"PostalAddress", /* …same as About audit S-SEO-1 */ },
    "priceRange": "₹₹"
  }
], []);
```

**S-SEO-2 — Pass breadcrumbs:**

```tsx
breadcrumbs={[
  { name: 'Home',     url: '/' },
  { name: 'Services', url: '/services' },
]}
```

**S-SEO-3 — Better title/description:**

```tsx
title={`Services — Audit · Tax · GST · Advisory | ${CONTACT_INFO.name}`}
description={`Eight disciplines of chartered-accountancy practice from Mysuru: GST, Income Tax, Company Law, Litigation, Advisory, Audit, Bookkeeping, and Payroll. Engagement options: retainer or assignment.`}
```

**S-SEO-4 — Pull URLs from `service.link`** in schema, not hard-coded paths (fixes S11).

**S-SEO-5 — Add FAQ schema** when the FAQ block (S-IA-1) lands. Use `<SEO faqs={...} />` prop that already exists in the component.

---

## 6. Code Quality & Maintainability

### 6.1 Findings

1. Same `import * as ReactRouterDOM` pattern issue.
2. `ServiceBento` has 70 lines of branching logic that should live in a configuration map.
3. `IndustrySpotlight` exposes `variant` only as `'default' | 'compact'`; the default variant is enormous and the `useEffect` mouse handler should be its own hook (`useSpotlight(ref)`).
4. `services.tsx` uses `.tsx` extension because of JSX in `icon`. After S-UI-2, icons become components — the file can be `.ts`.
5. No tests for `ServiceBento` or `IndustrySpotlight`. There is `Contact.test.tsx`, `FAQ.test.tsx` but no Services tests.
6. Hard-coded gradient hexes (`#15803d`, `#0f2e1b`) in JSX. Extract to design tokens.
7. No `aria-roledescription` or unit testing of the schema validity (e.g., via `zod`).
8. The `containerRef.current` mouse handler's `ref` cleanup is correct, but `rafRef.current` is never reset to 0 after cancellation — innocuous but worth a `rafRef.current = 0` after cancel.

### 6.2 Plan

**S-CQ-1 — Extract `useSpotlight(containerRef, opts?)` hook** in `hooks/useSpotlight.ts`. Move RAF + mousemove + bbox math there. Bail on `prefers-reduced-motion` and on touch.

**S-CQ-2 — Split `IndustrySpotlight` into two components:** `<IndustryGridDark />` (default variant, used on Services) and `<IndustryChips />` (compact variant, used on Home). Drop the `variant` prop entirely. Each is now <80 LoC.

**S-CQ-3 — Replace index-based variants in `ServiceBento`** with a config map keyed by `service.id` (see S-UI-1).

**S-CQ-4 — Extract gradient tokens** to `tailwind.config.cjs`:

```js
backgroundImage: {
  'card-moss':    'linear-gradient(135deg, #1A4D2E 0%, #0f2e1b 100%)',
  'card-coal':    'linear-gradient(135deg, #27272a 0%, #18181b 50%, #0a0908 100%)',
  'card-paper':   'linear-gradient(135deg, #ffffff 0%, #fafaf9 50%, #f5f5f4 100%)',
  'card-stone':   'linear-gradient(135deg, #fafaf9 0%, #e7e5e4 100%)',
}
```

**S-CQ-5 — Add `pages/Services.test.tsx`** covering: hero present, all 8 service cards present and link to expected paths, industries section present, banner CTA present, axe smoke test (use `vitest-axe`).

**S-CQ-6 — Ditch `React.memo(ServiceBento)`** (S16).

**S-CQ-7 — Convert `services.tsx` → `services.ts`** after S-UI-2 changes icons to components.

**S-CQ-8 — Validate schema at build time.** Add `npm run lint:schema` that uses Schema.org's JSON-LD validator (or `zod` schema) to ensure the generated schema is well-formed. Wire to CI.

---

## 7. Security

### 7.1 Findings

1. The page renders no user input, fetches no third-party content. Surface area is small.
2. JSON-LD injection runs through the same `SEO.tsx` machinery — same `script.text = JSON.stringify` concern as About; see A-SEC-2.
3. No outbound links on this page (other than `<Link>` to internal routes). Once industries become links, ensure they remain internal.
4. The CTA pill at `<a href={`tel:${CONTACT_INFO.phone.value}`}>` (in `ConsultationBanner`) — fine.
5. No CSP directive validated. Verify that the page's external requests (none) don't break under strict CSP once the Services FAQ is added with markdown content.

### 7.2 Plan

**S-SEC-1 — Carry the JSON-LD escape from About audit (A-SEC-2).** Repeat here once.

**S-SEC-2 — When markdown is rendered (FAQ section)** use the existing `MarkdownRenderer` and confirm it sanitizes HTML (review `components/MarkdownRenderer.tsx` separately and ensure it strips `<script>`, `<iframe>`, and event-handler attributes — likely already does via `react-markdown`'s default schema).

---

## 8. Internationalization, Localization & Tone

### 8.1 Findings

1. Tone of the hero ("Four disciplines, one practice") is editorial. The body copy ("A holistic suite of financial services designed to navigate the complexities of the modern economic landscape.") is generic SaaS-speak. Mismatch.
2. Indian context (FY/AY) absent (S23).
3. Service descriptions are 1 sentence each — too uniform; reads like a checklist. A CA firm should use *active*, *verb-led* descriptions ("File monthly GSTR-1, GSTR-3B; manage e-invoicing for ≥ ₹10 cr turnover.").

### 8.2 Plan

**S-COPY-1 — Rewrite the "Core Capabilities" intro** to match the hero's editorial register:

> "A small practice across tax, audit, corporate, and advisory. The proprietor takes the engagement — a decision a small firm can make and a large one cannot."

**S-COPY-2 — Active-voice service descriptions** in `constants/services.tsx`. Examples:

```ts
{ id: 'gst', title: 'GST Registration & Filing',
  description: 'Registration, monthly returns, GSTR-9/9C, e-invoicing for ≥ ₹10 cr, and notice replies.' }

{ id: 'income-tax', title: 'Income Tax Services',
  description: 'ITR-1 to ITR-7, tax-audit support u/s 44AB, faceless assessment defence, and TDS/TCS.' }

{ id: 'company-law', title: 'Company Law & ROC',
  description: 'AOC-4, MGT-7, DIR-3 KYC, board-meeting documentation, and event-based filings.' }

{ id: 'litigation', title: 'Litigation Support',
  description: 'Notice replies (DRC-01, ASMT-10, 142(1)), CIT(A)/NFAC appeals, and ITAT representation.' }

{ id: 'advisory', title: 'Business Advisory',
  description: 'Entity choice, project reports, CMA data for bank funding, and 15CB certifications.' }

{ id: 'audit', title: 'Audit & Assurance',
  description: 'Statutory audits under Companies Act, tax audits u/s 44AB, internal audits, and net-worth certificates.' }

{ id: 'bookkeeping', title: 'Bookkeeping & Accounting',
  description: 'Tally / Zoho Books data entry, monthly bank reconciliation, GL hygiene, and quarterly financials.' }

{ id: 'payroll', title: 'Payroll Management',
  description: 'Salary processing, TDS on salary u/s 192, PF/ESI returns, payslips, and Form-16 issuance.' }
```

**S-COPY-3 — Add FY/AY pill** to the hero's meta:

```tsx
{ label: "Period", value: <>FY {CONTACT_INFO.financialYear} · AY {CONTACT_INFO.assessmentYear}</> }
```

---

## 9. Features (gap analysis vs typical CA-firm services pages)

### 9.1 Findings

Compared to mature peer sites (BDO, Grant Thornton Bharat, midsize Indian firms), this page lacks:

- Engagement model section (retainer vs assignment, what's included)
- Indicative fee ranges (or at least "starts from")
- Compliance-calendar teaser (next due dates this month) — the firm already has a `ComplianceCalendar` resource
- Sample deliverables / report previews
- Testimonials with name + designation + LinkedIn
- Sector-filtered deep links
- Comparison matrix vs DIY tax-software
- Booking flow with calendar selection (currently only routes to /contact)
- Contact tile with response SLA ("most messages answered within 4 working hours")

### 9.2 Plan

**S-FEAT-1 — Engagement Model section.** New JSX block under `ServiceBento`. Three columns:

| Retainer | Assignment | Project |
|---|---|---|
| Annual contract; covers tax, GST, ROC, advisory throughout the year. | One-off, fixed-scope engagement: a single audit, a single appeal, a single 15CB. | Multi-month or multi-disciplinary work: full set-up, due-diligence, internal-audit. |

**S-FEAT-2 — "What's due this week" widget.** Read from `constants/resources.ts`'s compliance calendar; show only items dated within today + 7 days. Link to `/resources/compliance-calendar`.

**S-FEAT-3 — Filter chip strip above the bento.** Six chips: All · Tax · Compliance · Advisory · Audit · Payroll. State-managed via React state and `useSearchParams` so the URL becomes `/services?cat=tax`. Same ergonomics as `Insights.tsx` already uses. (See cross-reference in Insights audit.)

**S-FEAT-4 — Industry deep-link.** Each industry chip becomes `<Link to={`/services?industry=${slug}`}>`, and the bento filters services where `service.tags?.includes(industry)`.

**S-FEAT-5 — Calendly / WhatsApp embedded booking.** Add a single inline widget at the top of `ConsultationBanner` (gated by `CookieConsent` for Calendly).

**S-FEAT-6 — Testimonials carousel.** Pull from a new `constants/testimonials.ts`. Use `react-aria-components` `<Carousel>` with reduced-motion gate.

---

## 10. Concrete Codex Worklist (ordered)

> Each item is referenced. Codex should commit at marked checkpoints.

1. **S-A11Y-1 (S13)** — Wrap `pages/Services.tsx` in `<main id="main">`.
2. **S-A11Y-2 (S3)** — Drop `aria-label` from service `<Link>`s.
3. **S-A11Y-3** — Add `aria-hidden`/`focusable=false` to all decorative Lucide icons in this file and `IndustrySpotlight.tsx`/`ConsultationBanner.tsx`.
4. **S-UI-3 (S2)** — Bump dark-card description text from `text-zinc-400/500` to `text-zinc-300`.
5. **S-UI-7 (S25)** — Fix `text-right md:text-left` on the industries intro.
6. **S-UI-8 (S15)** — Fix arrow color logic on the bottom outline pill.
7. **S-PERF-2 (S16)** — Drop `React.memo` from `ServiceBento`. [⏸ commit]
8. **S-PERF-1 (S5/S21)** — Gate spotlight on hover-capable pointer + reduced motion.
9. **S-PERF-3** — Memoize schema.
10. **S-SEC-1** — JSON-LD escape (carry from About audit).
11. **S-COPY-2 (S4)** — Update `SERVICES[].title`/`description` to active-voice canonical strings. [⏸ commit]
12. **S-UI-2 (S8/S9)** — Convert `services.tsx` icons to components; render them inside cards; pass `aria-hidden`.
13. **S-UI-1 (S1)** — Replace index-based variants with id-keyed config map.
14. **S-UI-4 (S6/S17)** — Resolve grid math: pick layout, document it in a comment, verify on md/lg.
15. **S-UI-5 (S14)** — Make industry tiles links; add `aria-describedby`.
16. **S-CQ-1** — Extract `useSpotlight` hook.
17. **S-CQ-2** — Split `IndustrySpotlight` into `IndustryGridDark` + `IndustryChips`. [⏸ commit]
18. **S-SEO-1 (S10/S11)** — Replace schema with the new ItemList + Org block (use `service.link`).
19. **S-SEO-2** — Pass breadcrumbs.
20. **S-SEO-3** — Update title/description copy.
21. **S-IA-1** — Add Engagement Model + FAQ + "What we don't do" sections.
22. **S-IA-3 / S-IA-4** — Add `tags`, `cadence`, `feeBand` to `ServiceItem`; render the metadata strip on each card.
23. **S-FEAT-3** — Filter chip strip with `useSearchParams`.
24. **S-FEAT-4** — Industry deep-link wiring.
25. **S-COPY-3** — Add FY/AY meta pill in hero.
26. **S-CQ-5** — Add `pages/Services.test.tsx` (RTL + axe). [⏸ commit]

---

## 11. Acceptance Criteria

Page is "done" when:

- Lighthouse mobile: Performance ≥ 90, A11y = 100, Best Practices ≥ 95, SEO = 100.
- axe DevTools clean.
- Reordering items in `SERVICES` does not break visual hierarchy.
- Every `<Link>` has discoverable name + description; AT users hear `<h3>` content first.
- Service descriptions are active-voice and contain at least one statutory section reference.
- A keyboard-only user can reach every service card and the bottom CTA in deterministic tab order.
- The page renders on `prefers-reduced-motion` with no animation, no spotlight, no blob.
- The Rich-Results test passes with `ItemList` and `AccountingService` together.
- `ServiceBento` is < 100 LoC after extracting the variant config.
- `IndustrySpotlight` is replaced by two single-purpose components.
- A new prospect can scroll the page and answer in 60 s: "What does the firm do, how do they engage, what does it cost roughly, and what won't they do?"

---

## 12. Out-of-scope items (parking lot)

- `useTaxConfig` / `useResourceData` should ship a stale-while-revalidate cache, used by the FY/AY hero pill and by future "What's due this week" widget.
- `MarkdownRenderer.tsx` sanitization audit (cross-cutting; will be needed once FAQ markdown is rendered here).
- Cross-page nav: a sticky breadcrumbs / sub-nav is not present, but would help on `/services/{id}` pages once they exist.
- Service-detail page (`pages/ServiceDetail.tsx`) is out of scope for this round but receives traffic from S-UI-1 link prefetching — verify those routes exist and render.
- `index.css` zone-color overhaul (lifted from About audit A-UI-1) is a prerequisite to a fully-clean Services page.
