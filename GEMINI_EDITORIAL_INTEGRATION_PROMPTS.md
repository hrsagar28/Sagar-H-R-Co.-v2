# Gemini Prompts — Editorial Luxury Integration (Dual-Zone)
## Sagar H R & Co. — v2 codebase

> **Purpose.** Seven phased prompts to hand to Gemini in Antigravity. Each one layers a slice of the Editorial Luxury design system onto the existing React + Vite + TypeScript codebase in a controlled way. The site ends up with **two coexisting palette zones** (moss for functional pages, ink/paper/gold/rust for ceremonial pages) unified by a **single typography system**.
>
> **Run them in order.** Each prompt assumes the previous ones are merged. After every prompt: run `npm run dev`, eyeball the changes, run `npm run build`, commit, then continue.

---

## Firm reality (this shapes every prompt)

- **Founded:** 2023 → Roman: **MMXXIII**
- **Principal:** Sagar H R, **ACA** (Associate CA, not Fellow), sole proprietor, **3 years in practice**
- **Location:** Mysuru · **12.3004° N · 76.6518° E**
- **No boast-worthy scale yet.** No "650+ clients," no "85% appellate wins," no "120 matters argued." Any hero that normally carries stats will either carry qualitative meta (Scope / Discipline / Forums / Status) or no meta at all. This is both honest and on-brand — editorial luxury thrives on restraint.

---

## Strategy — dual-zone synthesis

Your existing brand is moss-green CTA on warm off-white with Plus Jakarta Sans body + Outfit headings + Playfair Display italic. The Editorial Luxury reference is ink-black on aged paper with gold/rust accents and Fraunces + Instrument Serif + JetBrains Mono. Rather than pick one, this plan **unifies the typography** (so the site feels like one firm) while **zoning the palette** (so inner pages feel distinct).

**Moss remains the brand primary, reassigned as the universal action color.** Every CTA, link-on-hover, and accent-of-engagement stays moss. Moss is what makes the firm *yours*.

**Editorial palette (ink / paper / gold / rust) becomes the surface palette for ceremonial pages only.** On those pages you'll see ink background, paper text, gold eyebrows, rust numerals — and the CTA button still glows moss. That's the synthesis: editorial voice, moss action.

### Zoning map

| Zone | Pages | Background | Headings | Accent | CTA |
|------|-------|------------|----------|--------|-----|
| **Moss** (default) | /, /services, /services/:slug, /resources, /resources/..., /faqs, /careers, /legal | `brand-bg` #F2F2F0 | Fraunces | Playfair italic · moss | moss-filled |
| **Editorial** | /about, /contact, /insights/:slug (article body) | `brand-ink` or `brand-paper` | Fraunces | Playfair italic · gold or rust | moss-outline → moss-filled |
| **Hybrid** | /insights (index) | `brand-bg` but uses HeroArchive which has editorial motifs | Fraunces | Playfair italic · rust | moss |

Activated by a `data-zone="editorial"` attribute at the page's root container, which cascades palette tokens to descendants via CSS custom-property overrides.

### Typography (unified across both zones)

- **Plus Jakarta Sans** — body copy everywhere (no change)
- **Fraunces** — all headings H1–H3, site-wide, **replaces Outfit**
- **Playfair Display** — italic accents inside headlines (no change; already loaded)
- **JetBrains Mono** — eyebrows, labels, GPS coords, metadata (new)

Four families. Outfit is dropped. Every heading on the site will look different after Prompt 1 — that's the biggest single visual shift in the plan. It is reversible with a one-token rollback in `tailwind.config.ts` if you don't like it.

---

## How to use each prompt

Each section has three blocks:

1. **What it does / why** — plain summary. Don't paste.
2. **The prompt** — exact text to paste into Gemini. Copy verbatim from the ```gemini block.
3. **Acceptance criteria** — what to verify before moving on.

Paste **Prompt 0 once** at the start of your Antigravity session. Then paste Prompts 1 → 7 in order.

---

# Prompt 0 — Project Preamble

**What it does / why.** Grounds Gemini in what exists, what not to touch, and — crucially — the firm's actual scale so it never fabricates stats. Paste this once at the top of a fresh session.

```gemini
You are working inside the Sagar H R & Co. website codebase. It is a React 18 + Vite 5 + TypeScript multi-page SPA using Tailwind CSS 3, React Router v6, and Lucide icons. Routes: /, /about, /services, /services/:slug, /insights, /insights/:slug, /faqs, /resources, /resources/checklist/:slug, /careers, /contact, legal pages, and a 404.

FIRM REALITY — any copy, stat, or claim you write must be consistent with these facts:
- Firm founded in 2023 (Roman: MMXXIII).
- Principal: Sagar H R, sole proprietor, ACA (Associate member of ICAI — NOT Fellow, so never write "FCA" or "Fellow").
- Principal is in 3 years of practice.
- Location: Mysuru, Karnataka. Coordinates: 12.3004° N · 76.6518° E.
- The firm is young and small. Do NOT invent or carry over mock business stats (e.g. "650+ clients", "85% appellate wins", "120+ matters argued"). If you encounter a place in a reference where such stats were used, REPLACE them with qualitative meta (Scope / Discipline / Forums / Status) or omit the meta section entirely.

Existing brand identity — KEEP these:
- Fonts (as used today): Plus Jakarta Sans (body, `font-sans`), Outfit (headings, `font-heading`), Playfair Display (italic accents, `font-serif`).
- Palette: brand-bg #F2F2F0, brand-surface #FFFFFF, brand-dark #111111, brand-moss #1A4D2E (PRIMARY ACCENT / CTA), brand-mossLight #E8F5E9, brand-border #e7e5e4, brand-stone #78716c.
- Animations are vanilla RAF + IntersectionObserver. Framer Motion is NOT installed (Prompt 6 may add it in a scoped way).
- `prefers-reduced-motion` must be respected everywhere.

Existing components you must not break: Navbar, Footer, PageHero, Reveal, CustomCursor, Parallax, MagneticButton, Marquee, ServiceBento, FounderSection, TestimonialCarousel, TrustBar, LocationStrip, FAQPreview, SEO, Breadcrumbs, Preloader, Toast system, all calculators and resource tools.

Upcoming work — we will selectively adopt Editorial Luxury moves:
1. Swap Outfit → Fraunces for ALL headings. Keep Plus Jakarta Sans body. Keep Playfair italic for accent words. Add JetBrains Mono for eyebrows and metadata.
2. Add an editorial palette alongside moss: brand-ink #0a0908, brand-paper #f4f1ea, brand-cream #eae5d9, brand-brass #b8924c, brand-brass-bright #d4a961, brand-rust #8b3a2f. Moss remains untouched and becomes the universal action color.
3. Introduce a `data-zone="editorial"` attribute at page-root containers that overrides palette CSS variables for that page. Pages assigned: /about, /contact, and /insights/:slug article body. Other pages stay moss-default.
4. Extend the single generic PageHero into six variants: Split, Folio, Ledger, Frontispiece, Archive, Directory. Each variant is palette-aware (uses zone tokens, not hardcoded colors).
5. Add polish components: BigCTA, Grain, GhostText, Crosshair, SectionSymbol.
6. Introduce § symbols, Roman numerals (MMXXIII, not MMXIII), and archaic contact labels ("By Letter / By Voice / By Visit").

Hard constraints:
- Do NOT touch brand-moss, brand-bg, or any existing brand token. Only ADD new tokens.
- Do NOT remove Plus Jakarta Sans or Playfair Display. Outfit may be removed in Prompt 1 (explicit instruction).
- Do NOT change routing, page URLs, or data flows.
- Do NOT rename any page component.
- Do NOT fabricate stats. When a hero variant normally carries numbers and none exist, use qualitative meta I specify in the prompt, or omit.
- Every change must respect Tailwind setup and `prefers-reduced-motion`.
- When I send a numbered prompt, do ONLY that prompt, then run `npm run build` and report errors or warnings.

Acknowledge by echoing the Firm Reality facts and the zoning plan in 5–8 bullets, then wait for Prompt 1.
```

**Acceptance criteria.** Gemini echoes Firm Reality facts and zoning plan, without inventing additional claims.

---

# Prompt 1 — Typography swap (Fraunces + JetBrains Mono; drop Outfit)

**What it does / why.** The single biggest visual shift in the plan. Replaces Outfit with Fraunces as the display face across the entire site. Adds JetBrains Mono for labels. Keeps Plus Jakarta Sans body and Playfair Display italic unchanged. This unifies typography across both palette zones.

```gemini
Implement Phase 1: typography swap. This changes the look of every heading on every page. Expect the shift.

Tasks:

1. Update the Google Fonts link in `index.html` (or wherever fonts are loaded). Replace the current families list with:
   - Fraunces (ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400)
   - Plus Jakarta Sans (wght@400;500;600;700) — keep existing
   - Playfair Display (ital,wght@0,400;1,400) — keep existing, italic is the only use
   - JetBrains Mono (wght@300;400;500)
   Remove the Outfit family from the request URL.

2. In `tailwind.config.ts` under `theme.extend.fontFamily`:
   - CHANGE `heading` from Outfit to Fraunces:
     ```
     heading: ['Fraunces', 'Georgia', 'serif'],
     ```
   - KEEP `sans` as Plus Jakarta Sans.
   - KEEP `serif` as Playfair Display.
   - ADD:
     ```
     mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
     ```

3. Audit every place in the codebase that uses `font-heading`, `font-outfit`, or a literal reference to "Outfit". They should already map to `font-heading` via Tailwind — confirm no component imports a specific "Outfit" CSS file directly. If any does, remove the import.

4. Create `components/ui/Eyebrow.tsx`:
   ```ts
   interface EyebrowProps {
     children: React.ReactNode;
     tone?: 'moss' | 'brass' | 'rust' | 'stone';  // default 'moss'
     className?: string;
     as?: 'div' | 'span' | 'p';                    // default 'div'
   }
   ```
   Render: `<As className="inline-flex items-center gap-3 font-mono uppercase tracking-[0.2em] text-[0.7rem]">` with a `<span aria-hidden>` rule-slug child (24–32 px wide, 1 px tall) in the same tone color, then the children. Tone map:
   - moss → text-brand-moss, slug bg-brand-moss
   - brass → text-[#b8924c], slug bg-[#b8924c] (Prompt 2 upgrades to a token)
   - rust → text-[#8b3a2f], slug bg-[#8b3a2f]
   - stone → text-brand-stone, slug bg-brand-stone

5. Create `components/ui/AccentTitle.tsx`:
   ```ts
   interface AccentTitleProps {
     as?: 'h1' | 'h2' | 'h3';           // default h1
     children: React.ReactNode;          // may contain <em>
     className?: string;
     accentClassName?: string;           // defaults by context
     balance?: boolean;                  // wraps with text-balance if true
   }
   ```
   Renders the heading with `font-heading font-light tracking-[-0.02em] leading-[1]` base. Uses a local style rule (or a Tailwind `[&_em]:...` modifier) so descendant `<em>` elements are `font-serif italic font-normal text-brand-moss` by default. Consumers can override via `accentClassName` — this is important because editorial-zone pages will pass `text-brand-brass-bright` or `text-brand-rust`.

6. Refactor `components/PageHero.tsx` to use Eyebrow for the tag and AccentTitle for the title. Backward compatibility: keep the legacy props (tag, title, subtitle, description) working unchanged for every page that uses it today. Map `tag` → Eyebrow children. Map `title` → AccentTitle children (accept ReactNode so `<em>` works). Subtitle/description render unchanged.

7. Demonstrate italic-accent pattern on exactly two pages (no more):
   - Home hero: wrap ONE natural emphatic word in `<em>`.
   - About hero: wrap ONE natural emphatic word in `<em>`.
   Do not touch other pages' copy yet.

8. Run `npm run build`. Report all TypeScript and build errors. Take a screenshot-equivalent mental diff of the home page: expect every heading to now render in Fraunces (warm serif) instead of Outfit (geometric sans).

Hard don'ts:
- Do NOT change body text from Plus Jakarta Sans.
- Do NOT touch the moss color.
- Do NOT preemptively edit any other page beyond Home and About for the accent demo.
- Do NOT introduce new font loading beyond the four families named above.
```

**Acceptance criteria.**
- `npm run build` passes.
- Every heading across the site renders in Fraunces.
- Home and About hero titles each have one italicized Playfair accent word.
- `Eyebrow` and `AccentTitle` are usable components.
- No heading still renders in Outfit anywhere.

---

# Prompt 2 — Tokens + zoning system

**What it does / why.** Adds the editorial palette as new Tailwind tokens and introduces the `data-zone="editorial"` CSS-variable cascade that lets any page opt into the ink/paper/gold/rust surface without restyling every component. Also adds motion easings and a fluid type scale the hero variants will use.

```gemini
Implement Phase 2: tokens and the zoning system. Additive edits only; do not modify existing tokens.

Tasks:

1. In `tailwind.config.ts`, inside `theme.extend.colors`, ADD (do not touch existing keys):
   ```
   'brand-ink': '#0a0908',
   'brand-ink-soft': '#252321',
   'brand-paper': '#f4f1ea',
   'brand-cream': '#eae5d9',
   'brand-brass': '#b8924c',
   'brand-brass-bright': '#d4a961',
   'brand-rust': '#8b3a2f',
   'brand-line': '#1a1814',
   'brand-muted': '#7a7366',
   ```

2. In `tailwind.config.ts`, inside `theme.extend.transitionTimingFunction`, ADD:
   ```
   'out-expo': 'cubic-bezier(0.23, 1, 0.32, 1)',
   'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
   ```

3. In `tailwind.config.ts`, inside `theme.extend.fontSize`, ADD a clamp-based editorial scale (do not modify defaults):
   ```
   'eyebrow': ['clamp(0.65rem, 0.7vw, 0.75rem)', { lineHeight: '1' }],
   'lead': ['clamp(1.15rem, 1.5vw, 1.4rem)', { lineHeight: '1.5' }],
   'display-sm': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1' }],
   'display-md': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1' }],
   'display-lg': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95' }],
   'display-xl': ['clamp(4rem, 12vw, 12rem)', { lineHeight: '0.9' }],
   ```

4. In `index.css`, inside `@layer base`, ADD the zoning system:
   ```css
   :root {
     /* zone-resolved tokens (default = moss zone) */
     --zone-bg: #F2F2F0;
     --zone-surface: #FFFFFF;
     --zone-text: #111111;
     --zone-text-muted: #78716c;
     --zone-accent: #1A4D2E;          /* moss */
     --zone-accent-alt: #8b3a2f;      /* rust as secondary */
     --zone-hairline: rgba(17,17,17,0.12);
   }

   [data-zone="editorial"] {
     --zone-bg: #0a0908;
     --zone-surface: #252321;
     --zone-text: #f4f1ea;
     --zone-text-muted: #7a7366;
     --zone-accent: #b8924c;          /* brass */
     --zone-accent-alt: #8b3a2f;      /* rust */
     --zone-hairline: rgba(244,241,234,0.08);
     background-color: var(--zone-bg);
     color: var(--zone-text);
   }

   [data-zone="editorial-paper"] {
     --zone-bg: #f4f1ea;
     --zone-surface: #eae5d9;
     --zone-text: #0a0908;
     --zone-text-muted: #7a7366;
     --zone-accent: #8b3a2f;          /* rust dominates on paper */
     --zone-accent-alt: #b8924c;
     --zone-hairline: rgba(10,9,8,0.12);
     background-color: var(--zone-bg);
     color: var(--zone-text);
   }

   ::selection { background: #b8924c; color: #f4f1ea; }
   ```

5. In `index.css`, inside `@layer utilities`, ADD helpers that reference the zone variables:
   ```css
   @layer utilities {
     .zone-bg { background-color: var(--zone-bg); }
     .zone-surface { background-color: var(--zone-surface); }
     .zone-text { color: var(--zone-text); }
     .zone-text-muted { color: var(--zone-text-muted); }
     .zone-accent { color: var(--zone-accent); }
     .zone-accent-alt { color: var(--zone-accent-alt); }
     .zone-border { border-color: var(--zone-hairline); }
     .zone-hairline { background-color: var(--zone-hairline); }
     .text-balance { text-wrap: balance; }
   }
   ```

6. Update the Eyebrow component from Prompt 1: swap the hardcoded hex for `brass` tone to `text-brand-brass` and `bg-brand-brass`, and for `rust` to `text-brand-rust` and `bg-brand-rust`.

7. Add a "zone wrapper" convention: at the top of every editorial-zoned page container, a single attribute `data-zone="editorial"` or `data-zone="editorial-paper"` is set on the outer div. No other wiring required. Document this in a new file `components/hero/ZONE.md` with a one-page explanation of how the zoning cascade works.

8. Run `npm run build` and verify zero visual changes on existing pages (the zoning layer is declared, but no page is zoned yet).

Hard don'ts:
- Do NOT zone any page yet. Prompt 4 does that.
- Do NOT remove brand-moss; it must remain the CTA color across both zones. Moss buttons on `data-zone="editorial"` should still be moss-filled.
- Do NOT apply `zone-*` utilities broadly — they are for hero components and editorial article layouts only.
```

**Acceptance criteria.**
- Build passes, no visual changes.
- A scratch page wrapped in `<div data-zone="editorial">` shows ink background, paper text when you drop `<div className="zone-bg zone-text p-8">Test</div>` inside.
- `text-brand-brass`, `ease-out-expo`, `text-display-lg` are available as utilities.

---

# Prompt 3 — The six inner-page hero variants

**What it does / why.** Builds the six reusable hero components as a discriminated union under `components/hero/`. Every variant is zone-aware — it reads `--zone-*` CSS variables so the same component renders correctly on moss or editorial pages. Ledger pattern IS built (for future use) even though Prompt 4 doesn't deploy it.

```gemini
Implement Phase 3: six hero variants. Create all files even if Prompt 4 won't use every one — they're part of the kit.

Create folder `components/hero/` and the following files:

1. `types.ts` — shared types:
   ```ts
   export type HeroVariant = 'basic' | 'split' | 'folio' | 'ledger' | 'frontispiece' | 'archive' | 'directory';

   export interface BaseHeroProps {
     eyebrow?: string;
     title: React.ReactNode;
     blurb?: string;
     accentTone?: 'moss' | 'brass' | 'rust';    // default derives from zone
   }
   export interface BasicHeroProps extends BaseHeroProps {
     variant?: 'basic';
     tag?: string; subtitle?: string; description?: string;
   }
   export interface SplitHeroProps extends BaseHeroProps {
     variant: 'split';
     meta: Array<{ label: string; value: React.ReactNode }>;   // 2–4 entries, qualitative OK
   }
   export interface FolioHeroProps extends BaseHeroProps {
     variant: 'folio';
     number: string;               // e.g. "I.", "II."
     sideText?: string;
   }
   export interface LedgerHeroProps extends BaseHeroProps {
     variant: 'ledger';
     stats: Array<{ num: React.ReactNode; label: string }>;
     ctaLabel?: string; ctaHref?: string;
   }
   export interface FrontispieceHeroProps extends BaseHeroProps {
     variant: 'frontispiece';
     metaStrip?: string[];
     ornament?: string;                          // default "§"
   }
   export interface ArchiveHeroProps extends BaseHeroProps {
     variant: 'archive';
     items: Array<{ num: string; title: React.ReactNode; date: string; href: string }>;
     totalLabel?: string;
   }
   export interface DirectoryHeroProps extends BaseHeroProps {
     variant: 'directory';
     coordinates?: string;
     contacts: Array<{ label: string; value: string; href?: string }>;
     ghostWord?: string;                         // default "Engage."
   }
   export type PageHeroProps = BasicHeroProps | SplitHeroProps | FolioHeroProps | LedgerHeroProps | FrontispieceHeroProps | ArchiveHeroProps | DirectoryHeroProps;
   ```

2. `PageHero.tsx` — variant router:
   ```tsx
   export function PageHero(props: PageHeroProps) {
     switch (props.variant) {
       case 'split':        return <HeroSplit {...props} />;
       case 'folio':        return <HeroFolio {...props} />;
       case 'ledger':       return <HeroLedger {...props} />;
       case 'frontispiece': return <HeroFrontispiece {...props} />;
       case 'archive':      return <HeroArchive {...props} />;
       case 'directory':    return <HeroDirectory {...props} />;
       default:             return <HeroBasic {...props} />;
     }
   }
   ```
   Move the existing `components/PageHero.tsx` into `components/hero/HeroBasic.tsx` preserving its current look.

3. Sub-components — general rules that apply to all variants:
   - Use `font-heading` (Fraunces) for the title. `font-mono` for eyebrows. `font-serif italic` for `<em>` inside titles.
   - Colors: use `zone-*` utility classes or `var(--zone-*)`, NOT hardcoded brand-ink / brand-paper. This way the hero auto-adapts to its zone.
   - Accent tone defaults: moss zone → accent = moss; editorial zone → accent = brass. Allow override via `accentTone` prop.
   - Every hero is wrapped in a `<section>` with `aria-labelledby` pointing at the title's id.
   - Mobile breakpoint at `md:` stacks columns.
   - Respect `prefers-reduced-motion`.

4. `HeroSplit.tsx` — 2-column layout, title left, meta grid + blurb right. Vertical `zone-hairline` rule down the center. Four `<Crosshair />` in the corners. Meta grid is 2×2 (or 2×1 if only 2 entries). Each meta cell shows label in mono (`font-mono text-eyebrow uppercase tracking-[0.2em] zone-accent`) and value in Fraunces display (`font-heading text-[1.5rem] zone-text`). Value can contain `<em>` rendered italic Playfair.

5. `HeroFolio.tsx` — asymmetric 3-column. Left: massive italicized `{number}` in `font-serif italic` at `text-display-xl` color `zone-accent-alt`. Middle: eyebrow + title + blurb. Right: vertical side text in mono (`writing-mode: vertical-rl; transform: rotate(180deg)`). Bottom: horizontal rule with two circular dots at its ends in `zone-accent-alt`.

6. `HeroLedger.tsx` — Title row with eyebrow + title left and stats right. Stats have a `border-l border-zone-accent pl-4` left-brass rule. Bottom row: blurb left, CTA right. Background has 8 horizontal zone-hairline lines evenly spaced (use flex column with `justify-between` and 8 `<div className="h-px zone-hairline" />`). CTA has `border-y border-zone-accent zone-accent` text, and on hover fills with `zone-accent` and inverts text.

7. `HeroFrontispiece.tsx` — Centered, ceremonial. Two concentric circles (absolute, rounded-full border-zone-hairline sized 500–700 px). Ornament above title (default "§") in Playfair italic `zone-accent-alt`. Eyebrow, title, blurb, meta strip stacked center-aligned. Accent emphasis uses `accentTone` (defaults to rust here — override via prop). On editorial zone, background is `bg-brand-rust text-brand-paper` for this one variant specifically (frontispiece is always a rust feature page). The data-zone cascade still governs non-text elements.

8. `HeroArchive.tsx` — 2-column, narrative left + list right. Items grid: `60px 1fr auto`, with number (`font-mono text-xs zone-text-muted`), title (`font-heading text-lg` with italic accent), date (`font-mono text-xs zone-text-muted uppercase tracking-[0.15em]`). Hover: transform translateX(0.5rem), subtle moss-to-transparent gradient bg on moss zone, brass-to-transparent on editorial zone.

9. `HeroDirectory.tsx` — Top: title + blurb left, GPS coords right (mono, right-aligned). Bottom: 3 contact blocks in a grid. Giant italic ghost word ("Engage." default) at 35vw font-size, opacity 0.04, bottom-right, pointer-events-none. Ghost word color `zone-accent`.

10. Shared decorative primitives in `components/hero/`:
    - `Crosshair.tsx` — 24×24 absolute marker. Props: `position: 'tl' | 'tr' | 'bl' | 'br' | { top, right, bottom, left }`, `color?: string` (defaults to `var(--zone-accent)`), `size?: number`. Two crossing 1-px lines.
    - `GhostWord.tsx` — absolute massive italic Playfair word. Props: `children: string`, `sizeClass?: string` (default `text-display-xl`), `position`, `color?: string` (default `var(--zone-accent)` at opacity 0.04), `className?: string`.
    - `SectionSymbol.tsx` — one-liner, renders `§` in `font-serif italic mr-1` with optional color prop.

11. After creating the hero kit, update every page that imports `PageHero` so the import resolves correctly (the underlying file moved from `components/PageHero.tsx` to `components/hero/PageHero.tsx`). Consider adding a re-export at the old path during migration so Gemini can edit imports across pages in one pass. Actually DO add a barrel: `components/hero/index.ts` exports `PageHero` and all variants. Each page updates its import to `from '@/components/hero'` or the equivalent relative path.

12. Run `npm run build`. Every page that used PageHero must still render the `basic` variant with its original look — no visual regression anywhere. Report build output.

Hard don'ts:
- Do NOT apply any variant to any page yet. That is Prompt 4.
- Do NOT hardcode brand-ink or brand-paper in a hero component. Use `zone-*` utilities.
- Do NOT add Framer Motion in this prompt.
```

**Acceptance criteria.**
- All 7 hero files and 3 primitive files exist.
- Build passes.
- Every existing page still renders identically.
- A scratch test: `<div data-zone="editorial"><PageHero variant="folio" number="II." eyebrow="§ Test / 02" title={<>Hello <em>world</em></>} blurb="..." /></div>` renders the folio on ink background.

---

# Prompt 4 — Assign variants + zone each page

**What it does / why.** Applies the zones and hero variants per page. This is where the two-zone system becomes visible. **No invented stats** — only qualitative meta I specify below.

```gemini
Implement Phase 4: page-by-page hero assignment and zoning. Only edit the files listed. For each page, follow the exact content I give you. Do not invent numbers, clients, matters, percentages, or any other metric.

=== HOME page (`pages/Home.tsx` or similar) ===
Zone: Moss (default, no data-zone attribute needed).
Hero: keep existing (basic).
Title: confirm it uses one italic accent word via `<em>` (from Prompt 1 step 7).
If a stats block below the hero exists, REPLACE numeric stats with qualitative markers (no invented numbers):
- "§ Est. MMXXIII"
- "Mysuru · Karnataka"
- "ACA · Sole Proprietor"
- "§ Editorial Practice"
Each rendered with `font-mono text-eyebrow uppercase tracking-[0.2em] text-brand-stone`, spaced across a 4-column grid that stacks on mobile. If there is no stats block, do nothing here.

=== ABOUT page (`pages/About.tsx`) ===
Zone: Editorial. Add `data-zone="editorial"` to the outermost page container.
Hero: variant="folio"
- number: "I."
- eyebrow: "§ Principal / 01"
- title: `<>On the principal, <em>briefly</em>.</>`
- blurb: "Sagar H R practises as the sole proprietor of the firm. An Associate member of the Institute of Chartered Accountants of India, he is in his third year of practice. He reads every working paper and signs every certificate."
- sideText: "Mysuru · Est. MMXXIII"
- accentTone: "brass"
Below the hero, the existing About body sections inherit the editorial zone (ink background, paper text). Keep the moss accent on any CTA buttons (they stand out against ink).

=== SERVICES INDEX page (`pages/Services.tsx`) ===
Zone: Moss (default).
Hero: variant="split"
- eyebrow: "§ Practice / 02"
- title: `<>Four disciplines, one <em>practice</em>.</>`
- blurb: existing or: "A small practice across tax, audit, corporate, and advisory — each engagement led by the proprietor."
- meta: exactly these 4 entries (qualitative, no numbers):
  - { label: "Scope", value: "Tax · Audit · Corporate · Advisory" }
  - { label: "Engagement", value: "Retainer · Assignment" }
  - { label: "Principal", value: <>Sagar H R · <em>ACA</em></> }
  - { label: "Practice", value: "Mysuru · MMXXIII" }

=== SERVICE DETAIL page (`pages/ServiceDetailPage.tsx`, `/services/:slug`) ===
Zone: Moss (default).
Hero: variant="split".
Eyebrow: "§ Practice / 02 · {slug-uppercase}" (e.g. "§ Practice / 02 · GST").
Title: the service name with ONE italic accent word in `<em>`.
Blurb: existing service description.
Meta: a hardcoded map per slug (see below). These are qualitative descriptors only — no numbers.

Add a constant in `constants/services.ts` (or alongside existing service data) called SERVICE_HERO_META:
```ts
export const SERVICE_HERO_META: Record<string, Array<{ label: string; value: React.ReactNode }>> = {
  'gst': [
    { label: 'Discipline', value: 'Indirect Tax' },
    { label: 'Scope', value: 'Filing · Reconciliation · Notices' },
    { label: 'Forums', value: 'CGST · SGST · Appellate' },
    { label: 'Status', value: 'Active Practice' },
  ],
  'income-tax': [
    { label: 'Discipline', value: 'Direct Tax' },
    { label: 'Scope', value: 'ITR · Scrutiny · Rectification' },
    { label: 'Forums', value: 'AO · CIT(A) · NFAC' },
    { label: 'Status', value: 'Active Practice' },
  ],
  'company-law': [
    { label: 'Discipline', value: 'Corporate' },
    { label: 'Scope', value: 'Incorporation · ROC · Compliance' },
    { label: 'Forums', value: 'MCA · NCLT' },
    { label: 'Status', value: 'Active Practice' },
  ],
  'litigation': [
    { label: 'Discipline', value: 'Tax Litigation' },
    { label: 'Scope', value: 'Appeals · Hearings · Representation' },
    { label: 'Forums', value: 'CIT(A) · NFAC · GSTAT' },
    { label: 'Status', value: 'Selective Engagement' },
  ],
  'advisory': [
    { label: 'Discipline', value: 'Tax Advisory' },
    { label: 'Scope', value: 'Structuring · Opinions · Transaction' },
    { label: 'Engagement', value: 'Pre-filing · Planning' },
    { label: 'Status', value: 'Ongoing Retainer' },
  ],
  'audit': [
    { label: 'Discipline', value: 'Assurance' },
    { label: 'Scope', value: 'Statutory · Tax Audit · Internal' },
    { label: 'Forums', value: 'Company · Firm · Proprietor' },
    { label: 'Status', value: 'Assignment-based' },
  ],
  'bookkeeping': [
    { label: 'Discipline', value: 'Accounting' },
    { label: 'Scope', value: 'Books · Reconciliation · MIS' },
    { label: 'Systems', value: 'Tally · Zoho · Bespoke' },
    { label: 'Status', value: 'Monthly Retainer' },
  ],
  'payroll': [
    { label: 'Discipline', value: 'Compliance' },
    { label: 'Scope', value: 'Salary · PF / ESI · TDS' },
    { label: 'Cadence', value: 'Monthly · Quarterly · Annual' },
    { label: 'Status', value: 'Ongoing' },
  ],
};
```
ServiceDetailPage should look up `SERVICE_HERO_META[slug]` and pass it as `meta` to the Split hero. If a slug has no entry, render without meta (the Split component should handle empty meta gracefully — confirm in Prompt 3).

=== INSIGHTS INDEX page (`pages/InsightsPage.tsx`, `/insights`) ===
Zone: Moss (default).
Hero: variant="archive"
- eyebrow: "§ Resources / 03"
- title: `<>Notes from <em>practice</em>.</>`
- blurb: existing or: "A working library of the firm's writing on tax, audit, and corporate law. Updated when something genuinely useful crosses the desk — never on a content schedule."
- items: map the first 4 articles from insights data. If fewer than 4 exist, pass what you have. Each item: { num: zero-padded index, title: article title with italic accent on the key noun (best-effort), date: formatted "MMM · YY" via a new `utils/formatArchiveDate.ts` helper, href: `/insights/${slug}` }.
- totalLabel: `${count} in Archive` where count is the real article count. If only 1 article exists, still render it.

=== INSIGHT DETAIL page (`pages/InsightDetailPage.tsx`, `/insights/:slug`) ===
Zone: Editorial-paper. Add `data-zone="editorial-paper"` to the outermost article container (so the article reads on aged paper with ink text — classic editorial reading surface).
Hero: variant="basic" OR a small custom article header — use whichever fits your existing layout. Title in Fraunces, one italic accent word, byline in mono. The article body should use Plus Jakarta Sans body text and inherit zone-paper colors.

=== CONTACT page (`pages/Contact.tsx`) ===
Zone: Editorial. Add `data-zone="editorial"` to the outermost page container.
Hero: variant="directory"
- eyebrow: "§ Contact / 06 · Direct Lines"
- title: `<>Begin a <em>conversation</em>.</>`
- coordinates: "12.3004° N · 76.6518° E"
- contacts: exactly these 3 entries (pulling values from `config/contact.ts`):
  - { label: "By Letter", value: <contact email from config>, href: `mailto:${email}` }
  - { label: "By Voice", value: <contact phone from config>, href: `tel:${phone}` }
  - { label: "By Visit", value: <address from config, rendered with a <br /> between lines> }
- ghostWord: "Engage."
The existing contact form below the hero remains; it inherits editorial zone colors (use zone-* utilities for any form labels or helper text that currently use brand-stone).

=== FAQS, RESOURCES, CAREERS, LEGAL pages ===
Zone: Moss (default, no data-zone).
Hero: keep variant="basic" for now. No changes to these pages beyond what Prompts 1 & 2 already caused (heading font swap, selection color).

=== Rules ===
- Before editing, for each page, quote the existing PageHero call (if any) in your response.
- Preserve every other section of every page unchanged.
- Keep SEO component calls intact.
- Keep breadcrumbs intact.
- DO NOT invent any statistic, client count, matter count, win rate, or turnaround time. The meta is qualitative only.
- The moss CTA color applies across BOTH zones — on editorial pages, the "Engage" button and any form submit button stay moss-filled. They will stand out against ink.

After edits, run `npm run build` and navigate to every edited route in dev. For each route, verify the correct zone and hero are applied. Report the final state.
```

**Acceptance criteria.**
- `/about` and `/contact` load with ink background, paper text, Fraunces headings, gold eyebrows.
- `/insights/:slug` articles load with aged-paper background and ink text.
- `/services/:slug` loads with moss zone, Split hero, qualitative meta cells (no numbers).
- Moss CTAs appear on both zones and remain legible.
- No hero displays fabricated stats anywhere.

---

# Prompt 5 — Polish components (BigCTA, Grain, GhostText extraction, SectionSymbol)

**What it does / why.** Small decorative and interactive pieces. BigCTA becomes the primary site-wide CTA style. Grain adds printed-matter texture universally. Ghost text and crosshairs are extracted from the hero variants for reuse.

```gemini
Implement Phase 5: polish components. Additive. Create under `components/ui/`.

1. `Grain.tsx` — Fixed full-viewport SVG noise overlay. Mount ONCE inside `App.tsx` at the top of the layout tree. Renders nothing on `prefers-reduced-motion` ONLY if you want (grain doesn't animate, so this is optional; conventional to leave it). Props: `opacity?: number` (default 0.05), `blendMode?: 'overlay' | 'multiply' | 'soft-light'` (default 'overlay').

   Implementation:
   ```tsx
   export function Grain({ opacity = 0.05, blendMode = 'overlay' }: GrainProps) {
     const svg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>`;
     return (
       <div
         aria-hidden
         className="fixed inset-0 pointer-events-none z-[100]"
         style={{ backgroundImage: `url("${svg}")`, mixBlendMode: blendMode, opacity }}
       />
     );
   }
   ```

   Mount in App.tsx at the top level so it layers above routes.

2. `BigCTA.tsx` — Signature rounded inverse-fill button. Props:
   ```ts
   interface BigCTAProps {
     to?: string;                                         // react-router Link
     href?: string;                                       // external
     tone?: 'moss' | 'ink' | 'paper' | 'brass';           // surface-aware tone
     size?: 'md' | 'lg';                                  // default 'lg'
     children: React.ReactNode;
     ariaLabel?: string;
     icon?: React.ReactNode;                              // default <ArrowRight />
   }
   ```
   Tone map:
   - moss: border-brand-moss text-brand-moss; fill pseudo bg-brand-moss; label-on-fill text-brand-paper.
   - ink: border-brand-ink text-brand-ink; fill bg-brand-ink; label-on-fill text-brand-paper.
   - paper: border-brand-paper text-brand-paper; fill bg-brand-paper; label-on-fill text-brand-ink. (For use on editorial zone pages.)
   - brass: border-brand-brass text-brand-brass; fill bg-brand-brass; label-on-fill text-brand-ink.

   Structure:
   ```tsx
   <LinkOrA className="group relative inline-flex items-center gap-3 rounded-full overflow-hidden px-10 py-5 border font-serif italic text-[1.15rem] transition-colors duration-500 ease-out-expo {toneClasses}">
     <span aria-hidden className="absolute inset-0 scale-0 rounded-full transition-transform duration-500 ease-out-expo group-hover:scale-100 {fillBgClass}" />
     <span className="relative z-10 transition-colors duration-500 ease-out-expo group-hover:{labelOnFillClass}">{children}</span>
     <span className="relative z-10 transition-transform duration-500 ease-out-expo group-hover:translate-x-1">{icon ?? <ArrowRight size={20} strokeWidth={1.5} />}</span>
   </LinkOrA>
   ```
   size="md" uses `px-6 py-3 text-base`; size="lg" uses the default shown.

3. Extract `GhostWord.tsx` to `components/ui/GhostWord.tsx` (if still inside `components/hero/`) and re-export from the hero module. Same API as Prompt 3 step 10.

4. Extract `Crosshair.tsx` similarly to `components/ui/Crosshair.tsx`.

5. `SectionSymbol.tsx` — if not already created in Prompt 3. Render `§` in Playfair italic with small right margin.

6. Demonstrate BigCTA adoption — replace exactly THREE CTAs in the codebase:
   - Home page primary CTA → `<BigCTA to="/contact" tone="moss" size="lg">Engage the practice</BigCTA>`
   - Services page closing CTA (if exists) → `<BigCTA to="/contact" tone="moss" size="lg">Engage on a matter</BigCTA>`
   - Contact page form submit equivalent or "Write to proprietor" button → `<BigCTA tone="moss" size="lg">Send</BigCTA>` (keep form onSubmit behavior intact — BigCTA should accept a `type="submit"` variant OR wrap it in a button shell; your choice, but don't break form submission).

   DO NOT replace every button globally. BigCTA is reserved for primary page CTAs.

7. Mount `<Grain opacity={0.05} />` inside App.tsx as a top-level sibling of the route tree. Verify it renders on every page.

8. Run `npm run build`. Report any warnings.

Hard don'ts:
- Do NOT install Framer Motion here (Prompt 6 decides).
- Do NOT globally replace every button.
- Do NOT set grain opacity above 0.08.
```

**Acceptance criteria.**
- A subtle film grain is visible on every page.
- The three demonstrated CTAs use the rounded inverse-fill style.
- No other buttons have changed.
- Build passes.

---

# Prompt 6 — Motion orchestration (Framer Motion, scoped)

**What it does / why.** Optional but high-impact. Adds crisp route transitions and word-by-word hero title reveals. Bundle cost ~25 kB gzipped. Skip if you want to keep bundle lean.

```gemini
Implement Phase 6: scoped motion. Install and use Framer Motion only for two things: route transitions and hero title word reveals. Every other animation stays as-is.

Tasks:

1. `npm install framer-motion@^11`. Commit package.json and lockfile.

2. Create `components/motion/PageTransition.tsx`:
   ```tsx
   import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
   import { useLocation } from 'react-router-dom';

   export function PageTransition({ children }: { children: React.ReactNode }) {
     const location = useLocation();
     const reduced = useReducedMotion();
     const duration = reduced ? 0 : 0.45;
     return (
       <LazyMotion features={domAnimation}>
         <AnimatePresence mode="wait" initial={false}>
           <m.main
             key={location.pathname}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration, ease: [0.23, 1, 0.32, 1] }}
           >
             {children}
           </m.main>
         </AnimatePresence>
       </LazyMotion>
     );
   }
   ```

3. In `App.tsx`, wrap only the `<Routes>` / `<Outlet />` region with `<PageTransition>`. Keep Navbar, Footer, Grain, Preloader, and CustomCursor OUTSIDE the transition — they must not fade on navigation.

4. Create `components/motion/WordReveal.tsx`. Signature:
   ```ts
   interface WordRevealProps {
     children: React.ReactNode;                  // plain string or React with <em>
     delay?: number;                             // base delay, default 0.15
     stagger?: number;                           // default 0.12
     className?: string;
   }
   ```
   Behavior:
   - If `children` is a string, split on whitespace, map each word to a `m.span` animated `{opacity, y}` from `{0, '100%'}` to `{1, 0}` with stagger.
   - If children includes React elements (e.g. `<em>`), walk the React tree: strings are split to words; element nodes (like `<em>`) are treated as atomic word units so their italic styling is preserved.
   - Ease `[0.23, 1, 0.32, 1]`, duration 1.0s per word.
   - Each word span is `inline-block` with `overflow: hidden` on its parent line to clip during slide-in.
   - Respect `useReducedMotion`: render children as-is without animation if reduced.

5. In each of the six hero variant components (HeroSplit, HeroFolio, HeroLedger, HeroFrontispiece, HeroArchive, HeroDirectory, plus HeroBasic), swap the static title rendering for `<WordReveal>{title}</WordReveal>`. If title is already a React node with `<em>`, the WordReveal implementation from step 4 handles it.

6. Do NOT convert any other animation. CustomCursor, Parallax, Marquee, Reveal stay vanilla.

7. Run `npm run build` and report bundle-size delta. If delta exceeds 40 kB gzipped, pause and ask me before proceeding.

Hard don'ts:
- Do NOT introduce framer-motion into components outside the two files specified.
- Do NOT add `will-change: transform` globally.
- Do NOT animate route transitions longer than 500 ms.
```

**Acceptance criteria.**
- Navigating between pages shows a clean 450 ms fade transition (or instant under reduced-motion).
- Every hero title animates word-by-word on mount (~1 s total).
- Bundle delta ≤ 40 kB gzipped.
- All other animations unchanged.

---

# Prompt 7 — Tone, voice, and micro-copy upgrades

**What it does / why.** The final 10 %. Applies § symbols, Roman numerals (**MMXXIII** = 2023, not MMXIII), archaic labels, italic accent audit, and ACA credential placement.

```gemini
Implement Phase 7: tone and micro-copy. Surgical edits only. Do not change layouts, components, or data.

Tasks:

1. Create `utils/toRomanNumeral.ts`:
   ```ts
   export function toRomanNumeral(num: number): string {
     if (num < 1 || num > 3999) return String(num);
     const map: Array<[number, string]> = [
       [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
       [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
       [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
     ];
     let out = '';
     for (const [val, sym] of map) {
       while (num >= val) { out += sym; num -= val; }
     }
     return out;
   }
   ```
   Verify with tests: 2023 → "MMXXIII", 2026 → "MMXXVI", 1 → "I", 3 → "III".

2. Footer edits (`components/Footer.tsx`):
   - Copyright line: `© MMXXIII–{toRomanNumeral(new Date().getFullYear())} · Sagar H R & Co. · Chartered Accountants`. If current year is 2023, collapse to `© MMXXIII · Sagar H R & Co. · Chartered Accountants`.
   - Add a small second line in mono: `§ Mysuru · ACA Practice · Sole Proprietor`.

3. Eyebrow convention audit:
   - Grep for every `<Eyebrow>` usage. Prepend `§ ` (with the `§` wrapped in a Playfair italic span as SectionSymbol) to any eyebrow that doesn't already start with it.

4. Italic-accent audit: for each of these pages, verify the top H1 has exactly one emphatic word in `<em>`. If missing, add one; if awkward, leave alone and add a `{/* no natural accent */}` comment:
   - Home, About (from Prompt 4), Services (from Prompt 4), ServiceDetail (from Prompt 4), InsightsPage (from Prompt 4), Contact (from Prompt 4), FAQs, Resources, Careers.

5. About page enrichment (only if principal-bio section exists):
   - Ensure the credential line reads: `Sagar H R · ACA · Mysuru`. Do NOT write "FCA" or "Fellow."
   - If a bio paragraph mentions experience, phrase as "in his third year of practice" or "since MMXXIII."

6. Contact page — verify the Directory hero (from Prompt 4) uses:
   - Coordinates: `12.3004° N · 76.6518° E`
   - Labels: "By Letter", "By Voice", "By Visit"
   - Location line below coordinates: "Mysuru · Karnataka · Indian Standard Time"

7. Insights archive date formatting — use `utils/formatArchiveDate.ts`:
   ```ts
   export function formatArchiveDate(input: string | Date): string {
     const d = typeof input === 'string' ? new Date(input) : input;
     const month = d.toLocaleString('en-GB', { month: 'short' });   // Jan, Feb...
     const year = String(d.getFullYear()).slice(2);                 // "26"
     return `${month} · ${year}`;
   }
   ```
   Apply to HeroArchive dates.

8. Navigation: verify nav items are auto-numbered (01, 02, 03...) via CSS counter. If they aren't, add:
   ```css
   .nav-links { counter-reset: nav-counter; }
   .nav-links a::before {
     content: counter(nav-counter, decimal-leading-zero);
     counter-increment: nav-counter;
     /* ... position as small label above link ... */
   }
   ```

9. Home hero (if stats row exists): confirm it shows the four qualitative markers from Prompt 4 (`§ Est. MMXXIII`, `Mysuru · Karnataka`, `ACA · Sole Proprietor`, `§ Editorial Practice`). If not, fix it.

10. After all edits, do a final walk-through of every top-level route and produce a short report:
    - /  → title, eyebrow, italic accent word, zone
    - /about
    - /services
    - /services/gst (representative detail)
    - /insights
    - /contact
    - /faqs, /resources, /careers (briefly)
    Report anything that still feels off.

Hard don'ts:
- Do NOT write "FCA", "Fellow", or any numeric claim about clients, matters, wins, or revenue.
- Do NOT restructure any component.
- Do NOT edit calculators, resource tools, FAQ data, or form logic.
```

**Acceptance criteria.**
- Footer shows MMXXIII (not MMXIII).
- Every eyebrow begins with `§ `.
- Every major heading has an italic accent word (or an explanatory comment).
- Dates in archive render as `Apr · 26`.
- "ACA" is visible on the About page and footer. "FCA" appears nowhere.
- Coordinates on /contact match `12.3004° N · 76.6518° E`.

---

# Appendix A — Priority and skippability

| Prompt | Impact | Risk | Bundle cost | Skip-able? |
|--------|--------|------|-------------|-----------|
| 0. Preamble | Safety | — | 0 | No |
| 1. Typography swap (Fraunces) | Very high | Low | ~30 kB fonts | No — foundation |
| 2. Tokens + zoning | Medium | Low | 0 | No — gates Prompt 4 |
| 3. Six hero variants | Very high | Medium | ~8 kB CSS | No — this IS the system |
| 4. Page assignments | Very high | Low | 0 | No — makes 3 visible |
| 5. Polish | High | Low | ~3 kB | Optional, cheap |
| 6. Motion | Medium | Medium | ~25 kB | **Yes, skippable** |
| 7. Tone + copy | Medium | Low | 0 | Optional, compounds |

Minimum viable: 0 → 1 → 2 → 3 → 4. That's ~70 % of the effect.

---

# Appendix B — Rollback cheatsheet

Each prompt is reversible:

- **Prompt 1** — revert `font-heading` to `['Outfit', ...]` in `tailwind.config.ts`. Remove the JetBrains Mono line from the Google Fonts URL. Done.
- **Prompt 2** — remove the new tokens and the `[data-zone]` CSS block from `index.css`. Other prompts use these, so roll back Prompts 3–7 first.
- **Prompt 3** — delete `components/hero/`. Restore `components/PageHero.tsx`.
- **Prompt 4** — remove `data-zone` attributes from the three zoned pages. Revert page hero imports to `variant="basic"`.
- **Prompt 5** — unmount `<Grain />` from App.tsx. Replace BigCTA with the previous button.
- **Prompt 6** — `npm uninstall framer-motion`. Delete the two `components/motion/` files. Unwrap PageTransition. Restore static title rendering in hero variants.
- **Prompt 7** — revert Footer copyright; remove § prefixes; revert italic accents. None of these are structural.

---

# Appendix C — Troubleshooting prompts

**"You are editing outside scope"**
```gemini
Stop. List the files you have modified in the current task. Revert anything outside the scope I specified. Re-read the Hard don'ts list from the original prompt before proceeding.
```

**"Build is broken — fix only the new code"**
```gemini
Run `npm run build` and paste the full error output. Identify the smallest change in newly-added files that resolves the error. Do not alter existing components outside the change scope.
```

**"You invented a statistic"**
```gemini
You wrote a numeric claim that is not in my Firm Reality list. Remove the claim and replace it with qualitative meta or omit it. Firm Reality facts are: founded 2023 (MMXXIII), principal Sagar H R ACA, 3 years in practice, Mysuru 12.3004°N 76.6518°E. No other numbers may be asserted on the site.
```

**"You modified a brand token"**
```gemini
You have modified or removed an existing brand token in tailwind.config.ts. Revert: brand-moss, brand-bg, brand-dark, brand-mossLight, brand-border, brand-stone, and brand-surface must not change. Only additions to the `colors` object are allowed.
```

---

# Appendix D — What this integration deliberately does NOT do

- Does not fabricate a firm track record. 3 years of practice is honestly surfaced.
- Does not remove moss — moss becomes the universal action color.
- Does not require writing Instrument Serif (Playfair Display italic plays that role).
- Does not change routing, data flows, or existing calculator logic.
- Does not ship a dark-mode toggle or print stylesheet.
- Does not convert the site to a monorepo or change the build tool.

If you later want the full editorial rebrand (moss phased out entirely, ink-dominant site, rust testimonial zone throughout), that's a separate track — not a design integration, a rebrand.

---

*Document version II · MMXXIII · Prepared for Sagar H R & Co. v2 · Paste Prompts 0 → 7 in order.*
