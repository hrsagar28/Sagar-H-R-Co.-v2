# Codebase Improvement Plan

**Audience:** a fresh Claude (or other AI) session, or a developer. This
document is **self-contained** — it assumes no prior conversation context.

**Project:** Sagar H R & Co. — Chartered Accountants marketing website.
React 19 + Vite + TypeScript + Tailwind CSS 3, SPA with React Router 7.

**Purpose:** harden an already-strong codebase. The site is well-built — it has
a real design system, solid accessibility, performance discipline, SEO, and a
test suite. This plan addresses the specific areas where it falls short of
top-tier: an architecture footgun, consistency drift, repo hygiene, and the
gap in automated verification. None of this is a rescue job; it is refinement.

---

## How to use this document

- Work through the items **one at a time**, in the suggested order at the end.
- Each item is scoped to be a self-contained piece of work.
- **Confirm with the user before starting each item**, and for anything that
  changes the UI, show a preview and get a thumbs-up before applying — the user
  prefers a preview-first workflow.
- Don't undo what already works. The accessibility patterns (focus management,
  ARIA, reduced-motion, `inert`), the performance patterns (lazy routes,
  `content-visibility`, React Compiler `'use memo'`, code-split CSS), and the
  SEO/structured-data setup are deliberate and good — preserve them.

---

## Critical context — build verification

The project lives at `C:\Dev\Sagar-H-R-Co.-v2` (a plain local path — **not**
OneDrive).

The Cowork bash sandbox mounts the folder over FUSE/virtiofs, and that mount is
**unreliable** — it intermittently fails to `stat`/read pre-existing project
files (ENOENT), so `npx tsc`, `vitest`, and `vite build` often cannot run
inside a session. This is a sandbox-infrastructure issue, not a project issue.

Implications for whoever executes this plan:

- The `Read` / `Write` / `Edit` file tools use a separate, reliable path — use
  them for all file work and trust them.
- Do **not** trust the bash sandbox to verify builds. Either ask the user to
  run the npm scripts locally, or — better — rely on the CI pipeline (Item 2),
  which runs on GitHub and is unaffected.

Verification commands (run locally or in CI):

- `npx tsc --noEmit` — typecheck
- `npm run lint` — ESLint
- `npm run test` — Vitest
- `npm run build` — full production build

---

## Work items

### Item 1 — Add a `CLAUDE.md` codebase guide · Priority: High

**Why:** the codebase has non-obvious architecture — a multi-config Tailwind
setup, a `data-zone` theming system, design tokens, build quirks. None of it is
documented, so every new contributor (human or AI) re-discovers it by hitting
bugs. A `CLAUDE.md` at the repo root is read automatically by Claude Code and
is the single highest-leverage fix here.

**What to do:** create `CLAUDE.md` at the repo root covering:

- Project overview and stack.
- The **multi-config Tailwind setup** and its purge constraint (see Item 3).
- The `data-zone` theming system and the `--zone-*` CSS custom properties.
- Where design tokens live (`tailwind.config.ts` theme), and the `brand`
  colour palette.
- The `.glass` / `.glass-strong` / `.glass-dark` utilities and where they live.
- Conventions: the `Audit XX-NN:` explanatory-comment style, `'use memo'`
  (React Compiler), the ESLint promotion ratchet documented in
  `eslint.config.js`.
- How to build / test / lint, and the sandbox-verification caveat above.
- The accessibility and performance patterns the codebase relies on, so they
  are not accidentally removed.

**Acceptance:** a newcomer can read `CLAUDE.md` and avoid the known footguns
without first reading every config file.

### Item 2 — Add a CI pipeline · Priority: High

**Why:** changes currently ship without automated verification — the sandbox
cannot build reliably, and local runs are manual and easy to skip. CI makes
"it works" a checked fact rather than a hope, and it is immune to the sandbox
mount problem.

**What to do:** add `.github/workflows/ci.yml` (the repo already has a
`.github/` folder). On every push and pull request: checkout, set up Node 20
(`package.json` `engines` pins `20.x`), `npm ci`, then run `npx tsc --noEmit`,
`npm run lint`, `npm run test`, and `npm run build`. Fail the job on any error.

**Notes:** `npm run build` runs pre-build scripts (icons, sitemap, responsive
images, a CSP-hash check) — confirm they run headless on GitHub's Ubuntu
runner. `sharp` needs no special setup there.

**Acceptance:** a green check on every PR; a red one whenever typecheck, lint,
test, or build breaks.

### Item 3 — Fix the Tailwind multi-config purge footgun · Priority: High

**Background:** there are three Tailwind configs — `tailwind.config.ts` (base
theme), `tailwind.home.config.ts` (scans a narrow file list, used by
`index.css`), and `tailwind.routes.config.ts` (scans `pages/**` +
`components/**`, used by `pages/route-styles.css`). The split exists to keep
per-page CSS small.

**The bug it causes:** custom utility classes written inside `@layer utilities`
in `index.css` (the `zone-*` set — `.zone-surface`, `.zone-bg`, etc.) are
tree-shaken by Tailwind against the **home** config's content list. Any
component that uses them but is not scanned by the home config loses those
styles silently. This is what made the FAQ section dropdown render with a
transparent background — it used `zone-surface` (defined in `index.css`) on a
page the home config does not scan.

**What to do:**

1. Move the genuinely global custom utilities (`zone-*`, `.glass*`; audit for
   others) **out of `@layer utilities`** into plain top-level CSS in
   `index.css`. Plain CSS is never purged — that is exactly why `.bg-grid` and
   `.bg-noise`, already written as plain CSS, never break. This is the
   surgical fix.
2. Then evaluate whether the three-config split still earns its complexity.
   Measure the CSS output size with a single config; for a site this size on
   Tailwind 3.4 it is likely small enough that consolidating to one config and
   one stylesheet is simpler and safer. Recommend a direction to the user.

**Acceptance:** no custom utility can disappear due to per-page purging;
verified by building and confirming the classes are present in the output CSS
for every route.

### Item 4 — Consolidate design tokens · Priority: Medium

**Why:** inconsistencies — mixed corner radii (`rounded-3xl`, `rounded-2xl`,
and arbitrary `rounded-[...]` values), one-off colours like `text-[#5f594f]` —
come from values typed inline instead of being defined as tokens.

**What to do:** audit arbitrary Tailwind values (the `[...]` syntax) across
`components/**` and `pages/**`. Promote recurring ones into the
`tailwind.config.ts` theme — a named radius scale, the muted-stone colour, and
so on. Replace the inline values with the tokens. Treat any remaining arbitrary
values as deliberate, rare exceptions.

**Acceptance:** a documented, consistent radius and colour scale; arbitrary
values are rare and intentional rather than the norm.

### Item 5 — Clear codebase drift · Priority: Medium

**Why:** fast iteration leaves dead and duplicated code behind.

**What to do:**

- Delete the vestigial `constants.tsx` re-export (its own comment says it is
  safe to delete; first confirm nothing imports `../constants.tsx` explicitly
  — imports of `../constants` resolve to `constants/index.ts`).
- Run a dead-code finder (`knip` or `ts-prune`) and remove genuinely unused
  exports and files.
- De-duplicate any remaining parallel implementations or repeated constants.
- Adopt a "definition of done" that includes deleting whatever a change
  replaces, so drift stops re-accumulating.

**Acceptance:** `knip` / `ts-prune` runs clean (or with only intentional,
documented exceptions); no obvious dead code remains.

### Item 6 — Repo hygiene · Priority: Low (quick — do it first)

**What to do:**

- Add to `.gitignore`: `vite.config.ts.timestamp-*.mjs` and `*.log` (the
  latter covers `serve-4174.log`).
- Delete the existing `vite.config.ts.timestamp-*.mjs` files and
  `serve-4174.log` from the repo.
- Confirm `dist/` and `node_modules/` are ignored.

**Acceptance:** the repo root contains only source and configuration — no build
artifacts or logs.

### Item 7 — Deepen automated testing · Priority: Medium

**Why:** the existing Vitest suite is good but thin on interaction and layout,
so bugs like a misaligned CTA or a non-scrollable menu can slip through.

**What to do:**

- Add Playwright for a handful of end-to-end flows and, importantly,
  **visual-regression** screenshots of the key pages at key breakpoints — this
  is what catches layout and alignment regressions.
- Deepen a few component tests around interactions (the FAQ accordion, the
  scroll-spy, the section picker).
- Wire the new tests into the CI pipeline from Item 2.

**Acceptance:** a visual-regression baseline exists and runs in CI; the key
user flows are covered.

---

## Suggested execution order

1. **Item 6 — repo hygiene.** A five-minute quick win; do it first.
2. **Item 1 — `CLAUDE.md`** and **Item 2 — CI.** The foundation that makes
   every later change safer and verifiable.
3. **Item 3 — the Tailwind purge fix.** The most important correctness fix.
4. **Items 4, 5, 7** — design tokens, drift cleanup, deeper testing — as
   capacity allows.

Tackle one item per working session and confirm with the user before moving on
to the next.
