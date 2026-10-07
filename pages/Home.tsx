import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useInsights } from '../hooks';
import { SITE_URL } from '../config/site';
import { pickHomeInsights } from './home/shared';
import HomeDate from './home/HomeDate';
import HomePaper from './home/HomePaper';
import HomePortrait from './home/HomePortrait';

// 2026 redesign of the home page, rendered inside RedesignLayout. Three
// prototypes are on review, chosen with ?v=1, 2 or 3 (1 by default); a switcher
// shows on preview builds. The one signed off stays and the others go.

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

const VARIANTS = [
  { id: '1', name: 'Built around the date', Page: HomeDate },
  { id: '2', name: 'Front page', Page: HomePaper },
  { id: '3', name: 'Portrait and principle', Page: HomePortrait },
];

/** The switcher shows on a Netlify deploy preview and locally, never on the live site. */
const isPreview = () =>
  typeof window !== 'undefined' && /deploy-preview|localhost|127\.0\.0\.1/.test(window.location.hostname);

const Home: React.FC = () => {
  const { insights } = useInsights();
  const recentInsights = pickHomeInsights(insights);
  const [params] = useSearchParams();
  const variant = VARIANTS.find((item) => item.id === params.get('v')) ?? VARIANTS[0]!;
  const { Page } = variant;

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
    <div className={`rd-page home home-${variant.id} ${variant.id === '2' ? 'head-light' : ''}`}>
      <SEO
        title={`${CONTACT_INFO.name} | Chartered Accountants | Mysuru`}
        description={`${CONTACT_INFO.name}, Chartered Accountants in Mysuru: income tax, GST, TDS, audit, company law and trusts, for individuals, businesses and institutions.`}
        schema={HOME_SCHEMA}
      />
      <Page insights={recentInsights} />
      {isPreview() && (
        <nav className="vswitch" aria-label="Home page prototypes">
          {VARIANTS.map((item) => (
            <Link key={item.id} to={`/?v=${item.id}`} aria-current={item.id === variant.id ? 'page' : undefined}>
              {item.id}. {item.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Home;
