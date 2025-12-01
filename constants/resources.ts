
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

export const TDS_DUE_DATES_SUMMARY = [
  { event: 'Payment of TDS/TCS', due: '7th of Next Month', note: 'For March: 30th April' },
  { event: 'Quarterly Return (Q1)', due: '31st July', note: 'Apr - Jun' },
  { event: 'Quarterly Return (Q2)', due: '31st October', note: 'Jul - Sep' },
  { event: 'Quarterly Return (Q3)', due: '31st January', note: 'Oct - Dec' },
  { event: 'Quarterly Return (Q4)', due: '31st May', note: 'Jan - Mar' },
  { event: 'Issue of Form 16 (Annual)', due: '15th June', note: 'Salary Certificate' },
  { event: 'Issue of Form 16A (Quarterly)', due: '15 Days from Return Due Date', note: 'Non-Salary Certificate' },
];

export const CHECKLIST_DATA: Record<string, { title: string, subtitle: string, sections: { title: string, items: string[] }[] }> = {
  'new-client': {
    title: 'New Client Onboarding',
    subtitle: 'Welcome! Please provide these documents to help us get started smoothly.',
    sections: [
      {
        title: 'Business Information (If Applicable)',
        items: [
          'Copy of **PAN Card** of the Business',
          'Copy of **Certificate of Incorporation** / Partnership Deed',
          'Copy of **GST Registration** Certificate',
          '**Address Proof** of Business Premises (e.g., Electricity Bill)',
          'Login credentials for **Income Tax & GST Portals**'
        ]
      },
      {
        title: 'Key Individuals',
        items: [
          'Copy of **PAN & Aadhaar Cards** for all key individuals',
          '**Contact Number and Email ID** for the primary contact'
        ]
      },
      {
        title: 'Financial Information',
        items: [
          '**Bank Statements** for all business accounts (last financial year)',
          'Details of all existing **loans and borrowings**',
          'Access to existing **accounting software**, if any'
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
          'Your **Income Tax Login ID and Password**',
          'Copy of your **PAN Card and Aadhaar Card**',
          'Your primary **Mobile Number and Email ID**',
          'List of all operative **bank accounts** with IFSC codes'
        ]
      },
      {
        title: 'Income & Deductions',
        items: [
          '**Form 16**: From all employers if you changed jobs',
          '**Salary Arrears**: If received, please provide Form 10E',
          '**Bank Statements**: For all savings and salary accounts',
          '**Other Income**: Details of interest on savings/FDs',
          '**Foreign Income/Assets**: Details of any foreign assets or income',
          '**Proofs for Tax-Saving Deductions (Old Regime)**: 80C (LIC, PPF, etc.), Home Loan Interest, HRA Rent Receipts, 80D (Medical), 80G (Donations)'
        ]
      },
      {
        title: 'Income from House Property',
        items: [
          '**Rental Agreements** for all rented-out properties',
          '**Municipal Tax Receipts**',
          '**Co-owner\'s Details** (Name, PAN, and ownership share %)',
          '**Home Loan Certificate** for the rented property'
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
          '**Sale Deed & Purchase Deed** of the property',
          '**Co-owner Details**: Name, PAN, and ownership share %',
          '**Stamp Duty Value** (Circle Rate) for both purchase and sale',
          'Bills/invoices for any **Improvement Costs**',
          'Invoices for **Sale Expenses** (e.g., brokerage)',
          'Proof of **Re-investment for Tax Exemption** (e.g., new house deed, 54EC bonds)'
        ]
      },
      {
        title: 'Sale of Shares / Mutual Funds',
        items: [
          '**Broker\'s P&L and Capital Gains Statement** (consolidated)',
          '**Mutual Fund Capital Gains Statement** (from AMCs or CAMS/KFintech)',
          'Details of any **inherited/gifted** shares or off-market sales',
          '**FMV Details**: Fair Market Value as on Jan 31, 2018 for shares bought prior',
          'Details of any **capital losses** from previous years to be carried forward'
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
          '**Bank Statements** for all business-related accounts',
          '**Turnover Summary** (Gross Receipts), with Bank vs. Cash breakdown',
          'Copies of any **Advance Tax** challans paid',
          'Statements for any **Business Loans**',
          'Details of any personal **Tax-Saving Investments** (LIC, PPF, etc.)'
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
          '**Complete Books of Accounts** (Bank Statements, Sales & Purchase Registers, Ledgers, etc.)',
          'Finalized **Financial Statements** (Trial Balance, P&L, Balance Sheet)',
          'Previous year\'s **Audited Financials and Tax Audit Report**',
          'A **Fixed Asset Register** with details of additions/disposals',
          '**Loan statements** for all secured and unsecured loans'
        ]
      },
      {
        title: 'Compliance & Disclosures',
        items: [
          '**Statutory Dues (Sec 43B)**: Proof of payment for GST, PF, ESI, etc.',
          '**TDS/TCS Compliance**: Copies of all returns filed and details of any delayed deposits',
          '**Expenditure Details**: Note of personal expenses, related party transactions, and single cash payments > ₹10,000',
          '**GST Details for Clause 44**: Breakup of total expenditure (GST registered vs. unregistered entities)'
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
          '**Sales Data**: All sales invoices, credit/debit notes, and summary of exempt/nil-rated sales',
          '**Purchase & ITC Data**: All purchase invoices for claiming ITC (reconciled with GSTR-2B)',
          '**Payment Data**: Details of tax paid under RCM and copies of any cash challans'
        ]
      },
      {
        title: 'For Annual Return (GSTR-9)',
        items: [
          'Finalized / Audited **Profit & Loss Account and Balance Sheet**',
          'A consolidated **reconciliation of sales, purchases, and ITC** (books vs. returns)',
          'An **HSN-wise summary** of all your sales',
          'A detailed **breakdown of ITC claimed** into Inputs, Input Services, and Capital Goods',
          'Details of any **GST notices, orders, or refunds** processed during the year'
        ]
      }
    ]
  }
};
