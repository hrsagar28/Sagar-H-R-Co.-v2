
import React from 'react';
import { ServiceItem, ServiceDetailContent } from '../types';
import { 
  FileText, ShieldCheck, Calculator, Briefcase, 
  BookOpen, Users, Gavel, Building2 
} from 'lucide-react';

export const SERVICES: ServiceItem[] = [
  {
    id: 'gst',
    title: 'GST Services',
    description: 'Services for Goods and Services Tax registration and return filing.',
    icon: <FileText className="w-6 h-6" />,
    link: '/services/gst'
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    description: 'Filing of Income Tax Returns and tax compliance services.',
    icon: <Calculator className="w-6 h-6" />,
    link: '/services/income-tax'
  },
  {
    id: 'company-law',
    title: 'Company Law',
    description: 'Company law compliance services including incorporation and annual filings.',
    icon: <Building2 className="w-6 h-6" />,
    link: '/services/company-law'
  },
  {
    id: 'litigation',
    title: 'Litigation Support',
    description: 'Representation in tax scrutiny, appeals, and proceedings.',
    icon: <Gavel className="w-6 h-6" />,
    link: '/services/litigation'
  },
  {
    id: 'advisory',
    title: 'Business Advisory',
    description: 'Guidance on business setup and financial reporting.',
    icon: <Briefcase className="w-6 h-6" />,
    link: '/services/advisory'
  },
  {
    id: 'audit',
    title: 'Audit & Assurance',
    description: 'Statutory and tax audits as per regulatory requirements.',
    icon: <ShieldCheck className="w-6 h-6" />,
    link: '/services/audit'
  },
  {
    id: 'bookkeeping',
    title: 'Bookkeeping',
    description: 'Bookkeeping and accounting services.',
    icon: <BookOpen className="w-6 h-6" />,
    link: '/services/bookkeeping'
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description: 'Payroll processing and compliance management.',
    icon: <Users className="w-6 h-6" />,
    link: '/services/payroll'
  }
];

export const SERVICE_DETAILS: Record<string, ServiceDetailContent> = {
  'gst': {
    id: 'gst',
    title: 'GST Registration & Filing',
    shortDescription: 'Services regarding Goods and Services Tax registration and compliance.',
    longDescription: "We provide services for GST registration and filing of returns. We assist in the preparation and submission of necessary documents to the GST authorities.",
    features: [
      { title: 'GST Registration', description: 'Assistance with obtaining GST Identification Number (GSTIN).' },
      { title: 'Return Filing', description: 'Filing of GSTR-1, GSTR-3B, and other periodic returns.' },
      { title: 'Annual Compliance', description: 'Filing of Annual Return (GSTR-9) and Reconciliation Statements (GSTR-9C).' },
      { title: 'Representation', description: 'Representation before tax authorities regarding notices.' }
    ]
  },
  'income-tax': {
    id: 'income-tax',
    title: 'Income Tax Services',
    shortDescription: 'Tax filing services for individuals and businesses.',
    longDescription: "We assist in the filing of Income Tax Returns and compliance with applicable tax provisions for various entities.",
    features: [
      { title: 'ITR Filing', description: 'Filing of returns for Individuals, HUFs, and Companies.' },
      { title: 'Tax Compliance', description: 'Assistance with calculation of tax liability.' },
      { title: 'TDS/TCS', description: 'Filing of TDS and TCS returns.' },
      { title: 'Scrutiny Proceedings', description: 'Assistance in responding to departmental notices.' }
    ]
  },
  'company-law': {
    id: 'company-law',
    title: 'Company Law & ROC Matters',
    shortDescription: 'Secretarial and statutory compliance services under the Companies Act.',
    longDescription: "We assist companies in complying with the requirements of the Companies Act and filings with the Registrar of Companies (ROC).",
    features: [
      { title: 'Annual Filings', description: 'Filing of annual returns and financial statements (Forms AOC-4, MGT-7).' },
      { title: 'Statutory Registers', description: 'Assistance in maintenance of statutory records and registers.' },
      { title: 'Event-Based Filings', description: 'Filings related to changes in directorship or registered office.' },
      { title: 'Secretarial Services', description: 'Assistance with documentation for board meetings and resolutions.' }
    ]
  },
  'litigation': {
    id: 'litigation',
    title: 'Litigation Support',
    shortDescription: 'Representation services for tax proceedings.',
    longDescription: "We represent clients in assessment and appellate proceedings before tax authorities and tribunals.",
    features: [
      { title: 'Response Drafting', description: 'Drafting responses to notices and inquiries.' },
      { title: 'Representation', description: 'Appearing before assessing officers.' },
      { title: 'Appeals', description: 'Filing appeals before Commissioner (Appeals) and ITAT.' },
      { title: 'Procedural Advisory', description: 'Guidance on tax dispute procedures.' }
    ]
  },
  'advisory': {
    id: 'advisory',
    title: 'Advisory & Consulting',
    shortDescription: 'Business setup and reporting services.',
    longDescription: "We provide assistance with business incorporation, registration, and preparation of financial reports.",
    features: [
      { title: 'Business Incorporation', description: 'Assistance with registration of entities.' },
      { title: 'Project Reports', description: 'Preparation of Project Reports and CMA Data.' },
      { title: 'Financial Reporting', description: 'Preparation of financial statements and projections.' },
      { title: 'Valuation', description: 'Business valuation services.' }
    ]
  },
  'audit': {
    id: 'audit',
    title: 'Audit & Assurance',
    shortDescription: 'Auditing services.',
    longDescription: "We conduct statutory and tax audits in accordance with the Companies Act and Income Tax Act.",
    features: [
      { title: 'Statutory Audit', description: 'Audits under the Companies Act, 2013.' },
      { title: 'Tax Audit', description: 'Audits under Section 44AB of the Income Tax Act, 1961.' },
      { title: 'Internal Audit', description: 'Internal audit services.' },
      { title: 'Certifications', description: 'Issuance of certificates such as 15CB and Net Worth certificates.' }
    ]
  },
  'bookkeeping': {
    id: 'bookkeeping',
    title: 'Bookkeeping & Accounting',
    shortDescription: 'Accounting and bookkeeping services.',
    longDescription: "We provide services for the maintenance of books of accounts and preparation of financial statements.",
    features: [
      { title: 'Accounting', description: 'Recording of financial transactions.' },
      { title: 'Reconciliation', description: 'Bank and ledger reconciliation.' },
      { title: 'Ledgers', description: 'Maintenance of general and subsidiary ledgers.' },
      { title: 'Financial Statements', description: 'Preparation of Profit & Loss Account and Balance Sheet.' }
    ]
  },
  'payroll': {
    id: 'payroll',
    title: 'Payroll Management',
    shortDescription: 'Payroll compliance services.',
    longDescription: "We assist in payroll calculation and compliance with related statutory requirements.",
    features: [
      { title: 'Payroll Processing', description: 'Calculation of salaries.' },
      { title: 'Statutory Compliance', description: 'Assistance with TDS, PF, and ESI filings.' },
      { title: 'Payslips', description: 'Generation of payslips.' },
      { title: 'Filings', description: 'Filing of payroll returns.' }
    ]
  }
};
