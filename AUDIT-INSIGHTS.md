# Audit Plan — `pages/Insights.tsx`

> Scope: Exhaustive multi-axis audit of the **Insights** index page. Each finding is paired with a concrete *what to do* and *how to do it* so it can be executed verbatim by Codex (ChatGPT) with no further clarification.
>
> Files in scope: `pages/Insights.tsx` (≈195 LoC), data hook `hooks/useInsights.ts`, JSON source `dist/data/insights.json` & `constants/insights.ts`, hero variant `components/hero/HeroArchive.tsx`, supporting helpers `utils/formatArchiveDate.ts`, `components/Skeleton.tsx`.
>
> Page route: `/insights`. Default zone (Moss).

---

## 0. TL;DR — Severity Heatmap

| # | Issue | Axis | Severity | Effort |
|---|---|---|---|---|
| I1 | Search input has no `<label>` and no `aria-label`; relies on placeholder | a11y | High | XS |
| I2 | Category filter buttons have no `aria-pressed` or `role="tablist"` semantics | a11y | High | S |
| I3 | Date is rendered as raw string from JSON (`"August 18, 2025"`) → not a `<time datetime>` element | a11y / SEO | High | S |
| I4 | Search is case-sensitive only after `.toLowerCase()` on both sides — but is **not diacritic-insensitive**, **not Hindi/Kannada-aware**, and `searchTerm` is not debounced | UX / perf | Medium | S |
| I5 | The hero `HeroArchive` shows `insights.slice(0, 4)` *raw* on first render — when `loading=true`, `insights=[]`, so the hero shows zero items in the right column for the first ~200 ms (layout shift) | UX / CLS | High | S |
| I6 | Filter+search runs on every keystroke against the full array — fine for 6 items, but renders all `<Link>` components synchronously → no virtualization plan for when archive grows | perf / scalability | Low | M |
| I7 | "No articles found" empty-state and error-state have no live-region announcement | a11y | Medium | XS |
| I8 | Loading skeleton uses 3 placeholder cards, but the actual results layout has variable count → CLS at the boundary | UX | Low | S |
| I9 | Schema's `mainEntity` is built from `filteredInsights`, not `insights` — so search/filter changes the structured data being injected on every keystroke | SEO bug | High | S |
| I10 | URLs in schema use `https://casagar.co.in/insights/${slug}` — hard-coded host duplicates the SEO component's canonical base | SEO / DRY | Low | XS |
| I11 | No `BlogPosting` schema is emitted from this page (each card represents a blog post; `headline`, `datePublished` etc. should be present in schema) | SEO | Medium | S |
| I12 | No RSS / JSON feed offered; an "Insights" page typically does | feature | Medium | M |
| I13 | Search and category state are not persisted in URL params → cannot share a filtered view, browser back kills the filter, refresh resets | UX | High | S |
| I14 | Filter chip overflow on small screens uses flex-wrap → fine, but no horizontal scroll fallback on very narrow viewports | UI | Low | XS |
| I15 | Search clear button is a `<button>` but has no accessible name (just `<X />` icon) | a11y | High | XS |
| I16 | The `Calendar` icon next to the date is decorative but missing `aria-hidden` | a11y | Low | XS |
| I17 | Insight cards use `text-brand-stone` for the summary on `bg-brand-surface` — verify ≥ 4.5:1 (depends on token values) | a11y | Medium | XS |
| I18 | `Link to={...}` wraps an entire card containing a heading and meta — heading content not hidden, good. But the visual arrow circle is decorative; should be `aria-hidden` | a11y | Low | XS |
| I19 | No featured / pinned post; everything ranks equally even though some posts are older | UX | Low | S |
| I20 | No reading-time displayed; data exists (`readTime` field in JSON) but not rendered | UX / data hygiene | Low | XS |
| I21 | No author rendered; data exists (`author`) but not used; Author E-A-T signal lost | SEO | Low | XS |
| I22 | No tag system / no related posts; only a flat category | UX | Medium | M |
| I23 | Hero animates with `WordReveal`; no reduced-motion gate scoped at this hero variant | a11y | Medium | XS |
| I24 | The fetch path `${BASE_URL}data/insights.json`.replace('//', '/')` is fragile — replaces *all* `//`, including the `https://` if env injects an absolute URL | bug-risk | Medium | XS |
| I25 | `useInsights` retains all loaded insights in memory globally? No — local state in hook. But two consumers fetch twice. Consider sharing via context or React Query | perf / DRY | Low | M |
| I26 | Insights JSON is shipped from `dist/data/insights.json` — content updates require a rebuild & redeploy. No CMS, no MDX, no incremental update. | architecture | Medium | L |
| I27 | The dates "August 18, 2025" are **before today** (2026-04-27) — content is stale; needs editorial cadence | content | High | ongoing |
| I28 | Body content of each insight is HTML stored as a string in JSON; rendered downstream via `dangerouslySetInnerHTML` (verify on detail page); requires sanitizer | security | High | M |
| I29 | The hero `formatArchiveDate` uses `en-GB` and `slice(2)` of the year — produces `Aug · 25` style; on the cards the date is the original raw string. **Two date formats in two adjacent regions of the same page.** | UI / UX | Medium | XS |
| I30 | No pagination / "load more" — okay at 6 items, broken at 60 | scalability | Low | M |

---

## 1. Information Architecture & Content Strategy

### 1.1 Findings

1. **Two-section structure today:** Hero (`HeroArchive`, shows top 4 by JSON order) → controls (chips + search) → list (filtered insights as full-width cards). Reasonable for a small archive.
2. **Hero "top 4" is by array order** in the JSON, not by date — accidentally works because the JSON is currently date-descending, but trivially breaks if a new entry is appended.
3. **No "Featured" pinning.** The newest item is the de-facto feature, but the design treats the first card identically to the rest.
4. **Categories are derived from the data** (`['All', ...new Set(insights.map(i => i.category))]`) — fine, but unsorted. Order today is whatever insertion order yielded.
5. **Insights model conflates "Income Tax" and "Income Tax Updates"** as two separate categories — same domain, different filter buckets. Confusing.
6. **No tags / sub-tags / search facets**, so a user cannot ask "everything about MFA on the GST portal" or "all 2025 changes".
7. **Stale content (I27).** All entries are dated August 2025. No newer.
8. **`readTime`, `author` (I20/I21)** unused.
9. **No subscription** — no email opt-in, no RSS/JSON feed (I12).
10. **No interlink to Resources or Services.** A reader of "GST 2.0" should be one click from the GST service page.

### 1.2 Plan

**I-IA-1 — Sort hero by `date` desc.** Replace `insights.slice(0, 4)` with:

```ts
const heroItems = useMemo(() => {
  return [...insights]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
}, [insights]);
```

**I-IA-2 — Add a `featured?: boolean` field** to `InsightItem`. Render the *first* featured (or fall back to most-recent) as a tall hero card above the regular grid. Use `bg-brand-moss` accent to set it apart.

**I-IA-3 — Normalize categories.** Either consolidate `Income Tax` and `Income Tax Updates` into one canonical `Income Tax` (recommended), or model them as a 2-level tag (`Income Tax > Updates`).

**I-IA-4 — Add `tags: string[]`** to `InsightItem`. Surface as small chips on each card. Optionally power a tag-filter alongside the category chip.

**I-IA-5 — Show `readTime` and `author`** on each card. New row in the right metadata column:

```tsx
<div className="flex items-center gap-2 text-brand-stone text-sm font-bold">
  <Calendar size={14} aria-hidden="true" />
  <time dateTime={toISO(insight.date)}>{insight.date}</time>
</div>
<div className="flex items-center gap-2 text-brand-stone text-xs mt-2">
  <User size={12} aria-hidden="true" />
  <span>{insight.author}</span>
  <span aria-hidden="true">·</span>
  <span>{insight.readTime}</span>
</div>
```

**I-IA-6 — Cross-link to services & resources.** At the end of each card add a small contextual chip if the insight's `category` matches a service:

```ts
const linkedService = SERVICES.find(s => s.id === insight.serviceId);
{linkedService && (
  <Link to={linkedService.link} className="...">
    Read about {linkedService.title} →
  </Link>
)}
```

Add `serviceId?: ServiceItem['id']` to `InsightItem`.

**I-IA-7 — Subscription block + RSS/JSON feed.** New section below the list:
- Email opt-in (POSTs to the form endpoint already configured in `CONTACT_INFO.formEndpoint`).
- RSS link (`/rss.xml`) and JSON Feed (`/feed.json`) generated at build by a Vite plugin.

---

## 2. UI / Visual Design

### 2.1 Findings

1. **Two-format date display (I29).** Hero uses `formatArchiveDate(insight.date)` → `"Aug · 25"`. Card list uses raw `insight.date` → `"August 18, 2025"`. Looks unintentional.
2. **Filter chips:** active state uses `bg-brand-moss text-white`; inactive uses `bg-white border ...`. Active chip lacks an icon/check; with many chips it can be hard to spot.
3. **Search input** has a left-anchored icon and a right-anchored clear `<X>` — placement OK, but the input border darkens to `brand-moss` on focus while the chip pill behind also greens, creating a busy color cluster.
4. **Card layout:** 1/4 + 2/4 + 1/4 columns inside a pill. Fine on `md+`; on `< md`, all stack — the arrow circle then sits at the bottom-left, decoupled from the heading. Visually loose.
5. **Hover transform** lifts the card via `hover:shadow-xl` and `hover:border-brand-moss`. No `motion-reduce:hover:transform-none`.
6. **`text-brand-stone`** for body and meta — verify token (#aa…?) provides ≥ 4.5:1 on `bg-brand-surface`. Quick check needed.
7. **Empty state** is a full-width white pill with a single sentence — uninviting.
8. **Skeleton vs final layout mismatch (I8).** Skeleton renders 3 cards each at `h-64` with a fixed shape. Real cards have variable internal heights driven by summary length.
9. **No keyboard-visible focus** on chips beyond the browser default — survivable but underwhelming.
10. **Chip wrap (I14)** can be a long row on tablet width; consider horizontal scroll affordance with `snap-x`.

### 2.2 Plan

**I-UI-1 — Single date format.** Use `formatArchiveDate` only as a *short* badge in dense layouts. In the card metadata column, render the *full* form **and** the machine-readable `<time datetime>`:

```tsx
<time dateTime={toISO(insight.date)}>{formatLongDate(insight.date)}</time>
```

Add `utils/formatLongDate.ts`:

```ts
export const formatLongDate = (s: string | Date) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
```

And `utils/toISO.ts`:

```ts
export const toISO = (s: string | Date) => new Date(s).toISOString().slice(0, 10);
```

The hero uses `formatArchiveDate` (compact). Result: 2 deliberate formats, not 2 accidental ones.

**I-UI-2 — Filter chip semantics.** Convert to a `role="tablist"` with `<button role="tab" aria-selected={active}>`. Active chip gains `<Check size=12 aria-hidden />` to convey state without color.

**I-UI-3 — Snap-scrolling chip strip on narrow viewports:**

```tsx
<div className="flex flex-nowrap gap-2 overflow-x-auto md:flex-wrap snap-x snap-mandatory pb-2 -mx-4 px-4">
```

**I-UI-4 — Card content order on mobile.** Reorder so on `<md` the heading is first, summary second, meta + arrow last:

```tsx
<Link className="...flex flex-col-reverse md:flex-row...">
```

Or use explicit `order-` utilities.

**I-UI-5 — Empty state upgrade.** Inside the empty pill, list the 3 most-recent insights and let the user click any to clear the filter and jump straight to that piece. Reduces dead-end frustration.

**I-UI-6 — Skeleton fidelity.** Make the skeleton match the live grid (1×3 or 1×6 placeholders matching the full card structure). `Skeleton` already supports `text` / `circular` / `rectangular` — compose them properly.

---

## 3. Accessibility (a11y)

### 3.1 Findings

1. **Search input lacks accessible name (I1).** `<input type="text" placeholder="Search articles..." />` — placeholder is not an accessible name.
2. **Search clear button (I15)** is a `<button>` containing only an icon; AT users hear "button".
3. **Category filter chips (I2)** are `<button>`s; pressed state communicated by color only, not `aria-pressed`.
4. **No `<main>`** wrapping the page (consistent with About/Services audits).
5. **Date is `<span>`-or-text** (I3), not `<time>` with `datetime` attribute.
6. **Empty / error / loading states are not announced (I7).** A screen-reader user filtering aggressively will not know that 0 results returned.
7. **Live regions:** `components/LiveRegion.tsx` and `context/AnnounceContext.tsx` already exist — perfect plumbing, just unused on this page.
8. **Decorative icons** (`Calendar`, `Search`, `X`, `AlertCircle`, `ArrowUpRight`) lack `aria-hidden`.
9. **Card `<Link>`** wraps a heading; arrow circle is decorative — works for SR users today.
10. **Reduced motion (I23):** the hero's `WordReveal` keyframe and the per-card `hover:shadow-xl` are not gated.
11. **Focus order:** chips → search input → list. Logical. Verify with keyboard.
12. **Contrast (I17):** `text-brand-stone` body text — confirm against `bg-brand-surface` token. If under 4.5:1, swap for a darker token or scale down to 14 px (which lowers the bar to 4.5 still, since this is body text).

### 3.2 Plan

**I-A11Y-1 — Search input semantics:**

```tsx
<label htmlFor="insights-search" className="sr-only">Search insights</label>
<input
  id="insights-search"
  type="search"            // gives a built-in clear button on some browsers; we still keep ours for consistency
  enterKeyHint="search"
  inputMode="search"
  autoComplete="off"
  placeholder="Search articles…"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  aria-controls="insights-results"
  aria-describedby="insights-results-count"
  className="..."
/>
```

**I-A11Y-2 — Clear button name:**

```tsx
<button onClick={() => setSearchTerm('')} aria-label="Clear search" className="...">
  <X size={14} aria-hidden="true" />
</button>
```

**I-A11Y-3 — Filter tablist:**

```tsx
<div role="tablist" aria-label="Filter insights by category" className="flex flex-wrap gap-2">
  {categories.map(cat => {
    const id = `cat-${slugify(cat)}`;
    const selected = selectedCategory === cat;
    return (
      <button
        key={cat} id={id} role="tab"
        aria-selected={selected}
        aria-controls="insights-results"
        tabIndex={selected ? 0 : -1}
        onClick={() => setSelectedCategory(cat)}
        onKeyDown={onChipKeyDown(categories, cat)}
        className={`...${selected ? 'bg-brand-moss text-white' : '...'}`}
      >
        {selected && <Check size={12} aria-hidden="true" className="mr-1" />}
        {cat}
      </button>
    );
  })}
</div>
```

Add an `onChipKeyDown` helper that supports Left/Right arrow navigation between chips, Home/End to first/last — standard tablist keyboard pattern.

**I-A11Y-4 — Live region for result count:**

```tsx
<p
  id="insights-results-count"
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {loading ? 'Loading insights' :
   error   ? `Error: ${error}` :
            `${filteredInsights.length} ${filteredInsights.length === 1 ? 'article' : 'articles'} found`}
</p>
```

Or reuse the existing `useAnnounce()` hook from `context/AnnounceContext.tsx` so the announcement plays through the global live region.

**I-A11Y-5 — `<time>` element on dates:**

```tsx
<time dateTime={toISO(insight.date)}>{insight.date}</time>
```

**I-A11Y-6 — `<main id="main">`** wrapping the whole page.

**I-A11Y-7 — Decorative icons** get `aria-hidden="true"` (Calendar, Search, X, AlertCircle, ArrowUpRight).

**I-A11Y-8 — Reduced-motion gate** in CSS (already specified in About audit A-A11Y-7); reuse here.

**I-A11Y-9 — Contrast verification.** Run axe DevTools on a filtered + empty + populated state. If `text-brand-stone` fails, change token to one ≥ 4.5:1 (e.g., `#5b554f` on `#FFFFFF`).

---

## 4. Performance

### 4.1 Findings

1. **`useInsights` fetches `data/insights.json`** on mount — fine, but no `Cache-Control` strategy; on repeat navigations it refetches.
2. **No SWR / React Query** — duplicate consumers (this page + any future related-posts widget) will fetch the same JSON twice.
3. **Schema rebuilds on every keystroke (I9).** Filtering changes `filteredInsights` → schema regenerates → `<SEO>` re-runs the cleanup effect tearing down `<script data-dynamic-schema>` and re-injecting. Expensive (and arguably wrong — search/filter shouldn't change the page's structured data at all).
4. **`url.replace('//', '/')`** is fragile (I24): `'https://example.com/data/insights.json'.replace('//', '/')` becomes `'https:/example.com/data/insights.json'` — broken. The current code only triggers in dev where `BASE_URL` is `'/'`, but a future env that sets `BASE_URL='https://cdn…/'` will break.
5. **No image** in cards yet, so no LCP image — fine.
6. **`grid gap-6`** + 3 skeletons + 6 cards stays cheap.
7. **Search has no debounce (I4).** For 6 items it's invisible; at 50+ items each keystroke runs `.filter` + `.toLowerCase` for both fields.
8. **`Skeleton`** uses `animate-pulse` — runs even if hidden behind a tab.

### 4.2 Plan

**I-PERF-1 — Schema must be stable across filter changes.** Build the schema from the **full** `insights` array, not `filteredInsights`. Search is a UI concern and must not pollute structured data.

```ts
const schema = useMemo(() => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Insights & Knowledge Base",
  "publisher": { "@type": "Organization", "name": CONTACT_INFO.name },
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": insights.length,
    "itemListElement": insights.map((insight, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE}/insights/${insight.slug}`,
      "name": insight.title
    }))
  }
}), [insights]);
```

Better still, emit `Blog + BlogPosting[]` (see I-SEO-1).

**I-PERF-2 — Debounce search:**

```ts
const debouncedSearch = useDeferredValue(searchTerm);
const filteredInsights = useMemo(() =>
  insights.filter(item => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return matchesCategory(item);
    return matchesCategory(item) &&
           (item.title.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q));
  }),
[insights, debouncedSearch, selectedCategory]);
```

**I-PERF-3 — Cache the JSON fetch.** Wrap `useInsights` with a module-level promise cache (or migrate to TanStack Query if already a dep — `package.json` should be checked first). Minimal patch:

```ts
let cachedPromise: Promise<InsightItem[]> | null = null;
const fetchInsights = (url: string) => {
  if (!cachedPromise) cachedPromise = apiClient.get<InsightItem[]>(url);
  return cachedPromise;
};
```

**I-PERF-4 — Replace the `replace('//', '/')` hack** in `useInsights`:

```ts
const baseUrl = (import.meta as any)?.env?.BASE_URL || '/';
const url = new URL('data/insights.json', new URL(baseUrl, window.location.origin)).toString();
```

**I-PERF-5 — Pause skeleton animation when hidden:**

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse { animation: none; }
}
```

Plus `[hidden] .animate-pulse { animation: none; }` at the global level.

**I-PERF-6 — Lazy-load the per-card `Calendar` icon** is overkill — keep it.

**I-PERF-7 — `content-visibility: auto`** on the hero block since it scrolls out of view fast.

---

## 5. SEO & Structured Data

### 5.1 Findings

1. **`CollectionPage > ItemList`** is the right top-level type, but a richer `Blog > BlogPosting[]` is more appropriate for a writing archive.
2. **Schema currently leaks search-state (I9).** Already covered by I-PERF-1.
3. **No `dateModified` / `datePublished`** in schema items.
4. **Hard-coded host (I10):** `https://casagar.co.in/insights/...`. Keep but centralize in a constant `SITE`.
5. **Title** "Insights & Updates | Sagar H R & Co." — fine, but can include "Mysuru" for local SEO.
6. **Description** is decent; avoid duplicate content with the home/about blurb.
7. **Pagination** absent → if/when archive grows, paginated `?page=2` URLs need `<link rel="prev/next">` for SEO.
8. **No `og:type="website"` override needed** — default fine for the index page.
9. **Per-card pages** must each emit `BlogPosting` schema; verify on `pages/InsightDetail.tsx`. (Out of scope for this audit but flagged.)

### 5.2 Plan

**I-SEO-1 — Replace schema with `Blog` + `BlogPosting[]`:**

```ts
const SITE = 'https://casagar.co.in';
const schema = useMemo(() => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE}/insights`,
  "name": `${CONTACT_INFO.name} — Insights`,
  "description": "Analysis, regulatory updates, and commentary from a Mysuru-based CA practice.",
  "publisher": { "@id": `${SITE}/#organization` },
  "blogPost": insights.map(i => ({
    "@type": "BlogPosting",
    "@id": `${SITE}/insights/${i.slug}`,
    "url": `${SITE}/insights/${i.slug}`,
    "headline": i.title,
    "abstract": i.summary,
    "datePublished": toISO(i.date),
    "dateModified":  toISO((i as any).dateModified ?? i.date),
    "author": { "@type": "Person", "name": i.author ?? "CA Sagar H R" },
    "articleSection": i.category,
    "wordCount": (i as any).wordCount ?? undefined,
    "image": (i as any).image ?? `${SITE}/og-image.jpg`
  }))
}), [insights]);
```

**I-SEO-2 — Pass breadcrumbs:**

```tsx
breadcrumbs={[
  { name: 'Home',     url: '/' },
  { name: 'Insights', url: '/insights' },
]}
```

**I-SEO-3 — Title/description tweaks:**

```tsx
title={`Insights & Tax Updates from Mysuru | ${CONTACT_INFO.name}`}
description={`Analysis on Income Tax, GST, Audit and Companies-Act updates from a Mysuru CA practice — written when something genuinely useful crosses the desk.`}
```

**I-SEO-4 — Centralize site origin** in `config/contact.ts` or a new `config/site.ts`:

```ts
export const SITE_URL = (import.meta as any).env?.VITE_SITE_URL?.replace(/\/$/, '') || 'https://casagar.co.in';
```

Replace inline `https://casagar.co.in` in this file.

**I-SEO-5 — `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`** added by `<SEO>` for the insights index. Generate RSS at build via a Vite plugin (see I-IA-7).

---

## 6. Code Quality & Maintainability

### 6.1 Findings

1. **State sprawl:** `searchTerm`, `selectedCategory` are both component-state. Should be URL-state via `useSearchParams` (I13) so reload/back/share preserve filters.
2. `import * as ReactRouterDOM` pattern again.
3. `categories = useMemo(() => ...)` is fine; but `slugify` for stable IDs is missing.
4. The page does not show a count of total / filtered articles anywhere.
5. The page lacks any test coverage.
6. The fetch hook lacks an explicit `AbortController` (the `isMounted` flag is the older pattern).
7. **Type safety:** `InsightItem` should require `date: string (ISO)` but accepts free-form strings; the JSON has `"August 18, 2025"`. The hero formatter then does `new Date(...)` which works in V8 but is non-portable per spec.
8. There is **no zod schema** for the JSON payload; bad data sneaks in.
9. JSON content includes inline HTML: `<div class=\"summary-card\">` — this content needs sanitization in detail page (I28).
10. The two fields `id` (string) and `slug` (string) are both used for keys; pick one (slug is canonical for URLs; id is a synthetic).

### 6.2 Plan

**I-CQ-1 — Move filters to URL state**:

```ts
const [searchParams, setSearchParams] = useSearchParams();
const searchTerm     = searchParams.get('q') ?? '';
const selectedCategory = searchParams.get('cat') ?? 'All';
const setSearch = (q: string) => setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  q ? next.set('q', q) : next.delete('q');
  return next;
}, { replace: true });
const setCategory = (cat: string) => setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  cat === 'All' ? next.delete('cat') : next.set('cat', cat);
  return next;
}, { replace: true });
```

**I-CQ-2 — Adopt `AbortController`** in `useInsights`:

```ts
useEffect(() => {
  const ac = new AbortController();
  apiClient.get<InsightItem[]>(url, { signal: ac.signal })
    .then(setInsights)
    .catch(handleError);
  return () => ac.abort();
}, [url]);
```

(Confirm `apiClient.get` accepts `signal`; if not, extend it.)

**I-CQ-3 — Validate JSON with zod**:

```ts
const InsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  date: z.string(),
  author: z.string().optional(),
  readTime: z.string().optional(),
  slug: z.string(),
  summary: z.string(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  serviceId: z.string().optional(),
  featured: z.boolean().optional(),
  image: z.string().url().optional(),
  dateModified: z.string().optional(),
});
const InsightsArraySchema = z.array(InsightSchema);
```

Parse in `useInsights` before `setInsights`.

**I-CQ-4 — Move dates to ISO.** Update JSON to `"date": "2025-08-18"`. Render with `toLocaleDateString('en-IN', ...)` for human form. Store `dateModified` separately.

**I-CQ-5 — Add `pages/Insights.test.tsx`:**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Insights from './Insights';

test('filters by search term', async () => {
  // Mock useInsights to return fixture
  // …
  render(<MemoryRouter initialEntries={['/insights']}>
    <Routes><Route path="/insights" element={<Insights />} /></Routes>
  </MemoryRouter>);
  await waitFor(() => screen.getByRole('searchbox'));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'GST' } });
  expect(screen.queryByText(/sovereign credit rating/i)).toBeNull();
});
```

**I-CQ-6 — Drop `import * as ReactRouterDOM`** in favor of named imports, project-wide.

---

## 7. Security

### 7.1 Findings

1. **Search-term reflection:** the input value is rendered nowhere except inside the input itself. No XSS.
2. **JSON content stored as HTML strings (I28).** When `pages/InsightDetail.tsx` renders `insight.content`, it will likely use `dangerouslySetInnerHTML` — **must** sanitize. Today, `MarkdownRenderer.tsx` exists but the content is HTML, not markdown. Two options:
   1. Convert content to markdown and use `MarkdownRenderer` (recommended — opaque sanitization).
   2. Keep HTML and sanitize via DOMPurify before render.
3. **JSON fetch** is `same-origin` — fine. If migrated to a CDN, `Cache-Control` and `crossOrigin` need review.
4. **JSON-LD injection** via `SEO.tsx` — same `</script>` escape concern as About audit (carry that fix).
5. **Search/filter URL state** introduces user-controlled URL parameters; ensure these are not echoed back into HTML attributes without escaping when implementing I-CQ-1 (React already handles this).

### 7.2 Plan

**I-SEC-1 — Sanitize insight body content.** Add `dompurify` (or pick `sanitize-html`) and route the HTML through it:

```ts
import DOMPurify from 'isomorphic-dompurify';
const safeContent = useMemo(() => DOMPurify.sanitize(insight.content, {
  ALLOWED_TAGS: ['p','h2','h3','ul','ol','li','strong','em','blockquote','a','code','pre','div'],
  ALLOWED_ATTR: ['href','class','id'],
}), [insight.content]);
```

(Implementation lands in `pages/InsightDetail.tsx`, but flag here.)

**I-SEC-2 — Escape JSON-LD `<` characters** in `components/SEO.tsx` (one-line fix; reused across all audits).

**I-SEC-3 — Add a CSP** at the host/server level: `default-src 'self'; img-src 'self' https://images.unsplash.com data:; script-src 'self'; frame-src https://maps.google.com https://www.google.com;`. The Insights page should not need any external image/script.

---

## 8. Internationalization, Localization & Tone

### 8.1 Findings

1. Dates use `'en-GB'` in `formatArchiveDate` but the audience is Indian. Switch to `'en-IN'` (and keep DD-Mon-YY format if desired).
2. No translations in scope; the firm operates in English. Acceptable.
3. Hindi/Kannada terms appear in some content (none today, but probable). Search should fall through to a Unicode-aware compare.
4. Reading time uses "min read" — fine, but compute it from word-count instead of hard-coding (`readTime` is a manual field today).

### 8.2 Plan

**I-I18N-1 — Use `'en-IN'`** throughout date formatting helpers.

**I-I18N-2 — Implement Unicode-aware search:**

```ts
const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
```

Use `norm(insight.title).includes(norm(searchTerm))`.

**I-I18N-3 — Compute `readTime`** at build time from `content` word count. Add a script `scripts/build-insights.mjs` that:
1. Reads `dist/data/insights.json`.
2. For each entry, strips HTML, counts words, computes `Math.ceil(words / 200)` minutes.
3. Writes back into the JSON. Run as part of `npm run build`.

---

## 9. Analytics, Telemetry & Conversion

### 9.1 Findings

1. No instrumentation: chip clicks, search submits, card clicks, RSS subscribe — none tracked.
2. No "back to top" affordance on long lists.
3. No newsletter / RSS opt-in (already covered in IA).

### 9.2 Plan

**I-ANALYTICS-1 — Add `data-analytics` attributes** on chips, search input, cards, subscribe button. A single delegated listener at `App.tsx` level can ship events.

**I-ANALYTICS-2 — Track filter combinations** as a single event `insights_filtered` with `{cat, q_len}` so we never log raw query strings (privacy).

---

## 10. Concrete Codex Worklist (ordered)

> Each item references its finding ID. Codex should commit at marked checkpoints.

1. **I-A11Y-6** — Wrap page in `<main id="main">`.
2. **I-A11Y-1 (I1)** — Add `<label>` and `aria-label` to search input; switch `type="text"` → `type="search"`.
3. **I-A11Y-2 (I15)** — Add `aria-label="Clear search"` to the X button.
4. **I-A11Y-7 (I16, I18)** — Add `aria-hidden="true"` to all decorative Lucide icons.
5. **I-A11Y-5 (I3)** — Wrap dates in `<time dateTime={ISO}>` using new `toISO` helper.
6. **I-A11Y-3 (I2)** — Convert chip group to `role="tablist"` with arrow-key navigation. [⏸ commit]
7. **I-A11Y-4 (I7)** — Live-region announcement of result count via `useAnnounce` (existing context).
8. **I-PERF-1 (I9)** — Build schema from `insights`, not `filteredInsights`. Memoize.
9. **I-SEO-1 (I11)** — Replace schema with `Blog` + `BlogPosting[]`.
10. **I-SEO-2** — Pass breadcrumbs.
11. **I-SEO-3** — Update title/description.
12. **I-SEO-4 (I10)** — Centralize SITE constant. [⏸ commit]
13. **I-PERF-4 (I24)** — Replace `replace('//', '/')` with proper URL composition.
14. **I-PERF-3** — Module-level fetch cache for `useInsights`.
15. **I-PERF-2 (I4)** — `useDeferredValue` for search.
16. **I-CQ-1 (I13)** — Move `q` and `cat` to URL state via `useSearchParams`.
17. **I-CQ-3** — zod-validate the JSON. [⏸ commit]
18. **I-CQ-4** — Migrate JSON dates to ISO; expose `dateModified`.
19. **I-IA-1 (hero ordering)** — Sort hero by date desc.
20. **I-IA-3** — Consolidate `Income Tax` / `Income Tax Updates`.
21. **I-IA-5** — Render `author` and `readTime` on each card.
22. **I-IA-2** — Add `featured` field; render featured card distinctly.
23. **I-UI-1 (I29)** — One date format per region; use `<time>` and helpers.
24. **I-UI-3 (I14)** — Snap-scroll chip strip on small screens.
25. **I-UI-5** — Empty-state shows latest 3 with quick-clear.
26. **I-UI-6 (I8)** — Skeleton fidelity matches real card. [⏸ commit]
27. **I-IA-7 (I12)** — RSS/JSON Feed via Vite plugin; subscribe block.
28. **I-CQ-5** — Add `pages/Insights.test.tsx` (RTL + axe).
29. **I-I18N-1** — Switch date locale to `en-IN`.
30. **I-I18N-2** — Diacritic-insensitive search.
31. **I-I18N-3** — Compute `readTime` at build time. [⏸ commit]
32. **I-SEC-2** — JSON-LD `<` escape (shared SEO change).

---

## 11. Acceptance Criteria

Page is "done" when:

- Lighthouse mobile: Performance ≥ 90, A11y = 100, Best Practices ≥ 95, SEO = 100.
- axe DevTools: 0 critical/serious issues across loading / loaded / empty / error states.
- Search input has a visible-or-`sr-only` label, X button has an accessible name, and chips behave as a `tablist`.
- All dates appear once as ISO `<time datetime>` and once human-readable.
- Filter state survives reload and is shareable via URL (`/insights?cat=GST&q=mfa`).
- Schema does NOT change on filter input. `Blog`/`BlogPosting[]` validates in Rich Results Test.
- Subscribing posts to a server endpoint (or queues for now) and emits an analytics event.
- A user with screen reader hears "5 articles found" after typing two characters and waiting for the debounce.
- Stale content is on a content cadence (this is a content-ops task, not code).
- Insight detail page sanitizes content via DOMPurify (out of file scope but verified before shipping).
- `pages/Insights.test.tsx` passes in CI.

---

## 12. Out-of-scope items (parking lot)

- `pages/InsightDetail.tsx` security review — must run DOMPurify on `content`, must emit `BlogPosting` schema, must support `<link rel="prev/next">` to nearby posts.
- `MarkdownRenderer.tsx` audit — confirm the sanitizer schema (cross-cutting).
- A content-cadence policy: define minimum pace ("monthly", "on every Finance Bill") so we don't ship Aug-2025 posts indefinitely.
- Author profile pages (`/about/team/sagar-hr`) so each `BlogPosting.author` becomes a real `Person` URL — improves E-A-T.
- Migration to MDX for richer authoring (callouts, charts, calculators).
- Search ranking: today's `.includes` is a presence check. Adopt fuse.js for fuzzy + scored search if archive grows past 50 items.
- A11Y testing: add `vitest-axe` to CI; gate PRs on no critical issues.
- The `dist/` directory is in the repo — verify whether `dist/data/insights.json` is the canonical source or a build output. If output, move authoring source to `data/insights.json` and have Vite emit the dist copy.
