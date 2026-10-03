import { FAQItem } from '../types';

// Nine sections, re-balanced in the 2026 redesign so GST, company law, notices
// and trusts carry as much weight as income tax. The slugs of the original four
// sections are kept so existing #fragment links keep resolving.
export const FAQ_CATEGORIES = [
  {
    label: 'Getting started',
    slug: 'general-onboarding',
    description: 'How we begin, how fees are set, working from outside Mysuru and moving from another CA.',
  },
  {
    label: 'Income tax',
    slug: 'income-tax-planning',
    description: 'Choosing a regime, losses, capital gains, late returns and income of non-residents.',
  },
  { label: 'GST', slug: 'gst', description: 'Registration, returns, input tax credit and cancelled registrations.' },
  {
    label: 'Company law and business compliance',
    slug: 'business-gst-compliance',
    description: 'Setting up, annual ROC filings, partner changes, closing down, TDS, bookkeeping and payroll.',
  },
  {
    label: 'Notices and appeals',
    slug: 'notices-appeals',
    description: 'Replying to income tax and GST notices, and appealing against orders.',
  },
  {
    label: 'Audit and certificates',
    slug: 'audit-certificates',
    description: 'When a tax audit applies, how a certificate can be checked and what a net worth certificate needs.',
  },
  {
    label: 'Trusts and NPOs',
    slug: 'trusts-npos',
    description: 'Registration for tax exemption, approval for donor deductions and yearly filings.',
  },
  {
    label: 'Loans and grants',
    slug: 'loans-grants',
    description: 'Project reports and CMA data for banks, Udyam registration and utilisation certificates.',
  },
  {
    label: 'Working with us',
    slug: 'engagement-communication-security',
    description: 'Timelines, staying in touch, reminders and confidentiality.',
  },
] as const;

export const CATEGORY_ORDER: FAQItem['category'][] = FAQ_CATEGORIES.map(({ label }) => label);

// Single source of truth for the FAQ "last reviewed" date. Exported so the
// FAQ page can reuse it as the schema fallback instead of re-declaring it.
export const FAQ_LAST_UPDATED = '2026-04-24';

// Questions added in October 2026 so that every service page lists questions of
// its own.
const ADDED_OCT_2026 = '2026-10-03';

// Questions listed under "Asked most often" in the FAQ page header, in order.
export const FAQ_MOST_ASKED_IDS = ['services-outside-mysuru', 'service-fees', 'income-tax-notice'];

// Question ids retired when the FAQ was consolidated, mapped to the answer that
// now covers them, so old /faqs#id links still land on the right question.
export const FAQ_LEGACY_IDS: Record<string, string> = {
  'initial-consultation': 'engagement-process',
  'property-sale-tax-implications': 'shares-mutual-funds-taxation',
  'proactive-tax-planning': 'old-vs-new-tax-regime',
  'professional-bookkeeping-benefits': 'bookkeeping-payroll',
  'payroll-pf-esi': 'bookkeeping-payroll',
  'deadline-reminders': 'communication-document-sharing',
  'icai-ethics': 'data-security',
  'gst-notice': 'income-tax-notice',
};

export const FAQS: FAQItem[] = [
  {
    id: 'engagement-process',
    category: 'Getting started',
    question: 'How do we start working with you?',
    answer:
      'Usually with a short first discussion, by phone or at the office, to understand what you need, how urgent it is and where your compliance stands. You can [book one here](/contact). We then send you the scope of work and a fixed quote. Once you agree, we collect the documents we need; the checklists on our [Resources](/resources) page help you prepare. If something is urgent, such as a notice with a close deadline, we agree the scope and fee first and start straight away.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'services-outside-mysuru',
    category: 'Getting started',
    question: 'Do you work with clients outside Mysuru?',
    answer:
      'Yes. Our office is in Mysuru, but we work with clients across India and abroad. Meetings, document exchange and filings can all be done online, so where you are rarely makes a difference.',
    lastUpdated: FAQ_LAST_UPDATED,
    // Audit Q-03: curated for the home-page FAQ preview.
    featuredOnHome: true,
  },
  {
    id: 'service-fees',
    category: 'Getting started',
    question: 'How are your fees worked out?',
    answer:
      'Fees depend on the scope and complexity of the work. After a first discussion we give you a fixed quote in writing, and we confirm the scope before we begin. There are no charges beyond what we agree.',
    lastUpdated: FAQ_LAST_UPDATED,
    // Audit Q-03: curated for the home-page FAQ preview.
    featuredOnHome: true,
  },
  {
    id: 'switching-ca',
    category: 'Getting started',
    question: 'I already have a CA. Can I move my work to you?',
    answer:
      'Yes. For returns and regular compliance, we need your previous returns, access to the relevant portals and your books, and we take it from there. If we are taking over as your auditor, ICAI rules require us to write to the previous auditor before we accept the appointment, and we take care of that. A changeover is smoothest between filing periods, but it can be done at any time.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'old-vs-new-tax-regime',
    category: 'Income tax',
    question: 'Should I choose the old or the new tax regime?',
    answer:
      'The new regime is the default. It has lower rates but does not allow most of the common deductions, such as those for PF and life insurance, health insurance premiums and house rent (the old 80C, 80D and HRA). The old regime has higher rates but allows them. Which one costs you less depends on your income and the deductions you can claim, so we work out your tax both ways and show you the difference. If you have business income, switching between regimes is restricted, so the choice needs more care.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'business-loss-return-filing',
    category: 'Income tax',
    question: 'My business made a loss this year. Do I still need to file a return?',
    answer:
      'Yes, and on time. A business loss can be carried forward and set off against profits of later years only if the return is filed by the due date. That carried-forward loss then reduces your tax when the business makes a profit.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'shares-mutual-funds-taxation',
    category: 'Income tax',
    question: 'How is the profit on selling shares, mutual funds or property taxed?',
    answer:
      'As capital gains. Whether a gain is short-term or long-term depends on how long you held the asset, and the rate depends on that and on the type of asset. For property, the purchase cost, what you spent on improvements and the sale price all count, and exemptions such as reinvesting in another house or in specified bonds can reduce the tax, subject to conditions and time limits. If you are planning to sell a property, please talk to us before you finalise the sale.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'missed-due-date',
    category: 'Income tax',
    question: 'I missed the due date for my return. Can I still file?',
    answer:
      'Usually, yes. A belated return can be filed up to 31 December after the end of the tax year, or before the assessment is completed if that is earlier, with a late fee and interest. A business loss for that year can no longer be carried forward. After that, an updated return can be filed for up to four years from the end of the year following the tax year, but it costs additional tax of 25% to 70% of the tax and interest due, and it cannot be used to claim a refund.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'nri-return-filing',
    category: 'Income tax',
    question: 'I live abroad. Do I still need to file an income tax return in India?',
    answer:
      'Yes, if your income taxable in India, such as rent, interest on NRO deposits or capital gains, is above the basic exemption limit. Interest on NRE and FCNR deposits is exempt and does not count. Even below the limit, a return is often worth filing: tax deducted from payments to non-residents is usually more than the tax actually due, and a return is the only way to claim the excess back. Our [NRI taxation](/services/nri-taxation) page explains what we do.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'nri-property-sale-tds',
    category: 'Income tax',
    question: 'I am a non-resident selling property in India. How much tax will the buyer deduct?',
    answer:
      'The buyer must deduct tax before paying you, and needs a TAN to do so. Without a certificate from the Income Tax Department, tax is usually deducted on the whole sale price at the rate for long-term capital gains, 12.5% plus surcharge and cess, which can be far more than the tax actually due on your gain. You can apply for a lower deduction certificate before the sale, so that tax is deducted only on the estimated gain. Any excess deducted can be claimed back in your return.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'gst-registration-mandatory',
    category: 'GST',
    question: 'Is GST registration mandatory for my business?',
    answer:
      'It becomes mandatory once your aggregate turnover crosses the threshold, which in most states is ₹40 lakh for goods and ₹20 lakh for services. Some businesses must register whatever their turnover, such as e-commerce operators and businesses making inter-state sales.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'gst-returns',
    category: 'GST',
    question: 'Which GST returns do I have to file, and how often?',
    answer:
      'Most regular taxpayers file GSTR-1, the details of sales, and GSTR-3B, the summary return with tax payment, every month. If your turnover is up to ₹5 crore, you can opt for the QRMP scheme and file quarterly while paying tax monthly. Composition taxpayers file a quarterly statement and an annual return instead. The annual return in GSTR-9 is compulsory once turnover crosses ₹2 crore. Late filing attracts late fees and interest, and if you miss GSTR-1, your customers cannot claim credit for your invoices.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'itc-mismatch',
    category: 'GST',
    question: 'My input tax credit does not match GSTR-2B. What should I do?',
    answer:
      'You can generally claim credit only for invoices that appear in your GSTR-2B, and that depends on your suppliers filing their returns. Differences between your purchase records and GSTR-2B are one of the most common reasons for GST notices. We reconcile the two every month, follow up with suppliers whose invoices are missing, and make sure you claim only what you are entitled to.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'gst-registration-cancelled',
    category: 'GST',
    question: 'My GST registration has been cancelled. Can it be restored?',
    answer:
      'Often, yes. If the officer cancelled it, for example for not filing returns, you can apply for revocation, generally within 90 days of the cancellation order, after filing the pending returns and paying the tax, interest and late fees due. If that time has passed or the application is rejected, an appeal may still be possible. Act quickly, because you cannot charge GST or issue tax invoices while the registration is cancelled.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'company-or-llp-setup',
    category: 'Company law and business compliance',
    question: 'Can you help me set up a company or an LLP?',
    answer:
      'Yes. We advise on the right structure for your business and handle the incorporation. See [Company law and ROC](/services/company-law) and [Partnership firms and LLPs](/services/partnership-firms-and-llps).',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'roc-annual-filings',
    category: 'Company law and business compliance',
    question: 'What does a company or LLP have to file with the ROC every year?',
    answer:
      'A private company files its financial statements in Form AOC-4 and its annual return in Form MGT-7 or MGT-7A after the annual general meeting. An LLP files its annual return in Form 11 by 30 May and its statement of accounts and solvency in Form 8 by 30 October. These are due even if there was no business during the year. Late filing attracts an additional fee for every day of delay, which adds up quickly, so we track these dates for you.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'close-company-llp',
    category: 'Company law and business compliance',
    question: 'Can you help close a company or LLP that is no longer in use?',
    answer:
      'Yes. A company or LLP that has stopped doing business still has to file every year until it is formally closed. If it has no assets or liabilities, it can usually be struck off by applying to the Registrar, in Form STK-2 for a company or Form 24 for an LLP, once the pending filings are complete. We check what is outstanding and handle the application.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'tds-obligation',
    category: 'Company law and business compliance',
    question: 'What is TDS, and do I need to deduct it?',
    answer:
      'TDS is tax deducted at source. If you make certain payments above the specified limits, such as salary, rent, professional fees or commission, you must deduct tax at the prescribed rate and deposit it with the government. Most businesses have some TDS obligations. We can work out yours and handle the filings.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'tds-late-payment',
    category: 'Company law and business compliance',
    question: 'What happens if TDS is not deducted, or is deducted but paid late?',
    answer:
      'Interest is charged at 1% a month for the period tax was not deducted, and at 1.5% a month from the date it was deducted until it is paid. A TDS return filed late attracts a fee of ₹200 a day, up to the amount of tax deducted, and a penalty is possible if it is more than a year late. If tax is not deducted and paid by the due date of your return, 30% of the expense can also be disallowed in computing your business income. Defaults show on TRACES, and we can work out what is due and clear them; see [TDS and TCS](/services/tds-and-tcs).',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'bookkeeping-payroll',
    category: 'Company law and business compliance',
    question: 'Do you also handle bookkeeping and payroll?',
    answer:
      'Yes. We maintain your books, reconcile your bank accounts and prepare monthly figures, which also makes year-end returns and audits quicker and more accurate. For payroll, we process salaries, issue payslips and handle PF, ESI and TDS on salaries.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'partner-change',
    category: 'Company law and business compliance',
    question: 'What has to be done when a partner joins or leaves a firm or LLP?',
    answer:
      'For a partnership firm, all partners sign a supplementary deed, capital accounts are settled as on the date of the change, and a registered firm informs the Registrar of Firms. The GST registration must be amended within 15 days, and the bank mandate updated. For an LLP, the change in partners is filed in Form 4 and any change in the LLP agreement in Form 3, each within 30 days. Our [Partnership firms and LLPs](/services/partnership-firms-and-llps) page has more.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'income-tax-notice',
    category: 'Notices and appeals',
    question: 'I have received a notice from the Income Tax or GST department. What should I do?',
    answer:
      'Do not ignore it, even if you think the department is wrong. Check what the notice is about, the period it covers and the date by which you must reply. Income tax notices range from requests for information to scrutiny of your return. In GST, a scrutiny notice (ASMT-10) usually asks you to explain differences in your returns within 30 days, while a show cause notice (DRC-01) proposes a demand and gives you a chance to reply and be heard. Send us a copy as soon as you receive it. Through our [Notices and appeals](/services/notices-and-appeals) service we prepare the reply with the supporting documents and represent you before the officer.',
    lastUpdated: FAQ_LAST_UPDATED,
    // Audit Q-03: curated for the home-page FAQ preview.
    featuredOnHome: true,
  },
  {
    id: 'appeal-against-order',
    category: 'Notices and appeals',
    question: 'An order has gone against me. Can I appeal, and by when?',
    answer:
      'Yes, but the time limits are short. An income tax appeal to the Commissioner (Appeals) must be filed within 30 days of receiving the order. A GST appeal to the Appellate Authority must be filed within three months and needs a pre-deposit of 10% of the disputed tax. Further appeals lie to the Income Tax Appellate Tribunal and the GST Appellate Tribunal. If the department starts recovering the demand while the appeal is pending, we can apply for a stay.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'tax-audit-applicability',
    category: 'Audit and certificates',
    question: 'Does my business need a tax audit?',
    answer:
      'A business needs a tax audit if its turnover for the year exceeds ₹1 crore, or ₹10 crore where cash receipts and cash payments are each no more than 5% of the total. A profession needs one if its gross receipts exceed ₹50 lakh. A business or profession on a presumptive scheme may also need one if it declares a profit lower than the scheme’s rate and its income exceeds the basic exemption limit. The audit report is filed online before the return.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'udin-verification',
    category: 'Audit and certificates',
    question: 'What is a UDIN, and how can a certificate be checked?',
    answer:
      'A UDIN, or Unique Document Identification Number, is generated by a Chartered Accountant on the ICAI’s portal for every certificate, audit report and attestation they sign, and is printed on the document. Anyone who receives the document, such as a bank or a government department, can verify it on the ICAI’s UDIN portal. A certificate without a UDIN should not be accepted.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'net-worth-certificate',
    category: 'Audit and certificates',
    question: 'What do you need to issue a net worth certificate?',
    answer:
      'A list of what you own and owe as on the date of the certificate, with evidence for each item: property documents, bank and investment statements, and loan statements. Property is shown at the value the authority asks for, usually the purchase cost or the value in a registered valuer’s report. Tell us who has asked for the certificate, because banks, embassies and tender authorities often prescribe their own format. We certify only figures we have verified.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'trust-registration',
    category: 'Trusts and NPOs',
    question: 'How does a trust or society get registered for tax exemption and donor deductions?',
    answer:
      'Under the Income-tax Act, 2025, a trust, society or section 8 company registers under section 332 to have its income exempt (earlier 12A/12AB), and applies for approval under section 354 so that its donors can claim a deduction (earlier 80G). A new organisation first gets provisional registration, valid for three years, and applies for regular registration once its activities begin. Regular registration is valid for five years, or ten for smaller organisations, and has to be renewed in time.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'trust-annual-compliance',
    category: 'Trusts and NPOs',
    question: 'What does a registered trust or society have to file every year?',
    answer:
      'Its accounts must be audited and the audit report (Form 112, earlier 10B or 10BB) filed before the income tax return. If income is being set aside for future use, a statement of accumulation is filed as well. Organisations approved for donor deductions must also file a statement of the donations received and issue certificates to donors. Missing these can cost the organisation its exemption for the year, so we keep a calendar of them for every trust we work with.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'project-report-contents',
    category: 'Loans and grants',
    question: 'What goes into a project report for a bank loan?',
    answer:
      'A description of the business and its promoters, the cost of the project (land, building, machinery and working capital), how it will be financed between your contribution and the loan, and projected profit, cash flow and balance sheets for the term of the loan. Banks look in particular at the debt service coverage ratio, which shows whether the projected cash flow can meet the instalments. See [Bank loans and project reports](/services/bank-loans-and-project-reports).',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'cma-data',
    category: 'Loans and grants',
    question: 'What is CMA data, and when does a bank ask for it?',
    answer:
      'Credit monitoring arrangement (CMA) data is a set of financial statements in a standard format: actual figures for the last two years, estimates for the current year and projections for the next. Banks use it to assess how much working capital a business needs, and ask for it when sanctioning or renewing a cash credit or overdraft limit, and for larger term loans.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'udyam-registration',
    category: 'Loans and grants',
    question: 'Should my business register under Udyam?',
    answer:
      'Usually, yes. Udyam is the government’s free online registration for micro, small and medium enterprises, based on PAN and Aadhaar. It is not compulsory, but it is needed for many benefits: priority lending and collateral-free loans under government guarantee schemes, eligibility for government schemes and tenders, and, for micro and small enterprises, the right to be paid by buyers within 45 days, with interest if they pay late.',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'utilisation-certificate',
    category: 'Loans and grants',
    question: 'What is a utilisation certificate?',
    answer:
      'A statement, certified by a Chartered Accountant, of how a grant or subsidy has been spent against the purpose for which it was sanctioned, with any unspent balance. It is usually prepared in the format the scheme prescribes, and later instalments are released only after it is accepted. We check each item of expenditure against bills and bank statements before certifying it. See [Startup and grant support](/services/startup-and-grant-support).',
    lastUpdated: ADDED_OCT_2026,
  },
  {
    id: 'turnaround-time',
    category: 'Working with us',
    question: 'How long does the work usually take?',
    answer:
      'It depends on the work and on how soon we receive complete documents. Simple filings can be done quickly. Notices, assessments and restructuring take longer because they need more review. We give you a realistic timeline when we start.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'communication-document-sharing',
    category: 'Working with us',
    question: 'How will we keep in touch, and will you remind us about due dates?',
    answer:
      'By phone, email and WhatsApp, with meetings at the office when needed. For ongoing work we track your due dates, tell you what is coming up and follow up on documents we are waiting for, so filings are not left to the last day. Many clients use the checklists on our [Resources](/resources) page to prepare in advance.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'data-security',
    category: 'Working with us',
    question: 'How do you keep our information confidential?',
    answer:
      'We follow the ICAI Code of Ethics and the confidentiality obligations that apply to chartered accountants. Only the people working on your file see your information, documents move through controlled channels, and we do not circulate records unnecessarily. Where independence or a conflict of interest matters, we raise it before we take on the work. Our [Privacy Policy](/privacy) explains how we handle data.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
];
