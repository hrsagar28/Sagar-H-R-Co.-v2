# Contact Page — Comprehensive Audit

**Files audited:** `pages/Contact.tsx`, `constants/contact.ts`, `components/ui/FormField.tsx`, `components/ui/Button.tsx`, `components/SEO.tsx`
**Date:** 22 Apr 2026

Severity key: **P0** = broken / must fix, **P1** = high-impact UX/a11y/SEO, **P2** = polish.

---

## Executive summary

The page is visually polished — the dark sticky sidebar + right-column form + map stack reads well, and the fundamentals (rate limiting, sanitisation, honeypot, FormField with `aria-invalid` + `aria-live` errors) are in place. However, the page is **under-powered on SEO** (no canonical URL, no JSON-LD, no breadcrumbs, no `ogImage`, no LocalBusiness schema — despite `constants/contact.ts` already holding every field Google needs), has a few **real a11y regressions** (heading hierarchy jumps h2 → h4, success state has no `role="status"` + focus never moves, icons missing `aria-hidden`, form inputs use `focus:` not `focus-visible:` and have no `autoComplete`), and **leaves real UX wins on the table** (the `whatsapp` URL already exists in `CONTACT_INFO.social` but is never surfaced; no click-to-copy on email/phone; no char counter on Message; `"Other"` subject has no follow-up input).

Nothing on the page is P0-broken, but there are ~15 P1 items that will each move the needle.

---

## 1. SEO — major gaps

### 1.1 `SEO` component called with only two props — **P1**
`Contact.tsx` lines 113-116:
```tsx
<SEO
  title={`Contact Us | ${CONTACT_INFO.name}`}
  description="Get in touch with us for expert financial advice. Visit our office in Mysuru or contact us via phone/email."
/>
```
Missing: `canonicalUrl`, `ogImage`, `breadcrumbs`, `schema`. On the Careers page you wire all four — the Contact page should match.

Fix:
```tsx
<SEO
  title={`Contact Us | ${CONTACT_INFO.name}`}
  description="Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp."
  canonicalUrl="https://casagar.co.in/contact"
  ogImage="https://casagar.co.in/og-contact.png"
  breadcrumbs={[
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' }
  ]}
  schema={{
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": "https://casagar.co.in/#organization",
    "name": CONTACT_INFO.name,
    "image": "https://casagar.co.in/logo.png",
    "telephone": CONTACT_INFO.phone.value,
    "email": CONTACT_INFO.email,
    "url": "https://casagar.co.in",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT_INFO.address.street,
      "addressLocality": CONTACT_INFO.address.city,
      "addressRegion": CONTACT_INFO.address.state,
      "postalCode": CONTACT_INFO.address.zip,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT_INFO.geo.latitude,
      "longitude": CONTACT_INFO.geo.longitude
    },
    "openingHours": CONTACT_INFO.hours.value,  // already "Mo-Sa 10:00-20:00"
    "sameAs": [
      CONTACT_INFO.social.linkedin,
      CONTACT_INFO.social.whatsapp
    ]
  }}
/>
```

This is the highest-impact single change on the page — local SEO for a CA firm depends on `LocalBusiness`/`AccountingService` schema with geo + hours, and you already have every field typed in `constants/contact.ts`.

### 1.2 No `ContactPage` schema — **P2**
In addition to (or instead of) the organisation schema above, add a `ContactPage` schema so Google understands the page's purpose:
```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "url": "https://casagar.co.in/contact",
  "name": "Contact Sagar H R & Co.",
  "mainEntity": { "@id": "https://casagar.co.in/#organization" }
}
```
Pass both via `schema={[...]}` as an array.

### 1.3 Description string is generic — **P2**
Current: "Get in touch with us for expert financial advice." Doesn't mention Mysuru, the firm name, or the services. Rewrite to include "Sagar H R & Co.", "Mysuru", and 2-3 service keywords (Audit, Tax, GST) — helps with long-tail queries like *"CA firm in Mysuru contact"*.

---

## 2. Accessibility — concrete regressions

### 2.1 Heading hierarchy skips h3 — **P1 (WCAG 1.3.1)**
The page currently outlines as:
- h1 — hero ("Begin a conversation.")
- h2 — dark sidebar ("Let's discuss your financial future.") (line 147)
- **h4** — "Our Office" (line 158), "Email Us" (line 172), "Call Us" (line 185), "Working Hours" (line 198) — **skipping h3**
- h3 — "Send a Message" (line 237)
- h3 — Map location card (line 341)

Screen reader users navigating by headings (e.g. VoiceOver `VO+Cmd+H`) will jump straight from h2 to h4 and back. Either:
- Demote the sidebar heading to h3 and promote the info-row labels to h4 (already h4 — no change needed), or
- Promote the info-row labels from h4 to h3.

Simpler fix: change lines 158, 172, 185, 198 from `h4` to `h3`.

### 2.2 Success state missing `role="status"` / `aria-live` — **P1**
Lines 213-228. When the form submits and `isSuccess` flips to `true`, the DOM swaps to the success panel **without any announcement**. Keyboard/SR users get silence.

Fix:
```tsx
<div role="status" aria-live="polite" className="text-center py-10 animate-fade-in-up">
  <div className="w-20 h-20 ..."><CheckCircle size={40} aria-hidden="true" /></div>
  <h3 ref={successHeadingRef} tabIndex={-1} className="text-3xl ...">Message Sent!</h3>
  ...
</div>
```
Plus move focus to `successHeadingRef.current` in a `useEffect` that watches `isSuccess`.

### 2.3 Icons have no `aria-hidden` — **P1**
Every Lucide icon in the sidebar (`MapPin`, `Mail`, `Phone`, `Clock` — lines 155, 169, 182, 195) and in the form (`Send`, `Loader2`, `CheckCircle` — 216) renders as an inline SVG with no `aria-hidden="true"`. Some screen readers will announce the raw SVG name ("image", "graphic"). Add:
```tsx
<MapPin size={18} aria-hidden="true" />
```
to all six instances.

### 2.4 Inputs use `focus:` not `focus-visible:` — **P1 (parity with Careers)**
Lines 248, 257, 270, 280, 304: every input has
```tsx
focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss
```
This is the same issue you just fixed on the Careers form's Father's Name field. Mouse users get a persistent ring on click; keyboard users also get a ring but the two are indistinguishable. Align:
```tsx
focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss
```
(Note: `focus:outline-none` is fine to keep alongside `focus-visible` — it only suppresses the browser default.)

### 2.5 No `autoComplete` on any input — **P1**
None of Name, Phone, Email, Company Name, Message have autocomplete hints. Browsers can't offer saved contact info. Add:
```tsx
<input ... autoComplete="name" />          // Name
<input ... autoComplete="tel" />            // Phone
<input ... autoComplete="email" />          // Email
<input ... autoComplete="organization" />   // Company Name
```

### 2.6 `break-all` on email mangles addresses — **P2**
Line 173: `className="... break-all ..."`. `break-all` can break *anywhere* in a word, so `mail@casagar.co.in` can wrap as `mail@casa` / `gar.co.in` on narrow columns. Use `break-words` (CSS `overflow-wrap: break-word`) or `break-normal` with a `word-break: break-all` only for very narrow viewports. For an email address, `break-words` almost always looks right.

### 2.7 "Send another message" is a plain `<button>` with no visible ring — **P2**
Line 222: `className="text-brand-moss font-bold hover:underline underline-offset-4"`. No `focus-visible:` style at all. Keyboard users can't see where they are. Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 rounded-md`, or better — use the existing `<Button variant="ghost">` component.

### 2.8 Sticky header offset — **P2**
Line 137: `lg:top-32` matches `scroll-mt-32` elsewhere, consistent with Careers. Same note as the Careers audit: if the header expands (mobile nav, announcement bar), both should be driven by a CSS variable.

### 2.9 Map iframe has no "skip" / escape for keyboard users — **P2**
The Google Maps iframe can absorb keyboard focus and trap arrow-key scrolling. Consider:
- Adding a `<a href="https://maps.google.com/?q=12.3004,76.6518" target="_blank" rel="noopener">Get directions</a>` link immediately above the iframe for users who can't interact with it.
- Ensuring the iframe's `title` is descriptive (currently `${CONTACT_INFO.name} Location` — OK).

---

## 3. UI / UX — missed opportunities

### 3.1 `CONTACT_INFO.social.whatsapp` exists but the page never surfaces it — **P1**
`constants/contact.ts` line 49 already defines:
```ts
whatsapp: "https://wa.me/919482359455?text=Hi,%20I%20would%20like%20to%20book%20a%20consultation."
```
For a small CA firm in India, **WhatsApp is the dominant client channel**. Adding a fourth row in the dark sidebar (with the WhatsApp / MessageCircle icon from lucide) would meaningfully raise conversions vs. the form.

Even better: make it a primary-styled CTA inside the sidebar, separate from the listed details — something like:
```tsx
<a href={CONTACT_INFO.social.whatsapp} target="_blank" rel="noopener"
   className="mt-6 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FAE54] text-white font-bold py-4 rounded-2xl transition">
  <MessageCircle size={18} aria-hidden="true" />
  Chat on WhatsApp
</a>
```

### 3.2 No click-to-copy on email / phone — **P2**
On a contact page, users frequently want to copy the email or phone to another app. A tiny Copy button on hover is a 5-minute add and a real win. Radix has a component; or roll your own with `navigator.clipboard.writeText(CONTACT_INFO.email)` + a toast (`addToast` is already imported).

### 3.3 No character counter on Message — **P2**
Textarea (line 300-306) has `rows={4}` but no `maxLength` and no visible counter. Careers recently added `maxLength={1000}` on `previousCompanies` — apply the same pattern here. A realistic upper bound: 2,000 chars for a contact inquiry. Add the counter inside `FormField`'s hint slot.

### 3.4 No `maxLength` on any input — **P2**
Name, Email, Phone, Company Name — all unbounded. A malicious or buggy paste can push a 100 KB string through `sanitizeInput`, `apiClient.post`, and into your inbox. Apply sensible caps:
- `name`: 80
- `email`: 254 (RFC 5321 limit)
- `phone`: 15
- `companyName`: 120
- `subject` is a dropdown — already bounded
- `message`: 2000

### 3.5 "Other" subject has no follow-up field — **P2**
Line 108: `const serviceOptions = [...SERVICES.map(s => s.title), "Other"];`. If the user picks "Other", they have nowhere to say *what* other — so you either lose context or they'll stuff it into the Message field. Conditional render:
```tsx
{values.subject === 'Other' && (
  <FormField label="Please specify" name="subjectOther">
    <input type="text" value={values.subjectOther} onChange={...} maxLength={80} />
  </FormField>
)}
```

### 3.6 No draft persistence — **P2**
The `hooks` barrel exports `useFormDraft` (per the Careers form). Contact page doesn't use it. A CA firm's contact form often gets abandoned mid-way (user gets interrupted, tab closes). Persisting a draft to `localStorage` and restoring on mount is cheap and meaningful.

### 3.7 No "Typical response time" hint — **P2**
Users submitting a form have no sense of how long to wait. A simple line under the Send button ("We typically reply within one business day") sets expectations and reduces re-submits.

### 3.8 Hero `coordinates` prop is hardcoded — **P2**
Line 122: `coordinates="12.3004° N · 76.6518° E"`. `CONTACT_INFO.geo` already has `latitude: 12.3051, longitude: 76.6551` — slight mismatch (roughly 500 m off). Either:
- Update `constants/contact.ts` to the accurate office lat/lng, and use template-literal interpolation in Contact.tsx, or
- Drop the second decimal and use `CONTACT_INFO.geo`.

Single source of truth.

### 3.9 `data-zone="editorial"` + `zone-bg` / `zone-surface` / `zone-text` — **P2**
This naming is inconsistent with the rest of the app (`bg-brand-bg`, `text-brand-dark`, etc.) used on Careers. If there is a theming system driven by `data-zone`, document it; otherwise rename to match. Consistency across pages reduces mental overhead.

### 3.10 Hardcoded hex `text-[#4ADE80]` appears in 4 places — **P1 (tokens)**
Lines 146, 154, 168, 181, 194. `#4ADE80` is Tailwind's `emerald-400`. Either:
- Use `text-emerald-400` directly (readable, well-known token), or
- Add `brand-accent: '#4ADE80'` to `tailwind.config.js` and use `text-brand-accent`.

The arbitrary class works but (a) it's harder to change later, and (b) it breaks the design-token pattern used everywhere else in the codebase (`brand-moss`, `brand-dark`, `brand-stone`). The `group-hover:bg-[#4ADE80]` and `group-hover:zone-text` pattern is also fragile — centralise.

### 3.11 Map card "Our Location" tag is position-absolute and overlaps on mobile — **P2**
Lines 336-342. With `w-max` and `px-6 py-4`, on very narrow viewports (iPhone SE, ~320 px), the card can clip the map pin behind it. Test at 320 × 568, and consider `max-w-[calc(100%-2rem)] text-balance` or reduce padding on mobile.

### 3.12 Map iframe has no fallback — **P2**
If Google Maps is blocked (ad-blocker, corporate firewall, China), the iframe shows a broken icon with no alternate content. Add `<a href="...">View on Google Maps</a>` inside the iframe body as fallback:
```tsx
<iframe ... src={CONTACT_INFO.geo.mapEmbedUrl}>
  <a href={`https://maps.google.com/?q=${CONTACT_INFO.geo.latitude},${CONTACT_INFO.geo.longitude}`}>
    View our office on Google Maps
  </a>
</iframe>
```

### 3.13 No "Get Directions" button — **P2**
Adjacent to 3.12 — the Our Location card (lines 336-342) has the firm name but no action. A small "Get Directions ↗" link (open in Apple Maps / Google Maps app) is a high-conversion add for anyone who genuinely wants to visit the office.

### 3.14 No subject pre-fill from URL query — **P2**
If a user lands on `/contact?subject=GST`, the form should pre-select the `GST` option. Useful for deep-linking from service cards. Currently ignored.

### 3.15 No analytics events — **P1**
Same note as Careers. `handleSubmit` success, `handleSubmit` failure, field-validation-fails, and "Send another message" click are all untracked. Without these you cannot measure form conversion rate or drop-off.

---

## 4. Code cleanup

### 4.1 `formData.get('_honey')` etc. is redundant — **P2**
Lines 80-82:
```ts
_honey: formData.get('_honey') || '',
_captcha: formData.get('_captcha') || 'false',
_template: formData.get('_template') || 'table'
```
The hidden inputs on lines 232-234 have static values (`'false'`, `'table'`) — you don't need to read them back from `FormData`. Just hardcode:
```ts
_honey: '',  // populated only by bots
_captcha: 'false',
_template: 'table'
```
And still read `_honey` from the form (that's the only dynamic one — bots fill it). Simpler:
```ts
_honey: formData.get('_honey') as string || '',
```

Actually re-reading — the honeypot value is the *only* one that can change (bots fill it, humans don't). So keep `_honey: formData.get('_honey') || ''` but drop the `_captcha` and `_template` reads.

### 4.2 `setValues({ name: '', ... })` is a brittle reset — **P2**
Line 87. If you add a new field and forget to reset it here, the old value persists across successful submissions. Either:
- Expose a `reset()` from `useFormValidation`, or
- Keep initialValues in a constant and spread it here:
```ts
const INITIAL_CONTACT: ContactFormData = { name: '', email: '', phone: '', companyName: '', subject: '', message: '' };
// ...
setValues(INITIAL_CONTACT);
```

### 4.3 `validateOnChange: true` + every keystroke — **P2**
Line 54. With 6 fields and validation on every keystroke, long Messages will validate on every char. For a short form this is OK; but consider debouncing the message field or switching to `validateOnBlur` for `message`. Low-priority — profile before changing.

### 4.4 `e.target as HTMLFormElement` — **P2**
Line 69. `e.currentTarget` would be slightly safer (guaranteed to be the `<form>`). Tiny.

### 4.5 Phone validator is `indianPhone()` but no `maxLength` or `inputMode` — **P2**
Line 254-259: `type="tel"` but no `maxLength={15}` and no `inputMode="tel"` (mobile keyboard hint). Mirror what Careers does.

### 4.6 `serviceOptions` recomputed on every render — **P2**
Lines 106-109. Cheap but pointless. Move outside the component or `useMemo`.

### 4.7 `companyName` key, `company` wire-field — **P2**
Line 76: `company: sanitizeInput(values.companyName)`. Harmless but inconsistent — `useFormValidation` tracks as `companyName`, server receives `company`. Pick one. If FormSubmit expects `company`, rename the form field.

### 4.8 No explicit loading state on the dark sidebar links — **P2**
The `href={mailto:}` and `href={tel:}` anchors have no `rel="noopener"` — not strictly required for `mailto:`/`tel:` (they don't open a new page context), but worth confirming.

### 4.9 `<iframe>` with `frameBorder` and `marginHeight` — **P2**
Lines 348-351: these are deprecated HTML4 attributes. React still emits them as DOM attributes, but modern browsers ignore them anyway. Drop `frameBorder`, `scrolling`, `marginHeight`, `marginWidth` — `className="border-0"` already handles the visual, and the other three are no-ops.

### 4.10 `data-hide-cursor="true"` on the map wrapper (line 334) — **P2**
What does this do? No other component in the grep seems to consume it. If it's a global CSS hook, document it; if it's dead, remove.

### 4.11 `logger.error('Contact form error', error)` — **P2**
Good that you use `logger`. Consider adding breadcrumb/context:
```ts
logger.error('Contact form error', { error, form: 'contact', attempt: recordAttempt ? 'with_rate_limit' : 'no_limit' });
```

### 4.12 `ApiError` branching covers only `NETWORK_ERROR` and `TIMEOUT` — **P2**
Line 93-96. What about 4xx (validation from the server) or 5xx (downstream issue)? A generic "Server error — please email us directly" fallback with the email link inline would be a better UX than a silent retry.

---

## 5. Performance / infra

### 5.1 `<iframe loading="lazy">` — **Good.** Already present.

### 5.2 No `preconnect` for `maps.google.com` — **P2**
The iframe loads a Google Maps bundle on page load. If the map is below the fold, that's fine, but a `<link rel="preconnect" href="https://maps.google.com">` in `index.html` shaves ~100 ms off first map interaction.

### 5.3 Three `<Reveal>` wrappers — **P2**
Lines 138, 211, 331. If `Reveal` uses IntersectionObserver + framer-motion, confirm it respects `prefers-reduced-motion`. (Same systemic note as Careers.)

---

## 6. Security

Rate limit ✓. Honeypot ✓. `sanitizeInput` ✓. `apiClient` with timeout ✓. No real issues here.

One minor point: the honeypot field has `tabIndex={-1}` and `autoComplete="off"` and is off-screen — good — but also has `aria-hidden="true"` which is correct. Screen reader users won't see it. Keep as-is.

---

## 7. Recommended fix order

### Quick wins (under 15 min total)
1. **(2 min)** Add all four missing SEO props (`canonicalUrl`, `ogImage`, `breadcrumbs`, `schema` with `AccountingService`) — **§1.1**. Biggest-impact item on the page.
2. **(1 min)** Change `h4` → `h3` on lines 158, 172, 185, 198 — **§2.1**.
3. **(2 min)** Add `aria-hidden="true"` to all icons — **§2.3**.
4. **(2 min)** Add `autoComplete` hints to all inputs — **§2.5**.
5. **(2 min)** Switch inputs from `focus:` → `focus-visible:` — **§2.4**.
6. **(2 min)** Add `role="status" aria-live="polite"` + focus move on success panel — **§2.2**.
7. **(2 min)** `break-all` → `break-words` on email — **§2.6**.
8. **(1 min)** Replace arbitrary `text-[#4ADE80]` with `text-emerald-400` or a token — **§3.10**.

### Half-hour block
9. **(10 min)** Surface WhatsApp CTA in the dark sidebar — **§3.1**.
10. **(5 min)** Add `maxLength` on all inputs + char counter on Message — **§3.3**, **§3.4**.
11. **(5 min)** Conditional "Please specify" input when subject is "Other" — **§3.5**.
12. **(5 min)** Get Directions link + fallback inside iframe — **§3.12**, **§3.13**.

### Longer term
13. Draft persistence via `useFormDraft` — **§3.6**.
14. Click-to-copy on email/phone — **§3.2**.
15. Analytics events — **§3.15**.
16. URL query pre-fill (`?subject=GST`) — **§3.14**.

---

## 8. Cross-cutting notes (both Careers & Contact)

A few items come up on both pages and are worth handling systemically:

| Theme | Careers | Contact |
|---|---|---|
| `focus:` vs `focus-visible:` consistency | 1 field (Father's Name) | Every input |
| Missing `autoComplete` hints | DOB, Father's Name | All inputs |
| Success state missing `role="status"` + focus move | Yes | Yes |
| No analytics events | Yes | Yes |
| `prefers-reduced-motion` not globally honoured | Yes | Yes |
| Hardcoded sticky offset (`top-32`) — should be CSS var | Yes | Yes |
| Arbitrary Tailwind `[#hex]` values | No (fixed) | Yes (§3.10) |
| No draft persistence | Uses `useFormDraft`? unclear | Missing |
| reCAPTCHA claim / integration | Claims, not integrated | No claim — **but also no captcha** |

Consider addressing the a11y bundle (`focus-visible`, `autoComplete`, `role="status"` on success, icons `aria-hidden`, heading hierarchy) as a single PR across both pages — it's ~20 min of work and buys a clean WCAG AA pass on both forms.
