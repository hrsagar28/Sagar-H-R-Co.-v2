import { FAQItem } from '../types';

export const FAQ_CATEGORIES = [
  { label: 'General & Onboarding', slug: 'general-onboarding' },
  { label: 'Income Tax & Planning', slug: 'income-tax-planning' },
  { label: 'Business & GST Compliance', slug: 'business-gst-compliance' },
  { label: 'Engagement, Communication & Security', slug: 'engagement-communication-security' },
] as const;

export const CATEGORY_ORDER: FAQItem['category'][] = FAQ_CATEGORIES.map(({ label }) => label);

const FAQ_LAST_UPDATED = '2026-04-24';

export const FAQS: FAQItem[] = [
  {
    id: 'engagement-process',
    category: 'General & Onboarding',
    question: 'What is the process for engaging with your firm?',
    answer:
      'Our process is simple. It starts with an initial consultation to understand your needs. We then provide a clear scope of work and a fixed quote. Once you agree, we begin the onboarding process, which includes collecting necessary documents. You can find detailed checklists on our [Resources](/resources) page to help you prepare.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'services-outside-mysuru',
    category: 'General & Onboarding',
    question: 'Do you provide services outside of Mysuru?',
    answer:
      'Yes. While our office is physically located in Mysuru, we serve clients across India and internationally. Thanks to digital platforms, most tax and compliance services, including consultations, document handling, and filings, can be managed securely and efficiently online. We are equipped to assist you regardless of your location.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'service-fees',
    category: 'General & Onboarding',
    question: 'What are your fees for your services?',
    answer:
      'Our fees are based on the scope and complexity of the services required. We believe in transparency and will provide a detailed fixed quote after an initial consultation to understand your specific needs. There are no hidden charges, and we confirm the scope before work begins.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'old-vs-new-tax-regime',
    category: 'Income Tax & Planning',
    question: 'How do I choose between the Old and New Tax Regime?',
    answer:
      'The New Tax Regime offers lower tax rates but disallows most common deductions such as 80C, 80D, and HRA. The Old Tax Regime has higher rates but allows you to claim these deductions. The better choice depends on your income and investment profile. We can help you with a detailed comparison to see which regime saves you more tax.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'business-loss-return-filing',
    category: 'Income Tax & Planning',
    question: 'My business is making a loss. Do I still need to file an income tax return?',
    answer:
      'Yes, it is highly recommended. Filing a tax return even when you have a loss allows you to carry forward that loss to future years. This means you can offset the loss against future profits, which will reduce your tax liability in profitable years.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'income-tax-notice',
    category: 'Income Tax & Planning',
    question: "I've received a notice from the Income Tax Department. What should I do?",
    answer:
      'Do not ignore it. The first step is to carefully read the notice to understand why it was sent and the deadline for the response. We recommend you contact us immediately. We can handle the matter through our [Litigation Support](/services/litigation) service, from drafting a robust response to representing you before the tax authorities.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'proactive-tax-planning',
    category: 'Income Tax & Planning',
    question: 'How can proactive tax planning save me money?',
    answer:
      "Tax planning is about more than just filing returns on time. It involves strategically structuring your financial affairs throughout the year to legally minimize your tax liability. By planning ahead, you can take full advantage of all available deductions, exemptions, and rebates, ensuring you don't pay more tax than you are legally required to.",
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'shares-mutual-funds-taxation',
    category: 'Income Tax & Planning',
    question: 'I sold some shares or mutual funds this year. How is the profit taxed?',
    answer:
      "Profits from the sale of shares or mutual funds are taxed under the head 'Capital Gains'. The tax rate depends on whether the gain is short-term or long-term, which is determined by how long you held the asset. The rules can be complex, so it's important to have them calculated correctly.",
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'property-sale-tax-implications',
    category: 'Income Tax & Planning',
    question: 'I am planning to sell a property. What are the tax implications I should be aware of beforehand?',
    answer:
      "The sale of a property results in capital gains, which are taxable. Key factors determining the tax are the holding period, the cost of acquisition, improvement costs, and the sale price. It's crucial to plan this in advance as there are several exemptions available, such as reinvesting in another property or specified bonds, that can significantly reduce or even nullify your tax liability. We strongly advise a consultation before you finalize the sale.",
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'gst-registration-mandatory',
    category: 'Business & GST Compliance',
    question: 'Is GST registration mandatory for my business?',
    answer:
      'GST registration is mandatory for businesses whose aggregate turnover exceeds the threshold limit, currently \u20B940 lakh for goods and \u20B920 lakh for services in most states. It is also mandatory for certain other businesses regardless of turnover, such as e-commerce operators or those making inter-state sales.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'tds-obligation',
    category: 'Business & GST Compliance',
    question: 'What is TDS, and am I required to deduct it?',
    answer:
      'TDS stands for Tax Deducted at Source. If you are making certain payments, such as salary, rent, professional fees, or commission, above specified limits, you are required to deduct tax at a prescribed rate and deposit it with the government. This requirement applies to most businesses, and we can help you determine your TDS obligations and manage all related compliance.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'company-or-llp-setup',
    category: 'Business & GST Compliance',
    question: 'Can you help with setting up a new company or LLP?',
    answer:
      'Absolutely. Our [Business Advisory](/services/advisory) work covers business setup and registration. We can guide you on the best legal structure for your venture and handle the incorporation and registration formalities with the Registrar of Companies.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'professional-bookkeeping-benefits',
    category: 'Business & GST Compliance',
    question: "What's the benefit of professional bookkeeping if I'm a small business?",
    answer:
      "Professional bookkeeping provides a clear and accurate picture of your financial health. It helps you track income and expenses, make informed business decisions, manage cash flow effectively, and makes the year-end tax filing process much smoother and more accurate. It's the foundation of good financial management, regardless of business size.",
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'payroll-pf-esi',
    category: 'Business & GST Compliance',
    question: 'Do you also manage payroll and related compliances like PF and ESI?',
    answer:
      'Yes, we offer comprehensive Payroll Management services. This includes salary processing, payslip generation, and handling statutory compliances such as Provident Fund, Employee State Insurance, and TDS on salaries.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'initial-consultation',
    category: 'Engagement, Communication & Security',
    question: 'Do you offer an initial consultation before onboarding?',
    answer:
      'Yes. We usually begin with an initial discussion to understand your requirement, urgency, and existing compliance position. If you would like to start that conversation, you can [schedule a consultation](/contact). Where a matter needs deep review or urgent advisory straight away, we will clarify the scope and fees before we proceed.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'turnaround-time',
    category: 'Engagement, Communication & Security',
    question: 'What is your typical turnaround time?',
    answer:
      'Turnaround time depends on the nature of the assignment and how quickly we receive complete documents. Straightforward filings can often move quickly, while notices, assessments, and business structuring work need more review. We usually confirm realistic timelines during onboarding so expectations are clear from the start.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'communication-document-sharing',
    category: 'Engagement, Communication & Security',
    question: 'How will we communicate and share documents during the engagement?',
    answer:
      'We work through a mix of phone, email, scheduled calls, and in-person meetings where needed. For onboarding and recurring compliance, we share clear document requests and checklists, and many clients use our [Resources](/resources) page to prepare paperwork in advance.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'deadline-reminders',
    category: 'Engagement, Communication & Security',
    question: 'Will you remind us about upcoming due dates and pending documents?',
    answer:
      'Yes. For ongoing assignments, we track major due dates and follow up for pending information so filings are not left to the last minute. Timely responses from the client side still matter, but we do our part to keep the process organised and visible.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'data-security',
    category: 'Engagement, Communication & Security',
    question: 'How do you secure our financial data?',
    answer:
      'We treat client financial and personal data as highly confidential. Access is limited to the people working on the assignment, documents are handled through controlled channels, and we avoid unnecessary circulation of sensitive records. Our data-handling approach is also reflected in our [Privacy Policy](/privacy).',
    lastUpdated: FAQ_LAST_UPDATED,
  },
  {
    id: 'icai-ethics',
    category: 'Engagement, Communication & Security',
    question: 'Do you work within ICAI ethical and confidentiality standards?',
    answer:
      'Yes. Our work is guided by professional standards, confidentiality obligations, and ethical requirements applicable to Chartered Accountants, including the principles expected under the ICAI framework. Where independence, conflict checks, or scope limitations matter, we address those before or during engagement.',
    lastUpdated: FAQ_LAST_UPDATED,
  },
];
