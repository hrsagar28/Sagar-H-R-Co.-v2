# Careers Page — Round 3 Audit

**Files audited:** `pages/Careers.tsx`, `components/forms/CareerForm.tsx`, `components/ui/Button.tsx`, `constants/careers.ts`
**Date:** 22 Apr 2026

Severity key: **P0** = broken / must fix, **P1** = high-impact UX/a11y/SEO, **P2** = polish.

---

## 1. Round-2 regressions — all fixed

| Regression | Status |
|---|---|
| `image=` vs `ogImage=` prop mismatch | **Fixed** — line 33 now `ogImage="https://casagar.co.in/og-careers.png"`. |
| Position-dropdown yank loop | **Fixed** — `prevInitialRef` tracks prop changes at lines 114-122. |
| Button variant class-collision | **Fixed** — `Button.tsx` now has explicit `variant="dark"` and `variant="surface-outline"`. Next/Back buttons use them cleanly (no custom `bg-*` overrides). |
| Step-3 Next button label | **Fixed** — line 589 now shows "Review Application" when `currentStep === 3`. |

---

## 2. Round-2 items — Round-3 status

### Fixed
- **4.1 DOB formatting in Review** — line 524 now `toLocaleDateString('en-GB', ...)` → "12 May 1998".
- **4.2 Edit-button focus shift** — `handleEditStep` at lines 240-250 uses `setCurrentStep` + a 50 ms setTimeout that focuses the first input of that step.
- **4.3 Field-level error feedback in Review** — lines 513, 528, 542: each review card now gets a red ring and "Edit needed" badge when its fields have errors. Well done.
- **4.7 / 4.8 Unbounded fields** — `previousCompanies` now validated with `maxLength(1000)` in schema (line 46) + `maxLength={1000}` on textarea. Mobile field has `inputMode="tel"`, `maxLength={15}`, `autoComplete="tel"`.
- **4.9 `autoComplete` hints** — partially applied (see open items below).
- **4.10 Form focus target** — now focuses `#form-heading` h2 with `tabIndex={-1}` (line 330) instead of the wrapper div. Screen readers now read the heading on landing. 
- **4.12 Step transition delay** — `STEP_TRANSITION_MS = 150` (down from 300). Crisper.
- **4.13 Live-region staleness** — `Careers.tsx` line 18 clears announcement after 1 s.
- **4.5 `scroll-mt` vs `top` mismatch** — both now at 128 px (`scroll-mt-32` and `top-32`).

### Partially addressed
- **3.1 JobPosting schema still thin** — the schema template is correct, but the data feeding it is empty. `constants/careers.ts` has `description: 'We are looking for an Audit Associate to join our team.'` and **empty** `responsibilities: []` / `skills: []` arrays. Google for Jobs will almost certainly reject this for rich-result eligibility. Needs real content.
- **3.2 Cards don't render enriched fields** — `responsibilities`, `skills`, `stipendOrSalary`, `workMode` exist in the interface but are never rendered on the `<li>` cards. Either render them or drop them from the type.
- **4.9 `autoComplete` hints — partial** — applied on `fullName` (`name`), `email`, `mobile`, but **missing on Father's Name** (should be `name` or omit) and **DOB** (should be `bday`).

### Still open
- **3.4 `prefers-reduced-motion` globally** — scroll + step delay respect it; `animate-fade-in-up` classes and Tailwind transitions still animate. Add a global CSS block.
- **3.5 Resume/CV upload** — still no file input.
- **3.6 Empty state** — `OPEN_ROLES.length === 0` still renders an orphaned "Open Positions" heading with nothing below.
- **3.7 "Why Join Us?" thin content** — still three one-word bullets (lines 117-121).
- **3.8 "Protected by reCAPTCHA" misleading** — line 620 still claims it with no integration.
- **3.9 Analytics events** — none wired.
- **3.10 Per-role deep-link / share** — `job.id` exists in data but isn't rendered as `id={job.id}` on the `<li>`, no Share button.
- **3.11 Confirmation auto-reply email** — still not set up.
- **3.12 `SEO-SurfaceLaptop7.tsx` leftover** — confirmed deleted.  **Fixed.**

---

## 3. New issues spotted this pass

### 3.1 Father's Name still uses old `focus:` pattern — **P1 (a11y inconsistency)**
`CareerForm.tsx` line 402:
```tsx
className="... focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
```
Every other input switched to the `focus-visible:` pattern. Father's Name was missed. Align it:
```tsx
className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
```

Consequence: mouse users see a persistent ring when the field has focus after a click (visually noisy). Minor but real.

### 3.2 `'---'` separator in `positionOptions` is selectable — **P1**
Line 32: `[...OPEN_ROLES.map(r => r.role), '---', 'General Application']`. Unless `CustomDropdown` specifically filters out `'---'` as a non-selectable divider, a user can select it as their position — which would then pass `required()` validation and submit a job application with `position: '---'`.

Fix options:
- Extend `CustomDropdown` to accept items like `{ value: string, disabled?: boolean, divider?: boolean }`.
- Or omit the divider and rely on grouping style.
- Or add an `if (values.position === '---')` guard in `validateStep` / `handleSubmit`.

Easy temporary fix:
```ts
position: [required('Please select a position'), (v: string) => v === '---' ? 'Please select a valid position' : undefined]
```

### 3.3 `constants/careers.ts` has empty `responsibilities` and `skills` — **P1**
You took the time to type the interface but the arrays are `[]`. Either fill them (and render) or simplify the interface. The JobPosting schema would benefit from concatenating them into `description`:

```ts
description: [
  `<p>${r.description}</p>`,
  r.responsibilities.length ? `<h3>Responsibilities</h3><ul>${r.responsibilities.map(x => `<li>${x}</li>`).join('')}</ul>` : '',
  r.skills.length ? `<h3>Skills</h3><ul>${r.skills.map(x => `<li>${x}</li>`).join('')}</ul>` : '',
].filter(Boolean).join('')
```

Plus Google Jobs currently **requires** `baseSalary` for India (as of Oct 2024). Add from `stipendOrSalary` when present, otherwise `"directApply": true` and an `identifier` field.

### 3.4 Sticky sidebar `top-32` vs sticky header — **P2**
If the site has a fixed top nav that's taller than 128 px when it expands (mobile → desktop, or with a promo banner), the sticky sidebar will partially hide under it. Best to drive both from a CSS variable:
```css
:root { --sticky-offset: 8rem; }
```
Then `top-[var(--sticky-offset)]` on the sidebar and `scroll-mt-[var(--sticky-offset)]` on the form anchor.

### 3.5 `handleEditStep` focus uses fragile selectors — **P2**
Line 244-246:
```ts
if (step === 3) selector = 'button[aria-labelledby="position-label"]';
```
If `CustomDropdown` ever changes its internal `aria-labelledby` value, focus silently stops moving. Safer:
- Pass a ref prop to each first field and store in refs object, or
- Use a data attribute you own (`data-step-focus="1"`) on the first field per step.

### 3.6 Honeypot still inside visually-rendered form — **P2**
Lines 367-378. The honeypot is inside the `<form>` tag which has `className="space-y-8 relative z-20"`. `space-y-8` applies a top-margin to every non-first child — which **includes the honeypot**. Since the honeypot is the first child, no margin added to it, but it *may* push the real first step down by 2 rem (it has `position: absolute` though, so removed from normal flow — OK). Not a bug but worth knowing.

### 3.7 `handleKeyDown` intercepts Enter on Step 4 → submit — **P2**
Line 235: `if (currentStep < 4) handleNext(); else if (validateStep(4)) handleSubmit(...)`. An Enter key press on Step 4 (user might be navigating away from an Edit button) would accidentally submit. Fine in theory since button focus is excluded, but consider requiring focus on a non-button element plus explicit click for submit.

### 3.8 Submit success screen has no `aria-live` — **P1 (a11y)**
Lines 254-280. Users who submit via keyboard don't get announced that the submission succeeded — the DOM rewrites to the success panel with no `role="status"`. Add `role="status" aria-live="polite"` on the success wrapper, and move focus to the success heading on mount.

### 3.9 Button `asChild` branch may clone className onto a non-element — **P2**
`Button.tsx` line 52-58: if `asChild` is true but children isn't a valid element, returns `null` silently — dev would see nothing rendered, hard to debug. Add a `console.warn` or throw in development.

### 3.10 `autoComplete` missing on email step — **P2 (minor)**
Email field at line 445 has `autoComplete="email"` — OK, present. Father's Name at line 397 has nothing. DOB (CustomDatePicker line 408) — unknown, check the component.

### 3.11 `setValues` doubles as setter and batch updater — **P2**
The form's `setValues(prev => ({ ...prev, position: initialPosition }))` works if `useFormValidation` exposes both signatures. If not, the call silently fails. Verify `useFormValidation`'s `setValues` signature supports function-form updater.

---

## 4. Recommended fix list (20 min)

1. **(1 min)** Father's Name → `focus-visible:` pattern (3.1).
2. **(2 min)** Guard `position === '---'` in schema or drop the separator (3.2).
3. **(5 min)** Fill `constants/careers.ts` with real descriptions / responsibilities / skills, and fold them into the JobPosting schema (3.3).
4. **(5 min)** Empty-state branch for `OPEN_ROLES.length === 0` (was Round-2 item 3.6).
5. **(2 min)** Remove the reCAPTCHA claim text OR integrate Turnstile (was 3.8).
6. **(2 min)** `autoComplete="bday"` on DOB + `autoComplete="name"` on Father's Name.
7. **(3 min)** Add `role="status" aria-live="polite"` on the success screen (3.8 in this pass).

Longer-term still: resume upload, analytics, confirmation email, per-role deep link.

---
