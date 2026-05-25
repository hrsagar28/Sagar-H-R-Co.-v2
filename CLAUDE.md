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

| Path                                                      | Contents                                                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html` → `index.tsx` → `App.tsx`                    | Entry chain. `App.tsx` holds the router and the persistent chrome.                                                          |
| `pages/`                                                  | One component per route, plus `route-styles.css` (see Styling).                                                             |
| `components/`                                             | Reusable UI. `components/home/**` (home-page sections), `components/ui/**`, `components/skeletons/**` (Suspense fallbacks). |
| `constants/`                                              | Static site data — services, FAQs, compliance calendar, insights. Barrel export at `constants/index.ts`.                    |
| `hooks/`                                                  | Custom hooks (`useAnnounce`, `useReducedMotion`, …).                                                                        |
| `context/`                                                | React context providers (`ToastContext`, `AnnounceContext`).                                                                |
| `config/`, `utils/`, `types/`                             | Configuration, helpers, shared TypeScript types.                                                                            |
| `scripts/`                                                | Build-time Node scripts, run via `tsx` (see Build).                                                                         |
| `netlify/`                                                | Netlify serverless functions (contact form, CSP report).                                                                    |
| `public/`                                                 | Static assets — fonts, favicons, prebuilt data.                                                                             |
| `dist/`                                                   | Build output. Git-ignored; never edit by hand.                                                                              |
| `AUDIT-*.md`, `*-CODEX-PROMPTS.md`, `IMPROVEMENT-PLAN.md` | Working docs at the repo root — see Conventions.                                                                            |

## Styling — the multi-config Tailwind setup

There are **three** Tailwind config files. This is intentional, and it is the
single most surprising thing in the repo.

- `tailwind.config.ts` — the **base** config. All design tokens live here
  (theme: colours, fonts, radii, z-index, animations). Its `content` list
  scans the whole app.
- `tailwind.home.config.ts` — spreads the base config but **overrides
  `content`** with a _narrow, explicit file list_ (index.html, App.tsx,
  Home.tsx, the chrome components, `components/home/**`, a few ui/skeleton
  files). Activated by `index.css` via `@config './tailwind.home.config.ts'`.
- `tailwind.routes.config.ts` — spreads the base config and scans
  `pages/**` + `components/**` (and hooks/utils/context/constants/config/
  types). Activated by `pages/route-styles.css` via
  `@config '../tailwind.routes.config.ts'`.

**Why:** the split keeps per-page CSS small — `index.css` ships only the
classes the home page needs; `route-styles.css` carries the rest.

### The purge footgun — read this before adding a global CSS class

Tailwind tree-shakes (purges) unused classes against the **content list of the
config that is active for a given stylesheet**. Custom utilities written
inside `@layer utilities` in `index.css` are therefore purged against the
**home** config's narrow file list. A component the home config does **not**
scan that uses such a class loses the style **silently** — no error, just an
unstyled element. (A real example: an FAQ dropdown rendered with a transparent
background because it used `zone-surface` on a page the home config ignores.)

**Rule:** genuinely global custom CSS must be **plain top-level CSS**, not
`@layer utilities`. Plain CSS is never purged — that is exactly why `.bg-grid`,
`.bg-noise`, and the `.glass*` utilities (all plain CSS in `index.css`) never
break. Only put a class in `@layer utilities` if it is genuinely home-only.

> Known issue: the `zone-*` utilities are currently still inside
> `@layer utilities` in `index.css`. Fixing that is Item 3 of
> `IMPROVEMENT-PLAN.md`. Until then, be cautious using `zone-*` classes on
> non-home pages.

### Stylesheet entry points

- `index.css` — global: `@font-face` declarations, `@tailwind` layers, the
  `data-zone` token blocks (`@layer base`), the `zone-*` utilities
  (`@layer utilities`), the `.glass*` surfaces, focus styles, print styles,
  reduced-motion overrides, and section-scoped helpers.
- `pages/route-styles.css` — thin: just `@config` + `@tailwind components`
  - `@tailwind utilities` for the route bundle.

## The `data-zone` theming system

Sections of the site re-theme themselves by setting a `data-zone` attribute,
which swaps a block of `--zone-*` CSS custom properties. The blocks are
defined in `@layer base` in `index.css`:

- `:root` — default **moss** zone (light bg, moss-green accent).
- `[data-zone='editorial']` — dark zone (near-black bg, brass accent). Applied
  to `<main>` on the `/about` route (see `App.tsx`).
- `[data-zone='editorial-paper']` — warm paper zone (cream bg, rust accent).

Tokens each zone defines: `--zone-bg`, `--zone-surface`, `--zone-text`
(+ `--zone-text-rgb`), `--zone-text-muted` (+ `-rgb`), `--zone-accent`
(+ `-rgb`), `--zone-accent-alt`, `--zone-hairline`.

Consume them two ways:

- **Tailwind colour utilities** — `tailwind.config.ts` maps `zone-text`,
  `zone-text-muted`, `zone-accent` to the `*-rgb` vars with `<alpha-value>`
  support, so `text-zone-accent`, `text-zone-text/70`, etc. work.
- **Custom utility classes** — `.zone-bg`, `.zone-surface`, `.zone-text`,
  `.zone-text-muted`, `.zone-accent`, `.zone-accent-alt`, `.zone-border`,
  `.zone-hairline` (defined in `index.css`).

To re-theme a region, set `data-zone="…"` on its wrapper and style children
with zone tokens — never hard-code the per-zone colours.

## Design tokens

All tokens live in the **`theme.extend`** block of `tailwind.config.ts`:

- **`brand` colour palette** — the firm's named colours: `brand.bg`,
  `brand.surface`, `brand.dark`/`brand.black`, `brand.moss`/`brand.mossLight`,
  `brand.ink`/`brand.ink-deep`/`brand.ink-soft`, `brand.paper`/`brand.cream`,
  `brand.brass`/`brand.brass-bright`/`brand.brass-light`, `brand.rust`,
  `brand.stone`, `brand.muted`, `brand.accent`, `brand.border`. Prefer these
  over raw hex.
- **Fonts** — `font-sans` = Plus Jakarta Sans, `font-heading`/`font-serif` =
  Fraunces, `font-mono` = JetBrains Mono. All self-hosted (`/public/fonts`,
  `@font-face` in `index.css`, preloaded in `index.html`).
- **Radii** — `rounded-card` (2rem), `rounded-bento` (3rem). (Radius usage is
  still inconsistent across components — consolidation is Item 4 of the
  improvement plan.)
- **Type scale** — fluid `clamp()` sizes: `text-eyebrow`, `text-lead`,
  `text-display-sm|md|lg|xl`.
- **Z-index** — a named scale (`z-base`, `z-dropdown`, `z-sticky`, `z-fixed`,
  `z-modal`, `z-toast`, `z-preloader`, …). Use the names, not magic numbers.
- **Easing** — `ease-out-expo` / `ease-brand` both resolve to
  `cubic-bezier(0.16, 1, 0.3, 1)` — the house curve (Audit MA-09). Use it for
  entrances and large transforms.

### The `.glass` surfaces

`.glass`, `.glass-strong` (light, dark text) and `.glass-dark` (light text on
dark) are the "liquid glass" surfaces — defined as **plain CSS** in
`index.css`. Each has an opaque-enough fallback plus an `@supports` block that
layers on the real `backdrop-filter`. **Never** put `backdrop-filter` in a
transition list — animating the blur radius is the janky path; tint, border,
and shadow animate instead.

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
`netlify.toml`. The same script also asserts the `#preload-hero` background
matches `STARFIELD_BG` in `components/home/StarField.tsx`.

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

**Accessibility** — skip-to-content link; programmatic focus of `#main-content`
on every route change (`RouteHandler` in `App.tsx`); route-change screen-reader
announcements via `AnnounceProvider` / `useAnnounce`; `:focus-visible` styling
with zone-aware ring colour; `inert` on hidden interactive regions; a global
`prefers-reduced-motion` override in `index.css` paired with the
`useReducedMotion` hook for JS-driven animation; manual `scrollRestoration`;
print stylesheet.

**Performance** — routes are `React.lazy`-loaded with Suspense skeleton
fallbacks; `content-visibility` on offscreen sections; the React Compiler
`'use memo'` rollout; code-split CSS (the multi-config Tailwind setup); manual
vendor chunks in `vite.config.ts` (`react-vendor`, `ui-vendor`,
`markdown-vendor`); self-hosted preloaded fonts; the `#preload-hero` overlay
that paints the hero instantly and is removed on the `app:hero-ready` event.

**SEO** — `components/SEO.tsx`, generated sitemap, structured data, and the geo
meta tags in `index.html`.

## Deployment

Netlify. Pushing to `main` triggers an auto-deploy. `netlify.toml` defines the
SPA fallback redirect, the `/api/contact` → serverless-function rewrite, a
`/faq` → `/faqs` 301, security headers (CSP, HSTS, `X-Frame-Options`, …), and
cache headers. Serverless functions live in `netlify/`.

## Working norms

- `IMPROVEMENT-PLAN.md` at the repo root tracks planned hardening work — check
  it for context before larger changes.
- For UI-affecting changes, show a preview and get sign-off before applying;
  prefer subtle, restrained changes and centralised fixes (shared utilities)
  over scattered one-offs.
- Definition of done includes deleting whatever a change replaces — dead code
  and duplication should not accumulate.
