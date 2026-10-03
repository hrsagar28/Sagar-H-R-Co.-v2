// Links and fixed wording shared by the redesigned header, menu and footer.

export interface RdLink {
  label: string;
  to: string;
}

/** The single row of links in the top bar and the sticky bar. */
export const RD_PRIMARY_LINKS: RdLink[] = [
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Resources', to: '/resources' },
  { label: 'FAQs', to: '/faqs' },
];

export const RD_FOOTER_EXPLORE: RdLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About the firm', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Insights', to: '/insights' },
];

export const RD_FOOTER_RESOURCES: RdLink[] = [
  { label: 'Client resources', to: '/resources' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact us', to: '/contact' },
];

export const RD_LEGAL_LINKS: RdLink[] = [
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms of service', to: '/terms' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export const RD_STAFF_PORTAL_URL = 'https://portal.casagar.co.in';

/** Office hours in words. Days use Date#getDay numbering (0 = Sunday). */
export const RD_HOURS_SUMMARY = 'Monday to Saturday, 10 am to 8 pm';
export const RD_HOURS_TABLE = [
  { label: 'Monday to Saturday', time: '10:00 am – 8:00 pm', days: [1, 2, 3, 4, 5, 6] },
  { label: 'Sunday', time: 'Closed', days: [0] },
];

/** The date the privacy policy, terms of service and disclaimer last changed. */
export const RD_LEGAL_UPDATED = '2026-10-03';
