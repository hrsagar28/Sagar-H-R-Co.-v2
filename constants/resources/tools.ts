// The Resources section (2026 redesign): an index at /resources and one page
// per tool at /resources/<slug>. Checklists keep their own address,
// /resources/checklist/<slug> (see checklists.ts).

export type ResourceGroup = 'calculators' | 'reference';

export interface ResourceTool {
  slug: string;
  name: string;
  /** One line for the index and the page's description. */
  summary: string;
  group: ResourceGroup;
  /** The Contact page subject the "ask us" band opens with (a service slug, or '' for none). */
  subject: string;
  /** Completes "Ask us about …" in the dark-green band. */
  ask: string;
}

/** The year every tool works for (the owner chose 2026-27 only, October 2026). */
export const RESOURCES_TAX_YEAR = '2026-27';

/** The date the figures in the tools were last checked against the law. */
export const RESOURCES_LAW_AS_AT = '2026-10-06';

export const RESOURCE_TOOLS: ResourceTool[] = [
  {
    slug: 'income-tax-calculator',
    name: 'Income tax calculator',
    summary: 'Your tax for 2026-27 under the new regime and the old, side by side.',
    group: 'calculators',
    subject: 'income-tax',
    ask: 'your income tax',
  },
  {
    slug: 'hra-calculator',
    name: 'HRA calculator',
    summary: 'How much of the house rent allowance you receive is exempt, under the old regime.',
    group: 'calculators',
    subject: 'income-tax',
    ask: 'your income tax',
  },
  {
    slug: 'capital-gains-calculator',
    name: 'Capital gains on property',
    summary: 'Tax on selling land or a building: 12.5%, or 20% with indexation where that is lower.',
    group: 'calculators',
    subject: 'income-tax',
    ask: 'a property sale',
  },
  {
    slug: 'gst-calculator',
    name: 'GST calculator',
    summary: 'Add GST to a price or take it out, with the CGST and SGST or IGST split.',
    group: 'calculators',
    subject: 'gst',
    ask: 'GST',
  },
  {
    slug: 'tds-tcs-rates',
    name: 'TDS and TCS rates',
    summary: 'Thresholds and rates for 2026-27 under the Income-tax Act, 2025, with the due dates.',
    group: 'reference',
    subject: 'tds-and-tcs',
    ask: 'TDS and TCS',
  },
  {
    slug: 'due-dates',
    name: 'Due dates',
    summary: 'GST, income tax, TDS, company, LLP and payroll due dates from April 2026 to March 2027.',
    group: 'reference',
    subject: '',
    ask: 'your compliance',
  },
];

export const RESOURCE_GROUPS: { id: ResourceGroup; name: string; description: string }[] = [
  {
    id: 'calculators',
    name: 'Calculators',
    description: 'Estimates for tax year 2026-27, under the Income-tax Act, 2025 and the GST rates now in force.',
  },
  {
    id: 'reference',
    name: 'Rates and dates',
    description: 'For anyone who deducts tax at source or files returns.',
  },
];

export const getResourceTool = (slug?: string) => RESOURCE_TOOLS.find((tool) => tool.slug === slug);
