import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useInsights } from '../hooks';
import { SITE_URL } from '../config/site';
import { formatLongDate, toISODate } from '../utils/insightDates';
import { ArrowRight } from '../components/redesign/icons';
import OfficeMap from '../components/redesign/OfficeMap';
import { RD_HOURS_SUMMARY } from '../components/redesign/content';
import type { InsightItem } from '../types';
import DueStrip from './home/DueStrip';
import HomeFaqs from './home/HomeFaqs';
import SectionNumbers from './home/SectionNumbers';
import { GROUPS, Portrait, pickHomeInsights } from './home/shared';

// The home page, which is also the "About" page (#about; the old /about address
// leads here). Rendered inside RedesignLayout with the home header: no dark
// band, and the firm's name as the title in place of the wordmark in the top
// bar (isHomeRoute in components/redesign/routes.ts, `.head-home` in
// redesign.css). In order: the name and the two ways to get in touch; the
// coming due dates; the services; the firm, its proprietor and how an
// engagement runs; the latest articles beside three questions; old and new
// section numbers; and the office with its map.

const BUILD_DATE = import.meta.env.VITE_BUILD_DATE || new Date().toISOString().slice(0, 10);

/**
 * Static AccountingService, Person and WebSite JSON-LD for the home page.
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
      founder: { '@id': `${SITE_URL}/#founder` },
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT_INFO.address.street,
        addressLocality: CONTACT_INFO.address.city,
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
      email: CONTACT_INFO.email,
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
    // The proprietor, whom the articles name as their author (InsightDetail).
    // This node was on the old About page.
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#founder`,
      name: CONTACT_INFO.founder.name,
      givenName: 'Sagar',
      familyName: 'H R',
      jobTitle: 'Proprietor',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      memberOf: {
        '@type': 'Organization',
        name: 'Institute of Chartered Accountants of India',
      },
      image: `${SITE_URL}/images/founder-1080.jpg`,
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

const STEPS = [
  {
    title: 'Engagement letter',
    text: 'An engagement letter sets out the scope, the fee and the timeline. Work starts once you sign it. Before accepting an audit, we write to the previous auditor, as the ICAI requires.',
  },
  {
    title: 'Records',
    text: 'You get a list of what the work needs. Send it by email, or bring it to the office.',
  },
  {
    title: 'Preparation and review',
    // The name stays on one line.
    text: `The return, accounts or report is prepared from your records and checked against the law. ${CONTACT_INFO.founder.name.replace(/ /g, ' ')} reviews it before it reaches you.`,
  },
  {
    title: 'Approval and filing',
    text: 'Once you approve the draft, we file it and send you the acknowledgement or the signed report.',
  },
  {
    title: 'Subsequent due dates',
    text: 'Your GST, TDS, income tax and ROC dates go into our calendar, and we remind you before each one falls due.',
  },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** ", updated 5 October" when an article has changed since it was published; the year only when it differs. */
const updatedNote = (insight: InsightItem) => {
  const published = toISODate(insight.date);
  const updated = insight.dateModified ? toISODate(insight.dateModified) : '';
  if (!updated || updated <= published) return null;
  const [year = '', month = '1', day = '1'] = updated.split('-');
  const words = `${Number(day)} ${MONTHS[Number(month) - 1] ?? ''}${year === published.slice(0, 4) ? '' : ` ${year}`}`;
  return (
    <>
      , updated <time dateTime={updated}>{words}</time>
    </>
  );
};

const Home: React.FC = () => {
  const { insights, loading, error } = useInsights();
  const [lead, ...more] = pickHomeInsights(insights);
  const { hash, key } = useLocation();
  const arrived = useRef(false);

  // Tell index.tsx the page has painted, so it can take away the first-paint
  // overlay (#preload-hero in index.html; audit H-02). rAF puts the event
  // after the first paint rather than just after the commit.
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('app:hero-ready'));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // "About" in the menu, the footer and the old /about address all lead to
  // /#about. RouteHandler (App.tsx) puts every new page at the top, so the
  // section is brought into view here, a frame later. Arriving from another
  // page it is a jump; on the home page itself the scroll follows the site's
  // setting, which is smooth unless the reader has asked for less motion.
  useEffect(() => {
    const first = !arrived.current;
    arrived.current = true;
    if (!hash) return;
    let target: HTMLElement | null = null;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      target = null;
    }
    if (!target) return;
    const section = target;
    let placedAt = -1;
    const place = () => {
      // Measured from the layout rather than with scrollIntoView: the page is
      // still a few pixels low while its route fade (Audit MA-16) plays, and
      // the dark band would stop short of the top by that much.
      let top = 0;
      for (let node: HTMLElement | null = section; node; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
      }
      placedAt = top;
      window.scrollTo({ top, behavior: first ? 'instant' : 'auto' });
    };
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      place();
      // On a first visit the fonts may arrive after this, and the sections
      // above change height as they do. Put the section back in place then,
      // unless the reader has already scrolled.
      if (first && document.fonts?.status === 'loading') {
        void document.fonts.ready.then(() => {
          if (!cancelled && Math.abs(window.scrollY - placedAt) < 4) place();
        });
      }
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [hash, key]);

  return (
    <div className="rd-page home">
      <SEO
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name}, Chartered Accountants in Mysuru: income tax, GST, TDS, audit, company law and trusts, for individuals, businesses and institutions.`}
        schema={HOME_SCHEMA}
      />

      <div className="phead">
        <div className="hhero pad">
          <h1>
            <span>{CONTACT_INFO.name}</span> <span className="sub">Chartered Accountants, Mysuru</span>
          </h1>
          <div className="hhero-side">
            <p className="hsub">
              Taxation, audit, company law and accounting services for individuals, businesses, institutions and trusts.
            </p>
            <p className="hacts">
              <Link className="btn" to="/contact#write">
                <span>Send us a message</span>
                <ArrowRight />
              </Link>
              <a className="hcall" href={`tel:${CONTACT_INFO.phone.value}`}>
                Call {CONTACT_INFO.phone.display}
              </a>
            </p>
          </div>
        </div>
      </div>

      <DueStrip />

      <section className="hsvc pad" aria-labelledby="home-services-heading">
        <h2 className="hh" id="home-services-heading">
          Services
        </h2>
        <div className="hsvc-g">
          {GROUPS.map((group, index) => (
            <div key={group.name}>
              <h3 id={`home-group-${index}`}>{group.name}</h3>
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
        <div className="hsvc-f">
          <p>
            Clients include salaried individuals, non-resident Indians, professionals, traders and manufacturers,
            companies and LLPs, and educational and religious trusts.
          </p>
          <Link className="btn" to="/services">
            <span>All services</span>
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="habout pad" id="about" aria-labelledby="home-about-heading">
        <div className="habout-top">
          <div className="habout-photo">
            <Portrait sizes="(max-width: 600px) 92vw, 540px" />
          </div>
          <div className="habout-text">
            <div className="habout-h">
              <h2 className="hh" id="home-about-heading">
                About the firm
              </h2>
              <p>
                {CONTACT_INFO.name} is a firm of Chartered Accountants in {CONTACT_INFO.address.city}, registered with
                the Institute of Chartered Accountants of India.
              </p>
            </div>
            <div className="habout-cols">
              <div className="habout-bio">
                <h3>{CONTACT_INFO.founder.name}</h3>
                <p className="role">Proprietor</p>
                <p>
                  He trained at Hariharan &amp; Co. from 2019 to 2022, qualified as a Chartered Accountant in 2023 and
                  began practice the same year.
                </p>
                <p>He heads the firm’s litigation and audit work.</p>
                <p>
                  He also teaches CA Foundation and Intermediate students, builds the accounting software the office
                  uses and writes on finance.
                </p>
                <p>Outside work, he reads fiction and plays cricket.</p>
              </div>
              <dl className="hfacts">
                <div>
                  <dt>ICAI membership</dt>
                  <dd>ACA, no. {CONTACT_INFO.founder.icaiMembershipNo}</dd>
                </div>
                <div>
                  <dt>Firm registration</dt>
                  <dd>{CONTACT_INFO.firmRegistrationNo}</dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd>{CONTACT_INFO.languages.join(', ')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="hsteps">
          <div className="hsteps-h">
            <h3>How an engagement runs</h3>
            <p>Once you accept our quote, the work follows the same steps each time.</p>
          </div>
          <ol>
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="sn" aria-hidden="true">
                  {index + 1}
                </span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="hread pad">
        <section className="hread-a" aria-labelledby="home-articles-heading">
          <h2 className="hh" id="home-articles-heading">
            Insights
          </h2>
          {lead ? (
            <>
              <article className="hlead">
                <h3>
                  <Link to={`/insights/${lead.slug}`}>{lead.title}</Link>
                </h3>
                <p>{lead.summary}</p>
                <p className="am">
                  <time dateTime={toISODate(lead.date)}>{formatLongDate(lead.date)}</time>
                  {updatedNote(lead)}. {lead.readTime}.
                </p>
              </article>
              {more.length > 0 && (
                <ul className="hrows">
                  {more.map((insight) => (
                    <li key={insight.id}>
                      <Link to={`/insights/${insight.slug}`}>
                        <span className="t">{insight.title}</span>
                        <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : loading ? (
            <div className="hread-wait" aria-busy="true">
              <span className="skel-line" />
              <span className="skel-line" />
              <span className="skel-line" />
              <p className="vh" role="status">
                Loading the articles
              </p>
            </div>
          ) : (
            <p className="hread-none" role={error ? 'alert' : undefined}>
              {error
                ? 'The articles could not load. Please check your connection and refresh the page.'
                : 'No articles yet.'}
            </p>
          )}
          <p className="hmore">
            <Link to="/insights">All insights</Link>
          </p>
        </section>
        <section className="hread-f" aria-labelledby="home-faq-heading">
          <h2 className="hh" id="home-faq-heading">
            Frequently asked questions
          </h2>
          <HomeFaqs />
          <p className="hmore">
            <Link to="/faqs">All FAQs</Link>
          </p>
        </section>
      </div>

      <SectionNumbers />

      <section className="hoffice pad" aria-labelledby="home-office-heading">
        <div className="hoffice-d">
          <h2 className="hh" id="home-office-heading">
            Office
          </h2>
          <address>
            {CONTACT_INFO.address.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p className="hours">{RD_HOURS_SUMMARY}</p>
          <p className="lines">
            <a className="tnum" href={`tel:${CONTACT_INFO.phone.value}`}>
              {CONTACT_INFO.phone.display}
            </a>
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
          </p>
          <p className="hacts">
            <Link className="btn" to="/contact#write">
              <span>Send us a message</span>
              <ArrowRight />
            </Link>
            <a className="hghost" href={CONTACT_INFO.social.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp<span className="vh"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <div className="hoffice-m">
          <OfficeMap />
          <div className="acts">
            <a href={CONTACT_INFO.geo.mapShareUrl} target="_blank" rel="noopener noreferrer">
              Get directions<span className="vh"> (opens Google Maps in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
