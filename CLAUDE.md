# CLAUDE.md

Guidance for Claude Code (and any new contributor) working in this repository.
This file is read automatically at the start of a session — it exists so the
non-obvious parts of the codebase do not have to be re-discovered by hitting
bugs.

## Project overview

**Sagar H R & Co.** — marketing website for a Chartered Accountancy firm based
in Mysuru, Karnataka. It is a single-page application: a polished, editorial
brochure site, not a web app with user accounts.

**Stack:** React 19 · Vite 5 · TypeScript 5 · Tailwind CSS 3.4 · React Router 7
(`BrowserRouter`). Deployed on Netlify. Node **20.x** is pinned in
`package.json` `engines`.

The codebase is deliberately well-built — it has a real design system, strong
accessibility, performance discipline, SEO/structured data, and a Vitest suite.
Treat those as load-bearing: see "Patterns to preserve" before removing
anything that looks like ceremony.

## Repository layout

| Path                                                      | Contents                                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `index.html` → `index.tsx` → `App.tsx`                    | Entry chain. `App.tsx` holds the router and the persistent chrome.                                                     |
| `pages/`                                                  | One component per route. `pages/home/**` holds the home page's sections, `pages/ResourceTools/**` the Resources tools. |
| `components/`                                             | Reusable UI. `components/redesign/**` is the layout every page renders in (top bar, footer, `redesign.css`).           |
| `constants/`                                              | Static site data — services, FAQs, compliance calendar, insights. Barrel export at `constants/index.ts`.               |
| `hooks/`                                                  | Custom hooks (`useAnnounce`, `useReducedMotion`, …).                                                                   |
| `context/`                                                | React context providers (`ToastContext`, `AnnounceContext`).                                                           |
| `config/`, `utils/`, `types/`                             | Configuration, helpers, shared TypeScript types.                                                                       |
| `scripts/`                                                | Build-time Node scripts, run via `tsx` (see Build).                                                                    |
| `netlify/`                                                | Netlify serverless functions (CSP report).                                                                             |
| `public/`                                                 | Static assets — fonts, favicons, prebuilt data.                                                                        |
| `dist/`                                                   | Build output. Git-ignored; never edit by hand.                                                                         |
| `AUDIT-*.md`, `*-CODEX-PROMPTS.md`, `IMPROVEMENT-PLAN.md` | Working docs at the repo root — see Conventions.                                                                       |

## Styling

Every page renders inside `components/redesign/RedesignLayout.tsx` and is
styled by **`components/redesign/redesign.css`**: plain top-level CSS, every
rule scoped under `.rd`, colours and type as custom properties on `.rd`
(`--night`, `--stone`, `--sand`, `--paper`, `--ink`, `--copper`, …; Instrument
Serif and Host Grotesk). New page styles go there, in a section of their own,
using those tokens.

`components/redesign/routes.ts` says which header a page opens with: the dark
band (the default), the light header (`.head-light`: legal pages and
articles), or the home page's (`.head-home`: no dark strip, and no wordmark in
the top bar because the title is the firm's name).

The home page is also the About page: `/#about`. The old `/about` address
redirects there (`netlify.toml`, and a route in `App.tsx` for links followed
inside the app).

### Tailwind — what is left of it

Tailwind is still wired in for the app shell and the shared pieces
(`App.tsx`, `PageLoader`, the toasts, …). There is one config in use:
`tailwind.home.config.ts`, activated by `index.css` via
`@config './tailwind.home.config.ts'`. It spreads the base config
(`tailwind.config.ts`, where the old design's tokens still live) and narrows
`content` to an explicit file list.

**The purge footgun:** Tailwind tree-shakes unused classes against that
narrow list, so a Tailwind class used in a file the list does not name is
dropped **silently**. A custom class written inside `@layer utilities` in
`index.css` is purged the same way. Genuinely global custom CSS must be
**plain top-level CSS** (as the `sx-*` shared pieces and the cursor rules in
`index.css` are); page styles belong in `redesign.css`.

### Stylesheet entry points

- `index.css` — global: `@font-face` declarations, `@tailwind` layers, the
  shared pieces (`sx-*`: toasts, offline bar, loading screen, error screens),
  the cursor, focus styles, print styles and reduced-motion overrides. It
  still carries the old design's `--zone-*` tokens, `zone-*` utilities and
  `.glass*` surfaces, which no page uses now (see "Left from the old design").
- `components/redesign/redesign.css` — everything a page shows.

### Left from the old design

The old Home and About pages, the floating Navbar, the old Footer and their
components were removed in October 2026. Still in the repository and unused
by any page, for a clean-up of their own:

- The base Tailwind theme in `tailwind.config.ts` (brand colours, radii, the
  `heading` and `mono` faces). Its `sans` face is Host Grotesk, the document's
  default, and the first-visit splash uses `serif`, two animations and
  `z-preloader` (see "Patterns to preserve"), so those are in use.
- In `index.css`: the `zone-*`, `.glass*`, `.bg-grid`, `.bg-noise` and similar
  helpers, and the `@font-face` rules for Fraunces, Plus Jakarta Sans and
  JetBrains Mono, with their files in `public/fonts`. Check nothing asks for a
  face before deleting its file.
- Code nothing imports: `components/ui/Button.tsx`,
  `components/ui/FormField.tsx`, `components/forms/CustomDropdown.tsx`,
  `utils/dateUtils.ts`, and the hooks `useLocalStorage` and `useSpotlight`.
- Fields of `CONTACT_INFO` (`config/contact.ts`) that only the old pages read:
  `hours`, `address.full`, the `stats` counts other than `established`, and
  the founder's `title`, `qualifications`, `specializations`, `bio` and
  `quote`.

## Design tokens

The tokens in use are the custom properties at the top of
`components/redesign/redesign.css` (colours, the two font stacks, the easing
curve `--ease`, the side gutter `--gut`, the top bar height `--tb`). Use them
rather than raw values. `index.css` repeats the few the shared pieces need as
`--sx-*`, because those pieces can show before `redesign.css` has loaded.

- **Easing** — `cubic-bezier(0.16, 1, 0.3, 1)` is the house curve (Audit
  MA-09). Use it for entrances and large transforms.

## Conventions

- **`Audit XX-NN:` comments.** Non-obvious decisions carry an explanatory
  comment tagged with an audit ID (e.g. `Audit MA-16`, `Audit CQ-12`,
  `Audit H-02`). The IDs trace back to the `AUDIT-*.md` working docs at the
  repo root. When you change such code, update or keep the comment — it is the
  reason the code looks the way it does.
- **`'use memo'` (React Compiler).** The React Compiler runs in **annotation
  mode** (`vite.config.ts`): only files/functions carrying a `'use memo'`
  directive are compiled; everything else behaves exactly as before. Adding the
  directive opts a file in — only do so once it follows the Rules of React.
  No file carries it at present: the ones that did went with the old design.
- **ESLint promotion ratchet (Audit CQ-07).** `eslint.config.js` keeps five
  `react-hooks/*` rules (`set-state-in-effect`, `static-components`,
  `immutability`, `refs`, `purity`) at `'warn'` instead of `'error'`, with a
  documented plan to promote them one at a time. Do **not** introduce new
  violations of these rules, and do not flip them to `'error'` casually —
  follow the order written in that file.
- `@typescript-eslint/no-explicit-any` is `warn`; unused vars are allowed only
  with a leading underscore (`_unused`).

## Build, test, lint

Run these locally or in CI (see the sandbox caveat below):

| Command               | What it does                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Vite dev server on port 3000.                                                                                                                         |
| `npm run build`       | Full production build — runs `generate-icons`, `check-csp-hash`, `generate-sitemap`, `generate-responsive-images` (all via `tsx`), then `vite build`. |
| `npx tsc --noEmit`    | TypeScript typecheck.                                                                                                                                 |
| `npm run lint`        | ESLint over the repo.                                                                                                                                 |
| `npm run test`        | Vitest (jsdom, globals, setup in `vitest.setup.ts`).                                                                                                  |
| `npm run test:a11y`   | Vitest accessibility run (`pages/Home.test.tsx`).                                                                                                     |
| `npm run lint:schema` | Validates the services structured-data schema.                                                                                                        |
| `npm run format`      | Prettier (with the Tailwind class-sorting plugin).                                                                                                    |

A Husky `pre-commit` hook runs `lint-staged`.

**`check-csp-hash` matters:** the production CSP in `netlify.toml` pins a
`sha256` hash of the inline `<style>` block in `index.html`. If you edit that
inline `<style>`, the build will fail until you regenerate the hash in
`netlify.toml`. The same script also asserts that the `#preload-hero`
overlay starts in the splash's black (`Preloader.tsx`) and turns to `--stone`
(`components/redesign/redesign.css`).

### Sandbox build caveat

The Cowork bash sandbox mounts this folder over FUSE/virtiofs, and that mount
**intermittently fails to read pre-existing files** (ENOENT) — so `npx tsc`,
`vitest`, and `vite build` often cannot run inside a Cowork session. This is a
sandbox-infrastructure issue, not a project problem.

- The `Read` / `Write` / `Edit` file tools use a separate, reliable path —
  trust them for all file work.
- Do **not** trust the bash sandbox to verify a build. Verify via **CI** (the
  GitHub Actions pipeline) or by asking the maintainer to run the npm scripts
  locally.

## Patterns to preserve

These are deliberate. Do not "simplify" them away.

**First-visit splash** — `components/Preloader.tsx`: the firm's name on black,
held for a second and a half and then lifted away, once per browser tab. **The
owner wants it.** It was removed in October 2026 as "a two-second black
screen" and he asked for it back the same week, unchanged except for the
typefaces, which are now the redesign's. Do not remove, shorten or restyle it
without asking him. These exist for it and stay: the Instrument Serif italic
font ("Sagar"), with its `@font-face` rule and its preload in `index.html`;
the `serif` face, the `expand-width` and `fade-in-up` animations and
`z-preloader` in `tailwind.config.ts`; and `Preloader.tsx` in the `content`
list of `tailwind.home.config.ts`. The other splash the site once had, the
words "Audit. Taxation. Advisory." painted by `index.html`, is gone for good:
the two clashed.

**Accessibility** — skip-to-content link; programmatic focus of `#main-content`
on every route change (`RouteHandler` in `App.tsx`); route-change screen-reader
announcements via `AnnounceProvider` / `useAnnounce`; `:focus-visible`
styling; `inert` on hidden interactive regions; a global
`prefers-reduced-motion` override in `index.css` paired with the
`useReducedMotion` hook for JS-driven animation; manual `scrollRestoration`;
print stylesheet. The focus ring is copper, set in `redesign.css`.

**Performance** — routes are `React.lazy`-loaded with Suspense skeleton
fallbacks; the React Compiler, there for files that opt in; the page styles in
a stylesheet of their own (`redesign.css`, loaded with the layout); manual
vendor chunks in `vite.config.ts` (`react-vendor`, `ui-vendor`,
`markdown-vendor`); self-hosted preloaded fonts; the `#preload-hero` overlay
that paints the first screen instantly (the splash's black on a first visit,
then the home page's limestone) and is removed on the `app:hero-ready` event.

**SEO** — `components/SEO.tsx`, generated sitemap, structured data, and the geo
meta tags in `index.html`.

**Cursor** — `components/CustomCursor.tsx` draws every cursor itself (a dot, a
see-through circle over links, a text bar over text), because the browser
only redraws its own cursor when the mouse moves. For mouse/trackpad users
with motion allowed, `index.css` hides the browser's cursor everywhere with
`cursor: none !important`, from the first paint — so a `cursor:` rule in a
component has no visible effect for them. `html.cur-native` gives the
browser's cursor back (crash, or the cursor's code failing to load:
`components/cursors/early.ts`). Put `data-hide-cursor="true"` on a region that
must keep the browser's cursor (embedded maps).

## Deployment

Netlify. Pushing to `main` triggers an auto-deploy. `netlify.toml` defines the
SPA fallback redirect, a `/faq` → `/faqs` 301, security headers (CSP, HSTS,
`X-Frame-Options`, …), and cache headers. Serverless functions live in
`netlify/`.

- **No `public/_redirects`.** Netlify applies that file before `netlify.toml`,
  so a catch-all there shadows every redirect in `netlify.toml`. One did, from
  May to October 2026.
- **Forms post from the browser.** The contact and careers forms send straight
  to FormSubmit (`utils/formSubmit.ts`, endpoint in `config/contact.ts`).
  FormSubmit answers requests from hosting servers with 403, so routing them
  through a Netlify function does not work.

## Working norms

- `IMPROVEMENT-PLAN.md` at the repo root tracks planned hardening work — check
  it for context before larger changes.
- Resources tax figures (`constants/resources/`): `AUDIT-RESOURCES-LAW.md`
  records what each was checked against, the readings decided with CA Sagar,
  and the yearly update list. Update it with any figure you change.
- For UI-affecting changes, show a preview and get sign-off before applying;
  prefer subtle, restrained changes and centralised fixes (shared utilities)
  over scattered one-offs.
- Definition of done includes deleting whatever a change replaces — dead code
  and duplication should not accumulate.
