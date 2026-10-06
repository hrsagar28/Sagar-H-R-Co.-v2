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
}

export const CHECKLISTS: Checklist[] = [
  {
    slug: 'salaried',
    title: 'Salary and house property',
    summary: 'For an income tax return with salary, interest and rent.',
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
    slug: 'nri',
    title: 'Non-resident Indians (NRIs)',
    summary: 'For an income tax return on income in India: interest, rent, a property sale or shares.',
    sections: [
      {
        title: 'About you',
        items: [
          { what: 'PAN', detail: 'and Aadhaar, if you have one.' },
          {
            what: 'Passport pages with entry and exit stamps',
            detail: 'or your travel dates for the year, to work out your residential status.',
          },
          { what: 'Your address abroad and an Indian mobile number or email for the portal' },
          {
            what: 'NRO and NRE bank accounts in India',
            detail: 'with IFSC; a refund goes only to a validated account.',
          },
        ],
      },
      {
        title: 'Income in India',
        items: [
          { what: 'Interest certificates', detail: 'for NRO deposits and savings; NRE interest is shown separately.' },
          {
            what: 'Rent agreement and rent received',
            detail: 'for property let out in India, with municipal tax paid.',
          },
          {
            what: 'Sale deed and purchase deed',
            detail: 'for property sold, with the buyer’s TDS certificate and the cost of any improvements.',
          },
          { what: 'Capital gains statements', detail: 'from your broker and mutual funds.' },
          { what: 'TDS certificates', detail: 'Form 131 from each payer (Form 16A for 2025-26 and earlier).' },
        ],
      },
      {
        title: 'Treaty relief and remittances',
        items: [
          {
            what: 'Tax residency certificate',
            detail: 'from the country you live in, with Form 41 (formerly 10F), if you claim a lower treaty rate.',
          },
          {
            what: 'Lower deduction certificate',
            detail: 'Form 128 (formerly 13), if you applied for one before a sale.',
          },
          {
            what: 'Remittance details',
            detail: 'for money sent abroad, where Forms 145 and 146 (formerly 15CA and 15CB) are needed.',
          },
        ],
      },
    ],
  },
  {
    slug: 'trust-registration',
    title: 'Registering a trust or society',
    summary: 'For income tax registration of a charitable or religious trust, society or section 8 company.',
    sections: [
      {
        title: 'The organisation',
        items: [
          {
            what: 'Trust deed, or memorandum and bye-laws',
            detail: 'or the memorandum and articles of a section 8 company, with every amendment.',
          },
          {
            what: 'Registration certificate',
            detail: 'from the Registrar of Societies, the sub-registrar or the Registrar of Companies.',
          },
          { what: 'PAN of the organisation' },
          { what: 'NGO Darpan ID', detail: 'if registered.' },
          { what: 'FCRA registration', detail: 'if it receives foreign contributions.' },
        ],
      },
      {
        title: 'The people',
        items: [
          { what: 'PAN and Aadhaar of each trustee or governing-body member' },
          { what: 'Mobile number and email', detail: 'of the person who will sign the application.' },
        ],
      },
      {
        title: 'What it does',
        items: [
          { what: 'A note on its activities', detail: 'what it does, where, and for whom.' },
          {
            what: 'Financial statements',
            detail: 'for up to the last three years, if it has been running.',
          },
          {
            what: 'Earlier registration or approval orders',
            detail: 'if any, for renewal. New applications use Form 104 (formerly 10A) or Form 105 (formerly 10AB).',
          },
        ],
      },
    ],
  },
  {
    slug: 'company-llp-incorporation',
    title: 'Starting a company or LLP',
    summary: 'For incorporating a private limited company or a limited liability partnership.',
    sections: [
      {
        title: 'Each director or partner',
        items: [
          { what: 'PAN and Aadhaar' },
          { what: 'A recent photograph' },
          {
            what: 'Proof of address',
            detail: 'a bank statement, or an electricity, telephone or mobile bill not older than two months.',
          },
          { what: 'Mobile number and email', detail: 'each person’s own, for the verification codes.' },
          { what: 'Digital signature', detail: 'if they already have one; otherwise we will arrange it.' },
        ],
      },
      {
        title: 'The registered office',
        items: [
          {
            what: 'Proof of the address',
            detail: 'an electricity, water or gas bill, or property tax receipt, not older than two months.',
          },
          {
            what: 'Rent agreement and a no-objection letter from the owner',
            detail: 'if the premises are rented or belong to someone else.',
          },
        ],
      },
      {
        title: 'The company or LLP',
        items: [
          { what: 'Two or three names you would like', detail: 'in order of preference.' },
          { what: 'What the business will do', detail: 'in a few lines.' },
          {
            what: 'Capital and who holds it',
            detail:
              'for a company, the shares each subscriber takes; for an LLP, each partner’s contribution and share of profit.',
          },
        ],
      },
    ],
  },
  {
    slug: 'gst-registration',
    title: 'GST registration',
    summary: 'For a new GST registration of a proprietor, firm, LLP or company.',
    sections: [
      {
        title: 'The business',
        items: [
          { what: 'PAN of the business', detail: 'or of the proprietor.' },
          {
            what: 'Proof of constitution',
            detail: 'partnership deed, LLP agreement or certificate of incorporation; not needed for a proprietor.',
          },
          { what: 'The main goods or services', detail: 'so we can find their HSN or SAC codes.' },
          {
            what: 'Bank account details',
            detail: 'a cancelled cheque or the first page of the passbook or statement.',
          },
        ],
      },
      {
        title: 'The place of business',
        items: [
          {
            what: 'Proof of the address',
            detail: 'a recent electricity bill, property tax receipt or khata.',
          },
          {
            what: 'Rent agreement, or a consent letter from the owner',
            detail: 'if the premises are rented or belong to a relative.',
          },
          {
            what: 'A photograph of the premises',
            detail: 'showing the board with the business name, if there is one.',
          },
        ],
      },
      {
        title: 'The people',
        items: [
          {
            what: 'PAN, Aadhaar and a photograph',
            detail: 'of the proprietor, each partner or each director.',
          },
          {
            what: 'Authorisation for the person who signs',
            detail: 'a letter from the partners, or a board resolution for a company.',
          },
          {
            what: 'The Aadhaar-linked mobile number',
            detail: 'for verification; some applicants are asked to visit a GST Suvidha Kendra in person.',
          },
        ],
      },
    ],
  },
  {
    slug: 'bank-loan',
    title: 'Bank loans and project reports',
    summary: 'For a project report or CMA data for a new loan, a renewal or an increase in limits.',
    sections: [
      {
        title: 'The borrowers',
        items: [
          {
            what: 'PAN and Aadhaar',
            detail: 'of the business and of each proprietor, partner, director or guarantor.',
          },
          { what: 'Udyam registration certificate', detail: 'if registered.' },
          { what: 'GST registration certificate' },
        ],
      },
      {
        title: 'The track record',
        items: [
          { what: 'Income tax returns and financial statements', detail: 'for the last three years.' },
          { what: 'Bank statements', detail: 'for the last twelve months, for every business account.' },
          { what: 'GST returns', detail: 'for the last twelve months.' },
          {
            what: 'Existing loans',
            detail: 'sanction letters and the latest statements, with the amount still owed.',
          },
        ],
      },
      {
        title: 'The proposal',
        items: [
          { what: 'What the loan is for', detail: 'and how much.' },
          { what: 'Quotations', detail: 'for the machinery, vehicles or building work to be financed.' },
          { what: 'Expected sales and costs', detail: 'for the next few years, as you see them.' },
          { what: 'Property documents', detail: 'for anything offered as security.' },
        ],
      },
    ],
  },
  {
    slug: 'new-client',
    title: 'Starting with us',
    summary: 'What to bring when you first engage us.',
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
