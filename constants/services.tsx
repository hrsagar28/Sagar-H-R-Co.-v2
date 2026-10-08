import type { ServiceGroup, ServiceItem, ServicePage } from '../types';

// 2026 redesign: the fourteen service pages (/services/:slug), the groups they
// are listed under on /services, and the kinds of client the firm works with.
// Written in a formal register, and within the ICAI's rules for members'
// websites: factual descriptions only, with no fees, testimonials or claims of
// specialisation. Statutory references are to the Income-tax Act, 2025, in
// force from 1 April 2026.

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'gst',
    name: 'GST',
    ask: 'GST',
    who: 'For businesses registered under GST, or required to register.',
    tags: ['Registration', 'Monthly and quarterly returns', 'Input tax credit', 'Annual return'],
    frequency: 'Monthly or quarterly, and annually',
    intro: 'Registration, periodic and annual returns, and replies to communications from the GST department.',
    incdesc:
      'Returns and reconciliations are usually handled on a yearly retainer. Registration and refund claims may be taken up as single assignments.',
    inc: [
      [
        'Registration',
        'Application for GST registration, replies to the officer’s queries, and later amendments such as additional places of business.',
      ],
      [
        'Monthly and quarterly returns',
        'Preparation of GSTR-1 and GSTR-3B from your sales and purchase records, computation of the tax payable, and filing by the due dates.',
      ],
      [
        'Input tax credit',
        'A monthly reconciliation of purchases with GSTR-2B, follow-up with suppliers whose invoices are missing, and a claim limited to the credit you are entitled to.',
      ],
      [
        'Annual return',
        'Preparation of GSTR-9, and of the GSTR-9C reconciliation statement where turnover exceeds ₹5 crore.',
      ],
      [
        'E-invoices, e-way bills and refunds',
        'Setting up e-invoicing where your turnover requires it, and refund claims for exports and for an inverted duty structure.',
      ],
      [
        'Notices and cancelled registrations',
        'Replies to scrutiny and show cause notices, and applications to revoke the cancellation of a registration. Appeals are covered under {notices-and-appeals|Notices and appeals}.',
      ],
    ],
    needs: [
      'For registration: PAN and Aadhaar of the proprietor, partners or directors, a photograph, proof of the business premises and bank account details.',
      'Each month: sales invoices and purchase bills, or access to your accounting software.',
      'Your GST portal login, if you are already registered.',
      'Any notice from the department, as soon as it is received.',
    ],
    faqIds: ['gst-registration-mandatory', 'gst-returns', 'itc-mismatch'],
  },
  {
    slug: 'income-tax',
    name: 'Income tax',
    ask: 'income tax',
    who: 'For salaried individuals, pensioners, professionals, businesses, firms, companies and trusts.',
    tags: ['Income tax returns', 'Capital gains', 'Advance tax', 'Refunds and rectifications'],
    frequency: 'Annually, with advance tax each quarter',
    intro:
      'Income tax returns for individuals, firms, companies and trusts, together with advance tax and capital gains computations.',
    incdesc: 'Under the Income-tax Act, 2025, in force from 1 April 2026.',
    inc: [
      [
        'Income tax returns',
        'Returns for salaried individuals, pensioners, professionals, businesses, firms, companies and trusts, checked against your Annual Information Statement before filing.',
      ],
      [
        'Choice of tax regime',
        'A computation of your tax under both the old and the new regime, so you can see which costs less.',
      ],
      [
        'Capital gains',
        'Computation of gains on shares, mutual funds and property, and of the exemptions available. Where a property is to be sold, we recommend consulting us before the agreement is signed.',
      ],
      [
        'Advance tax',
        'An estimate of the tax for the year, with reminders before each instalment on 15 June, 15 September, 15 December and 15 March.',
      ],
      [
        'Refunds and rectifications',
        'Follow-up on delayed refunds, and applications to rectify errors in the processing of your return.',
      ],
      [
        'TDS and NRI taxation',
        'Tax deduction on payments you make, and the taxation of non-residents, are covered under {tds-and-tcs|TDS and TCS} and {nri-taxation|NRI taxation}.',
      ],
    ],
    needs: [
      'PAN, Aadhaar and your income tax portal login.',
      'The TDS certificate from your employer, interest certificates from your bank, and capital gains statements from your broker or fund house.',
      'Proof of the investments and payments for which deductions are claimed, if you opt for the old regime.',
      'For a business or profession: books of account, or bank statements for the year.',
    ],
    faqIds: ['old-vs-new-tax-regime', 'shares-mutual-funds-taxation', 'missed-due-date'],
  },
  {
    slug: 'tds-and-tcs',
    name: 'TDS and TCS',
    ask: 'TDS and TCS',
    who: 'For businesses, firms, companies and trusts that pay salaries, rent, professional fees or contractors.',
    tags: ['Quarterly returns', 'Correction statements', 'Lower deduction certificates', 'TRACES defaults'],
    frequency: 'Monthly and quarterly',
    intro:
      'Determining the tax to be deducted or collected, filing the quarterly returns and certificates, and clearing defaults shown on TRACES.',
    incdesc:
      'Under the Income-tax Act, 2025. TDS on salaries is also handled under {bookkeeping-and-payroll|Bookkeeping and payroll}.',
    inc: [
      [
        'Applicability and rates',
        'A review of the payments you make, such as salaries, rent, professional fees, commission and contract payments, to determine where tax must be deducted and at what rate.',
      ],
      ['Quarterly returns', 'Filing of the quarterly TDS and TCS returns, and issue of certificates to the payees.'],
      [
        'TCS',
        'Collection of tax on the sales to which it applies, such as motor vehicles valued above ₹10 lakh and scrap.',
      ],
      [
        'Purchase of property',
        'Deduction and payment of TDS on the purchase of immovable property, and the certificate for the seller. Different rules apply where the seller is a non-resident; see {nri-taxation|NRI taxation}.',
      ],
      [
        'Corrections and defaults',
        'Correction statements where a PAN, amount or challan has been reported wrongly, and resolution of short deduction, late payment and late filing defaults shown on TRACES.',
      ],
      [
        'Lower deduction certificates',
        'Applications for a certificate of lower or nil deduction where the tax deducted from your receipts would exceed your expected liability.',
      ],
    ],
    needs: [
      'Your TAN and TRACES login. If you do not have a TAN, we apply for one.',
      'Each month: details of payments made, with the PAN of each payee.',
      'Challans for tax already deposited.',
      'For a property purchase: the sale agreement and the seller’s PAN.',
    ],
    faqIds: ['tds-obligation', 'tds-late-payment'],
  },
  {
    slug: 'nri-taxation',
    name: 'NRI taxation',
    ask: 'NRI taxation',
    who: 'For non-resident Indians with income, property or investments in India.',
    tags: ['Residential status', 'Returns in India', 'Sale of property', 'Remittances abroad'],
    frequency: 'Annually, and on the sale of property or a remittance abroad',
    intro:
      'Indian tax returns for non-residents, the taxation of property sales in India, and the documentation for remitting funds abroad.',
    incdesc: 'The work can be carried out entirely by email and video call.',
    inc: [
      [
        'Residential status',
        'Determination of your residential status for the year from the days spent in India, which decides the extent to which your income is taxable here.',
      ],
      [
        'Returns in India',
        'Returns for rent, interest, capital gains and other income arising in India, with credit for tax already deducted.',
      ],
      [
        'Sale of property in India',
        'Computation of capital gains, the TDS to be deducted by the buyer, and an application for a lower deduction certificate where appropriate.',
      ],
      [
        'Remittances abroad',
        'The Chartered Accountant’s certificate required by your bank to remit funds from your NRO account, within the limit of US$1 million per financial year.',
      ],
      [
        'Tax treaty relief',
        'Claims under India’s tax treaty with your country of residence, supported by a tax residency certificate, so that the same income is not taxed twice.',
      ],
      [
        'Notices',
        'Replies to income tax notices concerning your Indian income. Appeals are covered under {notices-and-appeals|Notices and appeals}.',
      ],
    ],
    needs: [
      'Dates of travel to and from India during the year, or copies of the relevant passport pages.',
      'PAN and your income tax portal login.',
      'NRO and NRE account statements and interest certificates.',
      'For a property sale: the sale agreement, and the purchase deed showing the cost of acquisition.',
      'A tax residency certificate from your country of residence, where treaty relief is claimed.',
    ],
    faqIds: ['nri-return-filing', 'nri-property-sale-tds', 'services-outside-mysuru'],
  },
  {
    slug: 'notices-and-appeals',
    name: 'Notices and appeals',
    ask: 'a notice or appeal',
    who: 'For those who have received a notice or an order from the Income Tax or GST department.',
    tags: ['Income tax notices', 'GST notices', 'Personal hearings', 'Appeals to the tribunals'],
    frequency: 'As notices or orders are received',
    intro: 'Replies to income tax and GST notices, and appeals against adverse orders, up to the Appellate Tribunals.',
    incdesc:
      'Time limits for replies and appeals are short. Please send us the notice or order as soon as it is received.',
    inc: [
      [
        'Review of the notice',
        'An explanation of what the notice requires, the period it covers and the date by which a reply is due.',
      ],
      [
        'Income tax notices',
        'Replies to scrutiny, reassessment and other notices, in faceless proceedings or before the assessing officer.',
      ],
      [
        'GST notices',
        'Replies to scrutiny notices (ASMT-10), intimations before a demand (DRC-01A) and show cause notices (DRC-01), with supporting documents.',
      ],
      ['Personal hearings', 'Representation at personal hearings, by video conference or in person.'],
      [
        'Appeals',
        'First appeals under income tax and GST, and second appeals before the Income Tax Appellate Tribunal and the GST Appellate Tribunal.',
      ],
      [
        'Stay of demand',
        'Applications for a stay where the department proceeds to recover a disputed demand while the appeal is pending.',
      ],
    ],
    needs: [
      'The notice or order, and the date on which it was received.',
      'The return or GST returns to which it relates.',
      'Your portal login, to view the proceedings and file the reply.',
      'Any earlier replies and documents submitted to the department.',
    ],
    faqIds: ['income-tax-notice', 'appeal-against-order', 'gst-registration-cancelled'],
  },
  {
    slug: 'audit',
    name: 'Audit and assurance',
    ask: 'audit and assurance',
    who: 'For companies, businesses liable to tax audit, and trusts and institutions.',
    tags: ['Statutory audits', 'Tax audits', 'Trusts and institutions', 'Internal audits'],
    frequency: 'Annually',
    intro: 'Statutory and tax audits, and audits of trusts, societies and educational institutions.',
    incdesc: 'Audits are conducted in accordance with the Standards on Auditing issued by the ICAI.',
    inc: [
      [
        'Statutory audit of companies',
        'The annual audit required of every company under the Companies Act, 2013, and our report on its financial statements.',
      ],
      [
        'Tax audit',
        'For businesses and professionals whose turnover or gross receipts exceed the limits laid down in the Income-tax Act, with the audit report filed online before the return.',
      ],
      [
        'Trusts, societies and institutions',
        'Audits of trusts and societies whose exemption or registration requires audited accounts, including schools and colleges run by educational trusts.',
      ],
      [
        'Internal audit',
        'Periodic review of purchases, payments, stock and internal controls, reported to the proprietor, partners or board.',
      ],
      [
        'Certificates',
        'Net worth, turnover, grant utilisation and other certificates are covered under {certificates|Certificates}.',
      ],
      [
        'Change of auditor',
        'ICAI rules require an incoming auditor to communicate with the previous auditor before accepting the appointment. We complete this before the audit begins.',
      ],
    ],
    needs: [
      'Books of account for the year, with bank statements and supporting vouchers.',
      'Details of stock and fixed assets as at the year end.',
      'The previous year’s audited financial statements and audit report.',
      'For a company: minutes of board meetings and the statutory registers.',
    ],
    faqIds: ['tax-audit-applicability', 'switching-ca', 'trust-annual-compliance'],
  },
  {
    slug: 'certificates',
    name: 'Certificates',
    ask: 'a certificate',
    who: 'For individuals and businesses asked by a bank, government department, embassy or funding body for a certificate from a Chartered Accountant.',
    tags: ['Net worth and turnover', 'Foreign remittances', 'Grant utilisation', 'Certificates for banks'],
    frequency: 'As required',
    intro:
      'Certificates issued by a Chartered Accountant for banks, government departments, embassies and funding bodies.',
    incdesc:
      'Every certificate we issue carries a Unique Document Identification Number (UDIN), which can be verified on the ICAI’s website.',
    inc: [
      ['Net worth and turnover', 'Certificates for bank loans, tenders, visa applications and contracts.'],
      [
        'Foreign remittances',
        'The certificate your bank requires before remitting funds outside India, for business payments or from an NRO account.',
      ],
      [
        'Grant and subsidy utilisation',
        'Certificates of how a grant or subsidy has been spent, in the format prescribed by the scheme or funding body.',
      ],
      [
        'Certificates for banks',
        'Certificates on the end use of loan funds, stock and book debt statements, and other certificates required during the term of a loan.',
      ],
      [
        'Statutory certificates',
        'Certificates that a law or authority requires a Chartered Accountant to issue, such as for GST refund claims and company filings.',
      ],
      [
        'Verification',
        'We certify only figures that we have verified against your books of account and supporting documents, as ICAI rules require.',
      ],
    ],
    needs: [
      'The prescribed format, or the letter from the authority requesting the certificate.',
      'Books of account, bank statements and documents supporting each figure.',
      'For a net worth certificate: a statement of assets and liabilities, with supporting documents such as property records and account statements.',
    ],
    faqIds: ['udin-verification', 'net-worth-certificate'],
  },
  {
    slug: 'company-law',
    name: 'Company law and ROC',
    ask: 'company law and ROC filings',
    who: 'For private limited companies, one person companies, section 8 companies and producer companies.',
    tags: ['Incorporation', 'Annual ROC filings', 'Changes in directors and capital', 'Closure of a company'],
    frequency: 'Annually, and as changes occur',
    intro:
      'Incorporation of companies, annual filings with the Registrar of Companies, and the filings that follow changes during the year.',
    incdesc:
      'Under the Companies Act, 2013. LLPs are covered under {partnership-firms-and-llps|Partnership firms and LLPs}.',
    inc: [
      [
        'Incorporation',
        'Name approval, documentation and incorporation of private limited companies, one person companies and section 8 (non-profit) companies.',
      ],
      [
        'Annual filings',
        'Financial statements in Form AOC-4 and the annual return in Form MGT-7 or MGT-7A, after the annual general meeting.',
      ],
      [
        'Changes during the year',
        'Appointment or resignation of directors, change of registered office, increase in capital, and directors’ KYC.',
      ],
      [
        'Meetings and registers',
        'Notices, minutes and resolutions for board and general meetings, and maintenance of the statutory registers.',
      ],
      [
        'Producer companies',
        'Annual filings for farmer producer companies, which are governed by a separate chapter of the Companies Act.',
      ],
      [
        'Closure of a company',
        'Completion of pending filings, and an application to the Registrar to strike off the company’s name.',
      ],
    ],
    needs: [
      'Digital signature certificates (DSC) of the directors.',
      'For incorporation: PAN, Aadhaar, photographs and address proof of the directors and shareholders, and proof of the registered office.',
      'For annual filings: the audited financial statements and the dates of the board and general meetings.',
    ],
    faqIds: ['company-or-llp-setup', 'roc-annual-filings', 'close-company-llp'],
  },
  {
    slug: 'partnership-firms-and-llps',
    name: 'Partnership firms and LLPs',
    ask: 'partnership firms and LLPs',
    who: 'For partnership firms and limited liability partnerships (LLPs).',
    tags: ['Partnership deeds', 'Admission and retirement of partners', 'LLP incorporation', 'LLP annual filings'],
    frequency: 'Annually, and on changes in partners',
    intro:
      'Partnership deeds and LLP agreements, changes on the admission or retirement of partners, and the annual LLP filings.',
    incdesc: 'Under the Indian Partnership Act, 1932 and the Limited Liability Partnership Act, 2008.',
    inc: [
      [
        'Partnership deeds',
        'Drafting of the partnership deed, and registration of the firm with the Registrar of Firms.',
      ],
      [
        'Admission and retirement of partners',
        'Supplementary deeds, settlement of capital accounts, intimation to the Registrar of Firms, and amendment of the firm’s GST registration and bank records.',
      ],
      ['LLP incorporation', 'Name approval, incorporation and the LLP agreement.'],
      [
        'LLP annual filings',
        'The annual return in Form 11 by 30 May, and the statement of accounts and solvency in Form 8 by 30 October.',
      ],
      [
        'Changes in an LLP',
        'Changes in partners, contribution or registered office, with the amended agreement and the related filings.',
      ],
      [
        'Closure of an LLP',
        'Completion of pending filings, and an application to the Registrar to strike off the LLP’s name.',
      ],
    ],
    needs: [
      'PAN, Aadhaar and address proof of each partner.',
      'Digital signature certificates (DSC) of the designated partners, for an LLP.',
      'The existing partnership deed or LLP agreement, if any.',
      'Proof of the business premises.',
    ],
    faqIds: ['partner-change', 'company-or-llp-setup', 'roc-annual-filings'],
  },
  {
    slug: 'trusts-and-npos',
    name: 'Trusts and NPOs',
    ask: 'trusts and NPOs',
    who: 'For charitable, religious and educational trusts, societies and section 8 companies.',
    tags: ['Registration for exemption', 'Approval for donors', 'Renewals', 'Annual audit and filings'],
    frequency: 'Annually, with renewal every five or ten years',
    intro:
      'Registration for tax exemption and donor deductions, timely renewals, and the annual audit and filings on which the exemption depends.',
    incdesc: 'For trusts, societies and section 8 companies, under the Income-tax Act, 2025.',
    inc: [
      ['Formation', 'Trust deeds, the memorandum and bye-laws of societies, registration and PAN.'],
      [
        'Registration for exemption',
        'Registration under section 332 of the Income-tax Act, 2025 (earlier sections 12A and 12AB): provisional registration first, followed by regular registration once activities have begun.',
      ],
      [
        'Approval for donors',
        'Approval under section 354 (earlier section 80G), which allows donors to claim a deduction for their donations.',
      ],
      [
        'Renewals',
        'Regular registration is valid for five years, or ten years where total income has not exceeded ₹5 crore in each of the two preceding years. We track the validity dates and apply for renewal in time.',
      ],
      [
        'Annual audit and filings',
        'The audit report in Form 112 (earlier Forms 10B and 10BB), the income tax return, statements of accumulation and of donations received, and certificates for donors.',
      ],
      [
        'Filings with the Registrar',
        'Annual filing of a society’s accounts and report with the Registrar of Societies, where its registration requires it.',
      ],
    ],
    needs: [
      'The trust deed, or the memorandum and bye-laws of the society, with the registration certificate.',
      'PAN of the organisation and details of the trustees or members.',
      'Books of account, bank statements, donation receipts and grant details for the year.',
      'Current registration and approval orders under the Income-tax Act, with their validity dates.',
    ],
    faqIds: ['trust-registration', 'trust-annual-compliance'],
  },
  {
    slug: 'advisory',
    name: 'Business advisory',
    ask: 'business advisory',
    who: 'For those starting a business or planning its expansion.',
    tags: ['Choice of structure', 'Registrations', 'Projections and budgets', 'Advice on major decisions'],
    frequency: 'As required',
    intro:
      'Advice for those starting or expanding a business: the choice of structure, the registrations required, and the financial effect of major decisions.',
    incdesc: 'Usually undertaken as a single assignment.',
    inc: [
      [
        'Choice of structure',
        'A comparison of a proprietorship, partnership, LLP and company in terms of tax, compliance and liability, for your plans.',
      ],
      [
        'Registrations',
        'GST, professional tax, shop and establishment and the import-export code, and PF and ESI once you employ staff.',
      ],
      [
        'Projections and budgets',
        'Cash flow forecasts and budgets for a new branch, a new product line or a major purchase.',
      ],
      [
        'Advice on major decisions',
        'The tax and cash flow effect of a major purchase, an expansion or a change in the owners’ remuneration, worked out before you decide.',
      ],
      [
        'Related services',
        'Deeds are covered under {partnership-firms-and-llps|Partnership firms and LLPs}, bank finance under {bank-loans-and-project-reports|Bank loans and project reports}, and Udyam registration and grants under {startup-and-grant-support|Startup and grant support}.',
      ],
    ],
    needs: [
      'An outline of the proposed business, the expected investment and the proposed owners.',
      'PAN, Aadhaar and address proof of the owners, for registrations.',
      'For projections: financial statements for the last two or three years, if the business is already running.',
    ],
    faqIds: ['company-or-llp-setup', 'engagement-process', 'service-fees'],
  },
  {
    slug: 'bank-loans-and-project-reports',
    name: 'Bank loans and project reports',
    ask: 'bank loans and project reports',
    who: 'For businesses applying for a term loan or a working capital limit, or renewing one.',
    tags: ['Project reports', 'CMA data', 'Provisional accounts', 'Projections'],
    frequency: 'At application and at each renewal',
    intro:
      'The project report, CMA data and financial statements a bank requires for a new loan or the renewal of a limit.',
    incdesc: 'Prepared from your books of account, in the formats banks require.',
    inc: [
      [
        'Project reports',
        'For a new unit or an expansion: the cost of the project, the means of finance, and projected profitability and cash flow over the term of the loan.',
      ],
      [
        'CMA data',
        'Credit monitoring arrangement data, required by banks for the sanction or renewal of working capital limits.',
      ],
      [
        'Provisional and projected accounts',
        'Financial statements for the current year to date, and projections for the years ahead, prepared from your books.',
      ],
      [
        'Repayment ratios',
        'The debt service coverage ratio and the other ratios banks assess, computed before the application is made.',
      ],
      [
        'Certificates for the bank',
        'Net worth and other certificates required for a loan are covered under {certificates|Certificates}.',
      ],
    ],
    needs: [
      'The amount and purpose of the loan.',
      'Quotations for plant and machinery, buildings or vehicles.',
      'Financial statements and income tax returns for the last three years, if the business is already running.',
      'Any formats prescribed by the bank.',
    ],
    faqIds: ['project-report-contents', 'cma-data'],
  },
  {
    slug: 'startup-and-grant-support',
    name: 'Startup and grant support',
    ask: 'startup and grant support',
    who: 'For startups and small businesses applying for government recognition, registrations and grants.',
    tags: ['Udyam registration', 'Startup recognition', 'State grants', 'Utilisation certificates'],
    frequency: 'At application and at each grant milestone',
    intro:
      'Udyam registration, startup recognition, and the applications and certificates required under government grant schemes.',
    incdesc: 'For newly formed companies, LLPs and firms.',
    inc: [
      [
        'Udyam registration',
        'Registration as a micro, small or medium enterprise, which many government schemes and banks require.',
      ],
      [
        'Startup recognition',
        'Recognition under the Startup India scheme and, where eligible, the application for the startup tax exemption.',
      ],
      ['State grants', 'Applications and progress reporting under Karnataka government schemes such as Elevate.'],
      [
        'Utilisation certificates',
        'Statements of grant expenditure, and the certificates required for each release of funds.',
      ],
      [
        'Accounts and compliance',
        'Bookkeeping, GST and ROC filings in the early years, so that grant releases are not delayed by incomplete records.',
      ],
    ],
    needs: [
      'The certificate of incorporation or registration, and PAN.',
      'A brief description of the business.',
      'For a grant: the sanction letter and its conditions.',
      'Bills and bank statements for expenditure from the grant.',
    ],
    faqIds: ['udyam-registration', 'utilisation-certificate', 'company-or-llp-setup'],
  },
  {
    slug: 'bookkeeping-and-payroll',
    name: 'Bookkeeping and payroll',
    ask: 'bookkeeping and payroll',
    who: 'For businesses that require their books of account and payroll to be maintained every month.',
    tags: ['Monthly bookkeeping', 'Reconciliations', 'Salaries and payslips', 'PF, ESI and TDS returns'],
    frequency: 'Monthly',
    intro: 'Monthly maintenance of your books of account, and processing of salaries with PF, ESI and TDS compliance.',
    incdesc: 'In Tally or Zoho Books, on a monthly retainer.',
    inc: [
      ['Bookkeeping', 'Monthly accounting entries from your bank statements, sales invoices and purchase bills.'],
      [
        'Reconciliations',
        'Monthly reconciliation of bank, GST, TDS and party balances, so that differences are found and cleared each month.',
      ],
      [
        'Monthly reports',
        'A monthly or quarterly profit and loss account, with statements of amounts receivable and payable.',
      ],
      [
        'Year-end accounts',
        'Closing entries, depreciation and the final accounts, ready for the income tax return or the audit.',
      ],
      ['Salaries', 'Monthly salary computation and payslips, with deductions for PF, ESI, professional tax and TDS.'],
      [
        'Payroll returns',
        'PF and ESI returns, professional tax, quarterly TDS returns on salaries, and annual TDS certificates for employees.',
      ],
    ],
    needs: [
      'Bank statements, sales invoices and purchase bills each month, or access to your accounting software.',
      'For each employee: date of joining, salary structure, PAN, Aadhaar and bank account details.',
      'Monthly attendance and leave records.',
      'PF, ESI and professional tax portal logins, if registered.',
    ],
    faqIds: ['bookkeeping-payroll', 'tds-obligation', 'communication-document-sharing'],
  },
];

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    name: 'Tax',
    description:
      'Returns, tax deduction and representation before the department, for individuals, non-residents and businesses.',
    slugs: ['gst', 'income-tax', 'tds-and-tcs', 'nri-taxation', 'notices-and-appeals'],
  },
  {
    name: 'Audit and certificates',
    description: 'Statutory, tax and institutional audits, and certificates issued by a Chartered Accountant.',
    slugs: ['audit', 'certificates'],
  },
  {
    name: 'Companies, firms and trusts',
    description: 'Formation, annual compliance and changes for companies, LLPs, partnership firms and trusts.',
    slugs: ['company-law', 'partnership-firms-and-llps', 'trusts-and-npos'],
  },
  {
    name: 'Business support',
    description: 'Advice, bank finance, government schemes, and monthly accounting and payroll.',
    slugs: ['advisory', 'bank-loans-and-project-reports', 'startup-and-grant-support', 'bookkeeping-and-payroll'],
  },
];

/** "Who we work with" on /services. The list ends with "and many more". */
export const CLIENT_SECTORS = [
  'Salaried individuals and pensioners',
  'Non-resident Indians',
  'Doctors, clinics and diagnostic labs',
  'Advocates and other professionals',
  'Traders, shops and retailers',
  'Automobile dealers and service stations',
  'Manufacturers and small industries',
  'Contractors',
  'Builders and real estate',
  'Hotels and restaurants',
  'Technology firms and startups',
  'Farmer producer companies',
  'Schools, colleges and educational trusts',
  'Temples, mutts and religious trusts',
];

/**
 * Slugs retired in the 2026 redesign, mapped to the page that now covers them.
 * Netlify answers these with a 301 (netlify.toml); in-app navigation is
 * redirected by ServiceDetail.
 */
export const LEGACY_SERVICE_SLUGS: Record<string, string> = {
  litigation: 'notices-and-appeals',
  bookkeeping: 'bookkeeping-and-payroll',
  payroll: 'bookkeeping-and-payroll',
};

export const getServicePage = (slug: string | undefined): ServicePage | undefined =>
  SERVICE_PAGES.find((page) => page.slug === slug);

/**
 * The services as a flat list, for the home page, the sitemap and the
 * structured data. Derived from SERVICE_PAGES so the two can't drift.
 */
export const SERVICES: ServiceItem[] = SERVICE_PAGES.map((page) => ({
  id: page.slug,
  title: page.name,
  description: page.intro,
  link: `/services/${page.slug}`,
}));
