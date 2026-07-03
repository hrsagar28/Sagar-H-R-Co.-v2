import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Marquee,
  Reveal,
  SEO,
  HorizontalScroll,
  FounderSection,
  FAQPreview,
  LocationStrip,
  StarField,
  ChaosToOrder,
} from '../components';
import TrustBar from '../components/home/TrustBar';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useInsights } from '../hooks';
import { BigCTA } from '../components/ui/BigCTA';
import { SITE_URL } from '../config/site';
import { getAuthorInitials } from '../utils/authorInitials';
import { observeOnce } from '../utils/sharedIntersectionObserver';
import type { InsightItem } from '../types';

const BUILD_DATE = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().slice(0, 10);

/**
 * Static AccountingService + WebSite JSON-LD for the home page.
 *
 * Hoisted to module scope (audit H-06) so it isn't reconstructed every render.
 * All inputs are themselves module-scope constants (CONTACT_INFO, SERVICES,
 * SITE_URL, BUILD_DATE), so the object is genuinely invariant for the
 * lifetime of the bundle.
 */
const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AccountingService',
      '@id': `${SITE_URL}/#organization`,
      name: CONTACT_INFO.name,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
      image: `${SITE_URL}/og/og-default.png`,
      description: 'Chartered Accountancy Firm in Mysuru specializing in Audit, Taxation, and Advisory.',
      priceRange: '₹₹',
      availableLanguage: CONTACT_INFO.languages,
      sameAs: [CONTACT_INFO.social.linkedin],
      areaServed: [
        { '@type': 'City', name: 'Mysuru' },
        { '@type': 'State', name: 'Karnataka' },
        { '@type': 'Country', name: 'India' },
      ],
      foundingDate: CONTACT_INFO.stats.established,
      founder: {
        '@type': 'Person',
        name: CONTACT_INFO.founder.name,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT_INFO.address.street,
        addressLocality: CONTACT_INFO.address.city,
        // SEO-7: include addressRegion so the home schema matches the About
        // schema on the same @id (previously omitted here).
        addressRegion: CONTACT_INFO.address.state,
        postalCode: CONTACT_INFO.address.zip,
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT_INFO.geo.latitude,
        longitude: CONTACT_INFO.geo.longitude,
      },
      telephone: CONTACT_INFO.phone.value,
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '20:00',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Chartered Accountancy Services',
        itemListElement: SERVICES.map((service) => ({
          '@type': 'Service',
          name: service.title,
          description: service.description,
          url: `${SITE_URL}${service.link}`,
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: CONTACT_INFO.name,
      publisher: { '@id': `${SITE_URL}/#organization` },
      dateModified: BUILD_DATE,
    },
  ],
};

/** Stop pulsing the hero "Mysuru" badge after 6 s — long enough to register
 *  the placemaker, short enough not to become noise. Also stops on the
 *  first user scroll, whichever comes first. */
const HERO_BADGE_PULSE_TIMEOUT_MS = 6000;

/** How many recent insights the home page shows. */
const HOME_INSIGHTS_COUNT = 3;

/**
 * Pick which insights to show on the home page (audit I-04).
 *
 * Preference order:
 *   1. Insights marked `featuredOnHome: true` in `data/insights.json`,
 *      preserving the order they appear in the file (curators control
 *      ordering by re-ordering the JSON).
 *   2. If fewer than HOME_INSIGHTS_COUNT carry the flag, fill the rest
 *      with the most-recent-by-date insights (excluding ones already
 *      picked, so we never duplicate).
 *
 * Keeping the fallback means a teammate adding a new insight without
 * touching any flag still gets a sensible home rail; the curated list
 * is a layer on top of recency, not a replacement.
 */
const pickHomeInsights = (insights: readonly InsightItem[]): InsightItem[] => {
  const featured = insights.filter((insight) => insight.featuredOnHome === true);
  if (featured.length >= HOME_INSIGHTS_COUNT) {
    return featured.slice(0, HOME_INSIGHTS_COUNT);
  }
  const featuredIds = new Set(featured.map((insight) => insight.id));
  const recent = [...insights]
    .filter((insight) => !featuredIds.has(insight.id))
    // Insights from data/insights.json carry ISO date strings, so a
    // lexicographic compare yields the correct chronological order.
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...featured, ...recent].slice(0, HOME_INSIGHTS_COUNT);
};

interface LazyHomeSectionProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Reserved height for the section while its children haven't mounted
   * yet. Format follows CSS `contain-intrinsic-size`:
   *
   *   - `"900px"`        — fixed reservation; identical width and height
   *                        not needed because the wrapper is full-width.
   *   - `"auto 900px"`   — `auto` keyword tells the browser to remember
   *                        the rendered size after first paint, then use
   *                        900px as the fallback before that. Preferred
   *                        for variable-height sections (insights, FAQ)
   *                        so the second view of the page is shift-free.
   *
   * Pick the reservation generously — too small a value causes a layout
   * shift when the real section paints; too large means a slight gap of
   * empty scroll. Audit LZ-02.
   */
  intrinsicSize: string;
  /**
   * IntersectionObserver rootMargin used to decide when to mount children.
   * Default `'900px 0px'` mounts roughly one screen of scroll early on
   * desktop; ChaosToOrder uses a tighter `'200px 0px'` to delay its
   * heavy DOM until just before it enters the viewport.
   */
  rootMargin?: string;
}

const LazyHomeSection: React.FC<LazyHomeSectionProps> = ({
  children,
  className = '',
  intrinsicSize,
  rootMargin = '900px 0px',
}) => {
  'use memo';
  const ref = React.useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (shouldRender) return;
    const element = ref.current;
    if (!element) return;
    // Audit LZ-01: shared module-level observer pool — one observer per
    // unique rootMargin instead of one per LazyHomeSection.
    return observeOnce(element, rootMargin, () => setShouldRender(true));
  }, [rootMargin, shouldRender]);

  return (
    <div
      ref={ref}
      className={`[content-visibility:auto] ${className}`}
      style={
        {
          containIntrinsicSize: intrinsicSize,
          minHeight: shouldRender ? undefined : intrinsicSize.replace(/^auto\s+/, ''),
        } as React.CSSProperties
      }
    >
      {shouldRender ? children : null}
    </div>
  );
};

const Home: React.FC = () => {
  'use memo';
  const { insights } = useInsights();
  // Audit I-04: prefer curated `featuredOnHome` items; fall back to the
  // most-recent-by-date sort so the section always renders three.
  // Audit I-01: both layout variants (mobile list + desktop grid) now
  // render unconditionally — visibility is gated by Tailwind's `hidden /
  // md:hidden / md:grid` so we don't need a JS matchMedia branch.
  const recentInsights = pickHomeInsights(insights);

  // Hero badge pulse (audit H-07): the location placemaker pulses on mount
  // to draw attention, then settles down. Stops on whichever comes first —
  // the user's first scroll, or HERO_BADGE_PULSE_TIMEOUT_MS.
  const [isBadgePulsing, setIsBadgePulsing] = React.useState(true);

  // Signal the preload-hero remover that the React-rendered hero has
  // painted (audit H-02). Uses rAF so the event fires after first paint
  // rather than just after commit. The listener in index.tsx has a 5 s
  // safety fallback if this never arrives (e.g., a crash during render).
  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('app:hero-ready'));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  React.useEffect(() => {
    const stop = () => setIsBadgePulsing(false);
    const timer = window.setTimeout(stop, HERO_BADGE_PULSE_TIMEOUT_MS);
    window.addEventListener('scroll', stop, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', stop);
    };
  }, []);

  return (
    <div className="w-full bg-brand-bg">
      <SEO
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name} - Chartered Accountants in Mysuru. Providing services in Audit, Taxation, and Regulatory Compliance.`}
        schema={HOME_SCHEMA}
      />

      {/* 1. CINEMATIC HERO
          Dark ink background with a quiet star field; no photographic layer.
          Animation timings are tighter than before so the headline lands inside
          ~0.6s and the CTA is interactive by ~1s. */}
      <section
        data-hero-dark
        className="relative flex min-h-[100dvh] flex-col justify-start overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-32 md:justify-center md:px-6 md:pb-0 md:pt-20"
      >
        <StarField />

        <div className="container relative z-20 mx-auto mt-12 max-w-7xl md:mt-0">
          <div className="max-w-6xl">
            <Reveal delay={0.05} variant="fade-up">
              <div className="mb-8 flex flex-col gap-2">
                <div className="glass-dark inline-flex w-fit items-center gap-3 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                  {/* Audit MA-17: location placemaker. The generic opacity
                      throb (animate-pulse) is replaced with a radar "ping" —
                      an expanding ring behind a steady dot — which reads as a
                      live location marker rather than a blinking light. */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    {isBadgePulsing && (
                      <span
                        aria-hidden="true"
                        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75"
                      ></span>
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_12px_theme(colors.brand.accent)]"></span>
                  </span>
                  <span>Mysuru</span>
                </div>
                <p className="font-heading text-xl font-bold tracking-wide text-white/80 md:text-2xl">
                  Sagar H R &amp; Co.
                </p>
              </div>
            </Reveal>

            {/* Dynamic Service-Based Headline */}
            <div className="mb-10">
              <h1
                className="font-heading font-light leading-[1] tracking-[-0.02em] text-white drop-shadow-2xl"
                aria-label="Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory."
              >
                <Reveal variant="reveal-mask" delay={0.1} duration={0.7} eager>
                  <span aria-hidden="true" className="hero-word block max-w-full overflow-hidden">
                    Audit.
                  </span>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.18} duration={0.7} eager>
                  <span aria-hidden="true" className="hero-word block max-w-full overflow-hidden">
                    Taxation.
                  </span>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.26} duration={0.7} eager>
                  <span aria-hidden="true" className="hero-word block max-w-full overflow-hidden">
                    <em className="font-serif font-normal italic text-brand-paper-mint">Advisory.</em>
                  </span>
                </Reveal>
              </h1>
            </div>

            <div className="flex flex-col items-start gap-8">
              <Reveal delay={0.4}>
                <div className="flex items-center gap-4 border-l-2 border-brand-accent pl-4 text-lg font-medium text-white/80 md:pl-6 md:text-xl">
                  <span className="block">
                    Chartered Accountants based in Mysuru. Providing services in Audit, Taxation, and Regulatory
                    Compliance.
                  </span>
                </div>
              </Reveal>

              <div className="mt-4 flex w-full flex-col items-start gap-8 md:flex-row md:items-center">
                <Reveal delay={0.5}>
                  <BigCTA to="/contact" tone="paper-on-dark" size="lg">
                    Book a consultation
                  </BigCTA>
                </Reveal>

                <Reveal delay={0.6} variant="fade-up">
                  <div className="w-full overflow-hidden md:w-auto">
                    <div className="glass-dark w-full max-w-[min(100vw-2rem,34rem)] overflow-hidden rounded-full px-5 py-3 transition-colors duration-300 hover:bg-white/10 md:w-[34rem] md:px-6 md:py-3.5">
                      <Marquee
                        items={SERVICES.map((service) => service.title)}
                        direction="left"
                        className="w-full"
                        itemWrapperClassName="mx-4 flex items-center gap-4"
                        itemClassName="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-white/90 md:text-xs"
                        dotClassName="h-1 w-1 rounded-full bg-white/30"
                        trackClassName="[animation-duration:45s]"
                        showMasks={false}
                        ariaLabel="Chartered accountancy services"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHAOS → ORDER drag-to-compare demo
          Sits immediately after the hero. Zone-B palette. Visceral proof
          of value before any generic trust-bar noise. */}
      <LazyHomeSection intrinsicSize="auto 900px" rootMargin="200px 0px">
        <ChaosToOrder />
      </LazyHomeSection>

      {/* 3. FOUNDER SECTION — audit LZ-03: same LazyHomeSection wrapper
             as every other section so the IntersectionObserver pooling
             and content-visibility intrinsic-size hint stay consistent. */}
      <LazyHomeSection intrinsicSize="auto 1100px">
        <FounderSection />
      </LazyHomeSection>

      {/* 4. IMMERSIVE SERVICES */}
      <LazyHomeSection intrinsicSize="auto 900px">
        <section className="relative z-30 bg-brand-black pb-12 pt-8 text-white md:pb-16 md:pt-12">
          <HorizontalScroll
            header={
              <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-4 pt-10 md:px-6 md:pb-6 md:pt-14">
                <div className="flex flex-col items-start justify-between gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:gap-6 md:pb-6">
                  <Reveal>
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-brand-brass-light md:mb-3 md:text-xs">
                      Practice Areas
                    </span>
                    <h2 className="font-heading text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-7xl">
                      Services
                    </h2>
                  </Reveal>
                  <Reveal delay={0.2} className="md:w-1/3">
                    <p className="text-left text-sm font-medium leading-relaxed text-white/85 md:text-left md:text-base lg:text-lg">
                      Use the arrows or scroll to explore our practice areas.
                    </p>
                  </Reveal>
                </div>
              </div>
            }
          >
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                to={service.link}
                className="group relative flex aspect-[4/5] w-[300px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/5 bg-brand-dark p-8 transition-[border-color,background-color] duration-500 hover:border-brand-accent/50 hover:bg-brand-surface-dark-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black md:w-[400px] md:p-10"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-brand-accent shadow-lg shadow-black/20 transition-transform duration-500 group-hover:scale-110">
                    {/* Audit S-05: component-reference render in place of
                        React.cloneElement(service.icon, { size: 32 }). */}
                    <service.Icon size={32} aria-hidden="true" focusable={false} />
                  </div>

                  <div className="mb-auto">
                    <h3 className="mb-4 font-heading text-2xl font-bold leading-tight text-white transition-colors group-hover:text-brand-accent md:text-3xl">
                      {service.title}
                    </h3>
                    {/* Audit S-04: clamped to 2 lines (was 3) so each card
                        reserves the same vertical room regardless of how
                        long the description happens to be. */}
                    <p className="line-clamp-2 text-base font-medium leading-relaxed text-white/85 transition-colors group-hover:text-white">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-brass-soft transition-colors group-hover:text-white">
                      View Details
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 shadow-[0_0_20px_rgba(74,222,128,0)] transition-[border-color,background-color,color,box-shadow] duration-300 group-hover:border-brand-accent group-hover:bg-brand-accent group-hover:text-black group-hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                      <ArrowRight
                        size={20}
                        className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <div className="flex aspect-[4/5] w-[300px] shrink-0 snap-center items-center justify-center md:w-[400px]">
              <Link to="/services" className="group text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/20 transition-colors duration-500 group-hover:bg-white group-hover:text-black">
                  <ArrowRight size={32} />
                </div>
                <h3 className="font-heading text-3xl font-bold text-white transition-colors group-hover:text-brand-accent">
                  View All Services
                </h3>
              </Link>
            </div>
          </HorizontalScroll>
        </section>
      </LazyHomeSection>

      {/* 5. TRUST BAR — moved below Services. Now reads as "and these are the
             sectors we've actually served", not decorative noise upfront. */}
      <LazyHomeSection intrinsicSize="auto 240px">
        <div id="after-services" tabIndex={-1}>
          <TrustBar />
        </div>
      </LazyHomeSection>

      {/* 6. RECENT INSIGHTS */}
      <LazyHomeSection intrinsicSize="auto 700px">
        {recentInsights.length > 0 && (
          <section className="relative overflow-hidden border-t border-brand-border/60 bg-white px-4 py-16 md:px-6 md:py-32">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />

            <div className="container relative z-10 mx-auto max-w-7xl">
              <div className="mb-8 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
                <div>
                  <Reveal>
                    <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-moss">
                      Knowledge Base
                    </span>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <h2 className="font-heading text-5xl font-bold text-brand-dark md:text-7xl">
                      Latest <span className="font-serif font-normal italic text-brand-stone">Updates.</span>
                    </h2>
                  </Reveal>
                </div>
                <Reveal delay={0.2}>
                  <Link
                    to="/insights"
                    className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark transition-colors hover:text-brand-moss"
                  >
                    View All
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              </div>

              {/* Mobile: compact list view. Audit I-01: rendered always, but
                  `md:hidden` excludes it from accessibility tree + layout at
                  the md breakpoint so screen readers and crawlers see only
                  one set of headings. */}
              <ul className="divide-y divide-brand-border/60 md:hidden">
                {recentInsights.map((insight, i) => (
                  <li key={insight.id}>
                    <Reveal delay={i * 0.05} width="100%">
                      <Link
                        to={`/insights/${insight.slug}`}
                        className="group -mx-1 flex items-center gap-4 rounded-xl px-1 py-4 transition-colors hover:bg-brand-bg/80"
                      >
                        <span className="w-6 shrink-0 font-mono text-xs font-bold tabular-nums text-brand-moss/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1 font-heading text-base font-bold leading-snug text-brand-dark transition-colors group-hover:text-brand-moss">
                            {insight.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-moss">
                              {insight.category}
                            </span>
                            {/* Audit I-03: separator is decorative; otherwise
                                screen readers announce "middle dot" between
                                category and date. */}
                            <span aria-hidden="true" className="text-xs text-brand-border">
                              ·
                            </span>
                            {/* Audit I-02: real <time> with machine-readable
                                ISO date so Google's article-timing signals
                                pick the publication date up cleanly. */}
                            <time
                              dateTime={insight.date}
                              className="text-[10px] font-bold uppercase tracking-wider text-brand-dark"
                            >
                              {insight.date}
                            </time>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="shrink-0 text-brand-dark transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>

              {/* Desktop: card grid. Audit I-01: same data, also rendered
                  unconditionally; `hidden md:grid` makes it the visible
                  variant from the md breakpoint up. */}
              <div className="hidden grid-cols-3 gap-8 md:grid">
                {recentInsights.map((insight, i) => (
                  <Reveal key={insight.id} delay={i * 0.1} width="100%">
                    <Link to={`/insights/${insight.slug}`} className="group block h-full">
                      <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand-border bg-brand-bg transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-2 hover:border-brand-moss/30 hover:shadow-2xl hover:shadow-brand-dark/10">
                        <div className="h-1 w-0 bg-gradient-to-r from-brand-moss to-brand-accent transition-[width] duration-700 group-hover:w-full" />

                        <div className="flex flex-grow flex-col p-6 md:p-8">
                          <div className="mb-6 flex items-center justify-between">
                            <span className="rounded-full bg-brand-moss/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-moss">
                              {insight.category}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                              {insight.readTime}
                            </span>
                          </div>

                          <h3 className="mb-4 line-clamp-2 font-heading text-2xl font-bold leading-tight text-brand-dark transition-colors group-hover:text-brand-moss">
                            {insight.title}
                          </h3>

                          <p className="mb-6 line-clamp-3 flex-grow font-medium leading-relaxed text-brand-dark">
                            {insight.summary}
                          </p>

                          <div className="flex items-center justify-between border-t border-brand-border/50 pt-6">
                            <div className="flex items-center gap-3">
                              <div
                                aria-hidden="true"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-moss/10 text-xs font-bold text-brand-moss"
                              >
                                {/* Audit I-05: helper handles single-word
                                    names, "CA " prefix, and caps at 2
                                    letters. Previous inline `.split.map.join`
                                    produced "CSHR" for "CA Sagar H R". */}
                                {getAuthorInitials(insight.author)}
                              </div>
                              {/* Audit I-02: <time dateTime> for the desktop
                                  card-grid date too. */}
                              <time
                                dateTime={insight.date}
                                className="text-xs font-bold uppercase tracking-wider text-brand-dark"
                              >
                                {insight.date}
                              </time>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-dark transition-colors duration-300 group-hover:border-brand-moss group-hover:bg-brand-moss group-hover:text-white">
                              <ArrowRight
                                size={16}
                                className="-rotate-45 transition-transform duration-300 group-hover:rotate-0"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </LazyHomeSection>

      {/* 7. FAQ PREVIEW */}
      <LazyHomeSection intrinsicSize="auto 900px">
        <FAQPreview />
      </LazyHomeSection>

      {/* 8. LOCATION STRIP */}
      <LazyHomeSection intrinsicSize="auto 1200px">
        <LocationStrip />
      </LazyHomeSection>
    </div>
  );
};

export default Home;
