# Sagar H R & Co. — Comprehensive Website Audit & Remediation Plan

**Audit date:** 2026-05-02 · **Site context:** FY 2025-26 / AY 2026-27
**Stack:** React 18 + TypeScript + Vite + Tailwind, BrowserRouter, Netlify hosting, FormSubmit form relay
**Purpose of this doc:** A single, exhaustive, prioritised, _executable_ audit plan. Each item has (a) Where, (b) Problem, (c) Fix — written so Codex (or any developer) can apply changes without re-discovering the diagnosis.

> **How to use this plan in Codex.** Work top-to-bottom in priority order (P0 → P3). Each finding has an ID (e.g., `SEC-01`). Tackle one ID at a time, run `npm run build && npm test` after each cluster, and commit per ID with the message `[ID] short summary`. Items inside the same priority block are independent unless explicitly noted as a dependency.

---

## 0. Snapshot of findings

| Area                   | Critical (P0) | High (P1) | Medium (P2) | Low (P3) | Total   |
| ---------------------- | ------------- | --------- | ----------- | -------- | ------- |
| Security & forms       | 2             | 5         | 4           | 2        | 13      |
| Accessibility          | 3             | 5         | 7           | 5        | 20      |
| Performance & SEO      | 3             | 5         | 6           | 3        | 17      |
| Pages / UX             | 1             | 4         | 9           | 6        | 20      |
| Components & hero      | 0             | 3         | 8           | 5        | 16      |
| Content / data         | 1             | 1         | 3           | 2        | 7       |
| Code quality / tooling | 1             | 3         | 4           | 3        | 11      |
| **Totals**             | **11**        | **26**    | **41**      | **26**   | **104** |

P0 = ship-blocker / data-integrity / privacy / security risk.
P1 = noticeable user-facing or SEO loss.
P2 = quality / maintainability.
P3 = polish.

---

## 1. P0 — Critical (do first)

### SEC-01 · Remove hard-coded email fallback in form endpoint

- **Where:** `config/contact.ts:50` and `constants/contact.ts` (duplicate of same logic).
- **Problem:** `formEndpoint` defaults to `https://formsubmit.co/ajax/mail@casagar.co.in`, exposing the real inbox in the production bundle and bypassing the Netlify `/api/contact` proxy that exists specifically to hide it. If `VITE_FORM_ENDPOINT` is unset on a build, every visitor's browser gets the raw email.
- **Fix:**
  1. Replace the fallback with `'/api/contact'` (which Netlify already redirects to the hashed FormSubmit URL).
  2. Throw at module load if `import.meta.env.PROD` and the resolved endpoint contains `mail@`.
  3. Delete duplicate logic from `constants/contact.ts` and re-export from `config/contact.ts` only.
  4. Update `.env.example` to make the requirement explicit.

### SEC-02 · Tighten Content-Security-Policy

- **Where:** `netlify.toml:41`.
- **Problem:** `script-src 'self' 'unsafe-inline' …` and `style-src 'self' 'unsafe-inline'` defeat CSP's main XSS protection. Vite's production build has no required inline scripts; Tailwind output is in a stylesheet. The only real inline need is GA `gtag()` bootstrap.
- **Fix:**
  1. Remove `'unsafe-inline'` from `script-src`. If a runtime inline script remains (verify with build output), replace with a SHA-256 hash via `'sha256-…'`.
  2. Remove `'unsafe-inline'` from `style-src`. Tailwind compiles to a stylesheet; check `components/hero/HeroFrontispiece.tsx`, `HeroLedger.tsx`, `HeroArchive.tsx`, `HeroDirectory.tsx` for inline `<style>` tags (see CMP-04) and move them to `index.css`.
  3. Add `'strict-dynamic'` only after step 1 + 2 stabilise.
  4. Add `report-uri` (or `report-to`) so violations show up before they bite users.
  5. Add `Cross-Origin-Resource-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` headers under `[[headers]] for = "/*"`.

### SEC-03 · Server-side spam controls (honeypot + rate limit)

- **Where:** `hooks/useRateLimit.ts`, `components/forms/Honeypot.tsx`, `pages/Contact.tsx`, `components/forms/CareerForm.tsx`.
- **Problem:** Both the honeypot and the rate limit are pure client checks (localStorage). Any bot that disables JS or clears storage submits unlimited messages.
- **Fix:**
  1. Add a Netlify Function `netlify/functions/contact.ts` that:
     - reads the JSON body, asserts honeypot field is empty,
     - hashes `(ip + email + day)` in a Netlify Edge KV / Blob and rejects ≥ 5 in 24 h,
     - forwards the validated payload to the FormSubmit endpoint,
     - returns 204 on success / 429 on throttle / 422 on honeypot.
  2. Update `netlify.toml` redirect: `from = "/api/contact"` → `to = "/.netlify/functions/contact"` instead of FormSubmit directly.
  3. Add `botpoison` (free) or hCaptcha invisible token to forms — both are CSP-friendly.
  4. Keep the client-side rate limit as UX hint only (already done).

### A11Y-01 · MarkdownRenderer collapses h1 and h2 into the same level

- **Where:** `components/MarkdownRenderer.tsx:94-95`. Both `h1` and `h2` map to `<h2>`, so any `# Heading` in markdown renders identical to `## Heading`.
- **Problem:** Heading hierarchy collapses; screen readers cannot distinguish article landmarks. Articles that begin with `#` silently lose semantic level.
- **Fix:**
  1. Decision: article markdown should never start with `#` because the page already renders the article title as `<h1>`. Lint that constraint by extending `utils/insightValidation.ts` to scan markdown content and reject a leading `#` heading (warn at build).
  2. Render `h1` markdown as `<h2 role="heading" aria-level={2}>` only if validation guarantees no markdown `#` exists; otherwise render `h1` as `<h2>` _and_ surface a build warning.
  3. Update `utils/markdownToHtml.ts` (line ~88) to use `<p>` per paragraph, not `<br>`.

### A11Y-02 · CookieConsent has no focus trap, no Esc handler, weak dialog semantics

- **Where:** `components/CookieConsent.tsx`.
- **Problem:** It is a banner-style modal but lacks `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus capture, Escape-to-dismiss, and focus return. GDPR/DPDP compliance is undermined when keyboard users cannot interact predictably.
- **Fix:**
  1. Wrap the visible card in `<div role="dialog" aria-modal="true" aria-labelledby="cc-title" aria-describedby="cc-desc">`.
  2. Use the existing `hooks/useFocusTrap.ts` (after fixing CQ-04) and `hooks/useReturnFocus.ts`.
  3. Add a `useEffect` that listens for `keydown` Escape ⇒ "Decline".
  4. Move keyboard focus to the first action button on mount.
  5. Make the dismiss-X button visible on focus (today only on hover).

### A11Y-03 · Focus trap selector is incomplete

- **Where:** `hooks/useFocusTrap.ts:17-19`.
- **Problem:** The tabbable selector misses `input[type="email|tel|number|search|url|password"]`, `[contenteditable="true"]`, `summary`, `audio[controls]`, `video[controls]`. Users can tab out of the mobile nav / cookie modal into hidden background content.
- **Fix:** Replace with the canonical selector list (mirror `focus-trap` package or @react-aria's). Treat anything matching `:not([disabled]):not([aria-hidden="true"]):not([tabindex="-1"])` and visible (`offsetParent !== null` or computed `display !== none`).

### PERF-01 · `og:image` default points to a non-existent file

- **Where:** `components/SEO.tsx` (default `image='/og-image.jpg'`) and `index.html` (no static `og:image`).
- **Problem:** Every social share without an explicit override links to a missing image; LinkedIn / WhatsApp previews fall back to no card.
- **Fix:**
  1. Generate a 1200×630 PNG `public/og/og-default.png` with firm name + tagline.
  2. Set the SEO default to `/og/og-default.png`.
  3. In `index.html`, add static `og:image`, `og:image:width="1200"`, `og:image:height="630"`, `og:image:type="image/png"`, `twitter:card="summary_large_image"`, `twitter:image`.
  4. For each insight, the existing `/og/<slug>.svg` is fine for the article schema but is not great for social previews; render PNGs with @vercel/og at build time or precompute one PNG per slug.

### PERF-02 · Font preloads only cover 2 of 7 weights actually used

- **Where:** `index.html:19-20`.
- **Problem:** Body text (Plus Jakarta Sans 400/500/700), Fraunces italic, and JetBrains Mono are all `@font-face`-declared in `index.css` but unpreloaded → render-blocking on every cold load.
- **Fix:** In `index.html` head, preload Jakarta-400, Jakarta-500, Jakarta-700, Fraunces-400-italic. Demote any face that is below-the-fold to `font-display: optional` (already done for italic + mono — verify). Subset to Latin if not already (filenames suggest yes).

### PERF-03 · `founder.jpg` is 706 KB and shipped raw

- **Where:** `public/images/founder.jpg`; usage in `components/home/FounderSection.tsx` and `pages/about/Principal.tsx`.
- **Problem:** Resized variants (`founder-{320,480,640}.{jpg,webp,avif}`) exist but the 706 KB original is still referenced somewhere. Hero of the home page becomes a 700 KB image on every first paint.
- **Fix:**
  1. Audit every `<img src>` / `<source srcSet>` referencing `founder.jpg` and switch them to the `<picture>` pattern with `srcSet="founder-320.avif 320w, founder-480.avif 480w, founder-640.avif 640w"` plus `<source type="image/webp">` plus `<img src="founder-640.jpg">` fallback.
  2. Re-encode `founder.jpg` (the original) to ≤ 90 KB at 960 px and rename `founder-960.jpg` for retina.
  3. Add `width`/`height` props on every `<OptimizedImage>` call to reserve space (CLS).

### CONT-01 · Site-wide content staleness (insights archive frozen at Aug 2025)

- **Where:** `public/data/insights.json`, `public/content/insights/*.md`. Today is May 2026; latest article is Aug 18 2025.
- **Problem:** A CA firm site that stopped publishing 8.5 months ago signals dormancy. SEO ranking decays, and articles whose forward-looking statements ("from April 2025 these rules will…") are now historical.
- **Fix:**
  1. Add at minimum: a Budget 2026 recap, an FY 2025-26 year-end planning piece, an FY 2026-27 compliance calendar walkthrough, and a GST 2.0 status update.
  2. Update each existing article's prose from future-tense to past-tense where the implementation date has passed, and bump `dateModified` in `insights.json`.
  3. Add `frontmatter` to each `.md` (title, slug, date) and drive `insights.json` from a build script that reads frontmatter, eliminating dual-source drift.

### QUAL-01 · No CI, no ESLint, TS strict mode disabled

- **Where:** repo root (no `.github/workflows`), no `.eslintrc`, `tsconfig.json:1-28`.
- **Problem:** Without strict mode and lint, changes routinely break type guarantees (see ~20 `as any` casts). No automated gate prevents regressions on push.
- **Fix:**
  1. `tsconfig.json`: set `"strict": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": false, "useUnknownInCatchVariables": true`. Run `npx tsc --noEmit` and fix in a single PR (mostly catch blocks and index access).
  2. Add ESLint flat config (`eslint.config.js`) extending `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`. Add `"lint": "eslint ."` to `package.json` scripts.
  3. Add Prettier (`.prettierrc.json`) and `prettier-plugin-tailwindcss` for class ordering.
  4. Add `.github/workflows/ci.yml`:
     - matrix Node 20.x, runs `npm ci && npm run lint && npx tsc --noEmit && npm test -- --run && npm run build`.
     - upload Playwright/Lighthouse artefacts.
  5. Add `husky` + `lint-staged` for pre-commit type-check + lint + format.

---

## 2. P1 — High (next sprint)

### Security & forms

- **SEC-04 · localStorage form drafts unencrypted.** `hooks/useFormDraft.ts`. Career form drafts include name, email, phone, education. Encrypt with WebCrypto AES-GCM keyed by a session-scoped salt (don't try to keep the key secret — encrypt only to slow casual exfiltration via XSS). Document in Privacy Policy.
- **SEC-05 · CareerForm file uploads lack validation.** `components/forms/CareerForm.tsx`. Restrict accept to `.pdf,.doc,.docx`, max 5 MB; verify MIME via magic-byte sniff client-side, then re-verify in the Netlify Function. Reject password-protected ZIPs.
- **SEC-06 · Logger persists raw errors.** `utils/logger.ts`. Add 7-day TTL per log entry; skip persistence in production unless `?debug=1` query is present; never log full stack traces of `Error` instances coming from forms.
- **SEC-07 · `target="_blank"` audit.** Sweep all `<a target="_blank">` and add `rel="noopener noreferrer"`. The MarkdownRenderer already does this for external links (line 116). Confirm Footer social links and `pages/Resources/ImportantLinksGrid.tsx` do too.
- **SEC-08 · Mailto subject/body construction.** `pages/Contact.tsx`, `components/ErrorBoundary.tsx`. Wrap with `encodeURIComponent` and cap body length at 1500 chars before encoding to avoid corrupted mail clients.

### Accessibility

- **A11Y-04 · Toast component uses `role="alert"` for everything.** `components/Toast.tsx`. Switch success/info to `role="status"` (`aria-live="polite"`); keep error/warning as `role="alert"`.
- **A11Y-05 · No `aria-current="page"` on Navbar links.** `components/Navbar.tsx:93-114`. Add `aria-current={isActive ? 'page' : undefined}`.
- **A11Y-06 · External links don't announce new-window.** Add `aria-label="… (opens in new window)"` to all `target="_blank"` links (Footer, ImportantLinksGrid, Insight share buttons).
- **A11Y-07 · CustomCursor.** `components/CustomCursor.tsx`. Today it sets global `cursor: none`. Gate it behind `pointer: fine`, `prefers-reduced-motion: no-preference`, _and_ an explicit user opt-in stored in localStorage (default off).
- **A11Y-08 · AnnounceContext clears too quickly.** `context/AnnounceContext.tsx:19`. Increase the clear timeout from 3 s to 7 s; also re-emit the same string by appending a zero-width space if announced twice in a row (otherwise SR ignores the duplicate).

### Performance & SEO

- **SEO-01 · Insights canonical includes query params.** `components/SEO.tsx:46-49` + `pages/Insights.tsx`. Strip `?q`, `?cat`, `?page` from the canonical so search and filter combinations don't dilute ranking. The Insights page should pass an explicit `canonicalUrl={SITE_URL + '/insights'}`.
- **SEO-02 · 404 not signalled to crawlers.** `pages/NotFound.tsx`. Set `<SEO noindex />`. Also add `pages/InsightDetail.tsx` and `pages/ServiceDetail.tsx` invalid-slug branches that render `NotFound` _and_ set noindex (currently they render skeletons forever — see UX-04).
- **SEO-03 · Sitemap `lastmod` is build-time, not content-time.** `scripts/generate-sitemap.ts`. For each insight, use the markdown frontmatter or `dateModified` from `insights.json`. For static pages, use the file's git mtime.
- **SEO-04 · No LocalBusiness schema with hours, geo, sameAs.** `constants/servicesSchema.ts` only has `AccountingService`. Add a top-level `LocalBusiness` JSON-LD on Home and Contact: `name`, `image`, `geo`, `address`, `telephone`, `openingHoursSpecification`, `sameAs: [linkedin, whatsapp]`, `areaServed: ['Mysuru', 'Karnataka', 'India']`, `priceRange: '₹₹'`.
- **SEO-05 · No Twitter Card meta.** `components/SEO.tsx`. Add `twitter:card="summary_large_image"`, `twitter:site`, `twitter:image:alt`.

### Pages / UX

- **UX-01 · Related-insights recency score is broken.** `pages/InsightDetail.tsx:242` divides `Date.now()` by `1e13`, which makes recency contribute ≈ 0 to the relevance score. Replace with a normalised score: `(daysSince < 365 ? 1 - daysSince/365 : 0) * weight`.
- **UX-02 · Service detail title splits on first space and bolds only the first word.** `pages/ServiceDetail.tsx:51`. Either split deliberately by passing a `{lead, rest}` tuple from `SERVICE_DETAILS`, or stop splitting and use CSS `text-wrap: balance` (already in `index.css:421`).
- **UX-03 · Footer copyright Roman numerals are hard-coded.** `components/Footer.tsx:112`. Replace `'MMXXIII'` with `toRomanNumeral(new Date().getFullYear())` (helper exists at `utils/toRomanNumeral.ts`).
- **UX-04 · `useArticleBody` failure leaves page in skeleton.** `hooks/useArticleBody.ts` and `pages/InsightDetail.tsx`. Add a `.catch` that sets `error`, render a 404-style block with a "Back to Insights" CTA, and noindex the page (links to SEO-02).

### Code quality

- **QUAL-02 · `as any` casts in hot paths.** `components/hero/PageHero.tsx:13-19`, `components/CookieConsent.tsx:20-36`, `utils/api.ts:70`, `utils/logger.ts:4-5`, `pages/Resources.tsx:41`. Replace with discriminated unions (PageHero), `Window & { gtag?: Gtag.Gtag }` declaration merging (CookieConsent), `unknown` + `instanceof` (api/logger), `LucideIcon` import type (Resources).
- **QUAL-03 · Duplicate sitemap generators.** `generate-sitemap.js` (legacy) and `scripts/generate-sitemap.ts` (build-wired). Delete `generate-sitemap.js`.
- **QUAL-04 · Duplicate contact-info modules.** `config/contact.ts` and `constants/contact.ts`. Keep `config/contact.ts`; have `constants/contact.ts` re-export only.

### Components

- **CMP-01 · Inline `<style>` tags in hero variants.** `HeroLedger.tsx:65-70`, `HeroArchive.tsx:35-41`, `HeroDirectory.tsx:47-50`, `HeroFrontispiece.tsx:10-13`. They re-mount a `<style>` element every render, leak global CSS, and require the CSP `'unsafe-inline'`. Move to `index.css` under `[data-zone]` selectors.
- **CMP-02 · Unsafe dynamic Tailwind classes.** `HeroFrontispiece.tsx:6`, `HeroSplit.tsx:7`, `HeroFolio.tsx:58-59` use `text-brand-${accentTone}` / `.replace('text-', 'bg-')`. Tailwind's content scanner misses these → classes get purged. Replace with a typed map: `const accentClass = { brass: 'text-brand-brass', rust: 'text-brand-rust' }[accentTone]`.
- **CMP-03 · `Reveal` shared IntersectionObserver doesn't dedupe across remounts.** `components/Reveal.tsx`. Track callbacks in a `WeakMap<Element, () => void>` keyed on the DOM node, and unobserve on cleanup before deleting from the map.

### Content / data

- **CONT-02 · Update README router type.** `README.md:9` says `HashRouter`; actual is `BrowserRouter` (verified in `App.tsx:15`).

---

## 3. P2 — Medium

### Security & forms (P2)

- **SEC-09 · Cookie consent loads GA via dynamic script append without `crossorigin`.** Add `script.crossOrigin = 'anonymous'` and a `script.onerror` handler.
- **SEC-10 · MarkdownRenderer allowlist of `summary-card` className is fragile.** `components/MarkdownRenderer.tsx:35-44`. The `defaultSchema.attributes.div` already supports `className` for class allow-listing; verify the chosen approach matches `rehype-sanitize` v6 API and add a unit test in `utils/markdownToHtml.test.ts` that asserts an injected `<script>` is stripped.
- **SEC-11 · `CopyablePre` copies React children directly.** `components/MarkdownRenderer.tsx:51`. `String(children)` on a React element produces `[object Object]`; the actual code is in `children.props.children`. Use the existing `getNodeText` helper (line 16).
- **SEC-12 · Email exposed as `mailto:` everywhere.** `Footer`, `Contact`, `LocationStrip`, `Career`. Pipe through a single `<MailLink>` component that `data:`-encodes the address client-side after first user interaction (light obfuscation).

### Accessibility (P2)

- **A11Y-09 · CustomDropdown lacks `aria-owns`.** `components/forms/CustomDropdown.tsx:209`. Add for clearer SR pairing.
- **A11Y-10 · Footer link focus rings missing.** `components/Footer.tsx:55,74,90,94`. Add `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-moss`.
- **A11Y-11 · Marquee has no pause-on-focus.** `components/Marquee.tsx:47`. Pair `group-hover:[animation-play-state:paused]` with `focus-within:[animation-play-state:paused]` and a Pause button for assistive tech.
- **A11Y-12 · Preloader silent for SR.** `components/Preloader.tsx`. Add `<span className="sr-only" aria-live="polite">Page loading…</span>`.
- **A11Y-13 · Calculator results not announced.** `components/TaxCalculator/ResultsDisplay.tsx`, `pages/Resources/HRACalculator.tsx`, `GSTCalculator.tsx`, `CIICalculator.tsx`. Wrap totals in `<output aria-live="polite">` or call `announce()` from `useAnnounce` whenever a calculation completes.
- **A11Y-14 · WhatsApp float lacks visible focus ring.** `components/WhatsAppFloat.tsx:30-40`.
- **A11Y-15 · `mix-blend-difference` cursor.** `components/CustomCursor.tsx`. Provide a high-contrast fallback when `forced-colors: active`.

### Performance & SEO (P2)

- **PERF-04 · `home-hero-office.webp` (362 KB) > AVIF (227 KB).** Re-encode WebP at higher compression (q 50, near-lossless 60); ship if smaller, else drop the WebP source for that asset and rely on AVIF.
- **PERF-05 · No `<picture>` + `width`/`height` enforcement.** Update `components/OptimizedImage.tsx` to require `width` and `height` props (TS error if missing) so every image reserves space for itself (CLS).
- **PERF-06 · `useInsights` re-fetches on each route switch when no cache hit.** Already has a module-scope promise; broaden to `Map<key, Promise>` so insight detail and insight list share cache. Or migrate to `@tanstack/react-query` for global caching with stale-while-revalidate.
- **PERF-07 · No HTTP cache headers for `/assets/*`.** `netlify.toml`. Add `[[headers]] for = "/assets/*"` with `Cache-Control = "public, max-age=31536000, immutable"` (Vite's hashed assets are safe).
- **PERF-08 · `manualChunks` does not split heavy pages.** `vite.config.ts:29-33`. Add `splitVendorChunkPlugin()` and verify `pages/Resources/*` calculators are lazy chunks (they are imported eagerly inside `pages/Resources.tsx` today — convert to `React.lazy` per tab).
- **PERF-09 · No Lighthouse CI.** Add `treosh/lighthouse-ci-action` to CI, fail PRs that drop Performance < 85, A11y < 95, SEO < 95.

### Pages / UX (P2)

- **UX-05 · Sitemap (`public/sitemap.xml`) committed and stale.** It is 2 days behind today and inconsistent with `scripts/generate-sitemap.ts`. Either remove from git and rely on the build artefact, or add a pre-commit hook that regenerates it.
- **UX-06 · Disclaimer "Effective: 26 August 2025" is 9 months old.** `pages/Disclaimer.tsx:32`. Refresh effective date once the document is reviewed; add a "Last reviewed on" field separate from "Effective from".
- **UX-07 · Privacy & Terms have no in-page TOC.** `pages/Privacy.tsx`, `pages/Terms.tsx`, `pages/Disclaimer.tsx`. Add a sticky sidebar TOC like `InsightDetail` so users can jump to "Data Retention", "Cookies", etc.
- **UX-08 · "Engage the practice" / "Brief" CTAs are too literary.** `pages/Home.tsx`, `pages/About.tsx`. Replace with conversion-tested copy: "Book a Consultation", "Talk to a CA", "Read the Founder's Note".
- **UX-09 · Opening hours show 10:00-20:00 (10 PM).** `config/contact.ts`. Verify and consider `09:30-18:30 Mon-Fri, 10:00-14:00 Sat, Closed Sun`.
- **UX-10 · Resources page mobile nav.** `pages/Resources.tsx`. Sidebar is `hidden lg:block` (line ~76). On mobile there is no visible tab switcher (verify in DOM). Add a `<select>` or horizontal scrollable tab strip for mobile.
- **UX-11 · Checklist copy strips only `**`.** `pages/ChecklistDetail.tsx:54`. Strip full markdown using `utils/markdownToHtml.ts`'s helpers (or a dedicated `stripMarkdown` util).
- **UX-12 · ChecklistDetail Reset button has no confirmation.** `pages/ChecklistDetail.tsx:39`. Use a custom `<dialog>` (already accessible) instead of `confirm()`.
- **UX-13 · Form draft autosave has no visible status.** `pages/Contact.tsx`, `components/forms/CareerForm.tsx`. Show a "Draft saved · 2 s ago" indicator using `useFormDraft.lastSavedAt`.

### Components (P2)

- **CMP-04 · Hero variant `accentTone` lacks runtime validation.** Make it a typed union: `type AccentTone = 'brass' | 'rust' | 'moss'` and validate at the boundary (`PageHero.tsx`).
- **CMP-05 · Surcharge thresholds duplicated between code and config.** `components/TaxCalculator/useTaxCalculation.ts:150-156`. Read from `public/data/tax-config.json` instead.
- **CMP-06 · `StarField` cleanup paths.** `components/home/StarField.tsx:124-157`. Consolidate cleanup; `resizeTimer` and listeners may leak when reduced-motion path returns early.
- **CMP-07 · `HorizontalScroll` setTimeout without ID for measurement.** `components/HorizontalScroll.tsx:81,188`. Track timer and clear on cleanup or unmount.
- **CMP-08 · `FormField` className concatenation.** `components/ui/FormField.tsx:31-36`. Use `clsx` (or write a tiny `cn` helper) instead of string spreading; prevents the `"undefined ${added}"` bug.
- **CMP-09 · `RouteErrorBoundary` collects but doesn't surface `errorInfo`.** `components/RouteErrorBoundary.tsx:21`. Pipe through `utils/logger.ts.error()` so the existing localStorage trail captures component stacks.
- **CMP-10 · `ErrorBoundary` uses `alert()` and `window.location.reload()`.** `components/ErrorBoundary.tsx:43`. Replace `alert` with `useToast`; replace reload with React Router's `navigate(0)` if available, else keep reload.
- **CMP-11 · `Marquee` keys use array index.** Use stable IDs from the data array.

### Content / data (P2)

- **CONT-03 · Checklists labelled FY 2024-25.** `constants/resources.ts:33-211`. Update copy to FY 2025-26 / AY 2026-27.
- **CONT-04 · CII for FY 2025-26 listed as 376 (estimate).** `public/data/cii-data.json`. Verify against CBDT notification once published in May 2026 and update.
- **CONT-05 · TDS senior-citizen interest threshold.** `public/data/tds-rates.json` — confirm ₹1L threshold for §194A reflected (article copy in `tds-tcs-changes-2025.md` already mentions it).

### Code quality (P2)

- **QUAL-05 · `vitest.setup.ts` missing.** Create it; extend matchers from `@testing-library/jest-dom/vitest` and `vitest-axe/matchers`. Mock `IntersectionObserver` and `matchMedia` once.
- **QUAL-06 · No tests for 8 hooks.** Add: `useLocalStorage`, `useFormDraft`, `useRateLimit`, `useReducedMotion`, `useFocusTrap`, `useReturnFocus`, `useAnnounce`, `useTaxConfig`.
- **QUAL-07 · `JSON.parse` without try/catch in build script.** `scripts/generate-sitemap.ts:30`. Wrap, with friendly error.
- **QUAL-08 · `useArticleBody` `.then` chain has no `.catch`.** `hooks/useArticleBody.ts:53-70`. Add error state and propagate.

---

## 4. P3 — Low

### Security & forms (P3)

- **SEC-13 · No POST size limit on `/api/contact`.** Set in Netlify Function config (`maxBodySize`) once SEC-03 lands.
- **SEC-14 · `document.execCommand('copy')` deprecated fallback.** `pages/Contact.tsx:171`. Document the fallback only fires when Clipboard API is unavailable; suppress the warning behind `try/catch`.

### Accessibility (P3)

- **A11Y-16 · Breadcrumbs `aria-label`.** `components/Breadcrumbs.tsx`. Confirm `aria-label="Breadcrumb"` and `<ol>` with `<li>` per crumb.
- **A11Y-17 · Drop-cap on first paragraph.** `index.css:279`. `::first-letter` styling can confuse SR cursor reading; verify with NVDA & test reflow at 200% zoom.
- **A11Y-18 · Roman numeral year (`MMXXIII`) on About is not screen-reader friendly.** `pages/About.tsx:81`. Wrap in `<span aria-label="Two thousand twenty-three">`.
- **A11Y-19 · Color contrast spot-check.** Brand-stone (#78716c) on brand-bg passes; brand-brass on dark passes; verify rust on cream and brass on the editorial-paper zone with axe in CI.
- **A11Y-20 · Tab strip in Insights.** `pages/Insights.tsx:178`. Confirm Home/End/Arrow keys are wired (existing audit notes claim yes; add a vitest-axe test to lock it in).

### Performance & SEO (P3)

- **PERF-10 · Atom feed lacks `<content>`.** `public/atom.xml`. Include full markdown body inside `<content type="html">`.
- **PERF-11 · `manualChunks` doesn't include `lucide-react` icons individually.** Verify tree-shaking — `lucide-react@0.379` should support direct imports already, but spot-check the build output.
- **PERF-12 · No `<link rel="dns-prefetch">` for FormSubmit, GA.** Add to `index.html`.

### Pages / UX (P3)

- **UX-14 · NotFound has no `noindex` meta.** Already filed under SEO-02.
- **UX-15 · Career form has no salary range.** `pages/Careers.tsx`. If confidential, say so explicitly.
- **UX-16 · Insights has no newsletter / RSS subscribe affordance.** Add a small "Subscribe via RSS" link near the search box that points to `/rss.xml`.
- **UX-17 · ChecklistDetail break-inside-avoid mostly works on print.** Add a print preview test screenshot.
- **UX-18 · Map fallback link.** `pages/Contact.tsx:657`. Provide a non-iframe text fallback in case the iframe fails (CSP `frame-src` already allows it).
- **UX-19 · Calculator disclaimers missing.** `pages/Resources/*.tsx`. Add "Estimates only — not professional advice. Confirm with your CA." beneath every result.

### Components (P3)

- **CMP-12 · Lucide icons typed `any` in Resources.** Already noted under QUAL-02.
- **CMP-13 · `Breadcrumbs` has no JSON-LD `BreadcrumbList`.** `components/Breadcrumbs.tsx`. Already done in SEO component for some pages — confirm consistent.
- **CMP-14 · Misc cleanup.** Remove commented-out lines in `hooks/useFormValidation.ts:43`. Replace `console.warn` in `components/ui/Button.tsx:59` with `logger.warn` and gate on `import.meta.env.DEV`.

### Content / data (P3)

- **CONT-06 · About page lacks team / testimonials / case studies.** Even one anonymised case study + 2–3 testimonials lifts conversion meaningfully.
- **CONT-07 · No "How we charge" page.** Add a simple page: how engagements are scoped, retainer vs. one-off, what's billable.

### Code quality (P3)

- **QUAL-09 · `allowImportingTsExtensions: true`.** `tsconfig.json:26`. Once the build script no longer imports `.tsx` (move to a JSON descriptor under `constants/`), drop this flag.
- **QUAL-10 · Vitest `types`.** Add `"vitest/globals"` to `tsconfig.json#types`.
- **QUAL-11 · `console.log/warn` left in source.** `config/contact.ts:16`, `constants/contact.ts:18,25`, `components/ui/Button.tsx:59`, `scripts/generate-sitemap.ts:150`. Migrate to `utils/logger.ts` (script logs are fine).

---

## 5. Cross-cutting refactors

### REF-01 · Convert content layer to a single source of truth

Move authoritative insight metadata into the markdown frontmatter; have `scripts/generate-sitemap.ts` produce both `sitemap.xml` _and_ `public/data/insights.json` from the markdown directory. Eliminates the dateModified drift seen today.

### REF-02 · Introduce `@tanstack/react-query`

- Replaces the bespoke `apiClient` + `insightsPromise` + `articleBodyCache` patterns.
- Gives stale-while-revalidate, automatic dedupe, retry-with-backoff, devtools.
- One PR; touches `hooks/useInsights.ts`, `hooks/useArticleBody.ts`, `hooks/useResourceData.ts`, `utils/api.ts`.

### REF-03 · Pull constants into a typed schema

The `constants/` folder mixes data (services, FAQ, careers, insights metadata) and JSX (icons). Split into `data/` (pure JSON or .ts data exports) and `icons/` (JSX) so build-time scripts can consume data without React.

### REF-04 · `useReducedMotion` everywhere motion is JS-driven

Audit `components/CustomCursor.tsx`, `Parallax.tsx`, `HorizontalScroll.tsx`, `ScrollyTelling.tsx`, `ProcessScroll.tsx`, `home/StarField.tsx`. The CSS rule in `index.css:427` covers CSS animations only; JS-driven motion needs the hook.

### REF-05 · Convert `BrowserRouter` to `createBrowserRouter` (data-router)

- Enables `loader`/`action` patterns, instant skeleton fallback, `errorElement`.
- Pre-fetches insight body when hovering the card.
- Removes need for individual `<Suspense>` wrappers and `RouteErrorBoundary`.

---

## 6. Page-by-page punch list

For each page, the _line items_ below are already filed by ID above; this is a quick navigator.

**Home** (`pages/Home.tsx`) — UX-08, PERF-01, PERF-02, PERF-03, SEO-04, CMP-06.
**About** (`pages/About.tsx`, `pages/about/*`) — UX-08, A11Y-18, CONT-06.
**Services** (`pages/Services.tsx`) — SEO-04, CONT-07.
**Service Detail** (`pages/ServiceDetail.tsx`) — UX-02, SEO-02 (invalid-slug noindex).
**Insights** (`pages/Insights.tsx`) — SEO-01, UX-16, CMP-04 (filter chips), CONT-01.
**Insight Detail** (`pages/InsightDetail.tsx`) — UX-01, UX-04, A11Y-01, SEC-11, PERF-10.
**FAQ** (`pages/FAQ.tsx`) — content rolling refresh; FAQ schema already complete.
**Resources** (`pages/Resources.tsx`, `pages/Resources/*`) — UX-10, UX-19, A11Y-13, CMP-05, PERF-08.
**Checklist Detail** (`pages/ChecklistDetail.tsx`) — UX-11, UX-12.
**Careers** (`pages/Careers.tsx`, `components/forms/CareerForm.tsx`) — SEC-04, SEC-05, UX-15.
**Contact** (`pages/Contact.tsx`) — SEC-01, SEC-03, SEC-08, SEC-14, UX-13, UX-18.
**Disclaimer / Privacy / Terms** — UX-06, UX-07.
**404** (`pages/NotFound.tsx`) — SEO-02.

---

## 7. Suggested execution order for Codex

1. **Day 1 — Stop the bleed.** SEC-01, SEC-02, PERF-01, A11Y-01, CONT-02, QUAL-01 base (strict mode + ESLint scaffold + CI workflow).
2. **Day 2 — Forms hardened.** SEC-03 (Netlify Function), SEC-04, SEC-05.
3. **Day 3 — A11y pass.** A11Y-02 → A11Y-08 in one PR; add `vitest-axe` smoke test on every page.
4. **Day 4 — Perf/SEO pass.** PERF-02, PERF-03, PERF-05, PERF-07, SEO-01, SEO-02, SEO-04, SEO-05.
5. **Day 5 — UX punch list.** UX-01, UX-02, UX-03, UX-04, UX-08, UX-10, UX-13, UX-19.
6. **Day 6 — Components cleanup.** CMP-01, CMP-02, CMP-03, CMP-08, CMP-10.
7. **Day 7 — Content refresh.** CONT-01 (publish 2-3 fresh articles), CONT-03 (FY labels), CONT-06 (testimonials/case study).
8. **Day 8 — Refactors.** REF-01 (frontmatter), REF-02 (react-query), REF-04 (reduced-motion).
9. **Day 9 — Polish.** All remaining P3.
10. **Day 10 — Verify.** Lighthouse CI, axe CI, manual screen-reader pass, mobile pass on iOS Safari and Android Chrome, print preview pass on each printable page.

---

## 8. Acceptance criteria for "done"

- `npx tsc --noEmit` clean under strict mode.
- `npm run lint` clean.
- `npm test` passing, axe smoke test on every page, focus-trap unit test on every modal.
- Lighthouse on Home, Insights, InsightDetail, Services, ServiceDetail, Contact, Resources: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- CSP without `unsafe-inline` (verified by browsing under Chrome with DevTools console clear of CSP violations).
- WAVE & axe-core: 0 errors, 0 contrast errors, 0 ARIA errors.
- All forms: pass honeypot test, pass rate-limit test (server-side), draft restore test, file-upload validation test.
- `nu validator.w3.org/nu/?doc=https://casagar.co.in/` passes on every public route.
- Schema validators on schema.org for: LocalBusiness (Home), AccountingService (Services), Article (each insight), FAQPage (FAQ), BreadcrumbList (everywhere), JobPosting (Careers).
- Sitemap regenerated on every deploy with current `lastmod`.
- README and AUDIT-PLAN.md updated to reflect what landed.

---

## 9. Files to create

1. `vitest.setup.ts` — global test setup.
2. `eslint.config.js` — ESLint flat config.
3. `.prettierrc.json` — formatting.
4. `.github/workflows/ci.yml` — test, lint, typecheck, build, lighthouse.
5. `.github/workflows/lighthouse.yml` — nightly performance budget.
6. `netlify/functions/contact.ts` — server-side honeypot + rate-limit + relay.
7. `public/og/og-default.png` — 1200×630 PNG.
8. `components/ui/MailLink.tsx` — obfuscated mail link helper.
9. `utils/cn.ts` — class-merge helper (or pull `clsx`).
10. `tests/a11y/all-pages.spec.tsx` — vitest-axe sweep across routes.

## 10. Files to delete

1. `generate-sitemap.js` — superseded by `scripts/generate-sitemap.ts`.
2. `constants/contact.ts` — merge into `config/contact.ts`.
3. `public/sitemap.xml` from git (regenerated at build) — _or_ document that build commits it.

---

## 11. Open questions for the firm

These were uncovered during audit but require your input — not Codex's:

1. **Opening hours.** `config/contact.ts:60` shows 10:00–20:00. Confirm or replace with realistic hours (e.g., Mon–Fri 09:30–18:30, Sat 10:00–14:00). This drives both UI and JSON-LD `openingHoursSpecification`.
2. **Rebranded service names.** "Engage the practice" / "Brief" — keep editorial voice, or revert to standard "Book a Consultation" / "About Us" wording?
3. **Pricing transparency.** Should there be a public retainer/price-range page (UX-9 in JSON-LD) or only on enquiry?
4. **Testimonials policy.** ICAI Code of Ethics restricts solicitation; we can still reproduce _unsolicited_ client quotes with consent. Are any available?
5. **Case studies.** Anonymised client wins help conversion enormously; can the firm produce 1–3?
6. **GA Measurement ID.** `.env.example` has `G-XXXXXXXXXX`. Confirm a real ID is set on Netlify env.
7. **FormSubmit account.** The hashed endpoint `a1b2c3d4e5f6g7h8` in `netlify.toml` is obviously a placeholder. Confirm the production hash is set on Netlify.
8. **Office photo / hero imagery.** `home-hero-office.*` ships at 227–362 KB. Confirm this is the final approved photo before re-encoding.

---

_End of plan. 104 findings across 7 audit angles. Estimated 8–10 working days to clear P0 + P1 + P2 with one engineer in Codex; P3 + REFs absorb additional 2–3 days._
