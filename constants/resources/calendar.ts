// Due dates falling between 1 April 2026 and 31 March 2027. Checked on
// 6 October 2026 against the CGST Rules, the Income-tax Rules 2026 (Rules 215,
// 218, 219), the Finance Act 2026, CBDT Circular 7/2026 (audit extension),
// CBIC Notification 01/2026-CT (GSTR-3B for March 2026), the Companies Act and
// LLP Rules, and Karnataka's Profession Tax Act. Assumes a company AGM on
// 30 September 2026. Monthly items are generated below so that no month is
// skipped; the one-off dates are listed after them.

export type DueCategory = 'gst' | 'income-tax' | 'tds' | 'company' | 'payroll';

export interface DueDate {
  /** YYYY-MM-DD */
  date: string;
  category: DueCategory;
  title: string;
  /** Who it is for, or what it covers. */
  detail?: string;
  /** A narrow filing (few readers need it), left out of "coming up" on the Resources page. */
  minor?: boolean;
}

export const DUE_CATEGORIES: { id: DueCategory; label: string }[] = [
  { id: 'gst', label: 'GST' },
  { id: 'income-tax', label: 'Income tax' },
  { id: 'tds', label: 'TDS and TCS' },
  { id: 'company', label: 'Company and LLP' },
  { id: 'payroll', label: 'Payroll' },
];

export const DUE_DATES_FROM = '2026-04-01';
export const DUE_DATES_TO = '2027-03-31';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;
const monthLabel = (year: number, month: number) => `${MONTH_NAMES[month - 1]} ${year}`;

/** "January to March 2026": the quarter that ends with the given month. */
const quarterLabel = (year: number, endMonth: number) => {
  const startMonth = endMonth - 2;
  return `${MONTH_NAMES[startMonth - 1]} to ${MONTH_NAMES[endMonth - 1]} ${year}`;
};

/** The date `days` days after the last day of a month. */
const daysAfterMonthEnd = (year: number, month: number, days: number) => {
  const end = new Date(Date.UTC(year, month, 0));
  end.setUTCDate(end.getUTCDate() + days);
  return end.toISOString().slice(0, 10);
};

const isQuarterEnd = (month: number) => month % 3 === 0;

const RECURRING: DueDate[] = (() => {
  const out: DueDate[] = [];
  // Each due month from April 2026 to March 2027, for the month before it.
  for (let i = 0; i < 12; i += 1) {
    const dueYear = i < 9 ? 2026 : 2027;
    const dueMonth = ((3 + i) % 12) + 1;
    const year = dueMonth === 1 ? dueYear - 1 : dueYear;
    const month = dueMonth === 1 ? 12 : dueMonth - 1;
    const period = monthLabel(year, month);

    // TDS and TCS deposits (Rule 218). For March 2026 the 1961 rules apply:
    // TCS by 7 April and TDS by 30 April.
    if (year === 2026 && month === 3) {
      out.push({ date: '2026-04-07', category: 'tds', title: 'Pay TCS collected in March 2026' });
      out.push({ date: '2026-04-30', category: 'tds', title: 'Pay TDS deducted in March 2026' });
      out.push({
        date: '2026-04-30',
        category: 'tds',
        title: 'Forms 26QB, 26QC, 26QD and 26QE for March 2026',
        detail: 'Rent paid by individuals, property purchase, payments by individuals above ₹50 lakh, digital assets',
      });
    } else {
      out.push({ date: ymd(dueYear, dueMonth, 7), category: 'tds', title: `Pay TDS and TCS for ${period}` });
      out.push({
        date: daysAfterMonthEnd(year, month, 30),
        category: 'tds',
        title: `Form 141 for ${period}`,
        detail: 'Rent paid by individuals, property purchase, payments by individuals above ₹50 lakh, digital assets',
      });
    }

    out.push({
      date: ymd(dueYear, dueMonth, 10),
      category: 'gst',
      title: `GSTR-7 and GSTR-8 for ${period}`,
      minor: true,
      detail: 'GST deductors (TDS) and e-commerce operators (TCS)',
    });
    out.push({
      date: ymd(dueYear, dueMonth, 11),
      category: 'gst',
      title: `GSTR-1 for ${period}`,
      detail: 'Monthly filers',
    });
    out.push({
      date: ymd(dueYear, dueMonth, 13),
      category: 'gst',
      title: `GSTR-5 and GSTR-6 for ${period}`,
      minor: true,
      detail: 'Non-resident taxable persons and input service distributors',
    });
    if (isQuarterEnd(month)) {
      out.push({
        date: ymd(dueYear, dueMonth, 13),
        category: 'gst',
        title: `GSTR-1 for ${quarterLabel(year, month)}`,
        detail: 'Quarterly (QRMP) filers',
      });
      out.push({
        date: ymd(dueYear, dueMonth, 18),
        category: 'gst',
        title: `CMP-08 for ${quarterLabel(year, month)}`,
        detail: 'Composition taxpayers',
      });
      out.push({
        date: ymd(dueYear, dueMonth, 22),
        category: 'gst',
        title: `GSTR-3B for ${quarterLabel(year, month)}`,
        detail: 'Quarterly (QRMP) filers in Karnataka',
      });
    } else {
      out.push({
        date: ymd(dueYear, dueMonth, 13),
        category: 'gst',
        title: `IFF for ${period} (optional)`,
        minor: true,
        detail: 'Quarterly (QRMP) filers, for the first two months of a quarter',
      });
      out.push({
        date: ymd(dueYear, dueMonth, 25),
        category: 'gst',
        title: `PMT-06 GST payment for ${period}`,
        detail: 'Quarterly (QRMP) filers',
      });
    }
    // GSTR-3B for March 2026 was extended by a day (Notification 01/2026-CT).
    const extended = year === 2026 && month === 3;
    out.push({
      date: ymd(dueYear, dueMonth, extended ? 21 : 20),
      category: 'gst',
      title: `GSTR-3B for ${period}`,
      detail: extended ? 'Monthly filers; extended from 20 April' : 'Monthly filers',
    });

    out.push({ date: ymd(dueYear, dueMonth, 15), category: 'payroll', title: `PF and ESI for ${period}` });
    out.push({
      date: ymd(dueYear, dueMonth, 20),
      category: 'payroll',
      title: `Professional tax for ${period}`,
      detail: 'Employers in Karnataka',
    });
  }
  return out;
})();

const ONE_OFF: DueDate[] = [
  // April to June 2026
  {
    date: '2026-04-25',
    category: 'gst',
    title: 'ITC-04 for 2025-26',
    detail: 'Goods sent to job workers; October to March for turnover above ₹5 crore, the whole year for others',
  },
  {
    date: '2026-04-30',
    category: 'company',
    title: 'MSME Form 1 for October 2025 to March 2026',
    detail: 'Payments to micro and small suppliers outstanding beyond 45 days',
  },
  { date: '2026-05-15', category: 'tds', title: 'TCS statement for January to March 2026 (Form 27EQ)' },
  { date: '2026-05-30', category: 'tds', title: 'TCS certificates for January to March 2026 (Form 27D)' },
  { date: '2026-05-30', category: 'company', title: 'LLP Form 11 (annual return) for 2025-26' },
  {
    date: '2026-05-30',
    category: 'company',
    title: 'PAS-6 for October 2025 to March 2026',
    detail: 'Unlisted public companies and private companies that are not small companies',
  },
  {
    date: '2026-05-30',
    category: 'payroll',
    title: 'Professional tax annual return for 2025-26',
    detail: 'Employers in Karnataka',
  },
  {
    date: '2026-05-31',
    category: 'tds',
    title: 'TDS statements for January to March 2026',
    detail: 'Forms 24Q, 26Q and 27Q',
  },
  { date: '2026-05-31', category: 'income-tax', title: 'Statement of financial transactions for 2025-26 (Form 61A)' },
  { date: '2026-06-15', category: 'income-tax', title: 'Advance tax, first instalment: 15% of the year’s tax' },
  {
    date: '2026-06-15',
    category: 'tds',
    title: 'Form 16 for 2025-26, and Form 16A for January to March 2026',
  },
  { date: '2026-06-30', category: 'gst', title: 'GSTR-4 for 2025-26', detail: 'Composition taxpayers' },
  { date: '2026-06-30', category: 'company', title: 'DPT-3 (return of deposits) for 2025-26' },
  // July to September 2026
  { date: '2026-07-15', category: 'company', title: 'Foreign liabilities and assets return (to RBI)' },
  {
    date: '2026-07-31',
    category: 'tds',
    title: 'TDS and TCS statements for April to June 2026',
    detail: 'Forms 138, 140, 144 and 143',
  },
  {
    date: '2026-07-31',
    category: 'income-tax',
    title: 'Income tax return for 2025-26',
    detail: 'Individuals and others without business income (ITR-1, ITR-2)',
  },
  { date: '2026-08-15', category: 'tds', title: 'Forms 131 and 133 for April to June 2026' },
  {
    date: '2026-08-31',
    category: 'income-tax',
    title: 'Income tax return for 2025-26',
    detail: 'Business or profession without an audit, and partners of such firms (ITR-3, ITR-4)',
  },
  { date: '2026-09-15', category: 'income-tax', title: 'Advance tax, second instalment: 45% of the year’s tax' },
  { date: '2026-09-30', category: 'company', title: 'Annual general meeting for 2025-26' },
  // October to December 2026
  { date: '2026-10-15', category: 'company', title: 'ADT-1 (auditor appointed at the AGM)' },
  {
    date: '2026-10-21',
    category: 'income-tax',
    title: 'Tax audit report for 2025-26',
    detail: 'Extended from 30 September (CBDT Circular 7/2026)',
  },
  {
    date: '2026-10-21',
    category: 'income-tax',
    title: 'Audit report of trusts and NPOs for 2025-26 (Forms 10B and 10BB)',
    detail: 'Extended from 30 September',
  },
  {
    date: '2026-10-25',
    category: 'gst',
    title: 'ITC-04 for April to September 2026',
    detail: 'Turnover above ₹5 crore',
  },
  { date: '2026-10-30', category: 'company', title: 'AOC-4 (financial statements) for 2025-26' },
  { date: '2026-10-30', category: 'company', title: 'LLP Form 8 (statement of account and solvency) for 2025-26' },
  {
    date: '2026-10-31',
    category: 'tds',
    title: 'TDS and TCS statements for July to September 2026',
    detail: 'Forms 138, 140, 144 and 143',
  },
  { date: '2026-10-31', category: 'company', title: 'MSME Form 1 for April to September 2026' },
  {
    date: '2026-10-31',
    category: 'income-tax',
    title: 'Transfer pricing report for 2025-26 (Form 3CEB)',
    detail: 'Not covered by the audit extension',
  },
  { date: '2026-11-15', category: 'tds', title: 'Forms 131 and 133 for July to September 2026' },
  {
    date: '2026-11-21',
    category: 'income-tax',
    title: 'Income tax return for 2025-26, audit cases',
    detail: 'Companies, audited businesses, trusts and partners of audited firms; extended from 31 October',
  },
  { date: '2026-11-29', category: 'company', title: 'MGT-7 or MGT-7A (annual return) for 2025-26' },
  {
    date: '2026-11-29',
    category: 'company',
    title: 'PAS-6 for April to September 2026',
    detail: 'Unlisted public companies and private companies that are not small companies',
  },
  {
    date: '2026-11-30',
    category: 'income-tax',
    title: 'Income tax return for 2025-26, transfer pricing cases',
  },
  { date: '2026-12-15', category: 'income-tax', title: 'Advance tax, third instalment: 75% of the year’s tax' },
  { date: '2026-12-31', category: 'gst', title: 'GSTR-9 and GSTR-9C for 2025-26' },
  { date: '2026-12-31', category: 'income-tax', title: 'Belated income tax return for 2025-26' },
  {
    date: '2026-12-31',
    category: 'income-tax',
    title: 'Revised income tax return for 2025-26, without a fee',
  },
  // January to March 2027
  {
    date: '2027-01-31',
    category: 'tds',
    title: 'TDS and TCS statements for October to December 2026',
    detail: 'Forms 138, 140, 144 and 143',
  },
  { date: '2027-02-15', category: 'tds', title: 'Forms 131 and 133 for October to December 2026' },
  {
    date: '2027-03-15',
    category: 'income-tax',
    title: 'Advance tax, last instalment: all of the year’s tax',
    detail: 'Presumptive taxpayers pay the whole amount by this date',
  },
  {
    date: '2027-03-31',
    category: 'income-tax',
    title: 'Revised income tax return for 2025-26, last date (with a fee)',
  },
  {
    date: '2027-03-31',
    category: 'income-tax',
    title: 'Updated return (ITR-U) for 2021-22, last date',
    detail: 'Assessment year 2022-23',
  },
];

const CATEGORY_ORDER: DueCategory[] = DUE_CATEGORIES.map((category) => category.id);

export const DUE_DATES: DueDate[] = [...RECURRING, ...ONE_OFF]
  .filter((due) => due.date >= DUE_DATES_FROM && due.date <= DUE_DATES_TO)
  .sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category),
  );
