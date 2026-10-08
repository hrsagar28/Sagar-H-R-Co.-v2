# Sagar H R & Co. — website

The website of Sagar H R & Co., Chartered Accountants, Mysuru: https://casagar.co.in

`CLAUDE.md` is the full guide to the code (structure, styling, patterns to
keep, build and deployment). This file covers the everyday tasks.

## Stack

React 19 · TypeScript · Vite 5 · React Router 7 (`BrowserRouter`) · plain CSS
(`components/redesign/redesign.css`), with Tailwind for the app shell only.
Node 22. Deployed on Netlify.

## Working on it

1. Clone the repository.
2. `npm ci` (installs exactly what `package-lock.json` lists).
3. `npm run dev`, then open http://localhost:3000.

Before pushing: `npm run lint`, `npm run typecheck`, `npm test -- --run`.
`npx vite build` checks that the site builds; `npm run build` also regenerates
the icons, the sitemap and feeds, the portrait sizes and the per-page HTML
files, and is what Netlify runs.

## Where things are

- `pages/` — one component per address; `pages/home/` the home page's
  sections, `pages/ResourceTools/` the calculators and reference tools.
- `components/redesign/` — the layout every page renders in (top bar, footer)
  and `redesign.css`, which styles every page.
- `constants/` — the site's text and data: services, FAQs, careers, page
  titles and descriptions (`pageMeta.ts`), and the Resources data
  (`constants/resources/`).
- `config/contact.ts` — the office address, phone, email, FRN and map: the one
  place they are written.
- `public/data/insights.json` and `public/content/insights/` — the articles.
- `scripts/` — the build-time scripts.

## Updating content

- **Services** — `constants/services.tsx` (`SERVICE_PAGES`): one entry per
  service page, with its scope of work, documents needed and common questions.
- **FAQs** — `constants/faq.ts`.
- **Due dates** — `constants/resources/calendar.ts`, updated each year before
  April. The other Resources figures (tax slabs, TDS rates, GST rates, cost
  inflation index, section numbers) are in `constants/resources/`;
  `AUDIT-RESOURCES-LAW.md` records what each was checked against. Update it
  with any figure you change.
- **Articles** — add an entry to `public/data/insights.json` and the article
  itself as `public/content/insights/<slug>.md`; its share picture goes in
  `public/og/<slug>.png` (1200 × 630). The sitemap, feeds and per-page HTML
  pick it up at the next build.
- **Open roles** — `constants/careers.ts`.
- **Legal pages** — `pages/Privacy.tsx`, `pages/Terms.tsx`,
  `pages/Disclaimer.tsx`; the "last updated" date is `RD_LEGAL_UPDATED` in
  `components/redesign/content.ts`.

## Deployment

Pushing to `main` deploys to Netlify. `netlify.toml` holds the redirects,
security headers and cache rules. Open a pull request first to get a deploy
preview.

## Licence

© 2023–2026 Sagar H R & Co. All rights reserved.
