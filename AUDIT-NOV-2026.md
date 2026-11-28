# AUDIT-NOV-2026.md — audit of casagar.co.in and the fix prompts

Audited on 28 November 2026 at commit `9feb361` ("Merge pull request #29 from hrsagar28/fix/mca-extension"). Nothing in the repository was changed except this file.

## Status after the first round of fixes, 28 November 2026

**Done, in the working folder, not yet committed or published:** NOV-01 (form failure message), NOV-05 (first download), NOV-06 (true "not found"), NOV-07 (keyboard starting point), NOV-08 (cursor in high-contrast mode), NOV-09 (picture caching, phone spacing). That is Prompts 1, 4 and 5: **do not run them again.** Type check, lint (same 5 warnings as before), 228 of 228 tests and the full build pass on these changes; each was also checked in a browser.

- One thing left out of Prompt 5: removing the unused `@axe-core/react` package (it would have rewritten the lock file for no visible gain).
- **Before merging, check NOV-06 on the deploy preview:** a real page such as `/services/gst` must answer 200, and `/no-such-page` must answer 404 and still show "Page not found".

**Still to do:** NOV-03 (Prompt 2, needs your eye on the look), NOV-04 (Prompt 3, plan first), NOV-10 (Prompt 6), and the items that wait for your decision (NOV-02, NOV-11 and the list under "Decisions still with you").

---

Part 1 lists the issues in plain words. Part 2 has one prompt per fix, with code, for the chat that will do the work. In that chat, say: **"Read AUDIT-NOV-2026.md and do Prompt N."**

---

## Part 1. The issues

### How the site stands

The site is in good order. The October audit's findings are fixed, and this round found nothing that stops a visitor from using the site. What follows is a short list, because only these are worth your time.

What was checked and passed, so you know it was looked at:

- **Site's own checks** (on a copy): type check clean, 224 of 224 tests pass, the full build succeeds, no known security advisories in the code that ships to visitors.
- **Every page** (48 addresses and 5 "not found" screens) at phone, tablet, laptop and large-screen widths: no sideways scrolling, no broken images, no browser errors, one title, one description and one main heading each.
- **Accessibility rules** (axe, WCAG 2.2 AA) on every page at phone and laptop width: nothing flagged except the large decorative firm name in the footer, which is hidden from screen readers and is a false alarm.
- **By eye**: home page, a service page, FAQs, Resources, the stamp duty and income tax calculators, TDS rates, due dates, a checklist, contact, careers, an article, the privacy policy and the "not found" page, on desktop and phone. The new stamp duty calculator and the phone menu look right.
- **Working parts**: phone menu (opens, traps the keyboard, closes on Escape), contact form (blank, wrong email, failed send, successful send), FAQ search, back button returning to where you were.
- **Live site** in your Chrome: security headers all present, `www` and `http` forward to `https://casagar.co.in`, old addresses forward correctly, each page serves its own title for WhatsApp previews, files are compressed and cached, the map loads, no browser errors.
- **Speed** (Lighthouse, phone on a slow connection, local copy): 98 home, 96 service page, 87 article page.
- **Leftover code**: almost none. Not worth a clean-up pass.

### The list

Severity: **High** = costs you enquiries or exposes the firm now. **Medium** = a real weakness worth fixing soon. **Low** = small, cheap, do it when convenient.

| ID     | Issue                                                                                                                                                       | Severity  | Size of fix        | Prompt |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ | ------ |
| NOV-01 | When the contact or careers form fails to send, the visitor is told "Our team has been notified", which is untrue, and the message vanishes in five seconds | High      | Small              | 1      |
| NOV-02 | An old copy of the site is still public at `sagar-h-r-co-v2.vercel.app`                                                                                     | High      | No code, 5 minutes | (you)  |
| NOV-03 | On a phone, every calculator shows its answer below the screen while you type                                                                               | Medium    | Small to medium    | 2      |
| NOV-04 | The pages contain no text until scripts run, so AI assistants and some search engines see blank pages                                                       | Medium    | Medium to large    | 3      |
| NOV-05 | Every visitor downloads all FAQ answers, all service text and the whole due-date calendar before the first page appears                                     | Medium    | Small              | 4      |
| NOV-06 | A wrong address answers "OK" with the home page's title instead of "not found"                                                                              | Low       | One line           | 5      |
| NOV-07 | For keyboard users, the starting point on arrival is after the menu, so the menu cannot be reached by pressing Tab                                          | Low       | Small              | 5      |
| NOV-08 | The site's own cursor replaces the Windows pointer even for people using high-contrast mode                                                                 | Low       | Small              | 5      |
| NOV-09 | Small items: the portrait is re-checked with the server on every visit; a spacing slip on phones                                                            | Low       | Small              | 5      |
| NOV-10 | The building and testing tools are three major versions behind and no longer get security fixes                                                             | Medium    | Medium             | 6      |
| NOV-11 | Service page titles are bare ("GST \| Sagar H R & Co.")                                                                                                     | Your call | Small              | 7      |

#### NOV-01 — A failed form send tells the visitor something untrue, then disappears (High)

The forms send through FormSubmit, an outside service. When it fails (it does, from time to time), the visitor sees a small pop-up for five seconds reading **"Server error (500). Our team has been notified."** Nobody is notified; there is nothing on the site that could notify you. For some other failures the pop-up reads "Request failed (403): Forbidden". The visitor is not shown your phone number or WhatsApp at that moment, so the enquiry is simply lost.

The code already has the right wording ("Our contact system is temporarily unavailable. Please email us directly…") but it never shows, because the technical message always takes its place. Your own tests already insist that the site's error screens must not claim anyone was notified; the forms were missed.

_Seen in a test with the sending service made to fail. Where: `utils/api.ts` lines for 5xx and 4xx, `pages/Contact.tsx` and `components/redesign/ApplicationForm.tsx` catch blocks._

#### NOV-02 — The old site is still public on Vercel (High, no code)

`https://sagar-h-r-co-v2.vercel.app/` opened today and showed the old design's title ("Sagar H R & Co. — Chartered Accountants in Mysuru | Audit, Tax, GST & Advisory") and the old "Audit. Taxation. Advisory." opening. It carries no instruction telling search engines to ignore it or which address is the real one.

Two reasons this matters. Search engines can list it beside the real site, with out-of-date text. And whatever was removed from the real site for ICAI reasons since then (the fee indicator, for one) may still be published there under your firm's name.

**What to do:** in the Vercel dashboard, delete that project (or disconnect it from GitHub and delete its deployments). I can check what is in that Vercel account and pause the project for you if you want; say so.

#### NOV-03 — On a phone, the calculators' answers are off the screen (Medium)

On a phone the form comes first and the answer panel comes after it. Typing a rent of ₹25,000 into the stamp duty calculator puts the answer about 880 pixels down a screen that is 800 tall, and with the keyboard open only half of that is visible. The income tax calculator's answer is about 1,400 pixels down. The visitor types and sees nothing happen. This is true of all five calculators. On a desktop the answer sits beside the form and stays in view, so this is a phone-only problem.

**Fix:** a slim strip that stays at the top of the calculator on phones, showing the main figure as it changes, which jumps to the full breakdown when tapped.

#### NOV-04 — No text in the pages until scripts run (Medium)

Each address is served as an empty shell with a title and description; the words appear only after the browser runs the site's scripts. Google runs scripts, so Google reads the pages. Bing does so less reliably. The crawlers behind ChatGPT, Claude and Perplexity generally do not, and that is where a growing share of "CA in Mysuru for a GST notice" questions now go. To them, every page of yours is a title and one sentence, with no services, no FAQ answers, no articles and no links between pages. A visitor whose browser blocks scripts sees a blank dark screen.

**Fix:** at build time, write each page's real text into its file. The scripts then take over as they do today, and nothing changes for an ordinary visitor. This is the largest job on the list. Prompt 3 asks for a plan first, so you can see it before any building starts.

#### NOV-05 — Everything is downloaded before the first page shows (Medium)

The first file every visitor downloads includes all 35 FAQ answers, the text of all 14 service pages, the year's due-date calendar and the careers text, even if they opened only the privacy policy. It happens because the opening screen reads the office address from a shared file that also hands out all of that content.

I tried the fix on a copy: the first file drops from 88 kB to 22 kB (28 kB to 8 kB compressed). Pages that need the content still get it; the others stop paying for it.

#### NOV-06 — Wrong addresses answer "OK" (Low)

`casagar.co.in/anything-wrong` answers with status 200 and the home page's title. The "Page not found" screen then appears, but search engines and link previews read the first answer. The October audit left a note in `netlify.toml` saying this could be switched to a true "404" once each page was confirmed to be served from its own file. I confirmed that on the live site today (`/services/gst` answers with its own title), so the switch is safe.

#### NOV-07 — Keyboard starting point skips the menu (Low)

When a page first opens, the site moves the keyboard's position to the main content. That is right when moving between pages, but on first arrival it means pressing Tab goes straight into the page: the "Skip to content" link and the whole menu are behind the starting point and can only be reached with Shift+Tab. Tested on `/services`: the first Tab lands on the "GST" link in the page, not on the menu.

#### NOV-08 — The site's cursor in high-contrast mode (Low)

The site hides the Windows pointer and draws its own small dot. It already steps aside for people who ask for less motion. It does not step aside for people using Windows' high-contrast mode, who have usually set up a pointer they can see. A one-line condition gives them their own pointer back. The cursor itself stays as you want it for everyone else.

#### NOV-09 — Two small items (Low)

- The portrait is served with "check with the server every time", unlike the fonts and scripts. A week's caching is safe and saves a round trip on return visits.
- On phones, where a section heading sits on a sand-coloured band, the first line under it touches the band with no gap. Seen on TDS rates ("Due dates and forms") and the stamp duty page ("How it is worked out").

#### NOV-10 — Build and test tools are well behind (Medium, not urgent)

Vite (which builds the site) is on version 5; the current one is 8. Vitest (which runs the tests) is on 1; the current one is 5. `npm audit` reports 15 advisories in these tools, two rated critical. None of this reaches visitors: it concerns the tools on your computer and on the build server, and the code that ships has no advisories. But version 5 no longer receives fixes, and the longer the gap, the harder the jump. Do it once, in its own pull request.

#### NOV-11 — Service page titles (your call)

The titles follow the pattern you chose in October: "GST | Sagar H R & Co.". A title is the most-read line in a search result, and this one says neither "Chartered Accountants" nor "Mysuru". Something like "GST registration, returns and notices | Sagar H R & Co., Chartered Accountants, Mysuru" is factual, within the ICAI rules, and matches what people type. If you agree, Prompt 7 does it in one place.

### Decisions still with you

These need your answer, not code. The first three are carried over from October.

1. **The "S" icon (ICAI).** The browser-tab icon and `logo.png` are still the firm's initial as a monogram, which the Code of Ethics prohibits. Decide the replacement (a plain mark in the site's colours, or none).
2. **The biography lines (ICAI).** "He also teaches CA Foundation and Intermediate students, builds the accounting software the office uses and writes on finance" and "Outside work, he reads fiction and plays cricket" are still on the home page. The 2020 advisory bars mention of teaching and other occupations. Also "heads the firm's litigation and audit work": "notices, appeals and audit work" says the same without the court-practice word.
3. **The `@casagarhr` handle** named in every page's share tags. If the account does not exist, the two tags should go.
4. **New: the contact form requires both a mobile number and an email.** Some of your clients (pensioners, small traders) have no email they use. Requiring one of the two, not both, would lose fewer enquiries. Say the word and it is a ten-minute change.
5. **New: a Google Business Profile link.** The firm's details given to search engines name no profile elsewhere. If you have a Google Business Profile or LinkedIn page, adding its address (one line) helps search engines tie the listing to the site.

### Dates to keep in mind (not faults today)

- **31 December 2026:** both open roles close and will hide themselves. You are interviewing now; extend the date in `constants/careers.ts` if hiring runs on.
- **25 February 2027:** the office move. The address, the map position, the contact page's description ("Visit our KR Mohalla office") and the Google listing all change together; the address and map are in `config/contact.ts`, the description in `constants/pageMeta.ts`.
- **Before 1 April 2027:** the due-date calendar and all tool figures are for 2026-27 only. The home page's due-date strip will run dry in March.

### Not checked

- The tax law in the FAQs, articles, rates and calculators (a separate law review, as before).
- Safari and Firefox; everything was tested in Chrome.
- Google Search Console: how many pages Google has actually listed, and any warnings there. It needs your login and is worth five minutes.
- Real delivery of a form message to your inbox. Sending was tested against a stand-in so that you were not emailed.

---

## Part 2. Fix prompts

### Rules for every prompt

Paste this with each prompt, or keep it as the first message of the fixing chat.

```
You are working in the repository of casagar.co.in (C:\Dev\Sagar-H-R-Co.-v2).

Before anything else, read CLAUDE.md in full and follow it. In particular:
- The first-visit splash, the custom cursor and the other "Patterns to preserve" stay as they are unless the prompt says otherwise.
- Page styles go in components/redesign/redesign.css, scoped under .rd, using the existing colour and type variables. Tailwind is only for the shell files listed in tailwind.config.ts.
- Non-obvious changes carry a comment tagged with the audit ID given in the prompt (for example "Audit NOV-01:"), in the style of the existing "Audit XX-NN" comments.
- If you edit the inline <style> in index.html, regenerate the hash in netlify.toml (scripts/check-csp-hash.ts fails the build otherwise).
- Delete whatever a change replaces. Update or add tests for what you change.

How to work:
- One prompt = one branch and one pull request. Do not push to main.
- For any change a visitor can see, show the owner a preview (screenshot or deploy preview) and get his yes before finishing.
- Before saying you are done, run: npm run lint, npm run typecheck, npm test -- --run, npm run build. If the sandbox cannot run them (see "Sandbox build caveat" in CLAUDE.md), say so plainly and rely on CI; do not claim they passed.
- Commit messages: plain description only. Never add a "Co-Authored-By: Claude" line or any chat or session link, anywhere.
- If a fix starts needing a long workaround, stop and ask the owner before going further.
- Report to the owner in plain, non-technical words: what changed for a visitor, what to look at, anything he must decide.
```

---

### Prompt 1 — Honest, useful message when a form fails to send (NOV-01) — DONE 28 Nov 2026

```
Audit ID: NOV-01. Branch: fix/form-failure-message

Problem. When FormSubmit fails, the contact and careers forms show a 5-second toast reading "Server error (500). Our team has been notified." or "Request failed (403): Forbidden". Nobody is notified (there is no backend), the wording is technical, and the visitor is given no other way to reach the firm. The better fallback strings already written in pages/Contact.tsx never show, because utils/api.ts always supplies a non-empty message.

1. utils/api.ts. An ApiError's message should be text fit to show a visitor, or empty. Keep the server's own JSON `error` text when there is one; otherwise leave it empty and let the caller choose the words.

   Replace:

        if (response.status >= 500) {
          throw new ApiError(
            serverMessage || `Server error (${response.status}). Our team has been notified.`,
            response.status,
            'SERVER_ERROR',
          );
        }
        // Client errors (4xx)
        throw new ApiError(
          serverMessage || `Request failed (${response.status}): ${response.statusText}`,
          response.status,
          'CLIENT_ERROR',
        );

   with:

        // Audit NOV-01: no invented wording here. The site has no backend, so
        // "our team has been notified" was untrue, and "Request failed (403)"
        // means nothing to a visitor. Callers choose what to say.
        if (response.status >= 500) {
          throw new ApiError(serverMessage, response.status, 'SERVER_ERROR');
        }
        throw new ApiError(serverMessage, response.status, 'CLIENT_ERROR');

   Do the same for the 429 default only if you also make sure both forms have their own wording for 429 (Contact.tsx does). Check hooks/useInsights.ts, the other caller of apiClient, still shows a sensible message when error.message is empty.

2. A failure that stays on screen and offers another way. In both forms (pages/Contact.tsx and components/redesign/ApplicationForm.tsx), when a send fails for any reason other than the visitor's own connection:
   - keep everything the visitor typed (this already happens);
   - show an inline message directly above the Send button, role="alert", that stays until the next attempt. It must not disappear on a timer. Wording for the contact form:

        We could not send your message just now. Please call +91 94823 59455, message us on WhatsApp, or email mail@casagar.co.in. What you have typed is still here.

     with the phone as a tel: link, WhatsApp as CONTACT_INFO.social.whatsapp (opens in a new tab, with the usual visually hidden "(opens in a new tab)"), and the email as a mailto: link. Take all three from CONTACT_INFO; do not hard-code them. For the careers form use "your application" and leave WhatsApp out.
   - the toast may still fire, but must use the same plain wording, never a status code.
   - for NETWORK_ERROR and TIMEOUT keep the existing "check your connection and try again" wording.

   Style it as the existing field errors are styled (var(--err), the form's type sizes), in redesign.css next to the .rd-form rules. No new colours.

3. Tests. In pages/Contact.test.tsx and pages/Careers.test.tsx: when the send is rejected with a 500, the inline alert is shown with the phone and email links, the typed message is still in the field, and nothing on the page matches /notified/i or /\(\d{3}\)/. Keep the existing FormSubmit-refusal test passing.

Done when: with FormSubmit forced to fail, the visitor sees a lasting message with three ways to reach the firm, and no status code or "notified" wording appears anywhere.
```

---

### Prompt 2 — Keep the calculator's answer in view on phones (NOV-03)

```
Audit ID: NOV-03. Branch: fix/calculator-result-on-phones

Problem. At widths up to 900px the calculators stack: the form (.cin) first, the answer (.cout) after it. While a visitor types, the answer is below the screen (about 880px down on the stamp duty calculator at 390x800, about 1,400px on the income tax calculator), and with the on-screen keyboard open it is further out of reach. On wider screens .cstick keeps the answer in view; phones have nothing.

Fix. On phones only, a slim strip pinned to the TOP of the calculator panel while the panel is on screen, showing the main figure as it changes. Tapping it scrolls to the full answer. Pin it to the top, not the bottom: a bottom strip is covered by the on-screen keyboard on Android Chrome and iOS Safari.

1. pages/ResourceTools/fields.tsx: add

        interface ResultPeekProps {
          /** What the figure is, e.g. "Stamp duty". */
          label: string;
          /** The figure as shown in the result, e.g. "₹500", or "—" before anything is entered. */
          value: string;
          /** id of the result column to scroll to. */
          targetId: string;
        }

        /**
         * Audit NOV-03: phones only. The main figure, kept at the top of the
         * calculator while the form is filled in, because the result column
         * sits below the form there. Hidden from screen readers: <Announce>
         * already speaks the result.
         */
        export const ResultPeek: React.FC<ResultPeekProps> = ({ label, value, targetId }) => {
          const reduced = useReducedMotion();
          return (
            <button
              type="button"
              className="cpeek"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() =>
                document
                  .getElementById(targetId)
                  ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
              }
            >
              <span className="lbl">{label}</span>
              <span className="v tnum">{value}</span>
            </button>
          );
        };

   Give <Result> an optional `id` prop that it puts on its outer .cout div, so the strip has a target. Add scroll-margin-top to .cout so it lands below the slim site bar.

2. Each calculator renders <ResultPeek> as the FIRST child of its `.calc` container (before the <form>), fed from the same values the result already shows:
   - RentStampDutyCalculator: "Stamp duty" and the .big value.
   - GSTCalculator, HRACalculator: their .big value and its label.
   - IncomeTaxCalculator: it compares two regimes; show both briefly ("New ₹x · Old ₹y") or the lower one with its name. Pick whichever reads clearly at 360px and tell the owner which you chose.
   - CapitalGainsCalculator: the tax figure.
   Before anything is entered the strip shows "—", as the result does.

3. components/redesign/redesign.css, in the calculator section, using existing variables:

        /* Audit NOV-03: phones only; see ResultPeek in fields.tsx */
        .rd .cpeek {
          display: none;
        }
        @media (max-width: 900px) {
          .rd .cpeek {
            position: sticky;
            top: 0;
            z-index: 3;
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            padding: 10px 18px;
            border: 0;
            border-bottom: 1px solid var(--rule);
            background: var(--sand);
            color: var(--ink);
            font: inherit;
            text-align: left;
            transition: top 0.4s var(--ease);
          }
          .rd.bar-on .cpeek {
            top: var(--bar);
          }
          .rd .cpeek .lbl {
            font-size: 13px;
            color: var(--muted);
          }
          .rd .cpeek .v {
            font-family: var(--serif);
            font-size: 26px;
            line-height: 1;
          }
        }

   Also hide .cpeek in the print rules and add its transition to the reduced-motion list where .sec-h and .rd.sbar are listed. `.calc` is a one-column grid at this width, so the strip is its first row; check that the strip stays pinned through the whole form and lets go when the result column arrives. Check no ancestor has an overflow value that breaks position: sticky (the desktop .cstick already works inside the same panel).

4. Check on a real phone or device emulation at 360 and 390 wide, keyboard open: type into the first money field of each calculator and confirm the figure in the strip changes while the field has focus. Check the strip does not cover the field being typed in (the browser scrolls the focused field into view; if it lands under the strip, add scroll-margin-top to the inputs in .cin at this width).

5. Tests: one render test per calculator that the strip shows the same figure as the result's .big value after a value is entered, and that it is aria-hidden.

Show the owner a phone screenshot of the stamp duty and income tax calculators before finishing.
```

---

### Prompt 3 — Put each page's text in its served file (NOV-04). Plan first.

```
Audit ID: NOV-04. Branch: feature/static-page-text

Do not start building. First read the files named below, then give the owner a short plan in plain words and wait for his yes.

Problem. Every address is served as index.html with an empty <div id="root"></div>; the text arrives only when the scripts run. scripts/generate-route-html.ts already writes dist/<route>.html for each of the 47 addresses with the right title and description (Audit SEO-02), but the body is still empty. Clients that do not run scripts (AI assistants' crawlers, some search engines, link checkers, a browser with scripts blocked) get no content and no links between pages. With scripts blocked the visitor sees only the #preload-hero overlay.

Goal. After `npm run build`, every dist/<route>.html (and dist/index.html for the home page) contains, inside #root, that page's real text as plain semantic HTML: the h1, the intro, the page's sections, and ordinary <a href> links to the other pages. When the scripts load, the application starts exactly as it does today and replaces that markup. Nothing changes for an ordinary visitor: same first paint, same splash, same speed or better.

Keep these as they are:
- index.tsx keeps createRoot (do NOT switch to hydrateRoot; no hydration, so no mismatch risk from dates, the splash or lazy routes). createRoot replaces whatever is inside #root on first render.
- The CSP: no inline scripts. If the inline <style> in index.html changes, regenerate its hash.
- The data-fallback title/meta mechanism and its tests.

Two ways to produce the markup. Try the first; fall back to the second if the first needs more than a handful of guards.

Option 1 (preferred): render the real page components in the build script.
In scripts/ (run by tsx after vite build, where generate-route-html.ts runs), for each route render the page component to a string with react-dom/server's renderToStaticMarkup inside a <StaticRouter location={route}> (react-router), wrapped in the providers the page needs (AnnounceProvider, ToastProvider). Render the page component itself (pages/ServiceDetail.tsx and so on), not App.tsx: App pulls in the lazy layout, redesign.css and the browser-only shell. Add a plain header and footer of links around it from components/redesign/content.ts (RD_PRIMARY_LINKS, RD_FOOTER_EXPLORE, RD_FOOTER_RESOURCES, RD_LEGAL_LINKS) and the address and phone from config/contact.ts, so every page links to the others.
Things I already know will need attention:
  - pages/Home.tsx reads import.meta.env.VITE_BUILD_DATE at module scope; under tsx import.meta.env is undefined. Guard it the way config/site.ts does (import.meta.env?.…).
  - components/SEO.tsx renders <title>, <meta> and JSON-LD <script> elements; strip them from the static body (the head already has the right tags), or render SEO as null in this mode.
  - Articles: hooks/useInsights.ts and hooks/useArticleBody.ts fetch in effects, which do not run on the server, so the list and the article body would come out as loading skeletons. Read public/data/insights.json and public/content/insights/<slug>.md from disk in the script and render components/redesign/ArticleMarkdown.tsx with that text directly. The articles are the most valuable pages for this; do not ship without their text.
  - pages/home/DueStrip.tsx, pages/Resources.tsx and the due-dates tool depend on today's date. Either leave the due-date strip out of the static markup or accept that it shows the build day's dates until scripts run; say which.
  - Anything that touches window, document, navigator, sessionStorage or matchMedia during render (not in an effect) needs a typeof window guard. Do not weaken behaviour in the browser to get there.
  - OfficeMap's iframe should be left out of the static markup.

Option 2 (fallback): write the markup from the data, without rendering components.
Extend scripts/route-html.ts with a small function per page type that builds plain HTML from the same data the pages use: constants/services.tsx (SERVICE_PAGES: intro, scope of work, documents, linked FAQs), constants/faq.ts (questions and answers; utils/markdownToHtml.ts already turns an answer into safe HTML), constants/resources/tools.ts and checklists.ts, public/data/insights.json plus the article markdown, config/contact.ts. The three legal pages keep their text in JSX; for those use Option 1's renderToStaticMarkup on the page component alone, or give them a heading and a one-paragraph summary. Escape everything with the existing escapeHtml.

Whichever option, these also apply:
  a. No flash of unstyled text. The static markup has no redesign.css (it loads with the lazy layout). Today index.tsx removes the #preload-hero overlay on non-home routes as soon as it runs, which is before React's first commit, so the raw markup could show for a frame. Make the first render synchronous (flushSync from react-dom around root.render) and remove the overlay only after it, or keep the overlay until the first commit. Check by recording a load with CPU throttling: at no frame is unstyled text visible, on a first visit (splash) and on a later one (no splash), on the home page and on an inner page.
  b. Scripts blocked. Today the overlay then covers the page for ever. Give it a CSS-only failsafe inside the existing inline <style> (for example an animation that hides it after about 6 seconds, longer than the 5-second safety timer in index.tsx), regenerate the CSP hash, and update scripts/check-csp-hash.ts if its colour assertions are affected. With scripts blocked the visitor should then see readable, if plain, text and working links.
  c. scripts/route-html.test.ts: for one service page, the FAQ page, one article and one checklist, the generated HTML contains the page's h1 text, a known sentence from its body, and at least five internal <a href="/…"> links; and contains no <script type="application/ld+json"> duplicates and no "Loading" skeleton text.
  d. dist size: report the total size of the route files before and after.
  e. After a deploy preview: open /services/gst and /insights/income-tax-act-2025-in-force with scripts disabled and with scripts enabled; and fetch each with curl and confirm the text is in the response.

Your plan to the owner should say, in plain words: which option you will use and why, what a visitor will and will not notice, what could go wrong, and how long the build will take afterwards. Then wait.
```

---

### Prompt 4 — Stop loading all the site's content on the first screen (NOV-05) — DONE 28 Nov 2026

```
Audit ID: NOV-05. Branch: perf/entry-chunk

Problem. constants/index.ts is a barrel that re-exports services, FAQs, the Resources data, careers and config/contact. components/Preloader.tsx is part of the entry chunk and does `import { CONTACT_INFO } from '../constants'`, so the barrel, and with it every FAQ answer, every service page's text and the due-date calendar, lands in dist/assets/index-*.js, which every visitor downloads before anything renders. Measured: index-*.js is 88.06 kB (28.06 kB gzip).

Fix. Files that need only the firm's details import them from where they live.

1. In every file whose import from the barrel is exactly `{ CONTACT_INFO }`, change the path to config/contact. There are 15 source files:

        components/Preloader.tsx
        components/redesign/RdFooter.tsx, RdHeader.tsx, ApplicationForm.tsx, OfficeMap.tsx
        pages/InsightDetail.tsx, Privacy.tsx, ChecklistDetail.tsx, Careers.tsx, Disclaimer.tsx,
              Contact.tsx, Terms.tsx, NotFound.tsx, Insights.tsx
        pages/ResourceTools/ToolPage.tsx

   Three test files import it the same way (components/Preloader.test.tsx, pages/Legal.test.tsx, pages/NotFound.test.tsx); change them too, for consistency. Confirm the list with `grep -rnE "import \{ CONTACT_INFO \} from '(\.\./)+constants'" .` before and after.

   For example, in components/Preloader.tsx:

        -import { CONTACT_INFO } from '../constants';
        +import { CONTACT_INFO } from '../config/contact';

   Files that import other things from the barrel as well (Home.tsx, ServiceDetail.tsx, Services.tsx, FAQ.tsx, pages/home/shared.tsx, HomeFaqs.tsx) may stay as they are; they need the content anyway.

2. Add a note at the top of constants/index.ts:

        // Audit NOV-05: this barrel carries every FAQ, service page and due date.
        // A file that needs only the firm's details imports CONTACT_INFO from
        // '../config/contact' instead, or all of it joins the first download.

   and guard it: in eslint.config.js add a no-restricted-imports rule, for the shell files only (App.tsx, index.tsx, components/*.tsx, components/redesign/Rd*.tsx, RedesignLayout.tsx), that forbids importing from the constants barrel with that message.

3. Build and compare. Expected, from a trial of step 1 alone: index-*.js falls to about 21.7 kB (7.7 kB gzip), and a new shared chunk of about 47 kB (14.5 kB gzip) appears that only the pages using the content load. Confirm by searching the new index-*.js for the string "How are your fees worked out": it must not be there. Put the before and after sizes in the pull request.

No visible change, so no preview is needed; say so to the owner in one line with the two numbers.
```

---

### Prompt 5 — Five small fixes (NOV-06, NOV-07, NOV-08, NOV-09) — DONE 28 Nov 2026

```
Audit IDs: NOV-06, NOV-07, NOV-08, NOV-09. Branch: fix/nov-small-items. One pull request, one commit per item.

A. NOV-06: true 404 for unknown addresses (netlify.toml).
The comment above the last redirect says the status can become 404 once the route files are seen being served. That was confirmed on the live site on 28 Nov 2026: /services/gst answers 200 with its own <title>.

        [[redirects]]
          from = "/*"
          to = "/index.html"
        -  status = 200
        +  status = 404

Rewrite the comment to say it is done and why it is safe. The application still boots on the 404 response and shows NotFound. On the deploy preview, before merging, check each of these and paste the results in the pull request: /, /services/gst, /contact?subject=GST, /resources/checklist/salaried and /insights/itr-u-48-month-window answer 200; /about and /faq still redirect; /no-such-page answers 404 and shows "Page not found". If any real page answers 404, stop and revert.

B. NOV-07: do not move keyboard focus on first arrival.
components/RouteHandler.tsx focuses #main-content after every route change, including the very first load, and components/redesign/RedesignLayout.tsx has an effect that does the same on mount. So on arrival the first Tab lands inside the page, and the skip link and the menu are behind the starting point. Focus should move only when the visitor navigates within the site.

   - RouteHandler.tsx: in the scroll/focus effect, skip the focus call (not the scroll) until the visitor has navigated within the site. Do not rely on the history key being "default": after a reload the browser hands back the earlier key. Track it with refs, which also holds under StrictMode's double effect run in development:

        const { pathname, key } = useLocation();
        // Audit NOV-07: on arrival the keyboard starts at the top of the
        // document, so the skip link and the menu come first. Focus moves to
        // the page only once the visitor has gone from one page to another.
        const firstKey = useRef(key);
        const navigated = useRef(false);
        ...
        // inside the effect, before any focus call:
        if (key !== firstKey.current) navigated.current = true;
        const arrival = !navigated.current;
        ...
        if (!arrival) {
          rafId = window.requestAnimationFrame(() => {
            document.getElementById('main-content')?.focus({ preventScroll: true });
          });
        }

     Apply the same test to the focus call in the back/forward branch.
   - RedesignLayout.tsx: remove the mount effect that focuses #main-content when focus is on <body>, with its comment. It was for the time when only some pages used this layout; now it mounts once, on arrival, which is exactly the case to leave alone. Check that focus still moves to <main> when going from one page to another (the layout is already mounted by then).
   - Leave the deep-link cases alone: /#about, /faqs#<id> and /contact?subject=… move focus themselves and should keep doing so.
   - The route-change announcement should also not fire on arrival ("Navigated to Home" on first load is noise); the page's <title> is announced by the screen reader anyway.
   - components/RouteHandler.test.tsx: on first render document.activeElement is <body>; after a navigation it is #main-content.
   - Update the Accessibility paragraph in CLAUDE.md to say "on every route change after arrival".

C. NOV-08: leave the system pointer alone in high-contrast mode.
index.css hides the browser's cursor under `@media (pointer: fine) and (prefers-reduced-motion: no-preference)`. Add two conditions so it does not apply when the visitor uses forced colours or asks for more contrast:

        @media (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none) and (prefers-contrast: no-preference) {

components/CustomCursor.tsx must make the same decision, or the pointer is neither hidden nor drawn consistently: next to useFinePointer(), read matchMedia('(forced-colors: active), (prefers-contrast: more)') the same way (with a change listener) and return null when it matches. Update the "same conditions as the rule in index.css" comments in both files and the Cursor paragraph in CLAUDE.md. The cursor is unchanged for everyone else; this is not a restyle.

D. NOV-09a: cache the pictures (netlify.toml).
/images/* (the portrait, in three sizes and three formats) is served max-age=0. The names carry no content hash, so not "immutable", but a week is safe:

        [[headers]]
          for = "/images/*"
          [headers.values]
            Cache-Control = "public, max-age=604800, stale-while-revalidate=2592000"

E. NOV-09b: spacing under section bands on phones (redesign.css).
At widths up to 900px `.rd .sec-h` becomes a full-width sand band. Where a list follows it directly, the first row touches the band. Seen on /resources/tds-tcs-rates under "Due dates and forms" and on /resources/rent-agreement-stamp-duty under "How it is worked out" (the .needs list). Give the first row the same top space the other pages have after a band (compare /services/gst "Scope of work" and /faqs, which are right). Fix it once at the level of "what follows .sec-h inside .sec", not page by page, and check the other pages that use .sec-h at 360px for regressions: /services/gst, /faqs, /careers, /resources, a checklist. Show the owner before and after at 360px.

Also in this pull request: remove the unused devDependency @axe-core/react from package.json (nothing imports it; the tests use vitest-axe).
```

---

### Prompt 6 — Bring the build and test tools up to date (NOV-10)

```
Audit ID: NOV-10. Branch: chore/tooling-upgrade. Nothing a visitor sees should change.

State on 28 Nov 2026: vite 5.4.21 (latest 8.x), vitest 1.6.1 (latest 5.x), @vitejs/plugin-react 4.7 (latest 6.x), jsdom 24 (latest 31), sharp 0.34 (latest 0.35), plus minor updates. `npm audit` shows 15 advisories, all in dev tooling (vite, esbuild, vitest, tinypool, sharp, typescript-eslint); `npm audit --omit=dev` shows none.

Do it in steps, running lint, typecheck, tests and the full build after each, and commit each step separately so a bad one can be dropped:
1. `npm audit fix` (no --force): the non-breaking ones.
2. vitest and jsdom to current. Read the migration notes for each major version crossed. Things in this repo that depend on vitest: the `test` block in vite.config.ts, vitest.setup.ts, vitest.d.ts, vitest-axe (check it supports the new vitest; if not, say so and stop at the last version it supports).
3. vite and @vitejs/plugin-react to current. Read the migration notes. Things in this repo that depend on vite's behaviour: manualChunks in vite.config.ts (the chunk names react-vendor and markdown-vendor are mentioned in CLAUDE.md), the `define` for VITE_BUILD_DATE, build.target es2022, babel-plugin-react-compiler in annotation mode, the '@' alias, and scripts/generate-route-html.ts, which reads dist/index.html after the build and expects the same <title data-fallback> and meta structure. If a newer vite changes the bundler underneath, compare chunk sizes before and after and report them.
4. sharp to current; run `npm run build` and check the three sizes of the portrait in public/images still generate and look the same.
5. Leave these alone unless trivial: tailwindcss 3 to 4 (a rewrite of the config, no benefit here), eslint 9 to 10, typescript 5 to 7, react-markdown 9 to 10.

After the last step: `npm audit` output in the pull request, the before and after of `vite build`'s size table, and confirmation that scripts/check-csp-hash.ts still passes. Check the deploy preview by opening the home page, one calculator, one article and the contact form. Update the versions named in CLAUDE.md and README.md.

If any step turns into a long fight, stop there, keep the steps that worked, and tell the owner what is left.
```

---

### Prompt 7 — Service page titles (NOV-11). Only if the owner has said yes.

```
Audit ID: NOV-11. Branch: seo/service-titles

Today a service page's title is `${page.name} | ${CONTACT_INFO.name}`, written twice: pages/ServiceDetail.tsx (the SEO component) and scripts/route-html.ts (buildRoutes). Example: "GST | Sagar H R & Co." The titles say neither what the firm is nor where.

1. Put the wording in one place. In constants/pageMeta.ts, next to articleTitle:

        /** A service page's title: what it covers, then the firm and the city (Audit NOV-11). */
        export const serviceTitle = (page: { name: string; seoTitle?: string }): string =>
          `${page.seoTitle ?? page.name} | ${FIRM}, Chartered Accountants, Mysuru`;

   and use it in both ServiceDetail.tsx and scripts/route-html.ts, so the tab title and the served file cannot drift (the same reason PAGE_META exists).

2. Add an optional `seoTitle` to the ServicePage type and to each entry of SERVICE_PAGES in constants/services.tsx: a factual phrase of what the page covers, taken from that page's own scope of work. Proposals for the owner to approve or reword before you commit (show him the full list of 14):

        gst                  GST registration, returns and notices
        income-tax           Income tax returns, advance tax and capital gains
        tds-and-tcs          TDS and TCS returns
        notices-and-appeals  Income tax and GST notices and appeals
        audit                Statutory, tax and trust audits
        company-law          Company law and ROC filings
        trusts-and-npos      Trust registration, 12A and 80G, and audits

   Rules for the wording: describe the work only. No "best", "leading", "expert", "trusted", "affordable", no fees, no claims; the ICAI advertisement guidelines apply to titles as to any other text. Keep each whole title under about 70 characters where possible, since longer ones are cut off in search results; if "Chartered Accountants, Mysuru" makes it too long, shorten the phrase, not the firm.

3. Update the tests that assert the old titles (pages/ServiceDetail.test.tsx, scripts/route-html.test.ts) and run `npm run lint:schema`.

Show the owner the 14 final titles as a list before finishing.
```
