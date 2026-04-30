# Audit Plan — Resources Page (`/resources`)

**Owner:** CA Sagar H R & Co. — website v3
**Audit date:** 29 Apr 2026
**Audited route:** `/resources` rendered by `pages/Resources.tsx` and the nine tab sub-components in `pages/Resources/*` plus the `components/TaxCalculator` tree.
**Reviewer's note:** This document is the *plan*. ChatGPT (Codex) will execute the changes. Each finding is written as **Problem → Why it matters → How to fix** so Codex can act without further questions.

---

## 0. Scope of files audited

In-scope (any change made by Codex must respect these files):

| Path | Role |
|---|---|
| `pages/Resources.tsx` | Page shell + sidebar tab nav + content router |
| `pages/Resources/TaxCalculator.tsx` | Thin wrapper around `components/TaxCalculator` |
| `pages/Resources/GSTCalculator.tsx` | GST add/remove calculator |
| `pages/Resources/HRACalculator.tsx` | HRA exemption calculator |
| `pages/Resources/CIICalculator.tsx` | Indexation / LTCG cost calculator |
| `pages/Resources/CIITable.tsx` | CII reference table |
| `pages/Resources/ComplianceCalendar.tsx` | Monthly compliance accordion + filter + print |
| `pages/Resources/TDSRateChart.tsx` | TDS / TCS rates table + due-dates summary |
| `pages/Resources/ChecklistGrid.tsx` | Grid of links to checklist detail pages |
| `pages/Resources/ImportantLinksGrid.tsx` | Grid of external gov. portal links |
| `components/TaxCalculator/index.tsx` | Income Tax estimator main component |
| `components/TaxCalculator/IncomeInputs.tsx`, `DeductionsPanel.tsx`, `ResultsDisplay.tsx`, `useTaxCalculation.ts`, `taxSlabs.ts`, `types.ts` | Tax calculator internals |
| `components/skeletons/ResourcesSkeleton.tsx` | Loading state |
| `hooks/useResourceData.ts`, `hooks/useTaxConfig.ts` | Data fetch hooks for `/data/*.json` |
| `public/data/cii-data.json`, `compliance-calendar.json`, `tds-rates.json`, `tax-config.json` | Static JSON used by the tabs |
| `constants/resources.ts` | `IMPORTANT_LINKS`, `CHECKLIST_DATA`, `TDS_DUE_DATES_SUMMARY` |

Out-of-scope here (not on this page): Insights page, Article detail page, global Header/Footer.

---

## 1. Severity legend

- **P0** — Broken behaviour, data correctness bug, security/privacy gap, or WCAG-A violation. Fix first.
- **P1** — Significant UX / a11y / SEO / perf regression. Fix this round.
- **P2** — Polish, refactor, code-quality, future-proofing.

---

## 2. Executive summary

The Resources hub is feature-rich (9 tools) and visually consistent with the brand system, but it has accumulated several correctness, accessibility, and architectural debts:

1. **State is lost on tab switch.** Switching tabs unmounts the tool and wipes user input — no URL hash, no in-memory cache. (P1)
2. **No deep-linking.** Sharing a calculator means sharing the wrong URL — only `/resources` is reachable, not e.g. `/resources/hra`. SEO and shareability suffer. (P1)
3. **Calculation correctness gaps.** GST inclusive/exclusive can produce `NaN` and negative results; HRA exemption breaks when `basic` is `0`; CII calculator runs `calculate()` inside an effect without guarding stale closures. The Income-Tax estimator omits LTCG-specific rates, has hardcoded surcharge rates that diverge from `tax-config.json`, and applies cess to `tax + surcharge − rebate − marginal_relief` (correct for old/new but rebate must be `tax + surcharge` aware). (P0)
4. **Accessibility is uneven.** The sidebar nav is a list of `<button>` with no `role="tablist"`/`tabpanel`, no `aria-selected`, and no keyboard arrow navigation. Tooltips are CSS-hover-only (no focus, no Esc). Number inputs allow `e`, `+`, `-` and rely on `Number()` coercion. The "next deadline" pulse is purely decorative but is read by screen readers. (P0/P1)
5. **Print mode is partly broken.** The Resources shell hides the sidebar in print, but each child component has inconsistent `print:` rules — Calendar collapses closed sections during print (so events disappear), GST/HRA/CII calculators have **no** print styles at all, and TDS chart prints the entire table including the action button column. (P1)
6. **Security/privacy.** External links use `target="_blank"` correctly, but `referrer` policy is loose; the Markdown isn't relevant on this page but the GST/CII calculators echo user input into a `Formula:` string with `cost.toLocaleString` skipped — minor. The site has no CSP, so any future dynamic HTML on this page would be exploitable. (P2)
7. **Performance.** `useResourceData` is created **per consumer**, so `cii-data.json` is fetched twice (once by `CIICalculator`, once by `CIITable`) when the user visits both tabs. No HTTP caching headers are defined; React Query / SWR is not used. Each tab is bundled into the main chunk — no `React.lazy`. (P1)
8. **Code quality.** `NavItem` is declared inside the `Resources` body and re-created every render, which busts the Lucide icon memoisation. Several files are missing `'use client'`-style guards for SSR (Vite SPA, but `typeof document` checks are inconsistent). `any` is used in `NavItem.icon`. Dead `<div>` overlays exist (`group/tooltip` has `<div className="absolute …" hidden block>` rendered as block-in-paragraph, an HTML validity error inside `<p>`). (P1/P2)

The remediation plan below references every concrete file:line and gives Codex an exact change.

---

## 3. UX audit

### 3.1 Tab navigation & deep-linking

**Problem.** `pages/Resources.tsx:20` stores the active tab only in local React state. Switching tabs:
- does not update the URL,
- does not push a history entry,
- does not survive a refresh,
- cannot be linked-to from emails / social.

The brand sells these tools — every WhatsApp share of "use our HRA calculator" lands on `/resources` with the Tax Estimator open instead.

**How to fix (Codex):**
1. Refactor to nested routes via React Router. Add to the router config:
   ```
   /resources                       → redirect to /resources/income-tax
   /resources/income-tax            → <TaxCalculator />
   /resources/gst-calc              → <GSTCalculator />
   /resources/hra-calc              → <HRACalculator />
   /resources/cii-calc              → <CIICalculator />
   /resources/calendar              → <ComplianceCalendar />
   /resources/tds-rates             → <TDSRateChart />
   /resources/cii-table             → <CIITable />
   /resources/checklist             → <ChecklistGrid />
   /resources/links                 → <ImportantLinksGrid />
   ```
   Use `<Outlet />` inside `Resources.tsx` for the right-hand panel, and turn `NavItem` into a `<NavLink>` from `react-router-dom` so `aria-current="page"` and active styling come for free.
2. Update `SEO` per route: each tab gets its own `<title>` ("HRA Calculator — Sagar H R & Co.") and its own canonical URL.
3. Update `generate-sitemap.js` to emit each `/resources/<slug>` URL with a sensible `priority` (0.7) and `changefreq` (`yearly` for table, `monthly` for calendar).
4. Pre-populate the sitemap from a single `RESOURCE_TABS` constant (also used by the sidebar) so the two never drift.

### 3.2 State preservation across tab switches

**Problem.** Because every tab unmounts on switch (`pages/Resources.tsx:114-124`), inputs the user typed (e.g. half-filled HRA form) vanish if they momentarily click the Compliance Calendar.

**How to fix.**
- Once routes exist, tab state is unmounted but stable per route. Persist user inputs to `sessionStorage` (not localStorage — these are sensitive financial inputs) under a single key per calculator: `resources:hra:v1`. Provide a visible "Clear" button (already present) which also clears storage.
- Add a banner the first time storage is restored: "Restored your previous values — clear?".

### 3.3 Sidebar IA

**Problem.** Sidebar groups (`pages/Resources.tsx:79-106`) read as:
- *Calculators* → Tax / GST / HRA / CII
- *Reference Data* → Calendar / TDS / CII Table
- *(Unlabelled group)* → Checklists / Important Links

The third group has no heading (line 101) which breaks the visual rhythm and a11y.

**How to fix.** Rename to **Library** or **Documents** and add the same `<h3>` heading as the other groups.

### 3.4 Tab order

**Problem.** Default tab is `income-tax` (`pages/Resources.tsx:20`). Users coming for "compliance calendar" — the most-trafficked tool for SMB clients in March — must scroll past everything else.

**How to fix.** Once routes exist (3.1), keep `/resources` redirecting to `/resources/income-tax` for now, but add a small **"Most popular: Compliance Calendar →"** shortcut card above the sidebar on `/resources` so the heavy-hitter is one click away. A/B test later.

### 3.5 Empty / error states

**Problem.** `CIITable.tsx`, `CIICalculator.tsx`, `TDSRateChart.tsx`, `ComplianceCalendar.tsx` all render `useResourceData` errors as a static red box ("Failed to load data."). There is no **Retry** button and no degraded fallback (e.g. last-known-good cached JSON).

**How to fix.**
- Add a `retry()` to `useResourceData` (return `{ data, loading, error, retry }`) by wrapping the body in a callback and bumping a counter dependency.
- Render a "Try again" button next to the error message in each consumer.
- Add a service-worker / `Cache-Storage` fallback so the JSON can be served from cache when offline. (Out of scope of this PR if SW not yet present — call it out in a follow-up ticket.)

### 3.6 Print fidelity

**Problem (multiple).**
- `ComplianceCalendar.tsx:208` uses `max-h-0` to hide collapsed months. Closed months therefore print **empty**. Users hit "Print" expecting the whole calendar.
- `pages/Resources.tsx:67` hides the hero in print but the page-level `py-12 px-4` remains, so the printed page has wasted top padding.
- `GSTCalculator.tsx`, `HRACalculator.tsx`, `CIICalculator.tsx`, `CIITable.tsx`, `ImportantLinksGrid.tsx` have **no** `@media print` rules. Their dark "Results" panel in `bg-brand-dark text-white` ends up with white-on-white in print.
- `TDSRateChart.tsx:77-85` prints the per-row Copy button which is meaningless on paper.

**How to fix (per file):**
- `ComplianceCalendar.tsx`: add `print:max-h-none print:opacity-100 print:overflow-visible` to the inner expanding panel; keep `print:hidden` only on the search bar / legend buttons; force show the next-deadline banner only if it exists.
- All "dark hero" result panels: add `print:bg-white print:text-black print:border print:border-black`. The Tax Calculator already does this — copy that pattern (`components/TaxCalculator/index.tsx:127-153`).
- `TDSRateChart.tsx`: add `print:hidden` to the Copy button column header (`th` line 66) and the `td` containing the button (line 77-85). Also drop the per-row `Copy` icon.
- `ImportantLinksGrid.tsx`: add `print:hidden` to the trailing `ExternalLink` icon disc and add `:after { content: " (" attr(href) ")" }` to anchor for print so the URL is visible on paper.
- `pages/Resources.tsx`: add `print:py-0 print:px-0` (already partial) and make the Resource title visible in print as a small heading: keep an `<h1 className="hidden print:block">` so the printed page has a title.

### 3.7 Microcopy

- `pages/Resources.tsx:65` uses `<>Resource <em>Hub.</em></>`. The full stop is decorative; screen readers will read "Resource hub period". Replace with `<><span>Resource </span><em>Hub</em></>` and rely on CSS for the dot.
- `GSTCalculator.tsx:127-131` — the bottom helper text reads `Calculating GST on ₹0 at 18%` when the user hasn't entered anything; show the placeholder copy "Enter an amount to begin." instead.
- `HRACalculator.tsx:123` lists the metro cities — Bengaluru is **not** a metro for HRA. Confirm and document; if intentional, link to the Income Tax FAQ to avoid client confusion.
- `TDSRateChart.tsx:149` hardcodes "FY 2025-26" — must come from `CONTACT_INFO.financialYear` (already used elsewhere).

---

## 4. UI / Visual audit

### 4.1 Layout

- **Sidebar `top-32` is brittle.** `pages/Resources.tsx:76` sets `sticky top-32`. The site header is taller on mobile/tablet and shorter on desktop scroll-shrink. Replace with `top-[var(--header-h)]` driven by the same CSS var the global header uses; if no var exists, define `--header-h` once in `index.css` and reuse.
- **Sidebar collapses to nothing under `lg`.** Below 1024 px, the sidebar disappears (no mobile equivalent). Add a horizontally scrollable pill bar (or a `<details>` "Tools" drop) so phone users can switch tabs.
- **Calculators have inconsistent paddings.** GST and HRA use `p-8 md:p-12` (line 39 / 43), CII calculator uses `p-8 md:p-12` (74), Tax Calculator uses `p-8 md:p-12` (`components/TaxCalculator/index.tsx:127`), but TDS uses `p-6 md:p-12` (143) and Calendar uses `p-8 md:p-12` (111). Standardise on a single `Card` component.

### 4.2 Buttons & focus

- The **Calculate Tax** primary button (`components/TaxCalculator/index.tsx:223-228`) has `focus:` styles but no `focus-visible:ring`. Same for the GST tax-type buttons (`GSTCalculator.tsx:91-103`) and HRA metro toggle (`HRACalculator.tsx:110-121`).
- Replace these inline buttons with the existing `components/ui/Button.tsx` (which already handles `focus-visible:ring-2 ring-brand-moss ring-offset-2`).

### 4.3 Colour and contrast

- The "Reset" pill button in each calculator is `bg-brand-bg text-brand-dark hover:bg-red-50 hover:text-red-600`. On hover it becomes `red-600` (#dc2626) on `red-50` (#fef2f2) which is < 3:1. Bump hover to `text-red-700` for AA on small text.
- `HRACalculator.tsx:132` shows "₹ 0" in `text-green-700` — this is fine, but on the brand-bg/50 background (#…) verify with a contrast tool; if borderline, add `font-bold` (already there) and bump to `green-800`.
- `CIICalculator.tsx:147` uses `text-brand-accent` on `bg-brand-dark`. `brand-accent` is the gold; verify contrast ≥ 4.5:1 — it's currently borderline at large text (which it is, so OK), but add a comment.
- The next-deadline banner (`ComplianceCalendar.tsx:115`) animates `Clock` with `animate-pulse`. On low-luminance screens this is fine, but users with vestibular disorders should see no animation. Wrap the entire `animate-pulse` in `motion-safe:`.

### 4.4 Iconography

- `pages/Resources.tsx:81-104` reuses `BarChart3` and `TrendingUp` for two different items each (`HRA Calculator` & `CII Calculator` both use trending; `TDS Rate Chart` & `CII Calculator` both use BarChart3). Pick distinct icons (`Receipt` for TDS, `LineChart` for CII calc, `Home` for HRA).

### 4.5 Animations

- `animate-fade-in-up` is applied to every panel — and runs **every tab switch**. After 30 seconds of clicking around, it feels twitchy. Add `prefers-reduced-motion` guard once globally in `index.css` (`@media (prefers-reduced-motion: reduce) { .animate-fade-in-up { animation: none; } }`) and shorten duration to `200ms`.
- `ComplianceCalendar.tsx:208` uses `max-h-[2000px]` for the open state. The transition is `duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`. With 12 months × 5 events the height can exceed 2000 px and clip. Replace with a dynamic `grid-template-rows: 1fr` trick:
  ```css
  .accordion       { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms ease; }
  .accordion.open  { grid-template-rows: 1fr; }
  .accordion > div { overflow: hidden; }
  ```

---

## 5. Accessibility (WCAG 2.2 AA) audit

### 5.1 Sidebar tab semantics — **P0**

**Problem.** `pages/Resources.tsx:41-52` renders each tab as a plain `<button>`. The pattern is a classic tablist but lacks:
- `role="tablist"` on the wrapping group,
- `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex={activeTab===id?0:-1}` on each button,
- `role="tabpanel"`, `aria-labelledby`, and `id` on the right-hand content panel,
- arrow-key navigation between tabs.

**How to fix.** Either:
- (a) **Best:** convert to nested routes (see 3.1) and use `<NavLink>` — then drop ARIA tab semantics; the navigation becomes a normal landmark `<nav aria-label="Resources">`.
- (b) **Quick:** keep current state-driven tabs but build a small `Tabs.tsx` primitive (or pull `@radix-ui/react-tabs`) that wires up all the ARIA + arrow-key handling.

Pick (a). It also unlocks deep-linking, SEO, and code-splitting.

### 5.2 Number input safety — **P0**

**Problem.** Every calculator uses `<input type="number">` with `value={…} onChange={(e)=>set(Number(e.target.value))}`. On most browsers `type="number"` allows the characters `e`, `+`, `-` and exponential notation, so:
- `1e9` becomes `1,000,000,000`.
- A pasted value with `,` becomes `NaN`.
- The Tax calculator's `IncomeInputs.tsx:82` caps at `1e10` — good — but `GSTCalculator.tsx:64`, `HRACalculator.tsx:67`, `CIICalculator.tsx:104` have no upper bound and do not strip non-numeric input.

**How to fix.** Add a `useNumericInput` helper:
```ts
export function useNumericInput(initial = 0, { min = 0, max = 1e12 } = {}) {
  const [raw, setRaw] = useState<string>(initial ? String(initial) : '');
  const numeric = Number(raw.replace(/[^\d.-]/g, '')) || 0;
  const clamped = Math.min(max, Math.max(min, numeric));
  return { raw, setRaw, value: clamped };
}
```
Replace all naked `Number(e.target.value)` calls with this helper. Also add `inputMode="decimal"` and `pattern="[0-9]*"` so mobile shows the numeric keypad.

### 5.3 Tooltips — **P1**

**Problem.** Tooltips in `IncomeInputs.tsx:38-46`, `DeductionsPanel.tsx:28-34`, and `CIICalculator.tsx:80-85` are CSS-only `group-hover:`. They:
- never show on keyboard focus,
- can't be dismissed with `Esc`,
- aren't read by screen readers (no `aria-describedby`).

**How to fix.** Build a `Tooltip` component using `<button aria-describedby="tip-x">?</button>` and a hidden `<div id="tip-x" role="tooltip">…</div>` that appears on `:focus-visible` and `:hover`. `Esc` closes it. The button should be a real button (it already is in DeductionsPanel; in IncomeInputs:40 it's a `<span>` — change to `<button type="button" aria-label="Help">`).

### 5.4 Live regions

- `ComplianceCalendar.tsx:114-133` shows the "Next Compliance Deadline" banner. When the user switches the filter, the banner doesn't update and there's no announcement of the new deadline. Wrap the banner in `aria-live="polite"`.
- `TDSRateChart.tsx:90-94` shows "No rates found matching {searchTerm}" — wrap in `aria-live="polite"` so a blind user knows the search collapsed to zero.

### 5.5 Forms

- `GSTCalculator.tsx:61-67` — the `<input>` has no `id` and the `<label>` has no `htmlFor`. The visual label "Amount" is therefore not programmatically associated. Fix in every calculator: add `id` + `htmlFor`. (HRACalculator.tsx:64-101 has the same issue four times.)
- `pages/Resources/CIICalculator.tsx:104` — `id` is also missing.

### 5.6 Skip-to-content & focus management

- When a tab changes, focus stays on the old button. After a route conversion (3.1), call `containerRef.current?.focus()` once on route change so a screen-reader user is informed.
- Add `tabIndex={-1}` and a visible `aria-label` to the resource panel container (`pages/Resources.tsx:112`) so it's a focus target.

### 5.7 Decorative icons

`pages/Resources.tsx:47, 50` — `Icon` and `ChevronRight` get no `aria-hidden`. Add `aria-hidden="true"` to all decorative Lucide icons throughout the page (search for `<Icon ` and `<ChevronRight `, `<ChevronDown `, `<ArrowRight `, `<Globe `, `<ExternalLink `, etc.). Pattern:
```tsx
<Icon size={18} aria-hidden="true" focusable="false" />
```

### 5.8 Headings hierarchy

- `pages/Resources.tsx` — the only `<h1>` lives in `PageHero` ("Resource Hub"). Each tab then uses `<h2>` ("Tax Estimator", "GST Calculator", etc.). That is correct.
- However, `ComplianceCalendar.tsx:201` has month names as `<h3>`, and inside `TDSRateChart.tsx:212-225` there is also an `<h3>`. Both compete with the `<h3>` in `pages/Resources.tsx:79, 91` (sidebar group headings). After the route split, sidebar headings should become `<h2>` and inside the panel should remain `<h2>`/`<h3>`. Resolve by re-numbering: sidebar groups → `<h2 className="sr-only sm:not-sr-only">`, panel title → `<h2>`, in-panel sections → `<h3>`.

### 5.9 Animation for vestibular safety

- `animate-pulse` on `ComplianceCalendar.tsx:118` and `animate-fade-in-up` everywhere should be wrapped in `motion-safe:` (or globally disabled at the CSS layer for `prefers-reduced-motion: reduce`).

---

## 6. Security audit

### 6.1 External-link safety

- `ImportantLinksGrid.tsx:24-30` correctly uses `target="_blank" rel="noopener noreferrer"` ✅. Add `referrerPolicy="no-referrer"` for extra hardening on government portals.
- `constants/resources.ts` has hardcoded URLs. Add a unit test that asserts each `IMPORTANT_LINKS[*].links[*].url` starts with `https://` and is reachable in CI (HEAD ping). Government domains rotate; we should know when they 404.

### 6.2 User-supplied content (none stored, but echoed)

- `ComplianceCalendar.tsx:185` does `e.desc.toLowerCase().includes(calSearch.toLowerCase())`. Search term is not validated; harmless because it's never sent anywhere, but cap length to 200 chars and `trim()` before use.
- `TDSRateChart.tsx:33-35` echoes the user's `searchTerm` back into the empty-state message (`"No rates found matching \"{searchTerm}\""`). That's interpolated in JSX text (auto-escaped) ✅, but if it ever gets piped into `dangerouslySetInnerHTML`, it would be an XSS sink. Add a comment "Do not render this string with `dangerouslySetInnerHTML`."

### 6.3 Clipboard usage

- `TDSRateChart.tsx:51` uses `navigator.clipboard.writeText` without a try/catch. On insecure contexts (http://) this rejects. Wrap in `try/catch` and `addToast("Could not copy.", "error")` on failure.

### 6.4 PII handling

- The Tax Calculator and HRA calculator collect numeric salary data. Currently nothing leaves the browser. Make this explicit:
  - Add a "🔒 Calculated locally — your data never leaves your device" badge near each calculator's submit button.
  - Add a `<noscript>` notice that says the calculator requires JavaScript.

### 6.5 Content Security Policy

- The site has no CSP header (verify in `vite.config.ts` and any `_headers` / `vercel.json`). Add a strict CSP via meta tag:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';">
  ```
  Verify nothing breaks (Lucide-react inline SVGs are fine).

### 6.6 Dependency hygiene

Run `npm audit --omit=dev`. Lucide-react and React are clean as of Apr 2026. `dompurify` is used in `MarkdownRenderer` (not on this page) — pin its version.

---

## 7. Calculation correctness audit (P0)

### 7.1 GST Calculator — `pages/Resources/GSTCalculator.tsx`

| Issue | Line | Fix |
|---|---|---|
| `if (!amount) return …` treats `0` as missing — but `0` is a valid input for "remove GST" mode (gives `0/0`). | 11 | Use `if (amount === '' \|\| Number.isNaN(Number(amount)))`. |
| Inclusive mode divides by `(1 + rate/100)` without guarding `rate < 0` (impossible from UI today, but if a deep-link adds `?rate=-1`…) | 23 | Clamp `rate` to `[0, 100]` at top of `calculate()`. |
| The "Calculating GST on ₹0 at 18%" footer leaks the placeholder zero (`amount \|\| 0`) — see 3.7. | 129 | Render only when `amount` is set. |
| Floating-point can show `99.99` for small inputs. | 27 | Round at display time using `.toFixed(2)` consistently; current `toLocaleString({ maximumFractionDigits: 2 })` is fine but inconsistent across calculators. Standardise. |

### 7.2 HRA Calculator — `pages/Resources/HRACalculator.tsx`

| Issue | Line | Fix |
|---|---|---|
| `if (!basic \|\| !rentPaid \|\| !hraReceived)` returns `0,0` — but a valid case is `da=0`. The condition is correct only because each falsy guard checks **inputs**, not derived. However `cond2 = rentPaid - 0.10 * salary` can be **negative**; `Math.min(cond1, cond2, cond3)` would then yield negative — `Math.max(0, …)` saves us. ✅ | 21-26 | OK, but **add unit tests** in `HRACalculator.test.ts` covering: `(basic=0)`, `(rentPaid<0.10*salary)`, `(metro vs non-metro)`. |
| Year-vs-month confusion. The labels say "(Yearly)" but most clients have monthly slip data. | 63-101 | Add a "Convert from monthly" toggle that multiplies inputs by 12. |
| Bengaluru not in metro list (UI text 123). | 123 | Verify with the partner's policy and either add Bengaluru or keep with a footnote. |

### 7.3 CII Calculator — `pages/Resources/CIICalculator.tsx`

| Issue | Line | Fix |
|---|---|---|
| `useEffect(() => calculate(), [purchaseYear, saleYear, cost])` — but `calculate` is redefined every render and reads `ciiData` from closure. Eslint react-hooks rule should warn. | 28-30 | Wrap `calculate` in `useCallback` and include it in deps; or inline the logic in the effect. |
| Default sale year set inside an effect even though `ciiData` is a stable JSON. | 22-26 | Compute default in `useState(() => …)` initialiser, or use `useMemo` to avoid the second render. |
| Allows purchase year > sale year, then renders an error banner (132-136) but **also** renders a stale result. | 143 | Gate the entire result block on `purchaseYear <= saleYear`. |
| Year strings sort lexicographically; "2009-10" < "2024-25" string-wise — works for these formats but breaks if "2001-02" vs "1999-00" ever appears (it doesn't, but defensive). | — | Add a `compareFY` util that splits on `-` and compares numerically. |
| Result is rounded with `Math.round` but UI says "Inflation Benefit ₹X" — should also round to nearest ₹100 for "estimate" framing. | 45-47 | Optional. |

### 7.4 Tax Estimator — `components/TaxCalculator/useTaxCalculation.ts`

This is the biggest correctness surface on the page.

| Issue | Line | Fix |
|---|---|---|
| `getSurchargeRate` is hardcoded inside the file (150-156). The code path also pulls `config.surchargeSlabs` (`useTaxCalculation.ts:144-146`) but **only to sort**, never uses the values. So if `tax-config.json` updates surcharge thresholds, the engine ignores them. | 144-156 | Drive surcharge rates from `config.surchargeSlabs` directly. Add `rates: { '50L': 0.10, '1Cr': 0.15, '2Cr': 0.25, '5Cr': 0.37 }` to `tax-config.json` and read from it. |
| Marginal-relief calc for 87A new regime (124-128) only handles the case `tax > excessIncome`. Edge case: when `tax <= excessIncome`, no relief is needed, but `marginalRelief87A` stays 0 ✅. However, `taxAfterRebate = max(0, tax - rebate - marginalRelief87A)` then **double counts** when both rebate and marginal relief equal tax (impossible in practice but worth a guard). | 119-137 | Compute `taxAfterRebate = Math.max(0, tax - Math.max(rebate, marginalRelief87A))`. |
| `cess = (tax + surcharge - rebate - marginalRelief) * 0.04`. Cess is computed on `finalTaxBeforeCess` (line 202-203). ✅ | 202-203 | OK. |
| The reducer-state for the comparison panel still toggles "regime" (`SET_REGIME`) but never uses the user's choice for an actual recommendation. The recommendation is purely automatic (`useTaxCalculation.ts:233-242`). Confusing UX: the user toggles between Old/New, but their "vote" doesn't change anything. | — | Re-design: drop the toggle, show both side-by-side, or label the toggle "View breakdown for: New / Old" with "Recommendation: New" highlighted. |
| `IncomeInputs.tsx:84` — `value === ''` early exits to `0`, but `Number('')` is `0` already. The branch is dead code. | 84 | Remove. |
| LTCG / STCG aren't separated from "Capital Gains". Old/New regime tax both apply slab rates to the whole figure — this **understates** tax for LTCG @ 12.5% (Sec 112A) and **overstates** for those who only have LTCG below ₹1.25 L. | — | Add two LTCG/STCG fields under Capital Gains, compute Sec 112A separately. (Big task — file as a follow-up ticket if outside this PR's scope.) |
| Old-regime senior-citizen exemption uses `config.oldRegimeConfig.exemptions[age]` (line 35). If a deep-link sets `ageGroup` to an invalid string, fallback is `below60`. ✅ | 35 | OK. |
| Hard-coded surcharge 37%/25% (line 151). New regime caps at 25% — already handled. But the **new regime** also has a 25% cap above ₹2 Cr per Finance Act 2023, and we currently apply 25% only above ₹2 Cr ✅. Confirm with Sagar that the cap rules still match FY 2025-26 / AY 2026-27. | 151 | Verify and write a unit test. |

**Action.** Add unit tests in `components/TaxCalculator/taxLogic.test.ts` (file already exists — extend it) covering at minimum:
- `(salary=600000, age=below60, regime=new)` → `tax = 0` (rebate).
- `(salary=1200000, age=below60, regime=new)` → still 0 (rebate at ₹12 L cap).
- `(salary=1200001)` → marginal relief kicks in.
- `(salary=5500000)` → 10% surcharge applies; verify exact rupee.
- `(salary=200000000)` → 25% surcharge (new regime cap).
- `(salary=10000000, deductions={d80c:150000, d80d:25000, hra:200000})` old regime — verify.

### 7.5 Compliance Calendar — `pages/Resources/ComplianceCalendar.tsx`

| Issue | Line | Fix |
|---|---|---|
| `nextDeadline` calculation iterates every event every render (62-87). With ~60 events that's fine, but make sure the `useMemo` is **actually** stable: dependency is `[calendarData, sortedMonths]` ✅. | 62-87 | OK. |
| `now` is created inside `useMemo` using `new Date()` — when the user opens the page on Apr 28 23:59 and reads it past midnight, the banner is stale. | 65 | Add an effect that refreshes a `Date.now()` ticker every 60 minutes. |
| `Math.ceil(diffTime / 86400000)` for "X Days left" rounds up so 1.01 days shows as "2 days". | 127 | Use `Math.floor` and consider returning "Today" when `diffDays === 0`, "Tomorrow" when `===1`. |
| `getUrgencyClass` re-creates a `Date` for every event in every render (89-104). | — | Pre-compute once per `monthKey/day` in a `useMemo` keyed by `[sortedMonths, calendarData, now-bucket]`. |
| If the JSON has a year that's already past (e.g., `2024-12`), the calendar still renders the section. Confirm intent — for the FY 2025-26 calendar this is fine, but the UI offers no year selector. | — | Add an "Archive" toggle that hides past months, defaulted ON. |

### 7.6 TDS Rate Chart — `pages/Resources/TDSRateChart.tsx`

| Issue | Line | Fix |
|---|---|---|
| `filterRates` is recreated on every render (31-35). Memoise. | 31-35 | `useCallback`. |
| Tab list at 165-182 uses `<button>` with `onClick` setting `activeTab`. Same a11y issue as the sidebar (5.1). Convert to a small Tabs primitive. | — | See 5.1. |
| `currentData` builds even when `tdsData` is null (`getCurrentData` returns `[]`). Fine, but when `searchTerm` is non-empty and zero matches are shown, a screen reader has no announcement. | 47, 90-94 | Wrap empty-state in `aria-live="polite"`. |

### 7.7 CII Table — `pages/Resources/CIITable.tsx`

| Issue | Line | Fix |
|---|---|---|
| Table has no `<caption>` — screen-reader users get a table with no name. | 36 | Add `<caption className="sr-only">Cost Inflation Index — base year 2001-02 = 100</caption>`. |
| `key={idx}` on rows (44) — row order is stable from JSON, OK, but using `row.fy` is more robust. | 44 | `key={row.fy}`. |

---

## 8. Performance audit

### 8.1 Code splitting

- All nine tab components are imported eagerly at the top of `pages/Resources.tsx`. Even if a user only uses the GST calculator, the bundle includes the Tax Calculator (heaviest), Compliance Calendar, and ImportantLinks data.

**How to fix.**
```tsx
const TaxCalculator       = React.lazy(() => import('./Resources/TaxCalculator'));
const GSTCalculator       = React.lazy(() => import('./Resources/GSTCalculator'));
// …same for the rest
```
Wrap the panel in `<Suspense fallback={<ResourcesSkeleton />}>`. Combine with the route split in 3.1 — Vite will create a chunk per route.

### 8.2 Duplicate fetches

- `useResourceData('cii-data.json')` is called by `CIITable.tsx:13` and `CIICalculator.tsx:14`. If the user visits both tabs, the JSON is fetched twice.
- Same for `compliance-calendar.json` (single consumer today) and `tds-rates.json` (single consumer).
- `useTaxConfig()` is called once but has no module-level cache.

**How to fix.** Add a module-level `Map<string, Promise<unknown>>` cache:
```ts
const cache = new Map<string, Promise<unknown>>();
function getJson<T>(url: string): Promise<T> {
  if (!cache.has(url)) cache.set(url, apiClient.get<T>(url));
  return cache.get(url) as Promise<T>;
}
```
Wire this into `useResourceData`. Pattern is already used by `hooks/useInsights.ts:8` (`insightsPromise`) — replicate.

### 8.3 HTTP caching

- Static JSON in `/public/data/*` is served by Vercel/Netlify with default headers. Add a `vercel.json` (or `_headers` for Netlify):
  ```json
  { "source": "/data/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=300, stale-while-revalidate=86400" }] }
  ```

### 8.4 Image / icon weight

- Lucide icons are tree-shaken so each named import is fine. ✅
- No images on this page. ✅

### 8.5 Re-renders

- `pages/Resources.tsx:41-52` — `NavItem` is **declared inside** the `Resources` function body. Every render re-creates the component identity, so React unmounts/remounts the button and Lucide icon. Move `NavItem` outside `Resources` or memoise with `React.memo`.
- `TaxCalculator/index.tsx` uses `useReducer` and `useMemo` correctly. ✅
- `ComplianceCalendar.tsx` — `filteredEvents` is computed inside the map without `useMemo` (183-186). Cheap, but for consistency wrap.

### 8.6 Bundle audit

- Add a `npm run build && npx vite-bundle-visualizer` step. Verify `react-markdown` is **not** in this page's chunk after route split (it should be article-only).
- `lucide-react` named imports: confirm tree-shaking is on (it is, since `pages/Resources.tsx:3` uses named imports). ✅

---

## 9. SEO audit

### 9.1 Per-tab metadata

- Currently only `pages/Resources.tsx:56-60` defines SEO. After route split (3.1), each tab needs its own SEO. Suggested copy:
  - `/resources/income-tax` — *"Income Tax Calculator AY 2026-27 — Old vs New Regime | Sagar H R & Co."*
  - `/resources/gst-calc` — *"GST Calculator (Inclusive / Exclusive) | Sagar H R & Co."*
  - `/resources/hra-calc` — *"HRA Exemption Calculator | Sagar H R & Co."*
  - `/resources/cii-calc` — *"Capital Gains Indexation (CII) Calculator | Sagar H R & Co."*
  - `/resources/cii-table` — *"Cost Inflation Index Table FY 2001-02 to 2025-26 | Sagar H R & Co."*
  - `/resources/calendar` — *"Compliance Calendar FY 2025-26 — GST, TDS, Income Tax, ROC | Sagar H R & Co."*
  - `/resources/tds-rates` — *"TDS & TCS Rate Chart AY 2026-27 | Sagar H R & Co."*
  - `/resources/checklist` — *"Document Checklists for Tax Filing | Sagar H R & Co."*
  - `/resources/links` — *"Important Government Tax Portals | Sagar H R & Co."*

### 9.2 Structured data (JSON-LD)

- The current schema (`pages/Resources.tsx:22-39`) is a `CollectionPage` with two `hasPart`. Expand to include all calculators as `SoftwareApplication` and the calendar / TDS / CII as `Dataset`. Each should also include `aggregateRating` if reviews are ever collected.
- For the Compliance Calendar, expose `Event[]` JSON-LD per deadline (`startDate`, `name`, `eventStatus`). Use a build step in `generate-sitemap.js` to inline these into the prerendered HTML.
- Add `BreadcrumbList` JSON-LD per route.

### 9.3 Sitemap

- `generate-sitemap.js` likely doesn't list `/resources/*` sub-routes. Update it after route split.

### 9.4 Crawlability

- The Resources page renders **everything client-side**. Without SSR, Googlebot still indexes (it runs JS), but consider pre-rendering with `vite-plugin-prerender` for the calculator landing pages — they're high-intent search targets ("HRA calculator India").

### 9.5 Internal linking

- Add cross-links: from the Compliance Calendar's "Quarterly Return (Q1)" event, link to `/resources/tds-rates`. From the HRA calculator results, link to `/insights?category=Salary`.
- The site footer already links to `/resources` once — add direct deep-links to the top three (Tax, GST, Calendar).

---

## 10. Code-quality audit

### 10.1 Linting / typing

- `pages/Resources.tsx:41` — `icon: any`. Use `icon: LucideIcon` from `lucide-react`.
- `useResourceData.ts:15`, `useTaxConfig.ts:16` — `(import.meta as any)?.env?.BASE_URL`. Either define `vite-env.d.ts` types so `import.meta.env.BASE_URL` is typed, or use `import.meta.env.BASE_URL` directly (Vite default).
- `ChecklistGrid.tsx:7`, `Resources.tsx:5` — `import * as ReactRouterDOM from 'react-router-dom'` then destructure. Switch to direct named imports: `import { Link } from 'react-router-dom'`.
- `HRACalculator.tsx`, `GSTCalculator.tsx` — empty `<div className="group">` wrappers (e.g. line 56) are dead. Remove.

### 10.2 File structure

- The `pages/Resources/` folder mixes "calculator components" and "data tables". Reorganise once routes exist:
  ```
  pages/resources/
    layout.tsx                    (the shell — was Resources.tsx)
    index.tsx                     (redirect or hub overview)
    income-tax/page.tsx
    gst-calc/page.tsx
    …
  ```
- Move shared building blocks (Card, ResultPanel, NumberInput, RegimeBadge) into `components/resources/`.

### 10.3 Tests

- `taxLogic.test.ts` exists — extend per 7.4.
- Add `GSTCalculator.test.tsx`, `HRACalculator.test.tsx`, `CIICalculator.test.tsx` with the cases listed in §7.
- Add a Cypress / Playwright test that:
  - Loads `/resources/income-tax`, fills inputs, clicks Calculate, asserts result.
  - Switches tab via keyboard arrow keys (after a11y fix).
  - Prints the page (Playwright `page.emulateMedia({ media: 'print' })`) and asserts the dark panel becomes light.

### 10.4 Constants

- `constants/resources.ts:33-41` — `TDS_DUE_DATES_SUMMARY` is a hand-typed string. Move into `public/data/tds-rates.json` so it can be updated without a redeploy. Same for `IMPORTANT_LINKS` (33).
- `constants/resources.ts:43-211` — `CHECKLIST_DATA` uses inline markdown-bold (`**`). Move to `.md` files under `public/content/checklists/<slug>.md` and have `pages/ChecklistDetail.tsx` fetch + render with the existing `MarkdownRenderer`.

### 10.5 Logger / console noise

- `MarkdownRenderer.tsx:17` warns to console on legacy HTML. The Insights md files all start with `<p>` so this fires on every article render — but doesn't affect Resources page directly. (See AUDIT_ARTICLE_PAGE.md.)
- `TDSRateChart.tsx:51` calls `navigator.clipboard.writeText` and immediately toasts success — no error path. (See 6.3.)

### 10.6 Dead imports

- `pages/Resources.tsx:3` — `Calendar` is imported (line 3) and used (93). ✅
- `ComplianceCalendar.tsx:3` — every icon used. ✅
- `TDSRateChart.tsx:3` — `Check` and `FileText` imported but unused. Remove.

### 10.7 Comments / docs

- `useTaxCalculation.ts:148-149` has a comment that describes the surcharge rules in prose. Move that into a markdown reference (`docs/tax-rules-fy-2025-26.md`) so the partner can verify against statute. Reference from JSDoc.

---

## 11. Mobile & responsive audit

### 11.1 Breakpoints

| Component | < 640 | 640-1024 | ≥ 1024 |
|---|---|---|---|
| Resources shell | sidebar hidden, content full-width | same | sidebar 1/4 + content 3/4 |
| Tax Calculator | stacked input then results | same | inputs 7/12, results sticky 5/12 |
| GST | stacked | side-by-side `md:` | same |
| HRA | stacked | stacked then `lg:` two-col | two-col 7/5 |
| CII Calc | stacked | stacked | two-col |
| Calendar | stacked (works) | works | works |
| TDS | mobile cards (works) | desktop table | same |
| Checklist | one col | two col | two col |

The big mobile gap is **no tab switcher below `lg`**. Address per 4.1.

### 11.2 Touch targets

- Sidebar `NavItem` is `py-3 px-4` ≈ 44 px tall ✅.
- Calendar legend pills (`ComplianceCalendar.tsx:241-253`) are `py-1.5 px-3` ≈ 28 px — below the 44 px guideline. Bump to `py-2 px-3.5`.
- TDS Copy button (53 → `p-2`) ≈ 32 px — below 44. Bump or hide on mobile (the row already has `:hover` but mobile has no hover, so it's invisible anyway).

### 11.3 Viewport

- `index.html` (out of scope) should have `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` — verify.
- `pt-32` / `top-32` assume a fixed header height; on iOS Safari the dynamic toolbar hides this and reveals an awkward jump. Use `padding-top: calc(env(safe-area-inset-top) + var(--header-h))`.

### 11.4 Keyboard on mobile

- `inputMode="decimal"` and `pattern="[0-9]*"` are missing on every `<input type="number">`. Add. (See 5.2.)

---

## 12. Internationalisation / localisation

The site is single-language (English) but uses `toLocaleString('en-IN')` for currency. Tighten:
- Standardise on `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`. Drop hand-typed `₹ ` prefixes.
- Date formatting in `ComplianceCalendar.tsx:125` uses `'en-US'` — should be `'en-IN'`.
- Time-zone: `nextDeadline` uses `new Date()` (browser local). For an Indian user in another country (NRI checking from Dubai), the deadline could appear off by a day. Consider always evaluating in `Asia/Kolkata` (Intl.DateTimeFormat with `timeZone: 'Asia/Kolkata'`).

---

## 13. Analytics / observability

- No analytics calls visible on this page. Once routes exist, fire a `pageview` per tab so we know which calculators are actually used. Recommended: a thin `track('event', { name: 'resource_tab_view', tab })` wrapper in `utils/analytics.ts` gated by env.
- Track form-completion rates: `tax_calculator_started`, `tax_calculator_calculated`, `tax_calculator_printed`. Same for GST/HRA/CII.
- Capture errors from `useResourceData` to Sentry (if added) — currently only goes to `logger.error`.

---

## 14. Concrete change list (Codex execution checklist)

Order matters — earlier items unblock later ones.

**P0 — Correctness & data safety**

1. `components/TaxCalculator/useTaxCalculation.ts` — drive surcharge rates from `tax-config.json`; add unit tests (§7.4).
2. `pages/Resources/CIICalculator.tsx:28-30` — gate calc on `purchaseYear <= saleYear`; convert `calculate` to `useCallback`; default sale year via `useState(() => …)`.
3. `pages/Resources/GSTCalculator.tsx:11-28` — replace `if (!amount)` with `''/NaN` check; clamp rate; round at display.
4. `pages/Resources/HRACalculator.tsx` — add monthly/yearly toggle; add unit tests.
5. Add a shared `useNumericInput` helper, replace every `<input type="number">` with it, and add `inputMode="decimal" pattern="[0-9]*"` everywhere (§5.2).
6. Associate every `<input>` with its `<label>` via `id`/`htmlFor` (§5.5).

**P0 — A11y & ARIA**

7. `pages/Resources.tsx` — convert sidebar to a route-driven `<NavLink>` `<nav>` (§3.1, §5.1) **OR** fall back to the Tabs ARIA pattern.
8. Wrap empty-states / next-deadline banners in `aria-live="polite"` (§5.4, §7.6).
9. Audit every Lucide icon for `aria-hidden="true" focusable="false"` (§5.7).
10. Tooltip refactor — keyboard accessible, Esc-dismissible (§5.3).

**P1 — Routing & deep-linking**

11. React-Router nested routes for `/resources/*`. Update `generate-sitemap.js`, per-route SEO, and BreadcrumbList JSON-LD (§3.1, §9.1).
12. Add per-route session-storage persistence (§3.2).
13. Code-split each tab with `React.lazy` (§8.1).
14. Add module-level fetch cache in `useResourceData` (§8.2).

**P1 — Print fidelity**

15. Calendar accordion: open all in print (§3.6).
16. GST/HRA/CII/Tax results: `print:bg-white print:text-black print:border print:border-black` (§3.6).
17. TDS chart: hide Copy column in print (§3.6).
18. Important Links: print URL in parentheses; hide arrow (§3.6).

**P1 — UX polish**

19. Mobile tab switcher (horizontal scrollable pills) (§4.1, §11.1).
20. Replace hand-rolled buttons with `components/ui/Button` (§4.2).
21. Add Retry button to error states (§3.5).
22. Microcopy fixes (§3.7).
23. Add reduced-motion guard globally (§4.5, §5.9).

**P2 — Code quality**

24. `pages/Resources.tsx:41` — extract `NavItem` outside; type `icon: LucideIcon` (§8.5, §10.1).
25. Remove dead imports (`TDSRateChart.tsx:3`) (§10.6).
26. Standardise currency formatting (§12).
27. Move `IMPORTANT_LINKS`, `TDS_DUE_DATES_SUMMARY`, `CHECKLIST_DATA` from `constants/resources.ts` to JSON / markdown so non-dev edits don't require a redeploy (§10.4).
28. Add CSP meta tag (§6.5).
29. Add `referrerPolicy="no-referrer"` to external links (§6.1).
30. Add Cache-Control headers for `/data/*` (§8.3).

**P2 — Tests & telemetry**

31. Extend `taxLogic.test.ts`; add component tests for GST/HRA/CII (§10.3).
32. Add Playwright tests for routing, keyboard nav, print, mobile (§10.3).
33. Wire analytics (§13).

---

## 15. Acceptance criteria for Codex's PR

- [ ] All P0 items closed; tests added for §7.
- [ ] All routes resolve; refresh on `/resources/hra-calc` lands on the HRA tab.
- [ ] axe-core (or Lighthouse a11y) score ≥ 95 on every `/resources/*` route.
- [ ] Lighthouse Best-Practices ≥ 95.
- [ ] Lighthouse SEO ≥ 95 on every `/resources/*` route.
- [ ] Lighthouse Performance ≥ 90 on `/resources/income-tax` (mobile, simulated).
- [ ] No console warnings on initial page load (legacy-HTML warn from MarkdownRenderer is article-only).
- [ ] Print preview of `/resources/income-tax` looks identical to the existing letterhead style; print preview of every other route shows the full content with no white-on-white.
- [ ] Sitemap contains all nine routes.
- [ ] No new `any` types in TypeScript.
- [ ] All `<input>`s have `id`/`htmlFor`.
- [ ] Bundle size on `/resources` initial chunk drops by ≥ 30 % vs. baseline (measure with `vite-bundle-visualizer` before & after).

---

## 16. Open questions for Sagar (block these before merging)

1. **Bengaluru as HRA-metro?** UI today says only Delhi, Mumbai, Kolkata, Chennai. Confirm policy.
2. **AY 2026-27 surcharge cap on new regime — 25% above ₹2 Cr?** Verify against Finance Act 2025 final text.
3. **LTCG separation in Tax Estimator — in scope for this round, or follow-up?**
4. Default landing tab — keep Income Tax, or move Compliance Calendar to default during March/April?
5. Is the firm OK with `sessionStorage` persistence of user inputs (no PII leaves the browser)?
6. Will we pre-render with `vite-plugin-prerender` (better SEO) or stay client-rendered?

---

*End of Resources page audit.*
