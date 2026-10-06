// Checklists of what to send us, at /resources/checklist/<slug>. Written for
// tax year 2026-27 under the Income-tax Act, 2025; where a document still has
// its old name for 2025-26 and earlier (Form 16, for example), the old name is
// given too, since returns for those years are still being filed.

export interface ChecklistItem {
  /** The document, in a few words. */
  what: string;
  /** More about it, when needed. */
  detail?: string;
}

export interface Checklist {
  slug: string;
  title: string;
  /** One line under the title and on the Resources page. */
  summary: string;
  sections: { title: string; items: ChecklistItem[] }[];
  /** The Contact page subject for "send these to us". */
  subject: string;
}

export const CHECKLISTS: Checklist[] = [
  {
    slug: 'salaried',
    title: 'Salary and house property',
    summary: 'For an income tax return with salary, interest and rent.',
    subject: 'income-tax',
    sections: [
      {
        title: 'About you',
        items: [
          { what: 'PAN and Aadhaar' },
          { what: 'Mobile number and email', detail: 'the ones registered on the income-tax portal.' },
          { what: 'All your bank accounts, with IFSC', detail: 'a refund goes only to a validated account.' },
        ],
      },
      {
        title: 'Salary and other income',
        items: [
          {
            what: 'Form 130 from each employer',
            detail: 'for every job during the year (Form 16 for 2025-26 and earlier).',
          },
          {
            what: 'Arrears or advance salary',
            detail: 'if you received any, the details for claiming relief in Form 39 (formerly 10E).',
          },
          { what: 'Interest certificates', detail: 'from banks and the post office.' },
          { what: 'Foreign income or assets', detail: 'if you have any.' },
        ],
      },
      {
        title: 'Deductions, if you choose the old regime',
        items: [
          {
            what: 'Investments and payments for the ₹1.5 lakh deduction',
            detail: 'provident fund, PPF, life insurance, ELSS, tuition fees, home loan principal and similar.',
          },
          { what: 'Health insurance premium receipts' },
          {
            what: 'Rent receipts, for HRA',
            detail: 'with the landlord’s PAN if the rent is more than ₹1 lakh in the year.',
          },
          { what: 'Home loan interest certificate' },
          { what: 'Donation receipts' },
        ],
      },
      {
        title: 'A house you let out',
        items: [
          { what: 'Rent agreement' },
          { what: 'Municipal tax receipts' },
          { what: 'Co-owners', detail: 'name, PAN and share of each.' },
          { what: 'Home loan interest certificate for that house' },
        ],
      },
    ],
  },
  {
    slug: 'capital-gains',
    title: 'Capital gains',
    summary: 'For a sale of property, shares or mutual funds.',
    subject: 'income-tax',
    sections: [
      {
        title: 'Sale of property',
        items: [
          { what: 'Sale deed and purchase deed' },
          { what: 'Stamp duty value', detail: 'on purchase and on sale.' },
          { what: 'Bills for improvements', detail: 'and any brokerage or other selling costs.' },
          { what: 'Co-owners', detail: 'name, PAN and share of each.' },
          {
            what: 'For property bought before 1 April 2001',
            detail: 'a valuer’s report of its value on that date.',
          },
          { what: 'TDS certificate from the buyer', detail: 'Form 132.' },
          {
            what: 'Proof of reinvestment, if you claim an exemption',
            detail: 'the new house’s deed, the bonds, or a Capital Gains Accounts Scheme deposit.',
          },
        ],
      },
      {
        title: 'Shares and mutual funds',
        items: [
          { what: 'Capital gains statement from your broker' },
          { what: 'Capital gains statement for mutual funds', detail: 'from CAMS or KFintech.' },
          { what: 'Shares that were inherited, gifted or transferred off-market' },
          {
            what: 'Value on 31 January 2018',
            detail: 'for shares and equity fund units bought before 1 February 2018.',
          },
          { what: 'Losses carried forward from earlier years' },
        ],
      },
    ],
  },
  {
    slug: 'business-presumptive',
    title: 'Business on presumptive income',
    summary: 'For a business or profession declaring income under section 58 (formerly 44AD and 44ADA).',
    subject: 'income-tax',
    sections: [
      {
        title: 'For the year',
        items: [
          { what: 'Bank statements', detail: 'for every account used for the business.' },
          {
            what: 'Turnover or gross receipts',
            detail: 'split between receipts through the bank or digital means, and cash.',
          },
          { what: 'Advance tax challans' },
          { what: 'Statements of business loans' },
          { what: 'Your deductions, if you choose the old regime' },
        ],
      },
      {
        title: 'At 31 March',
        items: [
          { what: 'Amounts owed to suppliers' },
          { what: 'Amounts due from customers' },
          { what: 'Value of closing stock' },
          { what: 'Cash in hand' },
        ],
      },
    ],
  },
  {
    slug: 'business-audit',
    title: 'Business needing a tax audit',
    summary: 'For a business or profession audited under section 63 (formerly 44AB), reported in Form 26.',
    subject: 'audit',
    sections: [
      {
        title: 'Books and accounts',
        items: [
          { what: 'Books of account', detail: 'bank, sales, purchases and ledgers.' },
          { what: 'Trial balance, profit and loss account and balance sheet' },
          { what: 'Last year’s audited accounts and tax audit report' },
          { what: 'Fixed asset register', detail: 'with the year’s additions and sales.' },
          { what: 'Statements for every loan', detail: 'secured and unsecured.' },
        ],
      },
      {
        title: 'Compliance',
        items: [
          {
            what: 'Proof of paying GST, PF, ESI and other dues',
            detail: 'these are allowed only when paid (section 37, formerly 43B).',
          },
          { what: 'TDS and TCS statements filed', detail: 'and any payments made late.' },
          {
            what: 'Personal expenses, related-party transactions and cash payments',
            detail: 'including any cash payment above ₹10,000 to one person in a day.',
          },
        ],
      },
    ],
  },
  {
    slug: 'gst',
    title: 'GST returns',
    summary: 'For monthly or quarterly returns and the annual return.',
    subject: 'gst',
    sections: [
      {
        title: 'Monthly or quarterly (GSTR-1 and GSTR-3B)',
        items: [
          { what: 'Sales invoices', detail: 'with credit and debit notes, and exempt or nil-rated sales.' },
          {
            what: 'Purchase invoices',
            detail: 'matched with GSTR-2B, with any action taken in the Invoice Management System.',
          },
          { what: 'Tax paid under reverse charge', detail: 'and any cash challans.' },
        ],
      },
      {
        title: 'Annual (GSTR-9)',
        items: [
          { what: 'Profit and loss account and balance sheet' },
          { what: 'Reconciliation of sales, purchases and input tax credit', detail: 'books against returns.' },
          { what: 'HSN-wise summary of sales' },
          { what: 'Input tax credit', detail: 'split into inputs, input services and capital goods.' },
          { what: 'Notices, orders or refunds during the year' },
        ],
      },
    ],
  },
  {
    slug: 'new-client',
    title: 'Starting with us',
    summary: 'What to bring when you first engage us.',
    subject: '',
    sections: [
      {
        title: 'The business, if any',
        items: [
          { what: 'PAN of the business' },
          { what: 'Certificate of incorporation, partnership deed or LLP agreement' },
          { what: 'GST registration certificate' },
          { what: 'Proof of business address', detail: 'such as an electricity bill.' },
          { what: 'Access to the income-tax and GST portals', detail: 'we will arrange this with you.' },
        ],
      },
      {
        title: 'The people',
        items: [
          { what: 'PAN and Aadhaar', detail: 'of the proprietor, each partner or each director.' },
          { what: 'Phone number and email', detail: 'of the person we will deal with.' },
        ],
      },
      {
        title: 'The accounts',
        items: [
          { what: 'Bank statements', detail: 'for every business account, for the last financial year.' },
          { what: 'Details of loans and borrowings' },
          { what: 'Access to your accounting software', detail: 'if you use one.' },
          { what: 'Last year’s returns and financial statements', detail: 'if someone else prepared them.' },
        ],
      },
    ],
  },
];

export const getChecklist = (slug?: string) => CHECKLISTS.find((checklist) => checklist.slug === slug);
