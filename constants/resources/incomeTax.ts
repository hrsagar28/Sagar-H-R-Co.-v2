// Income-tax figures for tax year 2026-27 (Income-tax Act, 2025, as amended by
// the Finance Act, 2026). Checked against the official text on
// incometaxindia.gov.in on 6 October 2026; the source of each figure is noted.
// Rupee amounts are whole rupees; rates are fractions.

export interface Slab {
  /** Upper end of the band (inclusive); Infinity for the top band. */
  upTo: number;
  rate: number;
}

/** New (default) regime, s.202(1). */
export const NEW_REGIME_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

export type AgeBand = 'below60' | '60to79' | '80plus';

/** Old regime (opting out under s.202(4)): Finance Act 2026, First Schedule, Part III, Paragraph A. */
export const OLD_REGIME_SLABS: Record<AgeBand, Slab[]> = {
  below60: [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
  '60to79': [
    { upTo: 300000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
  '80plus': [
    { upTo: 500000, rate: 0 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
};

/** s.19(1), Table Sl. No. 2: ₹75,000 under s.202(1), ₹50,000 otherwise. */
export const STANDARD_DEDUCTION = { new: 75000, old: 50000 };

/** s.156: rebate for resident individuals. */
export const REBATE = {
  new: { incomeLimit: 1200000, max: 60000 },
  old: { incomeLimit: 500000, max: 12500 },
};

/** Special rates: s.196 (STCG on STT-paid equity), s.197 (LTCG), s.198 (LTCG on STT-paid equity). */
export const SPECIAL_RATES = {
  stcgEquity: 0.2,
  ltcg: 0.125,
  ltcgEquityExemption: 125000,
};

/**
 * Surcharge, Finance Act 2026 s.3 and First Schedule Part III Paragraph F:
 * 10% above ₹50 lakh, 15% above ₹1 crore, 25% above ₹2 crore and 37% above
 * ₹5 crore (both 25%/37% on income other than capital gains and dividends).
 * In the new regime the rate stops at 25%; on tax on capital gains under
 * s.196 to 198 it stops at 15%.
 */
export const SURCHARGE = {
  bands: [
    { above: 5000000, rate: 0.1 },
    { above: 10000000, rate: 0.15 },
    { above: 20000000, rate: 0.25 },
    { above: 50000000, rate: 0.37 },
  ],
  newRegimeMax: 0.25,
  capitalGainsMax: 0.15,
};

/** Health and Education Cess, Finance Act 2026 s.3(15). */
export const CESS = 0.04;

/** House property, s.22 and s.109. */
export const HOUSE_PROPERTY = {
  /** s.22(1)(a): 30% of the annual value. */
  standardDeduction: 0.3,
  /** s.22(2): interest on a self-occupied house, old regime only (s.202(2)(a)(v)). */
  selfOccupiedInterestCap: 200000,
  /** s.109: a house-property loss set off against other heads, old regime only (s.202(2)(b)(ii)). */
  lossSetOffCap: 200000,
};

/** Chapter VIII deductions; all except employer NPS are old regime only (s.202(2)(a)(xii)). */
export const DEDUCTIONS = {
  /** s.123 (old 80C). */
  investments: 150000,
  /** s.124(3) (old 80CCD(1B)). */
  ownNps: 50000,
  /** s.124(1)-(2): employer NPS, as a share of salary (basic + DA). */
  employerNps: { newRegime: 0.14, oldRegime: 0.1, government: 0.14 },
  /** s.126 (old 80D): self and family, and parents; ₹50,000 where the person is a senior citizen. */
  healthInsurance: { normal: 25000, senior: 50000 },
  /** s.153 (old 80TTA / 80TTB). */
  depositInterest: { savings: 10000, senior: 50000 },
};

/**
 * Advance tax, s.404 and s.408: due when the year's tax after TDS and TCS is
 * ₹10,000 or more; not for a resident senior citizen without business or
 * professional income; one instalment by 15 March for presumptive income
 * under s.58(2), Table entries 1 and 3 (the old 44AD and 44ADA).
 */
export const ADVANCE_TAX = {
  threshold: 10000,
  /**
   * s.425(1) Table: the share due by each date and the interest on a
   * shortfall (3% for each of the first three, 1% for the last). s.425(2):
   * none on the first if 12% was paid by then, or on the second if 36% was.
   */
  instalments: [
    { date: '2026-06-15', share: 0.15, rate: 0.03, enough: 0.12 },
    { date: '2026-09-15', share: 0.45, rate: 0.03, enough: 0.36 },
    { date: '2026-12-15', share: 0.75, rate: 0.03 },
    { date: '2027-03-15', share: 1, rate: 0.01 },
  ] as { date: string; share: number; rate: number; enough?: number }[],
  /** s.425(3): presumptive income, one date, 1% on the shortfall. */
  presumptiveDate: '2027-03-15',
  presumptiveRate: 0.01,
  /** Advance tax is what is paid within the tax year (s.406, s.407). */
  paidFrom: '2026-04-01',
  paidTo: '2027-03-31',
  /**
   * s.424: when advance tax paid is under 90% of the tax, 1% a month or part
   * of a month from 1 April after the tax year on the shortfall.
   */
  shortPayment: { below: 0.9, monthly: 0.01, from: '2027-04-01' },
  /** The return due date for most individuals, as the default date the rest is paid (s.263(1)). */
  balanceDate: '2027-07-31',
  /** Rule 269 of the Income-tax Rules, 2026: the amount is taken in whole hundreds of rupees. */
  roundTo: 100,
};
