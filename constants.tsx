import React from 'react';
import { NavLink, ServiceItem, InsightItem, FAQItem, IndustryItem, ServiceDetailContent } from './types';
import { 
  Scale, FileText, BarChart3, ShieldCheck, Calculator, Briefcase, 
  BookOpen, Users, Gavel, Building2, Factory, ShoppingCart, 
  Stethoscope, Cpu, Home, Utensils, GraduationCap, Sprout 
} from 'lucide-react';

export const NAV_LINKS: NavLink[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Insights', path: '/insights' },
  { name: 'Resources', path: '/resources' },
  { name: 'FAQs', path: '/faqs' },
  { name: 'Careers', path: '/careers' },
  { name: 'Contact', path: '/contact' },
];

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

export const INDUSTRIES: IndustryItem[] = [
  {
    title: 'Manufacturing',
    description: 'Production units, textile mills, automotive components, and industrial manufacturing.',
    icon: <Factory className="w-6 h-6" />
  },
  {
    title: 'Retail & E-commerce',
    description: 'Online stores, retail chains, wholesale distribution, and marketplace sellers.',
    icon: <ShoppingCart className="w-6 h-6" />
  },
  {
    title: 'Healthcare',
    description: 'Hospitals, clinics, diagnostic centers, pharmaceutical companies, and medical practices.',
    icon: <Stethoscope className="w-6 h-6" />
  },
  {
    title: 'Technology',
    description: 'Software companies, IT services, startups, and digital agencies.',
    icon: <Cpu className="w-6 h-6" />
  },
  {
    title: 'Real Estate',
    description: 'Property developers, real estate agencies, construction companies, and property management.',
    icon: <Home className="w-6 h-6" />
  },
  {
    title: 'Hospitality',
    description: 'Hotels, restaurants, travel agencies, event management, and tourism businesses.',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    title: 'Professional Services',
    description: 'Consulting firms, law firms, educational institutions, and service providers.',
    icon: <GraduationCap className="w-6 h-6" />
  },
  {
    title: 'Agriculture & Food',
    description: 'Food processing, agricultural businesses, dairy farms, and agribusiness ventures.',
    icon: <Sprout className="w-6 h-6" />
  }
];

export const INSIGHTS_MOCK: InsightItem[] = [
  {
    id: '1',
    title: 'Key Highlights of the New Income Tax Bill, 2025',
    category: 'Income Tax Updates',
    date: 'August 18, 2025',
    author: 'CA Sagar H R',
    readTime: '6 min read',
    slug: 'new-income-tax-bill-2025',
    summary: 'The new bill aims to simplify direct tax law, making it easier to read, understand, and implement for taxpayers and professionals alike.',
    content: `
      <p>The Indian Parliament has passed the new Income Tax Bill, 2025, a landmark piece of legislation set to replace the long-standing Income Tax Act of 1961. This new bill aims to simplify and modernize India's direct tax system, making it more taxpayer-friendly and aligned with the country's economic goals. The new law will come into effect on April 1, 2026.</p>

      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>The new bill introduces a single "tax year" concept, replacing the separate "financial year" and "assessment year".</li>
              <li>Tax-free income limit raised to ₹12 lakhs for individuals under the new tax regime via rebate.</li>
              <li>Standard deduction for salaried individuals increased to ₹75,000.</li>
              <li>Taxpayers can now claim TDS refunds even on belatedly filed returns.</li>
          </ul>
      </div>

      <h2>Simplification and Clarity</h2>
      <p>One of the primary objectives of the new bill is to reduce the complexity of the existing tax law. The text has been shortened by nearly half, and the number of sections and chapters has been significantly reduced. This is expected to streamline the tax filing process and reduce compliance burdens for individuals and businesses.</p>

      <h2>Major Changes for Taxpayers</h2>
      <p>The bill introduces several changes that will directly impact taxpayers:</p>
      <ul>
          <li><strong>Increased Tax Rebate:</strong> The income tax rebate under Section 87A for those opting for the new tax regime has been increased. Now, individuals with an income of up to ₹12 lakhs will have zero tax liability.</li>
          <li><strong>Higher Standard Deduction:</strong> The standard deduction for salaried individuals under the new tax regime has been increased from ₹50,000 to ₹75,000.</li>
          <li><strong>Enhanced Family Pension Deduction:</strong> The deduction for family pension has also been raised from ₹15,000 to ₹25,000.</li>
          <li><strong>Relief on Late Filing:</strong> In a significant move, taxpayers will now be able to claim TDS refunds even if they file their income tax returns after the statutory deadline.</li>
      </ul>

      <h2>Provisions for Businesses & Non-profits</h2>
      <p>The new bill also includes important provisions for businesses and non-profit organizations:</p>
      <ul>
          <li><strong>MSME Alignment:</strong> The bill aligns the definition of Micro, Small, and Medium Enterprises (MSMEs) with the MSME Act, ensuring consistency across different laws.</li>
          <li><strong>Loss Carry Forward:</strong> The existing provisions for carrying forward and setting off losses have been retained, providing stability for businesses.</li>
          <li><strong>Relief for Non-profits:</strong> The bill provides tax relief on anonymous donations to religious and charitable trusts, ensuring that such contributions do not affect their eligibility for tax exemptions.</li>
      </ul>
      <p class="mt-8 font-semibold">This new legislation marks a significant step towards a more efficient and equitable tax system in India. As we approach the implementation date, it is crucial for all taxpayers to understand these changes and their implications.</p>
    `
  },
  {
    id: '2',
    title: 'GST 2.0: Major Reforms on the Horizon',
    category: 'GST & Compliance',
    date: 'August 17, 2025',
    author: 'CA Sagar H R',
    readTime: '4 min read',
    slug: 'gst-reforms-2.0',
    summary: '"GST 2.0" aims to simplify the tax structure by reducing tax slabs and streamlining compliance, potentially boosting economic growth.',
    content: `
      <p>Eight years after the implementation of the Goods and Services Tax (GST), the Indian government is set to introduce a new wave of reforms, popularly known as "GST 2.0." This initiative signals a move towards a simpler and more rationalized tax structure, expected to provide significant relief to both consumers and businesses.</p>

      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>The current four-tier GST structure is likely to be replaced by a two-slab system (5% and 18%).</li>
              <li>Aims to reduce classification disputes and simplify compliance, especially for MSMEs.</li>
              <li>The reforms will address inverted duty structures, freeing up working capital for manufacturers.</li>
              <li>Expected to boost consumer demand by lowering taxes on many everyday items.</li>
          </ul>
      </div>

      <h2>Simplified Tax Slabs</h2>
      <p>The cornerstone of GST 2.0 is the proposed reduction in the number of tax slabs. The current structure of 5%, 12%, 18%, and 28% is likely to be replaced by a two-slab system: a "merit rate" of 5% for essential goods and a "standard rate" of 18% for most other items. The 12% and 28% slabs are expected to be eliminated, with items moving to the new, more streamlined rates.</p>

      <h2>Benefits for Consumers and Businesses</h2>
      <p>This rate rationalization is expected to have several positive impacts:</p>
      <ul>
          <li><strong>Reduced Tax Burden:</strong> Lowering the tax on many everyday items will increase the purchasing power of consumers and stimulate demand across the economy.</li>
          <li><strong>Simplified Compliance:</strong> A two-slab system will reduce classification disputes and simplify tax compliance for businesses, which is a significant relief for small and medium-sized enterprises.</li>
          <li><strong>Correction of Inverted Duty Structures:</strong> The reforms aim to address the long-standing issue of inverted duty structures, where the tax on inputs is higher than on the final product. This will help free up working capital for businesses and make domestic manufacturing more competitive.</li>
      </ul>

      <h2>A Boost for the Economy</h2>
      <p>By reducing compliance burdens, freeing up capital, and boosting consumer demand, GST 2.0 is poised to provide a significant impetus to the Indian economy. The reforms are expected to be discussed in the upcoming GST Council meeting and could be implemented soon.</p>
    `
  },
  {
    id: '3',
    title: 'TDS and TCS Changes from April 2025',
    category: 'Income Tax',
    date: 'August 16, 2025',
    author: 'CA Sagar H R',
    readTime: '4 min read',
    slug: 'tds-tcs-changes-2025',
    summary: 'Significant changes in TDS and TCS provisions will come into effect, aiming to reduce compliance burdens while ensuring better tax collection.',
    content: `
      <p>The Finance Bill 2025 has introduced several amendments to the Tax Deducted at Source (TDS) and Tax Collected at Source (TCS) provisions. Effective from April 1, 2025, these changes are designed to improve the ease of doing business in India.</p>

      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>TDS threshold for interest income for senior citizens doubled to ₹1,00,000.</li>
              <li>TCS threshold on overseas remittances (LRS) increased to ₹10 lakhs.</li>
              <li>No TCS on educational remittances made via loans from financial institutions.</li>
              <li>Sections 206AB and 206CCA, related to higher TDS/TCS for non-filers, will be omitted.</li>
          </ul>
      </div>

      <h2>Increased TDS Thresholds</h2>
      <p>One of the most significant changes is the increase in the threshold limits for TDS on various types of income. This will particularly benefit senior citizens and small taxpayers.</p>
      <ul>
          <li><strong>Interest Income for Senior Citizens:</strong> The threshold for TDS on interest income earned by senior citizens has been raised from ₹50,000 to ₹1,00,000.</li>
          <li><strong>Other Incomes:</strong> The threshold limits for TDS on rent payments, commissions, and other specified incomes have also been revised upwards.</li>
      </ul>

      <h2>Changes in TCS Provisions</h2>
      <p>The new rules also bring about changes in the TCS regime:</p>
      <ul>
          <li><strong>Overseas Remittances:</strong> The threshold for TCS on overseas remittances under the Liberalised Remittance Scheme (LRS) has been increased from ₹7 lakhs to ₹10 lakhs. Additionally, no TCS will be levied on remittances for education loans from financial institutions.</li>
          <li><strong>Sale of Goods:</strong> The provision for TCS on the sale of goods of a value exceeding ₹50 lakhs has been omitted, reducing the compliance burden on sellers.</li>
      </ul>

      <h2>Omission of Sections 206AB and 206CCA</h2>
      <p>To further reduce the compliance burden, Sections 206AB and 206CCA of the Income Tax Act, 1961, will be omitted from April 1, 2025. These sections previously required deductors/collectors to verify if the recipient had filed their tax returns before applying the correct withholding tax rate.</p>
    `
  },
  {
    id: '4',
    title: 'Clarity on Income from House Property',
    category: 'Real Estate Taxation',
    date: 'August 15, 2025',
    author: 'CA Sagar H R',
    readTime: '3 min read',
    slug: 'house-property-income',
    summary: 'The revised Bill has clarified key provisions related to calculating income from house property, providing much-needed clarity for taxpayers.',
    content: `
      <p>The revised Income Tax Bill, 2025, has addressed key ambiguities that existed in the original draft concerning the calculation of "Income from House Property." These clarifications will provide greater certainty for homeowners and real estate investors.</p>
      
      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>The 30% standard deduction is now explicitly calculated after deducting municipal taxes.</li>
              <li>Deduction for pre-construction interest has been extended to let-out (rented) properties.</li>
              <li>The new rules align with the existing Income Tax Act, 1961, ensuring consistency.</li>
              <li>These changes provide greater certainty for homeowners and real estate investors.</li>
          </ul>
      </div>

      <h2>Standard Deduction Calculation</h2>
      <p>The new bill now explicitly states that the 30% standard deduction on the annual value of a property is to be calculated *after* deducting the municipal taxes paid. In the original draft, it was unclear whether this deduction should be applied before or after factoring in municipal taxes. This clarification ensures consistency with the current tax law.</p>

      <h2>Pre-Construction Interest for Let-Out Properties</h2>
      <p>A significant amendment in the revised bill is the extension of the deduction for pre-construction interest to let-out (rented) properties. The initial draft had limited this deduction to self-occupied properties only. This change restores parity and aligns the new law with existing provisions, offering relief for those with rented properties.</p>

      <h2>What This Means for Homeowners</h2>
      <p>These clarifications provide much-needed certainty. The consistent application of the standard deduction and the extension of the pre-construction interest deduction to let-out properties will help taxpayers accurately calculate their tax liabilities and make informed investment decisions.</p>
    `
  },
  {
    id: '5',
    title: 'Upcoming GST Compliance Changes in 2025',
    category: 'GST & Compliance',
    date: 'August 14, 2025',
    author: 'CA Sagar H R',
    readTime: '5 min read',
    slug: 'gst-compliance-updates',
    summary: 'Businesses need to be aware of several changes, including mandatory multi-factor authentication (MFA) and enhanced e-invoicing requirements.',
    content: `
      <p>In 2025, several important GST compliance changes will be implemented. Businesses must be prepared to adapt to these new requirements to avoid penalties and ensure smooth operations.</p>

      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>Multi-Factor Authentication (MFA) will be mandatory for all GST taxpayers from April 1, 2025.</li>
              <li>E-way bills can only be generated for documents not older than 180 days.</li>
              <li>Businesses with AATO of ₹10 crores or more must report e-invoices within 30 days.</li>
              <li>Mandatory ISD registration for companies with branches in multiple states from April 1, 2025.</li>
          </ul>
      </div>

      <h2>Mandatory Multi-Factor Authentication (MFA)</h2>
      <p>To bolster the security of the GST portal, the government is introducing MFA in a phased manner:</p>
      <ul>
          <li><strong>From January 1, 2025:</strong> Mandatory for taxpayers with an Annual Aggregate Turnover (AATO) exceeding ₹200 million.</li>
          <li><strong>From February 1, 2025:</strong> Applicable to taxpayers with an AATO exceeding ₹50 million.</li>
          <li><strong>From April 1, 2025:</strong> Enforced for all taxpayers, regardless of their turnover.</li>
      </ul>

      <h2>New Rules for E-Way Bills (EWB) and E-invoicing</h2>
      <p>Several changes are being made to curb fraudulent practices and ensure timely movement of goods:</p>
      <ul>
          <li><strong>Restriction on Old Documents:</strong> Effective January 1, 2025, e-way bills will be restricted to base documents not older than 180 days.</li>
          <li><strong>Limit on EWB Extensions:</strong> The total extension period for e-way bills will be capped at 360 days from the original generation date.</li>
          <li><strong>E-invoicing Time Limit:</strong> From April 1, 2025, businesses with an AATO of ₹10 crores or more must report their e-invoices within 30 days of the invoice date.</li>
      </ul>

      <h2>Mandatory ISD Registration</h2>
      <p>Starting April 1, 2025, companies with branches in multiple states must register as an Input Service Distributor (ISD) to ensure the efficient distribution of Input Tax Credit (ITC). This is a significant change that will require affected businesses to re-evaluate their compliance processes.</p>
    `
  },
  {
    id: '6',
    title: 'S&P Upgrades India\'s Sovereign Credit Rating',
    category: 'Economic Analysis',
    date: 'August 13, 2025',
    author: 'CA Sagar H R',
    readTime: '4 min read',
    slug: 'sp-rating-upgrade',
    summary: 'S&P Global Ratings has raised India\'s long-term sovereign credit rating to "BBB" from "BBB-", citing strong economic fundamentals and growth prospects.',
    content: `
      <p>In a significant boost to the Indian economy, S&P Global Ratings has upgraded India's long-term sovereign credit rating to "BBB" from "BBB-," maintaining a stable outlook. This is the first such upgrade by the agency in 18 years.</p>
      
      <div class="summary-card">
          <h3>Key Takeaways</h3>
          <ul>
              <li>India's long-term sovereign credit rating upgraded to "BBB" with a stable outlook.</li>
              <li>The upgrade is attributed to strong economic growth, improved monetary policy, and fiscal consolidation.</li>
              <li>Expected to increase investor confidence and lower borrowing costs for the government and Indian companies.</li>
              <li>A positive signal for the Indian economy's future growth prospects.</li>
          </ul>
      </div>

      <h2>Reasons for the Upgrade</h2>
      <p>S&P cited several key factors for the upgrade:</p>
      <ul>
          <li><strong>Strong Economic Growth:</strong> India's real GDP grew by an average of 8.8% between fiscal 2022 and 2024, the fastest in the Asia-Pacific region.</li>
          <li><strong>Improved Monetary Policy:</strong> The agency praised the credibility of India's monetary policy in managing inflation and stabilizing the economy.</li>
          <li><strong>Fiscal Consolidation:</strong> S&P noted that sustained fiscal consolidation is helping to moderate the government's debt burden.</li>
      </ul>

      <h2>Impact on the Economy</h2>
      <p>This rating upgrade is expected to have a positive impact:</p>
      <ul>
          <li><strong>Increased Investor Confidence:</strong> A higher credit rating enhances the confidence of foreign investors, which can lead to increased foreign direct investment (FDI) and portfolio inflows.</li>
          <li><strong>Lower Borrowing Costs:</strong> The upgrade can reduce the cost of borrowing for both the government and Indian companies in international markets.</li>
      </ul>

      <h2>A Bright Outlook</h2>
      <p>The S&P rating upgrade is a testament to India's strong economic fundamentals and its potential for sustained growth. This development paints a bright picture for the Indian economy, positioning it as an attractive destination for global investment.</p>
    `
  }
];

export const FAQS: FAQItem[] = [
  // General & Onboarding
  {
    category: "General & Onboarding",
    question: "What is the process for engaging with your firm?",
    answer: "Our process is simple. It starts with an initial consultation to understand your needs. We then provide a clear scope of work and a fixed quote. Once you agree, we begin the onboarding process, which includes collecting necessary documents. You can find detailed checklists on our Resources page to help you prepare."
  },
  {
    category: "General & Onboarding",
    question: "Do you provide services outside of Mysuru?",
    answer: "Yes. While our office is physically located in Mysuru, we serve clients across India and internationally. Thanks to digital platforms, most tax and compliance services, including consultations, document handling, and filings, can be managed securely and efficiently online. We are equipped to assist you regardless of your location."
  },
  {
    category: "General & Onboarding",
    question: "What are your fees for your services?",
    answer: "Our fees are based on the scope and complexity of the services required. We believe in transparency and will provide a detailed, fixed quote after an initial consultation to understand your specific needs. There are no hidden charges."
  },
  
  // Income Tax & Planning
  {
    category: "Income Tax & Planning",
    question: "How do I choose between the Old and New Tax Regime?",
    answer: "The New Tax Regime offers lower tax rates but disallows most common deductions (like 80C, 80D, HRA). The Old Tax Regime has higher rates but allows you to claim these deductions. The better choice depends on your income and investment profile. We can help you with a detailed comparison to see which regime saves you more tax."
  },
  {
    category: "Income Tax & Planning",
    question: "My business is making a loss. Do I still need to file an income tax return?",
    answer: "Yes, it is highly recommended. Filing a tax return even when you have a loss allows you to carry forward that loss to future years. This means you can offset the loss against future profits, which will reduce your tax liability in profitable years."
  },
  {
    category: "Income Tax & Planning",
    question: "I've received a notice from the Income Tax Department. What should I do?",
    answer: "Do not ignore it. The first step is to carefully read the notice to understand why it was sent and the deadline for the response. We recommend you contact us immediately. We specialize in Litigation Support and can handle the entire process for you, from drafting a robust response to representing you before the tax authorities."
  },
  {
    category: "Income Tax & Planning",
    question: "How can proactive tax planning save me money?",
    answer: "Tax planning is about more than just filing returns on time. It involves strategically structuring your financial affairs throughout the year to legally minimize your tax liability. By planning ahead, you can take full advantage of all available deductions, exemptions, and rebates, ensuring you don't pay more tax than you are legally required to."
  },
  {
    category: "Income Tax & Planning",
    question: "I sold some shares/mutual funds this year. How is the profit taxed?",
    answer: "Profits from the sale of shares or mutual funds are taxed under the head 'Capital Gains'. The tax rate depends on whether the gain is short-term or long-term, which is determined by how long you held the asset. The rules can be complex, so it's important to have them calculated correctly."
  },
  {
    category: "Income Tax & Planning",
    question: "I am planning to sell a property. What are the tax implications I should be aware of beforehand?",
    answer: "The sale of a property results in capital gains, which are taxable. Key factors determining the tax are the holding period (long-term vs. short-term), the cost of acquisition, improvement costs, and the sale price. It's crucial to plan this in advance as there are several exemptions available (like re-investing in another property or specified bonds) that can significantly reduce or even nullify your tax liability. We strongly advise a consultation before you finalize the sale."
  },

  // Business & GST Compliance
  {
    category: "Business & GST Compliance",
    question: "Is GST registration mandatory for my business?",
    answer: "GST registration is mandatory for businesses whose aggregate turnover exceeds the threshold limit (currently Rs. 40 lakhs for goods and Rs. 20 lakhs for services in most states). It is also mandatory for certain other businesses regardless of turnover, such as e-commerce operators or those making inter-state sales."
  },
  {
    category: "Business & GST Compliance",
    question: "What is TDS, and am I required to deduct it?",
    answer: "TDS stands for Tax Deducted at Source. If you are making certain payments (like salary, rent, professional fees, or commission) above specified limits, you are required to deduct tax at a prescribed rate and deposit it with the government. This requirement applies to most businesses. We can help you determine your TDS obligations and manage all related compliance."
  },
  {
    category: "Business & GST Compliance",
    question: "Can you help with setting up a new company or LLP?",
    answer: "Absolutely. Our Advisory & Consulting services cover business setup and registration. We can guide you on the best legal structure for your venture and handle all the incorporation and registration formalities with the Registrar of Companies (ROC)."
  },
  {
    category: "Business & GST Compliance",
    question: "What's the benefit of professional bookkeeping if I'm a small business?",
    answer: "Professional bookkeeping provides a clear and accurate picture of your financial health. It helps you track income and expenses, make informed business decisions, manage cash flow effectively, and makes the year-end tax filing process much smoother and more accurate. It's the foundation of good financial management, regardless of business size."
  },
  {
    category: "Business & GST Compliance",
    question: "Do you also manage payroll and related compliances like PF and ESI?",
    answer: "Yes, we offer comprehensive Payroll Management services. This includes salary processing, payslip generation, and handling all statutory compliances such as Provident Fund (PF), Employee State Insurance (ESI), and TDS on salaries."
  }
];

// Resource Hub Data
export const IMPORTANT_LINKS = [
  {
    category: 'Direct Tax',
    links: [
      { name: 'Income Tax E-Filing', url: 'https://www.incometax.gov.in/' },
      { name: 'TDS (TRACES)', url: 'https://www.tdscpc.gov.in/' },
      { name: 'PAN Card Services', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' }
    ]
  },
  {
    category: 'Indirect Tax',
    links: [
      { name: 'GST Portal', url: 'https://www.gst.gov.in/' },
      { name: 'E-Way Bill Portal', url: 'https://ewaybillgst.gov.in/' },
      { name: 'E-Invoicing Portal', url: 'https://einvoice1.gst.gov.in/' }
    ]
  },
  {
    category: 'Registrations & Payroll',
    links: [
      { name: 'MCA Portal', url: 'https://www.mca.gov.in/' },
      { name: 'MSME (Udyam) Registration', url: 'https://udyamregistration.gov.in/' },
      { name: 'EPFO Portal', url: 'https://unifiedportal-emp.epfindia.gov.in/' },
      { name: 'ESIC Portal', url: 'https://www.esic.gov.in/' }
    ]
  }
];

export const COMPLIANCE_CALENDAR = {
  "April 2025": [ { day: 7, desc: "TDS/TCS Payment for March", cat: "tds" }, { day: 10, desc: "GSTR-7 & GSTR-8 (Mar)", cat: "gst" }, { day: 11, desc: "GSTR-1 (Monthly, Mar)", cat: "gst" }, { day: 13, desc: "GSTR-1 (QRMP, Jan-Mar)", cat: "gst" }, { day: 15, desc: "PF & ESI Payment (Mar)", cat: "payroll" }, { day: 18, desc: "CMP-08 (Jan-Mar)", cat: "gst" }, { day: 20, desc: "GSTR-3B (Monthly, Mar)", cat: "gst" }, { day: 22, desc: "GSTR-3B (QRMP, Jan-Mar)", cat: "gst" }, { day: 30, desc: "GSTR-4 (Annual, FY 24-25)", cat: "gst" }, { day: 30, desc: "Form 11 (LLP Annual Return)", cat: "roc" } ],
  "May 2025": [ { day: 7, desc: "TDS/TCS Payment (Apr)", cat: "tds" }, { day: 11, desc: "GSTR-1 (Monthly, Apr)", cat: "gst" }, { day: 15, desc: "TDS Quarterly Return (Q4, FY 24-25)", cat: "tds" }, { day: 15, desc: "PF & ESI Payment (Apr)", cat: "payroll" }, { day: 20, desc: "GSTR-3B (Monthly, Apr)", cat: "gst" } ],
  "June 2025": [ { day: 7, desc: "TDS/TCS Payment (May)", cat: "tds" }, { day: 15, desc: "Advance Tax (1st Installment)", cat: "it" }, { day: 30, desc: "DPT-3 (Return of Deposits)", cat: "roc" } ],
  "July 2025": [ { day: 15, desc: "TCS Quarterly Return (Q1)", cat: "tds" }, { day: 31, desc: "TDS Quarterly Return (Q1)", cat: "tds" } ],
  "August 2025": [ { day: 7, desc: "TDS/TCS Payment (Jul)", cat: "tds" }, { day: 11, desc: "GSTR-1 (Monthly, Jul)", cat: "gst" }, { day: 14, desc: "Form 16/16A (Q1)", cat: "tds" }, { day: 20, desc: "GSTR-3B (Monthly, Jul)", cat: "gst" } ],
  "September 2025": [ { day: 15, desc: "Advance Tax (2nd Installment)", cat: "it" }, { day: 30, desc: "ITR Filing (Non-Audit)", cat: "it" }, { day: 30, desc: "Tax Audit Report Filing", cat: "it" } ],
  "October 2025": [ { day: 31, desc: "ITR Filing (Audit Cases)", cat: "it" }, { day: 31, desc: "Form 8 (LLP)", cat: "roc" } ],
  "November 2025": [ { day: 14, desc: "Form 16/16A (Q2)", cat: "tds" }, { day: 15, desc: "TDS Quarterly Return (Q2)", cat: "tds" }, { day: 29, desc: "Form AOC-4 (Company)", cat: "roc" } ],
  "December 2025": [ { day: 15, desc: "Advance Tax (3rd Installment)", cat: "it" }, { day: 31, desc: "Belated/Revised ITR (FY 24-25)", cat: "it" }, { day: 31, desc: "GSTR-9 & 9C (Annual)", cat: "gst" } ],
  "January 2026": [ { day: 15, desc: "TCS Quarterly Return (Q3)", cat: "tds" }, { day: 31, desc: "TDS Quarterly Return (Q3)", cat: "tds" } ],
  "February 2026": [ { day: 14, desc: "Form 16/16A (Q3)", cat: "tds" } ],
  "March 2026": [ { day: 15, desc: "Advance Tax (Final Installment)", cat: "it" }, { day: 31, desc: "Updated Return (ITR-U) for FY 22-23", cat: "it" } ]
};

export const CHECKLIST_DATA: Record<string, { title: string, subtitle: string, sections: { title: string, items: string[] }[] }> = {
  'new-client': {
    title: 'New Client Onboarding',
    subtitle: 'Welcome! Please provide these documents to help us get started smoothly.',
    sections: [
      {
        title: 'Business Information (If Applicable)',
        items: [
          'Copy of <b>PAN Card</b> of the Business',
          'Copy of <b>Certificate of Incorporation</b> / Partnership Deed',
          'Copy of <b>GST Registration</b> Certificate',
          '<b>Address Proof</b> of Business Premises (e.g., Electricity Bill)',
          'Login credentials for <b>Income Tax & GST Portals</b>'
        ]
      },
      {
        title: 'Key Individuals',
        items: [
          'Copy of <b>PAN & Aadhaar Cards</b> for all key individuals',
          '<b>Contact Number and Email ID</b> for the primary contact'
        ]
      },
      {
        title: 'Financial Information',
        items: [
          '<b>Bank Statements</b> for all business accounts (last financial year)',
          'Details of all existing <b>loans and borrowings</b>',
          'Access to existing <b>accounting software</b>, if any'
        ]
      }
    ]
  },
  'salaried': {
    title: 'Checklist for Salaried Individuals',
    subtitle: 'For FY 2024-25 (AY 2025-26). Covers salary and rental income.',
    sections: [
      {
        title: 'Basic Information',
        items: [
          'Your <b>Income Tax Login ID and Password</b>',
          'Copy of your <b>PAN Card and Aadhaar Card</b>',
          'Your primary <b>Mobile Number and Email ID</b>',
          'List of all operative <b>bank accounts</b> with IFSC codes'
        ]
      },
      {
        title: 'Income & Deductions',
        items: [
          '<b>Form 16</b>: From all employers if you changed jobs',
          '<b>Salary Arrears</b>: If received, please provide Form 10E',
          '<b>Bank Statements</b>: For all savings and salary accounts',
          '<b>Other Income</b>: Details of interest on savings/FDs',
          '<b>Foreign Income/Assets</b>: Details of any foreign assets or income',
          '<b>Proofs for Tax-Saving Deductions (Old Regime)</b>: 80C (LIC, PPF, etc.), Home Loan Interest, HRA Rent Receipts, 80D (Medical), 80G (Donations)'
        ]
      },
      {
        title: 'Income from House Property',
        items: [
          '<b>Rental Agreements</b> for all rented-out properties',
          '<b>Municipal Tax Receipts</b>',
          '<b>Co-owner\'s Details</b> (Name, PAN, and ownership share %)',
          '<b>Home Loan Certificate</b> for the rented property'
        ]
      }
    ]
  },
  'capital-gains': {
    title: 'Checklist for Capital Gains',
    subtitle: 'For FY 2024-25 (AY 2025-26). For sale of property, shares, or mutual funds.',
    sections: [
      {
        title: 'Sale of Property',
        items: [
          '<b>Sale Deed & Purchase Deed</b> of the property',
          '<b>Co-owner Details</b>: Name, PAN, and ownership share %',
          '<b>Stamp Duty Value</b> (Circle Rate) for both purchase and sale',
          'Bills/invoices for any <b>Improvement Costs</b>',
          'Invoices for <b>Sale Expenses</b> (e.g., brokerage)',
          'Proof of <b>Re-investment for Tax Exemption</b> (e.g., new house deed, 54EC bonds)'
        ]
      },
      {
        title: 'Sale of Shares / Mutual Funds',
        items: [
          '<b>Broker\'s P&L and Capital Gains Statement</b> (consolidated)',
          '<b>Mutual Fund Capital Gains Statement</b> (from AMCs or CAMS/KFintech)',
          'Details of any <b>inherited/gifted</b> shares or off-market sales',
          '<b>FMV Details</b>: Fair Market Value as on Jan 31, 2018 for shares bought prior',
          'Details of any <b>capital losses</b> from previous years to be carried forward'
        ]
      }
    ]
  },
  'business-presumptive': {
    title: 'Checklist for Business (Presumptive)',
    subtitle: 'For FY 2024-25 (AY 2025-26). For businesses/professions under Sec 44AD / 44ADA.',
    sections: [
      {
        title: 'Financial Details',
        items: [
          '<b>Bank Statements</b> for all business-related accounts',
          '<b>Turnover Summary</b> (Gross Receipts), with Bank vs. Cash breakdown',
          'Copies of any <b>Advance Tax</b> challans paid',
          'Statements for any <b>Business Loans</b>',
          'Details of any personal <b>Tax-Saving Investments</b> (LIC, PPF, etc.)'
        ]
      },
      {
        title: 'Year-End Figures (as on March 31st)',
        items: [
          'Amount of Sundry Creditors',
          'Amount of Sundry Debtors',
          'Value of Closing Stock',
          'Cash-in-hand Balance'
        ]
      }
    ]
  },
  'business-audit': {
    title: 'Checklist for Business (Tax Audit)',
    subtitle: 'For FY 2024-25 (AY 2025-26). For businesses subject to tax audit under Sec 44AB.',
    sections: [
      {
        title: 'Core Financials & Books of Accounts',
        items: [
          '<b>Complete Books of Accounts</b> (Bank Statements, Sales & Purchase Registers, Ledgers, etc.)',
          'Finalized <b>Financial Statements</b> (Trial Balance, P&L, Balance Sheet)',
          'Previous year\'s <b>Audited Financials and Tax Audit Report</b>',
          'A <b>Fixed Asset Register</b> with details of additions/disposals',
          '<b>Loan statements</b> for all secured and unsecured loans'
        ]
      },
      {
        title: 'Compliance & Disclosures',
        items: [
          '<b>Statutory Dues (Sec 43B)</b>: Proof of payment for GST, PF, ESI, etc.',
          '<b>TDS/TCS Compliance</b>: Copies of all returns filed and details of any delayed deposits',
          '<b>Expenditure Details</b>: Note of personal expenses, related party transactions, and single cash payments > ₹10,000',
          '<b>GST Details for Clause 44</b>: Breakup of total expenditure (GST registered vs. unregistered entities)'
        ]
      }
    ]
  },
  'gst': {
    title: 'Checklist for GST Filings',
    subtitle: 'Data for monthly (GSTR-1, 3B) and annual (GSTR-9) returns.',
    sections: [
      {
        title: 'For Monthly Returns (GSTR-1 & 3B)',
        items: [
          '<b>Sales Data</b>: All sales invoices, credit/debit notes, and summary of exempt/nil-rated sales',
          '<b>Purchase & ITC Data</b>: All purchase invoices for claiming ITC (reconciled with GSTR-2B)',
          '<b>Payment Data</b>: Details of tax paid under RCM and copies of any cash challans'
        ]
      },
      {
        title: 'For Annual Return (GSTR-9)',
        items: [
          'Finalized / Audited <b>Profit & Loss Account and Balance Sheet</b>',
          'A consolidated <b>reconciliation of sales, purchases, and ITC</b> (books vs. returns)',
          'An <b>HSN-wise summary</b> of all your sales',
          'A detailed <b>breakdown of ITC claimed</b> into Inputs, Input Services, and Capital Goods',
          'Details of any <b>GST notices, orders, or refunds</b> processed during the year'
        ]
      }
    ]
  }
};