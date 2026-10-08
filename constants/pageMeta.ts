import { CONTACT_INFO } from '../config/contact';
import { SITE_URL } from '../config/site';

// The title, description and share picture of each page whose text is fixed.
// Read by the pages themselves (through components/SEO.tsx) and by
// scripts/generate-route-html.ts, which writes the same text into each page's
// served HTML so that link previews and other clients that do not run
// JavaScript see it (Audit SEO-02). One source, so the two cannot drift.

const FIRM = CONTACT_INFO.name;

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute URL of the share picture; the default picture when omitted. */
  ogImage?: string;
}

export const PAGE_META = {
  services: {
    title: `Services | ${FIRM}`,
    description:
      'GST, income tax, TDS, NRI taxation, notices and appeals, audits, certificates, company and LLP filings, trusts, bank loans and bookkeeping, from Sagar H R & Co., Chartered Accountants, Mysuru.',
    ogImage: `${SITE_URL}/og-services.png`,
  },
  insights: {
    title: `Insights | ${FIRM}`,
    description: 'Notes on changes in tax law, by CA Sagar H R of Sagar H R & Co., Mysuru.',
  },
  faqs: {
    title: `FAQs | ${FIRM}`,
    description:
      'Answers on income tax, GST, company and LLP filings, tax notices, appeals and trust registration from Sagar H R & Co., Chartered Accountants in Mysuru.',
    ogImage: `${SITE_URL}/og-faq.png`,
  },
  resources: {
    title: `Resources | ${FIRM}`,
    description:
      'Income tax, HRA, capital gains and GST calculators, TDS and TCS rates, due dates and old-to-new section numbers for tax year 2026-27, and checklists of documents, from Sagar H R & Co., Chartered Accountants, Mysuru.',
  },
  contact: {
    title: `Contact us | ${FIRM}`,
    description:
      'Contact Sagar H R & Co. in Mysuru for audit, tax, GST and business advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp.',
    ogImage: `${SITE_URL}/og-contact.png`,
  },
  privacy: {
    title: `Privacy policy | ${FIRM}`,
    description:
      'What Sagar H R & Co. collects through its website and in its work, why, who else sees it, how long it is kept, and how to reach the grievance officer.',
  },
  terms: {
    title: `Terms of service | ${FIRM}`,
    description:
      'The terms for using the Sagar H R & Co. website: what the information on it is, how you may use it, and the law that applies.',
  },
  disclaimer: {
    title: `Disclaimer | ${FIRM}`,
    description:
      "What the information on the Sagar H R & Co. website is and isn't: general information on tax and compliance, not advice on your situation.",
  },
} satisfies Record<string, PageMeta>;

/** The careers page's title, description and picture, given the open roles. */
export const careersMeta = (openRoles: readonly string[]): PageMeta => ({
  title: `Careers | ${FIRM}`,
  description: openRoles.length
    ? `Open roles at ${FIRM}, Chartered Accountants, Mysuru: ${openRoles.join(' and ')}.`
    : `Careers at ${FIRM}, Chartered Accountants, Mysuru. No roles are open right now; you can still send us your details.`,
  ogImage: `${SITE_URL}/og-careers.png`,
});

/** An article's title: the headline, then the firm (Audit CON-01). */
export const articleTitle = (headline: string): string => `${headline} | ${FIRM}`;
