# Audit Plan — Article (Insight Detail) Page (`/insights/:slug`)

**Owner:** CA Sagar H R & Co. — website v3
**Audit date:** 29 Apr 2026
**Audited route:** `/insights/:slug` rendered by `pages/InsightDetail.tsx`, with markdown body fetched from `/content/insights/<slug>.md` and metadata from `/data/insights.json`.
**Reviewer's note:** This document is the *plan*. ChatGPT (Codex) will execute the changes. Each finding is **Problem → Why it matters → How to fix** so Codex can act without further questions. The Insights index page itself is **out of scope** for this round.

---

## 0. Scope of files audited

In-scope:

| Path | Role |
|---|---|
| `pages/InsightDetail.tsx` | The article page itself |
| `components/MarkdownRenderer.tsx` | Renders the article body |
| `components/skeletons/InsightDetailSkeleton.tsx` | Loading state |
| `components/Breadcrumbs.tsx` | Breadcrumb component reused here |
| `components/SEO.tsx` | Drives `<head>` + JSON-LD |
| `components/ui/Button.tsx` | Used for the mobile "Consult Expert" CTA |
| `hooks/useInsights.ts` | Fetches & validates `insights.json` |
| `hooks/useScrollPosition.ts` | Drives the reading-progress ring |
| `utils/insightDates.ts` | Date helpers |
| `utils/formatArchiveDate.ts` | Date helper for the related-cards |
| `utils/insightValidation.ts` | Runtime validation of insights payload |
| `utils/api.ts`, `utils/logger.ts` | Network plumbing |
| `public/data/insights.json` | Insights index |
| `public/content/insights/*.md` | Article bodies (currently raw HTML, not markdown) |
| `types.ts` (`InsightItem`) | Shared type |

Out of scope (this round): `/insights` listing page, `/insights` filters/search, the home-page "Latest insights" carousel, sitemap generation.

---

## 1. Severity legend

- **P0** — Broken behaviour, data correctness, security/privacy gap, or WCAG-A violation. Fix first.
- **P1** — Significant UX / a11y / SEO / performance regression. Fix this round.
- **P2** — Polish, refactor, future-proofing.

---

## 2. Executive summary

The article page is editorial-grade in look-and-feel, but six structural issues block it from being a production-ready content surface:

1. **The "markdown" pipeline isn't markdown.** Every file in `public/content/insights/*.md` is **raw HTML**, including `<p>`, `<h2>`, `<ul>`, and a custom `<div class="summary-card">`. `MarkdownRenderer.tsx:13-22` detects this and **silently** routes to `dangerouslySetInnerHTML` after running `DOMPurify` — but it also `console.warn`s on every page view. So we ship XSS-prone raw HTML in production while telling devs there's a markdown pipeline. (P0)
2. **Article body is duplicated across two sources.** `public/data/insights.json` carries the full HTML in a `content` field **and** the same article exists separately as `public/content/insights/<slug>.md`. The page only reads the `.md`, but the JSON `content` field is a permanent footgun: any contributor editing only one of them will silently desync the share preview vs. the actual page. (P0)
3. **404 / not-found handling silently redirects.** `pages/InsightDetail.tsx:56-60` redirects unknown slugs to `/insights` with no flash, no toast, no SEO 404. Search engines see a 200 response for any random `/insights/garbage-slug`. (P0 SEO)
4. **DOM mutation in `useEffect` for code-block copy buttons.** `pages/InsightDetail.tsx:75-114` queries the DOM and mutates it imperatively — this fights React's render lifecycle, leaks listeners on slug change in some edge cases, and races the markdown render. The article bodies don't even contain `<pre>` blocks today, so this 40-line block is dead-code for now and a tax on future maintainers. (P1)
5. **Sharing & SEO metadata is partial.** `<meta property="og:image">` defaults to a single site-wide image — every article shares the same preview. `twitter:creator`, `og:locale`, `article:published_time`, `article:author`, `article:section`, `article:tag` are missing. The `Article` JSON-LD references `Person` but provides no `url` / `sameAs` for the author. (P1)
6. **A11y debt.** Reading-progress ring is purely decorative but exposes "% Read" via `title`. Floating share rail is `aria-label`-ed but uses CSS-only tooltips that never respond to keyboard focus. The mobile share bar covers content (no scroll-padding compensation). The H1 wraps the title in `<em>` for stylistic italics, which causes screen-readers to announce it as emphasised speech. (P1)

The remediation plan below references every concrete file:line and gives Codex an exact change.

---

## 3. UX audit

### 3.1 Loading & error transitions

**Problem.** `pages/InsightDetail.tsx:175` returns `<InsightDetailSkeleton />` while the markdown is in flight. But:
- Once `insightSchema` resolves but `mdContent` is still loading, the skeleton hides the title (which is already known). Lost opportunity to show progressive content.
- On `fetchError` (line 178-188) the user sees a centred "Content Not Found" with a back link — fine — but there's no "Try again" and no telemetry.

**How to fix.**
- Render the **header** (title, date, breadcrumbs) the moment `insight` is available; show a body skeleton below it. Two-phase reveal.
- Add a `retry` button:
  ```tsx
  <button onClick={() => { setFetchError(false); refetch(); }}>Retry</button>
  ```
  — extract the body fetch into a `useArticleBody(slug)` hook so retry is straightforward.
- Send a Sentry event (when wired) or `logger.error` with the slug.

### 3.2 Not-found handling

**Problem.** `pages/InsightDetail.tsx:56-60`:
```ts
useEffect(() => {
  if (!loading && !insight && slug) {
    navigate('/insights');
  }
}, [loading, insight, slug, navigate]);
```
- Silent redirect — bad for users who copy-pasted a typo'd link.
- Returns HTTP 200 to crawlers (since this is a SPA navigation). Google indexes the dead URL.

**How to fix.**
- Render a dedicated 404 panel similar to `pages/NotFound.tsx`. Title the page "Article Not Found · Sagar H R & Co." and link to `/insights` plus the most-recent 3 articles.
- For SEO, when the SPA detects a missing slug it should **set a `<meta name="robots" content="noindex">`** in `SEOProps` and render. This requires extending `components/SEO.tsx` to accept `noindex?: boolean`.
- For full-fat SEO, pre-rendering each article (via `vite-plugin-prerender`) plus a `_redirects`/`vercel.json` rule that returns 404 for missing slugs is ideal — but at minimum, `noindex` on the dynamic 404.

### 3.3 Share & copy actions

**Problem.** Two share controls (Share, Copy Link) sit side-by-side (`pages/InsightDetail.tsx:258-280` desktop, 388-393 mobile). They do almost the same thing — Web Share API falls back to clipboard, and the explicit Copy Link button also copies. UX confusion.

**How to fix.**
- Keep **one** primary "Share" (uses Web Share API on capable devices, falls back to clipboard with a toast).
- Replace the second button with **Bookmark** (`localStorage` save, badge "Saved") — the article surface is exactly where users want this.
- Or replace with **Email** (`mailto:?subject=…&body=…`) which is the dominant share channel for finance audiences.

### 3.4 Floating share rail (desktop)

**Problem.** `pages/InsightDetail.tsx:254-315`:
- The rail is `lg:` only — narrower laptop viewports (e.g. iPad Air landscape, 1180 px) do show it but its tooltip text overflows under the article column.
- The "rail" is a single visual unit but each button has its own custom-styled tooltip rather than a shared component.
- Twitter's brand colour `#1DA1F2` is the legacy Twitter blue. X (current name) uses black/white. Decide: keep "Twitter" and the bird brand, or rename to "X" and update the icon.

**How to fix.**
- Consolidate tooltips into one `Tooltip` component (see §5 below).
- Remove the explicit `Twitter` brand colour or update to "X" (black). Rename `aria-label="Share on Twitter"` to `"Share on X"` — Lucide has no first-class X icon, so use the existing `Twitter` glyph but rename the visible label.
- Add a `Threads` / `Bluesky` button if the partner's audience is on those (skip if not).

### 3.5 Mobile fixed bottom bar

**Problem.** `pages/InsightDetail.tsx:387-398` — the bar is fixed at `bottom-6`, full width, with primary CTA "Consult Expert". It overlaps content at the end of the article. There's no `padding-bottom` on `<main>` to compensate, so the last paragraph hides under the bar on small phones.

**How to fix.**
- Add `pb-32 lg:pb-0` to `<main>` (line 318) so the article content is never covered.
- The bar uses `bg-brand-dark/90 backdrop-blur-lg` — backdrop-blur on iOS is heavy and can cause jank on long articles. Drop the blur on mobile if perf is an issue.
- Add `safe-area-inset-bottom`: `bottom: max(env(safe-area-inset-bottom), 1.5rem)` so it sits above the home indicator.

### 3.6 Reading progress ring

**Problem.** `pages/InsightDetail.tsx:67-72` computes scroll progress on every scroll event and the SVG uses `transition-all duration-100`, which on rAF-throttled scroll causes a perceptible lag on the percentage. Also:
- The ring competes visually with the bottom CTA bar — both are at bottom-right on mobile (`bottom-24` for the ring, `bottom-6` for the bar). On long article they stack OK, but on sub-iPhone-SE 5G screens (375×667) they collide.
- The "X% Read" string is exposed only via `title` — which is hover-only desktop. Add a visually-hidden `aria-live` announcement for keyboard users.

**How to fix.**
- Memoise `scrollProgress` per `requestAnimationFrame` tick (already done by `useScrollPosition`) but **drop the SVG `transition-all`** — the rAF tick already smooths it.
- Hide the ring on mobile (`lg:block` only) since the mobile bottom bar already anchors the user.
- Add `<span className="sr-only" aria-live="polite">{Math.round(scrollProgress*100)} percent read</span>` if we keep it. Probably overkill — consider removing.

### 3.7 Related insights logic

**Problem.** `pages/InsightDetail.tsx:155-172` — picks 3 same-category articles, then back-fills with cross-category. The fallback logic looks sound, but:
- The `slice(0, 3)` is taken **before** filtering, so if there are exactly three same-category articles plus an older one in the category, the older one is silently dropped — fine, but documents.
- No "by-tag" weighting (insights have a `tags` field — `types.ts:38`) — likely more relevant than category.
- The "Further Reading" heading is shown even for empty results — the conditional `relatedInsights.length > 0 &&` (line 344) handles this. ✅
- The card click target uses `<Link>` wrapping the whole card — fine for mouse, but the inner `time` and decorative arrow swallow the link semantics into "Apr · 25 [arrow]" for SR users. Add `aria-label={item.title}` to the outer `<Link>` so screen readers don't read the date and arrow as the link name.

**How to fix.**
- Score related = `tagOverlap*3 + sameCategory*2 + recency` then `slice(0,3)`.
- Add `aria-label` to outer `<Link>`.
- Memoise sorted insights; current code re-sorts every render but the input is stable.

### 3.8 Author card

**Problem.** `pages/InsightDetail.tsx:325-340` — the author block hardcodes "Senior Partner at {firm}, specializing in corporate taxation, audit assurance…" for **every** author. If a guest author publishes an article, this is wrong. Also, only the initial of the author's name is shown.

**How to fix.**
- Move author bio data into a `public/data/authors.json` keyed by author slug, with `{ name, title, bio, avatar, linkedin, twitter, sameAs[] }`.
- Add an `authorId` field to `InsightItem` (`types.ts:28-43`) and reference it from each insight.
- The author avatar is currently a coloured circle with the first initial — once `avatars.json` exists, swap to `<img>` with `width/height/alt`.
- Add `rel="author"` to the `Book Consultation` link if it's a personal CTA, or change CTA to "Read more by {Author}" linking to a future `/insights?author=…` filter.

### 3.9 Print

**Problem.** `pages/InsightDetail.tsx` has **no `print:` rules**. Printing an article therefore:
- Includes the dark fixed share rail and bottom bar (overlapping content),
- Uses `bg-brand-bg` which is a near-cream colour wasting toner,
- Wastes a top page on the 192 px-tall `pt-32` padding,
- Renders the 56-px reading-progress ring in the corner of every page.

**How to fix.** Add to the wrapper:
```css
@media print {
  .article-wrapper { color: black; }
  aside, .fixed { display: none !important; }
  body { background: white; }
  .pt-32, .md\:pt-48 { padding-top: 0; }
  h1, h2, h3 { page-break-after: avoid; }
  pre, blockquote, img { page-break-inside: avoid; }
}
```
Alternatively wire `print:hidden` onto the rail (line 254), the bottom bar (line 387), the progress ring (line 401), and the decorative blur backgrounds.
Add a small printed footer with the firm letterhead, similar to the Tax Calculator's existing print-letterhead pattern (`components/TaxCalculator/index.tsx:127-153`).

### 3.10 Microcopy

- `pages/InsightDetail.tsx:182` — "We couldn't load this article. It may have been moved or deleted." — better: "We couldn't find this article. It may have been moved, retired, or never existed."
- `pages/InsightDetail.tsx:266` — tooltip "Copied Link" appears for 2.5 s; the button label and tooltip both flicker. Pick one.
- `pages/InsightDetail.tsx:331` — "About the Author" heading is `<p>` — should be `<h4>`-equivalent or `<h3>`. Currently the section uses `<h3>` for the author name (line 332), which is fine, but the eyebrow should be a `<small>` or `<p className="eyebrow">`.

---

## 4. UI / Visual audit

### 4.1 Header layout

- `pages/InsightDetail.tsx:238-240` — the `<h1>` splits the title at the first space and italicises the rest: `<>{first} <em>{rest}</em></>`. This is a stylistic flourish that breaks for one-word titles (handled at line 239 with the ternary) but also for titles where the first space is inside a quoted phrase. Consider keeping the entire title as-is and applying italics via a CSS pseudo (`h1 > span:nth-child(n+2) { font-style: italic; }`) — accessible and resilient.
- The header's `<div className="flex flex-wrap justify-center items-center gap-6 …">` line 242 wraps long author names onto two lines with separator dots floating awkwardly. Add a `min-width: 0` and let the dots fall into a single horizontal row that scrolls horizontally on overflow.
- `border-t border-b` on the meta row uses `zone-border/50` — verify against light-mode contrast.

### 4.2 Decorative background blur

- `pages/InsightDetail.tsx:215` — a fixed 800×800 `bg-brand-moss/5 blur-[120px]` sits behind everything. On mid-range Android phones this **alone** halves the FPS during scroll (Chrome DevTools shows ~50 ms paint per frame). Replace with a static SVG noise / gradient image (`webp`, < 5 KB) or remove the blur entirely.

### 4.3 Markdown styling

`components/MarkdownRenderer.tsx:40-65` — the per-element overrides hard-code Tailwind classes. Two issues:

- Bullet `<li>` (line 48) uses `relative pl-8` but no actual bullet glyph (the original `<ul>` removes default markers). Add a `::before` content for visual marker:
  ```css
  .article-wrapper li::before { content: '—'; position: absolute; left: 0.5rem; color: var(--brand-moss); }
  ```
- `<a>` (line 45) has `decoration-0 pointer` (typo for `cursor: pointer`) and `border-b`. External links open in same tab — articles often link to gov.in pages; add `target="_blank" rel="noopener noreferrer"` for `href` starting with `http://` or `https://`. Detect via the `node.url` prop or post-process via rehype.
- `<blockquote>` (line 64) has `pl-8 py-2` and `border-l-4` but the `pl-8` puts text 32 px from the border — visually disconnected. Try `pl-6`.
- `<pre>` (line 63) styles dark-on-cream but `MarkdownRenderer` expects `<pre>` only when the content is real markdown. None of the current articles have code blocks, so this is purely future-proofing.

### 4.4 Code-block copy button (dead code)

`pages/InsightDetail.tsx:75-114` — the entire `useEffect` that injects copy-to-clipboard buttons over `<pre>` tags. As of today none of the articles in `public/content/insights/` contain `<pre>` blocks. The block runs on every article view, queries the DOM, attaches event listeners that are **not removed** on unmount (only the `setTimeout` is cleared via line 113).

**How to fix.**
- Move this logic into `MarkdownRenderer.tsx` as a real React component for `pre`:
  ```tsx
  pre: ({ node, ...props }) => <CodeBlock {...props} />
  ```
  where `CodeBlock` renders `<pre>` plus a real React `<button>` with `onClick={() => navigator.clipboard.writeText(...)}`. No more imperative DOM mutation.
- Until that lands, remove the `useEffect` from `InsightDetail.tsx:75-114` (it's dead code) — delete the entire effect.

### 4.5 Animations

- `animate-fade-in-up` on the header (line 221) and main (line 319) creates a small reveal on every navigation. Same vestibular concern as elsewhere — gate behind `motion-safe:`.
- The 3 related-insight cards animate together; consider a 50 ms stagger.

### 4.6 Iconography

- The "Share on Twitter" and "Share on LinkedIn" icons (line 302, 311) use brand-coloured hover states. Use the same restraint pattern as Lucide-default: monochrome by default, brand colour only on hover/focus. Already done ✅. But on mobile (touch) hover never fires — verify the icons are still readable.

---

## 5. Accessibility (WCAG 2.2 AA) audit

### 5.1 H1 wrapped in `<em>` — **P1**

**Problem.** `pages/InsightDetail.tsx:238-240`:
```tsx
<h1 …>
  {insight.title.includes(' ') ? <>{first} <em>{rest}</em></> : <em>{insight.title}</em>}
</h1>
```
Screen readers say *"emphasis on rest of title"*. The intent is purely visual italic.

**How to fix.** Replace `<em>` with `<span className="italic">` (or a Tailwind `font-serif italic` class). `<em>` should be reserved for true semantic emphasis.

### 5.2 Tooltip & keyboard support — **P1**

**Problem.** Each share-rail button (`pages/InsightDetail.tsx:265-267, 277-279, 288-290`) shows its tooltip via CSS-only `group-hover:opacity-100`. They do not appear on focus, cannot be dismissed with `Esc`, and aren't read by screen readers (no `aria-describedby`).

**How to fix.** Same fix as the Resources page: build a `Tooltip` component. Replace `aria-label` with proper `<button aria-describedby="tip-share">…<span id="tip-share" role="tooltip">Share</span></button>`.

### 5.3 Decorative icons — **P1**

`pages/InsightDetail.tsx` has many `<Icon size={...} />` calls without `aria-hidden="true"`:
- Line 263, 275, 287 — `Check`, `Share2`, `LinkIcon`, `Printer`. Some have `aria-hidden="true"` (good), but the trailing `Check` glyphs in the Copied state need `aria-hidden`.
- Line 372 — `<ArrowUpRight />` inside the related card (not aria-hidden).
- Line 423 — `<ArrowUp size={20} aria-hidden="true">` ✅.

Audit every Lucide instance and add `aria-hidden="true" focusable="false"`.

### 5.4 Live regions for state changes

- `Share Copied` and `Link Copied` toast-y states (lines 263, 275) only reveal text in the tooltip. A blind user has no announcement.
- Wrap the relevant region (or fire a toast via `useToast`) with `aria-live="polite"`. Cleaner: trigger `addToast('Link copied to clipboard', 'success')` and let the global Toast handle SR announcement (Toast widget already has `role="status"`).

### 5.5 Focus management on slug change

`pages/InsightDetail.tsx:62-64`:
```ts
useEffect(() => { window.scrollTo(0, 0); }, [slug]);
```
Scrolls but doesn't move focus. Screen-reader users navigating via the related-insights cards lose context — focus stays on the previous link. Fix:
```ts
useEffect(() => {
  window.scrollTo(0, 0);
  const h1 = document.querySelector<HTMLHeadingElement>('h1');
  h1?.focus();
}, [slug]);
```
Add `tabIndex={-1}` to the `<h1>` so it's focusable.

### 5.6 Skip-link

The site's global skip-link (likely in `App.tsx`) should target the article's `<main>` (line 318) — verify `id="main-content"` exists. If not, add `id="main-content"` to the `<main>`.

### 5.7 Breadcrumbs

`components/Breadcrumbs.tsx` is well-built (uses `<nav aria-label="Breadcrumb">`, `<ol>`, `aria-current="page"` on the last item). ✅ One nit: line 26 — the home link has `title="Home"` and an inner `Home` icon with no accessible name. Add `<span className="sr-only">Home</span>` so screen readers say "Home" and `<title>` is removed.

### 5.8 Color contrast

- The "BY {AUTHOR}" eyebrow (line 247) is `zone-text` on `zone-bg/50` — depending on theme zone, contrast may dip below 4.5:1. Verify in both light and dark modes (the `data-zone="editorial-paper"` likely sets light-mode tokens; verify).
- Related card "Apr · 25" (line 370) is `zone-text-muted` on `zone-bg` — borderline. Bump font-weight to `font-semibold` or use `zone-text` for the date.

### 5.9 Tables of contents (missing)

Long-form articles benefit from a TOC. Currently none. Add an auto-generated TOC that lists `<h2>` and `<h3>` headings with anchor links. Include `IntersectionObserver` to highlight the active section. Slug each heading via rehype-slug or in `MarkdownRenderer.tsx` `components.h2`.

### 5.10 Heading hierarchy

In `MarkdownRenderer.tsx`:
- `h1` (line 41) — articles should NOT contain `<h1>` (the page already provides one). Demote `h1` from markdown to `h2` or warn.
- `h2`/`h3`/`h4`/`h5`/`h6` — `h4` and `h5`/`h6` aren't overridden, so they fall back to the (likely undefined) global h4 styles. Add explicit overrides.

### 5.11 Article landmark

`pages/InsightDetail.tsx:319` wraps the body in `<article>`. ✅ But `<main>` (line 318) doesn't have an accessible name. Add `aria-label={insight.title}` or `aria-labelledby={titleId}`.

---

## 6. Security audit

### 6.1 Raw HTML execution — **P0**

**Problem.** `MarkdownRenderer.tsx:13-22` detects `content.trim().startsWith('<')` and switches to `dangerouslySetInnerHTML` after `DOMPurify.sanitize(content)`. Every current article goes through this path because the `.md` files are actually HTML.

DOMPurify protects against most XSS by default, but:
- The Markdown path has `rehypeSanitize` (line 39) — different defaults from DOMPurify.
- Article authors and CMS contributors don't see the HTML/markdown distinction. A copy-paste from Word with `<style>` tags, `<iframe>`, or `<script>` could slip in.
- DOMPurify defaults strip most actives but allow `<a target>` and `data:` URIs in some configs. Verify the default config doesn't allow `data:text/html`.

**How to fix.**
1. **Convert all article files to real Markdown.** Each `.md` should start with a heading and use markdown syntax. The `.summary-card` div should become a custom container, e.g.:
   ```md
   :::summary
   ### Key Takeaways
   - point one
   - point two
   :::
   ```
   Rendered via a remark directive plugin (`remark-directive`) and a custom React component for `summary` boxes.
2. **Drop the legacy-HTML branch entirely** once all files are migrated. `MarkdownRenderer.tsx:13-22` becomes:
   ```tsx
   if (!content) return null;
   return <div className={`article-wrapper ${className}`}><ReactMarkdown … /></div>;
   ```
3. Until migration completes, **harden DOMPurify**:
   ```ts
   DOMPurify.sanitize(content, {
     ALLOWED_TAGS: ['p','h1','h2','h3','h4','ul','ol','li','strong','em','a','blockquote','code','pre','table','thead','tbody','tr','td','th','div','span','br'],
     ALLOWED_ATTR: ['href','class','title'],
     ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
     FORBID_TAGS: ['style','iframe','script','object','embed','svg','math'],
     FORBID_ATTR: ['style','onerror','onload','formaction']
   });
   ```
4. Migrate the seven existing `.md` files (`new-income-tax-bill-2025.md`, `gst-reforms-2.0.md`, `tds-tcs-changes-2025.md`, `gst-compliance-updates.md`, `house-property-income.md`, `sp-rating-upgrade.md`) to genuine markdown. The structure is repetitive (intro `<p>`, `summary-card` div, sections, conclusion paragraph) — write a one-shot migration script.
5. **Delete the duplicate `content` field** in `public/data/insights.json` once `.md` migration is complete.

### 6.2 `dangerouslySetInnerHTML` — **P1**

Line 30 of `MarkdownRenderer.tsx`. After §6.1 step 2, this line disappears. Until then, see §6.1 step 3.

### 6.3 Console warning leaks

`MarkdownRenderer.tsx:17` — `console.warn('Legacy HTML content detected…')` runs in production. Either gate behind `process.env.NODE_ENV !== 'production'` or remove after migration.

### 6.4 Web Share API & navigator.clipboard

`pages/InsightDetail.tsx:116-149` — both APIs are guarded with capability checks (`navigator.share && navigator.canShare`). ✅ The fallback path catches errors. But:
- Line 136 falls back to `alert('Unable to copy link to clipboard.')` — `alert` is intrusive. Use `addToast` instead.
- `handleCopyLink` (141-149) has no fallback for non-secure contexts. On `http://localhost` Web Share fails too — switch to a `document.execCommand('copy')` fallback if `navigator.clipboard` rejects.

### 6.5 External link handling in markdown

After migration, every `<a>` rendered via `MarkdownRenderer.tsx:45` should auto-add `target="_blank" rel="noopener noreferrer nofollow"` for `http(s)://` hrefs that are not the same-origin. Implement via the components override.

### 6.6 SSRF via fetch

`pages/InsightDetail.tsx:41` — `fetch('/content/insights/${slug}.md')`. The slug comes from URL params. A malicious URL like `/insights/../../etc/passwd` would resolve at the dev server. Vite resolves to the `public` folder which sits inside the repo, so traversal is bounded to the public folder. Still, defensively whitelist:
```ts
if (!/^[a-z0-9-]+$/i.test(slug)) {
  setFetchError(true);
  return;
}
```

### 6.7 PII in URL & analytics

Every share URL includes the article slug — fine, no PII. Confirm there are no UTM tags appended that could leak referrers.

### 6.8 CSP

Same finding as the Resources page — site-wide CSP missing. Add a strict CSP including `img-src` allowance for any third-party images that may appear in articles in the future.

---

## 7. Content & data audit

### 7.1 Content duplication — **P0**

`public/data/insights.json:1-67` — every article contains a `content: "<p>…<\/p>"` field that duplicates the body in `public/content/insights/<slug>.md`. The page reads only the `.md`, so the JSON `content` is **dead** but heavy (the JSON is **52 KB** with the bodies, vs. ~3 KB without).

**How to fix.**
1. Drop the `content` field from `insights.json`. Keep only metadata.
2. Add a `wordCount` or `readMinutes` field computed from the `.md` body at build time (replace the hand-typed `readTime: "6 min read"`).
3. Add a `dateModified` field everywhere (currently missing in all 6 entries).
4. Add `tags: string[]` to every article (the `InsightItem` type allows it but no record uses it).

### 7.2 Read time

Hand-typed `readTime: "6 min read"` is brittle. Build-time computed (~200 wpm) avoids drift.

### 7.3 Author handling

See §3.8 — externalise author bios to `authors.json` so multiple writers can publish.

### 7.4 Insight validation

`utils/insightValidation.ts:6-8` — checks 8 required fields. After §7.1/§7.3, add `tags: string[]` (optional), `authorId: string` (required), `wordCount: number` (optional). Throw on schema mismatch with a clear message.

### 7.5 Markdown frontmatter

Once articles are real markdown, add YAML frontmatter:
```md
---
slug: gst-reforms-2.0
title: 'GST 2.0: Major Reforms on the Horizon'
category: GST & Compliance
date: 2025-08-17
dateModified: 2026-04-15
authorId: sagar-hr
tags: [gst, msme, reform]
summary: …
---
```
Then a build-step (Vite plugin) reads frontmatter and emits `insights.json` automatically. One source of truth.

---

## 8. SEO audit

### 8.1 Per-article OG image — **P1**

`pages/InsightDetail.tsx:194-211` calls `<SEO ogType="article" article={…} />` but doesn't pass `ogImage`. So every article shares the site's default OG image. Bad for click-through on LinkedIn / Twitter / WhatsApp.

**How to fix.** Add `ogImage` to the `<SEO>` props and source it from `insight.image` (already in the `InsightItem` type but unused). Fall back to a deterministic generated image:
- Build-time: generate a 1200×630 image per article using `satori` + `resvg`, with the title and author. Output to `public/og/<slug>.png`. Reference from `insight.image` automatically.

### 8.2 Article JSON-LD completeness

`components/SEO.tsx:152-177` builds an `Article` object. Missing/improvable fields:
- `articleSection` — should be `insight.category`.
- `keywords` — should be `insight.tags?.join(', ')`.
- `wordCount` — from `insight.wordCount`.
- `inLanguage` — `"en-IN"`.
- `author.url` — link to the author's profile page (once §3.8 lands).
- `publisher.logo` — currently `${SITE_URL}/logo.png`. Verify `logo.png` exists at deploy; if it's `/logo.svg`, update.
- `mainEntityOfPage` ✅.

### 8.3 BreadcrumbList JSON-LD

`pages/InsightDetail.tsx:200-204` passes `breadcrumbs` to `<SEO>`. ✅ The schema is auto-built by `SEO.tsx:139-150`. ✅

### 8.4 Twitter Card

`SEO.tsx:95-98` writes `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`. Missing:
- `twitter:site` — the firm's `@handle`.
- `twitter:creator` — the author's `@handle` (once authors.json has it).

### 8.5 Article-specific OG tags

`SEO.tsx:87-92` writes `og:title`, `og:description`, `og:url`, `og:type`, `og:image`. For `ogType === 'article'` we should also emit:
- `article:published_time`
- `article:modified_time`
- `article:author` (URL or name)
- `article:section`
- `article:tag` (one per tag)

Extend `SEO.tsx` to accept the article object and emit these.

### 8.6 Canonical URL on duplicate slugs

`SEO.tsx` defaults canonical to `window.location.href` (line 33-36). On a SPA, `useNavigate()` replacing the URL doesn't always trigger the SEO effect synchronously. Verify that on rapid `<Link>` clicks the canonical updates correctly. (`SEO.tsx:223` already lists `canonicalUrl` in deps ✅.)

### 8.7 `noindex` for not-found

See §3.2 — extend `SEO.tsx` to emit `<meta name="robots" content="noindex,follow">` when `noindex` prop is true.

### 8.8 RSS feed

A CA firm's articles audience often uses RSS readers. Generate `/rss.xml` (and `/atom.xml`) at build time from `insights.json`. Reference via `<link rel="alternate" type="application/rss+xml">` — the `SEO` component already supports `alternates` (line 111-120). ✅ Use it.

### 8.9 Sitemap

Verify `generate-sitemap.js` includes `/insights/<slug>` for each entry in `insights.json`. If not, add — and emit `<lastmod>` from `dateModified || date`.

### 8.10 Schema for related links

The "Related Insights" section is a UX feature, not a structured-data requirement, but adding `WebPageElement / itemListElement` JSON-LD around the related cards helps Google understand the page hierarchy. Optional.

---

## 9. Performance audit

### 9.1 Two HTTP fetches per page

Every article triggers:
- `GET /data/insights.json` (~52 KB today, ~3 KB after §7.1) via `useInsights`.
- `GET /content/insights/<slug>.md` (~5 KB).

Both block the article render. The metadata fetch is cached at module level (`useInsights.ts:8`) ✅. The markdown fetch isn't cached — clicking back-and-forth between two articles refetches each.

**How to fix.**
- Cache `mdContent` in a `Map<slug, string>` at module level inside `InsightDetail.tsx` (or a new `useArticleBody` hook).
- Add `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` for `/content/*.md` and `/data/insights.json` (in `vercel.json` or `_headers`).

### 9.2 Re-fetch on every slug change without abort

Line 41 issues a fetch but only handles success/failure — there's no `AbortController`. If the user clicks a related-insight before the previous article finishes loading, you can briefly see the wrong article. Fix:
```ts
useEffect(() => {
  if (!slug) return;
  const ctl = new AbortController();
  setMdContent(null);
  setFetchError(false);
  fetch(`/content/insights/${slug}.md`, { signal: ctl.signal })
    .then(...).catch(...);
  return () => ctl.abort();
}, [slug]);
```

### 9.3 Markdown rendering cost

`react-markdown` + `remark-gfm` + `rehype-sanitize` is ~50 KB gzipped. Add `React.lazy` so it only loads when an article opens, not when navigating to `/insights`.

### 9.4 Reading-progress ring

`scrollProgress` triggers a render of the entire page on every rAF tick. The progress ring is the only consumer. Memoise more aggressively:
- Move the progress ring into a separate `<ReadingProgress />` component that subscribes to `useScrollPosition` itself, so the parent doesn't re-render.
- Drop the SVG `transition-all` (it's already smoothed by rAF).

### 9.5 Code-block effect

§4.4 — delete the dead `useEffect` that injects copy buttons.

### 9.6 Image weight

No images today. Once article cover images land, mandate `<img loading="lazy" decoding="async" width="…" height="…" srcset="…" sizes="(min-width: 1024px) 800px, 100vw">` and serve `image/avif` + `image/webp` fallbacks via `<picture>`.

### 9.7 Bundle audit

Run `vite-bundle-visualizer` and confirm the article chunk doesn't include:
- `recharts`, `chart.js` (none expected),
- `dompurify` (only article chunk),
- the Tax Calculator code.

### 9.8 Background blur

`pages/InsightDetail.tsx:215` — see §4.2. Big perf hit on mobile.

---

## 10. Code-quality audit

### 10.1 Imports

- `pages/InsightDetail.tsx:4` — `import * as ReactRouterDOM from 'react-router-dom'` then destructure (line 16). Replace with named imports.
- `pages/InsightDetail.tsx:1` — `import Button from '../components/ui/Button';` is on **line 1** before React. Move into the alphabetised import block.

### 10.2 Hooks discipline

- `pages/InsightDetail.tsx:75-114` — DOM mutation inside `useEffect`; convert to a real component (§4.4).
- `pages/InsightDetail.tsx:67-72` — `useMemo` for scroll progress is correct, but `document.documentElement.scrollHeight` is read inside a `useMemo` whose only dependency is `scrollY`. If the article body grows after first paint (e.g., images lazy-load), `scrollHeight` is stale. Use `useEffect` with a `ResizeObserver` to recompute, or compute inline on each scroll tick.

### 10.3 Type safety

- `MarkdownRenderer.tsx:50` — `node, ...rest` destructuring; `node` is unused but kept for tree-shake. Add a `_` prefix and `// eslint-disable-line` or properly type.
- `pages/InsightDetail.tsx:204` — `url: window.location.pathname` for the breadcrumb — should be canonical absolute URL. `SEO.tsx` will resolve it via `SITE_URL` when not absolute, but cleaner to pass `/insights/${slug}` directly.

### 10.4 Tests

- No tests for `InsightDetail.tsx`. Add:
  - Render with a known slug → header, body, related cards present.
  - Unknown slug → 404 panel with retry; `noindex` meta present.
  - `fetchError` from server → error panel with Retry button; clicking retry re-issues the fetch.
  - Web-Share fallback to clipboard on a non-share-capable platform.
  - Print snapshot via Playwright (`emulateMedia({ media: 'print' })`).

### 10.5 `console.warn` in prod

`MarkdownRenderer.tsx:17` — gate behind dev mode (or remove after migration).

### 10.6 Magic numbers

- `radius = 24` (line 190) — make it a constant.
- Tooltip 2000 ms / 2500 ms timeouts (lines 106, 133, 145) — pull into `RESET_DELAY = 2000`.
- `pt-32 md:pt-48` (line 218) — page-top padding magic; move to a CSS var.

### 10.7 Comments

- `pages/InsightDetail.tsx:78` "Add small delay to ensure DOM is rendered" — band-aid. Once §4.4 lands this comment goes away.
- `useInsights.ts:8` — OK, documents the module-level promise pattern.

### 10.8 Dead code

- §4.4 — DOM mutation effect.
- `MarkdownRenderer.tsx:13-22` — legacy HTML branch (dies after §6.1 step 2).

---

## 11. Mobile & responsive audit

### 11.1 Bottom-bar overlap (P1)

See §3.5 — add `pb-32 lg:pb-0` to `<main>`.

### 11.2 Floating action collisions

Reading-progress ring at `bottom-24` and bottom bar at `bottom-6` (`pages/InsightDetail.tsx:402, 387`). On `iPhone SE` (375 × 667) they stack but the ring sits awkwardly above the share button. Hide the ring on mobile (`hidden lg:block`).

### 11.3 Tap targets

- Share-rail buttons are `w-12 h-12` ≈ 48 px ✅.
- Mobile bar buttons `w-12 h-12` ✅.
- Related-insight card arrow disc `w-8 h-8` (line 371) ≈ 32 px — but the entire card is the link, so this is fine.

### 11.4 Safe-area-inset

- Bottom bar (line 387) uses `bottom-6`. On notched/home-bar iPhones the bar covers the home indicator. Use `bottom-[max(env(safe-area-inset-bottom),1.5rem)]` (custom Tailwind plugin or arbitrary class).

### 11.5 Long titles

Test with `insight.title = "A very very very very long title that wraps onto three lines on iPhone SE"`. The `<h1>` line-height is `1.15` (line 238) — verify nothing collides with the meta-row below.

### 11.6 Keyboard on mobile

- Share / copy actions invoke native APIs that prompt the user. Verify on iOS Safari that `navigator.share` opens the system share sheet (it does on iOS 13+). ✅

---

## 12. Internationalisation / localisation

- `formatLongDate` uses `'en-IN'` ✅. `formatArchiveDate` uses `'en-IN'` ✅.
- The `<time dateTime>` attribute uses `toISODate(insight.date)` ✅.
- Article body is English-only; if Hindi/Kannada articles are planned, plan a `lang="hi"` / `lang="kn"` attribute on `<article>` and switch fonts via CSS `:lang(hi)`.

---

## 13. Analytics / observability

- Track `article_view` with `slug, category, author, scrollDepth (0/25/50/75/100)`.
- Track `share_click {channel: web-share|copy|twitter|linkedin|email|print}`.
- Track `related_click {fromSlug, toSlug, position}`.
- Capture `fetchError` to Sentry — currently only logged via `logger.error`.

---

## 14. Concrete change list (Codex execution checklist)

Order matters — earlier items unblock later ones.

**P0 — Correctness, content, security**

1. **Migrate articles to real markdown.** Replace each `.md` file in `public/content/insights/` with proper markdown (headings, lists, callouts via `:::summary` directive). Strip the `<div class="summary-card">` and translate to a remark-directive. Add YAML frontmatter (§7.5).
2. **Drop the legacy-HTML branch in `MarkdownRenderer.tsx`** (§6.1 step 2).
3. **Drop the `content` field from `public/data/insights.json`** (§7.1).
4. **Add `dateModified`, `tags[]`, `authorId`, `wordCount`** to every entry in `insights.json` (§7.1, §7.3).
5. **Externalise authors** to `public/data/authors.json` and replace the hardcoded bio in `pages/InsightDetail.tsx:333-335` with a lookup (§3.8).
6. **404 handling.** Replace silent redirect (line 56-60) with an in-page 404 panel + `noindex` meta tag (§3.2). Extend `SEO.tsx` with a `noindex` prop (§8.7).
7. **Slug whitelist.** Validate slug shape before fetching (§6.6).

**P0 — A11y critical**

8. Replace `<em>{rest}</em>` in the H1 with `<span className="italic">…</span>` (§5.1).
9. Audit every Lucide icon for `aria-hidden="true" focusable="false"` (§5.3).
10. Add `aria-label={item.title}` to related-card outer `<Link>` (§3.7).
11. Add `tabIndex={-1}` + focus call on `<h1>` after slug change (§5.5).
12. Ensure `<main id="main-content" aria-label={insight.title}>` (§5.6, §5.11).

**P1 — UX**

13. Two-phase loading: header ASAP, body skeleton (§3.1).
14. Retry button on fetch error (§3.1).
15. Replace second share button with Bookmark or Email (§3.3).
16. Tooltip primitive shared with the Resources page audit (§5.2).
17. Mobile bottom bar — `pb-32` on main, `safe-area-inset-bottom` (§3.5, §11.4).
18. Hide reading-progress ring on mobile (§3.6, §11.2).
19. Print stylesheet (§3.9).
20. Microcopy (§3.10).
21. `motion-safe:` guard for fade-in animations (§4.5).

**P1 — SEO**

22. Generate per-article OG image at build time (`satori` + `resvg`) → `/og/<slug>.png`; pass to `<SEO>` as `ogImage` (§8.1).
23. Extend `<Article>` JSON-LD with `articleSection`, `keywords`, `wordCount`, `inLanguage`, `author.url` (§8.2).
24. Emit `article:published_time`, `article:modified_time`, `article:author`, `article:section`, `article:tag` meta (§8.5).
25. `twitter:site`, `twitter:creator` (§8.4).
26. Generate `/rss.xml` and reference via `alternates` (§8.8).
27. Update `generate-sitemap.js` to emit `<lastmod>` from `dateModified` (§8.9).

**P1 — Perf**

28. Cache `mdContent` per slug in module-level `Map` (§9.1).
29. AbortController on the `mdContent` fetch (§9.2).
30. `React.lazy` for the entire `InsightDetail` route + `MarkdownRenderer` (§9.3).
31. Replace fixed-blur background with a static SVG gradient (§4.2, §9.8).
32. Reading-progress ring → its own component subscribing to scroll (§9.4).
33. Add Cache-Control headers for `/content/*.md` and `/data/insights.json` (§9.1).

**P2 — Code quality**

34. Delete dead code-block copy effect (`pages/InsightDetail.tsx:75-114`) (§4.4, §10.8).
35. Replace `import * as ReactRouterDOM` with named imports (§10.1).
36. Externalise magic numbers (§10.6).
37. Markdown component overrides — auto-add `target="_blank" rel="noopener noreferrer nofollow"` for external links (§4.3, §6.5).
38. Add `<caption>` and improve heading overrides in `MarkdownRenderer` (§5.10, §4.3).
39. Rename Twitter → X if leadership accepts (§3.4).

**P2 — Tests & telemetry**

40. Component tests for `InsightDetail` (§10.4).
41. Playwright tests: navigation, 404, retry, print, share fallback, keyboard nav (§10.4).
42. Wire analytics for `article_view`, `share_click`, `related_click` (§13).

---

## 15. Acceptance criteria for Codex's PR

- [ ] All P0 items closed; tests added.
- [ ] Every article is real markdown — `MarkdownRenderer.tsx` no longer contains the legacy-HTML branch.
- [ ] `public/data/insights.json` does not contain `content`; size drops by > 90 %.
- [ ] Visiting `/insights/garbage-slug` shows an in-page 404 with `<meta name="robots" content="noindex">` and links to `/insights`.
- [ ] axe-core (or Lighthouse a11y) ≥ 95 on every article.
- [ ] Lighthouse SEO ≥ 95.
- [ ] Lighthouse Performance ≥ 90 (mobile, simulated).
- [ ] OG-image preview is unique per article (verify on LinkedIn Post Inspector and Twitter Card Validator).
- [ ] No console warnings on initial article load.
- [ ] Print preview shows the article body on white, no fixed bars/rings, with a small letterhead-style footer.
- [ ] Sitemap lists every article with correct `lastmod`.
- [ ] No new `any` types.

---

## 16. Open questions for Sagar (block these before merging)

1. **Author bio** — single firm voice for all articles, or guest authors planned? Needed before §3.8 / authors.json.
2. **Twitter vs X branding** — keep current Twitter brand, or rename to "X"?
3. **Bookmark vs Email** as the second share action — pick one.
4. **OG image template** — title-only, or include author headshot? (Affects the `satori` template.)
5. **Markdown directive set** — adopt `remark-directive` for `:::summary`, `:::tip`, `:::warning`? Or keep it plain markdown and style with `<blockquote>` only?
6. **RSS** — yes/no?
7. **Pre-render articles at build** (`vite-plugin-prerender` / `@solidjs/start` style) for SEO, or stay client-rendered?
8. **Code-block copy buttons** — do we expect future articles to contain code/snippets? If no, drop the dead effect entirely (§4.4); if yes, build `CodeBlock` component now.

---

*End of Article (Insight Detail) page audit.*
