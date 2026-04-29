# Audit Plan — `pages/Services.tsx` (revised)

> Scope: Multi-axis audit of the **Services** page, scoped to what the firm actually wants on this page. Each finding is paired with a concrete *what to do* / *how to do it* so it can be executed verbatim by Codex.
>
> Files in scope: `pages/Services.tsx` + tightly-coupled descendants `components/ServiceBento.tsx`, `components/IndustrySpotlight.tsx`, `components/ConsultationBanner.tsx`, `components/hero/HeroSplit.tsx`, plus the data layer `constants/services.tsx` and `constants/industries.tsx`.
>
> Page route: `/services`. Default zone (no `data-zone`): "Moss" / `brand-moss` accents.

---

## 0. Out of scope (intentional, not gaps)

The following are deliberate omissions. Any future audit, refactor, or PR that reintroduces them must be rejected.

- **Testimonials / client quotes / case studies.** The firm is new; testimonials are not appropriate.
- **Fee figures, indicative pricing, "starts at" copy, fee bands, retainer/assignment pricing tiers.** Pricing is engagement-specific and is not surfaced on the website.
- **Compliance-calendar widget, "What's due this week", or any due-date strip.** Already lives at `/resources/compliance-calendar`. Do not duplicate.
- **FAQ block on the Services page.** A global FAQ already exists at `/faq`. Do not duplicate.
- **"What we don't do" / "Out of scope" / "We do not undertake X" boundary blocks.** Negative-publicity copy; drop entirely.
- **Comparison matrix against DIY tax software or low-cost competitors.**
- **Calendly / WhatsApp booking embed.** `/contact` already handles bookings.
- **Filter chip strip ("All / Tax / Compliance / Advisory / Audit / Payroll") and industry → service deep-link wiring.** The page is intentionally a brochure-style overview; filtering is out of scope.

---

## 1. Severity Heatmap

| # | Issue | Axis | Severity | Effort |
|---|---|---|---|---|
| S1 | `ServiceBento` switches card styles by **array index** — re-ordering services breaks the layout silently | code quality | High | M |
| S2 | "Premium dark" cards (Litigation, Payroll) use `text-zinc-500` for description on `bg-brand-black` → ~3.4:1 contrast (fails WCAG AA body text) | a11y | High | XS |
| S3 | Service cards rendered as `<Link>` with `aria-label="View details for X"`, then place a heading inside — heading content is hidden from AT (overridden by `aria-label`) | a11y | High | XS |
| S4 | Card titles drift from `SERVICE_DETAILS` titles (`GST Services` vs `GST Registration & Filing`, `Bookkeeping` vs `Bookkeeping & Accounting`, `Payroll` vs `Payroll Management`) | content | Medium | S |
| S5 | `IndustrySpotlight` mouse-tracking effect runs even on touch devices and even when off-screen | perf | Low | XS |
| S6 | The eight services are stuffed into a 9-cell bento where the 9th is a "Need Expert Guidance?" CTA — at `md` and `lg` the layout produces orphan rows | UI bug | High | S |
| S7 | Service icons defined in `constants/services.tsx` are **never rendered** in `ServiceBento` (icons are imported but the component does not display them) | UI bug | High | XS |
| S8 | `IndustrySpotlight` clones icons via `React.cloneElement(ind.icon, { size: 18 })` but the icon is created with `<Factory className="w-6 h-6" />` — `size` and `className` then conflict | UI bug | Low | S |
| S9 | Schema `CollectionPage > ItemList` doesn't include `numberOfItems`, `provider.address`, or breadcrumbs; URLs are hard-coded instead of derived from `service.link` | SEO | Medium | S |
| S10 | `<ConsultationBanner />` runs two large blurred radials with no `prefers-reduced-motion` gate | perf / a11y | Low | XS |
| S11 | No `<main>` landmark on this page | a11y | High | XS |
| S12 | "Industries We Serve" tiles use `<div>` with no role / no link — clickable feel without action | UX | Medium | M |
| S13 | "Industry not listed? Contact Us" CTA: on hover the entire button inverts to `bg-white text-black` and the brass arrow icon vanishes against white | UI | Low | XS |
| S14 | `ServiceBento` is wrapped in `React.memo` with no props → memoization is vacuous | code quality | Low | XS |
| S15 | `index === 6` (Bookkeeping) has no override — accidental cell that compounds S6 | UI / content | Medium | S |
| S16 | No internal cross-links between related services (e.g., GST ↔ Litigation when a notice is received; Audit ↔ Income Tax for tax audit) | UX / SEO interlinking | Medium | M |
| S17 | `aria-labelledby="hero-split-title"` references a heading that may not exist if hero variant changes in future | a11y | Low | XS |
| S18 | `IndustrySpotlight` listens to `mousemove` but never debounces and uses no `passive: true` flag | perf | Low | XS |
| S19 | Schema iterates `SERVICES` but `ServiceDetail` route is registered as `/services/:id` — confirm route param matches `service.id` | bug-risk | Low | XS |
| S20 | No mention of FY 2025-26 / AY 2026-27 anywhere on the page even though `CONTACT_INFO.financialYear`/`assessmentYear` are computed | content | Medium | S |
| S21 | "Industries We Serve" intro copy uses `text-right md:text-left` — right-alignment on small screens reads like a typo | UI | Low | XS |
| S22 | Lucide icons across the page lack `aria-hidden="true"` / `focusable="false"` | a11y | Medium | XS |
| S23 | `services.tsx` uses `.tsx` extension because of JSX in `icon`. After icons become components, file can be `.ts` | code quality | Low | XS |
| S24 | No tests for `ServiceBento` or `IndustrySpotlight`; no `pages/Services.test.tsx` exists | code quality | Medium | M |
| S25 | Hard-coded gradient hexes (`#15803d`, `#0f2e1b`) in JSX. Should be tokenized | code quality | Low | S |

---

## 2. Information Architecture & Content Strategy

### 2.1 Findings

1. **Three-section structure today:** Hero (`HeroSplit`) → Bento grid (`ServiceBento`) → Industries (`IndustrySpotlight`) → CTA (`ConsultationBanner`). Acceptable as a brochure-style overview. The structural changes that *would* normally be recommended for a CA-firm services page (testimonials, FAQ, fee tables, "what we don't do") are out of scope per §0.
2. **Service titles inconsistent (S4)** with their detail pages: `GST Services` vs `GST Registration & Filing`, `Bookkeeping` vs `Bookkeeping & Accounting`, `Payroll` vs `Payroll Management`. The `Litigation Support`, `Audit & Assurance`, `Company Law`, `Income Tax`, `Advisory` titles are already consistent or trivially close.
3. **Service descriptions are too uniform.** Each is one generic sentence; reads like a checklist. A CA firm should use *active*, *verb-led* descriptions that mention the actual statutory deliverable.
4. **No FY/AY anchoring (S20).** `CONTACT_INFO.financialYear` and `CONTACT_INFO.assessmentYear` are computed and unused on this page.
5. **Service icons defined but never rendered (S7).** The card UI shows only an `ArrowUpRight` button; the curated `<FileText>`/`<Calculator>`/`<Building2>` icons in `SERVICES[i].icon` go unused.

### 2.2 Plan

**S-IA-1 — Rename services to match canonical detail-page titles.** Update `constants/services.tsx → SERVICES[i].title`:

| current | rename to |
|---|---|
| GST Services | GST Registration & Filing |
| Income Tax | Income Tax Services |
| Bookkeeping | Bookkeeping & Accounting |
| Payroll | Payroll Management |

**S-IA-2 — Active-voice descriptions** in `constants/services.tsx`:

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

**S-IA-3 — Add an FY/AY pill** to the hero meta:

```tsx
{ label: "Period", value: <>FY {CONTACT_INFO.financialYear} · AY {CONTACT_INFO.assessmentYear}</> }
```

**S-IA-4 — Optional one-line "How we engage" paragraph** between `ServiceBento` and `IndustrySpotlight`. One editorial sentence, no tiers, no pricing, no SLA, no inclusions list:

> "Work is taken either on retainer or as a single assignment, and every engagement is led by the proprietor."

If this can ship without reading as a pricing block, include it. If not, skip — do not pad it out.

---

## 3. UI / Visual Design

### 3.1 Findings

1. **Index-based styling (S1)** is fragile. `ServiceBento.tsx` lines 25–66 hard-code `if (index === 0) … else if (index === 7)`. Reordering a service in `constants/services.tsx` collapses the visual hierarchy.
2. **`md` breakpoint math is wrong (S6).** With 8 services + 1 CTA = 9 cells, the current 1-2-1-1-2-1-1-2-1 pattern leaves Bookkeeping orphaned at `md` and produces a half-empty row at `lg`. See §3.2 S-UI-3 for a deterministic layout.
3. **Icons defined but never rendered (S7).** The `<FileText>`/`<Calculator>`/etc. icons in `SERVICES[i].icon` are imported but not displayed.
4. **Contrast on dark cards (S2).** `text-zinc-500` (#71717a) on `from-zinc-800 ... to-brand-black` ≈ 3.4:1 → fails WCAG AA for body text.
5. **Three different border-radii** — `rounded-[2rem]` here, `rounded-[3rem]` in About, `rounded-3xl` in IndustrySpotlight cards — inside 200 px of vertical scroll.
6. **CTA card "Need Expert Guidance?"** uses `bg-gradient-to-br from-brand-moss to-[#15803d]` — that second hex is Tailwind `green-700`. Non-brand color used directly (S25).
7. **Industry tiles are `<div>` not links (S12).** They have `group/card` hover transform and a brass-tinted hover overlay → users *expect* clickability.
8. **Right-aligned blurb on mobile (S21).** `text-right md:text-left` reads as a typo at the small breakpoint.
9. **Bottom outline pill (S13).** On `hover:bg-white hover:text-black`, the brass arrow icon (set as a child via `text-brand-brass group-hover:text-black`) becomes invisible if the user moves over the icon directly — it's already black on a white pill.

### 3.2 Plan

**S-UI-1 — Re-key card variants by `service.id`, not array index.** In `ServiceBento.tsx`, replace the `if (index === 0) … else if (index === 7)` chain with:

```ts
type Variant = {
  span: string;
  container: string;
  textTitle: string;
  textDesc: string;
  arrowBtn: string;
  iconWrap: string;
};

const VARIANT: Record<string, Variant> = {
  'gst':         { span: 'md:col-span-2 lg:col-span-2', /* … light featured */ },
  'income-tax':  { span: 'md:col-span-1 lg:col-span-1', /* … deep moss */ },
  'company-law': { span: 'md:col-span-1 lg:col-span-1', /* … standard */ },
  'litigation':  { span: 'md:col-span-2 lg:col-span-2', /* … premium dark */ },
  'advisory':    { span: 'md:col-span-1 lg:col-span-1', /* … warm stone */ },
  'audit':       { span: 'md:col-span-1 lg:col-span-1', /* … standard cool */ },
  'bookkeeping': { span: 'md:col-span-1 lg:col-span-1', /* … standard */ },
  'payroll':     { span: 'md:col-span-2 lg:col-span-2', /* … premium midnight */ },
};

const v = VARIANT[service.id];
```

This decouples ordering in `constants/services.tsx` from layout intent.

**S-UI-2 — Render the icon inside each card.** Top-left of each card, above the arrow row:

```tsx
<div className="relative z-10 flex justify-between items-start mb-6">
  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.iconWrap}`}>
    <service.icon size={18} aria-hidden="true" focusable={false} />
  </div>
  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border ${v.arrowBtn}`}>
    <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" focusable={false} />
  </div>
</div>
```

Update `constants/services.tsx` so icons are stored as **components**, not elements:

```ts
// before
icon: <FileText className="w-6 h-6" />,
// after
icon: FileText,
```

This also fixes S8 in `IndustrySpotlight`.

**S-UI-3 — Bento layout math (S6/S15).** Pick a deterministic grid and document it inline. Recommended (8 services + CTA):

```
md (2 cols):                            lg (3 cols):
┌─────────────────────┐                 ┌──────────┬──────────┬──────────┐
│ GST (2)             │                 │ GST (2)             │ INC-TAX  │
├──────┬──────────────┤                 ├──────────┴──────────┼──────────┤
│ I-TAX│ COMPLAW      │                 │ COMPLAW  │ AUDIT    │ ADVISORY │
├──────┴──────────────┤                 ├──────────┼──────────┴──────────┤
│ LITIG (2)           │                 │ BOOKKP   │ LITIG (2)           │
├──────┬──────────────┤                 ├──────────┼──────────┬──────────┤
│ ADV  │ AUDIT        │                 │ PAYROLL  │ CTA      │          │
├──────┴──────┬───────┤                 └──────────┴──────────┴──────────┘
│ BOOKKP      │ PAYRL │
├─────────────┴───────┤
│ CTA                 │
└─────────────────────┘
```

Acceptable alternative: make every card 1×1, drop the wide cards entirely, and read as a clean 4×2 + CTA grid. Pick one and add a `// LAYOUT INTENT:` comment above the grid container.

**S-UI-4 — Fix dark-card description contrast (S2).** Change `text-zinc-400`, `text-zinc-500` to `text-zinc-300` (4.6:1 on `#0a0908`). Re-test with axe.

**S-UI-5 — Make industry tiles links (S12).** Convert each tile from `<div>` to `<Link to="/contact">` (or `/services/{related-id}` if a clear mapping exists per industry). Add `hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-brass`.

**S-UI-6 — Normalize border radii.** Standardize on `rounded-[2rem]` for all cards on this page. Keep `IndustrySpotlight`'s outer `rounded-[3rem]` container as the single exception.

**S-UI-7 — Fix industries intro alignment (S21).** Change `text-right md:text-left` → `text-left`.

**S-UI-8 — Fix bottom outline pill (S13).** Replace the brass arrow with one whose hover color has its own contrast story:

```tsx
<ArrowUpRight size={16} className="text-brand-brass group-hover:text-brand-moss transition-colors"
  aria-hidden="true" focusable={false} />
```

**S-UI-9 — Tokenize the CTA-card gradient (S25).** Move `#15803d` and `#0f2e1b` into `tailwind.config.cjs`:

```js
backgroundImage: {
  'card-moss-deep': 'linear-gradient(135deg, #1A4D2E 0%, #0f2e1b 100%)',
  'card-moss-cta':  'linear-gradient(135deg, #1A4D2E 0%, #15803d 100%)',
}
```

Then use `bg-card-moss-cta` on the "Need Expert Guidance?" card.

---

## 4. Accessibility (a11y)

### 4.1 Findings

1. **No `<main>` landmark (S11)** wrapping the content.
2. **Service-card heading hidden by `aria-label` (S3).** `<Link aria-label="View details for GST Services">` containing `<h3>GST Services</h3>` causes AT users to hear only the aria-label — the description is dropped.
3. **Decorative Lucide icons across the page (S22)** lack `aria-hidden="true"` and `focusable="false"`.
4. **`aria-labelledby="hero-split-title"` (S17)** is correct today but brittle if `HeroSplit`'s structure changes.
5. **`mousemove` spotlight (S5)** has no keyboard equivalent — fine because it's purely decorative; verify the page is fully usable without a pointer.
6. **Industry tiles get hover transform but have no role** (S12) — confusing to AT users.
7. **Color is the only signal of card category.** Premium dark vs light cards convey something (Litigation = serious, Advisory = warm, GST = featured), but there's no text equivalent. AT users miss the hierarchy entirely.
8. **Focus order in the bento depends on grid cell order**, which is not the visual order on `md:col-span-2` cards. Verify with keyboard.

### 4.2 Plan

**S-A11Y-1 — Wrap the page in `<main id="main">`.** Add `tabIndex={-1}` so the global skip-link can land focus there cleanly.

**S-A11Y-2 — Drop `aria-label` from service `<Link>`.** Let the heading and description be read. Add a hidden affordance for the arrow:

```tsx
<Link to={service.link} className="…">
  …
  <h3>{service.title}</h3>
  <p>{service.description}</p>
  <span className="sr-only">View details about {service.title}</span>
</Link>
```

**S-A11Y-3 — `aria-hidden="true"` and `focusable={false}`** on every decorative Lucide icon in `Services.tsx`, `ServiceBento.tsx`, `IndustrySpotlight.tsx`, and `ConsultationBanner.tsx`. Add a Vitest assertion that fails the build if a Lucide icon in these files is rendered without `aria-hidden`.

**S-A11Y-4 — Make industry tiles tabbable links** (see S-UI-5). Add `aria-describedby` if the visible description is too long for the link's accessible name.

**S-A11Y-5 — Visible focus ring on dark cards.** Add to global CSS:

```css
.card-surface-hover:focus-visible {
  outline: 2px solid var(--zone-accent);
  outline-offset: 4px;
}
```

**S-A11Y-6 — Non-color hierarchy cue.** Add an eyebrow line above each title indicating its category (`Tax · Compliance · Advisory · Audit`):

```tsx
<span className="text-eyebrow font-mono uppercase tracking-[0.2em] zone-text-muted">
  {service.group}
</span>
```

Add a `group: 'Tax' | 'Compliance' | 'Advisory' | 'Audit'` field to `ServiceItem` to support this.

**S-A11Y-7 — Verify keyboard tab order** matches visual reading order after S-UI-1 / S-UI-3. If a wide card sits in the wrong tab position, fix with explicit grid-row/grid-column placement, not `tabIndex`.

---

## 5. Performance

### 5.1 Findings

1. **`IndustrySpotlight` mouse-tracker (S5/S18)** runs even on touch devices and even when the section is off-screen. RAF + `getBoundingClientRect` is cheap, but compounds with the 4×4 hover transitions.
2. **`ConsultationBanner` (S10)** has two large blurred radials (`blur-[100px]`, `blur-[80px]`) that paint every frame on color-managed displays, with no `prefers-reduced-motion` gate.
3. **Eight services × Reveal × IntersectionObserver = 8 observers in the bento.** Reveal uses a *shared* observer (verified in `Reveal.tsx`) — fine.
4. **`React.memo(ServiceBento)` (S14)** is meaningless — no props.
5. **No prefetching** of `/services/{id}` routes when a card is hovered.
6. **Schema is generated on every render** (no `useMemo`).

### 5.2 Plan

**S-PERF-1 — Gate the spotlight effect** on hover-capable pointer + reduced-motion:

```ts
useEffect(() => {
  if (variant === 'compact') return;
  const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!mq.matches) return;
  // …existing handler
}, [variant]);
```

**S-PERF-2 — Drop `React.memo` from `ServiceBento`.**

**S-PERF-3 — Memoize the schema** in `Services.tsx` with `useMemo` keyed on `SERVICES`.

**S-PERF-4 — Hover-prefetch service routes:**

```tsx
const prefetch = useCallback(() => {
  // If routes are lazy: import('../pages/ServiceDetail');
  // Or: <link rel="prefetch"> to the data JSON.
}, [service.id]);

<Link to={service.link} onMouseEnter={prefetch} onFocus={prefetch}>
```

**S-PERF-5 — Apply `prefers-reduced-motion` gate** to `ConsultationBanner`'s blurred radials. Either remove them entirely under reduced motion, or replace with static fills.

**S-PERF-6 — Add `content-visibility: auto`** on `<IndustrySpotlight>` and `<ConsultationBanner>` containers with `contain-intrinsic-size: 800px`.

---

## 6. SEO & Structured Data

### 6.1 Findings

1. **Schema lacks `numberOfItems`, `provider.address`, breadcrumbs (S9).** Google ignores partial `ItemList`s.
2. **Schema URL is hard-coded** as `https://casagar.co.in/services/${id}` — duplicates `service.link`. If the link constant ever changes, the schema goes stale.
3. **`<title>`** "Professional CA Services in Mysuru | Audit, Tax & Advisory" — good keywords but lacks branded suffix.
4. **No breadcrumbs** passed to `<SEO />`.
5. **Confirm the `/services/:id` route param matches `service.id` (S19)** — fix if it doesn't.

### 6.2 Plan

**S-SEO-1 — Replace schema** with an `ItemList` + `AccountingService` pair:

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
        "description": service.description,
      })),
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${SITE}/#organization`,
    "name": CONTACT_INFO.name,
    "areaServed": "Karnataka, India",
    "telephone": CONTACT_INFO.phone.value,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT_INFO.address.street,
      "addressLocality": CONTACT_INFO.address.city,
      "postalCode": CONTACT_INFO.address.zip,
      "addressCountry": "IN",
    },
  },
], []);
```

**S-SEO-2 — Pass breadcrumbs** to `<SEO>`:

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

**S-SEO-4 — Always derive URLs from `service.link`** in schema; never hard-code paths.

**S-SEO-5 — Confirm `/services/:id` param matches `service.id`** (S19). Fix the route declaration or the data, not both.

> **Do NOT add FAQ schema on this page** — no FAQ section is shipping here (see §0).

---

## 7. Code Quality & Maintainability

### 7.1 Findings

1. `ServiceBento` has 70 lines of branching logic that should live in a configuration map.
2. `IndustrySpotlight` exposes `variant` only as `'default' | 'compact'`; both variants share little. The `useEffect` mouse handler should be its own hook.
3. `services.tsx` uses `.tsx` because of JSX in `icon`. After S-UI-2, icons become components — the file can be `.ts` (S23).
4. No tests for `ServiceBento` or `IndustrySpotlight`. No `pages/Services.test.tsx` (S24).
5. Hard-coded gradient hexes (`#15803d`, `#0f2e1b`) in JSX (S25).
6. The `containerRef.current` mouse handler in `IndustrySpotlight` cleans up correctly, but `rafRef.current` is never reset to `0` after cancellation — innocuous but worth a `rafRef.current = 0` after cancel.
7. `React.memo(ServiceBento)` with no props is cargo-cult (S14).

### 7.2 Plan

**S-CQ-1 — Extract `useSpotlight(containerRef, opts?)`** in `hooks/useSpotlight.ts`. Move the RAF + mousemove + bbox math there. Bail on `prefers-reduced-motion` and on touch.

**S-CQ-2 — Split `IndustrySpotlight`** into two single-purpose components:

- `<IndustryGridDark />` — default variant, used on Services
- `<IndustryChips />` — compact variant, used on Home

Drop the `variant` prop entirely. Each component should be < 80 LoC.

**S-CQ-3 — Replace index-based variants in `ServiceBento`** with the `id`-keyed config map (see S-UI-1).

**S-CQ-4 — Extract gradient tokens** to `tailwind.config.cjs` (see S-UI-9).

**S-CQ-5 — Add `pages/Services.test.tsx`** (RTL + `vitest-axe`):

- Hero is present.
- All 8 service cards render and link to expected `/services/{id}` paths.
- Industries section is present.
- `ConsultationBanner` is present.
- axe smoke test passes.

**S-CQ-6 — Drop `React.memo(ServiceBento)`** (S14).

**S-CQ-7 — Convert `services.tsx` → `services.ts`** after S-UI-2 changes icons to components.

**S-CQ-8 — Validate schema at build time.** Add `npm run lint:schema` that uses Schema.org's JSON-LD validator (or a `zod` schema) to ensure the generated schema is well-formed. Wire to CI.

---

## 8. Security

### 8.1 Findings

1. The page renders no user input and fetches no third-party content. Surface area is small.
2. JSON-LD injection runs through the same `SEO.tsx` machinery as other pages — same `script.text = JSON.stringify` concern as in the About audit.
3. No outbound links on this page (other than `<Link>` to internal routes). Once industry tiles become links (S-UI-5), ensure they remain internal.
4. The CTA pill `<a href={`tel:${CONTACT_INFO.phone.value}`}>` (in `ConsultationBanner`) — fine.

### 8.2 Plan

**S-SEC-1 — Carry over the JSON-LD escape fix** from the About audit (whatever was applied for `A-SEC-2`). Apply once; the helper should be shared.

---

## 9. Tone & Copy

### 9.1 Findings

1. Hero ("Four disciplines, one practice") is editorial; body copy ("A holistic suite of financial services designed to navigate the complexities of the modern economic landscape.") is generic SaaS-speak. Mismatched register.
2. Indian context (FY/AY) absent (S20).
3. Service descriptions are too uniform (covered in S-IA-2).

### 9.2 Plan

**S-COPY-1 — Rewrite the "Core Capabilities" intro** to match the hero's editorial register:

> "A small practice across tax, audit, corporate, and advisory. The proprietor takes the engagement — a decision a small firm can make and a large one cannot."

**S-COPY-2 — See S-IA-2** for active-voice service descriptions.

**S-COPY-3 — See S-IA-3** for the FY/AY hero pill.

---

## 10. Codex Worklist (ordered)

> Execute in this order. Commit at marked checkpoints.

1. **S-A11Y-1 (S11)** — Wrap `pages/Services.tsx` in `<main id="main" tabIndex={-1}>`.
2. **S-A11Y-2 (S3)** — Drop `aria-label` from service `<Link>`s; add `<span className="sr-only">` affordance.
3. **S-A11Y-3 (S22)** — `aria-hidden="true"` + `focusable={false}` on every decorative Lucide icon in `Services.tsx`, `ServiceBento.tsx`, `IndustrySpotlight.tsx`, `ConsultationBanner.tsx`.
4. **S-UI-4 (S2)** — Bump dark-card description text from `text-zinc-400/500` to `text-zinc-300`.
5. **S-UI-7 (S21)** — Fix `text-right md:text-left` on the industries intro.
6. **S-UI-8 (S13)** — Fix arrow color logic on the bottom outline pill.
7. **S-PERF-2 (S14)** — Drop `React.memo` from `ServiceBento`. **[⏸ commit]**
8. **S-PERF-1 (S5/S18)** — Gate spotlight on hover-capable pointer + reduced-motion.
9. **S-PERF-3** — Memoize schema.
10. **S-PERF-5 (S10)** — Reduced-motion gate on `ConsultationBanner` blur radials.
11. **S-SEC-1** — JSON-LD escape (carry from About audit).
12. **S-IA-1 + S-IA-2 (S4)** — Update `SERVICES[].title` and `description` to canonical, active-voice strings. **[⏸ commit]**
13. **S-UI-2 (S7/S8)** — Convert `services.tsx` icons to components; render them inside cards; pass `aria-hidden`.
14. **S-UI-1 (S1)** — Replace index-based variants with `id`-keyed config map.
15. **S-UI-3 (S6/S15)** — Resolve grid math: pick layout, document it inline, verify on `md` and `lg`.
16. **S-UI-5 (S12)** — Make industry tiles tabbable links; add `aria-describedby`.
17. **S-UI-9 (S25)** — Tokenize gradient hexes.
18. **S-CQ-1** — Extract `useSpotlight` hook.
19. **S-CQ-2** — Split `IndustrySpotlight` into `IndustryGridDark` + `IndustryChips`. **[⏸ commit]**
20. **S-SEO-1 / S-SEO-4 (S9)** — Replace schema with `ItemList` + `AccountingService` block; use `service.link`, not hard-coded paths.
21. **S-SEO-2** — Pass breadcrumbs.
22. **S-SEO-3** — Update title and description.
23. **S-SEO-5 (S19)** — Confirm `/services/:id` route param matches `service.id`.
24. **S-IA-3** — Add FY/AY meta pill in hero.
25. **S-IA-4** — Optional one-line "How we engage" paragraph between bento and industries (skip if it reads as a pricing block).
26. **S-COPY-1** — Rewrite "Core Capabilities" intro.
27. **S-A11Y-6** — Add `group` field to `ServiceItem`; render category eyebrow on each card.
28. **S-CQ-7** — Rename `services.tsx` → `services.ts`.
29. **S-CQ-5** — Add `pages/Services.test.tsx` (RTL + axe). **[⏸ commit]**

---

## 11. Acceptance Criteria

The page is "done" when:

- Lighthouse mobile: Performance ≥ 90, A11y = 100, Best Practices ≥ 95, SEO = 100.
- axe DevTools clean.
- Reordering items in `SERVICES` does not break visual hierarchy.
- Every `<Link>` has a discoverable accessible name; AT users hear `<h3>` content first.
- Service titles match `SERVICE_DETAILS` titles 1:1.
- Service descriptions are active-voice and contain at least one statutory section reference where applicable.
- A keyboard-only user can reach every service card and the bottom CTA in deterministic tab order.
- The page renders cleanly under `prefers-reduced-motion: reduce` with no animation, no spotlight, no decorative blob.
- Rich-Results test passes with `ItemList` + `AccountingService`.
- `ServiceBento` is < 100 LoC after extracting the variant config.
- `IndustrySpotlight` is replaced by two single-purpose components.
- **Reviewer rejects the PR** if any of the §0 out-of-scope items reappear: testimonials, fee figures, FAQ block, compliance-calendar widget, "what we don't do" copy, DIY-comparison matrix, Calendly embed, filter chip strip.

---

## 12. Out of scope (parking lot — different round)

- `useTaxConfig` / `useResourceData` stale-while-revalidate cache — would benefit the FY/AY hero pill but is cross-cutting.
- `MarkdownRenderer.tsx` sanitization audit — only relevant once any page renders user-controlled markdown here (it doesn't).
- Sticky breadcrumbs / sub-nav across `/services/{id}` pages — UX upgrade for a later round.
- `pages/ServiceDetail.tsx` — separate audit; receives traffic from S-PERF-4 hover prefetch, so confirm those routes exist and render before shipping prefetch.
- `index.css` zone-color overhaul (lifted from About audit) — prerequisite to a fully clean Services page; ship in a coordinated pass.
