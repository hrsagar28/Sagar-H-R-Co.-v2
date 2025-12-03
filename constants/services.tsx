
import React from 'react';
import { ServiceItem, ServiceDetailContent } from '../types';
import { 
  FileText, ShieldCheck, Calculator, Briefcase, 
  BookOpen, Users, Gavel, Building2 
} from 'lucide-react';

export const SERVICES: ServiceItem[] = [
  {
    id: 'gst',
    title: 'GST Registration & Filing',
    description: 'Complete GST compliance solution from registration to return filing. We ensure accurate and timely submissions.',
    icon: <FileText className="w-6 h-6" />,
    link: '/services/gst'
  },
  {
    id: 'income-tax',
    title: 'Income Tax Compliance',
    description: 'Expert ITR filing for individuals and businesses with strategic tax planning. Compliance with latest tax laws.',
    icon: <Calculator className="w-6 h-6" />,
    link: '/services/income-tax'
  },
  {
    id: 'company-law',
    title: 'Company Law & ROC',
    description: 'Comprehensive company law compliance including incorporation, annual filings, and board resolutions.',
    icon: <Building2 className="w-6 h-6" />,
    link: '/services/company-law'
  },
  {
    id: 'litigation',
    title: 'Litigation Support',
    description: 'Expert representation in tax scrutiny, appeals, and proceedings. We represent your case before authorities.',
    icon: <Gavel className="w-6 h-6" />,
    link: '/services/litigation'
  },
  {
    id: 'advisory',
    title: 'Advisory & Consulting',
    description: 'Business guidance from setup to expansion. Insights on financial forecasting and risk management.',
    icon: <Briefcase className="w-6 h-6" />,
    link: '/services/advisory'
  },
  {
    id: 'audit',
    title: 'Audit & Assurance',
    description: 'Thorough statutory, tax, and internal audits ensuring financial accuracy and compliance for your organization.',
    icon: <ShieldCheck className="w-6 h-6" />,
    link: '/services/audit'
  },
  {
    id: 'bookkeeping',
    title: 'Bookkeeping & Accounting',
    description: 'Meticulous bookkeeping services with cloud-based solutions. Maintain accurate financial records.',
    icon: <BookOpen className="w-6 h-6" />,
    link: '/services/bookkeeping'
  },
  {
    id: 'payroll',
    title: 'Payroll Management',
    description: 'End-to-end payroll processing with compliance management. Ensure timely salary disbursement and deductions.',
    icon: <Users className="w-6 h-6" />,
    link: '/services/payroll'
  }
];

export const SERVICE_DETAILS: Record<string, ServiceDetailContent> = {
  'gst': {
    id: 'gst',
    title: 'GST Registration & Filing',
    shortDescription: 'Complete and reliable solutions for all your Goods and Services Tax needs, ensuring you remain compliant.',
    longDescription: "We handle the entire GST lifecycle for your business. Our process begins with understanding your business activities, followed by seamless execution of all registration and filing requirements, ensuring you meet every deadline with accuracy.",
    features: [
      { title: 'GST Registration', description: 'Application and procurement of your GST Identification Number (GSTIN).' },
      { title: 'Return Filing', description: 'Timely filing of GSTR-1, GSTR-3B, and other relevant monthly, quarterly, and annual returns.' },
      { title: 'Annual Compliance', description: 'Preparation and filing of the Annual Return (GSTR-9) and Reconciliation Statements (GSTR-9C).' },
      { title: 'Representation', description: 'Representing clients before tax authorities regarding queries and notices.' }
    ]
  },
  'income-tax': {
    id: 'income-tax',
    title: 'Income Tax Services',
    shortDescription: 'Tax planning and filing services for individuals and businesses, designed to ensure full compliance.',
    longDescription: "We provide end-to-end income tax services, ensuring you are fully compliant. Our approach involves understanding your complete financial profile to offer professional advice and planning.",
    features: [
      { title: 'ITR Filing', description: 'For all entities including Salaried Individuals, Business Owners, HUFs, and Companies.' },
      { title: 'Tax Planning', description: 'Strategic advice to legally optimize your tax position throughout the year.' },
      { title: 'TDS/TCS Compliance', description: 'Accurate calculation, deposit, and filing of TDS and TCS returns.' },
      { title: 'Scrutiny & Notice Handling', description: 'Professional assistance in handling scrutiny cases and responding to departmental notices.' }
    ]
  },
  'company-law': {
    id: 'company-law',
    title: 'Company Law & ROC Matters',
    shortDescription: 'Ensuring your company remains compliant with all secretarial and statutory requirements under the Companies Act.',
    longDescription: "Maintaining compliance with the Companies Act and Registrar of Companies (ROC) is essential for every registered company. We provide secretarial services to manage these obligations efficiently.",
    features: [
      { title: 'Annual ROC Filings', description: 'Preparation and filing of annual returns and financial statements (Forms AOC-4, MGT-7) with the ROC.' },
      { title: 'Maintenance of Registers', description: 'Keeping all mandatory statutory records and registers updated as required by law.' },
      { title: 'Event-Based Compliances', description: 'Managing filings related to changes in directorship, share capital, registered office, or amendments to charter documents.' },
      { title: 'Secretarial Advisory', description: 'Providing expert advice on matters of corporate governance and board meetings.' }
    ]
  },
  'litigation': {
    id: 'litigation',
    title: 'Litigation Support',
    shortDescription: 'Professional representation. We help you navigate tax disputes and departmental notices.',
    longDescription: "Facing a notice from the tax department requires careful attention. Our litigation support services are designed to provide you with professional representation. We manage communications, prepare robust responses, and represent your case effectively.",
    features: [
      { title: 'Responding to Notices', description: 'Drafting and filing detailed responses to scrutiny notices, inquiries, and letters from tax authorities.' },
      { title: 'Case Representation', description: 'Representing your case before assessing officers and other tax authorities during hearings and assessments.' },
      { title: 'Appeals & Revisions', description: 'Preparing and filing appeals before appellate authorities like the Commissioner (Appeals) and the Income Tax Appellate Tribunal (ITAT).' },
      { title: 'Advisory', description: 'Providing professional advice on the legal merits of your case.' }
    ]
  },
  'advisory': {
    id: 'advisory',
    title: 'Advisory & Consulting',
    shortDescription: 'Professional guidance to help your business navigate challenges and achieve sustainable growth.',
    longDescription: "Beyond compliance, we act as your advisor, offering guidance to help you make sound financial decisions. Whether you are starting a new venture or optimizing operations, our consulting services provide clarity.",
    features: [
      { title: 'Business Setup', description: 'Guidance on selecting the business structure and managing the complete registration process.' },
      { title: 'Project Financing', description: 'Preparation of detailed project reports and CMA data for submission to banks for financing.' },
      { title: 'Financial Projections', description: 'Assistance with budgeting, cash flow forecasting, and performance analysis.' },
      { title: 'Startup Advisory', description: 'Guidance for new ventures, including business plan creation and valuation services.' }
    ]
  },
  'audit': {
    id: 'audit',
    title: 'Audit & Assurance',
    shortDescription: 'Providing a clear and fair view of your financial statements with independent audits.',
    longDescription: "Our audit and assurance services provide stakeholders with confidence in your financial reporting. We conduct our audits with a commitment to objectivity and integrity, complying with all regulatory standards.",
    features: [
      { title: 'Statutory Audit', description: 'Audits as required under the Companies Act, 2013, ensuring full compliance.' },
      { title: 'Tax Audit', description: 'Audits under Section 44AB of the Income Tax Act, 1961, to verify the accuracy of your tax-related records.' },
      { title: 'Internal Audits', description: 'Reviews of your internal controls and operational efficiency.' },
      { title: 'Certification Services', description: 'Providing various certifications required for regulatory purposes, including net worth certificates and 15CB forms.' }
    ]
  },
  'bookkeeping': {
    id: 'bookkeeping',
    title: 'Bookkeeping & Accounting',
    shortDescription: 'Laying the foundation for financial clarity with meticulous record-keeping.',
    longDescription: "Accurate bookkeeping is the bedrock of sound financial management. It provides the clear data you need to make informed decisions and maintain compliance. Our service manages the financial tracking, allowing you to focus on your business.",
    features: [
      { title: 'Transaction Recording', description: 'Comprehensive recording of all financial transactions.' },
      { title: 'Bank Reconciliation', description: 'Regular reconciliation of your bank statements with your accounting records.' },
      { title: 'Ledger Management', description: 'Maintaining general ledger, accounts payable, and accounts receivable ledgers.' },
      { title: 'Financial Statements', description: 'Generation of key financial reports such as the Profit & Loss Statement and Balance Sheet.' }
    ]
  },
  'payroll': {
    id: 'payroll',
    title: 'Payroll Management',
    shortDescription: 'Ensuring your team is paid accurately and on time, while navigating payroll compliance.',
    longDescription: "Payroll is a critical function that impacts compliance. Our comprehensive payroll services manage the process, from salary calculations to statutory deductions, ensuring accuracy and timeliness.",
    features: [
      { title: 'Salary Processing', description: 'Accurate calculation of monthly salaries, including allowances and deductions.' },
      { title: 'Statutory Compliance', description: 'Management of TDS, Provident Fund (PF), and Employee State Insurance (ESI) deductions and deposits.' },
      { title: 'Payslip Generation', description: 'Providing clear and detailed monthly payslips for all employees.' },
      { title: 'Reporting & Filing', description: 'Preparation and filing of all necessary payroll-related returns and reports.' }
    ]
  }
};
