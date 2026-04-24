# Careers Page — Exhaustive Audit & Remediation Plan

**Files under review:** `pages/Careers.tsx` (page shell + roles list + sidebar), `components/forms/CareerForm.tsx` (the 4-step wizard), `constants/careers.ts` (job posting data), with supporting deps in `components/SEO.tsx`, `components/hero/*`, `components/forms/CustomDropdown.tsx`, `components/forms/CustomDatePicker.tsx`, `components/ui/FormField.tsx`, `hooks/useFormValidation.ts`, `hooks/useRateLimit.ts`, `hooks/useFormDraft.ts`, `utils/api.ts`, `utils/sanitize.ts`.

**Route:** `/careers`.

**Deliverable:** Findings organized A–I. Each has a stable ID (e.g. `K-SEC-01`) for PR reference; each specifies *what*, *why*, *where*, *how*.

---

## Executive summary

Careers is the most ambitious page in the three-page audit scope — it combines a job listing, a 4-step wizard with draft-restore, rate-limit, honeypot, and structured data for job postings. Good craftsmanship overall. However it has **three ship-blocking issues** and a web of secondary problems:

1. **`JobPosting` structured data changes on every render.** `datePosted: new Date().toISOString()` in `constants/careers.ts` and the `validThrough` fallback `Date.now() + 30d` in `Careers.tsx` line 44 are evaluated on every module load / render. `datePosted` is also a date-with-timestamp in ISO 8601, which Google accepts, but shifting it nightly triggers Google's freshness heuristics and can get the posting demoted. Additionally, `description`, `responsibilities`, `skills` are empty or near-empty — Google's JobPosting requirements (for Rich Results) are **not met**; the postings are ineligible for the Google Jobs card as they stand.
2. **The form silently drops user input on unhandled flows.** No file upload (CV/resume) — for a CA-firm careers form that is a business-logic gap, not a bug strictly, but **the email sent to the firm contains no resume**, so every applicant must be emailed back for it. No cover-letter field. `previousCompanies` is a free-form textarea but the review step doesn't show it. The honeypot field `work_authorization_check` has a plausibly legitimate name (a user-agent auto-filler might attempt to fill it).
3. **Accessibility debt throughout the wizard.** Step change has no `aria-live`. The "Edit" button on the review step switches steps but does not move focus properly on all paths. `inert` attribute is not polyfilled for Safari < 17.4. The progress bar uses decorative shapes that are described by nothing. "Apply Now" scroll-and-focus race condition: 50ms `setTimeout` is flaky.

Priority guide: **P0** before public launch, **P1** within the next sprint, **P2** later.

---

## A. Accessibility (WCAG 2.2 AA)

### K-A11Y-01 · [P0] Step change not announced to screen readers
- **Where:** `CareerForm.tsx` `handleNext` (lines 149–166), `handleBack` (lines 168–176).
- **Issue:** When the user advances through steps, only sighted users see the progress bar update. Screen reader users hear nothing.
- **Fix:** Wire up the existing `announce` via `useAnnounce`:
  ```tsx
  import { useAnnounce } from '../../hooks';
  const { announce } = useAnnounce();
  // inside setTimeout:
  setCurrentStep(prev => {
    const n = prev + 1;
    announce(`Step ${n} of 4: ${['Personal','Contact','Professional','Review'][n-1]}`);
    return n;
  });
  ```

### K-A11Y-02 · [P0] `inert` attribute not polyfilled; Safari < 17.4 ignores it
- **Where:** Lines 390, 432, 466, 525 each use `inert={currentStep !== N ? true : undefined}` to hide non-current step panels.
- **Issue:** Pre-17.4 Safari (still a real slice of iOS traffic in 2025–26) ignores `inert` entirely. Hidden panels remain focusable via Tab and submittable via Enter.
- **Fix:**
  - Option A: install `wicg-inert` polyfill globally (`npm i wicg-inert`; import in `index.tsx`).
  - Option B: pair `inert` with `hidden` and / or conditionally render only the active step:
    ```tsx
    {currentStep === 1 && <Step1 … />}
    ```
    Conditional render is simplest and removes most `inert` concerns.

### K-A11Y-03 · [P0] Progress stepper's decorative line has no ARIA status
- **Where:** Lines 347–366. The outer `<div className="flex justify-between items-center mb-12 relative">` has no role; it's purely visual. Screen readers hear 4 anonymous divs.
- **Fix:** Add `role="group" aria-label="Application progress: step {currentStep} of 4"` to the wrapper; add `<span className="sr-only">{currentStep} of 4</span>` inside for context. Or wrap in `<ol aria-label="Application progress">` with each step as `<li aria-current={isCurrent?'step':undefined}>`.

### K-A11Y-04 · [P0] Apply Now click: focus management race
- **Where:** `Careers.tsx` `handleApplyClick` (lines 15–24). Scrolls, then `setTimeout(() => document.getElementById('form-heading')?.focus(), 50)`.
- **Issue:** 50ms is not a guaranteed delay for smooth scroll to complete; on slow devices or long pages, the scroll is still in flight when focus is set, which can cancel the scroll or jump unexpectedly. Focus also moves the viewport on some browsers because `focus()` without `preventScroll: true` forces the element into view (useful here — but it competes with the smooth scroll).
- **Fix:** Prefer one mechanism. Either:
  - Remove `scrollIntoView` and rely solely on `focus({ preventScroll: false })`; or
  - Remove `focus()` and rely on `scrollIntoView`, then on `scrollend` (Chromium 114+, FF 109+, Safari in progress) call `focus({ preventScroll: true })`. Fallback for unsupported browsers: 300ms timeout.

### K-A11Y-05 · [P1] `form-heading` is `tabIndex={-1}` — good. But `focus:outline-none` removes any visual indicator on programmatic focus
- **Where:** Line 338.
- **Fix:** Replace with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss rounded-md`.

### K-A11Y-06 · [P1] Honeypot label text "Leave this field empty" is inside the `<label>`, off-screen
- **Where:** Lines 375–386. The instruction is only visible to screen readers because the wrapper has `position: absolute; left: -9999px`. SRs read "Leave this field empty, edit text". A user with SR + honeypot-aware heuristics might oblige.
- **Fix:** Remove the instruction or obscure the field differently (use `aria-hidden="true"` on the *wrapper*, not on the input itself, and don't provide a label at all — SR users should not perceive the field). Current pattern is fine if the field is *not* focusable and has `aria-hidden="true"` on the wrapper; the `<label>` text then does not need to make sense.

### K-A11Y-07 · [P1] "Edit" buttons on review step don't set focus predictably
- **Where:** `handleEditStep` (lines 239–249).
- **Issue:** After `setCurrentStep(step)`, a 50ms `setTimeout` is used to find the input and focus it. Flaky under slow renders.
- **Fix:** Use `useLayoutEffect` on `currentStep` change: when `currentStep` changes and `isTransitioning` completes, run the focus selector. Or mark each step with a `ref` and focus programmatically from state rather than from a string selector.

### K-A11Y-08 · [P1] "Apply Now" button focus-visible ring uses `ring-offset-brand-surface` — may be invisible if role card background is `brand-surface` itself
- **Where:** Line 95.
- **Action:** Test visually on keyboard tab; adjust offset color if it blends.

### K-A11Y-09 · [P1] Job role card is `<li>` with no `<h3>` wrapping the role name
- **Where:** Line 89. Role is an `<h3>`. Good. But the list `<ul>` has `aria-labelledby="open-positions-heading"` pointing to the h2 "Open Positions" — good.
- **Note:** Keep.

### K-A11Y-10 · [P1] `aria-live="polite"` on announcement wrapper cleared after 1s
- **Where:** `Careers.tsx` line 17, 28: `<div aria-live="polite" className="sr-only">{announcement}</div>` with `setAnnouncement('')` after 1s.
- **Issue:** 1s is short. Rapid successive "Apply" clicks (e.g., switching between roles) lose announcements.
- **Fix:** Use the queued `useAnnounce` hook (already used across the app) instead of local state.

### K-A11Y-11 · [P1] `scroll-mt-[var(--sticky-offset)]` only works if `--sticky-offset` is defined at page scope
- **Where:** Line 105. Verify in `index.css` that `:root` sets `--sticky-offset`. If missing, `scroll-mt-0` is the effective value and the target is under the navbar after scroll.

### K-A11Y-12 · [P1] Review step card headings (`h3 Personal Details`, etc.) are inside a list of sections, no `<section aria-labelledby>`
- **Where:** Lines 527–570.
- **Fix:** Wrap each review block in `<section aria-labelledby={sectionHeadingId}>`.

### K-A11Y-13 · [P1] Success screen icon ≠ link; focus on the "Submit Another" button after submission
- **Where:** Lines 260–288. Success heading gets focus (good). But after focusing the heading, a user pressing Tab lands on "Submit Another Application". Works — no action needed.

### K-A11Y-14 · [P1] `CustomDatePicker` keyboard navigation and ARIA coverage not audited in this pass
- **Note:** Review separately; listed as a dependency of the Careers page.

### K-A11Y-15 · [P1] Date of Birth has no max/min — user can select birthdate in 2030
- **Where:** Step 1.
- **Fix:** In `CustomDatePicker`, constrain `max` to today minus 18 years (if that's the firm's min age) or today; `min` to 1940-ish.

### K-A11Y-16 · [P1] `announcement` string races with `useAnnounce` from `App.tsx` (route announce)
- **Where:** On mount of Careers, App announces "Navigated to Careers". Local `announcement` then triggers on Apply Now. If both fire in quick succession, some SRs may clobber. Move to queued `useAnnounce` — see K-A11Y-10.

---

## B. UX / Interaction

### K-UX-01 · [P0] No file attachment for CV / resume
- **Issue:** The business action — receive an applicant's resume — is not supported. The current flow emails only form fields; the recruiter must reply to request a CV.
- **Fix:**
  1. Add a "Resume / CV" file input (step 3 or step 4). Accept `.pdf,.docx` only. Cap 10 MB.
  2. FormSubmit.co supports file attachments via multipart — refactor submission to `FormData` with proper `multipart/form-data`:
     ```ts
     const fd = new FormData();
     Object.entries(values).forEach(([k,v]) => fd.append(k, v));
     if (resumeFile) fd.append('resume', resumeFile);
     await fetch(endpoint, { method:'POST', body: fd });
     ```
  3. Virus-scan expectation: FormSubmit passes attachments through; for self-hosted, add ClamAV / Cloudflare scanner.
  4. Client-side file validation: check `type`, `size`, strip paths from filename for display.

### K-UX-02 · [P0] `positionOptions` includes the divider `'---'` which can be selected via mouse
- **Where:** `CareerForm.tsx` line 32 and `CustomDropdown.tsx` lines 219–220. Keyboard nav skips `'---'` (good). Mouse click is blocked by `pointer-events-none` on the `<li>` divider (good). ✔️ Verified — no action.

### K-UX-03 · [P0] No "General Application" metadata surfaces in the schema
- **Where:** Line 32 `positionOptions` has 'General Application' at the end. It's not in `OPEN_ROLES` so no JobPosting JSON-LD is emitted. Applicants can apply for a non-posted position. Confirm with the firm whether this is intended. If yes, add a boilerplate description to the contact form flow or to the success copy.

### K-UX-04 · [P0] Duplicate submit risk via Enter key in Step 1–3
- **Where:** `handleKeyDown` (lines 230–237). Enter on a non-textarea, non-button advances to `handleNext`, which is good — it also suppresses form submit in steps 1–3. At step 4, Enter submits (intentional). ✔️ — but ensure `<input>` `type="submit"` / `type="button"` attribute is explicit throughout to avoid ambiguity.

### K-UX-05 · [P1] Validation for step 3 doesn't include `previousCompanies`
- **Where:** `validateStep(3)` lines 134–137. Only `position`, `qualification`, `experience` are checked. `previousCompanies` has `maxLength(1000)` validator (schema line 46). If a user pastes 1500 chars and advances to step 4, the error is shown but already-advanced.
- **Fix:** Add `previousCompanies: values.previousCompanies` to step 3's `fieldsToValidate` dict.

### K-UX-06 · [P1] `previousCompanies` doesn't appear on the Review step
- **Where:** Lines 556–569 show Position, Qualification, Experience — but not "Companies Previously Worked At".
- **Fix:** Add a 4th grid cell:
  ```tsx
  <div className="md:col-span-2"><span className="text-brand-stone block mb-1">Previous Companies</span><span className="font-medium text-brand-dark whitespace-pre-line">{values.previousCompanies || '-'}</span></div>
  ```

### K-UX-07 · [P1] `initialPosition` picker doesn't preserve on step transitions
- **Where:** `useEffect` lines 113–122 updates `position` when `initialPosition` prop changes. Good. But `prevInitialRef` logic logs "Switched position to …" toast even on first load in some conditions — verify manually. Edge case: parent mounts `CareerForm` with `initialPosition=''`, then after Apply Now click passes `initialPosition='Audit Associate'`. `prevInitialRef.current` was `''` (empty string), so `isInitialLoad` is true → no toast. ✔️

### K-UX-08 · [P1] No cover letter / "Why do you want to join" field
- **Fix:** Optional textarea, 1500 chars max, on step 3.

### K-UX-09 · [P1] Rate limit records only on successful submit (same bug as Contact)
- **Where:** Line 207 `recordAttempt()` inside success branch.
- **Fix:** Move to before post or call in both branches. See `C-UX-04` in Contact audit for pattern.

### K-UX-10 · [P1] `validateStep(4) = validate(careerSchema)` — the review step re-runs full validation, but Review UI says "Edit needed" based on `errors`; before validate has run, `errors` is empty → no Edit badges appear even if data is bad
- **Where:** Lines 527, 542, 556.
- **Fix:** Run `validate(careerSchema)` on entry to step 4 (i.e., inside `handleNext` when advancing from 3 → 4). That populates `errors` so badges render on arrival.

### K-UX-11 · [P1] No indication that role-switch toast intrudes when user was mid-step
- **Where:** Line 119.
- **Fix:** Only fire the toast if the user is still on step 1 or 3 (where Position is visible). At steps 2 / 4, suppress.

### K-UX-12 · [P1] Draft restore banner uses `Save size={14}` etc. inside `lastSaved` render; ensure banner is reachable before user starts typing
- **Where:** Lines 301–333.
- **Fix:** Check that the banner gets focus when it appears — add a `ref` and `useEffect`.

### K-UX-13 · [P1] `OPEN_ROLES` has 2 entries; once 10+ are added the single-column list gets long
- **Fix:** Add filtering by `type` (Full Time, Internship) and `location` once count grows. Defer.

### K-UX-14 · [P1] No "Role details" expansion
- **Where:** Role card shows only role, type, location, experience, and an "Apply Now" button. Responsibilities (empty today), skills (empty), salary, application deadline are all hidden.
- **Fix:** Expand role card on click to a panel showing `responsibilities[]`, `skills[]`, `stipendOrSalary`, `applicationDeadline`. Natural fit for an accordion (similar to FAQ). See K-CNT-01 first — role data needs to actually exist.

### K-UX-15 · [P1] Success screen: no "Email us if you have questions" fallback
- **Fix:** Add "If you have questions, email careers@casagar.co.in or reach us on WhatsApp." Below "Submit Another Application".

### K-UX-16 · [P1] Navigating away from Careers mid-form does not prompt for unsaved changes
- **Fix:** Add a `beforeunload` listener when form is dirty (not-initial values):
  ```tsx
  useEffect(() => {
    const dirty = Object.values(values).some(v => v !== '' && v !== initialPosition);
    const onBeforeUnload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [values, initialPosition]);
  ```
  Or rely on auto-save draft and advertise "We've saved your progress" on return.

### K-UX-17 · [P1] `lastSaved` timestamp formatting: `toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })` — locale inference
- **Where:** Line 630.
- **Fix:** Pin locale: `'en-IN'` + `timeZone: 'Asia/Kolkata'`.

### K-UX-18 · [P2] Success "within 5 working days" hardcoded
- **Fix:** Move to a config constant (e.g. `CAREERS_RESPONSE_SLA_DAYS = 5`) so it's easy to tune.

---

## C. UI / Visual design

### K-UI-01 · [P1] "Why Join Us?" sidebar has only 3 items and looks empty on 4k monitors
- **Where:** Lines 110–124.
- **Fix:** Expand to 5–6 items with a small note per item (Mentorship — "direct exposure to partners", etc.). Or add a "Team photo" / illustration.

### K-UI-02 · [P1] Sidebar sticky behavior may overlap form on mid-size viewports
- **Where:** Line 112 `sticky top-[var(--sticky-offset)]`.
- **Fix:** Verify breakpoints: `lg:col-span-1` + `sticky` works, but form on `lg:col-span-2` is taller than sidebar — sticky unsticks at bottom of parent. Acceptable. But on `lg` 1024×768, sidebar hides under navbar if `--sticky-offset` is not configured. See K-A11Y-11.

### K-UI-03 · [P1] Progress bar dot scale-up at `scale-110` may be cut off by neighbors on small screens
- **Where:** Line 357.
- **Fix:** Increase container padding or reduce scale to `scale-105` for `sm`.

### K-UI-04 · [P1] Review card "Edit needed" badge uses `text-[10px] sm:text-xs` — very small for low-vision users
- **Where:** Lines 531, 546, 560.
- **Fix:** Bump to `text-xs md:text-sm` and ensure `font-bold` + `text-red-700` (darker red) for contrast.

### K-UI-05 · [P1] Inputs have `border` but no border color specified when error-free
- **Where:** Lines 401, 413, 445, 458, 491, 517.
- **Issue:** Default `border` without color inherits `border-slate-200` (Tailwind default) which may differ from the design tokens. `FormField.tsx` (line 37) adds `border-red-500` on error but the baseline is absent.
- **Fix:** Add `border-brand-border` to all input classNames.

### K-UI-06 · [P1] `resize-none` on `previousCompanies` textarea prevents user from resizing
- **Where:** Line 517.
- **Fix:** Keep on narrow forms, but `resize-y` + `max-h-60` is friendlier.

### K-UI-07 · [P2] `.scroll-mt-[var(--sticky-offset)]` only on the form wrapper; Apply Now scroll target should also use the sticky offset
- Minor. Already works because `scroll-margin-top` is set. ✔️

### K-UI-08 · [P2] Background decorative grid (`bg-grid`) inside each form section
- Mostly decorative; verify it doesn't reduce input contrast.

### K-UI-09 · [P2] Buttons "Back / Next Step" stack vertically below `md:` breakpoint
- **Where:** Line 582 `flex-col md:flex-row`. Good.

---

## D. Content / Copy / Data (Job Postings)

### K-CNT-01 · [P0] Role data is near-empty — blocks Google Jobs eligibility
- **Where:** `constants/careers.ts`.
- **Issue:**
  - `description`: "We are looking for an Audit Associate to join our team." — 1 sentence. Google requires a meaningful description (recommendation: 150+ words).
  - `responsibilities: []`: empty.
  - `skills: []`: empty.
  - `stipendOrSalary`: missing on both.
  - `applicationDeadline`: missing → fallback is "now + 30 days" which **is recomputed on every render** (see K-SEO-01).
- **Fix:** Author full JDs:
  ```ts
  {
    id: 'audit-associate-1',
    role: 'Audit Associate',
    type: 'Full Time',
    experience: '1-2 years',
    location: 'Mysuru, Karnataka',
    workMode: 'On-site',
    datePosted: '2026-04-01T00:00:00Z', // HARD-CODED, not new Date()
    applicationDeadline: '2026-05-31T23:59:59+05:30',
    stipendOrSalary: { min: 300000, max: 450000, currency: 'INR', unitText: 'YEAR' },
    description: 'Detailed 150-300 word description of the role, team, and expectations…',
    responsibilities: [
      'Lead statutory audits of private limited companies',
      'Draft audit reports and working papers',
      'Liaise with clients on accounting and tax matters',
      // …
    ],
    skills: ['CA Inter / CA cleared', 'Working knowledge of Ind AS', 'Tally / Zoho Books', 'MS Excel'],
  }
  ```

### K-CNT-02 · [P0] `datePosted: new Date().toISOString()` re-evaluates on every module evaluation
- **Where:** Lines 26, 38.
- **Issue:** While `constants/careers.ts` is only evaluated once per page load (ESM module cache), on every deployment / user session the date changes. This defeats Google's posting-freshness heuristics.
- **Fix:** Hard-code the real posting date. Better: move to a CMS or a JSON file with explicit dates.

### K-CNT-03 · [P1] `validThrough` fallback generates 30d from *now* — in `Careers.tsx` line 44
- **Where:** `pages/Careers.tsx` line 44.
- **Issue:** Every page render creates a new date. The JSON-LD emitted to the document head changes. Google crawlers see a moving target.
- **Fix:** Require `applicationDeadline` to be explicit in `OPEN_ROLES`. Remove the fallback.

### K-CNT-04 · [P1] No `employmentType` nuance — "INTERN" vs "TEMPORARY" vs "PART_TIME"
- **Where:** Line 45: `employmentType: r.type === 'Internship' ? 'INTERN' : 'FULL_TIME'`. What about "Part Time" and "Contract" (declared in `JobPosting.type` union)?
- **Fix:** Full mapping:
  ```ts
  const typeMap = { 'Full Time':'FULL_TIME', 'Part Time':'PART_TIME', 'Internship':'INTERN', 'Contract':'CONTRACTOR' } as const;
  ```

### K-CNT-05 · [P1] `hiringOrganization.logo` hard-coded as `https://casagar.co.in/logo.png`; no `url`
- **Where:** Lines 46–51. Add `"url": "https://casagar.co.in"`.

### K-CNT-06 · [P1] Articled Assistant internship has no stipend info
- **Where:** Roles.
- **Fix:** Add stipend (ICAI prescribes minimum stipend rates).

### K-CNT-07 · [P1] No ROC / ICAI number on JobPosting's `identifier` property
- **Fix:** Add `"identifier": { "@type":"PropertyValue", "name":"Firm Registration Number", "value":"XXXXXXX" }`.

### K-CNT-08 · [P2] No "applicant location requirements" nuance for internship (onsite only)
- **Where:** `applicantLocationRequirements: { "@type":"Country", "name":"IN" }`. For internships, consider tightening to city.

### K-CNT-09 · [P1] Responsibilities and skills displayed nowhere in UI
- **Where:** `Careers.tsx` line 85–101 renders only `role/type/location/experience`. Once K-CNT-01 fills in JD data, expose it (K-UX-14).

### K-CNT-10 · [P1] No ICAI-mandated disclosure statement on the page
- **Fix:** Add a one-liner footer: "Sagar H R & Co. is a firm of Chartered Accountants registered with ICAI. FRN: XXXXXXX." in the hero or footer.

---

## E. SEO / Structured data

### K-SEO-01 · [P0] JSON-LD changes on every render because `datePosted` and `validThrough` are non-stable
- See K-CNT-02, K-CNT-03 for root cause.
- **Fix:** Hard-code dates; verify output via Google Rich Results Test and the "View source" of the built page.

### K-SEO-02 · [P0] JobPosting is ineligible for Google Jobs card
- Google's JobPosting requirements: `title`, `description` (meaningful), `hiringOrganization`, `jobLocation` or `jobLocationType`, `datePosted`, `validThrough`, `employmentType`, one of `directApply`/`applicantLocationRequirements`. Currently fails on `description` quality. Fix via K-CNT-01.

### K-SEO-03 · [P1] `baseSalary` missing
- **Fix:**
  ```json
  "baseSalary": { "@type": "MonetaryAmount", "currency": "INR",
    "value": { "@type": "QuantitativeValue", "minValue": 300000, "maxValue": 450000, "unitText": "YEAR" } }
  ```

### K-SEO-04 · [P1] `jobLocation` has no `streetAddress` / `postalCode`
- **Where:** Lines 52–60.
- **Fix:** Use full address from `CONTACT_INFO.address`:
  ```json
  "jobLocation": { "@type": "Place", "address": {
    "@type": "PostalAddress",
    "streetAddress": "1479, 2nd Floor, Thyagaraja Road, KR Mohalla",
    "addressLocality": "Mysuru", "addressRegion": "Karnataka",
    "postalCode": "570004", "addressCountry": "IN" } }
  ```

### K-SEO-05 · [P1] `jobLocationType` missing for onsite-only roles — include `"jobLocationType": "TELECOMMUTE"` for remote/hybrid explicitly when `workMode !== 'On-site'`.

### K-SEO-06 · [P1] No per-role canonical URL
- **Issue:** All jobs share `/careers`. Google typically wants each JobPosting at its own URL.
- **Fix (longer-term):** Add routes `/careers/:id` that render a role-specific detail page; keep `/careers` as the index. Add `"url": "https://casagar.co.in/careers/audit-associate-1"` to each JobPosting.

### K-SEO-07 · [P1] No `directApply: true` — Google rewards explicit apply URL
- **Fix:** Add `"directApply": true` and `"applyUrl": "https://casagar.co.in/careers#apply"` or similar.

### K-SEO-08 · [P1] `description` field wraps `${r.description}` in `<p>` tags
- **Where:** Line 42 `"description": \`<p>${r.description}</p>\``. HTML is accepted; but today's short sentences become tiny `<p>`s.
- **Fix:** After K-CNT-01, feed a richer HTML template:
  ```ts
  "description": `<p>${r.description}</p><h4>Responsibilities</h4><ul>${r.responsibilities.map(x=>`<li>${x}</li>`).join('')}</ul><h4>Skills</h4><ul>${r.skills.map(x=>`<li>${x}</li>`).join('')}</ul>`
  ```

### K-SEO-09 · [P1] Meta description generic
- **Where:** Line 31. "Career opportunities for Chartered Accountants, Articles, and Audit Associates in Mysuru." — add a role count and currency: "2 open roles — Audit Associate (full-time), Articled Assistant (internship) at a Mysuru-based CA firm."

### K-SEO-10 · [P2] `ogImage` points to `https://casagar.co.in/og-careers.png` — confirm asset exists.

### K-SEO-11 · [P2] No hreflang on jobs page — only relevant if Kannada/Hindi translations are planned.

---

## F. Security / Privacy

### K-SEC-01 · [P0] `sanitizeInput` corrupts outbound email (same bug as Contact)
- Same root issue as Contact `C-SEC-01`. Use a `normalizeInput` + `headerSafe` split.
- **Where:** `CareerForm.tsx` lines 193–203.

### K-SEC-02 · [P0] Email-header injection via `fullName` / `position` in `_subject`
- **Where:** Line 203 `_subject: \`Job Application: ${sanitizeInput(values.fullName)} - ${sanitizeInput(values.position) || 'General'}\``.
- **Fix:** `headerSafe(values.fullName)` etc.

### K-SEC-03 · [P1] Honeypot field name is plausible (`work_authorization_check`)
- **Where:** Line 379.
- **Issue:** Password managers / autofill tools sometimes fill fields that look work-related. Risk is minor but real.
- **Fix:** Use a less plausible name: `_hp_wauth_do_not_fill`.

### K-SEC-04 · [P1] Draft contains PII (name, DOB, phone, email, qualification, previous employers)
- **Where:** `useFormDraft('career_form_draft', values)`.
- **Fix:** Same as Contact: (a) gate on consent, (b) purge after 14 days (already done via line 90–92), (c) clear on `pagehide` when consent is "essential only", (d) document in Privacy Policy.

### K-SEC-05 · [P1] `_captcha: false` (implicit via FormSubmit default) — see C-SEC-03.

### K-SEC-06 · [P1] `localStorage.getItem('career_form_draft')` is readable by any same-origin script
- **Fix:** If XSS is ever exploited, PII leaks. Harden CSP and input/content sanitization (see Contact C-SEC-04).

### K-SEC-07 · [P1] `previousCompanies` accepts any text including URLs — potential phishing vector when recruiter previews
- **Fix:** On the recipient side, treat received emails with `plain-text only`. FormSubmit `_template: 'table'` renders as HTML table; verify it does not auto-hyperlink.

### K-SEC-08 · [P2] Logger leaks user input on error?
- **Where:** Line 214 `logger.error('Career form submission failed:', e)`. Only the exception, not form values. ✔️

---

## G. Performance

### K-PERF-01 · [P1] `validate(careerSchema)` rebuilds schema subsets in `validateStep`
- **Where:** Lines 133–147.
- **Issue:** Constructs a new schema object on every call.
- **Fix:** Memoize step schemas:
  ```ts
  const stepSchemas = useMemo(() => ({
    1: pick(careerSchema, ['fullName','fatherName','dob']),
    2: pick(careerSchema, ['mobile','email']),
    3: pick(careerSchema, ['position','qualification','experience','previousCompanies']),
    4: careerSchema,
  }), []);
  ```

### K-PERF-02 · [P1] `useRateLimit` 1Hz re-render (same as Contact C-PERF-05).

### K-PERF-03 · [P1] `window.matchMedia('(prefers-reduced-motion: reduce)')` queried on every `handleNext` / `handleBack`
- **Fix:** Use the existing `useReducedMotion` hook once.

### K-PERF-04 · [P2] Step animation 150ms × 2 (fade-out, fade-in) blocks user on fast machines
- **Fix:** Consider 100ms or cut the delay when user clicks fast.

### K-PERF-05 · [P2] Bundle size of `CareerForm.tsx` is ~640 LOC. Acceptable for a wizard.
- **Fix:** Not needed; lazy-load only if noticeable.

---

## H. Code quality / maintainability

### K-CQ-01 · [P1] `positionOptions` built outside the component but references imported data
- **Where:** Line 32. Fine, but add a comment that reordering `OPEN_ROLES` reorders the dropdown.

### K-CQ-02 · [P1] `prevInitialRef` pattern is OK but duplicates React's built-in behavior
- **Where:** Lines 114–122.
- **Fix:** Replace with `useEffect(() => { if (initialPosition) setValues(prev => ({...prev, position: initialPosition})); }, [initialPosition])` and drop the toast unless there is a prior explicit user action (K-UX-11).

### K-CQ-03 · [P1] `handleNext` / `handleBack` duplicate a reduced-motion check
- **Fix:** Extract `useReducedMotion` once (hook already exists: `hooks/useReducedMotion.ts`).

### K-CQ-04 · [P1] Step 1/2/3/4 JSX is inline — ~250 LOC in one function body
- **Fix:** Extract to `<StepPersonal />`, `<StepContact />`, `<StepProfessional />`, `<StepReview />` with props for values/errors/handlers.

### K-CQ-05 · [P1] Review summary duplicates the form values — easy place for bugs as fields evolve
- **Fix:** Derive from a single `REVIEW_FIELDS` config array (label + accessor) so adding a field automatically reflects in review:
  ```ts
  const REVIEW = {
    personal: [{label:'Full Name',key:'fullName'}, ...],
    contact: [...],
    professional: [...],
  };
  ```

### K-CQ-06 · [P1] No tests on `CareerForm.tsx`
- **Fix:** Add tests:
  - Step-by-step validation prevents advance.
  - Honeypot filled → no POST.
  - Draft auto-save round-trips.
  - Rate limit blocks after N submits.
  - Success → `clearDraft` called.
  - File upload (post-K-UX-01).

### K-CQ-07 · [P1] `onInputChange` casts `e.target.name` to keyof FormData without runtime check
- Low risk — TS infers the type. Keep.

### K-CQ-08 · [P1] Hard-coded `_subject` template inside the component
- **Fix:** Move to a `careersEmail.ts` module; reuse.

### K-CQ-09 · [P1] `const STEP_TRANSITION_MS = 150;` is defined module-scoped but only used here
- **Fix:** OK. Consider moving to a `constants/animation.ts` for consistency with Contact.

### K-CQ-10 · [P1] `OPEN_ROLES` typed as `JobPosting[]` but `responsibilities`/`skills` are `string[]` even when empty — document that empty means "JD to follow".

### K-CQ-11 · [P2] `Trash2` icon imported for "Discard" — ensure it's not inadvertently a destructive-red everywhere; icon semantics fine.

### K-CQ-12 · [P2] Dead code: `onFormSubmitSuccess?.()` is documented but never actually fires a callback from outside. Decide to keep or remove.

### K-CQ-13 · [P2] `maxLength={15}` on mobile input — what about numbers with `+91 98765 43210`? 15 chars is enough (+91 + space + 5 + space + 5 = 14). ✔️

---

## I. Feature additions (roadmap)

### K-FEAT-01 · [P0] Resume upload — see K-UX-01.

### K-FEAT-02 · [P1] Role detail pages `/careers/:id` — see K-SEO-06.

### K-FEAT-03 · [P1] LinkedIn "Easy Apply" or LinkedIn OAuth prefill
- Great applicant friction killer; adds complexity.

### K-FEAT-04 · [P1] "Share this role" buttons (LinkedIn, WhatsApp, copy link)
- Natural amplifier for role openings.

### K-FEAT-05 · [P1] ATS integration (Greenhouse / Lever / Zoho Recruit) webhook
- When form submits, POST to ATS in addition to FormSubmit email.

### K-FEAT-06 · [P1] "Open roles count" pill in navbar
- "Careers · 2" style.

### K-FEAT-07 · [P2] Employee testimonial section on the careers page
- Human-driven trust.

### K-FEAT-08 · [P2] Culture / benefits gallery (images)

### K-FEAT-09 · [P2] Internship program calendar (ICAI articleship cycle dates)

### K-FEAT-10 · [P2] Referral program: "Refer a candidate and get ₹X if hired".

### K-FEAT-11 · [P1] Email confirmation to the applicant via FormSubmit auto-response (`_autoresponse` field)
- **Fix:** Add `_autoresponse: 'Thank you for applying. We will review your profile within 5 working days.'` in the POST body.

### K-FEAT-12 · [P1] Consent checkbox for data processing (DPDP compliance)
- **Fix:** Step 4: `<input type="checkbox" required>` "I consent to Sagar H R & Co. processing my information as per the Privacy Policy."

---

## Implementation sequencing for Codex

**PR 1 (P0 — ~1–2 days):**
- K-CNT-01, K-CNT-02 (author proper JDs, hard-code dates).
- K-SEO-01, K-SEO-02 (schema freshness, Google Jobs eligibility).
- K-UX-01 (resume upload).
- K-A11Y-01, K-A11Y-02, K-A11Y-03, K-A11Y-04.
- K-UX-02 / K-UX-03 verification.
- K-SEC-01, K-SEC-02.

**PR 2 (P1 — ~2–3 days):**
- K-A11Y-05 → K-A11Y-15.
- K-UX-05 → K-UX-17.
- K-UI-01 → K-UI-06.
- K-CNT-03 → K-CNT-10.
- K-SEO-03 → K-SEO-09.
- K-SEC-03 → K-SEC-07.
- K-PERF-01 → K-PERF-03.
- K-CQ-01 → K-CQ-10.
- K-FEAT-02, K-FEAT-04, K-FEAT-05, K-FEAT-06, K-FEAT-11, K-FEAT-12.

**PR 3 (P2 cleanup):**
- Remaining items.

---

## Acceptance criteria per finding

- **Schema:** Google Rich Results Test shows a valid `JobPosting` for every role with zero warnings. `datePosted` and `validThrough` are stable across page reloads.
- **A11y:** axe-core 4.x → zero `critical` / `serious`. Full keyboard walkthrough of wizard: Tab, Shift-Tab, Enter, Esc work. Screen reader announces each step change.
- **Resume upload:** 10 MB PDF / DOCX arrives attached to recipient email. Malformed files rejected client-side with a clear error.
- **Validation:** Each of the 4 steps cannot be advanced with invalid data; review step flags "Edit needed" on bad sections on arrival.
- **Privacy:** Draft storage purges after 14 days; writes only after consent (if consent gate adopted).
- **Tests:** Vitest / RTL coverage ≥ 80% for `CareerForm.tsx` and `Careers.tsx`.
- **SEO:** Google Search Console "Enhancements → Jobs" shows valid items once crawler re-indexes.

---

*End of Careers Page Audit.*
