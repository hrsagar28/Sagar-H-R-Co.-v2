import { CONTACT_INFO } from '../../constants';
import { SITE_URL } from '../../config/site';

type ContactInfo = typeof CONTACT_INFO;

const OG_IMAGE = `${SITE_URL}/og-about.png`;

export const aboutBreadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
];

export const buildAboutSchema = (contact: ContactInfo): object[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: `About ${contact.name}`,
    description: `Profile of ${contact.name}, a Chartered Accountancy practice in Mysuru, Karnataka.`,
    primaryImageOfPage: `${SITE_URL}/images/founder-1080.jpg`,
    about: { '@id': `${SITE_URL}/#founder` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
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
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.state,
      postalCode: contact.address.zip,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: contact.geo.latitude,
      longitude: contact.geo.longitude,
    },
    // Audit AB-21: single-sourced from CONTACT_INFO.hours.value, which is
    // already stored in schema.org openingHours short form ("Mo-Sa 10:00-20:00").
    openingHours: contact.hours.value,
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
    image: `${SITE_URL}/images/founder-1080.jpg`,
    sameAs: [contact.social.linkedin],
  },
];

export const ABOUT_OG_IMAGE = OG_IMAGE;
