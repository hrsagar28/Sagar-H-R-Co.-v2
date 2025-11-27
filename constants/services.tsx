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
    description: 'Complete GST compliance solution from registration to return filing. We ensure accurate and timely submissions with maximum input tax credit optimization.',
    icon: <FileText className="w-6 h-6" />,
    link: '/services/gst'
  },
  {
    id: 'income-tax',
    title: 'Income Tax Compliance',
    description: 'Expert ITR filing for individuals and businesses with strategic tax planning. Maximize deductions and ensure compliance with latest tax laws.',
    icon: <Calculator className="w-6 h-6" />,
    link: '/services/income-tax'
  },
  {
    id: 'company-law',
    title: 'Company Law & ROC',
    description: 'Comprehensive company law compliance including incorporation, annual filings, board resolutions, and all ROC-related matters.',
    icon: <Building2 className="w-6 h-6" />,
    link: '/services/company-law'
  },
  {
    id: 'litigation',
    title: 'Litigation Support',
    description: 'Expert representation in tax scrutiny, appeals, and departmental proceedings. We defend your interests with strong legal backing.',
    icon: <Gavel className="w-6 h-6" />,
    link: '/services/litigation'
  },
  {
    id: 'advisory',
    title: 'Advisory & Consulting',
    description: 'Strategic business guidance from startup planning to expansion. Get insights on financial forecasting, risk management, and growth strategies.',
    icon: <Briefcase className="w-6 h-6" />,
    link: '/services/advisory'
  },
  {
    id: 'audit',
    title: 'Audit & Assurance',
    description: 'Thorough statutory, tax, and internal audits ensuring financial accuracy, compliance, and operational efficiency for your organization.',
    icon: <ShieldCheck className="w-6 h-6" />,
    link: '/services/audit'
  },
  {
    id: 'bookkeeping',
    title: 'Bookkeeping & Accounting',
    description: 'Meticulous bookkeeping services with cloud-based solutions. Maintain accurate financial records and get real-time business insights.',
    icon: <BookOpen className="w-6 h-6" />,
    link: '/services/bookkeeping'
  },
  {
    id: 'payroll',
    title: 'Payroll Management',
    description: 'End-to-end payroll processing with compliance management. Ensure timely salary disbursement and statutory deductions handling.',
    icon: <Users className="w-6 h-6" />,
    link: '/services/payroll'
  }
];

export const SERVICE_DETAILS: Record<string, ServiceDetailContent> = {
  'gst': {
    id: 'gst',
    title: 'GST Registration & Filing',
    shortDescription: 'Complete and reliable solutions for all your Goods and Services Tax needs, ensuring you remain compliant and worry-free.',
    longDescription: "We handle the entire GST lifecycle for your business. Our process begins with a thorough consultation to understand your business activities, followed by seamless execution of all registration and filing requirements, ensuring you meet every deadline with accuracy.",
    features: [
      { title: 'GST Registration', description: 'Hassle-free application and procurement of your GST Identification Number (GSTIN).' },
      { title: 'Return Filing', description: 'Timely filing of GSTR-1, GSTR-3B, and other relevant monthly, quarterly, and annual returns.' },
      { title: 'Annual Compliance', description: 'Preparation and filing of the Annual Return (GSTR-9) and Reconciliation Statements (GSTR-9C).' },
      { title: 'Departmental Liaison', description: 'Responding to departmental queries and notices on your behalf to ensure swift resolutions.' }
    ]
  },
  'income-tax': {
    id: 'income-tax',
    title: 'Income Tax Services',
    shortDescription: 'Expert tax planning and filing services for individuals and businesses, designed to maximize savings and ensure compliance.',
    longDescription: "We provide end-to-end income tax services, ensuring you are fully compliant while maximizing your tax savings. Our approach involves understanding your complete financial profile to offer proactive advice and strategic planning that goes beyond simple form-filling.",
    features: [
      { title: 'ITR Filing', description: 'For all entities including Salaried Individuals, Business Owners, HUFs, and Companies.' },
      { title: 'Tax Planning & Advisory', description: 'Strategic advice to legally minimize your tax liability and optimize your financial decisions throughout the year.' },
      { title: 'TDS/TCS Compliance', description: 'Accurate calculation, deposit, and filing of TDS and TCS returns.' },
      { title: 'Scrutiny & Notice Handling', description: 'Professional assistance in handling scrutiny cases and responding to departmental notices.' }
    ]
  },
  'company-law': {
    id: 'company-law',
    title: 'Company Law & ROC Matters',
    shortDescription: 'Ensuring your company remains compliant with all secretarial and statutory requirements under the Companies Act.',
    longDescription: "Maintaining compliance with the Companies Act and Registrar of Companies (ROC) is essential for every registered company. We provide comprehensive secretarial services to manage these obligations efficiently, preventing penalties and ensuring your company maintains a good legal standing.",
    features: [
      { title: 'Annual ROC Filings', description: 'Preparation and filing of annual returns and financial statements (Forms AOC-4, MGT-7) with the ROC.' },
      { title: 'Maintenance of Registers', description: 'Keeping all mandatory statutory records and registers updated as required by law.' },
      { title: 'Event-Based Compliances', description: 'Managing filings related to changes in directorship, share capital, registered office, or amendments to charter documents.' },
      { title: 'Secretarial Advisory', description: 'Providing expert advice on matters of corporate governance, board meetings, and shareholder communications.' }
    ]
  },
  'litigation': {
    id: 'litigation',
    title: 'Litigation Support',
    shortDescription: 'Expert guidance and representation when you need it most. We help you navigate tax disputes and departmental notices with confidence.',
    longDescription: "Facing a notice from the tax department can be daunting. Our litigation support services are designed to provide you with expert representation and a clear strategy. We manage communications, prepare robust responses, and represent your case effectively, ensuring your rights are protected throughout the process.",
    features: [
      { title: 'Responding to Notices', description: 'Drafting and filing detailed, legally sound responses to scrutiny notices, inquiries, and letters from tax authorities.' },
      { title: 'Case Representation', description: 'Representing your case before assessing officers and other tax authorities during hearings and assessments.' },
      { title: 'Appeals & Revisions', description: 'Preparing and filing appeals before appellate authorities like the Commissioner (Appeals) and the Income Tax Appellate Tribunal (ITAT).' },
      { title: 'Strategic Advisory', description: 'Providing expert advice on the strengths and weaknesses of your case and recommending the best course of action.' }
    ]
  },
  'advisory': {
    id: 'advisory',
    title: 'Advisory & Consulting',
    shortDescription: 'Strategic insights and expert guidance to help your business navigate challenges, seize opportunities, and achieve sustainable growth.',
    longDescription: "Beyond compliance, we act as your strategic partner, offering forward-thinking advice to help you make sound financial decisions. Whether you are starting a new venture, seeking financing, or optimizing operations, our consulting services are designed to provide clarity and direction.",
    features: [
      { title: 'Business Setup', description: 'Guidance on selecting the optimal business structure and managing the complete registration process.' },
      { title: 'Project Financing', description: 'Assistance in preparing detailed project reports and CMA data to secure financing from banks and investors.' },
      { title: 'Financial Projections', description: 'Assistance with budgeting, cash flow forecasting, and performance analysis to drive better business decisions.' },
      { title: 'Startup Advisory', description: 'Specialized guidance for new ventures, including business plan creation, valuation services, and structuring for investor funding.' }
    ]
  },
  'audit': {
    id: 'audit',
    title: 'Audit & Assurance',
    shortDescription: 'Providing a clear and fair view of your financial statements with high-quality, independent audits.',
    longDescription: "Our audit and assurance services are designed to provide stakeholders with confidence in your financial reporting. We conduct our audits with a commitment to objectivity, integrity, and professional skepticism, identifying risks and opportunities for improving your internal controls and business processes.",
    features: [
      { title: 'Statutory Audit', description: 'Comprehensive audits as required under the Companies Act, 2013, ensuring full compliance with regulatory standards.' },
      { title: 'Tax Audit', description: 'Detailed audits under Section 44AB of the Income Tax Act, 1961, to verify the accuracy of your tax-related records.' },
      { title: 'Internal Audits', description: 'In-depth reviews of your internal controls and operational efficiency to identify areas for improvement and risk mitigation.' },
      { title: 'Certification Services', description: 'Providing various certifications required for regulatory purposes, including net worth certificates and 15CB forms.' }
    ]
  },
  'bookkeeping': {
    id: 'bookkeeping',
    title: 'Bookkeeping & Accounting',
    shortDescription: 'Laying the foundation for financial clarity and business growth with meticulous and organized record-keeping.',
    longDescription: "Accurate bookkeeping is the bedrock of sound financial management. It provides the clear, real-time data you need to make informed decisions, maintain compliance, and plan for the future. Our service removes the burden of day-to-day financial tracking, allowing you to focus on what you do best: running your business.",
    features: [
      { title: 'Transaction Recording', description: 'Comprehensive recording of all financial transactions, including sales, purchases, receipts, and payments.' },
      { title: 'Bank Reconciliation', description: 'Regular reconciliation of your bank statements with your accounting records to ensure accuracy and identify discrepancies.' },
      { title: 'Ledger Management', description: 'Maintaining general ledger, accounts payable, and accounts receivable ledgers for a clear financial overview.' },
      { title: 'Financial Statements', description: 'Generation of key financial reports such as the Profit & Loss Statement and Balance Sheet.' }
    ]
  },
  'payroll': {
    id: 'payroll',
    title: 'Payroll Management',
    shortDescription: 'Ensuring your team is paid accurately and on time, while navigating the complexities of payroll compliance.',
    longDescription: "Payroll is more than just issuing paychecks; it's a critical function that impacts employee morale and legal compliance. Our comprehensive payroll services manage the entire process, from salary calculations to statutory deductions, ensuring accuracy and timeliness so you can foster a happy and productive workforce.",
    features: [
      { title: 'Salary Processing', description: 'Accurate calculation of monthly salaries, including allowances, bonuses, and deductions.' },
      { title: 'Statutory Compliance', description: 'Management of TDS, Provident Fund (PF), and Employee State Insurance (ESI) deductions and deposits.' },
      { title: 'Payslip Generation', description: 'Providing clear and detailed monthly payslips for all employees.' },
      { title: 'Reporting & Filing', description: 'Preparation and filing of all necessary payroll-related returns and reports to government agencies.' }
    ]
  }
};