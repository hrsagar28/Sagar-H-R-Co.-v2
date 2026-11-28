# AUDIT-REVIEW.md — end-to-end audit of casagar.co.in

## 1. Summary

- **Commit audited:** `dec45eb098b2fe101c25c78dc1cd30cf26b76bb4` on `main` ("Merge pull request #24 from hrsagar28/fix/link-preview-text", 8 October 2026, 18:17 IST), fetched fresh from GitHub for the audit. **Note:** the copy on your computer (`C:\Dev\Sagar-H-R-Co.-v2`) is one merge behind, at `1544ab4` (PR #23); it was not pulled, because the rules forbid changing files there. The live site serves the same hashed asset files as a build of `dec45eb` (for example `assets/index-C5uAh8CJ.js`, `assets/RedesignLayout-gLAvCIGB.js`), so the live site and the audited commit match.
- **Date of audit:** 8 October 2026.
- **Verdict:** sound. Nothing blocks use of the site: every page renders at every width without horizontal overflow, the forms work, the security headers are strict, the toolchain passes typecheck, lint, 187 tests and the build. The defects found are real but contained: four are High, none is a Blocker. Two of the four High items are matters of the ICAI rules rather than of code.
- **Counts by severity:** Blocker 0 · High 4 · Medium 11 · Low 17 · Nit 5 — 37 findings.
- **The ten findings that matter most, in order:**
  1. **SEO-02** — A link to any page other than the home page, pasted into WhatsApp or any other app that does not run JavaScript, previews with the home page's title, description and picture, because every address is served the same `index.html`. (High)
  2. **ICAI-02** — The browser-tab icon, the Apple home-screen icon and `logo.png` (declared as the firm's logo in the page's structured data) are a stylised "S": the firm's initial as a monogram, which the Code of Ethics 2026 prohibits for firms. (High)
  3. **A11Y-01** — On about 33 pages, links inside sentences are the same colour as the text and have no underline, so they cannot be told from ordinary text (WCAG 1.4.1). (High)
  4. **PRINT-01** — Printing the FAQ page gives the nine section headings and not one of the 35 questions or answers; the careers roles and the home page's three questions print the same way. (High)
  5. **ICAI-01** — The home page's structured data declares `priceRange: "₹₹"`, a fee indication, which the ICAI advertisement rules do not allow. (Medium)
  6. **SEO-01** — Every page carries two `<title>` elements and two of each description and social tag (the home page's static ones and the page's own); the home page's description comes first. (Medium)
  7. **UX-01** — The back button returns to the top of the previous page, never to where the reader was. (Medium)
  8. **PERF-01** — The hashed JavaScript, CSS and font files are served with `max-age=0`, so every visit re-asks the server for each of them. (Medium)
  9. **SEC-01 / SEC-02** — The build is pinned to Node 20, which reached end of life in April 2026, and `npm audit` reports advisories in `react-router` that `npm audit fix` resolves without a breaking change. (Medium)
  10. **A11Y-02** — The keyboard focus ring is copper on the light grounds, 2.3–2.7:1, below the 3:1 that WCAG 1.4.11 requires. (Medium)

## 2. Map of the site

**What it is.** A single-page React application (React 19, Vite 5, TypeScript, React Router 7 with `BrowserRouter`) for Sagar H R & Co., Chartered Accountants, Mysuru, deployed on Netlify at https://casagar.co.in. It has 47 addresses, all listed in the sitemap, plus a "page not found" screen for anything else.

**The pages and what each is for.**

| Address                             | Page                                                            | Purpose                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (and `/#about`)                 | `pages/Home.tsx` + `pages/home/*`                               | The home page, which is also the About page: the firm's name and two ways to get in touch; a sideways-scrolling strip of due dates from today to the end of next month; the services by group; the firm, its proprietor and how an engagement runs (`#about`); the latest three articles beside three FAQs; an old-to-new section-number picker; the office with its map. |
| `/services`                         | `pages/Services.tsx`                                            | The fourteen services in four groups, and the kinds of client.                                                                                                                                                                                                                                                                                                            |
| `/services/<slug>` (14)             | `pages/ServiceDetail.tsx`                                       | One service: intro, frequency, common questions (links into the FAQ), scope of work, documents needed, other services, "Ask us" band. Three retired slugs redirect.                                                                                                                                                                                                       |
| `/insights`                         | `pages/Insights.tsx`                                            | The articles, newest first.                                                                                                                                                                                                                                                                                                                                               |
| `/insights/<slug>` (5)              | `pages/InsightDetail.tsx`                                       | One article, in the document layout (`LegalPage`), with a share link, small print and three related articles.                                                                                                                                                                                                                                                             |
| `/faqs`                             | `pages/FAQ.tsx`                                                 | 35 questions in nine sections, with search, topic filter, deep links (`#question-id`, `#section`) and a phone section picker. `/faq` redirects here.                                                                                                                                                                                                                      |
| `/resources`                        | `pages/Resources.tsx`                                           | Index of the seven tools, eleven checklists and government portals, with search and filter; the next four due dates in the header.                                                                                                                                                                                                                                        |
| `/resources/<tool>` (7)             | `pages/ResourceTool.tsx` → `pages/ResourceTools/*`              | Income tax, HRA, capital gains and GST calculators; TDS/TCS rates; due dates (with an `.ics` download); old-to-new section finder. Each prints as an estimate or a sheet.                                                                                                                                                                                                 |
| `/resources/checklist/<slug>` (11)  | `pages/ChecklistDetail.tsx`                                     | What to send the firm for one kind of work; printable.                                                                                                                                                                                                                                                                                                                    |
| `/careers`                          | `pages/Careers.tsx` + `components/redesign/ApplicationForm.tsx` | Open roles (two, closing 31 December 2026), "Working here", and an application form.                                                                                                                                                                                                                                                                                      |
| `/contact`                          | `pages/Contact.tsx`                                             | Phone, WhatsApp, email, the contact form, the office map, hours and "After you get in touch".                                                                                                                                                                                                                                                                             |
| `/privacy`, `/terms`, `/disclaimer` | `pages/Privacy.tsx`, `Terms.tsx`, `Disclaimer.tsx`              | Legal documents in the `LegalPage` layout (numbered sections, contents list, "Last updated 8 October 2026").                                                                                                                                                                                                                                                              |
| anything else                       | `pages/NotFound.tsx`                                            | "Page not found", also shown by ServiceDetail, ResourceTool, ChecklistDetail and InsightDetail with their own titles for an unknown slug.                                                                                                                                                                                                                                 |

**What is shared.** Every page renders inside `components/redesign/RedesignLayout.tsx`: the top bar (`RdHeader.tsx`: wordmark, five links, "Contact us", a phone button and a full-screen phone menu portalled to `<body>`), a slim sticky bar that slides in on scroll-up, and the footer (`RdFooter.tsx`: address, FRN, link columns, the firm name set large as a decoration, legal links, staff portal link, "Back to top"). `App.tsx` adds the skip link, `RouteHandler` (scroll to top, focus `#main-content`, screen-reader announcement on every route change), a top progress line, the offline bar, the first-visit splash (`Preloader.tsx`, once per tab, not under reduced motion), the custom cursor (mouse users, motion allowed), toasts, and two error boundaries. `components/SEO.tsx` writes the per-page `<title>`, description, canonical, Open Graph/Twitter tags and JSON-LD (React 19 document metadata). All page styling is in one plain-CSS file, `components/redesign/redesign.css` (5,256 lines, every rule scoped under `.rd`); `index.css` holds the fonts, the shared pieces (toasts, loaders, error screens), focus, print and reduced-motion rules, and the cursor; Tailwind styles only the shell files listed in `tailwind.config.ts`.

**Where the content comes from.** Static data in `constants/` (services, FAQs, careers, the Resources calendar, rates, section maps, checklists), `config/contact.ts` (address, phone, email, WhatsApp link, map coordinates, FormSubmit endpoint, FRN, membership number) and `components/redesign/content.ts` (menu and footer links, hours, legal "last updated" date). The articles are the exception: the list is fetched at run time from `public/data/insights.json` and each body from `public/content/insights/<slug>.md`, rendered with `react-markdown` + `rehype-sanitize`. Legal text is written directly in the three page files. There is no CMS and no server; the only outbound requests are the Google map iframe and the two forms, which post from the browser to FormSubmit.

**How it is built and deployed.** `npm run build` runs four `tsx` scripts (regenerate the PNG icons from `favicon.svg`; check the CSP hash of the inline `<style>` in `index.html` and the preload colours; generate `sitemap.xml`, `rss.xml` and `atom.xml`; generate the founder's responsive images with `sharp`) and then `vite build` (manual vendor chunks: `react-vendor`, `ui-vendor`, `markdown-vendor`; React Compiler in annotation mode, currently opted into by no file). GitHub Actions runs lint, typecheck, tests and the build on every push and PR; Husky runs lint-staged and `tsc` before each commit. Pushing to `main` deploys to Netlify. `netlify.toml` holds the SPA fallback, 301 redirects for `/faq`, `/about`, retired articles and retired service slugs, the security headers (CSP with a hashed inline style, HSTS, COOP/CORP, Permissions-Policy, X-Frame-Options), and cache headers for `/data/*`, `/content/*` and `/og/*`. A Netlify function (`netlify/functions/csp-report.ts`) receives CSP violation reports.

**What the tests cover.** 19 Vitest files, 187 tests, all passing (jsdom): the calculator arithmetic (GST, HRA, capital gains, income tax, advance tax and interest, the `.ics` file) and the due-date calendar; render tests for every page type, including axe-core accessibility runs on Home, Services, ServiceDetail, Insights, InsightDetail, NotFound, Resources and every tool; the Contact and Careers forms (validation, honeypot, rate limit, FormSubmit refusal, success state); FAQ search, filter, keyboard and deep links; legal-page contents and scroll-spy; the splash; the shared pieces; cursor modes; the markdown helpers; the validation helpers. Not covered by tests: `RdHeader`/`RdFooter` (menu, focus trap, sticky bar), `SEO.tsx`'s output, `App.tsx`'s `RouteHandler`, `useFormDraft`, `useRateLimit`, the build scripts, the TDS rates page, ChecklistDetail, and the CSP report function.

**Checks run for Phase 1.** `npm ci`: clean. `npx tsc --noEmit`: passes. `npm run lint`: 0 errors, 9 warnings (listed under Code health). `npx vitest --run`: 187/187 pass (with a harmless jsdom "HTMLCanvasElement.getContext not implemented" message from axe). `npm run lint:schema`: passes. `npx vite build`: succeeds (largest chunks: `react-vendor` 230 kB / 73 kB gzip, `markdown-vendor` 179 kB / 55 kB gzip, `index` 87 kB / 28 kB gzip, `RedesignLayout` CSS 77 kB / 15 kB gzip). `npm audit`: 24 vulnerabilities reported (2 critical, 16 high), all in build/test tooling and `react-router`; see Security. Every page was opened in a headless Chromium at 360, 390, 768, 1024, 1440, 1920 and 2560 px from the local build (and at 320 px for the reflow check), with automated overflow, console, axe, heading and target-size checks; Lighthouse 12 was run on six pages of the local build (mobile and desktop); the live site was opened in your Chrome for headers, redirects, caching and spot checks. Every fix below was applied to a scratch copy of the repository, which then passed typecheck, lint, the 187 tests and the build; the behaviour of each fix was then checked in a browser against a build of that copy. Nothing in your repository was changed except this file.

## 3. Findings

Severity: Blocker (site unusable or unlawful) · High (visitors or the firm are harmed now) · Medium (a real defect with a workaround or a narrow audience) · Low (quality, no visitor harmed) · Nit (cosmetic). Confidence: Confirmed (reproduced in a browser or shown in the code) · Likely (the code shows it; the effect depends on an interpretation) · To confirm (needs a source I could not reach, or your decision).

Each diff is against commit `dec45eb` and was checked with `git apply --check`. None has been applied to your repository.

### 3.1 Design and layout

#### DES-01 — Office hours wrap "pm" onto a second line at 360 px

- **Severity:** Low — only the narrowest phones, and the text stays readable.
- **Confidence:** Confirmed.
- **Where:** `/contact`, the "Office hours" table, at 360 px wide; `components/redesign/redesign.css` lines 854–857 (`.rd .hours td`).
- **What happens:** The cell "10:00 am – 8:00 pm" breaks after "8:00", leaving "pm" alone on a second line. At 390 px and above it fits on one line (measured: the cell is 68 px tall at 360 px, 43 px at 390 px).
- **Why it matters:** The row reads as two values.
- **Fix:**

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -854,6 +854,7 @@
 .rd .hours td {
   text-align: right;
   font-variant-numeric: tabular-nums;
+  white-space: nowrap; /* "10:00 am – 8:00 pm" on one line at 360 px */
 }
 .rd .hours tr.today th,
 .rd .hours tr.today td {
```

- **Effort:** small. **Risk:** none seen; after the fix the table is 328 px wide at 360 px with no horizontal overflow (the day name wraps instead, which is the intended behaviour of a `th`).
- **Test to add:** none; a screenshot comparison at 360 px would catch a regression if you ever add one.

#### DES-02 — Careers role line reads "Full time ·1 to 2 years’ experience"

- **Severity:** Nit.
- **Confidence:** Confirmed (rendered text copied from the page).
- **Where:** `pages/Careers.tsx` line 181.
- **What happens:** The separator is written as `' ·'` and the next `<span>` starts immediately, so there is a space before the dot and none after: "Full time ·1 to 2 years’ experience", "Articleship ·For CA students".
- **Why it matters:** It looks like a typo on the page where the firm presents itself to applicants.
- **Fix:**

```diff
--- a/pages/Careers.tsx
+++ b/pages/Careers.tsx
@@ -178,7 +178,7 @@
                           {role.meta.map((part, index) => (
                             <span key={part}>
                               {part}
-                              {index < role.meta.length - 1 ? ' ·' : ''}
+                              {index < role.meta.length - 1 ? ' · ' : ''}
                             </span>
                           ))}
                         </span>
```

- **Effort:** small. **Risk:** none. After the fix the text is "Full time · 1 to 2 years’ experience".
- **Test to add:** in `pages/Careers.test.tsx`, assert that the role meta text contains `" · "`.

#### DES-03 — TDS rates on a phone: the folded groups get the class `secfold` instead of `sec fold`

- **Severity:** Low — the page works; two rules written for it never apply.
- **Confidence:** Confirmed (rendered class names read from the page at 360 and 390 px).
- **Where:** `pages/ResourceTools/TDSRates.tsx` line 103; `components/redesign/redesign.css` lines 3546–3548 (`.rd .sec.fold + .sec.fold`) and the phone rules for `.rd .sec` at 1529–1538.
- **What happens:** `className={`sec${closable ? 'fold' : ''}`}` has no space, so on a phone each group section is `<section class="secfold">`. It therefore matches neither `.rd .sec` (which sets `scroll-margin-top: 64px` and the 48 px gap between sections on a phone) nor `.rd .sec.fold + .sec.fold` (the intended 2 px gap). The five folded headings render as one unbroken sand block.
- **Why it matters:** The styling written for this layout is dead, and anything added to `.rd .sec` later will silently miss this page on phones.
- **Fix:**

```diff
--- a/pages/ResourceTools/TDSRates.tsx
+++ b/pages/ResourceTools/TDSRates.tsx
@@ -100,7 +100,7 @@
           const closable = phone && !query && group === 'all';
           const open = !closable || opened.has(item.id);
           return (
-            <section key={item.id} className={`sec${closable ? 'fold' : ''}`} aria-labelledby={`rates-${item.id}`}>
+            <section key={item.id} className={`sec${closable ? ' fold' : ''}`} aria-labelledby={`rates-${item.id}`}>
               <div className="sec-h">
                 <h2 id={`rates-${item.id}`}>
                   {closable ? (
```

- **Effort:** small. **Risk:** the folded groups gain the 2 px separation and the `.sec` scroll margin; checked at 360 px after the fix (`sec fold`, `margin-top: 2px` from the second group on).
- **Test to add:** a render test for `TDSRates` at a phone width (`window.matchMedia` mocked to match) asserting `section.sec.fold` exists.

#### PRINT-01 — Printing the FAQ, careers and home-page accordions loses the questions and answers

- **Severity:** High — the FAQ is the page a client is most likely to print, and the printout is empty of content.
- **Confidence:** Confirmed (printed to PDF from the local build: the FAQ gives two pages of nine section headings and their one-line descriptions, then the footer; not one question).
- **Where:** `index.css` lines 96–105 (the print rule hides every `button`); `pages/FAQ.tsx` lines 181–185 and 633–648 (answers are mounted only once a question has been opened); `components/redesign/redesign.css` 709–716 (`.rd .ans` is `grid-template-rows: 0fr` until `.qi.open`); the same `.qb`/`.ans` markup in `pages/Careers.tsx` 166–176 and `pages/home/HomeFaqs.tsx` 35–55.
- **What happens:** Each question is a `<button class="qb">` inside an `<h3>`. The site-wide print stylesheet hides all buttons, so the questions vanish; the answers are collapsed to zero height, and on the FAQ page the ones never opened are not in the document at all. Careers roles and the home page's three questions print as blank rows for the same reason.
- **Why it matters:** A printed or "save as PDF" copy of the FAQ carries no information. The careers page prints without the role names.
- **Fix:** three parts. The first two are CSS and fix the careers page and the home page completely, and the FAQ for every question that has been opened; the third mounts all FAQ answers when printing starts.

```diff
--- a/index.css
+++ b/index.css
@@ -92,14 +92,16 @@
     print-color-adjust: exact !important;
   }

-  /* Hide unnecessary elements */
+  /* Hide unnecessary elements. Not the question buttons (.qb) or the TDS
+     group buttons (.foldbtn): they are the headings of the FAQ, careers and
+     home-page accordions, and redesign.css prints them with their answers. */
   nav,
   footer,
   iframe,
   .no-print,
   .print-hidden,
   [role='dialog'],
-  button,
+  button:not(.qb):not(.foldbtn),
   .sticky-sidebar {
     display: none !important;
   }
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -3879,6 +3879,15 @@
    A4 sheet is narrower than the 900px breakpoint, so the phone layout
    applies; the tables below go back into columns. */
 @media print {
+  /* accordions (FAQ, careers, the home page's questions, TDS groups on a
+     phone): every answer open, no plus/minus mark */
+  .rd .qi .ans {
+    grid-template-rows: 1fr;
+  }
+  .rd .qb .x,
+  .rd .foldbtn .cnt::after {
+    display: none;
+  }
   .rd .phead,
   .rd .phead * {
     color: var(--ink) !important;
--- a/pages/FAQ.tsx
+++ b/pages/FAQ.tsx
@@ -253,6 +253,17 @@
     );
   };

+  // Printing: mount every answer first (they are mounted lazily, FQ-01), so
+  // the printed page carries the questions and their answers.
+  useEffect(() => {
+    const revealAll = () => {
+      setRevealedIds(new Set(FAQS.map((faq) => faq.id)));
+      setOpenIds(new Set(FAQS.map((faq) => faq.id)));
+    };
+    window.addEventListener('beforeprint', revealAll);
+    return () => window.removeEventListener('beforeprint', revealAll);
+  }, []);
+
   const toggleQuestion = (id: string) => {
     setRevealedIds(addTo(id));
     setOpenIds((previous) => {
```

- **Effort:** small. **Risk:** low. `beforeprint` fires before the print dialog in Chrome, Edge, Firefox and Safari; React commits the state change synchronously inside the event handler, so the answers are in the document when the page is laid out for print. After printing, every question is left open on screen; if you would rather they close again, add an `afterprint` listener that restores the previous `openIds`. On the patched build, emulating print after `beforeprint` showed 35 visible question buttons and 35 mounted answers. The FAQ's search filter still applies when printing (hidden items stay hidden), which is the expected behaviour.
- **Test to add:** in `pages/FAQ.test.tsx`, dispatch `new Event('beforeprint')` on `window` and assert that every `.rd-answer` is in the document.

#### PRINT-02 — Checklists print with a blank band under the heading

- **Severity:** Low.
- **Confidence:** Confirmed (printed `/resources/checklist/salaried` to PDF: page 1 has about a quarter page of white between the heading block and "About you"; page 3 holds one line and the footer).
- **Where:** `components/redesign/redesign.css` line 2205 (`.rd .sdoc { padding-top: clamp(64px, 7vw, 104px); padding-bottom: clamp(80px, 8vw, 120px); }`), not reset in the print block at 3881–4141.
- **What happens:** The document column keeps its screen padding on paper.
- **Why it matters:** Wasted paper and a page break in the wrong place; the service pages use the same column.
- **Fix:**

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -3908,6 +3908,12 @@
     padding-top: 0;
     padding-bottom: 20px;
   }
+  /* the document column (checklists, service pages) without the screen's
+     top padding, which printed as a blank band under the heading */
+  .rd .sdoc {
+    padding-top: 0;
+    padding-bottom: 0;
+  }

   /* no full-height shell, which would push the footer onto a page of its own */
   .rd.rd-shell,
```

- **Effort:** small. **Risk:** none seen (print-only rule; computed `padding-top: 0px` in print media on the patched build).
- **Test to add:** none practical in jsdom.

### 3.2 User experience

#### UX-01 — The back button returns to the top of the previous page

- **Severity:** Medium — every visitor who opens a service, article or FAQ from a list and goes back loses their place; on the long services and resources pages that is a lot of scrolling.
- **Confidence:** Confirmed (scrolled `/services` to 594 px, opened a service, pressed back: position 0).
- **Where:** `App.tsx` lines 31–49 (`RouteHandler` scrolls to the top on every `pathname` change) together with `index.tsx` lines 10–12 (`history.scrollRestoration = 'manual'`, which switches the browser's own restoration off).
- **What happens:** The handler cannot tell a back/forward navigation from a click on a link, so it treats both the same.
- **Why it matters:** The site's lists are long; returning to the list and finding one's place again is the most common thing a reader does.
- **Fix:** remember the position per page and restore it when the navigation is a `POP` (back or forward). The page is lazy-loaded, so the restore waits until the page is tall enough.

```diff
--- a/App.tsx
+++ b/App.tsx
@@ -1,5 +1,5 @@
 import React, { useEffect, Suspense, lazy } from 'react';
-import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
+import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
 import { PageLoader, Preloader, ToastContainer, NetworkStatus, RouteErrorBoundary, TopProgressBar } from './components';
 import { ToastProvider } from './context/ToastContext';
 import { AnnounceProvider } from './context/AnnounceContext';
@@ -28,25 +28,77 @@
 // stylesheet arrives in a file of its own.
 const RedesignLayout = lazy(() => import('./components/redesign/RedesignLayout'));

+// Where each page was scrolled to, so that the back and forward buttons return
+// there (index.tsx sets history.scrollRestoration to 'manual', which turns the
+// browser's own restoration off).
+const SCROLL_KEY = 'scroll:';
+
+const readScroll = (pathname: string): number | null => {
+  try {
+    const raw = sessionStorage.getItem(`${SCROLL_KEY}${pathname}`);
+    return raw === null ? null : Number(raw);
+  } catch {
+    return null;
+  }
+};
+
 const RouteHandler = () => {
   const { pathname } = useLocation();
+  const navigationType = useNavigationType();
   const { announce } = useAnnounce();

+  // Remember the position as the visitor scrolls.
+  useEffect(() => {
+    const save = () => {
+      // Right after a navigation the browser may clamp the scroll position to
+      // the new, shorter page before this listener is removed; that event
+      // belongs to the new page, not this one.
+      if (window.location.pathname !== pathname) return;
+      try {
+        sessionStorage.setItem(`${SCROLL_KEY}${pathname}`, String(Math.round(window.scrollY)));
+      } catch {
+        // Storage blocked: the back button then lands at the top, as before.
+      }
+    };
+    window.addEventListener('scroll', save, { passive: true });
+    return () => window.removeEventListener('scroll', save);
+  }, [pathname]);
+
   useEffect(() => {
     let rafId = 0;
+    const stored = navigationType === 'POP' ? readScroll(pathname) : null;

-    window.scrollTo({
-      top: 0,
-      left: 0,
-      behavior: 'instant',
-    });
-
-    rafId = window.requestAnimationFrame(() => {
-      document.getElementById('main-content')?.focus({ preventScroll: true });
-    });
+    if (stored === null) {
+      window.scrollTo({
+        top: 0,
+        left: 0,
+        behavior: 'instant',
+      });
+
+      rafId = window.requestAnimationFrame(() => {
+        document.getElementById('main-content')?.focus({ preventScroll: true });
+      });
+
+      return () => window.cancelAnimationFrame(rafId);
+    }
+
+    // Back or forward: the page is lazy-loaded, so wait until it is tall
+    // enough to hold the old position (at most about a second), then restore.
+    let tries = 0;
+    const restore = () => {
+      const maxY = document.documentElement.scrollHeight - window.innerHeight;
+      if (maxY >= stored || tries > 60) {
+        window.scrollTo({ top: stored, left: 0, behavior: 'instant' });
+        document.getElementById('main-content')?.focus({ preventScroll: true });
+        return;
+      }
+      tries += 1;
+      rafId = window.requestAnimationFrame(restore);
+    };
+    rafId = window.requestAnimationFrame(restore);

     return () => window.cancelAnimationFrame(rafId);
-  }, [pathname]);
+  }, [pathname, navigationType]);

   // Accessibility Announcement for Route Change
   useEffect(() => {
```

- **Effort:** medium. **Risk:** medium, and I state the test result plainly: on the patched build, back from a service page to `/services`, from `/services` to `/`, from `/contact` to `/resources` and from `/faqs` to `/insights` all returned to the saved position; back from `/contact` to `/faqs` landed at the top in my test and I did not find the cause before stopping. Treat the diff as a working starting point, not a finished change. Hash-only navigations (`/#about`, FAQ deep links) are unaffected because they do not change `pathname`. Typecheck, lint and the 187 tests pass with it applied.
- **Test to add:** a `RouteHandler` test with `MemoryRouter`: push a route, set `window.scrollY`, go back, assert `window.scrollTo` was called with the saved value.

#### UX-02 — Contact and Careers pages fail to load in a browser that blocks site data

- **Severity:** Medium — the contact page is the one that matters most, but only visitors whose browser refuses storage are affected (Chrome with "Block all cookies", or a per-site block).
- **Confidence:** Confirmed (with `localStorage` access made to throw `SecurityError`, `/contact` and `/careers` render the route error screen "This page could not load"; the console shows `Route Error: SecurityError: Access is denied for this document` from `useRateLimit`; all other pages load).
- **Where:** `hooks/useRateLimit.ts` line 29 (`localStorage.getItem(storageKey)` outside the `try`) and lines 77–83 (the `setItem` catch handles only quota errors).
- **What happens:** A browser that blocks site data throws on any access to `localStorage`. The read happens in an effect, so the exception reaches the route error boundary and replaces the page.
- **Why it matters:** A visitor who has tightened their privacy settings cannot see the phone number, the map or the form.
- **Fix:**

```diff
--- a/hooks/useRateLimit.ts
+++ b/hooks/useRateLimit.ts
@@ -26,7 +26,14 @@
   const [attempts, setAttempts] = useState<number[]>([]);

   useEffect(() => {
-    const stored = localStorage.getItem(storageKey);
+    // A browser that blocks site data throws on any access to localStorage.
+    // Treat that as "no attempts yet" rather than letting the page crash.
+    let stored: string | null = null;
+    try {
+      stored = localStorage.getItem(storageKey);
+    } catch (e) {
+      logger.warn('Rate limit storage unavailable', e);
+    }
     if (stored) {
       try {
         const parsed = JSON.parse(stored);
@@ -76,6 +83,8 @@
       } catch (e) {
         if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
           logger.warn('Failed to update rate limit: localStorage quota exceeded');
+        } else {
+          logger.warn('Rate limit storage unavailable', e);
         }
       }
```

- **Effort:** small. **Risk:** none seen; with storage blocked the rate limit simply does not persist across reloads (it still counts within the page). On the patched build the contact form renders with storage blocked. `useFormDraft` also reads `sessionStorage` without a guard (`hooks/useFormDraft.ts` lines 20 and 62), but those reads are inside async functions whose rejections are swallowed, and blocking `sessionStorage` alone did not break the page in my test.
- **Test to add:** in a new `hooks/useRateLimit.test.ts`, stub `localStorage.getItem` to throw and assert the hook returns `attemptsRemaining === maxAttempts` without throwing.

### 3.3 Accessibility (WCAG 2.2 AA)

#### A11Y-01 — Links inside sentences are told apart by colour only, and the colour is almost the same as the text

- **Severity:** High — a Level A criterion (1.4.1 Use of Color) fails on about 33 pages: the services index, all 14 service pages, all 11 checklists, the FAQ, the income-tax and HRA calculators, the section finder, careers, contact and the 404 page.
- **Confidence:** Confirmed (computed styles read from the rendered pages: `text-decoration-line: none`, link colour `#16191a` against surrounding text `#3f433f` or `#5f625c`).
- **Where:** `components/redesign/redesign.css` — the rules for `.rd .still a` (773), `.rd .fine a` (1033), `.rd .sent p a` (1049), `.rd .next .more a` (1119) and `.rd .next.sand .more a` (1140), `.rd .inc a, .rd .needs a, .rd .sec-h .desc a` (2237), `.rd .closed a` (2429), `.rd .ainfo .mailto a` (2496), `.rd .fnote a, .rd .nudge a` (3151). Each sets `text-decoration-color` and `text-underline-offset` but never `text-decoration-line`, and Tailwind's preflight (`a { text-decoration: inherit }`) removes the browser's default underline.
- **What happens:** "Notices and appeals" inside a service's scope paragraph, "privacy policy" under the forms, "send us a message" under the FAQ, "mail@casagar.co.in" in the success message, "Read the FAQs" on the contact page and the cross-links in the calculators look like the words around them. The link colour differs from the body text by 1.76:1 and from the small print by 2.85:1; WCAG's technique for colour-only links (G183) needs 3:1 plus a hover/focus cue. Hover does add an underline, but a reader has to know to hover.
- **Why it matters:** Readers with low vision or colour-vision deficiency, and anyone skimming, cannot find the links.
- **Fix:** one rule that turns the underline on for exactly the selectors that style these links; the colours and offsets already written then take effect.

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -74,6 +74,23 @@
   border-radius: 0;
   box-shadow: none;
 }
+/* Links inside running text are the same colour as the text around them, so
+   they need the underline to be seen at all (WCAG 1.4.1). Tailwind's preflight
+   sets `text-decoration: inherit` on every link, which removes the browser's
+   underline; the rules below only set its colour and offset. */
+.rd .still a,
+.rd .fine a,
+.rd .sent p a,
+.rd .next .more a,
+.rd .inc a,
+.rd .needs a,
+.rd .sec-h .desc a,
+.rd .closed a,
+.rd .ainfo .mailto a,
+.rd .fnote a,
+.rd .nudge a {
+  text-decoration-line: underline;
+}
 .rd h1,
 .rd h2,
 .rd h3 {
```

- **Effort:** small. **Risk:** low; it is a visual change you will want to look at. The underline uses each rule's existing `text-decoration-color` (copper or the rule grey) and offset, so the result is a thin coloured underline rather than a heavy black one. Links that are standalone lines (phone and email in the office block on the home page, the buttons) are deliberately left alone. Checked on the patched build (`text-decoration-line: underline` on `.rd .inc a`).
- **Test to add:** none practical in jsdom (computed styles from a stylesheet are not available); the axe `link-in-text-block` rule in Lighthouse flagged these on three pages and will go green.

#### A11Y-02 — The keyboard focus ring is below 3:1 on the light grounds

- **Severity:** Medium — WCAG 1.4.11 (Non-text Contrast); keyboard users can still see a ring, faintly.
- **Confidence:** Confirmed (computed `outline-color: rgb(201, 138, 87)` on focused links on `/services`; contrast calculated from the design tokens).
- **Where:** `components/redesign/redesign.css` lines 71–76 (`.rd :focus-visible { outline: 2px solid var(--copper) }`) and 4195–4203 (the home page already overrides to `--copper-d` for this reason).
- **What happens:** Copper `#c98a57` measures 2.52:1 on stone, 2.73:1 on paper and 2.26:1 on sand — the three grounds of every page below the header. On the dark bands it is 5.6–6.6:1. The darker copper `#9a5f33` used on the home page is 4.5, 4.9 and 4.0:1 on the light grounds and still 3.1–3.7:1 on the dark ones, so it clears 3:1 everywhere.
- **Why it matters:** A keyboard user tabbing through a service page or the FAQ cannot easily see where focus is.
- **Fix:** use the darker copper everywhere and drop the home-page override that becomes redundant.

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -69,7 +69,9 @@
   color: inherit;
 }
 .rd :focus-visible {
-  outline: 2px solid var(--copper);
+  /* the darker copper: at least 3:1 against every ground the site uses
+     (stone 4.5, paper 4.9, sand 4.0, night 3.7, deep 3.1, footer 3.6) */
+  outline: 2px solid var(--copper-d);
   outline-offset: 3px;
   border-radius: 0;
   box-shadow: none;
@@ -4192,12 +4194,8 @@
   /* lines around controls, a shade darker than --rule-s so they hold on sand */
   --hline: #b3ad9e;
 }
-/* the focus ring: the darker copper on the light grounds, where the lighter
-   one is hard to see; the lighter one stays on the dark band */
-.rd.head-home .topbar :focus-visible,
-.rd .home :focus-visible {
-  outline-color: var(--copper-d);
-}
+/* the focus ring is the darker copper everywhere (see .rd :focus-visible);
+   the lighter one stays on the dark About band, where it reads better */
 .rd .home .habout :focus-visible {
   outline-color: var(--copper);
 }
```

- **Effort:** small. **Risk:** low; on the dark header band the ring becomes a darker copper (3.1–3.7:1 rather than 5.6–6.6:1) — still compliant, slightly less bright. If you prefer the bright ring on the dark bands, add `outline-color: var(--copper)` for `.rd .topbar`, `.rd .phead`, `.rd .foot` and `.rd .next:not(.sand)` after the base rule. `CLAUDE.md` says "The focus ring is copper"; it stays copper, one shade darker.
- **Test to add:** none practical in jsdom.

#### A11Y-03 — The form fields' only visible edge is 1.8:1 against the panel

- **Severity:** Medium — WCAG 1.4.11; the contact and careers forms.
- **Confidence:** Likely. The underline colour and the contrast are confirmed (`--rule-s` `#c2bcae` on paper `#faf8f3` = 1.78:1; on stone 1.65:1); whether the criterion applies turns on whether the underline is needed to identify the field. The label sits above the field in body colour, but nothing else shows where the typing area begins or ends.
- **Where:** `components/redesign/redesign.css` lines 911–929 (`.rd .fld input, .rd .fld textarea { border-bottom: 1px solid var(--rule-s) }`) and 3172–3185 (the same for `select` and date fields in the calculators).
- **What happens:** On a bright screen or for a reader with low vision, the fields are invisible until focused (focus turns the line to ink).
- **Why it matters:** A visitor cannot see how many fields there are or where to click.
- **Fix:** use `--muted` (`#5f625c`, 5.1:1 on paper) for the resting underline; focus still darkens it to ink.

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -914,7 +914,9 @@
   width: 100%;
   background: transparent;
   border: 0;
-  border-bottom: 1px solid var(--rule-s);
+  /* the only visible edge of the field: 3:1 or better against the panel
+     (WCAG 1.4.11); --rule-s was 1.8:1 */
+  border-bottom: 1px solid var(--muted);
   border-radius: 0;
   padding: 6px 0 10px;
   font-size: 17px;
@@ -3176,7 +3178,7 @@
   min-height: 44px;
   background: transparent;
   border: 0;
-  border-bottom: 1px solid var(--rule-s);
+  border-bottom: 1px solid var(--muted);
   border-radius: 0;
   padding: 6px 0 10px;
   font-size: 17px;
```

- **Effort:** small. **Risk:** low; a visual change (the lines become grey rather than beige). If `--muted` is too dark for the design, `--hline` `#b3ad9e` (defined at line 4193) is 2.2:1 and does not reach 3:1; the lightest token that does is `--muted`.
- **Test to add:** none practical in jsdom.

#### A11Y-04 — Search placeholder text is 3.0:1

- **Severity:** Low — WCAG 1.4.3 (4.5:1 for text); the placeholder is a hint, and the field is labelled.
- **Confidence:** Confirmed (computed `::placeholder` colour `rgb(142, 145, 138)` on the FAQ, Resources and section-finder search boxes; panel background `#faf8f3`; 3.01:1).
- **Where:** `components/redesign/redesign.css` lines 525–527 (`.rd .srow input::placeholder { color: #8e918a }`).
- **What happens:** "Search the questions, for example ‘notice’ or ‘GST returns’" is hard to read for low-vision readers.
- **Fix:**

```diff
--- a/components/redesign/redesign.css
+++ b/components/redesign/redesign.css
@@ -523,7 +523,7 @@
   border-radius: 0;
 }
 .rd .srow input::placeholder {
-  color: #8e918a;
+  color: var(--muted); /* 5.1:1 on the panel; #8e918a was 3.0:1 */
 }
 .rd .srow input::-webkit-search-cancel-button {
   display: none;
```

- **Effort:** small. **Risk:** none (also removes a raw colour in favour of a token, as `CLAUDE.md` asks).
- **Test to add:** none practical in jsdom.

#### A11Y-05 — Every article's heading order goes H1 → H3 → H2

- **Severity:** Low — a best-practice rule (axe `heading-order`, flagged by Lighthouse on the article page), not a WCAG failure on its own.
- **Confidence:** Confirmed (heading lists read from all five rendered articles: `H1`, then `H3 In short`, then the `H2` sections).
- **Where:** `public/content/insights/*.md` line 5 (`### In short` inside `:::summary`); `components/redesign/ArticleMarkdown.tsx` lines 14–20 (the summary directive is rendered as a `div.asum` with its heading unchanged) and 43–45 (only `h1`/`h2` inside a section are demoted).
- **What happens:** The "In short" box's heading is an H3 that precedes the first H2, so a screen-reader user navigating by heading meets a sub-heading before any section.
- **Fix:** render the summary box's heading as a paragraph with a class, keeping the markdown as written.

```diff
--- a/components/redesign/ArticleMarkdown.tsx
+++ b/components/redesign/ArticleMarkdown.tsx
@@ -11,11 +11,16 @@
 // comes from redesign.css (`.lsec`, `.alead`), so this stays free of classes
 // except the summary box and the table wrapper.

-/** `:::summary … :::` becomes the "Key takeaways" box. */
+/** `:::summary … :::` becomes the "Key takeaways" box. Its heading ("### In
+ * short") sits above the article's first H2, so it is rendered as a paragraph
+ * rather than an H3, which would break the heading order. */
 const remarkSummary = () => (tree: Root) => {
   visit(tree, 'containerDirective', (node) => {
     if (node.name !== 'summary') return;
     node.data = { ...(node.data ?? {}), hName: 'div', hProperties: { className: 'asum' } };
+    visit(node, 'heading', (heading) => {
+      heading.data = { ...(heading.data ?? {}), hName: 'p', hProperties: { className: 'asum-h' } };
+    });
   });
 };

@@ -24,6 +29,7 @@
   attributes: {
     ...defaultSchema.attributes,
     div: [...(defaultSchema.attributes?.div ?? []), ['className', 'asum']],
+    p: [...(defaultSchema.attributes?.p ?? []), ['className', 'asum-h']],
   },
 };

```

- **Effort:** small. **Risk:** low. The box's heading loses the `h3` styling from `redesign.css`; add a rule for `.rd .asum .asum-h` copying whatever `.rd .asum h3` sets (I did not find a dedicated `.asum h3` rule, so the heading currently takes the generic `.rd h3` style; give `.asum-h` the same font, size and margin). On the patched build the article headings read H1, H2, H2… and the box's heading renders as `<p class="asum-h">`.
- **Test to add:** in `components/redesign/ArticleMarkdown.test.tsx` (new), render `:::summary\n### In short\n- a\n:::` and assert no `h3` is rendered and `p.asum-h` is.

#### A11Y-06 — Route announcements read "Service: Gst" and "Service: Tds And Tcs"

- **Severity:** Low — screen-reader users only; the page title that follows is correct.
- **Confidence:** Confirmed (announcement text read from the live region after navigating: "Navigated to Service: Tds And Tcs").
- **Where:** `App.tsx` lines 58–64 (each slug word has its first letter capitalised).
- **What happens:** Abbreviations in slugs become "Gst", "Tds And Tcs", "Nri Taxation"; a screen reader may try to pronounce "Gst" as a word.
- **Fix:**

```diff
--- a/App.tsx
+++ b/App.tsx
@@ -57,11 +57,13 @@

       // Handle known routes
       if (pathname.startsWith('/services/')) {
+        // "Service: GST", "Service: TDS and TCS", "Service: NRI taxation"
         const serviceSlug = parts[1] || '';
-        pageName = `Service: ${serviceSlug
+        const words = serviceSlug
           .split('-')
-          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
-          .join(' ')}`;
+          .map((s) => (/^(gst|tds|tcs|nri|npos|llps)$/.test(s) ? s.toUpperCase() : s))
+          .join(' ');
+        pageName = `Service: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
       } else if (pathname.startsWith('/insights/')) {
         pageName = `Insight Article`;
       } else if (pathname.startsWith('/resources/checklist/')) {
```

- **Effort:** small. **Risk:** none; the announcement after the fix is "Navigated to Service: TDS and TCS". A cleaner fix would look the slug up in `SERVICE_PAGES` and announce `page.name`, but that imports the services data into `App.tsx`, which is otherwise free of content imports.
- **Test to add:** a `RouteHandler` test asserting the announced text for `/services/tds-and-tcs`.

### 3.4 SEO

#### SEO-01 — Every page carries two titles and two sets of description and social tags

- **Severity:** Medium — the home page's description precedes the page's own in every document, and which one a crawler reads is not defined.
- **Confidence:** Confirmed (the `<head>` of `/services/gst` and of an article, read from the rendered page: two `<title>` elements, two `meta[name=description]`, two `og:title`, two `og:description`, two `og:image`, two `og:type`, two `twitter:*` sets).
- **Where:** `index.html` lines 43–61 (the static home-page tags) and `components/SEO.tsx` lines 162–184 (the page's tags, which React 19 hoists into the head without removing the static ones). In the rendered head the page's `<title>` comes first, then the static title, then the static description and social tags, and only then the page's description and social tags.
- **What happens:** Google renders the page and finds two descriptions; the first is the home page's. Social scrapers that run JavaScript (few do) find two of everything. The `og:type` for an article is `website` first and `article` second.
- **Why it matters:** Search snippets for service pages may show the home page's text. It also hides SEO-02: a tool that reads the rendered DOM sees page-specific tags and reports the page as fine.
- **Fix:** mark the static tags and remove them once the page's own are in place.

```diff
--- a/index.html
+++ b/index.html
@@ -40,25 +40,28 @@
          The wording is the home page's: its title and description
          (pages/Home.tsx), and its opening line for the share text. Keep the
          two in step. -->
-    <title>Sagar H R &amp; Co. | Chartered Accountants | Mysuru</title>
+    <title data-fallback>Sagar H R &amp; Co. | Chartered Accountants | Mysuru</title>
     <meta
+      data-fallback
       name="description"
       content="Sagar H R &amp; Co., Chartered Accountants in Mysuru: income tax, GST, TDS, audit, company law and trusts, for individuals, businesses and institutions."
     />
-    <meta property="og:type" content="website" />
-    <meta property="og:title" content="Sagar H R &amp; Co. | Chartered Accountants | Mysuru" />
+    <meta data-fallback property="og:type" content="website" />
+    <meta data-fallback property="og:title" content="Sagar H R &amp; Co. | Chartered Accountants | Mysuru" />
     <meta
+      data-fallback
       property="og:description"
       content="Taxation, audit, company law and accounting services for individuals, businesses, institutions and trusts."
     />
-    <meta property="og:image" content="https://casagar.co.in/og/og-default.png" />
-    <meta name="twitter:card" content="summary_large_image" />
-    <meta name="twitter:title" content="Sagar H R &amp; Co. | Chartered Accountants | Mysuru" />
+    <meta data-fallback property="og:image" content="https://casagar.co.in/og/og-default.png" />
+    <meta data-fallback name="twitter:card" content="summary_large_image" />
+    <meta data-fallback name="twitter:title" content="Sagar H R &amp; Co. | Chartered Accountants | Mysuru" />
     <meta
+      data-fallback
       name="twitter:description"
       content="Taxation, audit, company law and accounting services for individuals, businesses, institutions and trusts."
     />
-    <meta name="twitter:image" content="https://casagar.co.in/og/og-default.png" />
+    <meta data-fallback name="twitter:image" content="https://casagar.co.in/og/og-default.png" />
     <style>
       /* First paint, before the app has loaded. A first visit opens with the
          splash (components/Preloader.tsx), so the screen starts in the
--- a/components/SEO.tsx
+++ b/components/SEO.tsx
@@ -1,4 +1,4 @@
-import React from 'react';
+import React, { useEffect } from 'react';
 import { stringifyJsonLd } from '../utils/jsonLd';
 import { SITE_URL } from '../config/site';

@@ -159,6 +159,13 @@
         }
       : null;

+  // The static tags in index.html exist for clients that do not run
+  // JavaScript. Once the page's own tags are in the head, remove them, so
+  // the document carries one title and one description.
+  useEffect(() => {
+    document.head.querySelectorAll('[data-fallback]').forEach((element) => element.remove());
+  }, []);
+
   return (
     <>
       <title>{title}</title>
```

- **Effort:** small. **Risk:** low. The static tags stay in the served HTML (that is what non-JavaScript clients read), and the inline `<style>` is untouched so the CSP hash check still passes. On the patched build every page has one `<title>`, one description and one of each social tag. The `og:site_name` and `og:image:width/height/type` tags above line 40 are not duplicated by `SEO.tsx` and keep their place.
- **Test to add:** a `components/SEO.test.tsx` that renders `<SEO>` inside a document whose head holds a `[data-fallback]` title and asserts that one `<title>` remains.

#### SEO-02 — Link previews and non-JavaScript crawlers get the home page's text for every address

- **Severity:** High — the firm's main channel is WhatsApp, and WhatsApp, Facebook, LinkedIn, iMessage and most link-preview and AI crawlers read the served HTML and do not run the application. PR #24 ("fix/link-preview-text") was merged the day of the audit, which suggests this is already a felt problem.
- **Confidence:** Confirmed (the raw HTML served for `/insights/itr-u-48-month-window` on the local build has the home page's `<title>`, description and `og:image` and no `<h1>`; on the live site the same `index.html` is returned for every address, by the `/* → /index.html 200` rule in `netlify.toml` lines 95–98).
- **Where:** `netlify.toml` lines 95–98; `index.html` lines 43–61; `components/SEO.tsx` (runs only in the browser).
- **What happens:** Paste a link to an article or a service into a chat and the preview shows "Sagar H R & Co. | Chartered Accountants | Mysuru" with the default picture, whatever the page. Googlebot renders JavaScript and sees the page's own tags (with the SEO-01 duplication), so search listings are less affected than previews.
- **Why it matters:** A shared article looks like a link to the home page; the five article images in `public/og/` are never shown in a preview.
- **Fix:** two routes; pick one (see Questions, Q1).
  1. **Netlify Prerender extension** — no code. A team owner installs it from the Netlify extensions catalogue and enables prerendering for the site; Netlify then serves a rendered copy of each page to crawlers and preview bots and the normal page to people. It runs as a function on each crawler request (billed as function invocations) and requires Node 20 or later on the site (see SEC-01). Netlify's documentation: https://docs.netlify.com/build/post-processing/prerendering/ ("replaces the legacy beta prerendering feature, which is now deprecated"). I could not test it; it is a dashboard setting.
  2. **Per-route HTML at build time** — the script below writes `dist/<route>/index.html` for all 46 non-home addresses, each with its own title, description, image, `og:url` and canonical, reading the same data the sitemap script reads. Netlify serves an existing file in preference to the `/*` rewrite (documentation, "Shadowing": "By default, you can't shadow a URL that actually exists within the site" — https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), so `netlify.toml` needs no change. The titles and descriptions of the static pages are copied from the page components; that duplication is the cost of this route, and the script says so in its header. It depends on SEO-01's `data-fallback` change (the generated tags carry the attribute, so the application removes them once it has rendered). If you also apply CON-01, change the two title formats here to match (`| ${FIRM}` for articles; `FAQs | …`; `Contact us`).

```diff
--- a/package.json
+++ b/package.json
@@ -8,7 +8,7 @@
   },
   "scripts": {
     "dev": "vite",
-    "build": "npm run icons && tsx scripts/check-csp-hash.ts && tsx scripts/generate-sitemap.ts && tsx scripts/generate-responsive-images.ts && vite build",
+    "build": "npm run icons && tsx scripts/check-csp-hash.ts && tsx scripts/generate-sitemap.ts && tsx scripts/generate-responsive-images.ts && vite build && tsx scripts/generate-route-html.ts",
     "icons": "tsx scripts/generate-icons.ts",
     "sitemap": "tsx scripts/generate-sitemap.ts",
     "lint:schema": "tsx scripts/validate-services-schema.ts",
--- /dev/null
+++ b/scripts/generate-route-html.ts
@@ -0,0 +1,163 @@
+import fs from 'fs';
+import path from 'path';
+import { fileURLToPath } from 'url';
+
+import { SERVICE_PAGES } from '../constants/services.tsx';
+import { CHECKLISTS } from '../constants/resources/checklists.ts';
+import { RESOURCE_TOOLS } from '../constants/resources/tools.ts';
+import { getOpenRoles } from '../constants/careers.ts';
+import { CONTACT_INFO } from '../config/contact.ts';
+import type { InsightItem } from '../types/index.ts';
+
+// Writes dist/<route>/index.html for every public address, with that page's
+// title, description and share tags in place of the home page's, so that
+// WhatsApp, search engines and other clients that do not run JavaScript see
+// the right text. Runs after `vite build`. Netlify serves a file that exists
+// at the requested path in preference to the `/* -> /index.html` rewrite
+// (netlify.toml), so these files take effect without any change to it.
+//
+// The titles and descriptions for the static pages below are copied from the
+// page components (Services.tsx, Insights.tsx, FAQ.tsx, Resources.tsx,
+// Careers.tsx, Contact.tsx, Privacy.tsx, Terms.tsx, Disclaimer.tsx). Keep
+// the two in step when one changes.
+
+const __filename = fileURLToPath(import.meta.url);
+const __dirname = path.dirname(__filename);
+const repoRoot = path.resolve(__dirname, '..');
+const dist = path.join(repoRoot, 'dist');
+const BASE_URL = 'https://casagar.co.in';
+const FIRM = CONTACT_INFO.name;
+
+interface RouteMeta {
+  route: string;
+  title: string;
+  description: string;
+  image?: string;
+  type?: 'website' | 'article';
+}
+
+const insights = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public', 'data', 'insights.json'), 'utf-8')) as InsightItem[];
+const openRoles = getOpenRoles();
+
+const routes: RouteMeta[] = [
+  {
+    route: '/services',
+    title: `Services | ${FIRM}`,
+    description:
+      'GST, income tax, TDS, NRI taxation, notices and appeals, audits, certificates, company and LLP filings, trusts, bank loans and bookkeeping, from Sagar H R & Co., Chartered Accountants, Mysuru.',
+    image: `${BASE_URL}/og-services.png`,
+  },
+  ...SERVICE_PAGES.map((page) => ({
+    route: `/services/${page.slug}`,
+    title: `${page.name} | ${FIRM}`,
+    description: page.intro,
+  })),
+  {
+    route: '/insights',
+    title: `Insights | ${FIRM}`,
+    description: 'Notes on changes in tax law, by CA Sagar H R of Sagar H R & Co., Mysuru.',
+  },
+  ...insights.map((insight) => ({
+    route: `/insights/${insight.slug}`,
+    title: `${insight.title} | Insights`,
+    description: insight.summary,
+    image: insight.image ? `${BASE_URL}${insight.image}` : undefined,
+    type: 'article' as const,
+  })),
+  {
+    route: '/faqs',
+    title: 'CA FAQs | Tax, GST, Audit - Sagar H R & Co., Mysuru',
+    description:
+      'Answers on income tax, GST, company and LLP filings, tax notices, appeals and trust registration from Sagar H R & Co., Chartered Accountants in Mysuru.',
+    image: `${BASE_URL}/og-faq.png`,
+  },
+  {
+    route: '/resources',
+    title: `Resources | ${FIRM}`,
+    description:
+      'Income tax, HRA, capital gains and GST calculators, TDS and TCS rates, due dates and old-to-new section numbers for tax year 2026-27, and checklists of documents, from Sagar H R & Co., Chartered Accountants, Mysuru.',
+  },
+  ...RESOURCE_TOOLS.map((tool) => ({
+    route: `/resources/${tool.slug}`,
+    title: `${tool.name} | ${FIRM}`,
+    description: tool.summary,
+  })),
+  ...CHECKLISTS.map((checklist) => ({
+    route: `/resources/checklist/${checklist.slug}`,
+    title: `${checklist.title} checklist | ${FIRM}`,
+    description: `${checklist.summary} The documents to send us.`,
+  })),
+  {
+    route: '/careers',
+    title: `Careers | ${FIRM}`,
+    description: openRoles.length
+      ? `Open roles at ${FIRM}, Chartered Accountants, Mysuru: ${openRoles.map((role) => role.role).join(' and ')}.`
+      : `Careers at ${FIRM}, Chartered Accountants, Mysuru. No roles are open right now; you can still send us your details.`,
+    image: `${BASE_URL}/og-careers.png`,
+  },
+  {
+    route: '/contact',
+    title: `Contact Us | ${FIRM}`,
+    description:
+      'Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp.',
+    image: `${BASE_URL}/og-contact.png`,
+  },
+  {
+    route: '/privacy',
+    title: 'Privacy Policy | Sagar H R & Co.',
+    description:
+      'What Sagar H R & Co. collects through its website and in its work, why, who else sees it, how long it is kept, and how to reach the grievance officer.',
+  },
+  {
+    route: '/terms',
+    title: 'Terms of Service | Sagar H R & Co.',
+    description:
+      'The terms for using the Sagar H R & Co. website: what the information on it is, how you may use it, and the law that applies.',
+  },
+  {
+    route: '/disclaimer',
+    title: 'Disclaimer | Sagar H R & Co.',
+    description:
+      "What the information on the Sagar H R & Co. website is and isn't: general information on tax and compliance, not advice on your situation.",
+  },
+];
+
+const escapeHtml = (value: string): string =>
+  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
+
+/** Replace the content of one `<meta name|property="…">` tag in the template. */
+const setMeta = (html: string, attr: 'name' | 'property', key: string, content: string): string => {
+  const pattern = new RegExp(`(<meta\\s[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`, 's');
+  if (!pattern.test(html)) throw new Error(`generate-route-html: no <meta ${attr}="${key}"> in dist/index.html`);
+  return html.replace(pattern, `$1${escapeHtml(content)}$2`);
+};
+
+const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
+if (!/<title[^>]*>[^<]*<\/title>/.test(template)) throw new Error('generate-route-html: no <title> in dist/index.html');
+
+let written = 0;
+for (const meta of routes) {
+  const url = `${BASE_URL}${meta.route}`;
+  const image = meta.image ?? `${BASE_URL}/og/og-default.png`;
+  let html = template.replace(/<title[^>]*>[^<]*<\/title>/, `<title data-fallback>${escapeHtml(meta.title)}</title>`);
+  html = setMeta(html, 'name', 'description', meta.description);
+  html = setMeta(html, 'property', 'og:type', meta.type ?? 'website');
+  html = setMeta(html, 'property', 'og:title', meta.title);
+  html = setMeta(html, 'property', 'og:description', meta.description);
+  html = setMeta(html, 'property', 'og:image', image);
+  html = setMeta(html, 'name', 'twitter:title', meta.title);
+  html = setMeta(html, 'name', 'twitter:description', meta.description);
+  html = setMeta(html, 'name', 'twitter:image', image);
+  // og:url and the canonical are not in index.html; add them beside og:image.
+  html = html.replace(
+    /(<meta\s[^>]*property="og:image"[^>]*>)/,
+    `$1\n    <meta data-fallback property="og:url" content="${url}" />\n    <link data-fallback rel="canonical" href="${url}" />`,
+  );
+
+  const dir = path.join(dist, meta.route.replace(/^\//, ''));
+  fs.mkdirSync(dir, { recursive: true });
+  fs.writeFileSync(path.join(dir, 'index.html'), html);
+  written += 1;
+}
+
+console.log(`generate-route-html: wrote ${written} route files under dist/`);
```

- **Effort:** medium. **Risk:** medium. On the patched copy the script ran clean (46 files), passed `tsc` and ESLint, and each generated file carries the right title, description, image, `og:type`, `og:url` and canonical; opened in a browser, the application boots on those files and ends with one title, one canonical and one `og:url`. What I could not test is Netlify itself: that it serves `services/gst/index.html` for `/services/gst` is taken from its documentation (quoted above), not observed. Deploy to a branch preview first and paste a link into WhatsApp to confirm. Also note: `scripts/tidy-repo-root.sh` and the `dist/` ignore are unaffected; the files live only in `dist/`.
- **Test to add:** a `scripts/generate-route-html.test.ts` that runs the route table against a minimal template string and asserts the replaced title and description for one service and one article.

#### SEO-03 — The Insights page's `Blog` structured data gives relative image URLs

- **Severity:** Low — Google's structured-data documentation asks for absolute URLs in `image`; the tag is informational.
- **Confidence:** Confirmed (JSON-LD read from `/insights`: `"image": "/og/income-tax-act-2025-in-force.png"` for every post).
- **Where:** `pages/Insights.tsx` line 44 (`image: insight.image || …` — `insight.image` is a site-relative path in `public/data/insights.json`).
- **Fix:**

```diff
--- a/pages/Insights.tsx
+++ b/pages/Insights.tsx
@@ -41,7 +41,7 @@
         author: { '@type': 'Person', name: insight.author },
         articleSection: insight.category,
         ...(insight.wordCount ? { wordCount: insight.wordCount } : {}),
-        image: insight.image || `${SITE_URL}/og/og-default.png`,
+        image: insight.image ? `${SITE_URL}${insight.image}` : `${SITE_URL}/og/og-default.png`,
       })),
     }),
     [sorted],
```

- **Effort:** small. **Risk:** none; after the fix `"image": "https://casagar.co.in/og/income-tax-act-2025-in-force.png"`. (`InsightDetail.tsx` and `SEO.tsx` already build absolute URLs for the article pages themselves.)
- **Test to add:** in `pages/Insights.test.tsx`, parse the `Blog` JSON-LD and assert every `blogPost[].image` starts with `https://`.

#### SEO-04 — `WebSite.dateModified` on the home page is the visitor's date, not the build's

- **Severity:** Low.
- **Confidence:** Confirmed (`pages/Home.tsx` line 28 reads `import.meta.env.VITE_BUILD_DATE`, which nothing defines — searched the repository, `netlify.toml` and the CI workflow — so it falls back to `new Date()` in the browser; the rendered JSON-LD showed today's date).
- **Where:** `pages/Home.tsx` lines 28 and 120; `vite.config.ts`.
- **What happens:** The structured data tells search engines the site was modified today, every day.
- **Fix:** define the variable at build time (this also removes the unused `mode` parameter that ESLint warns about, CODE-04).

```diff
--- a/vite.config.ts
+++ b/vite.config.ts
@@ -6,8 +6,13 @@
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

-export default defineConfig(({ mode }) => {
+export default defineConfig(() => {
   return {
+    // The date of the build, for WebSite.dateModified on the home page
+    // (pages/Home.tsx). Without it the page used the visitor's date.
+    define: {
+      'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString().slice(0, 10)),
+    },
     server: {
       port: 3000,
       host: '0.0.0.0',
```

- **Effort:** small. **Risk:** none; in the patched build the Home chunk contains the literal `"2026-10-08"` and the `new Date()` fallback is compiled away. Vitest shares this config, so tests also see a defined value.
- **Test to add:** none needed beyond the existing Home structured-data test, which can assert `dateModified` matches `/^\d{4}-\d{2}-\d{2}$/`.

#### SEO-05 — Unknown addresses answer 200 with the home page's HTML

- **Severity:** Low — once the application renders, the 404 screen sets `noindex, follow`, so Google does not index these; the cost is to non-JavaScript clients and to any monitoring (a wrong link and a right one both return 200).
- **Confidence:** Confirmed (live: `/no-such-page` and `/favicon.ico` return 200 with the home `index.html`; rendered head of `/no-such-page`: `robots: noindex, follow`, canonical `https://casagar.co.in/no-such-page`).
- **Where:** `netlify.toml` lines 95–98; `pages/NotFound.tsx` line 32; `components/SEO.tsx` line 45–52 (`getDefaultCanonicalUrl` emits a canonical for the unknown address as well).
- **Fix:** no diff. The one way to return a true 404 on Netlify for a single-page app is to have real files for the known addresses (SEO-02, route 2) and then change the fallback rule to `status = 404` so that `index.html` is still served, and the application still boots and shows "Page not found", but with a 404 status. I have not tested that configuration and do not recommend making it in the same change as SEO-02. Removing the canonical on the 404 screen is a one-line change in `NotFound.tsx` (`canonicalUrl` cannot currently be omitted; `SEO.tsx` would need an `omitCanonical` prop), which is not worth doing on its own.
- **Effort:** small (after SEO-02). **Risk:** low. **Test to add:** none.

### 3.5 Performance

Lighthouse 12 on the local build (simulated mobile, 4× CPU slowdown): home 89, services/gst 93, FAQ 93, resources/income-tax-calculator 92, contact 91, the article page 59 (desktop: 83). All other categories 92–100. No field data exists (the site runs no analytics), so these are lab numbers.

#### PERF-01 — The hashed assets and the fonts are served with `max-age=0`

- **Severity:** Medium — every return visit re-requests every script, stylesheet and font (the server answers 304, but the round trips still happen on every page load).
- **Confidence:** Confirmed (live site in your Chrome: `/assets/*.js` and `/assets/*.css` responses carry Netlify's default `cache-control: public, max-age=0, must-revalidate`; on a second visit the requests returned 304. Lighthouse: "uses-long-cache-ttl: 0 resources found", i.e. nothing is cached for long).
- **Where:** `netlify.toml` lines 100–114 define cache rules for `/data/*`, `/content/*` and `/og/*` only; `vite.config.ts` names every built file with a content hash (`index-C5uAh8CJ.js`), so a cached copy can never be stale.
- **Fix:**

```diff
--- a/netlify.toml
+++ b/netlify.toml
@@ -112,6 +112,18 @@
   [headers.values]
     Cache-Control = "public, max-age=86400, stale-while-revalidate=604800"

+# Vite names every file under /assets/ with a hash of its content, and the
+# fonts never change, so a browser can keep them for a year without asking.
+[[headers]]
+  for = "/assets/*"
+  [headers.values]
+    Cache-Control = "public, max-age=31536000, immutable"
+
+[[headers]]
+  for = "/fonts/*"
+  [headers.values]
+    Cache-Control = "public, max-age=31536000, immutable"
+
 [[headers]]
   for = "/*"
   [headers.values]
```

- **Effort:** small. **Risk:** low. `index.html` itself keeps `max-age=0`, so a new deploy is picked up on the next visit and its new hashes point at new files. The only file under `/fonts/` that could ever change in place is one you replace with the same name; if you do, rename it. The fonts are referenced from `index.css` and `index.html` (`<link rel="preload">`) by path, so check the path is `/fonts/` before applying (`ls public/fonts`).
- **Test to add:** none; after deploying, a second load in your Chrome should show "(memory cache)" or "(disk cache)" for the assets in the network panel.

#### PERF-02 — Article pages shift their layout while the body loads (CLS 0.30)

- **Severity:** Medium — Lighthouse marks CLS above 0.25 as poor; it is the single reason the article page scores 59 on mobile.
- **Confidence:** Confirmed (Lighthouse `layout-shifts`: `div.rd-page > div.amore` with a score of 0.295; the footer 0.008).
- **Where:** `pages/InsightDetail.tsx` lines 168–195: the "More insights" block renders as soon as the article list is known, while the body is still being fetched; when the body arrives it pushes the block down by its full height.
- **What happens:** On a phone the reader sees the related-articles list jump down the page about a second after the heading appears.
- **Why it matters:** A visible jump, and the lab score Google uses as a ranking signal for the article pages.
- **Fix:** show the block only once the body has rendered (the share link and small print already wait the same way, line 155).

```diff
--- a/pages/InsightDetail.tsx
+++ b/pages/InsightDetail.tsx
@@ -165,7 +165,7 @@
         }
         sections={sections}
       >
-        {related.length > 0 && (
+        {related.length > 0 && parts && !error && !bodyLoading && (
           <div className="amore pad">
             <section className="sec" aria-labelledby="more-insights">
               <div className="sec-h">
```

- **Effort:** small. **Risk:** low; the related list appears with the body instead of before it. I did not re-run Lighthouse on the patched build; the shifting element is simply absent until the body is present. The mobile page also has 630 ms of total blocking time, spent parsing and rendering the markdown on the main thread; that is a larger change (splitting the markdown chunk or rendering the body to HTML at build time) and is not proposed here.
- **Test to add:** in `pages/InsightDetail.test.tsx`, while the body fetch is pending assert that "More insights" is not in the document.

#### PERF-03 — The `ui-vendor` chunk (lucide-react) is preloaded on every page and never rendered

- **Severity:** Low — 9.7 kB (2.8 kB gzip) on every first visit.
- **Confidence:** Confirmed (`constants/services.tsx` lines 2–17 import sixteen lucide icons into `Icon:` fields; no file renders `item.Icon` or `page.Icon` — searched `pages/`, `components/`, `hooks/`, `utils/`; the icons the site shows come from `components/redesign/icons.tsx`; `dist/index.html` modulepreloads `ui-vendor-*.js`).
- **Where:** `constants/services.tsx` lines 2–17 and each `Icon:` line; `types/index.ts` lines 3–24 and 92 (`IconComponent`, `ServiceItem.Icon`, `ServicePage.Icon`); `vite.config.ts` lines 56–58 (the `ui-vendor` chunk rule); `package.json` (`lucide-react`).
- **Fix:** no diff — it touches 16 data entries and three type declarations and is best done as one tidy-up: delete the `Icon` fields and the import from `constants/services.tsx`, the `IconComponent` type and the two `Icon` members from `types/index.ts`, the `ui-vendor` rule from `vite.config.ts`, and `lucide-react` from `package.json` (`npm uninstall lucide-react`); then update `CLAUDE.md`, which lists `ui-vendor` among the manual chunks. `tsc` will point at every remaining use.
- **Effort:** small. **Risk:** low. **Test to add:** none; the build output will no longer contain `ui-vendor`.

#### PERF-04 — The founder's 723 kB source photograph is published

- **Severity:** Low.
- **Confidence:** Confirmed (`public/images/founder-source.jpg`, 1080×1920, 723 KB, is a PNG with a `.jpg` name; nothing links to it, but it is served at `https://casagar.co.in/images/founder-source.jpg`; the responsive `founder-400/800/1080` files are generated from it by `scripts/generate-responsive-images.ts`).
- **Why it matters:** A full-size original of the proprietor's photograph is one guess away for anyone, and it is deployed with every build.
- **Fix:** no diff; move the file out of `public/` (for example to `assets-src/founder-source.jpg`, ignored or not as you prefer) and change the `sourcePath` in `scripts/generate-responsive-images.ts` to match. See Questions, Q9.
- **Effort:** small. **Risk:** none. **Test to add:** none.

### 3.6 Security and privacy

Checked and in order (details in section 4): the headers score A+ on securityheaders.com; the CSP has no `unsafe-inline` for scripts and no third-party script sources; every article and FAQ answer passes through `rehype-sanitize` or the site's own escaper; there are no secrets in the repository; the forms carry a honeypot and a rate limit; the CSP report endpoint accepts only JSON of bounded size.

#### SEC-01 — The build is pinned to Node 20, which is past end of life

- **Severity:** Medium — Node 20 stopped receiving security fixes in April 2026 (nodejs.org release schedule, read on the day of the audit: v20 "EOL"). The site itself is static, so the exposure is to the build machine and CI, not to visitors; but the Netlify Prerender extension (SEO-02, route 1) and new tool versions will start to need 22.
- **Confidence:** Confirmed.
- **Where:** `package.json` line 7 (`"node": "20.x"`), `netlify.toml` line 4 (`NODE_VERSION = "20"`), `.github/workflows/ci.yml` line 23 (`node-version: [20.x]`), `CLAUDE.md` ("Node 20.x is pinned").
- **Fix:** the toolchain was run end to end on Node 22.22 in the audit container (`npm ci`, `tsc`, ESLint, Vitest, `vite build`, the four build scripts) with no change in output, so the pin can move.

```diff
--- a/package.json
+++ b/package.json
@@ -4,7 +4,7 @@
   "version": "0.0.0",
   "type": "module",
   "engines": {
-    "node": "20.x"
+    "node": "22.x"
   },
   "scripts": {
     "dev": "vite",
--- a/netlify.toml
+++ b/netlify.toml
@@ -1,7 +1,7 @@
 # MNT-6: pin the Node version so Netlify's build matches package.json engines
-# (20.x) and CI, instead of relying on Netlify's shifting default.
+# (22.x) and CI, instead of relying on Netlify's shifting default.
 [build.environment]
-  NODE_VERSION = "20"
+  NODE_VERSION = "22"

 [[redirects]]
   from = "/faq"
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -20,7 +20,7 @@
     runs-on: ubuntu-latest
     strategy:
       matrix:
-        node-version: [20.x]
+        node-version: [22.x]

     steps:
       - name: Checkout
```

- **Effort:** small. **Risk:** low; also update the sentence in `CLAUDE.md`, and install Node 22 on your computer before the next local build (`engines` will otherwise warn). `sharp` (used by two build scripts) ships prebuilt binaries for Node 22; it installed and ran in the container.
- **Test to add:** none; CI runs on the new version.

#### SEC-02 — `npm audit` reports 24 advisories; the ones in shipped code are fixed by `npm audit fix`

- **Severity:** Medium — `react-router` 7.15 is in the browser bundle and carries six published advisories (CSRF via document requests, open redirect via backslash in `<Link>`/`useNavigate`, RSC and SSR issues, route-matching denial of service). Every `<Link>` target on this site is a constant from the code, there is no server rendering and no data router, so I found no path by which a visitor could trigger any of them; the finding is about keeping a current dependency and a clean audit, not an observed exploit.
- **Confidence:** Confirmed (`npm audit` on `dec45eb`: 24 vulnerabilities — 2 low, 4 moderate, 16 high, 2 critical; `react-router 6.0.0–7.18.1` high, fix available via `npm audit fix`; the rest are in `vite`/`esbuild`/`vitest`/`vite-node`/`tinypool`/`sharp`/`postcss`/`form-data`/`js-yaml`/`nanoid`/`braces`, all build-time or test-time only).
- **Where:** `package-lock.json`; `package.json` line 28 (`"react-router-dom": "^7.15.0"`).
- **Fix:** no diff (a lockfile change). In a scratch copy, `npm audit fix` updated `react-router` and `react-router-dom` to 7.18.4 and changed only `package-lock.json`; after it, `tsc`, the 187 tests and `vite build` all passed, and 13 advisories remain (4 moderate, 7 high, 2 critical), every one in build or test tooling. Those need `npm audit fix --force`, which moves to Vite 8 and Vitest 4 and is a separate, larger upgrade; it is not proposed here.
- **Effort:** small. **Risk:** low (minor version within the same major; the tests exercise routing on every page). **Test to add:** consider adding `npm audit --omit=dev --audit-level=high` as a CI step so that advisories in shipped code fail the build while tooling advisories do not.

#### SEC-03 — The privacy policy describes a feature that does not exist

- **Severity:** Low — an inaccurate statement in a legal document.
- **Confidence:** Confirmed (`pages/Privacy.tsx` line 107: "Articles you save on the Insights page."; no saving or bookmarking exists on `/insights` or anywhere else — searched for `localStorage`, `saved`, `bookmark` in `pages/` and `hooks/`; the only stored items are the rate-limit timestamps and the encrypted form draft, which the two neighbouring list items describe correctly).
- **Fix:**

```diff
--- a/pages/Privacy.tsx
+++ b/pages/Privacy.tsx
@@ -104,7 +104,6 @@
         </p>
         <ul>
           <li>When you last sent a form, so that one browser can’t send dozens in a row.</li>
-          <li>Articles you save on the Insights page.</li>
           <li>
             An unfinished contact or careers form, encrypted, so that reloading the page doesn’t lose it. It is deleted
             when you close the browser tab.
```

- **Effort:** small. **Risk:** none; `components/redesign/content.ts` holds the legal "last updated" date, which you may wish to advance. If UX-01 is applied, add a line for the remembered scroll position ("Where you were on each page, so that the back button returns there; deleted when you close the tab.").
- **Test to add:** none.

#### SEC-04 — The map iframe sends the full page address to Google as referrer

- **Severity:** Nit — the address is `/contact`, which carries nothing personal.
- **Confidence:** Confirmed (`components/redesign/OfficeMap.tsx` line 17: `referrerPolicy="no-referrer-when-downgrade"`, while the site's header policy is `strict-origin-when-cross-origin`).
- **Fix:**

```diff
--- a/components/redesign/OfficeMap.tsx
+++ b/components/redesign/OfficeMap.tsx
@@ -14,7 +14,7 @@
       title={`Map showing the office of ${CONTACT_INFO.name}`}
       src={CONTACT_INFO.geo.mapEmbedUrl}
       loading="lazy"
-      referrerPolicy="no-referrer-when-downgrade"
+      referrerPolicy="strict-origin-when-cross-origin"
       allow="geolocation 'none'"
       sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
       allowFullScreen
```

- **Effort:** small. **Risk:** low; Google's embed does not require the full referrer (it works with the site's header policy applied to every other request). Verify the map still loads on the preview deploy. **Test to add:** none.

### 3.7 Code health

#### CODE-01 — Exports and files nothing uses

- **Severity:** Low.
- **Confidence:** Confirmed (each name searched across the repository excluding its own definition and tests).
- **Where:** `utils/markdownToHtml.ts` `extractMarkdownHeadings`; `utils/validation.ts` `sanitizeInput`, `minLength`, `percent`; `utils/logger.ts` `report`, `getLogs`; `hooks/useFormValidation.ts` `validate`, `clearErrors`, `validateOnChange`; `hooks/useFormDraft.ts` `hasDraft`; `hooks/useRateLimit.ts` `attemptsRemaining`, `resetTime` (returned, never read by Contact or Careers); `types/react-augmentation.d.ts` (empty file); `scripts/tidy-repo-root.sh` (moves files that no longer exist); the `Icon` fields in `constants/services.tsx` (PERF-03).
- **Why it matters:** `CLAUDE.md`'s own rule: "dead code and duplication should not accumulate".
- **Fix:** no diff; delete each after confirming with `tsc` and the tests. `attemptsRemaining`/`resetTime` are worth keeping only if a future message shows them to the visitor.
- **Effort:** small. **Risk:** none. **Test to add:** none.

#### CODE-02 — `index.css` print rules refer to classes from the removed design

- **Severity:** Low — but one of these rules (`button`) is the cause of PRINT-01.
- **Confidence:** Confirmed.
- **Where:** `index.css` lines 83–187: `.max-w-7xl`, `.max-w-5xl`, `.max-w-4xl`, `.container`, `.lg\:col-span-7`, `.lg\:col-span-5`, `.col-span-1`, `.col-span-2`, `.sticky-sidebar`, `.print-hidden`, `.print-bg-force`, `.border`, `.min-h-screen`, `.max-h-0`, `.overflow-hidden`, `.grid` — none is used by any file in `tailwind.config.ts`'s content list or by `redesign.css`'s markup (searched `pages/`, `components/`); `@page` is declared here and again in `redesign.css`. The generic rules (`div, span, label { background: transparent !important }`, `.grid { display: block }`) also override the print layout that `redesign.css` lines 3881–4141 set with care.
- **Fix:** no diff beyond PRINT-01's one line; retire the block down to `@page`, `body` colours and the `nav, footer, iframe, [role='dialog'], button:not(.qb):not(.foldbtn)` hide list, and leave page-specific print styling to `redesign.css`. Print the FAQ, a checklist, a calculator estimate and an article before and after.
- **Effort:** small. **Risk:** low. **Test to add:** none.

#### CODE-03 — `README.md` describes the previous design

- **Severity:** Low.
- **Confidence:** Confirmed (`README.md` refers to `constants/resources.ts`, `SERVICE_DETAILS`, `constants/insights.ts` and `npm install`; the first three do not exist — resources live in `constants/resources/*.ts`, services in `SERVICE_PAGES`, articles in `public/data/insights.json`; the lockfile is for `npm ci`).
- **Fix:** no diff; rewrite the "layout" and "content" parts from `CLAUDE.md`, which is accurate.
- **Effort:** small. **Risk:** none.

#### CODE-04 — Nine ESLint warnings

- **Severity:** Nit.
- **Confidence:** Confirmed (`npm run lint`: 0 errors, 9 warnings).
- **Where:** `react-hooks/set-state-in-effect` in `components/TopProgressBar.tsx:11`, `hooks/useArticleBody.ts:28`, `hooks/useRateLimit.ts:35`, `hooks/useReducedMotion.ts:17`; `react-hooks/purity` in `hooks/useRateLimit.ts:44`; `no-explicit-any` in `config/site.ts:1`, `hooks/useFormValidation.ts:25`, `scripts/validate-services-schema.ts:5`; `no-unused-vars` for `mode` in `vite.config.ts:9`.
- **Fix:** the `vite.config.ts` warning is removed by the SEO-04 diff. The four `set-state-in-effect` and the `purity` warnings are the rules `eslint.config.js` deliberately keeps at "warn" (the ratchet described in `CLAUDE.md`); they are listed here so the count is known, not as defects. The three `any`s can be typed (`import.meta` in `config/site.ts` is `ImportMeta`; the validator's `any` can be `unknown`).
- **Effort:** small. **Risk:** none.

#### CODE-05 — Parts of the site have no tests

- **Severity:** Low — a suggestion, not a defect.
- **Confidence:** Confirmed (file list).
- **Where:** `components/redesign/RdHeader.tsx` and `RdFooter.tsx` (menu open/close, focus trap, Escape, focus return, sticky bar), `components/SEO.tsx` (what ends up in the head), `App.tsx` `RouteHandler` (scroll, focus, announcement), `hooks/useFormDraft.ts`, `hooks/useRateLimit.ts`, `pages/ResourceTools/TDSRates.tsx`, `pages/ChecklistDetail.tsx`, `scripts/*.ts`, `netlify/functions/csp-report.ts`.
- **Fix:** no diff; the "Test to add" lines in this report are the first set to write — they cover SEO-01, UX-01, UX-02, A11Y-05, A11Y-06, DES-02, DES-03, PRINT-01, SEO-02, SEO-03 and PERF-02.
- **Effort:** medium in total. **Risk:** none.

### 3.8 Content

Checked and in order: the copy is free of marketing words, superlatives and comparisons; spelling is consistent British English; dates, section numbers and rates agree between the pages that repeat them (the FAQ, the services and the Resources data) and with `AUDIT-RESOURCES-LAW.md`; the office address, phone, email, FRN and membership number are the same everywhere they appear (`config/contact.ts` is the single source). The tax-law content itself was not audited (see section 5 and Questions, Q11).

#### CON-01 — Page titles follow three different patterns

- **Severity:** Nit.
- **Confidence:** Confirmed.
- **Where:** `pages/Contact.tsx` line 432 (`Contact Us | …`, title case, where every other page uses sentence case: "Contact us" is the menu and heading wording) and 433 (the description capitalises "Audit, Tax, GST and Business Advisory"); `pages/FAQ.tsx` line 17 (`CA FAQs | Tax, GST, Audit - Sagar H R & Co., Mysuru`, with a hyphen where every other title uses " | "); `pages/InsightDetail.tsx` line 102 (`<title> | Insights`, the only titles without the firm's name).
- **Fix:**

```diff
--- a/pages/Contact.tsx
+++ b/pages/Contact.tsx
@@ -429,8 +429,8 @@
   return (
     <div className="rd-page">
       <SEO
-        title={`Contact Us | ${CONTACT_INFO.name}`}
-        description="Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp."
+        title={`Contact us | ${CONTACT_INFO.name}`}
+        description="Contact Sagar H R & Co. in Mysuru for audit, tax, GST and business advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp."
         canonicalUrl="https://casagar.co.in/contact"
         ogImage="https://casagar.co.in/og-contact.png"
         breadcrumbs={[
--- a/pages/FAQ.tsx
+++ b/pages/FAQ.tsx
@@ -14,7 +14,7 @@

 const FAQ_CANONICAL_URL = `${SITE_URL}/faqs`;
 const FAQ_OG_IMAGE = `${SITE_URL}/og-faq.png`;
-const FAQ_TITLE = 'CA FAQs | Tax, GST, Audit - Sagar H R & Co., Mysuru';
+const FAQ_TITLE = 'FAQs | Sagar H R & Co.';
 const FAQ_DESCRIPTION =
   'Answers on income tax, GST, company and LLP filings, tax notices, appeals and trust registration from Sagar H R & Co., Chartered Accountants in Mysuru.';

--- a/pages/InsightDetail.tsx
+++ b/pages/InsightDetail.tsx
@@ -99,7 +99,7 @@
   return (
     <>
       <SEO
-        title={`${insight.title} | Insights`}
+        title={`${insight.title} | ${CONTACT_INFO.name}`}
         description={insight.summary}
         ogType="article"
         noindex={Boolean(error)}
```

- **Effort:** small. **Risk:** low; these are the wording choices you may prefer to make yourself (Questions, Q7). The FAQ page test asserts the title (`pages/FAQ.test.tsx`), so update it in the same change; if SEO-02 route 2 is applied, update the same strings in `scripts/generate-route-html.ts`.
- **Test to add:** none beyond the existing title assertions.

#### CON-02 — Three straight apostrophes among curly ones

- **Severity:** Nit.
- **Confidence:** Confirmed (the site uses ’ throughout — 23 files; the exceptions are `public/content/insights/tds-new-act-renumbering-thresholds.md` lines 47 ("firm's") and 71 ("payee's"), and the rate-limit toast in `pages/Contact.tsx` line 409 ("You've")).
- **Fix:**

```diff
--- a/public/content/insights/tds-new-act-renumbering-thresholds.md
+++ b/public/content/insights/tds-new-act-renumbering-thresholds.md
@@ -44,7 +44,7 @@

 - **Rent paid by individuals.** Individuals and HUFs who are not liable to tax audit deduct 2% on rent above ₹50,000 a month (the old section 194-IB), not 10%.
 - **Manpower supply.** The Finance Act, 2026 added the supply of manpower to the definition of "work" from 1 April 2026. Payments for it now attract TDS at the contractor rates of 1% or 2%.
-- **Payments to partners.** TDS on a firm's payments to its partners has applied since 1 April 2025. Many firms had no history of deducting tax on these payments and should check that they now do.
+- **Payments to partners.** TDS on a firm’s payments to its partners has applied since 1 April 2025. Many firms had no history of deducting tax on these payments and should check that they now do.

 The higher rates for non-filers (old sections 206AB and 206CCA) and TCS on the sale of goods (old section 206C(1H)) were withdrawn from 1 April 2025 and have not returned.

@@ -68,7 +68,7 @@

 ## Payments around 31 March 2026

-Which Act applies depends on when the tax was deductible, which is on credit or payment, whichever is earlier. If an expense was credited to the payee's account on or before 31 March 2026, the 1961 Act applies even if the payment is made later. If tax was deducted on credit under the old Act, it is not deducted again when the payment is made.
+Which Act applies depends on when the tax was deductible, which is on credit or payment, whichever is earlier. If an expense was credited to the payee’s account on or before 31 March 2026, the 1961 Act applies even if the payment is made later. If tax was deducted on credit under the old Act, it is not deducted again when the payment is made.

 ## What to check now

--- a/pages/Contact.tsx
+++ b/pages/Contact.tsx
@@ -406,7 +406,7 @@
           msg = 'The request timed out. Please check your connection and try again.';
         } else if (error.status === 429) {
           msg =
-            error.message || `You've reached the submission limit. Please email us directly at ${CONTACT_INFO.email}`;
+            error.message || `You’ve reached the submission limit. Please email us directly at ${CONTACT_INFO.email}`;
         } else if (error.status === 422 || error.status === 400) {
           msg =
             error.message ||
```

- **Effort:** small. **Risk:** none (the article's `lastmod` in the sitemap moves to the commit date, which is correct).

#### CON-03 — Two government portal names in the Resources index have changed on the portals themselves

- **Severity:** Low.
- **Confidence:** To confirm — read from the portals' own pages on the day of the audit, which can change again.
- **Where:** `constants/resources/links.ts`: "NGO Darpan" (the portal at ngodarpan.gov.in now titles itself "NPO DARPAN"); "ICAI UDIN" (udin.icai.org shows a notice that UDIN generation has moved to the DigiCA platform).
- **Fix:** no diff; confirm against the portals and decide the names and links (Questions, Q11). The links themselves resolve.

### 3.9 ICAI compliance

Sources, all read in this session (details and verbatim text are quoted where relied on): the Chartered Accountants Act, 1949, First Schedule Part I clauses (6) and (7) and Second Schedule Part II clause (1) (ICAI edition, https://resource.cdn.icai.org/75789ca-act-61309.pdf, pp. 114–116 and 122 of the book); the Code of Ethics 2026, 13th edition, Volume I, in force from 1 April 2026 (https://resource.cdn.icai.org/92475coe2026v1.pdf) — Chapter 3, Council Guidelines for Advertisement, 2008 (updated to December 2025), including para 3.1.3 (conditions for a write-up), 3.2.1 (what a write-up may contain), 3.3 (websites, paras 3.3.1–3.3.21) and 3.7.2, and the clause (7) commentary at 2.14.1.7(xvii)–(xviii) (logos); ICAI's standalone copy of the same Guidelines (https://resource.cdn.icai.org/93219cg_advt2008.pdf, identical text); the ESB "Compilation of FAQs on Code of Ethics, 2026" of 28 July 2026 (https://ethics.icai.org/uploads/mt8q1tqa-msxcl9qo-Compilation-of-FAQs-on-Code-of-Ethics-2026.pdf); the Advisory on compliance with the Website Guidelines of 14 October 2020, No. M-626/14/2020 (https://icai.org/post/advisory-website-guidelines-of-the-institute); the Advisory on mentioning fees in advertisements of 28 April 2020 (https://www.icai.org/post/16461); the CA India Logo Manual (https://resource.cdn.icai.org/77406prc62226-caindialogo.pdf). Two cautions: the 14 October 2020 advisory interprets the 2020 edition of the Guidelines and has not been reissued for the 2026 edition; where the 2026 text now expressly permits something the advisory listed (client names with permission, event photographs, push mode for non-exclusive services, government awards), I follow the 2026 text. And I am not a member of the Institute: where a rule turns on interpretation I have put the point under Questions rather than called it a defect.

Checked and in order: no fees, no client names, no testimonials, no superlatives, no "why choose us", no awards, certifications, empanelments, media mentions or affiliations, no event photographs, no videos, no banner advertising, no links to commercial companies' sites (the outbound links are to government and regulatory portals — income tax, GST, GSTAT, CBIC, MCA, EPFO, ESIC, Udyam, TRACES, NGO Darpan, Protean, UTIITSL, UDIN — which 3.3.18 permits, plus the firm's own staff portal, the WhatsApp number, the Google map and the FormSubmit endpoint the forms post to), the firm name carries the suffix "Chartered Accountants" (3.2.1(B)(i)), the FRN and membership number are shown (3.2.1(A)(ii), (B)(ii)), the year of establishment appears only as `foundingDate` in the structured data (permitted on a website: 3.3.7(ii), FAQ Ch. 7 Q15), the services are listed by nature (3.3.7(vi)) and are reached only when a visitor opens the site ("pull", 3.3.3 — the site sends nothing and runs no analytics), job vacancies and articleship are listed (3.3.7(x)), the articles are professional updates (3.3.10), the "Who we work with" list names kinds of client and no client, and the two forms ask for a request from the visitor (3.3.13).

#### ICAI-01 — `priceRange: "₹₹"` in the home page's structured data

- **Severity:** Medium — it is an indication of fees in a form that Google may display beside the firm's name.
- **Confidence:** Confirmed (`pages/Home.tsx` line 54; JSON-LD read from the rendered page: `"priceRange": "₹₹"` on the `AccountingService` node).
- **Rule:** Website guidelines para 3.3.7(xiii): "Fee charged cannot be given" (with an exception only where a regulator requires disclosure); Advisory of 28 April 2020: "the quantum of Fees (including free of charge), whatsoever, should not be mentioned by members in any Advertisement of services or posting of particulars"; ESB FAQ 2026 Ch. 8 Q26 restates it. Second Schedule Part II clause (1) makes a Council guideline binding. The field is invisible on the page, but it is published by the site and is written for display by search engines.
- **Fix:**

```diff
--- a/pages/Home.tsx
+++ b/pages/Home.tsx
@@ -51,7 +51,6 @@
       },
       image: `${SITE_URL}/og/og-default.png`,
       description: HOME_DESCRIPTION,
-      priceRange: '₹₹',
       availableLanguage: CONTACT_INFO.languages,
       areaServed: [
         { '@type': 'City', name: 'Mysuru' },
```

- **Effort:** small. **Risk:** none (`priceRange` is optional on `LocalBusiness` types; the schema validator script does not check this file). The Home structured-data test (`pages/Home.test.tsx`) does not assert on `priceRange`.
- **Test to add:** assert the home JSON-LD has no `priceRange`.

#### ICAI-02 — The site's icons are the firm's initial as a monogram

- **Severity:** High — the rule is explicit and the Institute's FAQ names websites; I rate it High because the icons appear in every browser tab, bookmark and home-screen shortcut, and `logo.png` is declared as the firm's logo to search engines.
- **Confidence:** Confirmed as to the facts: `public/favicon.svg` is a serif "S" in cream on a dark rounded square; `scripts/generate-icons.ts` renders it to `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` and `logo.png` (512 px); `index.html` lines 12–15 declare the icons; `pages/Home.tsx` line 50 and `components/SEO.tsx` line 114 declare `logo.png` as the `Organization`/`AccountingService` `logo`. Whether a browser icon is "display material or media" is a reading of the rule, but the rule's own list includes "internet".
- **Rule:** Code of Ethics 2026, Vol. I, 2.14.1.7(xvii): "the Council at its meeting held in December 1997, therefore, decided that the use of logo/monogram of any kind/form/style/design/colour etc. whatsoever on any display material or media e.g. paper stationery, documents, visiting cards, magnetic devices, internet, sign board, by the members in practice and/or the firm of Chartered Accountants, be prohibited. Use/printing of member/firm name in any other manner tantamounting to logo/monogram was also prohibited." ESB FAQ 2026 Ch. 7 Q6 (same words, "internet" included) and Q23: writing the first initial of the firm name in a different style is not permitted. Advertisement guidelines 3.1.3 G: "Monogram of any kind … is not permissible." The 14 October 2020 advisory, item (2): "Writing of Firm name in a manner tantamounting to Logo/Monogram". The one logo a member may use is the CA India logo, on a white background, unaltered (Logo Manual 2023; FAQ Ch. 8 Q34).
- **Fix:** no diff, because the replacement is a decision for you (Questions, Q2). The code change once decided is small: replace `public/favicon.svg` (the four PNGs are regenerated by `npm run icons`), and either remove the `logo` properties from `pages/Home.tsx` line 50 and `components/SEO.tsx` line 114 or point them at the replacement. Options I can see: (a) the CA India logo as the icon — the Logo Manual says the logo must not be shrunk, distorted or recoloured and must sit on white, so a 16 px favicon of it may itself breach the manual; (b) a plain mark that is not a letter and not a logo (for example a square in the site's stone colour) — a browser requires some image, and a neutral one is not a monogram; (c) no icon (browsers then show a generic page symbol). Whatever is chosen, the `logo.png` structured-data declaration should either go or point to the CA India logo file.
- **Effort:** small once decided. **Risk:** none technical. **Test to add:** none.

#### ICAI-03 — The proprietor's biography lists activities other than professional services

- **Severity:** Medium.
- **Confidence:** To confirm — the 2020 advisory is explicit; the 2026 Guidelines are more permissive in wording and the advisory has not been reissued. Your reading, or a question to the ESB, decides it.
- **Where:** `pages/Home.tsx` lines 330–334: "He also teaches CA Foundation and Intermediate students, builds the accounting software the office uses and writes on finance." and "Outside work, he reads fiction and plays cricket."; line 329: "He heads the firm’s litigation and audit work." (for "litigation" see Questions, Q5).
- **Rule:** Advisory of 14 October 2020, item (8), prohibited content: "Mention of activities forming other business or occupation allowed to members in practice e.g. reference of Books authored, teaching activities by the member concerned, etc. (since the website can be utilized for mentioning professional services of members only, and not of other business/occupation carried out by him)". The 2026 write-up list (3.2.1(A)) allows for a member: name, membership number, age, dates of ACA/FCA/COP, recognised qualifications, languages, contact details, photograph, services, positions in a management consultancy company, client names with permission; para 3.3.7(viii) allows "Area of Experience". ESB FAQ 2026 Ch. 8 Q44 adds that "flexibility has now been given to include any other factual details that the member/firm may wish to include", provided they comply with the Act, Regulations, Code and guidelines — which the 2020 advisory is part of until withdrawn. Teaching is a permitted occupation for a member in practice (it is not the activity that is in question, only its mention on the website).
- **Fix:** no diff; if you decide to follow the advisory, delete lines 330–334 (the two paragraphs), leaving the training, qualification and practice lines, which are within 3.2.1(A). The tests for the home page do not assert on this text.
- **Effort:** small. **Risk:** none technical.

## 4. Checked and found in order

One line per item; "all pages" means the 47 sitemap addresses plus the five not-found variants (`/no-such-page`, `/services/no-such-service`, `/resources/no-such-tool`, `/resources/checklist/no-such-checklist`, `/insights/no-such-article`).

**Layout and rendering**

- No horizontal overflow and no element outside the viewport on all pages at 320, 360, 390, 768, 1024, 1440, 1920 and 2560 px (local build; live spot-checked in your Chrome at the window's own width).
- No console errors or failed requests on any page in the local build, other than the Google map iframe's "geolocation is not allowed" permissions-policy message, which is the site's own policy refusing the map's request, as intended.
- The first-visit splash shows once per tab, is `aria-hidden`, and is skipped under `prefers-reduced-motion`; the custom cursor is off under reduced motion and on touch devices.
- The sticky bar appears on scroll-up; the phone menu is portalled, traps focus, closes on Escape and returns focus to "Open menu", and restores body scrolling.
- Every page has exactly one `<h1>`; heading levels are in order on every page except the five articles (A11Y-05).
- Print: the GST estimate prints on one sheet; an article prints in four clean pages; the calculators hide their controls and show the estimate (apart from PRINT-01 and PRINT-02).

**Accessibility**

- axe-core (WCAG 2.0/2.1/2.2 A and AA rules plus best practice) reports nothing on any page at any width beyond what A11Y-01 to A11Y-05 describe; the Lighthouse colour-contrast flag on the footer's large "Sagar H R & Co." is a false positive — the element is `aria-hidden` decoration and the name is repeated as real text in the same footer.
- Landmarks: `header`, `nav` (labelled), `main#main-content` (focusable, focused on every route change), `footer`, `role="search"` on the search rows, labelled `form`s.
- The skip link is the first tab stop and moves focus to the main content.
- Every form field has a visible label; errors are announced through `aria-describedby` and a live region; the success state is announced.
- Target sizes: every control is at least 24 × 24 px or falls under the inline/spacing exceptions of WCAG 2.5.8.
- Reflow at 320 px: no two-dimensional scrolling on any page.
- Route changes announce the page name in the live region (wording aside, A11Y-06).
- Deep links work and move focus: `/faqs#<question-id>` opens and focuses the question; `/#about` scrolls to and focuses the About section; `/contact?subject=GST` preselects the subject and focuses the name field; `/resources/due-dates#<month>` selects the month.
- Every internal link on every page (47 distinct addresses, including those inside opened FAQ answers) leads to a real page, none to the not-found screen.
- Images: every `<img>` has an `alt`; the portrait is delivered as AVIF/WebP/JPEG at 400/800/1080 px with `width`/`height` set.

**SEO**

- `sitemap.xml` lists 47 addresses with `lastmod` from git; `robots.txt` allows all and names the sitemap; `rss.xml` and `atom.xml` are well-formed and list the five articles.
- Every page sets a canonical, `index, follow`, Open Graph and Twitter tags once rendered; the not-found screens set `noindex, follow`.
- JSON-LD parses on every page: `AccountingService` + `Person` + `WebSite` on the home page, `BreadcrumbList` on every inner page, `Service` on service pages, `FAQPage` on the FAQ, `Blog`/`BlogPosting` on the articles, `JobPosting` on careers (both roles, with `validThrough` 31 December 2026), `WebApplication`/`WebPage` on the tools.
- The four page images (`og-services.png`, `og-contact.png`, `og-careers.png`, `og-faq.png`) and the six under `/og/` exist and are 1200 × 630.
- Redirects on the live site: `/faq` → `/faqs`, `/about` → `/#about`, the retired article addresses and the three retired service slugs (`/services/litigation`, `/services/bookkeeping`, `/services/payroll`) all answer 301 to the right place; inside the application the retired service slugs also redirect.
- The sitemap's home entry is `https://casagar.co.in` and the canonical is `https://casagar.co.in/`; the two are the same address under the URL standard, so this is noted, not a defect.
- The external links that were opened (Protean/TIN, GSTAT e-filing, CBIC-GST, EPFO, UTIITSL) resolve; one exception is in section 5.

**Performance**

- Lighthouse (local build) 89–99 on five of six pages, desktop and mobile; the article page is the exception (PERF-02).
- Routes are lazy-loaded; the layout's stylesheet is split from the page bundle; fonts are self-hosted, preloaded and subset to Latin; `react-vendor` is the only large chunk and is shared.
- `/data/*`, `/content/*` and `/og/*` carry cache headers; `index.html` is `max-age=0`, as it should be.

**Security and privacy**

- securityheaders.com grade A+ for https://casagar.co.in on the day of the audit: Content-Security-Policy, Strict-Transport-Security (two years, `includeSubDomains`, `preload`), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, X-Frame-Options `DENY`, X-Permitted-Cross-Domain-Policies.
- CSP: `script-src 'self'` with no `unsafe-inline` or `unsafe-eval`; the one inline `<style>` is pinned by hash and `scripts/check-csp-hash.ts` verifies the hash on every build (it passes); `frame-src` allows only Google Maps; `connect-src` only FormSubmit; `form-action 'self'`; `frame-ancestors 'none'`; violation reports go to the site's own function.
- Article markdown passes through `rehype-sanitize` (default schema plus one class); FAQ answers go through the site's own escaper before whitelisted tags are added; external links in articles open with `rel="noopener noreferrer nofollow"`.
- No secrets, tokens or keys in the repository or the built output; the only outbound endpoints are FormSubmit and the map.
- Forms: honeypot field hidden from people (`display: none`, zero width) and present in the post; client-side rate limit (persisted); blank submit, bad phone and oversize message are rejected with field errors; when offline the submit is refused with a toast and the draft is kept; the draft is encrypted in `sessionStorage` and cleared on success; one request goes to `https://formsubmit.co/ajax/…` with the filled fields only (the request was intercepted in the test browser, not delivered).
- The CSP report function accepts POST only, logs at most 2,000 characters of a report and at most one report every ten seconds, and answers 204 with an empty body, so a flood of spoofed reports cannot run up log volume.
- No `public/_redirects` file, as `CLAUDE.md` requires.
- No analytics, no cookies, no third-party scripts; the privacy policy's description of what the browser stores is accurate apart from SEC-03.

**Code and process**

- `npm ci`, `tsc --noEmit`, ESLint (0 errors), 187 tests, `lint:schema`, `check-csp-hash` and `vite build` all pass on `dec45eb`, on Node 20 and on Node 22.
- `CLAUDE.md` is accurate about the structure, the splash, the cursor, Tailwind's content list, the CSP hash, the sandbox caveat and the deployment; the two statements that will need updating after the fixes are the Node version (SEC-01) and the `ui-vendor` chunk (PERF-03).
- The shell files that use Tailwind classes (`App.tsx`, the loaders, the splash, the toasts, the error screens) are all in `tailwind.config.ts`'s content list, so none of their classes is purged.
- `AUDIT-RESOURCES-LAW.md` records a source and a decision for every rate and date used by the tools, and the figures in `constants/resources/` match it.

**Content**

- No superlatives, comparisons, testimonials, client names, fees, awards, certifications or "why choose us" anywhere in the copy, the FAQ answers, the articles or the structured data (apart from ICAI-01).
- British spelling throughout; the same office address, phone, email, hours, FRN and membership number on every page, from `config/contact.ts`.
- The service pages' "common questions" link to FAQ entries that exist and open on arrival (the internal-link check above covers them).
- The legal pages' "Last updated 8 October 2026" matches `components/redesign/content.ts`; the three pages' numbered contents lists match their sections.

## 5. Not checked, or could not be verified, and why

- **The live site at all seven widths.** The width sweep ran against a local build of the audited commit; the live site's assets are byte-identical builds of the same commit (same hashed file names), and live pages were spot-checked in your Chrome, but Chrome's window could not be resized from the audit session, so the live site was not seen at 360 or 2560 px.
- **Live response headers** were read through securityheaders.com and your Chrome's network panel; the audit container cannot reach casagar.co.in directly (the proxy refuses the host).
- **Netlify behaviour** — that an existing `dist/<route>/index.html` is served ahead of the `/*` rewrite (SEO-02), that a `status = 404` fallback works (SEO-05), that the Prerender extension does what its page says — is taken from Netlify's documentation, quoted where relied on, and was not exercised on your site.
- **Google's view**: Search Console, the Rich Results test and the URL inspection tool need your account and were not run; structured data was parsed and checked against schema.org field names only.
- **Field performance** (what real visitors experience) does not exist, because the site runs no analytics; Lighthouse lab numbers from the local build stand in for it.
- **Browsers**: everything was tested in Chromium (headless, and your Chrome). Safari and Firefox were not opened; printing was tested as Chromium's PDF output only.
- **Assistive technology**: axe-core, ARIA inspection and the live-region text were checked; no session with NVDA, JAWS or VoiceOver was run.
- **The ICAI record** of FRN 026642S, membership number 273511 and the registered address (website guideline 3.3.21) was not compared with the site; the members' and firms' directories were not consulted.
- **The `@casagarhr` handle** named in the Twitter tags was not checked for existence.
- **The GSTAT portal link** (`gstat.gov.in`) could not be verified: the container's connection failed with a certificate error, which may be the container's proxy rather than the portal.
- **Netlify environment variables** (`VITE_FORM_ENDPOINT`, `VITE_SITE_URL`) are not visible from the repository; whether the forms post to the plain address or to FormSubmit's private alias in production was not determined.
- **FormSubmit delivery**: no message was sent (it would have emailed you); the request's endpoint and payload were inspected in the test browser and the request dropped.
- **The tax-law content** of the FAQ, the articles, the rates and the calculators was not audited against the law, as the brief directs; only internal consistency and agreement with `AUDIT-RESOURCES-LAW.md` were checked (see Questions, Q11, for the law audit that is due).
- **The scroll-restore fix** (UX-01) worked in four of five navigation pairs tested; the fifth was not diagnosed.
- **Lighthouse after the fixes** was not re-run; the behaviour of each fix was checked directly instead.

## 6. Suggested order of work

Each batch is one pull request. Run `npm run build` locally only if you are ready to restore `public/` afterwards; `npx vite build` is enough to check that the site builds. Preview every batch on a Netlify deploy preview before merging.

1. **CSS only, no behaviour change** (safest, most visible): A11Y-01, A11Y-02, A11Y-03, A11Y-04, DES-01, PRINT-01 (the two CSS parts), PRINT-02. Open the FAQ, a service page, the contact form and a checklist, on screen and in print preview, and look at the links, the focus ring and the field lines before merging.
2. **Small code fixes, each with a test**: DES-02, DES-03, A11Y-05, A11Y-06, SEO-01, SEO-03, SEO-04 (which also clears the lint warning), PERF-02, UX-02, SEC-03, SEC-04, PRINT-01 (the FAQ `beforeprint` part), CON-02.
3. **Configuration**: PERF-01 (cache headers), SEC-01 (Node 22 in three files and `CLAUDE.md`), SEC-02 (`npm audit fix`, lockfile only). One deploy preview; check the network panel for `immutable` and that the build log shows Node 22.
4. **Decisions first, then small edits**: ICAI-01 (remove `priceRange`; no decision needed, it can go in batch 2 if you agree), ICAI-02 (icons, after Q2), ICAI-03 (biography, after Q4), CON-01 (titles, after Q7), CON-03 (portal names, after Q11), PERF-04 (photograph, after Q9).
5. **Medium changes, one per PR**: SEO-02 (either the Netlify extension — no PR — or the build-time route files, after Q1), UX-01 (scroll restore, after Q12, with the caveat in the finding), PERF-03 (remove lucide-react and the `ui-vendor` chunk), SEO-05 (only after SEO-02 route 2, and only if you want true 404s).
6. **Housekeeping**: CODE-01 (dead code), CODE-02 (retire the old print rules), CODE-03 (README), CODE-04 (the three `any`s), CODE-05 (the tests listed in section 3), and then a separate law audit (Q11).

## 7. Questions for you

1. **Link previews (SEO-02).** Netlify's Prerender extension (a setting; crawler requests run a function each time) or the build-time route files (code in the repository, duplicated titles to keep in step)? If you have no preference, the build-time files are the one I can vouch for from the code; the extension is the one with no code to maintain.
2. **Icons (ICAI-02).** What should replace the "S"? A plain mark in the site's colours, the CA India logo (with the caveat in the finding), or no icon. And should `logo.png` be removed from the structured data or point at the CA India logo?
3. **Portrait (website guideline 3.3.9, advisory item 4).** The home page photograph is a black-and-white head-and-shoulders portrait on a black background in a tall crop, shown in a 4:5 frame. The guideline permits "passport style photographs" and the 2020 advisory prohibits "photographs other than passport style". Whether this framing counts as passport style is your reading; if not, the fix is a different crop of the same photograph.
4. **Biography (ICAI-03).** Do you follow the 14 October 2020 advisory's item (8) and remove the teaching, software, writing and hobbies lines, or rely on the 2026 "any other factual details" flexibility? A one-line query to the ESB would settle it.
5. **"Litigation".** The biography says "He heads the firm’s litigation and audit work". Representation before tax authorities and tribunals is within a member's practice, but "litigation" is also the word for court practice, which a member in practice may not hold out as offering. "Notices, appeals and audit work" would say the same thing in the site's own vocabulary.
6. **Fee wording.** The FAQ answer "How are your fees worked out?" (`constants/faq.ts` line 97: "we give you a fixed quote in writing… There are no charges beyond what we agree") and the contact page's "You receive a written quote — It sets out a fixed fee and the scope of work" (`pages/Contact.tsx` lines 771–773) describe how fees are set and state no amount. The rules bar the quantum of fees, including "free of charge". I read these as compliant; please confirm you are content with them, since they are the closest the site comes to the subject.
7. **Titles (CON-01).** Do you want "Contact us | Sagar H R & Co.", "FAQs | Sagar H R & Co." and the firm's name on article titles, or other wording? The current FAQ title ("CA FAQs | Tax, GST, Audit - …") was presumably written for search; the change is yours to make or not.
8. **Three phrases.** "and many more" closing the "Who we work with" list (`pages/Services.tsx` line 103); "We usually reply within a working day" (`pages/Contact.tsx` line 503, and the success message's "within a working day"); the careers heading "Varied work" (`pages/Careers.tsx` line 73). None is a superlative or a comparison; each is a claim about the firm. I see no rule they breach; confirm they are statements you are prepared to stand behind.
9. **The source photograph (PERF-04).** Move `public/images/founder-source.jpg` out of `public/` (it is then not published), or leave it?
10. **The WhatsApp link** opens with the pre-filled text "Hi, I would like to book a consultation." (`config/contact.ts` line 36). It is written as the visitor's own words, and I found no ICAI rule on it; is "book a consultation" the wording you want, given that the site elsewhere says "send us a message" and "get in touch"?
11. **A law audit is due.** `AUDIT-RESOURCES-LAW.md` carries an open item to recheck GST rates after the 57th GST Council meeting (reported for 7 October 2026); the UDIN portal shows a migration to DigiCA; the NGO Darpan portal has been retitled NPO DARPAN; and the tools state tax year 2026-27 figures. A separate audit of the FAQ, the articles and `constants/resources/` against the law as it stands is outside this review and should be scheduled before the next filing season.
12. **Back button (UX-01).** Do you want the previous position restored on back/forward (the usual browser behaviour), or is scroll-to-top on every navigation a choice? The fix in the finding works but has the one untraced case.
13. **Node 22 (SEC-01).** Netlify and CI move with the three-file change; your own computer needs Node 22 installed before the next local build or commit (the Husky hook runs `tsc`).
14. **The `@casagarhr` handle** in the Twitter tags (`components/SEO.tsx` lines 182–183): does the account exist? If not, remove the two tags.
15. **FormSubmit.** The forms post to `https://formsubmit.co/ajax/mail@casagar.co.in` unless `VITE_FORM_ENDPOINT` is set in Netlify. The address is public on the site anyway, so this is not a disclosure; FormSubmit's private alias only reduces direct spam to the address. Is the variable set in Netlify, and do you want it to be?
16. **ICAI records (3.3.21).** Please confirm that the FRN, membership number and address on the site match the Institute's records as currently held, which I could not check.
