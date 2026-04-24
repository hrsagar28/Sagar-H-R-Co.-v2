# Round 2 Re-Audit — Contact & FAQ Pages

**Date:** 24 April 2026
**Scope:** `pages/Contact.tsx`, `pages/FAQ.tsx` only. Careers explicitly parked per user instruction.
**Purpose:** Verify which Round 1 findings were applied correctly, flag ones applied with caveats, list Round 1 items still open, and surface new issues introduced by the recent changes.
**ID prefix references** match the Round 1 documents (`CONTACT_PAGE_AUDIT.md`, `FAQ_PAGE_AUDIT.md`). Review those for the full “why” and “how” of each original finding — this file is a delta document.

Legend:
- `[OK]` — Fix applied correctly, close the finding.
- `[CAVEAT]` — Intent applied but the implementation has a gap worth a follow-up commit.
- `[OPEN]` — Still matches the Round 1 description; not yet addressed.
- `[NEW]` — Issue introduced or exposed by the Round 2 changes themselves.
- Priority tags (P0/P1/P2) are unchanged from Round 1.

---

## 1. `pages/Contact.tsx`

### 1.1 Fixes Verified Applied (close these)

| ID | Priority | Verification |
|---|---|---|
| C-A11Y-01 | P1 | `<h2>` now used for both “Send a Message” (line 483) and “Message Sent!” (line 464). Heading order within the form card is now single-level `h2 → h3` (field icons). `[OK]` |
| C-A11Y-02 | P1 | Copy buttons at lines 389 and 407 have `type="button"`, `min-h-[44px]`, `min-w-[44px]`, visible focus ring, and `aria-label` / `title`. `[OK]` |
| C-A11Y-03 | P1 | `type="button"` applied on every non-submit control — copy buttons, “Send another message” (line 469), success headline handler. No implicit `submit` buttons remain in the form scope. `[OK]` |
| C-A11Y-04 | P0 | A persistent `<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">` wraps `successAnnouncement` at lines 456–458 — the element now exists on first render and toggles text content, so AT will announce. `[OK]` |
| C-A11Y-07 | P1 | `<form noValidate …>` at line 477 disables native tooltips so custom `errors` state is the single source of truth. `[OK]` |
| C-A11Y-09 | P1 | Honeypot logic now lives in `components/forms/Honeypot` (line 479). Inline `-9999px` hackery is replaced by a dedicated, testable component. `[OK]` |
| C-UX-01 | P0 | `allowedSubjectOptions` Set + `getAllowedSubject()` (lines 44–49) + lazy `useState(() => …)` (line 76) whitelist the `?subject=` query param before it ever touches form state. Arbitrary subjects can no longer be injected via URL. `[OK]` |
| C-UX-02 | P1 | When `subject !== 'Other'`, `subjectOther` is cleared inside `handleContactChange` (line 156) and when the draft is re-normalized (line 62). `[OK]` |
| C-UX-03 | P1 | `hasMissingOtherSubject` check (line 211) plus explicit `setErrors({ subjectOther: … })` (line 216) gives the user a field-level error instead of a silent success. `[OK]` |
| C-UX-05 | P2 | `restoredDraft = useRef(false)` gate at lines 123–131 ensures `loadDraft()` runs only once, preventing the reinflation bug where typing was clobbered by a stale draft. `[OK]` |
| C-UX-06 | P2 | Draft-saved indicator rendered at lines 621–625 with time formatted via `toLocaleTimeString`. Gives the user explicit feedback that auto-save is working. `[OK]` |
| C-UX-08 | P2 | `handleCopy` now has a `document.execCommand('copy')` fallback (lines 182–191) for non-secure contexts / older Safari. `[OK]` |
| C-UX-11 | P1 | `updateSentParam` (lines 133–143) uses `history.replaceState` so both “Send another” (line 146) and the success render path keep the URL in sync without a full route replacement. `[OK]` |
| C-UI-01 | P1 | Left contact-info card is now `xl:sticky xl:top-32` (line 352) with `xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:overscroll-contain` (line 354), preventing overflow when content is taller than the viewport. `[OK]` — but see NEW-C-01 about the `overflow-x-hidden` + sticky interaction. |
| C-SEC-01 | P0 | Outbound payload at lines 226–232 now uses `normalizeInput` (preserves user text) for body fields and `headerSafe` for any field that ends up in a header (`_subject`, `email`, `phone`, `subject`). The earlier double-escape bug is gone. `[OK]` |
| C-SEC-02 | P0 | `_subject: \`New Inquiry: ${headerSafe(values.name)}\`` at line 232 — name is stripped of CR/LF before it reaches the email header. `[OK]` |
| C-SEO-01 | P1 | `contactPoint` is now an array with a phone point (`areaServed: "IN"`, `availableLanguage: ["en","hi","kn"]`) and a separate email point (lines 283–296). `[OK]` |
| C-SEO-02 | P1 | `openingHoursSpecification` with explicit `dayOfWeek` / `opens` / `closes` added at lines 311–318. `[OK]` |
| C-A11Y-10 | P2 | Phone input at lines 509–519 has `inputMode="tel"`, `pattern="[+0-9 ]*"`, a visible `hint="10-digit mobile, India"` bound via `FormField`, and `maxLength={15}`. `[OK]` — but see CAVEAT-C-01 about the pattern being too loose. |
| C-A11Y-06 | P2 | Map wrapper at line 640 now uses `role="figure" aria-labelledby="map-caption"` with an `sr-only` `<h2 id="map-caption">`. `[OK]` |
| C-COPY-04 | P2 | Privacy microcopy at lines 627–629 links `/privacy` with an explanatory sentence. `[OK]` |
| C-CQ-01 | P2 | `lastSaved` is now actually consumed (line 621). Dead state is gone. `[OK]` |
| C-CQ-02 | P2 | Honeypot is a named component (`components/forms/Honeypot`) rather than ad-hoc inline JSX. `[OK]` |
| C-CQ-03 | P2 | `darkInputClass` shared constant (`components/ui/formClasses`) replaces repeated Tailwind strings. `[OK]` |
| C-CQ-04 | P2 | `bg-brand-ink-deep` token used for `CustomDropdown` (lines 559, 562) rather than an arbitrary hex. `[OK]` |
| C-CQ-05 | P2 | Initial subject is computed via `useState(() => …)` (line 76) — `URLSearchParams` construction no longer runs on every render. `[OK]` |

### 1.2 Fixes Applied With Caveats

**CAVEAT-C-01 — Rate-limit counter now records every submit, including client-side validation failures.** `[P1, was C-UX-04]`
*Where:* `handleSubmit` line 209.
*What changed:* `recordAttempt()` now fires before `validate()`. This does close the original bypass (previously `recordAttempt` was only reached on a successful POST, so a user could spam malformed requests forever), but it over-corrects.
*The gap:* Three mistyped email addresses in a minute locks the user out for 60 seconds even though nothing ever hit FormSubmit. That is user-hostile and will produce support tickets.
*How to tighten:* Only record when a request actually escapes the client — i.e., after the `validate() && !hasMissingOtherSubject` check passes and `apiClient.post` is about to fire. Move `recordAttempt()` below line 220 (before `setIsSubmitting(true)`). Alternatively, keep the current line but also reset the counter on toast(’error, validation’) so only network-level retries accrue against the limit.
*Acceptance:* A user can submit the form with validation errors 10 times in a row without being rate-limited.

**CAVEAT-C-02 — Phone `pattern` allows empty and is looser than the message implies.** `[P2, related to C-A11Y-10]`
*Where:* `<input … pattern="[+0-9 ]*" />` line 513.
*What changed:* Pattern + hint added.
*The gap:* `[+0-9 ]*` matches the empty string and matches `+` on its own — HTML5 validation won’t trip, and the hint advertises “10-digit mobile, India” which the pattern does not enforce. `required` catches empty; `indianPhone()` in the JS schema catches format. So the HTML `pattern` is currently decorative; fine as long as you know that — but the user who disables JS will pass HTML validation with `+`.
*Fix:* Either drop the `pattern` attribute (JS schema is authoritative; `inputMode="tel"` already gives the mobile keypad) or tighten it to something closer to the schema, e.g., `pattern="\\+?\\d[\\d ]{9,14}\\d"`.

**CAVEAT-C-03 — `handleContactChange('subjectOther', …)` bypasses `validateOnChange` for other fields’ cross-validation.** `[P2, related to C-UX-03]`
*Where:* `handleContactChange` line 168.
*What changed:* For `subjectOther`, it calls the base `handleChange(name, value)` which runs `validateOnChange` against `contactSchema`. But `subjectOther` is not in `contactSchema` (line 66–71), so no validator fires — the manual `setErrors` delete at line 171 is the only thing clearing the error.
*The gap:* If the user leaves `subjectOther` blank and blurs, no error appears until `handleSubmit` forces one. Fine today, but fragile: anyone later adding `validateOnBlur` will be surprised.
*Fix:* Add `subjectOther: [/* validator that depends on subject === 'Other' */]` to `contactSchema` (conditional validator) or document the exception inline.

**CAVEAT-C-04 — `<iframe … sandbox="allow-scripts allow-same-origin …">` nearly neutralizes the sandbox.** `[P1, related to original C-SEC-07]`
*Where:* Map iframe line 676.
*What changed:* A `sandbox` attribute was added — better than nothing.
*The gap:* Per MDN / spec: specifying **both** `allow-scripts` and `allow-same-origin` lets the framed page remove the `sandbox` attribute from itself using `document.querySelector('[sandbox]').removeAttribute(...)`. Google Maps needs both to render tiles, so this is a pragmatic choice, but the sandbox is effectively advisory. At minimum, drop `allow-popups-to-escape-sandbox` — maps rarely opens popups outside its own origin and that flag lets any popup escape sandbox entirely.
*Fix:* Keep `allow-scripts allow-same-origin allow-popups`. Remove `allow-popups-to-escape-sandbox`. Test that the marker tooltip and “Directions” still work; if they break, accept that sandbox is a defense-in-depth-only measure here and document it.

**CAVEAT-C-05 — `allow="geolocation 'none'"` is invalid Permissions-Policy syntax.** `[P2, NEW but worth flagging alongside map fixes]`
*Where:* Map iframe line 675.
*The gap:* The iframe `allow` attribute uses Permissions Policy syntax, not the CSP `'none'` keyword. Correct syntax is `allow="geolocation=()"` (empty allow-list) or simply omit the attribute — modern browsers default cross-origin iframes to no geolocation anyway. As written, the attribute is ignored, which is harmless but misleading.
*Fix:* `allow="geolocation=(); camera=(); microphone=()"` or delete the attribute.

**CAVEAT-C-06 — Left info card uses `overflow-x-hidden` together with `xl:overflow-y-auto`.** `[P2, related to C-UI-01]`
*Where:* line 354.
*The gap:* When both axes have `overflow` set, the auto axis forces the other to `auto` in most browsers — so `overflow-x-hidden` silently becomes `overflow-x-auto` at `xl`. More importantly, focus rings on the copy buttons (positioned with `ring-offset-4`) sit 4px outside the button box; on the horizontal axis they may clip against the rounded card edge.
*Fix:* At `xl`, switch to `overflow: clip` on x (keeps painting focus rings outside) or add `overflow: visible` on the `focus-within` state. Smoke-test by tabbing to the email copy button on a ≥`xl` viewport.

### 1.3 Round 1 Items Still Open

**C-SEC-03 — `_captcha` on FormSubmit not configured.** `[P1]`
*Status:* Unchanged. The outbound payload at lines 225–235 does not include `_captcha: 'true'` or any client-side CAPTCHA token. FormSubmit defaults to challenge mode only if configured on the FormSubmit dashboard, not from the payload. Until you enable FormSubmit’s own reCAPTCHA in the form’s dashboard settings, the honeypot is your only anti-bot layer.
*Action:* Either confirm dashboard-side reCAPTCHA is on, or integrate hCaptcha/Cloudflare Turnstile and POST the token. Remove this finding once verified.

**C-SEC-04 — CSP retains `'unsafe-inline'` for scripts/styles.** `[P1]`
*Status:* Unchanged — this is a `netlify.toml` fix, not a `Contact.tsx` one. Out of scope for a page-level audit, but flagged here so it does not get forgotten. Move to a nonce-based CSP before this release cuts; Tailwind-in-Vite supports it via a small plugin.

**C-SEC-07 — Google Maps iframe pulls third-party scripts and cookies.** `[P1]`
*Status:* Partially addressed via sandbox (see CAVEAT-C-04). The underlying privacy concern — Google drops `NID` / session cookies the moment the iframe mounts, even before user interaction — is not addressed.
*Action:* Implement a static-map-first pattern: render a `<picture>` of a pre-generated map image on mount and swap to the live iframe only on click (or `IntersectionObserver` with a user-gesture gate). This also solves C-PERF-01.

**C-PERF-01 — Map iframe loads on every Contact render.** `[P1]`
*Status:* Unchanged. `loading="lazy"` is set but the iframe is well above the fold for ≥`md` screens and will load immediately there. Static-map swap (above) is the proper fix.

**C-PERF-05 — `useRateLimit` polls at 1 Hz regardless of button state.** `[P2]`
*Status:* Unchanged without reading the hook — but if the Round 1 finding stands, the interval still runs while `canSubmit === true`. Low priority; wrap it inside a `useEffect` guarded on `!canSubmit`.

**C-COPY-02 — “within one business day” without hours context.** `[P2]`
*Status:* Unchanged at line 626. Users outside IST may read this on a Friday and expect Monday morning replies. Consider “within one business day (Mon–Sat, IST)”.

**C-FEAT-01 — No CAPTCHA integration visible.** `[P1]`
*Status:* Same as C-SEC-03. Link items.

**C-FEAT-09 — `Reveal` animations do not check `prefers-reduced-motion`.** `[P1]`
*Status:* Not verified from `Contact.tsx` alone — need to re-read `components/Reveal.tsx`. The Contact page uses `Reveal` five times (around lines 353, 454, 639). If Reveal honors the media query, this closes; if not, it remains P1 for accessibility.
*Action:* Open `components/Reveal.tsx` and check for a `prefers-reduced-motion` branch before writing anything.

### 1.4 New Issues Introduced by the Round 2 Changes

**NEW-C-01 — Honeypot submission silently drops.** `[P2]`
*Where:* `handleSubmit` line 202.
*What:* When `honeypot` has any value, the handler simply `return`s — no toast, no console log, no attempt counter, no `setIsSubmitting`. This is the correct behavior for blocking bots, but if a real user somehow focuses the hidden field (screen reader, browser autofill that misses the `autoComplete="off"` on the hidden input), they get an invisible failure.
*Mitigation:* In the `Honeypot` component, add `tabIndex={-1}`, `aria-hidden="true"`, `autocomplete="off"`. Also consider logging `honeypot` hits to a telemetry endpoint so you can track spam volume.

**NEW-C-02 — Success state persists across tab reopen via `?sent=1`.** `[P2]`
*Where:* Line 78 initial state + bookmarking behavior.
*What:* `isSuccess` is initialized from `?sent=1`. If a user bookmarks the Contact page mid-success or shares the URL, the recipient lands on “Message Sent!” without ever submitting anything. Minor UX confusion.
*Fix:* Either don’t persist `?sent=1` (remove `updateSentParam(true)` and keep the state ephemeral), or on initial mount check `performance.getEntriesByType('navigation')[0].type === 'reload'` and only honor `?sent=1` on a reload-from-submit, not on a fresh navigation.

**NEW-C-03 — Focus management on success competes with route-level focus.** `[P2]`
*Where:* lines 82–103 vs `RouteHandler` in `App.tsx` lines 39–53.
*What:* On form submit, `useEffect([isSuccess])` focuses `successHeadingRef`. But `isSuccess=true` does not change `pathname`, so `RouteHandler` does not refocus `#main-content`. This is fine for in-page submit — but if a user hits `?sent=1` as a bookmark, both effects run on the same tick, and main-content focus may race the success heading focus. Manual testing needed.
*Action:* Low risk; reconfirm by navigating to `/contact?sent=1` directly and checking where the tabstop lands.

**NEW-C-04 — `setValues({ ...INITIAL_CONTACT })` after submit wipes `subject` even if it came from `?subject=`.** `[P3]`
*Where:* line 240.
*What:* After a successful submit, “Send another” resets to blank. If the user came from a service page `<a href="/contact?subject=Audit">`, resubmitting requires re-selecting the subject.
*Fix:* `setValues({ ...INITIAL_CONTACT, subject: initialSubject })` to keep the deep-link intent on the re-entry.

**NEW-C-05 — `restoredDraft` ref persists across “Send another” flow.** `[P3]`
*Where:* `restoredDraft.current = true` at line 127 is never reset.
*What:* After a successful submit, `clearDraft()` (line 239) empties storage, but `restoredDraft.current` stays `true`. If the user then opens a second tab, starts typing, and somehow a draft gets written before this one is cleared, the cross-tab flow will not attempt to re-load. Very unlikely given the 1s debounce; flagging for completeness.

**NEW-C-06 — `handleContactChange` for `subject` and `subjectOther` does not trigger `validateOnChange`.** `[P2, related to CAVEAT-C-03]`
*Where:* line 153 uses `setValues(prev => …)` directly instead of `handleChange(name, value)`, so validation for `subject` never runs on change. For non-required `subject`, that is fine; but if you later add an `enum(serviceOptions)` validator, this call path will silently skip it.
*Fix:* After `setValues(...)`, call a validation pass manually, or route `subject` through `handleChange` with a pre-filter step.

---

## 2. `pages/FAQ.tsx`

### 2.1 Fixes Verified Applied

| ID | Priority | Verification |
|---|---|---|
| F-A11Y-01 | P0 | Accordion button at line 261 now has `aria-expanded={isExpanded}` and `aria-controls={panelId}`. Matches WAI-ARIA Accordion pattern. `[OK]` |
| F-A11Y-02 | P1 | Panel at line 292 has `role="region"` + `aria-labelledby={buttonId}`, and uses `hidden={!isExpanded}` instead of `max-h-0 overflow-hidden` — keyboard users no longer tab into collapsed content. `[OK]` |
| F-A11Y-03 | P1 | Each question is inside `<h3 className="m-0">` at line 260 wrapping the button — preserves semantic heading nesting inside the `h2` category sections. `[OK]` |
| F-A11Y-04 | P1 | Category anchors (top jump nav + sidebar) have `focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4` (lines 180, 205). `[OK]` |
| F-A11Y-05 | P2 | `onKeyDown` at lines 101–122 implements Arrow Up / Arrow Down / Home / End with `preventDefault()` — matches the APG authoring pattern. `[OK]` |
| F-UX-01 | P0 | `<Link to="/contact">` at line 318 — the broken `href="#/contact"` is gone. `[OK]` |
| F-UX-02 | P0 | `max-h-96 overflow-hidden` replaced by `hidden={!isExpanded}` at line 296 — long answers are no longer clipped. `[OK]` |
| F-UX-03 | P1 | `scroll-margin-top: calc(var(--sticky-offset) + 6rem)` applied to both the category heading (line 231) and each FAQ card (line 251) — deep-linked FAQs no longer hide under the fixed navbar. `[OK]` |
| F-UX-04 | P1 | `handleCategoryJump` (lines 90–99) uses `preventDefault` + `history.replaceState(null, '', '#${targetId}')` + `scrollIntoView({ behavior })` with `prefers-reduced-motion` branch. `[OK]` |
| F-UX-05 | P2 | `scrollToTarget` honors `behavior` argument; hash-driven navigation via `useEffect([hash])` (lines 124–139) now scrolls to both category slugs and FAQ IDs. `[OK]` |
| F-CNT-01 | P1 | FAQ answers now pass through `MarkdownRenderer` (line 299) and the FAQPage schema uses `markdownToHtml(faq.answer)` (line 43) — rendered UI and structured data match. `[OK]` |
| F-SEO-01 | P1 | `canonicalUrl={FAQ_CANONICAL_URL}` passed to `SEO` at line 146. `[OK]` |
| F-SEO-02 | P1 | `WebPage` schema has `dateModified` derived from `FAQ_PAGE_DATE_MODIFIED` (line 56) which pulls the max `lastUpdated` across FAQS. `[OK]` |
| F-SEO-03 | P2 | `speakable` selectors `.faq-question` and `.faq-answer` (lines 57–60) — and those classes exist at line 275 and line 301. `[OK]` |
| F-SEO-04 | P2 | Per-FAQ `dateModified` plumbed into the `faqs` array (line 44). `[OK]` |
| F-PERF-01 | P2 | `ENABLE_CARD_CONTENT_VISIBILITY` (line 16) conditionally applies `content-visibility: auto` + `contain-intrinsic-size` when `FAQS.length > 20` (lines 252–257). Smart — avoids the animation-jank edge case for small lists. `[OK]` |
| F-PERF-02 | P2 | `FAQ_INDEX_BY_ID` precomputed Map (line 18) — keyboard nav is O(1) lookups instead of O(n) `findIndex`. `[OK]` |
| F-CQ-01 | P2 | Module-scoped constants (`FAQ_TITLE`, `FAQ_DESCRIPTION`, `ORDERED_CATEGORIES`, etc.) hoisted out of the component (lines 10–22). `[OK]` |
| F-CQ-02 | P2 | `groupedFaqs` in `useMemo` with `[]` deps (line 36) — stable reference across renders. `[OK]` |
| F-CQ-03 | P2 | `faqSchemaItems` memoized (lines 39–47). `[OK]` |

### 2.2 Fixes Applied With Caveats

**CAVEAT-F-01 — `useMemo(() => …, [])` with static inputs is cosmetic.** `[P3, related to F-CQ-02]`
*Where:* lines 29–47, 63–75.
*What:* `groupedFaqs` and `faqSchemaItems` depend only on module-level constants. The `useMemo` achieves reference stability but no computation savings. `activeCategoryId` depends on `hash` and `groupedFaqs` (which is stable), so it does re-compute on hash change — that one is useful.
*Fix (optional):* Pull `groupedFaqs` and `faqSchemaItems` out to module scope (same level as `ORDERED_CATEGORIES`). Simplifies the component and makes the intent clearer. Not required — current code is correct, just over-engineered.

**CAVEAT-F-02 — Category anchor in top nav and sidebar can desync from `#hash` when user opens an FAQ.** `[P2, related to F-UX-04]`
*Where:* `activeCategoryId` computed at lines 63–75.
*What:* `activeCategoryId` derives the highlighted chip from `location.hash`. If the user clicks an FAQ button, `activeId` updates but `hash` does not — the chip stays on whatever was last jumped to, not the category the currently open FAQ belongs to. Not incorrect, but mildly inconsistent: chips tell you “where you jumped last,” not “where you are reading.”
*Fix:* Derive `activeCategoryId` from `activeId` (the open FAQ) OR from the top-most visible category via `IntersectionObserver`, then fall back to `hash` only when nothing is expanded. Low priority — current behavior is predictable if a bit literal.

**CAVEAT-F-03 — `onKeyDown` only navigates within the flat `FAQS` array, ignoring category boundaries.** `[P3, related to F-A11Y-05]`
*Where:* lines 101–122.
*What:* Arrow keys skip seamlessly from the last FAQ in category A to the first FAQ in category B. Visually the user crosses a section heading mid-keystroke. APG permits this; it is just a UX note.
*Fix (optional):* Respect category boundaries: Home/End scope to the current category, Arrow wraps within the category. Matches user expectation of “sectioned” accordions better. Defer unless a user complains.

**CAVEAT-F-04 — `hidden` attribute defeats enter/exit animations.** `[P3, related to F-UX-02]`
*Where:* line 296.
*What:* Using `hidden` is the right a11y call and fixes the clipping issue, but it disables the slide-down animation that Round 1’s `max-h-96` was trying to achieve. Expand/collapse is now an instant snap.
*Fix:* If animation is desired, use the `[hidden]:` pattern with `grid-template-rows: 0fr → 1fr` trick (modern browsers) or conditionally render with `Framer Motion`’s `AnimatePresence`. Add `prefers-reduced-motion` branch. P3 because the instant behavior is accessible and honest.

### 2.3 Round 1 Items Still Open

**F-CNT-02 — Per-FAQ `lastUpdated` metadata is not shown in the UI.** `[P2]`
*Status:* Unchanged. The data exists on each FAQ, is consumed by the FAQPage schema (line 44), but is not rendered for human readers. Consider a small `Last updated 12 Apr 2026` line under the answer body to reinforce trust for compliance-heavy queries (GST rates, TDS thresholds).
*Action:* In `MarkdownRenderer` wrapper at line 299, append a `<p className="mt-6 text-xs uppercase tracking-wider text-brand-stone/70">Last updated {formatDate(faq.lastUpdated ?? FAQ_PAGE_DATE_MODIFIED)}</p>`.

**F-UX-06 — No search / filter input.** `[P2]`
*Status:* Unchanged. With 20+ FAQs, client-side filter (simple `String#includes` on question + answer text) is low-effort and materially improves usability. Also enables “did not find your answer?” analytics.
*Action:* Add a `<input type="search">` at the top of the FAQ grid, filter `groupedFaqs` in a `useMemo` keyed on the debounced term, and highlight matches with `<mark>`.

**F-UX-07 — No “share this FAQ” affordance.** `[P2]`
*Status:* Unchanged. Given each FAQ has a stable `id` and deep-link support, a small share button (copy-link) on hover/focus would be high-value for SEO referrals.
*Action:* Add an icon button inside each `<h3>` that writes `${window.location.origin}/faqs#${faq.id}` to clipboard using the same `handleCopy` pattern from `Contact.tsx`.

**F-SEO-05 — No `<link rel="alternate" hreflang>` for regional variants.** `[P3]`
*Status:* Unchanged — out of scope until the Kannada/Hindi variants exist. Noted so it is not lost.

**F-FEAT-01 through F-FEAT-10 — enhancement backlog.** `[P2/P3]`
*Status:* None of the feature additions (search, per-FAQ share, PDF export, contact-prefill on “still have questions?”, feedback thumbs, view counts) appear implemented. These were P2/P3 and are acceptable to ship without.

### 2.4 New Issues Introduced by the Round 2 Changes

**NEW-F-01 — `history.replaceState` in `handleCategoryJump` breaks back-button expectation.** `[P2]`
*Where:* line 97.
*What:* Using `replaceState` (instead of `pushState`) means clicking category chip A then chip B then **Back** takes you to the page *before* FAQ, not back to chip A. For a jump-nav pattern this is arguable — arguably `replaceState` is correct because chips are not navigation events — but it is a behavior change from the default anchor-link semantics the user had before.
*Decision needed:* Keep `replaceState` if chips are “filters”; switch to `pushState` if chips should be history entries. Match whatever the service detail page does for consistency.

**NEW-F-02 — `handleCategoryJump` applies `preventDefault()` — breaks middle-click / open-in-new-tab.** `[P2]`
*Where:* line 91.
*What:* A user who middle-clicks a category chip expects it to open in a new tab with the hash pre-applied. `event.preventDefault()` swallows that. Also breaks `Ctrl+Click`.
*Fix:* Only call `preventDefault()` on left-click without modifier keys: `if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;` before `preventDefault()`. Same check in `ServiceDetail` if that has analogous anchors.

**NEW-F-03 — Hash-change navigation via `replaceState` does not trigger the `useEffect([hash])`.** `[P2]`
*Where:* lines 97 (replaceState) + 124–139 (effect).
*What:* `history.replaceState` does **not** fire a `hashchange` event, and `useLocation` from React Router does not re-render on pure `replaceState` either. Result: after `handleCategoryJump`, `hash` in `useLocation` still holds the *previous* value, so `activeCategoryId` (line 63) stays wrong until the user actually navigates. `scrollToTarget` is called imperatively in `handleCategoryJump` so the scroll is fine — but the visual `active` chip highlight lags.
*Fix:* After `history.replaceState(...)`, dispatch `window.dispatchEvent(new PopStateEvent('popstate'))` so React Router picks it up, OR manage the active category as local component state in addition to `hash`. Verify with: click a chip, confirm the chip visually becomes green/highlighted.

**NEW-F-04 — `FAQ_PAGE_DATE_MODIFIED` computed from `new Date(...).getTime()` at module load.** `[P3]`
*Where:* lines 19–22.
*What:* This runs once per JS bundle load. Fine today, but if any FAQ has `lastUpdated` without a timezone and different locales load the module, the sort comparator can flip by a hair. Extremely minor.
*Fix:* Ensure all `lastUpdated` strings are ISO 8601 with timezone (e.g., `2026-04-12T00:00:00Z`), or use `Date.parse(date + 'T00:00:00Z')` explicitly in the sorter.

**NEW-F-05 — `scrollToTarget` uses `scrollIntoView` without a scroll-container scope.** `[P3]`
*Where:* lines 81–88.
*What:* On a page with fixed `Navbar` (the app-level fixed element), the default `scrollIntoView({ block: 'start' })` places the element at viewport top — but the fixed navbar overlaps it. The `scroll-margin-top` on both `<h2>` and the card (lines 231, 251) compensates, so visually this works — but if the card and heading ever disagree on scroll-margin, the behavior would drift.
*Action:* None required. Flagged to document the dependency on the CSS variable `--sticky-offset` (line 231) — that variable must stay in sync with the actual `Navbar` height, otherwise deep-linked FAQs will land under it. Consider a runtime assertion in dev mode.

**NEW-F-06 — `ENABLE_CARD_CONTENT_VISIBILITY` threshold of 20 is a magic number.** `[P3]`
*Where:* line 16.
*What:* Threshold picks itself based on `FAQS.length > 20`. Logic is sound (`content-visibility: auto` pays for itself only at scale), but the chosen threshold is not documented.
*Fix:* Add a comment explaining “20 chosen because below this `content-visibility: auto` costs more in layout-skip bookkeeping than it saves.”

**NEW-F-07 — Heading hierarchy inside FAQ card: `h2 → (button wrapper) → h3`.** `[P2]`
*Where:* line 260.
*What:* The accordion button itself now lives inside an `<h3>`. This is correct per WAI-ARIA APG. But the heading `<h2>` at line 314 for “Still have questions?” outside the grid creates an `h2 → h3 → h2` alternation when reading linearly. Screen reader users encountering the post-FAQ CTA hear a heading-level jump. Not a violation, but a little unusual.
*Fix:* Demote “Still have questions?” to `<h2>` → keep, or wrap the whole outer container in a `<section aria-label="Need more help?">` so the heading-level jump is cleaner. Low priority.

---

## 3. Cross-page considerations

**Shared components introduced between rounds:**
- `components/forms/Honeypot.tsx` — new; not directly re-audited here. Before closing C-A11Y-09 entirely, confirm it renders with `tabIndex={-1}`, `aria-hidden="true"`, `autoComplete="off"`, and visually-hidden CSS (not `display: none`, which some bots detect).
- `components/ui/formClasses.ts` — new; the `darkInputClass` export should enforce focus ring + `min-height: 44px` to satisfy WCAG 2.5.8 “Target Size (Minimum)”. Worth a 2-minute read to confirm.
- `utils/sanitize.ts` — has `normalizeInput` (body-safe) and `headerSafe` (header-safe) per Contact.tsx imports. Before closing C-SEC-01 / C-SEC-02 entirely, spot-check that `headerSafe` strips **all** CR (`\r`), LF (`\n`), and (defensively) Unicode line terminators `\u2028 \u2029`, and that `normalizeInput({ preserveLineBreaks: true })` allows `\n` but still strips null bytes and vertical tabs.

**Dependencies to read next (not audited here):**
- `components/Reveal.tsx` — needed to close C-FEAT-09 on reduced-motion.
- `hooks/useRateLimit.ts` — needed to confirm C-PERF-05 and CAVEAT-C-01 fix paths.
- `components/forms/Honeypot.tsx` — needed to close C-A11Y-09 and NEW-C-01.
- `netlify.toml` — needed for C-SEC-04 CSP nonce migration.

---

## 4. Recommended PR sequencing for Round 2 cleanup

Each PR is scoped small enough to ship in one sitting.

**PR-R2-1 (P1, no net-new features):**
Fix CAVEAT-C-01 (move `recordAttempt()` after validation) + NEW-C-02 (`?sent=1` bookmark issue) + NEW-C-04 (preserve `initialSubject` on reset). Single file change. Adds two small unit tests around `handleSubmit` flow if test harness exists.

**PR-R2-2 (P1):**
Map hardening — CAVEAT-C-04 (drop `allow-popups-to-escape-sandbox`), CAVEAT-C-05 (`allow` syntax), C-PERF-01 / C-SEC-07 (static-map-first pattern with click-to-load live iframe). Biggest single win for privacy and performance.

**PR-R2-3 (P2):**
FAQ nav correctness — NEW-F-02 (honor modifier keys on chip click), NEW-F-03 (dispatch popstate after replaceState OR move active state to component), CAVEAT-F-02 (derive active chip from active FAQ).

**PR-R2-4 (P2):**
Telemetry — NEW-C-01 (log honeypot hits), F-UX-06 (client-side search), F-CNT-02 (render per-FAQ `lastUpdated`).

**PR-R2-5 (P1, cross-cutting):**
Reduced-motion audit — C-FEAT-09, CAVEAT-F-04 (honor `prefers-reduced-motion` in all `Reveal` and all `scrollIntoView` calls project-wide). Needs coordinated sweep, not just these two pages.

**PR-R2-6 (P1, infra):**
CSP nonce migration in `netlify.toml` — closes C-SEC-04. Separate from pages; include a Vite plugin config change.

---

## 5. Close-out checklist

Before declaring Round 2 done:

1. Run a11y sweep: axe DevTools on `/contact`, `/contact?sent=1`, `/faqs`, `/faqs#faq-gst-registration-threshold` (or any real FAQ ID). Zero violations expected.
2. Submit Contact form with invalid data 5 times, valid data 1 time, check that rate-limit does not trip on the invalid attempts.
3. Submit Contact form with `subject=Other` empty → confirm `subjectOther` field shows error, not a silent success.
4. Load `/contact?subject=<script>alert(1)</script>` → confirm the subject dropdown renders empty, not with the injected value.
5. Open `/contact`, type the word “test” in message, refresh → confirm draft restores exactly once, typing another character does not re-trigger restore.
6. On `/faqs`, click a category chip, check that the chip highlight updates; press Back and verify expected history behavior.
7. Middle-click a category chip → confirm new tab opens with the hash.
8. Tab through an open FAQ → confirm focus never lands in a collapsed panel.
9. Confirm `prefers-reduced-motion: reduce` in OS settings disables the hero reveal animations on both pages.
10. View-source on `/contact` and confirm the JSON-LD contains `contactPoint` array AND `openingHoursSpecification`.
11. View-source on `/faqs` and confirm each `FAQ` item’s `acceptedAnswer.text` contains rendered HTML matching the visible answer (not raw markdown).

---

*End of Round 2 re-audit.*
