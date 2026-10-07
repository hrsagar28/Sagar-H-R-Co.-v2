import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT_INFO, FAQS, SERVICES } from '../constants';
import { useInsights } from '../hooks';
import { SITE_URL } from '../config/site';
import { formatLongDate, toISODate } from '../utils/insightDates';
import DueStrip from './home/DueStrip';
import { GROUPS, Portrait, pickHomeInsights } from './home/shared';

// 2026 redesign of the home page, rendered inside RedesignLayout with the light
// header (LIGHT_HEADER_ROUTES): what the firm does and how to reach it, the
// coming due dates, the services, the firm and its principal, how an
// engagement runs, and the latest articles and questions. The office details
// are in the footer, so the page does not repeat them.

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

/** The questions the home page links to, in this order. */
const HOME_FAQ_IDS = ['services-outside-mysuru', 'service-fees', 'income-tax-notice'];
const HOME_FAQS = HOME_FAQ_IDS.map((id) => FAQS.find((faq) => faq.id === id)).filter((faq) => faq !== undefined);

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
    text: `The return, accounts or report is prepared from your records and checked against the law. ${CONTACT_INFO.founder.name} reviews it before it reaches you.`,
  },
  {
    title: 'Approval and filing',
    text: 'Once you approve the draft, we file it and send you the acknowledgement or the signed report.',
  },
  {
    title: 'The dates after that',
    text: 'Your GST, TDS, income tax and ROC dates go into our calendar, and we remind you before each one falls due.',
  },
];

const languages = CONTACT_INFO.languages.join(', ').replace(/, ([^,]*)$/, ' and $1');

const Home: React.FC = () => {
  const { insights } = useInsights();
  const [lead, ...more] = pickHomeInsights(insights);

  // Tell index.tsx the page has painted, so it can take away the first-paint
  // overlay (#preload-hero in index.html; audit H-02). rAF puts the event
  // after the first paint rather than just after the commit.
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
        <div className="hgrid open solo pad">
          <div>
            <h1>
              <span className="vh">{CONTACT_INFO.name}, </span>Chartered Accountants in Mysuru
            </h1>
            <p className="hsub">
              Taxation, audit, company law and accounting services for individuals, businesses, institutions and trusts.
            </p>
            <p className="hacts">
              <Link className="btn" to="/contact#write">
                Send us a message
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
        <div className="hsec-h">
          <h2 id="home-services-heading">Services</h2>
          <p>On a yearly retainer or as a single assignment.</p>
        </div>
        <div className="hsvc-g">
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
        <div className="hsvc-f">
          <p>
            Clients include salaried individuals, non-resident Indians, professionals, traders and manufacturers,
            companies and LLPs, and educational and religious trusts.
          </p>
          <Link className="btn" to="/services">
            All services
          </Link>
        </div>
      </section>

      <div className="hdark">
        <section className="habout pad" id="about" aria-labelledby="home-about-heading">
          <div className="habout-photo">
            <Portrait sizes="(max-width: 900px) 70vw, 30vw" />
          </div>
          <div className="habout-text">
            <h2 className="lbl" id="home-about-heading">
              About the firm
            </h2>
            <p className="habout-st">
              {CONTACT_INFO.name} is a firm of Chartered Accountants in {CONTACT_INFO.address.city}, registered with the
              Institute of Chartered Accountants of India.
            </p>
            <div className="habout-cols">
              <div className="habout-bio">
                <h3>{CONTACT_INFO.founder.name}</h3>
                <p className="role">Proprietor</p>
                <p>
                  He trained at Hariharan &amp; Co. from 2019 to 2022, qualified as a Chartered Accountant in 2023 and
                  began practice the same year.
                </p>
                <p>He teaches CA Foundation and Intermediate students and writes on finance.</p>
                <p>Outside work, he reads fiction and plays cricket.</p>
              </div>
              <dl className="hfacts">
                <div>
                  <dt>ICAI membership</dt>
                  <dd>ACA, no. {CONTACT_INFO.founder.icaiMembershipNo}</dd>
                </div>
                <div>
                  <dt>Qualified</dt>
                  <dd>{CONTACT_INFO.stats.established}</dd>
                </div>
                <div>
                  <dt>Firm registration</dt>
                  <dd>{CONTACT_INFO.firmRegistrationNo}</dd>
                </div>
                <div>
                  <dt>Languages</dt>
                  <dd>{languages}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="hsteps pad" aria-labelledby="home-steps-heading">
          <div className="hsec-h">
            <h2 id="home-steps-heading">How an engagement runs</h2>
            <p>Once you accept our quote, the work follows the same steps each time.</p>
          </div>
          <ol>
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="sn" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="hread pad">
        {lead && (
          <section className="hread-a" aria-labelledby="home-articles-heading">
            <h2 className="hread-h" id="home-articles-heading">
              Insights
            </h2>
            <article className="hlead">
              <h3>
                <Link to={`/insights/${lead.slug}`}>{lead.title}</Link>
              </h3>
              <p>{lead.summary}</p>
              <p className="am">
                <time dateTime={toISODate(lead.date)}>{formatLongDate(lead.date)}</time>. {lead.readTime}.
              </p>
            </article>
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
            <p className="hmore">
              <Link to="/insights">All insights</Link>
            </p>
          </section>
        )}
        <section className="hread-f" aria-labelledby="home-faq-heading">
          <h2 className="hread-h" id="home-faq-heading">
            Frequently asked questions
          </h2>
          <ul className="hrows">
            {HOME_FAQS.map((faq) => (
              <li key={faq.id}>
                <Link to={`/faqs#${faq.id}`}>
                  <span className="t">{faq.question}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hmore">
            <Link to="/faqs">All FAQs</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;
