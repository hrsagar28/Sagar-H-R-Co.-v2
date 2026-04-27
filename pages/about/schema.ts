import { CONTACT_INFO } from '../../constants';

type ContactInfo = typeof CONTACT_INFO;

const SITE_URL = 'https://casagar.co.in';
const OG_IMAGE = `${SITE_URL}/og-contact.png`;

export const aboutBreadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
];

export const buildAboutSchema = (contact: ContactInfo): object[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE_URL}/about`,
    name: `About ${contact.name}`,
    description: `Profile of ${contact.name}, a Chartered Accountancy practice in Mysuru, Karnataka.`,
    primaryImageOfPage: OG_IMAGE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': `${SITE_URL}/#organization`,
    name: contact.name,
    url: SITE_URL,
    telephone: contact.phone.value,
    email: contact.email,
    image: OG_IMAGE,
    priceRange: 'INR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.state,
      postalCode: contact.address.zip,
      addressCountry: contact.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: contact.geo.latitude,
      longitude: contact.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    sameAs: [contact.social.linkedin],
    knowsAbout: ['Taxation', 'Audit', 'Financial Advisory', 'GST', 'Company Law'],
    founder: { '@id': `${SITE_URL}/#founder` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#founder`,
    name: contact.founder.name,
    givenName: 'Sagar',
    familyName: 'H R',
    jobTitle: contact.founder.title,
    worksFor: { '@id': `${SITE_URL}/#organization` },
    memberOf: {
      '@type': 'Organization',
      name: 'Institute of Chartered Accountants of India',
    },
    image: `${SITE_URL}/images/founder.jpg`,
    sameAs: [contact.social.linkedin],
  },
];

export const ABOUT_OG_IMAGE = OG_IMAGE;
