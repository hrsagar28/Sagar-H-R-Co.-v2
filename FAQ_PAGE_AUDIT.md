# FAQ Page — Exhaustive Audit & Remediation Plan

**File under review:** `pages/FAQ.tsx`, `constants/faq.ts`, with supporting deps `components/SEO.tsx`, `components/hero/PageHero.tsx`, `components/hero/HeroBasic.tsx`.
**Route:** `/faqs` (see `App.tsx` line 146 and `constants/navigation.ts`).

**Deliverable:** Findings organized A–I. Each has a stable ID (e.g. `F-A11Y-01`) for commit/PR reference; each specifies *what*, *why*, *where*, *how*.

---

## Executive summary

The FAQ page is short (97 LOC) and visually clean, but it has **serious accessibility debt** for an accordion pattern — the single worst offender is the missing `aria-expanded` / `aria-controls` pairing, which is the canonical ARIA accordion contract. It also has a **functional routing bug** (CTA link is `#/contact` instead of `/contact`) and **content-display bugs** (the schema's markdown-stripping regex hints that authors intend markdown in answers, but the rendered view passes the raw string through — markdown would appear as literal `**bold**`). Finally, the answer panel is clipped at `max-h-96` which silently truncates long answers (~350-400px of content), which will bite when a detailed GST/ITR answer is added.

Critical themes: **P0 = accessibility + routing**, **P1 = content scalability + schema quality**, **P2 = UX enhancements (search, deep-link, print)**.

---

## A. Accessibility (WCAG 2.2 AA)

### F-A11Y-01 · [P0] Accordion missing `aria-expanded` and `aria-controls`
- **Where:** `pages/FAQ.tsx` lines 54–64, the `<button>` has `onClick={toggleAccordion}` but no `aria-expanded`, no `aria-controls`, and the answer panel (`<div>`, line 65) has no `id`, no `role="region"`, no `aria-labelledby`.
- **Issue:** This is the defining ARIA accordion requirement (WAI-ARIA Authoring Practices 1.2 "Accordion" pattern). Screen reader users cannot tell whether an item is expanded or what region it controls. VoiceOver rotor shows only "button" with no state.
- **Fix:**
  ```tsx
  const panelId = `faq-panel-${uniqueId}`;
  const buttonId = `faq-button-${uniqueId}`;
  // ...
  <button
    id={buttonId}
    aria-expanded={activeIndex === uniqueId}
    aria-controls={panelId}
    onClick={() => toggleAccordion(uniqueId)}
    className="..."
  >
    <span>{faq.question}</span>
    <span aria-hidden="true">...</span>
  </button>
  <div
    id={panelId}
    role="region"
    aria-labelledby={buttonId}
    hidden={activeIndex !== uniqueId}
    className="..."
  >
    <div className="text-brand-stone ...">{faq.answer}</div>
  </div>
  ```
  Note: using `hidden` removes need for `max-h-0` + `opacity-0` tricks, and avoids SR reading collapsed content.

### F-A11Y-02 · [P0] Collapsed answers are still in the accessibility tree
- **Where:** Lines 65–70. `max-h-0 opacity-0` hides visually but the text remains in the DOM without `hidden` / `aria-hidden`, so screen readers read it regardless of open/closed.
- **Fix:** Use `hidden={activeIndex !== uniqueId}` on the panel (paired with F-A11Y-01).
- **Consequence:** You lose the CSS max-height animation. Replace with a JS-driven height animation using `ResizeObserver` + `useEffect`, or use the modern `interpolate-size: allow-keywords` + `display: grid` "grid-template-rows: 0fr ↔ 1fr" technique, or accept an instant toggle. For a CA firm, instant is fine and arguably better.

### F-A11Y-03 · [P0] Question headings are `<span>`, not real headings
- **Where:** Line 58. The question is a `<span>` inside a `<button>`.
- **Issue:** Category uses `<h2>` (line 42), but each question inside the category is not tagged as a heading. Screen reader heading navigation skips all 14 questions. WAI-ARIA APG requires each accordion header to be wrapped by a heading element matching its level.
- **Fix:** Wrap each `<button>` in `<h3>` (since categories are `<h2>`). The button must remain the only focusable element; `<h3>` is not focusable by default.
  ```tsx
  <h3 className="m-0">
    <button id={buttonId} aria-expanded={...} aria-controls={...} className="w-full flex ...">
      <span className="text-lg md:text-xl font-heading ...">{faq.question}</span>
      <span aria-hidden="true">…</span>
    </button>
  </h3>
  ```
  Strip default `<h3>` margins via `m-0`.

### F-A11Y-04 · [P1] `focus:outline-none` without a visible replacement
- **Where:** Line 55: `focus:outline-none group`. No `focus-visible:ring-*` on the button.
- **Issue:** Keyboard users see no focus indicator on the trigger.
- **Fix:** Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg rounded-2xl`.

### F-A11Y-05 · [P1] `Plus` / `Minus` icons lack accessible names (icon-only signal)
- **Where:** Lines 61–63.
- **Issue:** Today the icon only conveys state visually; when paired with F-A11Y-01's `aria-expanded`, the icon becomes redundant — which is fine. Mark the icon container `aria-hidden="true"` explicitly.
- **Fix:** Add `aria-hidden="true"` to the `<span>` that wraps the icon. (Already implicit for `<svg>` but explicit is safer.)

### F-A11Y-06 · [P1] No keyboard support beyond Tab / Enter / Space
- **Issue:** WAI-ARIA APG for Accordion recommends `ArrowDown`/`ArrowUp` to move focus between accordion headers, `Home`/`End` to jump to first/last. Missing.
- **Fix:**
  ```tsx
  const headerRefs = useRef<(HTMLButtonElement|null)[]>([]);
  const onKeyDown = (e: KeyboardEvent, idx: number) => {
    const last = FAQS.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); headerRefs.current[Math.min(idx+1,last)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); headerRefs.current[Math.max(idx-1,0)]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); headerRefs.current[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); headerRefs.current[last]?.focus(); }
  };
  ```

### F-A11Y-07 · [P1] `selection:bg-brand-moss selection:text-white` — contrast check
- **Where:** Line 19. Green-on-white selection highlight must meet 4.5:1 non-text contrast against surrounding text.
- **Action:** Verify with a contrast checker.

### F-A11Y-08 · [P1] Category `<h2>` anchors have no ID for skip-links / fragment navigation
- **Where:** Line 42.
- **Fix:** Set `id={slugify(category)}` on each `<h2>` to allow deep links like `/faqs#income-tax-planning`. Add a tiny "section jump" list at the top.

### F-A11Y-09 · [P2] `aria-live` not used when toggling an item
- **Issue:** A polite announcement like "Question expanded" on open would help some users. Not mandatory per APG, but helpful.
- **Fix:** Optional; can be deferred.

### F-A11Y-10 · [P1] Skip-to-FAQ-start skip-link absent
- Minor — only needed if category `<h2>`s become numerous. Defer.

### F-A11Y-11 · [P1] Button text does not wrap gracefully on narrow viewports
- **Where:** Line 54 `justify-between items-start md:items-center`. Good. But on `sm` the chevron can crowd the last word. Ensure `break-words` / `text-balance` on the question span.
- **Fix:** Add `text-pretty` or `break-words` to the `<span>`.

---

## B. UX / Interaction

### F-UX-01 · [P0] CTA link uses hash-routing syntax in a BrowserRouter app
- **Where:** Line 86: `<a href="#/contact" …>Schedule a Consultation</a>`.
- **Issue:** `App.tsx` uses `BrowserRouter`, not `HashRouter`. `href="#/contact"` navigates to `/faqs#/contact`, which is a same-page fragment anchor — the browser will search for an element with `id="/contact"`, find none, and the user gets no navigation. The page does not change route.
- **Fix:** Use React Router's `<Link to="/contact">` (import `useNavigate` or `Link` from `react-router-dom`):
  ```tsx
  import { Link } from 'react-router-dom';
  <Link to="/contact" className="…">Schedule a Consultation</Link>
  ```

### F-UX-02 · [P0] Answer panel capped at `max-h-96` — content above ~384px is truncated silently
- **Where:** Line 66. `max-h-96` (= 24rem = 384px). Current longest answer is ~125 words (~5 lines on desktop) — fits. But the second Income Tax answer about property-sale tax is already ~100 words; a planned Markdown-formatted answer with a bullet list blows past the cap.
- **Fix:** Remove `max-h-96` in favor of actual `hidden` toggle (see F-A11Y-02). If you want animation, use `grid` + `grid-template-rows: 0fr → 1fr` + `overflow: hidden` — modern browsers ≥ late 2023.
  ```tsx
  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
    <div className="overflow-hidden">
      <div className="text-brand-stone ...">{faq.answer}</div>
    </div>
  </div>
  ```

### F-UX-03 · [P0] Only one item can be open at a time — no user preference
- **Where:** `toggleAccordion` (lines 14–16) closes the previously open item when opening a new one. Accessible, but users scanning multiple related questions can't compare side-by-side.
- **Fix:** Allow multi-open; track as `Set<number>` instead of `number|null`. Add a "Expand all / Collapse all" control above the list:
  ```tsx
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i:number) => setOpen(prev => { const n = new Set(prev); n.has(i)?n.delete(i):n.add(i); return n; });
  ```

### F-UX-04 · [P1] No search / filter across FAQs
- **Issue:** With 14 questions today and projected growth (tax, GST, ROC, payroll, litigation), search is mandatory.
- **Fix:** Add a search input at the top that filters both the question and answer fields. Use a debounced text match; highlight matches via `<mark>`. Basic impl:
  ```tsx
  const [q, setQ] = useState('');
  const visible = FAQS.filter(f => 
    f.question.toLowerCase().includes(q.toLowerCase()) 
    || f.answer.toLowerCase().includes(q.toLowerCase())
  );
  ```
  Show "No results for `{q}` — try rephrasing or [contact us](/contact)" when `visible.length === 0`.

### F-UX-05 · [P1] No category jump / anchor nav
- **Fix:** Render a sticky `TOC` under the hero listing category names as anchor links to `#slug` ids. On click, smooth-scroll with `scroll-margin-top: var(--sticky-offset)`.

### F-UX-06 · [P1] No deep-link to a specific question
- **Fix:** Use `id={slugify(faq.question)}` on each `<h3>`; listen to `location.hash` on mount to auto-open the matching question.
  ```tsx
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (h) {
      const idx = FAQS.findIndex(f => slugify(f.question) === h);
      if (idx >= 0) {
        setActiveIndex(idx);
        setTimeout(()=>document.getElementById(`faq-item-${idx}`)?.scrollIntoView({block:'start'}), 0);
      }
    }
  }, []);
  ```

### F-UX-07 · [P1] "Still have questions?" CTA is only one pathway
- **Where:** Lines 81–89. Offer three paths: schedule (Contact page), call (tel:), WhatsApp (wa.me).
- **Fix:** Row of 3 buttons sourced from `CONTACT_INFO`.

### F-UX-08 · [P2] No "Was this helpful? 👍/👎" feedback per answer
- **Fix:** Add optional feedback row; store anonymously in localStorage or ping `/api/faq-feedback`. Great signal for content improvement.

### F-UX-09 · [P2] No copy-link affordance per question
- **Fix:** Small `<button>` that copies `window.location.origin + '/faqs#' + slug`.

### F-UX-10 · [P2] Print layout not considered
- **Issue:** `App.tsx` uses `print:hidden` for chrome, good. But FAQ page prints only the currently-open accordion content.
- **Fix:** Add a `@media print` class rule to force all panels visible, and hide the chevron icons.

---

## C. UI / Visual design

### F-UI-01 · [P1] Icon swap *and* rotate is redundant
- **Where:** Line 61–62. `rotate-180` is applied when active, *and* the icon itself swaps from `Plus` to `Minus`. Rotating a `Minus` by 180° is visually a no-op.
- **Fix:** Choose one. Recommend: render only `Plus` and rotate 45° when active to become an `×` shape:
  ```tsx
  <Plus size={20} aria-hidden="true" className={open ? 'rotate-45 transition-transform' : 'transition-transform'} />
  ```
  Or keep the Plus→Minus swap but drop `rotate-180`.

### F-UI-02 · [P1] Active state uses `border-brand-moss` + `shadow-md` but inactive has the same `hover:shadow-lg`
- **Where:** Line 52. Hover shadow is `lg`, active is `md`. Active should be at least as prominent as hover.
- **Fix:** Active `shadow-lg` + `ring-1 ring-brand-moss/20`.

### F-UI-03 · [P1] "Still have questions?" block uses `text-brand-stone` on `bg-brand-surface`
- **Where:** Line 83.
- **Action:** Verify WCAG AA contrast ratio (4.5:1). If `brand-stone` is mid-grey and `brand-surface` is off-white, may fail.

### F-UI-04 · [P1] Category heading uses `border-l-4 border-brand-moss` but no background stripe
- Cosmetic: consider `bg-gradient-to-r from-brand-moss/5` for a soft panel indicator.

### F-UI-05 · [P1] On mobile, the 4-sided padding `p-6 md:p-8` + `rounded-3xl` creates tight line lengths
- Test on 360px; consider `p-5 md:p-8`.

### F-UI-06 · [P2] `animate-fade-in-up` fires per category without stagger
- **Fix:** Stagger: `style={{ animationDelay: `${catIdx * 80}ms` }}`.

### F-UI-07 · [P2] `shrink-0 w-10 h-10 rounded-full` chevron wrapper hit area is 40×40
- Borderline 44×44 — acceptable for secondary affordance, but consider `w-11 h-11` for safety.

---

## D. Content / Copy / Data

### F-CNT-01 · [P0] Answers look like they expect Markdown rendering but the JSX shows raw text
- **Where:** `SEO.tsx` accepts `faqs` prop (line 23) and strips `[text](url)`, `**bold**`, `_italic_` before injecting JSON-LD (line 25). This strip hints that authors *plan* to write markdown. But the rendered `<div>{faq.answer}</div>` on line 69 doesn't parse markdown — users would see literal `**bold**`.
- **Issue:** Either (a) answers must be plain text and the markdown-strip is dead code, or (b) answers will become markdown and the page must render it.
- **Fix path A (plain text):** Remove the markdown-strip in `SEO.tsx`.
- **Fix path B (markdown):** Render via the existing `components/MarkdownRenderer.tsx`:
  ```tsx
  import MarkdownRenderer from '../components/MarkdownRenderer';
  // ...
  <MarkdownRenderer content={faq.answer} />
  ```
  Given the FAQ content is authored by a CA and will naturally include inline links (e.g., to the Litigation Support page, Resources checklist), **path B is recommended.**

### F-CNT-02 · [P1] Several factual statements risk staleness
- **Where:** `constants/faq.ts` Rs. 40 lakhs / Rs. 20 lakhs (GST threshold), 80C/80D/HRA (may change per budget), "Old vs New Regime" (New is now default since FY24-25).
- **Fix:**
  - Add a `lastUpdated` ISO date field per FAQ; render under each answer: "Last reviewed: Apr 2026".
  - Add a top-level "Content reflects rules as of {CURRENT_FY}" banner.
  - Build a CI task to nudge content review every 90 days.

### F-CNT-03 · [P1] Currency symbol inconsistent: "Rs." in answers, "₹" on the rest of the site
- **Fix:** Use `₹` everywhere.

### F-CNT-04 · [P1] Answers use vague phrasing — "We can help you"
- **Where:** Most answers close with "We can help you…" or "Contact us". That's fine once or twice, but 9/14 answers end that way → feels template-y.
- **Fix:** Rewrite 4–5 to provide a concrete takeaway, then optional CTA.

### F-CNT-05 · [P1] No answer for top queries like "What is your turnaround time?", "Do you offer a consultation-free first call?", "How do you handle notices from the department?" in a CA-firm context
- **Fix:** Add 5–7 more questions across: "Onboarding", "Pricing & engagement", "Data security", "Communication", "ICAI compliance".

### F-CNT-06 · [P1] No answer about data security / storage (clients' sensitive PII)
- **Fix:** Add "How do you secure our financial data?" answer pointing to a data-handling note.

### F-CNT-07 · [P1] `FAQItem.category` uses title-case ("General & Onboarding") — fine, but no canonical slug
- **Fix:** Add `FAQItem.slug` or computed slug for anchors.

### F-CNT-08 · [P2] No mapping from FAQ answer → Service page (cross-linking)
- **Fix:** Each answer that references a service (e.g., "Litigation Support") should be an internal link. Markdown renderer makes this natural once F-CNT-01 is done.

---

## E. SEO / Structured data

### F-SEO-01 · [P0] `canonicalUrl` is missing on the FAQ page
- **Where:** Lines 20–27 of `FAQ.tsx` — `<SEO>` is called without `canonicalUrl`. `SEO.tsx` defaults to `window.location.href`, which on the live site resolves to `https://casagar.co.in/faqs`, but including querystrings or trailing slashes causes duplicate-URL SEO dilution.
- **Fix:** Add `canonicalUrl="https://casagar.co.in/faqs"`.

### F-SEO-02 · [P0] No `breadcrumbs` prop passed
- **Where:** Same block.
- **Fix:**
  ```tsx
  breadcrumbs={[{ name:'Home', url:'/' }, { name:'FAQs', url:'/faqs' }]}
  ```

### F-SEO-03 · [P0] No `ogImage` specified
- **Fix:** Pass `ogImage="https://casagar.co.in/og-faq.png"` and add the asset to `public/`.

### F-SEO-04 · [P1] `FAQPage` schema is lossy — strips links via regex
- **Where:** `SEO.tsx` lines 25–26 and `pages/FAQ.tsx` lines 23–26. The regex removes `[label](url)`, `**x**`, `_x_`. The Google FAQ rich-result supports **limited HTML**: `<b>`, `<i>`, `<em>`, `<strong>`, `<a>`, `<br>`, `<p>`, `<ul>`/`<ol>`/`<li>`, `<h1..6>`.
- **Fix:** Convert the markdown answer to HTML when feeding into the schema rather than stripping. Use a tiny `mdToHtml` (or reuse `MarkdownRenderer`'s parser). Richer snippets, more CTR.

### F-SEO-05 · [P1] No `speakable` for voice assistants
- **Fix:** Add `speakable` spec to the page-level schema:
  ```json
  { "@type": "SpeakableSpecification",
    "cssSelector": [".faq-question", ".faq-answer"] }
  ```
  and tag the DOM with those classes.

### F-SEO-06 · [P2] FAQ schema is duplicated in `schema` prop and `faqs` prop? — confirm
- **Where:** The page passes only `faqs`. `SEO.tsx` emits the FAQPage structured data. Good. No duplicate.

### F-SEO-07 · [P1] Title tag can be improved
- **Where:** Line 21: `Frequently Asked Questions | Sagar H R & Co.` — 49 chars. Add regional signal: `CA FAQs | Tax, GST, Audit — Sagar H R & Co., Mysuru`.

### F-SEO-08 · [P1] Meta description is generic
- **Where:** Line 22.
- **Fix:** Lengthen to ~155 chars with specifics: "Answers to 14+ questions on Income Tax, GST, TDS, and business setup by Mysuru-based Chartered Accountants. Updated for FY 2025-26."

### F-SEO-09 · [P2] No `datePublished` / `dateModified` on FAQ or per-question answers
- **Fix:** Add per-answer `dateModified`; emit a page-level `dateModified: max(answers)`.

### F-SEO-10 · [P1] Route is `/faqs` but many users type `/faq` — 404 risk
- **Fix:** Add redirect in `netlify.toml`:
  ```toml
  [[redirects]]
    from = "/faq"
    to = "/faqs"
    status = 301
  ```

---

## F. Security / Privacy

### F-SEC-01 · [P1] If F-CNT-01 path B (markdown) adopted, XSS surface grows
- **Issue:** Markdown inputs from `constants/faq.ts` are authored, not user-submitted — low risk. But the renderer should still sanitize (allowlist `<a>`, `<strong>`, `<em>`, lists, headings) and strip event handlers, inline styles, `javascript:` URLs.
- **Fix:** Verify `MarkdownRenderer.tsx` uses a sanitizer (e.g., `DOMPurify` or rehype-sanitize). If not, add one.

### F-SEC-02 · [P2] No `rel="noopener"` concerns today (no external links in FAQ content). Will matter after F-CNT-01.

### F-SEC-03 · [P2] No rate limiting on any eventual "Was this helpful?" endpoint. Plan ahead.

---

## G. Performance

### F-PERF-01 · [P2] FAQ page is ~5 KB — already trivial. No action.

### F-PERF-02 · [P2] If markdown rendering added, import `MarkdownRenderer` lazily per-answer
- Measure first.

### F-PERF-03 · [P1] No `content-visibility: auto` optimization for long lists
- **Fix:** Set `content-visibility: auto; contain-intrinsic-size: 200px 400px;` on each FAQ card once list grows beyond 20.

---

## H. Code quality / maintainability

### F-CQ-01 · [P1] `categories = Array.from(new Set(FAQS.map(i=>i.category)))` preserves insertion order but no stable ordering guarantee if `FAQS` is reordered
- **Fix:** Define a canonical `CATEGORY_ORDER` array in `constants/faq.ts`; `categories` becomes `CATEGORY_ORDER.filter(c => FAQS.some(f=>f.category===c))`.

### F-CQ-02 · [P1] `FAQS.indexOf(faq)` used as React `key`
- **Where:** Line 47. On any reordering (filter/search), keys shift and accordion state gets misattributed.
- **Fix:** Add stable `id` field to each FAQ:
  ```ts
  export interface FAQItem { id: string; question: string; answer: string; category: string; lastUpdated?: string; }
  ```
  Use `faq.id` as React key.

### F-CQ-03 · [P1] Duplicate import of `CONTACT_INFO`
- **Where:** Line 6 imports from `../constants`, but `FAQS` on line 2 imports separately. Consolidate.

### F-CQ-04 · [P1] Component re-creates `categories` on every render
- **Fix:** `useMemo(() => Array.from(new Set(FAQS.map(i=>i.category))), [])` or hoist out of component (since FAQS is a module constant).

### F-CQ-05 · [P1] No tests
- **Fix:** Add tests:
  - Rendering all categories and questions.
  - Clicking a question toggles its panel.
  - Only one open at a time (or, post F-UX-03, multi-open).
  - `aria-expanded` flips.
  - Deep link `/faqs#<slug>` opens the matching item.

### F-CQ-06 · [P1] FAQ schema markdown-strip regex is defined inline at call-site
- **Where:** `FAQ.tsx` line 24. Move to `utils/markdown.ts` as `stripMarkdownForSchema(raw: string): string`, so it can be unit-tested and shared.

### F-CQ-07 · [P2] Component body is a single JSX function; acceptable for the size, but if search + jump-nav + anchors are added, extract:
- `<FAQSearch />` (search bar)
- `<FAQCategoryNav />` (sticky TOC)
- `<FAQItemCard />` (one accordion item)

### F-CQ-08 · [P1] Hard-coded route `/contact` in CTA; after F-UX-01 fix, wrap in `<Link>` from `react-router-dom` so SPA navigation works without full page reload.

### F-CQ-09 · [P2] Inline class strings 120+ chars. Extract with `clsx`/`cva`.

---

## I. Feature additions (roadmap)

### F-FEAT-01 · [P1] FAQ search with keyword highlighting
- See F-UX-04.

### F-FEAT-02 · [P1] Deep-linkable questions
- See F-UX-06.

### F-FEAT-03 · [P1] Category sticky TOC
- See F-UX-05.

### F-FEAT-04 · [P1] "Was this helpful?" per answer + global counter
- See F-UX-08.

### F-FEAT-05 · [P2] Print-friendly styles (`@media print`)
- See F-UX-10.

### F-FEAT-06 · [P2] Back-to-top button after scrolling past hero
- Reuse any existing `<ScrollTop/>` if present; else, add a fixed FAB at `bottom: 6rem, right: 1.5rem` that appears after 600px scroll.

### F-FEAT-07 · [P2] Related questions
- At the bottom of each open answer, show "Related: Q1, Q2" driven by a `related: string[]` list of FAQ ids.

### F-FEAT-08 · [P2] AI-powered "Ask a question" fallback
- If user searches and gets no hits, show a button "Ask Sagar H R & Co." that opens a pre-filled contact form. Natural bridge between FAQ and Contact.

### F-FEAT-09 · [P1] Last-updated stamp visible to the user
- See F-CNT-02. Build trust by showing content is maintained.

### F-FEAT-10 · [P2] Bilingual support (EN + KN)
- Mysuru audience likely appreciates Kannada. Plan: add `question_kn`, `answer_kn`; toggle via locale picker.

---

## Implementation sequencing for Codex

**PR 1 (P0 only — ~0.5 day):**
- F-A11Y-01, F-A11Y-02, F-A11Y-03 (accordion ARIA).
- F-UX-01 (routing bug).
- F-UX-02 (max-h clip).
- F-CNT-01 path A or B (remove dead code OR render markdown).
- F-SEO-01, F-SEO-02, F-SEO-03.

**PR 2 (P1 — ~1–1.5 day):**
- F-A11Y-04 → F-A11Y-08, F-A11Y-11.
- F-UX-03 → F-UX-07.
- F-UI-01 → F-UI-05.
- F-CNT-02 → F-CNT-07.
- F-SEO-04, F-SEO-05, F-SEO-07, F-SEO-08, F-SEO-10.
- F-SEC-01.
- F-PERF-03.
- F-CQ-01 → F-CQ-06, F-CQ-08.
- F-FEAT-01, F-FEAT-02, F-FEAT-03, F-FEAT-09.

**PR 3 (P2 cleanup / nice-to-haves):**
- Remaining items.

---

## Acceptance criteria per finding

- **A11y:** Pass axe-core 4.x with zero `critical` or `serious` issues on `/faqs`. Manual keyboard test: tab, shift-tab, enter/space, arrow up/down, home/end all work.
- **Routing:** Clicking "Schedule a Consultation" lands on `/contact` without full page reload.
- **Content:** Markdown links (if F-CNT-01 path B) render as real anchors.
- **SEO:** Google Rich Results Test shows `FAQPage` with all 14 Q/A, zero warnings. `BreadcrumbList` present.
- **Tests:** Vitest / RTL coverage ≥ 85% for `FAQ.tsx`.
- **No regression:** Visual diff vs. baseline < 2% delta (Percy / Playwright).

---

*End of FAQ Page Audit.*
