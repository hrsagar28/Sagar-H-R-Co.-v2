import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/redesign/icons';
import { RD_HOURS_TABLE } from '../components/redesign/content';
import { CLIENT_SECTORS, CONTACT_INFO, SERVICES, SERVICE_GROUPS, getServicePage } from '../constants';
import { DUE_DATES, getResourceTool } from '../constants/resources';
import { useInsights } from '../hooks';
import { SITE_URL } from '../config/site';
import { dayMonth, todayIso } from '../utils/resources/dates';
import { formatLongDate, toISODate } from '../utils/insightDates';
import type { InsightItem, ServicePage } from '../types';

// 2026 redesign of the home page. Rendered inside RedesignLayout, which
// supplies the top bar, footer and stylesheet. In order: who the firm is, with
// the next due dates beside it; what it does; who it works with; the
// principal; the tools and checklists; the latest articles; and where to find
// the office. No call to action beyond the contact details at the end.

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

/** How many due dates the header lists. */
const UPCOMING_COUNT = 4;

const GROUPS = SERVICE_GROUPS.map((group) => ({
  ...group,
  pages: group.slugs.map(getServicePage).filter((page): page is ServicePage => Boolean(page)),
}));

/** The tools the home page lists, in order; the checklists follow as one row. */
const HOME_TOOLS = ['income-tax-calculator', 'due-dates', 'tds-tcs-rates', 'section-finder']
  .map((slug) => getResourceTool(slug))
  .filter((tool) => tool !== undefined);

const [ADDRESS_LINE_1, ADDRESS_LINE_2] = CONTACT_INFO.address.lines;
const { founder } = CONTACT_INFO;

const Home: React.FC = () => {
  'use memo';
  const { insights } = useInsights();
  const recentInsights = pickHomeInsights(insights);
  const today = todayIso();
  const upcoming = DUE_DATES.filter((due) => due.date >= today && !due.minor).slice(0, UPCOMING_COUNT);

  // Tell index.tsx the page has painted, so it can take away the dark
  // first-paint overlay (#preload-hero in index.html; audit H-02). rAF puts
  // the event after the first paint rather than just after the commit.
  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('app:hero-ready'));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="rd-page home">
      <SEO
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name}, Chartered Accountants in Mysuru: income tax, GST, TDS, audit, company law and trusts, for individuals, businesses and institutions.`}
        schema={HOME_SCHEMA}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className={`hgrid open pad ${upcoming.length ? '' : 'solo'}`}>
          <div>
            <h1 className="rise">{CONTACT_INFO.name}</h1>
            <p className="hsub rise d1">
              Chartered Accountants in Mysuru. Income tax, GST, audit, and company and trust work, for individuals,
              businesses and institutions.
            </p>
            <p className="hlinks rise d2">
              <Link to="/services">
                Our services <ArrowRight size={16} />
              </Link>
              <Link to="/resources">
                Tools and checklists <ArrowRight size={16} />
              </Link>
            </p>
          </div>
          {upcoming.length > 0 && (
            <div className="rise d2">
              <p className="lbl" id="home-upcoming-heading">
                Coming up
              </p>
              <ul className="most soon" aria-labelledby="home-upcoming-heading">
                {upcoming.map((due) => (
                  <li key={`${due.date}-${due.title}`}>
                    <Link to={`/resources/due-dates#${due.date.slice(0, 7)}`}>
                      <span>
                        <span className="when">{dayMonth(due.date)}</span>
                        {due.title}
                      </span>
                      <ArrowRight size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="hmore">
                <Link to="/resources/due-dates">All due dates for 2026-27</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="svclist pad">
        <section className="sec" aria-labelledby="home-services-heading">
          <div className="sec-h">
            <h2 id="home-services-heading">What we do</h2>
            <p className="desc">
              Tax, audit, company law and accounting, on a yearly retainer or as a single assignment.
            </p>
          </div>
          <div>
            <div className="hsvc">
              {GROUPS.map((group, index) => (
                <div key={group.name}>
                  <h3 className="lbl" id={`home-group-${index}`}>
                    {group.name}
                  </h3>
                  <ul aria-labelledby={`home-group-${index}`}>
                    {group.pages.map((page) => (
                      <li key={page.slug}>
                        <Link to={`/services/${page.slug}`}>{page.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="smore">
              <Link to="/services">
                All services, with what each covers <ArrowRight size={16} />
              </Link>
            </p>
          </div>
        </section>

        <section className="sec who" aria-labelledby="home-sectors-heading">
          <div className="sec-h">
            <h2 id="home-sectors-heading">Who we work with</h2>
            <p className="desc">Our clients include:</p>
          </div>
          <ul className="sectors">
            {CLIENT_SECTORS.map((sector) => (
              <li key={sector}>{sector}</li>
            ))}
            <li className="more">and many more</li>
          </ul>
        </section>

        <section className="sec" aria-labelledby="home-firm-heading">
          <div className="sec-h">
            <h2 id="home-firm-heading">The firm</h2>
            <p className="desc">
              In practice in {CONTACT_INFO.address.city} since {CONTACT_INFO.stats.established}.
            </p>
          </div>
          <div className="firm">
            <picture>
              <source
                type="image/avif"
                srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w"
                sizes="(max-width: 600px) 40vw, 220px"
              />
              <source
                type="image/webp"
                srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w"
                sizes="(max-width: 600px) 40vw, 220px"
              />
              <img
                src="/images/founder-800.jpg"
                srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w"
                sizes="(max-width: 600px) 40vw, 220px"
                alt={`${founder.name}, founder of ${CONTACT_INFO.name}`}
                width="800"
                height="1067"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div>
              <h3>{founder.name}</h3>
              <p className="role">Founder and principal</p>
              <p className="bio">{founder.bio}</p>
              <dl className="facts">
                <div>
                  <dt>ICAI membership no.</dt>
                  <dd>{founder.icaiMembershipNo}</dd>
                </div>
                <div>
                  <dt>Firm registration no.</dt>
                  <dd>{CONTACT_INFO.firmRegistrationNo}</dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd>{CONTACT_INFO.languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}</dd>
                </div>
              </dl>
              <p className="smore">
                <Link to="/about">
                  About the firm <ArrowRight size={16} />
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="home-tools-heading">
          <div className="sec-h">
            <h2 id="home-tools-heading">Tools and checklists</h2>
            <p className="desc">For tax year 2026-27, under the Income-tax Act, 2025.</p>
          </div>
          <ul className="srows">
            {HOME_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link to={`/resources/${tool.slug}`}>
                  <span>
                    <span className="t">{tool.name}</span>
                    <span className="d">{tool.summary}</span>
                  </span>
                  <span className="go">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/resources">
                <span>
                  <span className="t">Checklists, and every other tool</span>
                  <span className="d">
                    The documents to send for a return, an audit, a registration or a loan, and the HRA, capital gains
                    and GST calculators.
                  </span>
                </span>
                <span className="go">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {recentInsights.length > 0 && (
          <section className="sec" aria-labelledby="home-articles-heading">
            <div className="sec-h">
              <h2 id="home-articles-heading">Latest articles</h2>
              <p className="desc">Notes on changes in tax law, and what they mean in practice.</p>
            </div>
            <div>
              <ul className="srows">
                {recentInsights.map((insight) => (
                  <li key={insight.id}>
                    <Link to={`/insights/${insight.slug}`}>
                      <span>
                        <span className="t">{insight.title}</span>
                        <span className="i">
                          <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                          <span aria-hidden="true"> · </span>
                          <span className="vh">, </span>
                          {insight.category}
                        </span>
                      </span>
                      <span className="go">
                        <ArrowRight size={18} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="smore">
                <Link to="/insights">
                  All articles <ArrowRight size={16} />
                </Link>
              </p>
            </div>
          </section>
        )}
      </div>

      <section className="next sand pad visit" aria-labelledby="home-visit-heading">
        <h2 className="next-h" id="home-visit-heading">
          Visit or call
        </h2>
        <div className="vgrid">
          <div className="vinfo">
            <div className="blk">
              <h3 className="lbl">Office</h3>
              <address>
                {ADDRESS_LINE_1}
                <br />
                {ADDRESS_LINE_2}
              </address>
              <p className="vlink">
                <a href={CONTACT_INFO.geo.mapShareUrl} target="_blank" rel="noopener noreferrer">
                  Get directions<span className="vh"> (opens Google Maps in a new tab)</span>
                </a>
              </p>
            </div>
            <div className="blk">
              <h3 className="lbl">Phone and email</h3>
              <p className="vline">
                <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>
              </p>
              <p className="vline">
                <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
              </p>
            </div>
            <div className="blk">
              <h3 className="lbl">Office hours</h3>
              <table className="hours">
                <tbody>
                  {RD_HOURS_TABLE.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Muted to sit with the palette until hovered or focused.
              data-hide-cursor makes the custom cursor step aside for the
              browser's own over the embedded map (CustomCursor.tsx). */}
          <div className="map" data-hide-cursor="true">
            <iframe
              title={`Map showing the office of ${CONTACT_INFO.name}`}
              src={CONTACT_INFO.geo.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="geolocation 'none'"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              allowFullScreen
            />
          </div>
        </div>
        <p className="more">
          Questions first? <Link to="/faqs">Read the FAQs</Link> or <Link to="/contact#write">write to us</Link>.
        </p>
      </section>
    </div>
  );
};

export default Home;
