# Micro-animation audit — Sagar H R & Co. website

**Audit date:** 2026-05-21 · **Site context:** FY 2025-26 / AY 2026-27
**Stack:** React 19 + TypeScript + Vite + Tailwind, React Router 7, Netlify
**Scope:** Every animated surface across all routes — scroll reveals, hover states,
entrance animations, loops, the cursor, loaders, and the two interactive set-pieces
(`ChaosToOrder`, `HorizontalScroll`).
**Method:** Static review of all `components/*`, `pages/*`, `index.css`,
`tailwind.config.ts` and the hero / home / Resources sub-trees; usage-frequency
counts across the source tree; verification of every claim against source.
**Style brief (from CA Sagar):** _distinctive and polished, balanced — modern and
current, yet professional and unique._ Every recommendation below is measured
against that brief.

---

## 1. Executive summary

The website has a **genuinely strong motion foundation** — the reduced-motion
handling is better than most production sites, the two interactive set-pieces are
well-engineered, and the hover vocabulary on cards is consistent. The problems are
not "bad animation"; they are **distribution, consistency, and housekeeping**.

Three headline findings:

1. **The site moves at two speeds.** The home page is animation-rich — 14 scroll
   reveals, a live star-field canvas, a drag-to-compare demo, a scroll-driven
   services rail. Every other route is nearly static: the About page's three core
   sections (`HowWeWork`, `Values`, `Principal`) have **no entrance animation at
   all**, and Services / Insights / ServiceDetail / Careers / Resources rely on a
   single mount-time fade or nothing. A visitor who lands on the home page and
   then clicks into a service feels like they have moved to a different, cheaper
   website. This is the single biggest issue, and it is an _underuse_ problem.

2. **Dead motion code is shipping.** Four animation components and two Tailwind
   tokens are defined, exported, and never used — roughly 450 lines of
   unreferenced code, plus a no-op wrapper. None of it harms users, but it
   inflates the bundle surface, confuses future edits, and three of the four are
   genuinely good ideas that should either be _used_ or _removed_.

3. **A handful of tuning issues.** Two slightly different "expo-out" easing curves
   are used interchangeably; `transition-all` is applied 85 times where a specific
   property would be cheaper and safer; the inner-page hero headline runs **two
   stacked entrance animations** on the same text; and one component
   (`WhatsAppFloat`) has a hover scale that silently never animates.

Nothing here requires a redesign. The fix is to **delete the dead weight, tune the
system into one coherent set of tokens, and then spend the reclaimed consistency
budget extending the home page's motion discipline across the rest of the site.**

**Verdict at a glance**

| Area                                 | State                  | Direction                           |
| ------------------------------------ | ---------------------- | ----------------------------------- |
| Reduced-motion accessibility         | Excellent              | Keep — it is a model implementation |
| Home page motion                     | Rich, well-judged      | Trim slightly, keep the character   |
| Interactive set-pieces (Chaos, rail) | Strong                 | Keep                                |
| Inner-page motion                    | Sparse / absent        | **Add** — the main opportunity      |
| Easing & duration tokens             | Drifting               | **Modify** — consolidate            |
| Dead animation code                  | 4 components, 2 tokens | **Delete**                          |
| Custom cursor                        | Polarising             | Judgement call — see MA-12          |

---

## 2. The motion system today

### 2.1 What is already good — keep it

- **Reduced-motion is handled twice, correctly.** `index.css` (≈ lines 494–509)
  carries a global `@media (prefers-reduced-motion: reduce)` block that neutralises
  every CSS animation and transition, and the `useReducedMotion()` hook covers
  every JS-driven animation (`Reveal`, `Parallax`, `CustomCursor`, `StarField`,
  `MagneticButton`, `useCountUp`, `Marquee`, `HorizontalScroll`, `ChaosToOrder`).
  This is belt-and-braces and should be treated as a non-negotiable invariant for
  anything added later.
- **The `Reveal` component is well-built** — `IntersectionObserver` with a 1.5 s
  safety timeout so content can never be stranded invisible, `willChange` cleared
  on `transitionend`, a `reveal-mask` clip variant, and a `WordReveal` per-word
  variant.
- **The two set-pieces are engineered, not decorative.** `HorizontalScroll` writes
  transforms straight to the DOM per frame instead of re-rendering, and
  `ChaosToOrder` registers `--divider` as an `@property` so it can interpolate.
  Both have keyboard paths and ARIA. Leave them alone.
- **The card hover vocabulary is consistent** — lift + border-tint + a thin
  gradient bar growing from `w-0` to `w-full`. A second motif, an arrow icon
  rotating on hover, _recurs but is not yet uniform_: Home's insight and service
  cards rotate the arrow `-45°` → `0°`, while `ServiceBento` instead rotates the
  whole icon button `+45°`. That recurring-arrow idea is a signature in embryo;
  §5 recommends settling on one form and making it _the_ signature.

### 2.2 Animation tokens in use

| Token                  | Definition                                  | Used?                      |
| ---------------------- | ------------------------------------------- | -------------------------- |
| `animate-fade-in-up`   | `fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1)`  | Yes — 60×                  |
| `animate-pulse`        | Tailwind default                            | Yes — 6×                   |
| `animate-spin`         | Tailwind default                            | Yes — 3× (loaders)         |
| `animate-marquee`      | `marquee 25s linear infinite`               | Yes — via `Marquee`        |
| `animate-scale-in`     | `scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)`   | Yes — 1×                   |
| `animate-expand-width` | `expandWidth 1s cubic-bezier(0.16,1,0.3,1)` | Yes — 1× (Preloader)       |
| `animate-bounce-x`     | `bounce-x 1s infinite` (index.css)          | Yes — 1× (rail swipe hint) |
| `chaos-drift`          | `chaos-drift 9s ease-in-out infinite`       | Yes — `ChaosToOrder`       |
| `animate-blob`         | `blob 7s infinite`                          | **No — dead token**        |
| `animate-spin-slow`    | `spin 12s linear infinite`                  | **No — dead token**        |

### 2.3 Easing & duration — the drift

- **Two near-identical easing curves coexist.** `cubic-bezier(0.16, 1, 0.3, 1)` is
  the dominant curve (`Reveal`, the `fadeInUp`/`scaleIn`/`expandWidth` keyframes,
  `MagneticButton`, `Navbar`, `Toast`, the FAQ panel, the navbar roll-text). But
  the Tailwind `out-expo` token is `cubic-bezier(0.23, 1, 0.32, 1)` and is used by
  `BigCTA`, `ServiceBento`, and `PageHero.css`. A third token, `out-quart`, is
  defined and effectively unused. Visitors will not consciously see the
  difference, but it means there is no single "house" curve to design against.
- **Durations are roughly a three-step scale already** — `duration-300` (60×),
  `duration-500` (37×), `duration-700` (13×), with a thin tail of `200`/`150`/
  `100`. This is _close_ to a usable scale; it just is not named or enforced.
- **`transition-all` is used 85 times** versus `transition-colors` 93× and
  `transition-transform` 31×. `transition-all` animates every property that
  changes — including ones that should snap — and is a long-standing performance
  and predictability smell. Most of the 85 are colour-and-shadow hovers that want
  `transition-[colors,box-shadow,transform]` or simply `transition-colors`.

---

## 3. Findings

Format follows the firm's existing audit docs: each item has **Where**, the
**Observation**, and a **Recommendation** with concrete _what_ and _how_. Findings
are grouped A (cut), B (modify), C (add). Priorities: **P1** ship this iteration,
**P2** soon, **P3** nice-to-have.

### A — Cut: dead code and overuse

---

**MA-01 — Remove four unused animation components · P1**

**Where:** `components/MagneticButton.tsx`, `components/Parallax.tsx`,
`components/ScrollyTelling.tsx`, `components/ProcessScroll.tsx`; barrel exports in
`components/index.ts`.

**Observation:** All four are exported from the barrel and imported by **nothing**
in `pages/`, `components/`, or `App.tsx` (verified by full-tree grep):

- `MagneticButton.tsx` (~95 lines) — a cursor-following button with a liquid fill.
- `Parallax.tsx` (~55 lines) — a `requestAnimationFrame` scroll-parallax wrapper.
- `ScrollyTelling.tsx` (~300 lines) — a pinned scroll-narrative section.
- `ProcessScroll.tsx` — a one-line file: _"This file is deprecated and
  intentionally left empty."_

That is ~450 lines of motion code that ships in the dependency graph, has to be
kept compiling against the current React 19 toolchain, and misleads anyone reading
the folder into thinking these effects are live.

**Recommendation:** Delete `ProcessScroll.tsx` outright. For the other three,
decide per component — _do not just leave them_:

- **`MagneticButton`** — this is the single most distinctive button in the
  codebase and it is the one button **not** on screen anywhere. Either promote it
  (see MA-13) or delete it. A magnetic effect that no one ships is wasted craft.
- **`Parallax`** — delete unless MA-14 (a single hero parallax accent) is adopted;
  parallax-everything is dated, one restrained use is not.
- **`ScrollyTelling`** — delete. A pinned scrollytelling section is a heavy,
  trend-prone pattern; the home page already has two scroll set-pieces and does
  not need a third. Keep it in git history if it may return.

Then drop the corresponding lines from `components/index.ts`.

---

**MA-02 — Remove the no-op `SmoothScroll` wrapper · P2**

**Where:** `components/SmoothScroll.tsx`, exported from `components/index.ts`.

**Observation:** The file is now a pass-through fragment — its own comment says the
inertia-scrolling logic was removed "to favour native browser scrolling". It is
referenced **only** by the barrel export; nothing renders it. It is dead.

**Recommendation:** Delete the file and its barrel export. If a future iteration
wants smooth scrolling, reach for CSS `scroll-behavior` or a vetted library at
that point — a permanently-empty component is just a trap. (Native scrolling is
the correct call for a professional site; JS inertia scroll fights accessibility
tooling and is itself a fading trend.)

---

**MA-03 — Remove the two dead Tailwind animation tokens · P2**

**Where:** `tailwind.config.ts` — `animation.blob`, `animation['spin-slow']`, and
the `blob` entry in `keyframes`. Also the stale `.animate-blob` selector inside the
`prefers-reduced-motion` block in `index.css`.

**Observation:** `animate-blob` and `animate-spin-slow` are defined but used
nowhere in the source tree. The reduced-motion CSS still lists `.animate-blob`,
guarding a class that cannot appear.

**Recommendation:** Delete `blob` (animation + keyframe) and `spin-slow` from the
Tailwind config, and drop `.animate-blob` from the `index.css` reduced-motion
selector list. Pure housekeeping; keeps the token set honest so §5's consolidated
scale is the whole story.

---

**MA-04 — Inner-page hero headline runs two stacked entrance animations · P1**

**Where:** `components/hero/HeroBasic.tsx`, `HeroSplit.tsx`, and the same pattern
in `HeroFolio`, `HeroLedger`, `HeroFrontispiece`, `HeroArchive`, `HeroDirectory`.

**Observation:** The `<h1>` (or `AccentTitle`) wrapper carries
`animate-fade-in-up` — a mount-time CSS keyframe that translates the _whole block_
up 20 px while fading in — **and** it contains `<WordReveal>`, which independently
staggers each _word_ up from `translateY(40%)`. So on every inner page the title
plays a block-level fade-up and a per-word roll-up simultaneously. The two motions
fight: the block is still travelling while the words are also travelling, which
reads as slightly soft/wobbly rather than crisp.

**Recommendation:** Pick **one** entrance per headline.

- _Preferred (distinctive):_ keep `WordReveal` for the per-word roll, and remove
  `animate-fade-in-up` from the title element only (leave it on the eyebrow and
  blurb). The word-roll is the more characterful gesture and is enough on its own.
- _Alternative (simplest):_ drop `WordReveal`, keep `animate-fade-in-up`, and
  switch the title to `Reveal variant="reveal-mask"` for a single clean clip-up.

Either way the eyebrow → title → blurb → meta stagger via `animationDelay`
(`0.1s` / `0.2s` / `0.3s`) stays — that cascade is good and should remain.

---

**MA-05 — `animate-fade-in-up` on below-the-fold content fires unseen · P2**

**Where:** `pages/Insights.tsx` (filter bar, ~line 190); `pages/InsightDetail.tsx`
related-article cards (~line 559); the Resources tab panels
(`pages/Resources/*` — `GSTCalculator`, `CIICalculator`, `ComplianceCalendar`,
`TDSRateChart`, etc., each opens with `animate-fade-in-up`).

**Observation:** `animate-fade-in-up` is a **mount-time** CSS animation — it runs
the instant the element is in the DOM, regardless of scroll position. Two failure
modes follow:

1. _Wasted entrance:_ on a long page the related-article cards animate while still
   far below the fold; by the time the visitor scrolls down, the animation is long
   finished. The polish is paid for and never seen.
2. _Heavy tab switches:_ every Resources calculator panel fades the **entire
   panel** up on mount, so each tab click re-plays a full-panel animation. On a
   tool the user is actively switching between, that reads as lag, not polish.

**Recommendation:**

- For below-the-fold content (Insights, InsightDetail related cards): replace
  `animate-fade-in-up` with the scroll-triggered `Reveal` component so the
  entrance plays _when seen_ — and add a stagger (MA-08).
- For Resources tab panels: drop the panel-level `animate-fade-in-up` entirely.
  A tab switch should feel instant. If a transition is wanted, animate only the
  _result_ of a calculation (the codebase already does this well —
  `TaxCalculator/ResultsDisplay.tsx` uses `animate-scale-in` on the result, which
  is the right scope).

---

**MA-06 — Replace `transition-all` with property-specific transitions · P2**

**Where:** 85 occurrences across `pages/` and `components/` — e.g.
`ServiceBento.tsx`, `IndustrySpotlight.tsx`, `Navbar.tsx`, `Toast.tsx`,
`ui/Button.tsx`, the Home service cards.

**Observation:** `transition-all` transitions every animatable property. When a
hover state also nudges layout-adjacent properties, the browser animates things
that should be instant, and it makes intent unreadable in the markup. It is the
classic "works, but sloppy" pattern.

**Recommendation:** Mechanical pass — replace `transition-all` with the explicit
set each element actually changes. Most card hovers want
`transition-[transform,box-shadow,border-color,colors]`; most buttons (e.g.
`ui/Button.tsx`, whose hover only changes background) want `transition-colors`.
This is low-risk and pairs naturally with the duration consolidation in §5.

---

**MA-07 — Two infinite loops on the `ChaosToOrder` draggable handle · P3**

**Where:** `components/home/ChaosToOrder.tsx` — the `chaos-drift` divider
animation, plus the "Drag ↔" affordance pill which carries `animate-pulse`.

**Observation:** Before first interaction, the divider drifts on a 9 s infinite
sine **and** the hint pill pulses opacity infinitely. Two simultaneous infinite
animations to communicate a single message ("this is draggable"). The drift alone
already does the job; `animate-pulse` is Tailwind's generic opacity throb and
reads as a bit busy on an otherwise crafted component.

**Recommendation:** Keep `chaos-drift` (it is the better, subtler cue). Drop
`animate-pulse` from the "Drag ↔" pill — let the pill simply sit there. If a
second cue is still wanted, a slow one-time fade-in of the pill ~600 ms after the
section enters view is more elegant than an endless pulse. Low priority; the
component is otherwise excellent.

### B — Modify: re-tune what already exists

---

**MA-08 — Stagger card grids the way the home page already does · P1**

**Where:** `pages/Insights.tsx` (insight grid), `pages/InsightDetail.tsx` (related
articles), `pages/ServiceDetail.tsx` (the sub-service cards), `pages/about/Values.tsx`
and `HowWeWork.tsx` (value / step cards), `pages/Careers.tsx`.

**Observation:** On the home page, card grids reveal with a delightful cascade —
`Reveal delay={i * 0.1}` / `delay={i * 0.05}` is already used in `Home.tsx`,
`LocationStrip`, `IndustrySpotlight`, `FAQPreview`. Everywhere else, grids either
appear all at once or do not animate. The capability exists; it simply was not
applied past the home page.

**Recommendation:** Wrap each card in `<Reveal width="100%" delay={i * 0.06}>` and
let the index drive the stagger. Use ~60 ms per item and cap the cumulative delay
(see §5) so a 9-card grid does not take a second to finish. This is the
highest-impact single change for "the inner pages feel cheap" — it is the home
page's best trick, applied consistently.

---

**MA-09 — Consolidate onto one easing curve · P2**

**Where:** `tailwind.config.ts` (`transitionTimingFunction`), and everywhere a raw
`cubic-bezier(…)` is written inline.

**Observation:** See §2.3 — `0.16,1,0.3,1` and `0.23,1,0.32,1` are doing the same
job in different files.

**Recommendation:** Adopt **`cubic-bezier(0.16, 1, 0.3, 1)`** as the single house
"expo-out" curve — it is already the majority curve and has the snappier,
more confident front-load that suits "distinctive and polished". Rename the
Tailwind token (e.g. `ease-brand`) to that value, point `ease-out-expo` at it (or
delete `out-expo`/`out-quart`), and replace inline `cubic-bezier(0.23,1,0.32,1)`
in `BigCTA.tsx`, `ServiceBento.tsx`, `PageHero.css` with the token. Hover
micro-states can use a plain `ease-out`; reserve the expo curve for entrances and
larger moves.

---

**MA-10 — `WhatsAppFloat` hover scale never animates · P2**

**Where:** `components/WhatsAppFloat.tsx` (the floating action button, ~line 29).

**Observation:** The class list is
`transition-opacity duration-300 ease-out hover:scale-110`. Only **opacity** is in
the transition property, so `hover:scale-110` applies as an instant snap — the
button jumps to 110 % with no easing. The intended polish is silently lost.

**Recommendation:** Change `transition-opacity` to
`transition-[opacity,transform]` (or `transition-all` if MA-06 leaves this one).
A floating WhatsApp button is a primary mobile conversion control — its one
hover/press affordance should feel intentional. Also consider a press state
(`active:scale-95`) for parity with the navbar's call button, which already does
this well.

---

**MA-11 — Snappier default for `Reveal` · P2**

**Where:** `components/Reveal.tsx` — `duration` prop defaults to `0.8` (800 ms).

**Observation:** 800 ms is a _cinematic_ entrance duration. Current (2025–26)
interface motion trends have shifted toward shorter, more confident entrances —
roughly 350–550 ms for content reveals. At 800 ms the body-content reveals feel a
touch languid next to the crisp hover states. The hero already overrides to
`0.7`; the default is the outlier.

**Recommendation:** Drop the `Reveal` default `duration` to **`0.55`** and the
`WordReveal` per-word transition from `700ms` to ~`520ms`. Keep the hero a hair
slower (`0.6–0.7`) so it still feels like an arrival. This single change makes the
whole site feel more "current" without touching a single layout.

---

**MA-12 — Decide deliberately on the custom cursor · P2 (judgement call)**

**Where:** `components/CustomCursor.tsx` (mounted globally), `index.css`
`.custom-cursor-active`.

**Observation:** The custom cursor — a dot plus a lerped follower ring that morphs
into a `mix-blend-difference` "lens" on hover — is genuinely well-coded
(pointer-fine gated, reduced-motion gated, disabled over the map iframe). But it is
a **polarising, 2022–23-era flourish**, and it has one real usability cost: on
hover the precise centre dot is hidden and replaced by a large blurred lens, which
makes pinpointing small targets (nav links, form fields) harder. For a chartered
accountancy firm whose brief is _professional and trustworthy first, unique
second_, a replaced system cursor is the riskiest motion decision on the site.

**Recommendation:** This is a brand call for CA Sagar, not a pure technical fix.
Two defensible options:

- **Recommended — remove it.** The site's distinctiveness can live in the
  editorial typography, the star-field hero, and the `ChaosToOrder` demo. Letting
  the OS cursor do its job removes the only "is this a bit gimmicky?" element and
  costs nothing in personality.
- **If kept — make it quieter.** Do not hide the centre dot on hover; keep a small
  precise dot always visible and let only the _ring_ react. Drop
  `mix-blend-difference` (it produces unpredictable colours over photos and the
  map) in favour of a fixed low-opacity tint.

Either is fine; _shipping the current loud version unexamined_ is the thing to
avoid.

### C — Add: where motion is underused

---

**MA-13 — Bring the inner pages up to the home page's motion standard · P1**

**Where:** `pages/About.tsx` sub-components (`about/HowWeWork.tsx`,
`about/Values.tsx`, `about/Principal.tsx` — currently **zero** entrance
animation), `pages/Services.tsx`, `pages/ServiceDetail.tsx`, `pages/Careers.tsx`,
`pages/FAQ.tsx`, `pages/Resources.tsx`.

**Observation:** This is the executive-summary issue restated as an action.
`Reveal` is used heavily on Home and its sub-components, on Contact,
`IndustrySpotlight`, `ServiceBento`, and `ConsultationBanner` — and **nowhere
else**. About's three core sections animate not at all. The result is a site that
feels premium on the home page and flat the moment you go one level deeper.

**Recommendation:** Adopt a **single, consistent reveal recipe** and apply it to
every section on every route:

- Section eyebrow / heading / lead: a `Reveal` cascade with `delay` `0` / `0.08` /
  `0.16` (the home page's own rhythm).
- Card grids and lists: index-staggered `Reveal` per MA-08.
- Keep it _restrained_ — `fade-up` (20 px) and `reveal-mask` are enough; do not
  introduce new variants per page. The goal is **uniformity**, not more variety.

Done well, this is invisible-as-a-feature: the visitor never thinks "nice
animation", they just feel that the whole site is the same quality as the front
door. This is the recommendation that most directly serves "polished and
professional".

---

**MA-14 — Reading-progress feedback on long article pages · already satisfied**

**Where:** `pages/InsightDetail.tsx`.

**Observation:** On a closer reading, `InsightDetail.tsx` already ships a
`ReadingProgress` component — a circular progress ring wrapped around the
scroll-to-top button that fills as the reader scrolls the article. So the
"scroll feedback on long reads" need this finding was raised for is **already
met**, just as a corner ring rather than a top bar.

**Recommendation:** No change. Adding a second top-bar indicator would be a
redundant piece of motion competing with the existing ring — against this
audit's own "motion must earn its place" principle. The one open gap is that
the ring is desktop-only (`lg:block`); extending an equivalent cue to mobile is
a possible future nicety, but not required and explicitly out of scope here.

---

**MA-15 — Count-up on stat figures · already satisfied**

**Where:** `hooks/useCountUp.ts`, `pages/about/Snapshot.tsx`.

**Observation:** `Snapshot.tsx` already applies `useCountUp` to both of its
real numeric stats (Engagements and Industries-served), scroll-triggered and
reduced-motion-safe. A site-wide review found **no other page that displays a
concrete numeric figure** — the firm's design deliberately avoids a vanity
"big numbers" band.

**Recommendation:** No change. The count-up is correctly applied wherever a
genuine figure exists. Inventing new metrics purely to animate them would be a
vanity flourish this audit explicitly warns against — so the right call is to
leave it as-is.

---

**MA-16 — A considered route transition · P3**

**Where:** `App.tsx` route rendering. Today routes swap instantly; `TopProgressBar`
is the only between-page signal.

**Observation:** An instant content swap is the one place the experience feels
abrupt rather than crafted. This is _not_ a request for slow page fades — those
are dated and hurt perceived speed.

**Recommendation:** Add a **very short** (~180–220 ms) content fade/lift on the
routed view only (not the persistent navbar/footer). The repo is already on React
19 and **React Router 7**, which ships native View Transitions support — the
`viewTransition` prop on `<Link>` / `<NavLink>` — so the modern, 2026-appropriate
technique is available today with no new dependency. It degrades to an instant
swap where unsupported and costs nothing in bundle size. (A keyed CSS fade on the
routed `<Suspense>` outlet is the simpler fallback if a router-wide rollout of the
prop is not wanted yet.)

---

## 4. Motion inventory (reference)

Every animated surface found, with its verdict, for traceability.

| #   | Animation                        | Where                           | Type                | Verdict                     |
| --- | -------------------------------- | ------------------------------- | ------------------- | --------------------------- |
| 1   | Star-field canvas                | Home hero (`StarField`)         | Loop (rAF)          | Keep — well-gated           |
| 2   | Hero word reveal-mask            | Home `<h1>`                     | Entrance            | Keep                        |
| 3   | Hero block reveals ×7            | `Home.tsx`                      | Entrance, staggered | Keep, tighten timing        |
| 4   | "Mysuru" badge pulse             | Home hero                       | Loop, 6 s cap       | Keep (or MA-17 below)       |
| 5   | Hero service marquee             | Home hero pill                  | Loop 45 s           | Keep                        |
| 6   | Section marquee                  | `Marquee` on Home               | Loop 25 s           | Keep                        |
| 7   | Chaos→Order drift + drag pill    | `ChaosToOrder`                  | Loop ×2             | MA-07 — drop pulse          |
| 8   | Scroll-driven services rail      | `HorizontalScroll`              | Scroll-linked       | Keep                        |
| 9   | Rail swipe hint                  | `HorizontalScroll` mobile       | Loop `bounce-x`     | Keep                        |
| 10  | Card lift / border / bar / arrow | `ServiceBento`, Home, etc.      | Hover               | Keep — the signature        |
| 11  | `Reveal` scroll reveals          | Home, Contact, a few comps      | Entrance            | Keep — and spread (MA-13)   |
| 12  | `WordReveal`                     | All hero `<h1>`s                | Entrance            | Keep — but de-stack (MA-04) |
| 13  | `animate-fade-in-up`             | 60× — heroes, Resources, etc.   | Mount-time          | Mixed — MA-04, MA-05        |
| 14  | Navbar roll-text                 | Desktop nav links               | Hover               | Keep                        |
| 15  | Navbar shrink-on-scroll          | `Navbar`                        | Scroll state        | Keep                        |
| 16  | Mobile menu stagger              | `Navbar`                        | Entrance            | Keep                        |
| 17  | `BigCTA` fill-from-zero          | CTAs                            | Hover               | Keep                        |
| 18  | Toast slide-in                   | `Toast`                         | Entrance/exit       | Keep                        |
| 19  | Skeleton / loader pulse + spin   | `Skeleton`, `PageLoader`, forms | Loop                | Keep                        |
| 20  | Preloader curtain                | `Preloader`                     | One-shot            | Keep                        |
| 21  | `TopProgressBar`                 | Route change                    | One-shot            | Keep — extend (MA-14)       |
| 22  | Count-up                         | About `Snapshot` only           | Entrance            | Keep — spread (MA-15)       |
| 23  | Custom cursor + lens             | Global                          | Pointer follow      | MA-12 — decide              |
| 24  | `MagneticButton`                 | —                               | Hover               | Unused — MA-01              |
| 25  | `Parallax`                       | —                               | Scroll              | Unused — MA-01              |
| 26  | `ScrollyTelling`                 | —                               | Scroll              | Unused — MA-01              |
| 27  | `blob` / `spin-slow` tokens      | —                               | Loop                | Unused — MA-03              |
| 28  | `SmoothScroll`                   | —                               | —                   | No-op — MA-02               |

_Optional, low priority — MA-17:_ the Home "Mysuru" location badge uses Tailwind's
generic `animate-pulse`. A small expanding "radar ping" ring (one custom keyframe)
would be more distinctive and on-brand for a _location_ marker than an opacity
throb. Cosmetic only; bundle it with MA-03's token cleanup if touching the config.

---

## 5. Proposed motion language

A short, enforceable spec so future work stays coherent. This _is_ the
"distinctive, polished, professional" brief, written down.

**Principle — motion must earn its place.** Entrances play **once**; content never
loops. Loops are allowed **only** for true affordances (marquee, drag hint,
loaders). Everything respects `prefers-reduced-motion` — already the case, keep it.

**One easing.** House curve `cubic-bezier(0.16, 1, 0.3, 1)` for entrances and
moves of any size. Plain `ease-out` for small hover/colour states. Nothing else.

**Duration scale (name it, enforce it):**

| Token        | Value  | Use                                    |
| ------------ | ------ | -------------------------------------- |
| `fast`       | 150 ms | Colour / opacity hover states          |
| `base`       | 280 ms | UI state changes, small transforms     |
| `slow`       | 520 ms | Content & card entrances, fill effects |
| `deliberate` | 700 ms | Hero / large reveals only              |

**Travel distance:** micro-motions 8–16 px; content reveals 20–24 px; larger
displacement reserved for the hero. Card hover lift stays at the current ~8 px.

**Stagger:** 60 ms between siblings; cap the cumulative delay at ~300 ms so large
grids never feel slow. Drive it off the array index — the codebase already does
this on Home.

**The signature gesture.** The site already has one in embryo: the **`-45°` → `0°`
arrow rotation** on "View …" links and cards. Make it _the_ brand interaction —
apply it consistently to every forward action (it currently appears on Home and
`ServiceBento` but not uniformly). One memorable, repeated, professional gesture
beats five different clever ones. That is what makes a site feel "unique" without
feeling gimmicky.

---

## 6. Prioritised action list

| Priority                | Items                                                                                                                                                                                              | Effect                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **P1 — this iteration** | MA-01 (delete dead components), MA-04 (de-stack hero headline), MA-08 (stagger grids), MA-13 (motion parity across inner pages)                                                                    | Removes dead weight; closes the "two-speed site" gap — the biggest visible win |
| **P2 — soon**           | MA-02, MA-03 (housekeeping), MA-05 (fix mount-time fades), MA-06 (`transition-all` → specific), MA-09 (one easing), MA-10 (WhatsApp scale bug), MA-11 (snappier `Reveal`), MA-12 (cursor decision) | Tightens the system into one coherent, modern token set                        |
| **P3 — nice-to-have**   | MA-07 (drop Chaos pulse), MA-14 (reading progress), MA-15 (count-ups), MA-16 (View Transitions), MA-17 (radar badge)                                                                               | Adds genuinely current flourishes once the base is clean                       |

**One-line takeaway:** the motion _foundation_ is strong and the home page is
right — so the work is not "animate more", it is **delete the dead code, unify the
system into one easing + one duration scale + one signature gesture, and spend
that consistency on the inner pages that currently have none.**
