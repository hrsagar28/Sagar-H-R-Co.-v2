import { CONTACT_INFO } from '../config/contact';
import { SERVICES } from './services';
// Audit SV-07: single-source the site URL. Previously this file declared
// its own hard-coded SITE_URL, so the services JSON-LD ignored the
// env-aware value in config/site.ts (VITE_SITE_URL) used everywhere else.
import { SITE_URL } from '../config/site';

export const buildServicesSchema = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Professional CA Services',
    url: `${SITE_URL}/services`,
    description: 'Audit, GST, Income Tax, Company Law, Advisory, Bookkeeping, Payroll services from Mysuru.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: SERVICES.map((service) => service.title),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: SERVICES.length,
      itemListElement: SERVICES.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}${service.link}`,
        name: service.title,
        description: service.description,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': `${SITE_URL}/#organization`,
    name: CONTACT_INFO.name,
    areaServed: 'Karnataka, India',
    telephone: CONTACT_INFO.phone.value,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT_INFO.address.street,
      addressLocality: CONTACT_INFO.address.city,
      postalCode: CONTACT_INFO.address.zip,
      addressCountry: 'IN',
    },
  },
];
