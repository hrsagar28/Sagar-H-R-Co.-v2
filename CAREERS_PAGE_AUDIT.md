# Careers Page — Detailed Audit

**Files audited:** `pages/Careers.tsx`, `components/forms/CareerForm.tsx`, `components/hero/PageHero.tsx`, `components/SEO.tsx`
**Auditor:** Code & UX review
**Date:** 22 Apr 2026

Severity key: **P0** = broken / must fix, **P1** = high-impact UX/a11y/SEO, **P2** = polish / nice-to-have.

---

## 1. Critical bugs (fix first)

### 1.1 Progress-step styling is literally broken — **P0**
`components/forms/CareerForm.tsx`, line 311:

```jsx
<div className="w-10 h-10 rounded-full ... border-2 ${isActive ? 'bg-brand-moss ...' : 'bg-brand-surface ...'}">
```

The `className` is a **plain double-quoted string**, not a template literal. The `${isActive ? ... : ...}` expression is being emitted as literal text into the `class` attribute. Consequence: the step circles never change colour — the active step doesn't highlight, completed steps don't turn moss-green, and you're shipping garbage class tokens like `${isActive` and `?` to the DOM.

**Fix:** wrap in backticks with `{` / `}`:

```jsx
<div className={`w-10 h-10 rounded-full ... border-2 ${
  isActive
    ? 'bg-brand-moss border-brand-moss text-white scale-110 shadow-lg shadow-brand-moss/30'
    : 'bg-brand-surface border-brand-border text-brand-stone'
}`}>
```

### 1.2 Job card has `cursor-pointer` but isn't clickable — **P1**
`pages/Careers.tsx`, line 97: the outer `<div>` is styled `cursor-pointer` but has no `onClick`, no role, no keyboard handler. Only the nested "Apply Now" button works. The rest of the card lies about being clickable.

**Fix options:**
a) Make the whole card clickable (wrap in `<button>` or make outer element a `<Link>`-style element with role="button", `tabIndex=0`, `onKeyDown` for Enter/Space).
b) Remove `cursor-pointer` from the outer div and keep the button as the only affordance.

### 1.3 Sticky-sidebar rAF loop doesn't recover from resize — **P1**
`pages/Careers.tsx`, lines 16–59. When `window.innerWidth < 1024` the loop bails out and **never restarts** (no resize listener). If a user tilts a tablet from portrait to landscape, the sidebar stops following scroll. Also: the transform is zeroed only once before the bail-out; if they resize back to desktop nothing re-binds.

**Fix options:**
a) Replace the entire JS block with CSS `position: sticky; top: 120px;` on the sidebar. It handles every edge case for free and respects `prefers-reduced-motion` by default. Reach for JS only if you actually need the smoothed easing (you probably don't — the easing is barely perceptible).
b) If you keep the rAF version, add a `window.addEventListener('resize', …)` / `matchMedia` subscription and restart the loop when entering the lg breakpoint.

### 1.4 SEO canonical URL uses `window.location.href` under HashRouter — **P1**
`components/SEO.tsx`, line 46. `HashRouter` URLs look like `https://casagar.co.in/#/careers`. Google strips the hash when indexing; your canonical will therefore emit either the bare domain or a URL Google won't treat as canonical for the Careers page. Combined with no JobPosting schema, this page is essentially invisible to Google for Jobs.

**Fix:**
- Migrate to `BrowserRouter` with Netlify `_redirects` (`/* /index.html 200`) and set canonical to `https://casagar.co.in/careers`.
- Until then, pass an explicit `canonicalUrl="https://casagar.co.in/careers"` prop from `Careers.tsx`.

### 1.5 Misleading reCAPTCHA claim — **P1**
`CareerForm.tsx`, line 523: "Protected by reCAPTCHA and our Privacy Policy." — no reCAPTCHA is wired up. The only anti-bot measure is a honeypot and a client-side rate limiter (both spoofable). Either integrate reCAPTCHA v3 / Turnstile, or remove the line. Keeping it is a small trust-eroder if an applicant looks closely.

### 1.6 `focus:outline-none` with no replacement ring — **P0 (a11y)**
`pages/Careers.tsx`, line 105 ("Apply Now" button) and throughout `CareerForm.tsx` on inputs (`focus:outline-none transition-all`). You strip the native focus ring and on the "Apply Now" button provide **no visible replacement**. Keyboard users literally cannot tell which card they're on. This is a WCAG 2.4.7 (Focus Visible) failure.

**Fix:** replace with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2`. Inputs inside the form do have `focus:ring-1 focus:ring-brand-moss` — that's OK but should be `focus-visible:` and contrast-checked.

---

## 2. UX issues

### 2.1 "Apply Now" jumps to a step that doesn't show the selected role — **P1**
Clicking Apply on a card sets `selectedPosition`, scrolls to the form, and the form jumps to **Step 1 (Personal Details)**. The applicant sees no confirmation that the system understood which role they picked — the position only appears in Step 3. At minimum, surface it in the form header ("Applying for: **Audit Associate**") the moment scroll lands, with an option to change.

### 2.2 Scroll target lands under a fixed header (likely) — **P2**
`scrollIntoView({ block: 'start' })` on `formSectionRef` puts the form's top edge at viewport y=0. If the site has a sticky/fixed top nav (it looks like it does, given the `stickyTopOffset = 120` used for the sidebar), the form heading is hidden under it. Use `scrollMarginTop` via a Tailwind class or compute offset manually.

### 2.3 No focus shift after Apply-Now — **P1 (a11y)**
After scroll, focus stays on the Apply button, so screen-reader / keyboard users don't know they've arrived at a form. Move focus to the form heading (`tabIndex={-1}` + `.focus()`) or the first field. Combine with an `aria-live` announcement like "Application form opened for Audit Associate."

### 2.4 Job cards are content-thin — **P1**
Each card shows only role + experience + type + location. Candidates cannot decide whether to apply. Missing at minimum:
- Short description / responsibilities (2-3 lines).
- Key skills required.
- Stipend / CTC band (optional but highly effective).
- Application deadline, start date, reference ID.
- Date posted ("Posted 3 days ago").
- Work mode (On-site / Hybrid).

### 2.5 Changing role mid-application resets to Step 1 — **P2**
`CareerForm.tsx`, line 108–113: the effect on `initialPosition` forces `setCurrentStep(1)`. If an applicant has already filled Step 2 and then clicks another role card, they lose their place. Better: only change `values.position`, leave the step pointer alone, and show a toast "Switched to Articled Assistant".

### 2.6 No resume/CV upload — **P0 (functional)**
For a CA firm hiring Articled Assistants and Audit Associates, not accepting a resume PDF is a serious gap. Applicants expect to attach one, and hiring managers expect to filter by it. Add a PDF/DOCX upload (5 MB cap, drag-and-drop with keyboard fallback). Use a signed-URL upload to something like Netlify Blobs, Supabase Storage, or S3 — not base64 in the form body.

### 2.7 No review-before-submit step — **P2**
A 3-step wizard that submits directly off Step 3 means typos in the mobile/email go through. Add a compact review panel (read-only summary + Edit button per section) before the final submit.

### 2.8 No empty state for "no openings right now" — **P1**
The two roles are hardcoded in JSX. The day you pause hiring, the page still shouts "Open Positions" with nothing underneath — or worse, you'd delete the array and the heading would sit orphaned. Move roles to `constants/careers.ts`, and render an empty state ("No openings at the moment — send us your profile anyway") with a "General Application" CTA linking into the form pre-filled to that position.

### 2.9 "Why Join Us?" sidebar is underwhelming — **P2**
Three naked bullets: *Mentorship, Corporate Exposure, Continuous Learning*. Add short sub-text under each, and tangible benefits (stipend for articles, paid leaves, office timing, location perks, exam-leave policy, CA-coaching reimbursement, etc.). This is the section that actually sells the firm.

### 2.10 Draft-restore banner has no "last edited" indicator — **P2**
Applicants who closed the tab days ago will get a "We found an unsaved application" banner with no clue how stale it is. Show the timestamp ("Last saved 3 Apr, 4:12 PM") and auto-expire drafts older than, say, 14 days.

### 2.11 Rate-limit message is confusing — **P2**
`Rate limit exceeded. Please wait ${timeUntilReset} seconds.` A user is unlikely to have legitimately hit 3 submits in 60 seconds; if they have, it's because something failed. Combine with a toast like "Still submitting — please wait" and disable the submit button instead of merely rate-limiting.

### 2.12 No analytics events — **P2**
No events fire for: `apply_click` (per role), `form_step_view`, `form_validation_error`, `form_submit_success`, `form_submit_error`. Without funnel data you can't tell where applicants drop off. Wire these into GA4 / Plausible.

### 2.13 No share / save-to-profile affordance — **P2**
Candidates often want to forward a role to a friend or come back later. Add per-role deep links (`/careers#audit-associate`) and a small "Copy link" / "Share on WhatsApp" button on each card.

---

## 3. Accessibility

### 3.1 Open Positions list is semantically a div-soup — **P1**
`{[...].map(...)}` renders sibling `<div>`s. Screen readers read them as unrelated paragraphs. Wrap in `<ul role="list">` + `<li>`, or `<section aria-labelledby="open-positions-heading">` with an inner list. Give the heading an `id` and connect it.

### 3.2 Heading order — **P2**
DOM order is: `h1` (PageHero) → `h2` "Open Positions" → `h3` job role(s) → `h3` "Why Join Us?" → `h2` "Submit Your Details". The "Why Join Us?" `h3` in the sidebar appears before the subsequent `h2`, which mildly confuses AT. Make "Why Join Us?" an `h2` (it's parallel to "Open Positions" in the information architecture) or restructure the landmarks.

### 3.3 Honeypot field uses `display: none` — **P2 (a11y + anti-bot)**
`CareerForm.tsx`, line 332. Apart from being the oldest bot-trap (many bots skip `display:none` fields), it also means some screen readers announce the field regardless. Prefer the standard pattern:

```jsx
<div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
  <label>Leave this field empty<input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" /></label>
</div>
```

### 3.4 Form steps use `hidden` but keep DOM + tabbable inputs — **P1**
`className={`${currentStep === 1 ? 'block animate-fade-in-up' : 'hidden'}`}`: the steps not currently shown are `display:none`, which means they *are* correctly removed from tab order. **But** the conditional on step re-mount means any browser autofill and `useEffect` inside custom fields will re-run. More importantly, validation uses `errors` that may reference fields the user can no longer see — the user clicks "Next" and nothing happens because an invisible step has errors. Narrow the error display per step; at minimum wrap the hidden steps in `aria-hidden="true"` explicitly and set `inert` (available in React 19).

### 3.5 No `aria-live` connecting field errors to the submit result — **P2**
The "Something went wrong" banner has `role="alert"` — good. But per-field errors rendered by `FormField` need `aria-live="polite"` and `aria-describedby` tying the input to its error node. Confirm that `FormField` handles this (not audited in this pass).

### 3.6 Contrast check needed on moss bullets — **P2**
`shadow-glow` on a 2×2 dot over a dark-moss-on-dark card is easily missed. Confirm `text-brand-surface/80` on `bg-brand-dark` meets ≥4.5:1 for body text. If the surface is off-white (`#F5F1EB` kind of tone), 80% opacity over dark likely passes but run a checker.

### 3.7 `selection:` classes — **P2**
`selection:bg-brand-moss selection:text-white` is fine; no complaint. Just confirm contrast — moss on white text is usually OK.

### 3.8 Job-card hover-only affordance — **P2**
The "Apply Now" arrow grows on hover (`group-hover:gap-4`). Keyboard and touch users never see this cue. Use `group-hover:gap-4 group-focus-visible:gap-4` and make sure the card's focus state is also visible.

### 3.9 No `prefers-reduced-motion` gate on scroll/animations — **P1**
`scrollIntoView({ behavior: 'smooth' })`, the rAF sidebar easing, the 300ms transition delay in `handleNext`, and the `animate-fade-in-up` classes all ignore the user's reduced-motion preference. You already have `hooks/useReducedMotion.ts` in the codebase — plug it in and use `behavior: 'auto'` + skip the easing when set.

### 3.10 DOB input UX — **P2**
A custom `CustomDatePicker` for DOB is fine, but confirm year navigation is one-click (not month-by-month back from today). Also offer a plain `<input type="date">` fallback on touch.

---

## 4. Code quality & cleanup

### 4.1 Hardcoded job data in JSX — **P1**
```ts
[{ role: 'Audit Associate', exp: '1-2 Years', type: 'Full Time' },
 { role: 'Articled Assistant', exp: 'Fresher', type: 'Internship' }]
```
Move to `constants/careers.ts` with a typed interface:

```ts
export interface JobPosting {
  id: string;
  role: string;
  type: 'Full Time' | 'Part Time' | 'Internship' | 'Contract';
  experience: string;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  datePosted: string;    // ISO
  applicationDeadline?: string;
  stipendOrSalary?: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
}
export const OPEN_ROLES: JobPosting[] = [ ... ];
```

Then you can derive the `positionOptions` dropdown from the same source (currently it's a separate array in `CareerForm.tsx`, line 31 — future drift risk).

### 4.2 Magic numbers / strings — **P2**
`stickyTopOffset = 120`, `0.2` easing factor, `0.1` convergence, `300` ms step delay — move to named constants so future tweaks don't hunt through code.

### 4.3 `containerRef` / `sidebarRef` / `formSectionRef` typed as `HTMLDivElement` but refs read via `.current?.` pattern — OK, but `formSectionRef.current?.scrollIntoView` is called in a handler — safer to guard with a typed helper.

### 4.4 Duplicate localStorage access in `CareerForm` — **P2**
Lines 86 and 92: `localStorage.getItem('career_form_draft')` is read directly once and again inside `loadDraft()`. The `useFormDraft` hook should own the "has draft" check and expose `hasDraft: boolean` / `draftTimestamp: Date`.

### 4.5 `useEffect` dependency on `setValues` — **P2**
Line 113: the effect depends on `setValues`, which — if not wrapped in `useCallback` inside `useFormValidation` — will change reference every render and spam the effect. Verify the hook memoises its setter.

### 4.6 `icon` prop on `CustomDropdown` only on Experience — **P2**
Position and experience are parallel fields but only one shows an icon. Either show icons on all or none.

### 4.7 Dead / unused imports — **P2**
`BookOpen`, `Phone`, `Mail`, `User`, `Building`, `Save` — grep these in `CareerForm.tsx`: `Save` is used (draft indicator), `User/Phone/Mail/Building/BookOpen` appear imported but **not rendered anywhere** in the JSX shown. Either wire them into field icons or drop the imports.

### 4.8 `<input name="_honeypot">` passed through React state but not connected to validation — **P2**
Fine as is, but consider making the honeypot value part of the post payload under a random field name (bots target `_honeypot` specifically now).

### 4.9 Inconsistent button components — **P2**
The page uses a mix of the shared `<Button>` (design-system) and raw `<button>` tags (Back, Next, Resume/Discard in draft banner). Pick one and stay consistent. The raw buttons duplicate focus/hover/disabled logic that `<Button>` presumably handles properly.

### 4.10 `React.FC` — **P2 (style)**
Modern convention is to drop `React.FC` (it implies `children`, confuses defaultProps). Define props inline: `const Careers = (): JSX.Element => ...`.

### 4.11 Two SEO files in `/components` — **P2**
`SEO.tsx` and `SEO-SurfaceLaptop7.tsx`. The second looks like a leftover backup. Delete it or move to `archive/`.

### 4.12 `Button variant="solid"` with `onClick` before `>` artifact — **P2**
`CareerForm.tsx`, lines 278-281 have an extra blank line between props and the `>`. Lint fix only, but indicative of hand-edit debt.

---

## 5. Functional / SEO gaps

### 5.1 No JobPosting structured data — **P0 (missed opportunity)**
Google for Jobs requires `@type: "JobPosting"` JSON-LD per role. Without it, the listings don't appear in Google's jobs panel — a huge free-traffic miss for a CA firm. Emit one per role:

```ts
const jobSchemas = OPEN_ROLES.map((r) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": r.role,
  "description": r.description,   // must be HTML
  "datePosted": r.datePosted,
  "validThrough": r.applicationDeadline,
  "employmentType": r.type === 'Internship' ? 'INTERN' : 'FULL_TIME',
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Sagar H R & Co.",
    "sameAs": "https://casagar.co.in",
    "logo": "https://casagar.co.in/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mysuru",
      "addressRegion": "KA",
      "addressCountry": "IN"
    }
  },
  "applicantLocationRequirements": { "@type": "Country", "name": "IN" }
}));

<SEO ... schema={jobSchemas} />
```

Your `SEO` component already accepts `schema`, so plumbing is ready.

### 5.2 No breadcrumbs — **P2**
The `SEO` component supports `breadcrumbs` — use it: `[{name: 'Home', url: '/'}, {name: 'Careers', url: '/careers'}]`.

### 5.3 `og:image` is a static site-wide image — **P2**
For social shares of the Careers page, a tailored OG image ("We're Hiring — Audit Associate, Mysuru") would dramatically boost CTR on WhatsApp / LinkedIn shares.

### 5.4 No server-side rendering / prerendering — **P2**
Vite SPA + HashRouter means Google sees an empty shell on first crawl for many years now (Googlebot does render JS, but slow). Prerender the static pages (Careers, Services, Contact) using `vite-plugin-ssg` or Netlify's `prerender` — critical for indexability.

### 5.5 Form endpoint privacy — **P2**
`apiClient.post(CONTACT_INFO.formEndpoint, {...})` — confirm the endpoint doesn't log IPs server-side without a privacy notice. Link the "Privacy Policy" mentioned in the footer-line to an actual page.

### 5.6 No confirmation email — **P2 (functional)**
Applicants submit and see a success screen but get no email confirmation. At least send an auto-reply ("Thanks for applying — we'll review within 5 working days"). Reduces "did they get it?" WhatsApp messages to the office.

### 5.7 Data retention — **P2**
Applications land in your form backend indefinitely. Add a note on how long data is retained and a way to request deletion (DPDP Act 2023 in India).

### 5.8 No mobile-specific sticky CTA — **P2**
On mobile, after scrolling past the job cards, the right-column sticky "Why Join Us?" becomes invisible (it's hidden by `lg:`). Consider a mobile-only sticky bottom bar: "Apply Now" → smooth scroll back up to form. Reduces drop-off.

---

## 6. Visual / copy polish

- **6.1** The hero is just `tag="Careers"` + title + description. Consider the `HeroSplit` variant with `meta` like `[{ label: 'Location', value: 'Mysuru' }, { label: 'Hiring For', value: '2 roles' }, { label: 'Type', value: 'Full-time & Articleship' }]`. Creates an instant snapshot.
- **6.2** "Mysuru, KA" — standardise on "Mysuru, Karnataka" (abbreviations for Indian states feel US-styled).
- **6.3** The two job cards use identical typography — differentiate by adding a small type-tag colour (Full Time → moss, Internship → brass) to make scanning easier.
- **6.4** `Experience: 1-2 Years` — drop the redundant label ("1-2 years of experience" reads better on a card).
- **6.5** `text-xs uppercase tracking-widest` tag pill is a touch small (12 px × 0.1em letter-spacing). Bump to `text-[0.7rem]` or 13 px for readability.
- **6.6** Shadow stack `shadow-2xl` on the dark sidebar card competes with `shadow-xl` on hover cards. Tone one down.
- **6.7** `rounded-[2.5rem]` / `rounded-[2rem]` — inconsistent corner radii across cards. Pick one of the design-token radii.
- **6.8** The sidebar "Why Join Us?" blob blur (`blur-[60px]`) on a small card is aggressive — on lower-end phones you'll feel the paint cost. Consider static radial-gradient SVG.
- **6.9** Success screen copy is fine but can tighten: "Application Submitted! Our team will review your profile and get in touch within 5 working days if your background matches the role."

---

## 7. Testing gaps

- **7.1** No unit test covers `validateStep` / step navigation. Easy wins with Vitest + Testing Library:
  - Step 1 blocks Next with empty fields.
  - Position prefills from `initialPosition`.
  - Submit with rate limit exceeded shows the toast.
- **7.2** No end-to-end happy-path test (Playwright) — "Click Apply → fill 3 steps → submit → see success."
- **7.3** No axe / jest-axe run for a11y regressions.

---

## 8. Recommended fix order (90-minute plan)

1. (10 min) Fix the progress-step className template literal (1.1) — prevents shipping broken UI.
2. (10 min) Add `focus-visible` rings to all interactive elements (1.6 / 3.8).
3. (15 min) Extract jobs to `constants/careers.ts`, richen each record (4.1 / 2.4).
4. (15 min) Replace rAF sticky with CSS `position: sticky` (1.3).
5. (20 min) Emit JobPosting JSON-LD from the new constant (5.1).
6. (10 min) Add focus shift + scroll-margin-top on Apply click (2.2 / 2.3).
7. (10 min) Remove misleading reCAPTCHA line or wire real Turnstile (1.5).

Everything else can be scheduled into a follow-up iteration.

---

## 9. Longer-term items

- Resume/CV upload pipeline (2.6).
- Review-step in the form (2.7).
- Empty-state for zero-roles day (2.8).
- Prerender / migrate off HashRouter (1.4 / 5.4).
- Analytics funnel (2.12).
- Confirmation auto-reply email (5.6).
- Axe + Playwright tests (section 7).
