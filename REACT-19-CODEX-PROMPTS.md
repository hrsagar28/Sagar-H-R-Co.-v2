# Codex prompts — Migrate `Sagar-H-R-Co.-v2` from React 18.3 → React 19

Run these in order. Commit after each prompt. Re-run `npm run lint && npm test && npm run build` between prompts; if any of those fail, fix before moving on.

The current state of the repo (from `package.json`):

- `react@18.3.1`, `react-dom@18.3.1`, `@types/react@18.3.3`, `@types/react-dom@18.3.0`
- `react-router-dom@6.23.1`
- `@testing-library/react@14.2.0`
- `lucide-react@0.379.0`
- Other deps (`react-markdown@9`, `rehype-sanitize@6`, `remark-*`, `@axe-core/react@4.11.2`, `@botpoison/browser`, `@netlify/blobs`) are React-version-agnostic in their current form.

---

## Prompt 1 — Run the official React 19 codemod on the 18.3.1 codebase

> **Codex prompt:**
>
> Repository: a Vite + React 18.3.1 + TypeScript site (`Sagar-H-R-Co.-v2`). I am about to upgrade React from 18.3.1 to 19, but before bumping the package versions I want to run the official React 19 codemods so the existing 18.3.1 deprecation warnings get silenced and any breaking-change rewrites happen on a still-working codebase.
>
> Do exactly this:
>
> 1. From the repo root, run the official React 19 migration codemod recipe:
>
>    ```
>    npx codemod@latest react/19/migration-recipe
>    ```
>
>    Accept all the bundled transforms when prompted (these handle `react-element-removed-deprecated-apis`, `replace-string-ref`, `replace-act-import`, `replace-use-form-state`, and `replace-reactdom-render`).
>
> 2. If `npx codemod@latest` is not available or the recipe name has been renamed (the React team occasionally renames bundles), fall back to running the individual codemods in this order:
>
>    ```
>    npx codemod@latest react/19/replace-reactdom-render
>    npx codemod@latest react/19/replace-string-ref
>    npx codemod@latest react/19/replace-act-import
>    npx codemod@latest react/19/replace-use-form-state
>    npx codemod@latest react/19/react-element-removed-deprecated-apis
>    ```
>
> 3. Run `npm run lint -- --fix` and `npx prettier --write .` so the codemod output matches the project's existing formatting.
> 4. Run `npm test` and `npm run build`. **Both must still pass on React 18.3.1.** If they do not, the codemods rewrote something incorrectly — revert the offending file and report which file + which codemod is at fault. Do not proceed.
> 5. Commit the result as a single commit titled `chore(react): run React 19 codemods on 18.3.1`.
>
> **Acceptance checks:**
>
> - `npm run lint`, `npm test`, `npm run build` all pass.
> - `git diff HEAD~1` shows only mechanical rewrites (no manual logic changes).
> - The dev server (`npm run dev`) starts and `/` renders correctly with no new console warnings.

---

## Prompt 2 — Bump React, types, router, testing-library, and lucide-react

> **Codex prompt:**
>
> Repository: same Vite + React + TypeScript site. The previous commit ran the React 19 codemods. Now bump the dependencies.
>
> Do exactly this:
>
> 1. From the repo root run:
>
>    ```
>    npm i react@19 react-dom@19
>    npm i -D @types/react@19 @types/react-dom@19
>    npm i react-router-dom@7
>    npm i -D @testing-library/react@latest @testing-library/jest-dom@latest vitest-axe@latest
>    npm i lucide-react@latest
>    ```
>
>    Pin to whatever exact versions npm resolves (do not use caret-only ranges; let `package-lock.json` lock them).
>
> 2. Run `npm run lint`. Expect TypeScript errors. Common shapes and the fix for each:
>    - `Type 'ReactNode' is not assignable to type 'undefined | ...'` on a child position → the parent prop type is `children?: ReactNode`. In React 19's stricter types, `ReactNode` no longer implicitly includes `undefined`. Make the child optional with `children?: React.ReactNode | undefined` if needed, or just pass an empty fragment.
>    - `Property 'ref' does not exist on type 'IntrinsicAttributes & ...'` on a component that used `forwardRef` — leave for Prompt 3.
>    - `'defaultProps' will be removed from function components` warning → replace with destructured defaults: `function X({ size = 16, ... })`.
>    - `Implicit 'any' on event parameter` → add the explicit handler type, e.g. `(e: React.PointerEvent<HTMLButtonElement>) => …`.
>
>    Fix every TS error file by file. Run `npx tsc --noEmit` between files to catch ripple effects. **Do not silence errors with `// @ts-ignore` or `any` — fix them.**
>
> 3. Run `npm test`. If any test fails specifically because of `@testing-library/react@16+` (e.g. `act` warnings, `cleanup` no longer auto-imported), fix the test setup file (`vitest.setup.ts` or similar). Typical fix:
>
>    ```ts
>    import '@testing-library/jest-dom/vitest';
>    import { cleanup } from '@testing-library/react';
>    import { afterEach } from 'vitest';
>    afterEach(() => cleanup());
>    ```
>
> 4. Run `npm run build`. Fix any build error (most likely: a third-party plugin in `vite.config.ts` that needs to be updated for React 19 — bump it to latest).
> 5. Manually smoke test in `npm run dev`:
>    - Load `/` — hero, ChaosToOrder, services rail, FAQ all render.
>    - Click into `/services/gst`, `/insights`, `/contact`. No new console errors.
>    - Submit the contact form (without actually sending) and confirm the loading state works.
> 6. Commit titled `chore(react): bump to React 19, React Router 7, Testing Library 16`.
>
> **Acceptance checks:**
>
> - `package.json` shows `"react": "^19.x.x"`, `"react-dom": "^19.x.x"`, `"react-router-dom": "^7.x.x"`, `"@types/react": "^19.x.x"`, `"@types/react-dom": "^19.x.x"`, `"@testing-library/react": "^16.x.x"`.
> - `npm run lint`, `npm test`, `npm run build` all pass.
> - `git grep "forwardRef" --` may still show usages — that's fine, Prompt 3 handles them.

---

## Prompt 3 — Replace every `forwardRef` with ref-as-prop

> **Codex prompt:**
>
> Repository: same site, now on React 19. In React 19, `ref` is a normal prop on function components — `forwardRef` is deprecated and emits warnings. Remove every `forwardRef` usage in the repo.
>
> Do exactly this:
>
> 1. Find every file that imports or calls `forwardRef`:
>
>    ```
>    git grep -nE "forwardRef|React\.forwardRef" -- '*.ts' '*.tsx'
>    ```
>
> 2. For each match, rewrite the component from this shape:
>
>    ```tsx
>    // Before
>    import { forwardRef } from 'react';
>    interface FieldProps {
>      label: string;
>      error?: string; /* ... */
>    }
>    const Field = forwardRef<HTMLInputElement, FieldProps>(({ label, error, ...rest }, ref) => (
>      <label>
>        <span>{label}</span>
>        <input ref={ref} {...rest} />
>        {error ? <span>{error}</span> : null}
>      </label>
>    ));
>    Field.displayName = 'Field';
>    export default Field;
>    ```
>
>    to this shape:
>
>    ```tsx
>    // After
>    import type { Ref } from 'react';
>    interface FieldProps {
>      label: string;
>      error?: string;
>      ref?: Ref<HTMLInputElement>;
>      // ...
>    }
>    function Field({ label, error, ref, ...rest }: FieldProps) {
>      return (
>        <label>
>          <span>{label}</span>
>          <input ref={ref} {...rest} />
>          {error ? <span>{error}</span> : null}
>        </label>
>      );
>    }
>    export default Field;
>    ```
>
>    Drop the `displayName` assignment — React DevTools picks up the function name automatically.
>
> 3. If a `forwardRef` component had generic type parameters (e.g. polymorphic `as` prop helpers), preserve them on the function declaration:
>
>    ```tsx
>    function Field<E extends HTMLElement = HTMLInputElement>({ ref, ...rest }: FieldProps & { ref?: Ref<E> }) { ... }
>    ```
>
> 4. After rewriting, run `git grep "forwardRef" -- '*.ts' '*.tsx'` — must return zero results (other than this prompt file if you have it open in the workspace).
> 5. Run `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`. All must pass.
> 6. Smoke-test every form input on `/contact` and the tax calculator inputs on whichever page renders them. Refs are most often used by focus management and validation; if focus-on-error stops working, the migration of that specific component is wrong.
> 7. Commit titled `refactor(react19): replace forwardRef with ref-as-prop`.
>
> **Acceptance checks:**
>
> - Zero usages of `forwardRef` in the codebase.
> - All forms still focus the first error field on submit.
> - DevTools console shows no `forwardRef` deprecation warnings on any page.

---

## Prompt 4 — Rewrite `components/SEO.tsx` using React 19 native document metadata

> **Codex prompt:**
>
> Repository: same site, now on React 19. `components/SEO.tsx` currently manages `<title>`, `<meta>`, `<link rel="canonical">`, OG / Twitter tags, and JSON-LD script tags by imperatively mutating `document.head` inside a `useEffect`, using `data-dynamic-schema` / `data-dynamic-article-meta` / `data-dynamic-alternate` attributes to track its own tags for cleanup. This is fragile under StrictMode (double-fires effects), can leave orphan tags on fast route changes, and is now unnecessary because React 19 supports native document metadata in JSX.
>
> Rewrite the file so all tags are rendered as JSX. React 19 automatically hoists `<title>`, `<meta>`, `<link>`, and `<script type="application/ld+json">` into `<head>` and dedupes them on re-render.
>
> Do exactly this:
>
> 1. Open `components/SEO.tsx`. Keep the props interface (`SEOProps`) and the helper `toAbsoluteUrl`. Delete everything inside the `useEffect` and the `useEffect` itself. Delete the helpers `updateMeta` and `addSchema`. Delete the cleanup function. Delete the `useEffect` import if no longer used.
> 2. Replace the body of the component with a JSX tree that renders the same set of tags. Use this template, adapting it to the existing prop set:
>
>    ```tsx
>    import React from 'react';
>    import { stringifyJsonLd } from '../utils/jsonLd';
>    import { SITE_URL } from '../config/site';
>
>    interface SEOProps {
>      title: string;
>      description: string;
>      keywords?: string;
>      canonicalUrl?: string;
>      ogType?: 'website' | 'article' | 'profile';
>      noindex?: boolean;
>      ogImage?: string;
>      schema?: object | object[];
>      breadcrumbs?: Array<{ name: string; url: string }>;
>      article?: {
>        headline: string;
>        author: string;
>        authorUrl?: string;
>        authorSameAs?: string[];
>        datePublished: string;
>        dateModified?: string;
>        image?: string;
>        section?: string;
>        tags?: string[];
>        wordCount?: number;
>      };
>      service?: { name: string; description: string; areaServed?: string };
>      faqs?: Array<{ question: string; answer: string; dateModified?: string }>;
>      alternates?: Array<{ rel?: string; type?: string; title?: string; href: string }>;
>    }
>
>    const toAbsoluteUrl = (url: string) =>
>      url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
>
>    const getDefaultCanonicalUrl = () => {
>      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
>      return `${SITE_URL}${pathname}`;
>    };
>
>    const SEO: React.FC<SEOProps> = ({
>      title,
>      description,
>      keywords = 'Chartered Accountant, Mysuru, Audit, Tax, GST, Business Advisory, CA Firm',
>      canonicalUrl = getDefaultCanonicalUrl(),
>      ogType = 'website',
>      noindex = false,
>      ogImage = `${SITE_URL}/og/og-default.png`,
>      schema,
>      breadcrumbs,
>      article,
>      service,
>      faqs,
>      alternates,
>    }) => {
>      const breadcrumbSchema =
>        breadcrumbs && breadcrumbs.length > 0
>          ? {
>              '@context': 'https://schema.org',
>              '@type': 'BreadcrumbList',
>              itemListElement: breadcrumbs.map((item, index) => ({
>                '@type': 'ListItem',
>                position: index + 1,
>                name: item.name,
>                item: toAbsoluteUrl(item.url),
>              })),
>            }
>          : null;
>
>      const articleSchema = article
>        ? {
>            '@context': 'https://schema.org',
>            '@type': 'Article',
>            headline: article.headline,
>            inLanguage: 'en-IN',
>            author: {
>              '@type': 'Person',
>              name: article.author,
>              ...(article.authorUrl ? { url: article.authorUrl } : {}),
>              ...(article.authorSameAs?.length ? { sameAs: article.authorSameAs } : {}),
>            },
>            publisher: {
>              '@type': 'Organization',
>              name: 'Sagar H R & Co.',
>              logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
>            },
>            datePublished: article.datePublished,
>            ...(article.dateModified ? { dateModified: article.dateModified } : {}),
>            ...(article.section ? { articleSection: article.section } : {}),
>            ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
>            ...(article.wordCount ? { wordCount: article.wordCount } : {}),
>            image: article.image ? toAbsoluteUrl(article.image) : ogImage,
>            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
>          }
>        : null;
>
>      const serviceSchema = service
>        ? {
>            '@context': 'https://schema.org',
>            '@type': 'Service',
>            name: service.name,
>            description: service.description,
>            provider: { '@id': `${SITE_URL}/#organization` },
>            ...(service.areaServed ? { areaServed: { '@type': 'City', name: service.areaServed } } : {}),
>          }
>        : null;
>
>      const faqSchema =
>        faqs && faqs.length > 0
>          ? {
>              '@context': 'https://schema.org',
>              '@type': 'FAQPage',
>              mainEntity: faqs.map((faq) => ({
>                '@type': 'Question',
>                name: faq.question,
>                acceptedAnswer: {
>                  '@type': 'Answer',
>                  text: faq.answer,
>                  ...(faq.dateModified ? { dateModified: faq.dateModified } : {}),
>                },
>              })),
>            }
>          : null;
>
>      return (
>        <>
>          <title>{title}</title>
>          <meta name="description" content={description} />
>          <meta name="keywords" content={keywords} />
>          <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
>
>          <link rel="canonical" href={canonicalUrl} />
>
>          <meta property="og:title" content={title} />
>          <meta property="og:description" content={description} />
>          <meta property="og:url" content={canonicalUrl} />
>          <meta property="og:type" content={ogType} />
>          <meta property="og:image" content={ogImage} />
>          <meta property="og:locale" content="en_IN" />
>
>          <meta name="twitter:card" content="summary_large_image" />
>          <meta name="twitter:title" content={title} />
>          <meta name="twitter:description" content={description} />
>          <meta name="twitter:image" content={ogImage} />
>          <meta name="twitter:site" content="@casagarhr" />
>          <meta name="twitter:creator" content="@casagarhr" />
>
>          {article && (
>            <>
>              <meta property="article:published_time" content={article.datePublished} />
>              <meta property="article:modified_time" content={article.dateModified || article.datePublished} />
>              <meta property="article:author" content={article.author} />
>              {article.section ? <meta property="article:section" content={article.section} /> : null}
>              {article.tags?.map((tag) => (
>                <meta key={tag} property="article:tag" content={tag} />
>              ))}
>            </>
>          )}
>
>          {alternates?.map((alt) => (
>            <link
>              key={alt.href}
>              rel={alt.rel || 'alternate'}
>              {...(alt.type ? { type: alt.type } : {})}
>              {...(alt.title ? { title: alt.title } : {})}
>              href={toAbsoluteUrl(alt.href)}
>            />
>          ))}
>
>          {schema && <script type="application/ld+json">{stringifyJsonLd(schema)}</script>}
>          {breadcrumbSchema && <script type="application/ld+json">{stringifyJsonLd(breadcrumbSchema)}</script>}
>          {articleSchema && <script type="application/ld+json">{stringifyJsonLd(articleSchema)}</script>}
>          {serviceSchema && <script type="application/ld+json">{stringifyJsonLd(serviceSchema)}</script>}
>          {faqSchema && <script type="application/ld+json">{stringifyJsonLd(faqSchema)}</script>}
>        </>
>      );
>    };
>
>    export default SEO;
>    ```
>
> 3. Do NOT change any caller of `<SEO />` — the props interface is unchanged.
> 4. Run `npm test`. If any SEO-related test is asserting against `document.head` mutations, update it to render the SEO component and use `screen.getByText` or query the document for the new JSX-rendered tags.
> 5. Manually verify in `npm run dev`:
>    - Open `/`, then DevTools → Elements → `<head>`. Confirm one `<title>`, one canonical `<link>`, one description `<meta>`, one OG image `<meta>`, and the AccountingService JSON-LD script.
>    - Navigate to `/services/gst`, then `/about`, then back to `/`. The head tags should swap cleanly. There must be no duplicate `<title>` or duplicate JSON-LD scripts at any point.
>    - Open `/insights/<any-slug>` and confirm both the page-level schema and the article schema render exactly once each.
> 6. Commit titled `refactor(seo): use React 19 native document metadata`.
>
> **Acceptance checks:**
>
> - `components/SEO.tsx` contains zero `useEffect`, zero `document.createElement`, zero `document.head` references.
> - Across route navigations, `document.querySelectorAll('title').length === 1` and `document.querySelectorAll('script[type="application/ld+json"]').length` equals the expected count for the page (1 for `/`, 2 for `/insights/:slug`, etc.).
> - Google's Rich Results test still parses `/` and `/insights/<slug>` schemas cleanly.

---

## Prompt 5 — Drop now-redundant manual memoization

> **Codex prompt:**
>
> Repository: same site, now on React 19. The site does not yet use the React Compiler, but several components are wrapped in `React.memo` because of the previous performance plan. Some of those wrappers were costly to maintain; some were never load-bearing. Clean them up.
>
> Do exactly this:
>
> 1. Find every `React.memo` / `memo(` usage:
>
>    ```
>    git grep -nE "React\.memo|\\bmemo\\(" -- '*.ts' '*.tsx'
>    ```
>
> 2. For each match, evaluate whether the wrapper is still necessary:
>    - **Keep** the wrapper if the component is rendered many times in a list AND its props are stable (e.g. an item inside a virtualized list).
>    - **Remove** the wrapper if the component is rendered once or a few times per page (e.g. `Navbar`, `Marquee`, top-level layout components). React 19 + the future Compiler will handle this better than a hand-placed `memo`.
> 3. Specifically, in this codebase:
>    - `components/Navbar.tsx` uses `React.memo` — remove. Navbar renders once; the memo wrapper provides no benefit and complicates DevTools.
>    - `components/Marquee.tsx` uses `React.memo` — remove. Same reasoning.
>    - Anywhere `useCallback` or `useMemo` wraps a value that is recomputed cheaply (e.g. `useCallback(() => setX(false), [])` — these add more code than they save), inline them. Use judgement: keep `useCallback` if it is passed to a memoized child or used as a dep in another hook.
> 4. Run `npm run lint`, `npm test`, `npm run build`. All must pass.
> 5. Smoke-test `/`, `/contact`, `/services/gst`. Watch DevTools Profiler — no component should now re-render noticeably more often than before. If a component does (rare), restore its `memo` wrapper with a comment explaining why.
> 6. Commit titled `refactor(react19): remove unnecessary React.memo wrappers`.
>
> **Acceptance checks:**
>
> - `git grep "React.memo" -- '*.tsx'` shows only the wrappers you deliberately kept (with a comment), or zero.
> - No new performance regression visible in DevTools Profiler on `/`.

---

## Prompt 6 — Enable the React Compiler in annotation mode

> **Codex prompt:**
>
> Repository: same Vite + React 19 site. Turn on the React Compiler so it can auto-memoize specific files we opt in to. Use annotation mode first — flipping the entire repo at once is riskier than necessary on a site with this much animation work.
>
> Do exactly this:
>
> 1. Install the Babel plugin:
>
>    ```
>    npm i -D babel-plugin-react-compiler
>    ```
>
>    Pin to the latest stable version (not the experimental tag).
>
> 2. Open `vite.config.ts`. Locate the `react()` plugin call from `@vitejs/plugin-react`. Pass the compiler as a Babel plugin in annotation mode:
>
>    ```ts
>    import { defineConfig } from 'vite';
>    import react from '@vitejs/plugin-react';
>
>    export default defineConfig({
>      plugins: [
>        react({
>          babel: {
>            plugins: [['babel-plugin-react-compiler', { compilationMode: 'annotation' }]],
>          },
>        }),
>        // …other plugins
>      ],
>    });
>    ```
>
>    If `vite.config.ts` already passes options to `react()`, merge — don't overwrite.
>
> 3. Opt the following files into compilation by adding `'use memo';` as the first non-comment statement at the top of each file (after imports if the compiler version requires it — check the plugin docs for the latest directive syntax):
>    - `pages/Home.tsx`
>    - `components/Navbar.tsx`
>    - `components/Marquee.tsx`
>    - `components/HorizontalScroll.tsx`
>    - `components/home/ChaosToOrder.tsx`
>    - `components/home/FAQPreview.tsx`
>    - `components/home/StarField.tsx`
>    - `components/home/FounderSection.tsx`
>    - `components/home/LocationStrip.tsx`
>    - `components/home/TrustBar.tsx`
> 4. Run `npm run build`. The Vite output should include `[react-compiler]` log lines naming each of the files above as successfully compiled. If the compiler errors on any file, READ the error — it usually points to a specific React rule violation (mutating props, conditional hook calls, etc.). Fix the violation; do not silence the rule.
> 5. Run `npm test`. All tests must pass.
> 6. `npm run dev` and walk every page that touches a compiled file. Watch the console for any new warnings. Specific things to look at:
>    - The `Reveal` component's `transitionend` listener still fires when reveal-mask completes (scroll into Founder section, then check DevTools Performance for a `transitionend` fire on the heading wrapper).
>    - `ChaosToOrder` drag still updates the divider in real time.
>    - `HorizontalScroll` arrow buttons still appear / disappear at the rail extremes.
>    - `FAQPreview` accordion still opens with smooth height animation.
> 7. Commit titled `feat(react19): enable React Compiler in annotation mode for home-page components`.
>
> **Acceptance checks:**
>
> - `npm run build` succeeds with `babel-plugin-react-compiler` enabled.
> - Build log lists every annotated file as compiled.
> - No new console warnings on `/`, `/services/:slug`, `/insights/:slug`, `/contact`.
> - DevTools React Profiler shows fewer re-renders on `Home`'s child components than before (compare against the previous commit).

---

## Prompt 7 — Verify and close out

> **Codex prompt:**
>
> Repository: same site, now fully on React 19 with the Compiler enabled for the home page. Final verification pass.
>
> Do exactly this:
>
> 1. Run, in order:
>
>    ```
>    npm run lint
>    npx tsc --noEmit
>    npm test
>    npm run build
>    npm run preview &
>    sleep 5
>    npx lighthouse http://localhost:4173/ --only-categories=performance,accessibility,best-practices,seo --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=./lighthouse-react19.json
>    kill %1
>    ```
>
> 2. Open `lighthouse-react19.json`. Confirm:
>    - Performance score ≥ the score recorded in `PERF-CODEX-PROMPTS.md` (85 baseline; should be the same or higher after the upgrade).
>    - Accessibility score is 100 or no worse than before.
>    - SEO score is 100.
>    - Best-practices score reflects no new violations (no deprecated API warnings).
> 3. Verify in DevTools console on `/`, `/services/gst`, `/insights/<any-slug>`, `/contact`:
>    - Zero deprecation warnings about `forwardRef`, `defaultProps`, `useFormState`, `ReactDOM.render`, or legacy string refs.
>    - Zero "Cannot update a component while rendering a different component" warnings.
>    - Zero "Each child in a list should have a unique key" warnings.
> 4. Verify in `package.json`:
>    - `react` and `react-dom` are on `^19.x`.
>    - `@types/react` and `@types/react-dom` are on `^19.x`.
>    - `react-router-dom` is on `^7.x`.
>    - `@testing-library/react` is on `^16.x` or later.
>    - `babel-plugin-react-compiler` is in devDependencies.
> 5. Update the README (if one exists at repo root) so the "Tech stack" section lists React 19.
> 6. Commit titled `chore(react19): verification pass — Lighthouse + console clean`.
>
> **Acceptance checks:**
>
> - All four scripts in step 1 succeed.
> - Lighthouse JSON shows scores ≥ pre-upgrade baseline.
> - DevTools console is clean on all four primary routes.
> - `package.json` reflects the new versions.

---

## Notes for the human running these prompts

- Run prompts 1 → 7 in order. Each commits its own changes; if any prompt's acceptance checks fail, do not move on — re-prompt Codex to fix the failure.
- If prompt 1 fails because `codemod@latest` has renamed the recipe, just paste the error back to Codex and ask it to find the current recipe name — the React team renames bundles occasionally and the prompt anticipates that.
- The whole migration should take Codex 1–3 hours of working time. If any single prompt takes more than ~30 minutes, stop and investigate — something is going wrong silently.
- Don't enable the React Compiler (Prompt 6) on a Friday. Walk every animation on the home page before committing.
