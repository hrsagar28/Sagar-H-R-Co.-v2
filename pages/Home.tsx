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
import { AccentTitle } from '../components/ui/AccentTitle';
import TrustBar from '../components/home/TrustBar';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useInsights } from '../hooks';
import { BigCTA } from '../components/ui/BigCTA';
import VisuallyHidden from '../components/VisuallyHidden';
import { SITE_URL } from '../config/site';

const Home: React.FC = () => {
  const { insights } = useInsights();
  const recentInsights = insights.slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AccountingService',
        '@id': 'https://casagar.co.in/#organization',
        name: CONTACT_INFO.name,
        url: 'https://casagar.co.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://casagar.co.in/logo.png',
        },
        image: 'https://casagar.co.in/og/og-default.png',
        description: 'Chartered Accountancy Firm in Mysuru specializing in Audit, Taxation, and Advisory.',
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
        '@id': 'https://casagar.co.in/#website',
        url: 'https://casagar.co.in',
        name: CONTACT_INFO.name,
        publisher: { '@id': 'https://casagar.co.in/#organization' },
      },
    ],
  };

  return (
    <div className="w-full bg-brand-bg">
      <SEO
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name} - Chartered Accountants in Mysuru. Providing services in Audit, Taxation, and Regulatory Compliance.`}
        schema={schema}
      />

      {/* 1. CINEMATIC HERO
          Dark ink background with a quiet star field; no photographic layer.
          Animation timings are tighter than before so the headline lands inside
          ~0.6s and the CTA is interactive by ~1s.
          Mobile uses 100svh so Android in-app browsers / custom tabs do not
          recenter the hero when their chrome reports a changing dynamic
          viewport. Larger viewports can use dvh for the fuller cinematic
          frame. */}
      <section
        data-hero-dark
        className="relative flex min-h-[100svh] min-h-screen flex-col justify-start overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-32 md:min-h-[100dvh] md:justify-center md:px-6 md:pb-0 md:pt-20"
      >
        <StarField />

        <div className="container relative z-20 mx-auto mt-12 max-w-7xl md:mt-0">
          <div className="max-w-6xl">
            <Reveal delay={0.05} variant="fade-up">
              <div className="mb-8 flex flex-col gap-2">
                <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-xl">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-brand-accent shadow-[0_0_12px_brand-accent]"></div>
                  <span>Mysuru</span>
                </div>
                <h2 className="font-heading text-xl font-bold tracking-wide text-white/80 md:text-2xl">
                  Sagar H R &amp; Co.
                </h2>
              </div>
            </Reveal>

            {/* Dynamic Service-Based Headline */}
            <div className="mb-10">
              <VisuallyHidden as="h1">
                Sagar H R & Co. — Chartered Accountants in Mysuru: Audit, Taxation, and Advisory.
              </VisuallyHidden>
              <Reveal variant="reveal-mask" delay={0.1} duration={0.7} eager>
                <AccentTitle as="div" className="max-w-full overflow-hidden text-white drop-shadow-2xl">
                  <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">Audit.</span>
                </AccentTitle>
              </Reveal>
              <Reveal variant="reveal-mask" delay={0.18} duration={0.7} eager>
                <AccentTitle as="div" className="max-w-full overflow-hidden text-white drop-shadow-2xl">
                  <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">Taxation.</span>
                </AccentTitle>
              </Reveal>
              <Reveal variant="reveal-mask" delay={0.26} duration={0.7} eager>
                <AccentTitle
                  as="div"
                  className="max-w-full overflow-hidden text-white drop-shadow-2xl"
                  accentClassName="text-[#E8F5E9]"
                >
                  <span className="block text-[12vw] md:text-[7rem] lg:text-[9rem]">
                    <em>Advisory.</em>
                  </span>
                </AccentTitle>
              </Reveal>
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
                  <BigCTA to="/contact" tone="paper" size="lg">
                    Engage the practice
                  </BigCTA>
                </Reveal>

                <Reveal delay={0.6} variant="fade-up">
                  <div className="w-full overflow-hidden md:w-auto">
                    <div className="flex flex-wrap gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 md:gap-4 md:px-6 md:py-3.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 md:text-xs">
                        GST
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 md:text-xs">
                        Income Tax
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 md:text-xs">
                        Company Law
                      </span>
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
      <ChaosToOrder />

      {/* 3. FOUNDER SECTION */}
      <FounderSection />

      {/* 4. IMMERSIVE SERVICES (Horizontal Scroll)
             Heading is passed into HorizontalScroll as a `header` slot so that
             on desktop it lives inside the sticky pane and stays visible while
             cards translate horizontally — no more scrolling past the title to
             reach content. On mobile the header simply renders above the
             scroll-snap row.
             Mobile alignment: items-start so the heading and caption hug the
             left edge instead of being pushed right by the desktop `items-end`
             baseline. */}
      <section className="relative z-30 bg-brand-black pb-12 pt-8 text-white md:pb-16 md:pt-12">
        <HorizontalScroll
          header={
            <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-4 pt-10 md:px-6 md:pb-6 md:pt-14">
              <div className="flex flex-col items-start justify-between gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:gap-6 md:pb-6">
                <Reveal>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-amber-400 md:mb-3 md:text-xs">
                    Practice Areas
                  </span>
                  <h2 className="font-heading text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-7xl">
                    Services
                  </h2>
                </Reveal>
                <Reveal delay={0.2} className="md:w-1/3">
                  <p className="text-left text-sm font-medium leading-relaxed text-white/60 md:text-left md:text-base lg:text-lg">
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
              className="group relative flex aspect-[4/5] w-[300px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/5 bg-brand-dark p-8 transition-all duration-500 hover:border-brand-accent/50 hover:bg-brand-surface-dark-hover md:w-[400px] md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-brand-accent shadow-lg shadow-black/20 transition-transform duration-500 group-hover:scale-110">
                  {React.cloneElement(service.icon as React.ReactElement<{ size?: number }>, { size: 32 })}
                </div>

                <div className="mb-auto">
                  <h3 className="mb-4 font-heading text-2xl font-bold leading-tight text-white transition-colors group-hover:text-brand-accent md:text-3xl">
                    {service.title}
                  </h3>
                  <p className="line-clamp-3 text-base font-medium leading-relaxed text-white/65 transition-colors group-hover:text-white/80">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300 transition-colors group-hover:text-white">
                    View Details
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 shadow-[0_0_20px_rgba(74,222,128,0)] transition-all duration-300 group-hover:border-brand-accent group-hover:bg-brand-accent group-hover:text-black group-hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]">
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
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/20 transition-all duration-500 group-hover:bg-white group-hover:text-black">
                <ArrowRight size={32} />
              </div>
              <h3 className="font-heading text-3xl font-bold text-white transition-colors group-hover:text-brand-accent">
                View All Services
              </h3>
            </Link>
          </div>
        </HorizontalScroll>
      </section>

      {/* 5. TRUST BAR — moved below Services. Now reads as "and these are the
             sectors we've actually served", not decorative noise upfront. */}
      <div id="after-services" tabIndex={-1}>
        <TrustBar />
      </div>

      {/* 7. RECENT INSIGHTS */}
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

            {/* Mobile: compact list view */}
            <div className="divide-y divide-brand-border/60 md:hidden">
              {recentInsights.map((insight, i) => (
                <Reveal key={insight.id} delay={i * 0.05} width="100%">
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
                        <span className="text-xs text-brand-border">·</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                          {insight.date}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-brand-dark transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>

            {/* Desktop: card grid */}
            <div className="hidden grid-cols-3 gap-8 md:grid">
              {recentInsights.map((insight, i) => (
                <Reveal key={insight.id} delay={i * 0.1} width="100%">
                  <Link to={`/insights/${insight.slug}`} className="group block h-full">
                    <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand-border bg-brand-bg transition-all duration-500 hover:-translate-y-2 hover:border-brand-moss/30 hover:shadow-2xl hover:shadow-brand-dark/10">
                      <div className="h-1 w-0 bg-gradient-to-r from-brand-moss to-brand-accent transition-all duration-700 group-hover:w-full" />

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
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-moss/10 text-xs font-bold text-brand-moss">
                              {insight.author
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                              {insight.date}
                            </span>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-dark transition-all duration-300 group-hover:border-brand-moss group-hover:bg-brand-moss group-hover:text-white">
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

      {/* 8. FAQ PREVIEW */}
      <FAQPreview />

      {/* 9. MARQUEE */}
      <Marquee />

      {/* 11. LOCATION STRIP */}
      <LocationStrip />
    </div>
  );
};

export default Home;
