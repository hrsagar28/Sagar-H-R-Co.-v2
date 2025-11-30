

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
      { name: 'NGO Darpan Registration', url: 'https://ngodarpan.gov.in/' },
      { name: 'EPFO Portal', url: 'https://unifiedportal-emp.epfindia.gov.in/' },
      { name: 'ESIC Portal', url: 'https://www.esic.gov.in/' },
      { name: 'ICAI UDIN', url: 'https://udin.icai.org/' }
    ]
  }
];

export const TDS_RATES_RESIDENT = [
  { section: '192', nature: 'Payment of Salary', threshold: 'Basic Exemption Limit', rate: 'Slab Rate' },
  { section: '192A', nature: 'Premature withdrawal from EPF', threshold: '50,000', rate: '10%' },
  { section: '193', nature: 'Interest on Securities', threshold: '10,000 (Specific)', rate: '10%' },
  { section: '194', nature: 'Dividends', threshold: '5,000', rate: '10%' },
  { section: '194A', nature: 'Interest other than "Interest on securities" (Banks/Post)', threshold: '40,000 (General) / 50,000 (Senior Citizen)', rate: '10%' },
  { section: '194A', nature: 'Interest other than "Interest on securities" (Others)', threshold: '5,000', rate: '10%' },
  { section: '194B', nature: 'Winnings from Lotteries, Puzzles, etc.', threshold: '10,000', rate: '30%' },
  { section: '194BA', nature: 'Winnings from Online Games', threshold: 'Nil (Net Winnings)', rate: '30%' },
  { section: '194BB', nature: 'Winnings from Horse Races', threshold: '10,000', rate: '30%' },
  { section: '194C', nature: 'Payment to Contractors (Individual/HUF)', threshold: '30,000 Single / 1,00,000 Aggregate', rate: '1%' },
  { section: '194C', nature: 'Payment to Contractors (Others)', threshold: '30,000 Single / 1,00,000 Aggregate', rate: '2%' },
  { section: '194D', nature: 'Insurance Commission', threshold: '15,000', rate: '5%' },
  { section: '194DA', nature: 'Life Insurance Maturity', threshold: '1,00,000', rate: '2%' },
  { section: '194EE', nature: 'NSS Deposits Payment', threshold: '2,500', rate: '10%' },
  { section: '194G', nature: 'Commission on sale of lottery tickets', threshold: '15,000', rate: '2%' },
  { section: '194H', nature: 'Commission or Brokerage', threshold: '15,000', rate: '2%' },
  { section: '194I(a)', nature: 'Rent of Plant & Machinery', threshold: '2,40,000', rate: '2%' },
  { section: '194I(b)', nature: 'Rent of Land, Building or Furniture', threshold: '2,40,000', rate: '10%' },
  { section: '194IA', nature: 'Transfer of Immovable Property', threshold: '50,00,000', rate: '1%' },
  { section: '194IB', nature: 'Rent by Individual/HUF (Not under Audit)', threshold: '50,000 per month', rate: '2%' },
  { section: '194IC', nature: 'Payment under Joint Development Agreement', threshold: '-', rate: '10%' },
  { section: '194J(a)', nature: 'Fees for Professional Services', threshold: '30,000', rate: '10%' },
  { section: '194J(b)', nature: 'Technical Services / Call Center / Royalty', threshold: '30,000', rate: '2%' },
  { section: '194K', nature: 'Income in respect of Mutual Fund units', threshold: '5,000', rate: '10%' },
  { section: '194LA', nature: 'Compensation on acquisition of immovable property', threshold: '2,50,000', rate: '10%' },
  { section: '194LBA', nature: 'Income from Business Trust', threshold: '-', rate: '10%' },
  { section: '194LBB', nature: 'Income from Investment Fund', threshold: '-', rate: '10%' },
  { section: '194LBC', nature: 'Income from Securitization Trust', threshold: '-', rate: '25% (Individual/HUF) / 30% (Company)' },
  { section: '194M', nature: 'Payment by Individual/HUF to Contractors/Professionals', threshold: '50,00,000', rate: '2%' },
  { section: '194N', nature: 'Cash withdrawal > 1 Crore', threshold: '1,00,00,000', rate: '2%' },
  { section: '194O', nature: 'E-commerce Operator to Participant', threshold: '5,00,000 (Individual/HUF)', rate: '0.1%' },
  { section: '194Q', nature: 'Purchase of Goods (Buyer Turnover > 10 Crores)', threshold: '50,00,000', rate: '0.1%' },
  { section: '194R', nature: 'Perquisites of Business/Profession', threshold: '20,000', rate: '10%' },
  { section: '194S', nature: 'Transfer of Virtual Digital Assets', threshold: '10,000 / 50,000', rate: '1%' },
  { section: '194T', nature: 'Payment to Partners by Firm', threshold: '20,000', rate: '10%' },
];

export const TDS_RATES_NON_RESIDENT = [
  { section: '195', nature: 'LTCG (Sec 112(1)(c)(iii) / 112A / Other)', threshold: '-', rate: '12.5%' },
  { section: '195', nature: 'STCG (Sec 111A)', threshold: '-', rate: '20%' },
  { section: '195', nature: 'Dividend (IFSC Units)', threshold: '-', rate: '10%' },
  { section: '195', nature: 'Dividend (Other)', threshold: '-', rate: '20%' },
  { section: '195', nature: 'Interest (Govt / Indian Concern)', threshold: '-', rate: '20%' },
  { section: '195', nature: 'Royalty & Fees for Technical Services', threshold: '-', rate: '20%' },
  { section: '195', nature: 'Any other income', threshold: '-', rate: '30% (Individual) / 35% (Company) + Surcharge + Cess' },
  { section: '194E', nature: 'Payments to Non-Resident Sportsmen', threshold: '-', rate: '20% + Surcharge + Cess' },
  { section: '194LB', nature: 'Interest on Infrastructure Debt Fund', threshold: '-', rate: '5%' },
  { section: '194LC', nature: 'Interest by Indian Company (Specific borrowings)', threshold: '-', rate: '5%' },
  { section: '194LD', nature: 'Interest on certain bonds/govt securities', threshold: '-', rate: '5%' },
  { section: '196A', nature: 'Income from units of Non-Residents', threshold: '-', rate: '20%' },
  { section: '196B', nature: 'Income from units (Offshore Fund)', threshold: '-', rate: '10%' },
  { section: '196C', nature: 'Income from Foreign Currency Bonds/GDR', threshold: '-', rate: '10%' },
  { section: '196D', nature: 'Income of FIIs from Securities', threshold: '-', rate: '20%' },
  { section: '196', nature: 'Payable to Govt/RBI/Corporations (Exempt)', threshold: '-', rate: 'Nil (No TDS)' },
];

export const TCS_RATES = [
  { section: '206C(1)', nature: 'Sale of Alcoholic Liquor for Human Consumption', threshold: '-', rate: '1%' },
  { section: '206C(1)', nature: 'Sale of Tendu Leaves', threshold: '-', rate: '5%' },
  { section: '206C(1)', nature: 'Sale of Timber (Forest Lease)', threshold: '-', rate: '2.5%' },
  { section: '206C(1)', nature: 'Sale of Timber (Other Modes)', threshold: '-', rate: '2.5%' },
  { section: '206C(1)', nature: 'Sale of Other Forest Produce', threshold: '-', rate: '2.5%' },
  { section: '206C(1)', nature: 'Sale of Scrap', threshold: '-', rate: '1%' },
  { section: '206C(1)', nature: 'Sale of Minerals (Coal/Lignite/Iron Ore)', threshold: '-', rate: '1%' },
  { section: '206C(1F)', nature: 'Sale of Motor Vehicle', threshold: '> 10,00,000', rate: '1%' },
  { section: '206C(1G)(a)', nature: 'LRS Remittance (Education Loan)', threshold: '> 7,00,000', rate: '0.5%' },
  { section: '206C(1G)(a)', nature: 'LRS Remittance (Other Purpose)', threshold: '> 7,00,000', rate: '20%' },
  { section: '206C(1G)(b)', nature: 'Sale of Overseas Tour Package', threshold: '-', rate: '20%' },
  { section: '206C(1H)', nature: 'Sale of Goods (Seller Turnover > 10 Cr)', threshold: '> 50,00,000', rate: '0.1%' },
];

export const TDS_DUE_DATES_SUMMARY = [
  { event: 'Payment of TDS/TCS', due: '7th of Next Month', note: 'For March: 30th April' },
  { event: 'Quarterly Return (Q1)', due: '31st July', note: 'Apr - Jun' },
  { event: 'Quarterly Return (Q2)', due: '31st October', note: 'Jul - Sep' },
  { event: 'Quarterly Return (Q3)', due: '31st January', note: 'Oct - Dec' },
  { event: 'Quarterly Return (Q4)', due: '31st May', note: 'Jan - Mar' },
  { event: 'Issue of Form 16 (Annual)', due: '15th June', note: 'Salary Certificate' },
  { event: 'Issue of Form 16A (Quarterly)', due: '15 Days from Return Due Date', note: 'Non-Salary Certificate' },
];

export const CII_DATA = [
  { fy: '2024-25', index: '363' },
  { fy: '2023-24', index: '348' },
  { fy: '2022-23', index: '331' },
  { fy: '2021-22', index: '317' },
  { fy: '2020-21', index: '301' },
  { fy: '2019-20', index: '289' },
  { fy: '2018-19', index: '280' },
  { fy: '2017-18', index: '272' },
  { fy: '2016-17', index: '264' },
  { fy: '2015-16', index: '254' },
  { fy: '2014-15', index: '240' },
  { fy: '2013-14', index: '220' },
  { fy: '2012-13', index: '200' },
  { fy: '2011-12', index: '184' },
  { fy: '2010-11', index: '167' },
  { fy: '2009-10', index: '148' },
  { fy: '2008-09', index: '137' },
  { fy: '2007-08', index: '129' },
  { fy: '2006-07', index: '122' },
  { fy: '2005-06', index: '117' },
  { fy: '2004-05', index: '113' },
  { fy: '2003-04', index: '109' },
  { fy: '2002-03', index: '105' },
  { fy: '2001-02', index: '100' },
];

/**
 * COMPLIANCE CALENDAR DATA
 * 
 * Last Updated: November 2025
 * Applicable For: FY 2025-26 (April 2025 - March 2026)
 * 
 * ANNUAL UPDATE CHECKLIST:
 * 1. Review CBDT notifications for TDS/IT due dates
 * 2. Review CBIC notifications for GST due dates
 * 3. Check MCA for ROC filing deadlines
 * 4. Verify PF/ESI payment dates
 * 5. Update month keys (YYYY-MM format)
 * 6. Run generate-sitemap.js after updates
 * 
 * Sources:
 * - incometax.gov.in
 * - gst.gov.in
 * - mca.gov.in
 */
export const COMPLIANCE_CALENDAR = {
  "2025-04": [ { day: 7, desc: "TDS/TCS Payment for March", cat: "tds" }, { day: 10, desc: "GSTR-7 & GSTR-8 (Mar)", cat: "gst" }, { day: 11, desc: "GSTR-1 (Monthly, Mar)", cat: "gst" }, { day: 13, desc: "GSTR-1 (QRMP, Jan-Mar)", cat: "gst" }, { day: 15, desc: "PF & ESI Payment (Mar)", cat: "payroll" }, { day: 18, desc: "CMP-08 (Jan-Mar)", cat: "gst" }, { day: 20, desc: "GSTR-3B (Monthly, Mar)", cat: "gst" }, { day: 22, desc: "GSTR-3B (QRMP, Jan-Mar)", cat: "gst" }, { day: 30, desc: "GSTR-4 (Annual, FY 24-25)", cat: "gst" }, { day: 30, desc: "Form 11 (LLP Annual Return)", cat: "roc" } ],
  "2025-05": [ { day: 7, desc: "TDS/TCS Payment (Apr)", cat: "tds" }, { day: 11, desc: "GSTR-1 (Monthly, Apr)", cat: "gst" }, { day: 15, desc: "TDS Quarterly Return (Q4, FY 24-25)", cat: "tds" }, { day: 15, desc: "PF & ESI Payment (Apr)", cat: "payroll" }, { day: 20, desc: "GSTR-3B (Monthly, Apr)", cat: "gst" } ],
  "2025-06": [ { day: 7, desc: "TDS/TCS Payment (May)", cat: "tds" }, { day: 15, desc: "Advance Tax (1st Installment)", cat: "it" }, { day: 30, desc: "DPT-3 (Return of Deposits)", cat: "roc" } ],
  "2025-07": [ { day: 15, desc: "TCS Quarterly Return (Q1)", cat: "tds" }, { day: 31, desc: "TDS Quarterly Return (Q1)", cat: "tds" }, { day: 31, desc: "ITR Filing (Non-Audit Cases) for FY 24-25", cat: "it" } ],
  "2025-08": [ { day: 7, desc: "TDS/TCS Payment (Jul)", cat: "tds" }, { day: 11, desc: "GSTR-1 (Monthly, Jul)", cat: "gst" }, { day: 14, desc: "Form 16/16A (Q1)", cat: "tds" }, { day: 20, desc: "GSTR-3B (Monthly, Jul)", cat: "gst" } ],
  "2025-09": [ { day: 15, desc: "Advance Tax (2nd Installment)", cat: "it" }, { day: 30, desc: "Tax Audit Report Filing", cat: "it" } ],
  "2025-10": [ { day: 31, desc: "ITR Filing (Audit Cases) for FY 24-25", cat: "it" }, { day: 31, desc: "Form 8 (LLP)", cat: "roc" } ],
  "2025-11": [ { day: 14, desc: "Form 16/16A (Q2)", cat: "tds" }, { day: 15, desc: "TDS Quarterly Return (Q2)", cat: "tds" }, { day: 29, desc: "Form AOC-4 (Company)", cat: "roc" } ],
  "2025-12": [ { day: 15, desc: "Advance Tax (3rd Installment)", cat: "it" }, { day: 31, desc: "Belated/Revised ITR (FY 24-25)", cat: "it" }, { day: 31, desc: "GSTR-9 & 9C (Annual)", cat: "gst" } ],
  "2026-01": [ { day: 15, desc: "TCS Quarterly Return (Q3)", cat: "tds" }, { day: 31, desc: "TDS Quarterly Return (Q3)", cat: "tds" } ],
  "2026-02": [ { day: 14, desc: "Form 16/16A (Q3)", cat: "tds" } ],
  "2026-03": [ { day: 15, desc: "Advance Tax (Final Installment)", cat: "it" }, { day: 31, desc: "Updated Return (ITR-U) for FY 22-23", cat: "it" } ]
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