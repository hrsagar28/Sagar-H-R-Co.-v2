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
 * 5. Update month keys (e.g., "April 2026")
 * 6. Run generate-sitemap.js after updates
 * 
 * Sources:
 * - incometax.gov.in
 * - gst.gov.in
 * - mca.gov.in
 */
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