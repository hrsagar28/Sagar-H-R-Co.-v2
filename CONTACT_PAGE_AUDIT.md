# Contact Page — Exhaustive Audit & Remediation Plan

**File under review:** `pages/Contact.tsx` (with dependencies in `components/ui/FormField.tsx`, `components/forms/CustomDropdown.tsx`, `components/ui/BigCTA.tsx`, `components/hero/HeroDirectory.tsx`, `hooks/useFormValidation.ts`, `hooks/useRateLimit.ts`, `hooks/useFormDraft.ts`, `utils/api.ts`, `utils/sanitize.ts`, `constants/contact.ts`, `netlify.toml`).

**Audit date baseline:** source as of commit present on `main` at time of audit.
**Deliverable:** A checklist of issues, each with (a) what is wrong, (b) why it matters, (c) where in code, (d) how to fix — written so Codex can implement without needing additional context.

The plan is organized by domain (A–I). Each finding has a stable ID (e.g. `C-SEC-01`) so Codex can reference it in commit messages / PR descriptions.

---

## Executive summary

The Contact page is functional, visually polished, and already follows several good practices (rate limiting, honeypot, draft save, API retry/timeout, structured data, sanitization). However, it has **three classes of problems** that must be fixed before production:

1. **Privacy & data hygiene.** PII (name, email, phone, message) is persisted to `localStorage` by `useFormDraft`, written even before consent and never purged on TTL. Sanitization is XSS-escaping applied to *outbound* data, which is wrong — it corrupts email display (`'` becomes `&#x27;`) and is not defense-in-depth on the server. The honeypot bypass check is performed *after* the expensive validate/API path is primed.
2. **Accessibility gaps.** Copy buttons are ~18px (below WCAG 2.5.5 target-size); heading hierarchy skips from `h1` (hero) to `h3` inside the form; `aria-live` "Message Sent" region only updates once; the map iframe's fallback `<a>` is semantically inert in modern browsers; `CustomDropdown` retains DOM options when closed without `aria-hidden`.
3. **Correctness bugs.** `recordAttempt` is only called on success, so a failing submit is not rate-limited (brute-forceable). `subjectOther` has no validator when "Other" is selected. The draft-load `useEffect` has an empty dep array but reads state (stale closure). `lastSaved` is destructured but never rendered. `values.subject` from `URLSearchParams` is not validated against the allowed `serviceOptions` list (injection vector into the `_subject` email header).

Fix priority guide: **P0** must ship before public launch, **P1** within the next sprint, **P2** cosmetic / nice-to-have.

---

## A. Accessibility (WCAG 2.2 AA)

### C-A11Y-01 · [P0] Heading hierarchy is broken
- **Where:** `Contact.tsx` lines ~226 (`<h2>Let's discuss…`) and ~344 (`<h3>Send a Message`), plus repeated `<h3>` within the info card (lines 237, 252, 270, 289, 304).
- **Issue:** After `HeroDirectory`'s `h1`, the page jumps from `h2` (info card) to `h3` (Send a Message) on a sibling section. Within the info card, five `h3`s are children of the `h2`, which is correct, but "Send a Message" form heading is a *parallel* section and must be `h2`, not `h3`. Additionally the success screen uses `h3` (line 325) — it should be `h2`.
- **Why it matters:** Screen reader users cannot skim by landmark + heading level; WAVE / Lighthouse will flag `heading-order`.
- **Fix:**
  - Change `<h3>Send a Message</h3>` → `<h2>Send a Message</h2>`.
  - Change success `<h3 ref={successHeadingRef}>Message Sent!</h3>` → `<h2>`.
  - Wrap the "Our Office / Email / Call / WhatsApp / Hours" sub-labels in `<h3>` (already at h3, fine once parent h2 is there).

### C-A11Y-02 · [P0] Copy-to-clipboard buttons fail target-size
- **Where:** Lines 253 and 271. Buttons use `p-1` around a 14px `Copy` icon → target rect ≈ 22×22 px.
- **Issue:** WCAG 2.5.5 Target Size (Enhanced) requires 44×44; 2.5.8 (AA) requires at least 24×24. Additionally icon-only with no visible text beyond `aria-label` means touch users can miss them.
- **Fix:**
  - Change button to `p-2` minimum, `min-w-[44px] min-h-[44px]`, center the icon.
  - Keep the `opacity-40 group-hover:opacity-100` visual effect but ensure the *click target* is always the full 44px.
  - Add `type="button"` (currently missing — inside a form, defaults to `submit`!). **This is also a functional bug — see C-BUG-04.**

### C-A11Y-03 · [P0] Copy buttons default to `type="submit"` inside a form
- **Where:** Lines 253, 271. The surrounding `<form>` (line 337) makes any unspecified `<button>` a submit. The copy buttons are *outside* the `<form>` in the left column so this is not a live bug today — **but** the `Send another message` button at line 329 is inside the success layout which is *outside* the form DOM when `isSuccess` is true, so also safe. Still, **add `type="button"` defensively** to all three buttons.
- **Fix:** Add `type="button"` to every non-submit `<button>` on the page.

### C-A11Y-04 · [P1] `aria-live="polite"` on success region fires only on first render
- **Where:** Lines 321 (`role="status" aria-live="polite"`).
- **Issue:** When `isSuccess` flips true, React mounts the success block fresh. Polite regions only announce *changes to existing content*; mounting the region with pre-filled content is not reliably announced in VoiceOver / NVDA. Pattern is: keep the region mounted, toggle `aria-hidden`/content inside.
- **Fix:**
  - Replace the `{isSuccess ? … : <form>…}` ternary with a persistent `<div role="status" aria-live="polite" aria-atomic="true">` that renders either the success body or nothing, while the `<form>` toggles `hidden` based on `!isSuccess`.
  - Or push the announcement through the existing `useAnnounce` hook on success.

### C-A11Y-05 · [P1] `CustomDropdown` listbox remains reachable by assistive tech when closed
- **Where:** `components/forms/CustomDropdown.tsx` lines 203–241.
- **Issue:** The `<ul role="listbox">` is always in the DOM and hidden visually via `opacity-0 invisible`. Items retain `role="option"`, which some screen readers still enumerate. Missing `aria-hidden={!isOpen}` and the wrapping `<li>` divider uses `aria-hidden="true"` correctly but the pattern is inconsistent.
- **Fix:** Add `aria-hidden={!isOpen}` (and `inert` where supported) to the `<ul>` when `!isOpen`.

### C-A11Y-06 · [P1] Map iframe fallback `<a>` inside iframe is non-rendering
- **Where:** Lines 508–519. Modern browsers ignore `<a>` placed as iframe children. The skip-to-directions sr-only link on line 500 is the real fallback and is fine.
- **Fix:** Remove the `<a>` from inside `<iframe>` (it's dead code); keep the sr-only anchor above. Add `allow="geolocation 'none'"` and `sandbox="allow-scripts allow-same-origin allow-popups"` where acceptable (Google Maps requires scripts + same-origin + popups for "Open in Maps" link; test before shipping).
- **Bonus:** The iframe has `loading="lazy"` — good. Add `referrerpolicy="no-referrer-when-downgrade"` and `allowFullScreen` if the user might want fullscreen map.

### C-A11Y-07 · [P1] Form has no `noValidate` — browser tooltips can collide with custom error UI
- **Where:** `<form onSubmit={handleSubmit}>` line 337.
- **Fix:** Add `noValidate` to the `<form>`. The fields today use no native `required`/`type="email"` pattern-based validation, but adding `noValidate` is future-proof.

### C-A11Y-08 · [P2] Success heading programmatic focus can cause unexpected scroll on mobile
- **Where:** `useEffect` lines 57–61 focuses `successHeadingRef` when `isSuccess` becomes true. The heading has `tabIndex={-1}` (good).
- **Fix:** Call `successHeadingRef.current.focus({ preventScroll: true })` and follow with a controlled `scrollIntoView({block:'start'})` only if the element is out of viewport.

### C-A11Y-09 · [P1] Honeypot input has no accessible name / label
- **Where:** Line 339. It's hidden off-screen with `aria-hidden="true"` — **but** `aria-hidden` on form controls is explicitly disallowed (it hides from a11y tree but the control is still focusable). The `tabIndex={-1}` mitigates focusability, but screen readers may still encounter it.
- **Fix:** Wrap in a `<div aria-hidden="true" style="position:absolute;left:-9999px;…">` and remove `aria-hidden` from the input itself; additionally set `autoComplete="off"` (already present) and `inputMode="none"`. `CareerForm.tsx` already uses this pattern (line 375) — use it consistently.

### C-A11Y-10 · [P2] `lang` per-field — Indian phone format
- **Where:** Phone input line 363. `inputMode="tel"` is present. `autoComplete="tel"` is present. Good.
- **Enhancement:** Add `pattern="[+0-9 ]*"` for mobile keyboards and `aria-describedby` pointing to a visible hint like "10-digit mobile, India".

### C-A11Y-11 · [P2] Focus-visible ring on dropdown uses `ring-current` which may be invisible
- **Where:** `CustomDropdown.tsx` line 186: `focus-visible:ring-current`. On the dark theme (Contact), `text-white` → ring is white on near-black. On light theme pages, `text-brand-dark` ring on off-white background. Both OK but brittle.
- **Fix:** Pin focus ring color explicitly: `focus-visible:ring-brand-accent` on dark zones, `focus-visible:ring-brand-moss` on light zones, driven by `zone` data attr.

---

## B. UX / Interaction

### C-UX-01 · [P1] Subject defaults to query-param value without validation against allowed set
- **Where:** Lines 70–78. `initialSubject = queryParams.get('subject')` is spread directly into state.
- **Issue:** A link like `/contact?subject=<script>alert(1)</script>` will seed the dropdown with an arbitrary value. The dropdown only displays the current `value`, so XSS is not triggered, **but** the string flows into the `_subject` FormSubmit header unchanged except for the `sanitizeInput` pass (which escapes HTML). Attackers can craft email-header injection or phishing-style display text.
- **Fix:**
  ```ts
  const allowed = new Set(serviceOptions);
  const initialSubject = allowed.has(queryParams.get('subject') || '') 
    ? (queryParams.get('subject') as string) 
    : '';
  ```
  Also: on `handleChange('subject', v)`, if `v === 'Other'`, render the "Please specify" field; otherwise clear `subjectOther`.

### C-UX-02 · [P1] `subjectOther` is not cleared when user changes subject back
- **Where:** `handleChange('subject', …)` — no side-effect clearing `subjectOther`.
- **Fix:** Intercept `subject` change: `if (newVal !== 'Other') setValues(prev => ({ ...prev, subjectOther: '' }))`.

### C-UX-03 · [P1] `subjectOther` has no validation rule even when shown
- **Where:** `contactSchema` (line 44) has only `name/email/phone/message`. Line 417 conditionally renders the `subjectOther` field. If user picks "Other" and leaves it blank, form passes validation and the email subject becomes literal "Other".
- **Fix:** Validate conditionally — either extend `useFormValidation` to support conditional validators, or run an inline check in `handleSubmit` before `apiClient.post`:
  ```ts
  if (values.subject === 'Other' && !values.subjectOther.trim()) {
    setErrors(e => ({ ...e, subjectOther: 'Please specify your subject' }));
    return;
  }
  ```

### C-UX-04 · [P0] Rate limiter only records *successful* attempts
- **Where:** Line 124, `recordAttempt()` is inside the success branch.
- **Issue:** Failed submits (validation errors, network errors, 4xx/5xx) are not counted. A script can fire 1000 invalid submits per minute without ever hitting `canSubmit === false`. Defeats purpose of `useRateLimit`.
- **Fix:** Move `recordAttempt()` to just after `apiClient.post(...)` *call initiation* (try block start), or call it in `finally` with a success/failure flag if you want to separate counters. Simplest:
  ```ts
  try {
    await apiClient.post(...);
    recordAttempt(); // or move earlier
    setIsSuccess(true); clearDraft(); ...
  } catch (err) {
    recordAttempt(); // count failures too
    ...
  }
  ```

### C-UX-05 · [P1] Draft-load `useEffect` has stale-state closure and broken deps
- **Where:** Lines 83–88:
  ```tsx
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !values.name && !values.email && !values.phone) setValues(draft);
  }, []); // Run once on mount
  ```
- **Issue:** `values` / `loadDraft` / `setValues` are not in deps. The `// Run once on mount` comment signals intent, but on StrictMode double-invoke (React 18 dev), the effect runs twice; if route is kept-alive, more times. Also, users returning from `/faqs` → `/contact` who had partial entry could have the draft overwrite the in-memory state.
- **Fix:**
  ```tsx
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    const draft = loadDraft();
    if (draft) {
      setValues(prev => ({ ...prev, ...draft }));
      restored.current = true;
    }
  }, [loadDraft, setValues]);
  ```
  Or explicitly add a "Restore draft?" banner (as `CareerForm.tsx` does, lines 301–333) instead of silently overwriting.

### C-UX-06 · [P1] No user-facing draft indicator on Contact form
- **Where:** `lastSaved` is destructured at line 81 but never rendered. `CareerForm` uses it (line 628–631).
- **Fix:** Under the Submit button, show the same "Draft saved HH:MM" affordance as on the Careers form. Consistency.

### C-UX-07 · [P1] Autosaved drafts contain PII with no TTL / consent gate
- **Where:** `useFormDraft` writes `{ values, timestamp }` to `localStorage` on every debounced change.
- **Issue:** GDPR / DPDP (India) considerations: name, email, phone, potentially message content are stored indefinitely on the shared browser profile. Secondary users of the device can read it.
- **Fix:**
  1. Gate the write behind cookie consent (`CookieConsent` component). Check `localStorage.getItem('cookie-consent') === 'accepted'`.
  2. Expire drafts older than 7 days on load (`CareerForm` uses 14 — align at 7 for contact).
  3. Clear draft on tab close if consent is "essential only": `window.addEventListener('pagehide', clearDraft)`.
  4. Document the storage in `pages/Privacy.tsx`.

### C-UX-08 · [P1] Clipboard copy has no fallback for insecure contexts
- **Where:** Line 91 `navigator.clipboard.writeText(text)`.
- **Issue:** On `http://` origins or older browsers, `navigator.clipboard` is undefined → `TypeError`, unhandled.
- **Fix:**
  ```ts
  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly','');
        ta.style.position='absolute'; ta.style.left='-9999px';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      addToast(`${label} copied to clipboard!`, 'success');
    } catch { addToast(`Could not copy ${label}`, 'error'); }
  };
  ```

### C-UX-09 · [P2] No inline "mailto / tel" for WhatsApp button label duplication
- **Where:** Line 291, the WhatsApp section has header "WhatsApp Us" and link text "Chat on WhatsApp". Minor duplication, acceptable.

### C-UX-10 · [P1] Working Hours are hard-coded; no timezone awareness
- **Where:** `CONTACT_INFO.hours.display = "Mon - Sat: 10:00 AM - 8:00 PM"`.
- **Issue:** International visitors see IST with no label. Schema's `openingHours` uses `"Mo-Sa 10:00-20:00"` (correct Schema.org ISO), but display string doesn't say IST.
- **Fix:** Append ` (IST)` to the display string, or render a live "Open now / Closed" pill based on `Date` comparison.

### C-UX-11 · [P1] "Send another message" resets page to empty form
- **Where:** Line 329. Clicking it sets `setIsSuccess(false)` but the form `values` were already cleared (line 126). Good. But the clearing happens eagerly before `isSuccess` is shown, which means if the user *refreshes* the success screen, the URL/state is empty. Consider preserving success state through one refresh with `?sent=1` query, or using `history.replaceState`.
- **Fix:** Optional, P2.

### C-UX-12 · [P2] No character counter below `message` until length > 1800
- **Where:** Line 441: `hint={values.message.length > 1800 ? "{n}/2000 — approaching limit" : "{n}/2000"}`.
- **Issue:** Visually the hint jumps in emphasis only past 1800 chars. Either show a subtle counter from char 1, or hide until 1800. Currently both happen — hint text is always present but only changes copy past 1800, which means the visual aid is always there. This is fine — minor: right-align via FormField's `hintClassName` (already set to `text-white/40`).

### C-UX-13 · [P1] Map has no keyboard-accessible caption
- **Where:** Lines 484–522. The info overlay (lines 489–498) is decorative; the actual "Get Directions" anchor is inside the overlay but absolutely positioned.
- **Fix:** Add `aria-label` to the wrapper: `<div role="figure" aria-labelledby="map-caption" …>`. Add an invisible `<h2 id="map-caption" className="sr-only">Our Location on the Map</h2>` before the iframe.

---

## C. UI / Visual design

### C-UI-01 · [P1] Dark info card hides inside a grid column with `lg:sticky lg:top-32` but has no graceful degradation for short viewports
- **Where:** Line 216 `lg:col-span-4 lg:sticky lg:top-32`.
- **Issue:** On `1024 × 600` laptops (14" Surface etc.), the sticky card height can exceed viewport height, so the bottom (Hours row) is cut off when sticky. The form is tall (~800px), so it scrolls independently.
- **Fix:** Convert `lg:sticky` to `xl:sticky` or add `max-h-[calc(100vh-8rem)] overflow-y-auto` on the inner card, or give the card its own scroll.

### C-UI-02 · [P1] Two competing layered shadows on the map wrapper at `md+`
- **Where:** Line 486: `shadow-2xl border-0 md:border zone-border grayscale-0 md:grayscale`.
- **Issue:** On desktop, the `md:grayscale` + `hover:grayscale-0` creates a dramatic effect but the `md:border zone-border` layered with `shadow-2xl` produces slight color fringing on certain displays. On mobile, `rounded-none md:rounded-[3rem]` with `-mx-4 w-[calc(100%+2rem)]` edge-bleeds the iframe — good. Consider raising mobile `h-[280px]` → `h-[320px]` for legibility on dense tiles.
- **Fix:** Accept as design choice; document decision in a comment.

### C-UI-03 · [P1] Field focus ring uses `focus-visible:ring-brand-accent/20` (very subtle)
- **Where:** Lines 356, 367, 383, 395, 425, 450.
- **Issue:** On dark (`#0d0c0b`) background, 20% alpha is ≈ `rgba(accent, 0.2)` — contrast against the field border may fail WCAG 1.4.11 Non-Text Contrast (3:1 required). Check with an accessibility color-contrast tool against background and neighbors.
- **Fix:** Bump to `/40` or `/60`, or add a 1px solid inner border of solid `brand-accent` on `focus-visible` in addition to the alpha ring.

### C-UI-04 · [P1] Submit button size + label use `BigCTA` with `tone="accent"` but loading state keeps translate/hover
- **Where:** Line 456 `<BigCTA type="submit" disabled={isSubmitting || !canSubmit} …>`.
- **Issue:** `BigCTA` has `group-hover:scale-100` fill, which still renders on `hover` even when `disabled` because the class is static. `disabled` buttons on many browsers ignore hover but Tailwind's `disabled:` utilities aren't applied to the child `<span>` overlays.
- **Fix:** Extend `BigCTA` with `disabled:cursor-not-allowed disabled:opacity-70` on the container, and gate the fill overlay: `className={`${disabled?'opacity-0':''} group-hover:scale-100 ...`}`.

### C-UI-05 · [P2] Success screen icon `<CheckCircle size={40} />` is centered in a 20 × 20 div
- **Where:** Lines 322–323. `w-20 h-20` (80×80) with a 40px icon is fine, just cosmetic. No action.

### C-UI-06 · [P2] Inconsistent border radius: form uses `rounded-2xl` on inputs, wrapping card uses `rounded-[2.5rem]`
- **Where:** Throughout. This appears intentional in this design system but worth noting in a design tokens pass.

### C-UI-07 · [P1] "By Letter / By Voice / By Visit" directory hero uses `<a href={undefined}>` for "By Visit"
- **Where:** `HeroDirectory.tsx` lines 39–57. When `contact.href` is falsy, the wrapper is `div`, not `a` — good. No action. Acceptable.

### C-UI-08 · [P2] Background noise `bg-noise` + `opacity-[0.15]` inside the dark card creates faint banding on OLED
- **Where:** Line 222. Test on Pixel / iPhone OLED; if banding is visible, switch to a pre-baked noise PNG (higher amplitude, lower frequency) or drop the blend-mode overlay.

---

## D. SEO / Structured data

### C-SEO-01 · [P0] `AccountingService` schema uses only one phone / email
- **Where:** Lines 160–194.
- **Enhancement:** Add `contactPoint` array with typed entries:
  ```json
  "contactPoint": [
    { "@type": "ContactPoint", "telephone": "+91-94823-59455", "contactType": "customer support", "areaServed": "IN", "availableLanguage": ["en","hi","kn"] },
    { "@type": "ContactPoint", "email": "mail@casagar.co.in", "contactType": "customer support" }
  ]
  ```

### C-SEO-02 · [P1] `openingHours` value format is ambiguous
- **Where:** Line 182 → uses `CONTACT_INFO.hours.value = "Mo-Sa 10:00-20:00"`.
- **Issue:** Schema.org accepts either a single string or array. Current is a single concatenated token. Google accepts it, but `"openingHoursSpecification"` with `@type: OpeningHoursSpecification` is preferred — rich result eligible.
- **Fix:**
  ```json
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "10:00", "closes": "20:00"
  }]
  ```

### C-SEO-03 · [P1] `priceRange` is missing from AccountingService
- **Fix:** Add `"priceRange": "₹₹"` (or a specific band). Required by many Google Business Profile validators.

### C-SEO-04 · [P1] `ogImage` points to `https://casagar.co.in/og-contact.png` — confirm asset exists
- **Where:** Line 154. If missing, OG previews fall back to default. Add placeholder 1200×630 PNG to `public/og-contact.png`.

### C-SEO-05 · [P1] `canonicalUrl` hard-codes `https://casagar.co.in/contact` — no locale prefix
- **Where:** Line 153. If the site plans hreflang (en/kn/hi), set `alternateUrls` via additional `<link rel="alternate" hreflang="...">` via SEO props. Future-work, P2 today.

### C-SEO-06 · [P2] `sameAs` omits Instagram, YouTube, Twitter/X if accounts exist
- **Fix:** Verify social presence; add all `sameAs` links.

### C-SEO-07 · [P0] `ContactPage` schema `mainEntity` references `#organization` — good, keep.
- No action.

### C-SEO-08 · [P1] Meta description is under 160 chars (149) — fine — but no keyword about Mysuru area
- **Where:** Line 153. Current reads "Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp." — good. Keep.

### C-SEO-09 · [P2] No `itemprop` microdata on the visible `<address>` element
- **Where:** Line 238. JSON-LD already covers this; microdata is redundant for Google but helpful for Bing/Yandex. Skip unless targeting those engines.

---

## E. Security

### C-SEC-01 · [P0] `sanitizeInput` is HTML-escaping outbound data, corrupting the recipient email
- **Where:** `utils/sanitize.ts`. It replaces `<>"'` with HTML entities *before* sending to FormSubmit. The recipient (mail@casagar.co.in) receives `O'Brien` rendered as `O&#x27;Brien` in plain-text emails.
- **Issue:** Wrong layer of defense. Output escaping is a *display* concern. For transport, only normalize whitespace and strip control chars.
- **Fix:**
  1. Rename `sanitizeInput` → `normalizeInput`. Keep the trim. Strip `\r\n\t` control chars for header-injection fields (`_subject`, `email`, `phone`), keep them for `message`.
  2. Use proper HTML escape **only at render time** (i.e., React already does it).
  3. For `_subject`, strip CR/LF specifically:
     ```ts
     const headerSafe = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 200);
     _subject: `New Inquiry: ${headerSafe(values.name)}`
     ```

### C-SEC-02 · [P0] Email-header injection via `name` field
- **Where:** Line 117 `_subject: \`New Inquiry: ${sanitizeInput(values.name)}\``.
- **Issue:** Even with entity-escaping, `\r\n` isn't escaped. A crafted name `Alice\r\nBcc: attacker@evil.com` becomes part of the mail header. FormSubmit.co likely sanitizes but don't rely on third-party; fix client-side.
- **Fix:** Apply the `headerSafe` helper above.

### C-SEC-03 · [P1] `_captcha: false` disables FormSubmit's built-in captcha
- **Where:** Line 119.
- **Issue:** The only anti-bot measure is the client-side honeypot + client-side rate limit. Both are client-side and trivially bypassable by a direct POST to the endpoint. For a CA firm, spam is likely; recommend enabling FormSubmit's captcha (`_captcha: 'true'`) or adding hCaptcha / Cloudflare Turnstile.
- **Fix:**
  - Option A (cheap): set `_captcha: 'true'`. FormSubmit will redirect; hook the success/failure flow accordingly.
  - Option B (better): integrate Turnstile token in the POST body; require server validation. If moving off FormSubmit, roll a small Netlify Function that validates the token.

### C-SEC-04 · [P1] CSP allows `'unsafe-inline'` for script and style
- **Where:** `netlify.toml` CSP.
- **Issue:** `'unsafe-inline'` for `script-src` defeats XSS mitigation. If using Tailwind CDN in dev only, remove `https://cdn.tailwindcss.com` from prod CSP. If Google Tag Manager is in use, move to nonce-based.
- **Fix:**
  - Remove `'unsafe-inline'` from `script-src`, use `'sha256-…'` or nonces.
  - Remove `https://cdn.tailwindcss.com` entirely from prod CSP.
  - For styles, consider `'self' 'unsafe-inline' https://fonts.googleapis.com` remains, but emit a `style-src-attr 'unsafe-inline'` only and tighten `style-src` to `'self' https://fonts.googleapis.com` once inline styles are purged.

### C-SEC-05 · [P1] `window.location.href` → canonical URL may include query string like `?sent=1`
- **Where:** `SEO.tsx` line 46 default; Contact overrides with fixed `https://casagar.co.in/contact` (good, line 153). **No action**.

### C-SEC-06 · [P1] No CSRF defense when moving off FormSubmit
- **Where:** N/A today (third-party endpoint). Note for future: when migrating `/api/contact` to self-hosted, require a double-submit cookie or same-origin check.

### C-SEC-07 · [P1] Map iframe has no `sandbox`
- **Where:** Line 508. Google Maps embed doesn't require script execution from the parent; sandboxing can still break some features. Test `sandbox="allow-scripts allow-popups allow-same-origin allow-popups-to-escape-sandbox"`.

### C-SEC-08 · [P2] Clipboard write occurs without user prompt acceptance on Safari
- **Where:** Line 91. Safari may require a user gesture. We're inside a `<button onClick>` so OK. No action.

### C-SEC-09 · [P2] `logger.error('Contact form error', { error, form: 'contact', attempt: recordAttempt ? 'with_rate_limit' : 'no_limit' })`
- **Where:** Line 130. `recordAttempt` is always a function → always truthy → always `'with_rate_limit'`. Dead branch.
- **Fix:** Remove the `attempt` discriminator or log `canSubmit`, `timeUntilReset`.

---

## F. Performance

### C-PERF-01 · [P1] `<iframe>` for Google Maps blocks LCP on slow connections
- **Where:** Line 508. Already `loading="lazy"` — good.
- **Enhancement:** Replace with a static map image (`https://maps.googleapis.com/maps/api/staticmap?…`) that upgrades to the live iframe on click ("Show interactive map"). Saves ~800KB on first render.

### C-PERF-02 · [P1] Entire `lucide-react` tree is imported
- **Where:** Line 3 imports 11 icons. `lucide-react` supports tree-shaking so in prod this is fine *if* the bundler config is correct (Vite tree-shakes by default). Verify with `vite build --analyze` that the final bundle for `/contact` does not include all icons.
- **Action:** Run `npm run build` and check `dist/assets/*.js` for the Contact chunk size.

### C-PERF-03 · [P1] `Reveal` + `animate-fade-in-up` on every row causes layout thrash
- **Where:** Lines 217, 318, 484. Each Reveal runs its own IntersectionObserver. Consider a shared observer provider.
- **Fix:** Verify `Reveal` uses a single IO (check `components/Reveal.tsx`); if per-component IO, refactor to a context.

### C-PERF-04 · [P2] Draft auto-save debounced at 1000ms writes on every keystroke after debounce
- **Where:** `useFormDraft` default `debounceMs=1000`. Acceptable. No action.

### C-PERF-05 · [P1] `useRateLimit` polls `Date.now()` every 1s
- **Where:** `useRateLimit.ts` line 45 — `setInterval(() => setNow(Date.now()), 1000)` always runs. On an idle page this is a steady 1Hz re-render.
- **Fix:** Only run the interval when `!canSubmit` (i.e., user is blocked). Start/stop based on state.

### C-PERF-06 · [P2] Map iframe src points to google.com — no DNS prefetch hint
- **Fix:** Add to `index.html`:
  ```html
  <link rel="dns-prefetch" href="https://maps.google.com">
  <link rel="preconnect" href="https://maps.google.com" crossorigin>
  ```

---

## G. Content / Copy

### C-COPY-01 · [P1] "By Letter / By Voice / By Visit" is clever but opaque
- **Where:** `PageHero` `contacts` prop (lines 203–208).
- **Issue:** Literal semantics: "By Letter" → email (fine). "By Voice" → phone (fine). "By Visit" → address (fine). For users on a tiny mobile, these stylistic labels feel precious.
- **Fix:** Either keep (design signature) or fall back to "Email / Phone / Office" for `sm` breakpoints. A/B test.

### C-COPY-02 · [P1] "We typically reply within one business day" — add office hours context
- **Where:** Line 473. Upgrade to "We reply within one business day (Mon–Sat, 10 AM – 8 PM IST)."

### C-COPY-03 · [P1] Success message offers no confirmation-email copy
- **Where:** Lines 326–328. "Thank you for reaching out. Our team will get back to you shortly." — say "A confirmation has been sent to the email you provided." only if FormSubmit confirms it (their free tier does).

### C-COPY-04 · [P2] No privacy microcopy under the Submit button
- **Fix:** Add: "By submitting, you agree to our [Privacy Policy](/privacy). We only use your details to reply to this enquiry." under the Submit.

### C-COPY-05 · [P2] The map tooltip says "Our Location" in ALL CAPS but the address is small
- Cosmetic. No action.

---

## H. Code quality / maintainability

### C-CQ-01 · [P1] Dead destructure: `lastSaved`
- **Where:** Line 81. Either render it (as Careers does) per C-UX-06, or drop from destructure.

### C-CQ-02 · [P1] `formData = new FormData(formElement)` only reads `_honey`
- **Where:** Line 107. The `_honey` hidden input is already known; since you send JSON, read honeypot from a React state field (like `CareerForm` does).
- **Fix:** Mirror the Careers pattern:
  ```tsx
  const [honeypot, setHoneypot] = useState('');
  // input: value={honeypot} onChange={e=>setHoneypot(e.target.value)}
  if (honeypot) return; // silent
  ```
  Remove the `FormData` construction.

### C-CQ-03 · [P1] Inline tailwind class strings are long and repeated
- **Where:** All `<input>` classes duplicate `"w-full bg-[#0d0c0b] text-white placeholder:text-white/20 border border-white/5 rounded-2xl p-4 focus:outline-none hover:border-brand-accent/30 focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/20 transition-all duration-200"`.
- **Fix:** Extract to a `darkInputClass` constant in `components/ui/` or add a `DarkInput` primitive. Keeps visual refactors one-line.

### C-CQ-04 · [P1] Magic hex `#0d0c0b` should be a Tailwind token
- **Where:** Same as above.
- **Fix:** Add `brand-ink-deep` (or similar) in `tailwind.config.ts` → `colors.brand`.

### C-CQ-05 · [P1] `initialSubject` lives in the render body and re-computes on every render
- **Where:** Lines 69–71.
- **Fix:** Memo or move into `useState` lazy initializer: `useState(() => queryParams.get('subject') || '')`.

### C-CQ-06 · [P2] File is 530+ LOC — split into `<ContactInfoCard/>` + `<ContactForm/>` + `<ContactMap/>`
- **Benefit:** Testability, readability, lazy-load the map independently.

### C-CQ-07 · [P1] No test coverage for `Contact.tsx`
- **Fix:** Add component tests:
  - Validation: submits empty → shows errors.
  - Honeypot filled → no POST.
  - Subject from query string → pre-selected if valid, ignored if not.
  - Success branch → `clearDraft` called, form reset.
  - Rate limit → after 3 attempts, shows `Please wait {n}s`.

### C-CQ-08 · [P2] Logger call-sites inconsistent — some pass error objects, some strings
- **Where:** `logger.error('Contact form error', { error, ... })`. Align with a shared error contract.

### C-CQ-09 · [P2] `Reveal` imports are legal but verify tree-shaking
- No action.

### C-CQ-10 · [P1] Inline `style={{ position: 'absolute', left: '-9999px', ... }}` in honeypot input
- **Where:** Line 339. Move to a shared `<Honeypot name="..." value={...} onChange={...}/>` primitive to keep both Contact and Careers in sync.

### C-CQ-11 · [P1] `canonicalUrl` hard-codes domain in every `SEO` caller
- **Fix:** Default to `import.meta.env.VITE_SITE_URL + pathname` in `SEO.tsx`.

### C-CQ-12 · [P2] Many empty lines at EOF (lines 531–534)
- Trivial. Run Prettier / ESLint auto-fix.

---

## I. Feature additions (roadmap — P2 unless marked)

### C-FEAT-01 · [P1] Add reCAPTCHA v3 / Turnstile integration
- See C-SEC-03.

### C-FEAT-02 · [P1] Offer inline consultation booking widget (Cal.com / Calendly embed) after success
- **How:** After `setIsSuccess(true)`, render a second CTA: "Prefer to book a slot right now? Pick a time →" with an iframe or deep-link. Reduces friction for high-intent leads.

### C-FEAT-03 · [P2] Add WhatsApp QR code alongside the WhatsApp link
- **How:** `https://api.qrserver.com/v1/create-qr-code/?data={encoded_wa_url}` or a local SVG. Useful for offline posters and users who want to scan from a PC.

### C-FEAT-04 · [P1] Anchor direct-message templates per service
- **How:** When `?subject=GST` is present, prefill `message` with a skeleton: "Hello, I need assistance with GST registration/filing. My turnover is approximately ₹…" Saves the user typing.

### C-FEAT-05 · [P2] Office hours "Open / Closed right now" pill near the Clock icon
- Use `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` to determine.

### C-FEAT-06 · [P2] Inline "Expected response time" based on current day/hour
- e.g., on Saturday 7 PM, message "We reply Monday morning."

### C-FEAT-07 · [P1] File attachments (balance sheet / notice) for paid enquiries
- **How:** Swap FormSubmit for a form backend that supports attachments (Netlify Forms + `<input type="file">`), cap size at 10 MB, virus-scan via a serverless function before delivery. Keep off the MVP path.

### C-FEAT-08 · [P2] GDPR/DPDP cookie banner tie-in
- If `cookie-consent !== 'accepted'`, disable `useFormDraft`.

### C-FEAT-09 · [P1] `prefers-reduced-motion` pass
- `Reveal` and `animate-fade-in-up` — confirm they honor `prefers-reduced-motion: reduce`. If not, short-circuit to final state.

---

## Implementation sequencing for Codex

**PR 1 (P0 only — ~1 day):**
- C-A11Y-01, C-A11Y-02, C-A11Y-03 (headings + target-size + `type="button"`)
- C-UX-01, C-UX-04 (subject whitelist + rate-limit failures)
- C-SEC-01, C-SEC-02 (sanitizer rename + header-safe)
- C-SEO-01 (contactPoint), C-SEO-07 verification.

**PR 2 (P1 — ~2 days):**
- C-A11Y-04 → C-A11Y-09
- C-UX-02, C-UX-03, C-UX-05 → C-UX-10, C-UX-13
- C-UI-01, C-UI-03, C-UI-04, C-UI-07
- C-SEO-02, C-SEO-03, C-SEO-04, C-SEO-05, C-SEO-08
- C-SEC-03, C-SEC-04, C-SEC-07
- C-PERF-01, C-PERF-02, C-PERF-03, C-PERF-05
- C-COPY-01 → C-COPY-03
- C-CQ-01 → C-CQ-05, C-CQ-07, C-CQ-10, C-CQ-11
- C-FEAT-01, C-FEAT-02, C-FEAT-04, C-FEAT-07, C-FEAT-09

**PR 3 (P2 cleanup):**
- Remaining items.

---

## Acceptance criteria per finding

For each P0/P1 item, the PR must include:
1. Code change at the cited line(s).
2. Updated or new unit/component test proving the behavior.
3. Before/after screenshot (Lighthouse / axe-core / Wave) for a11y items.
4. Lighthouse Performance + Best Practices ≥ 95 after all P0/P1 land.
5. No console warnings / errors on `/contact` in production build.

---

*End of Contact Page Audit.*
