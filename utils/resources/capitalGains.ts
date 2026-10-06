import {
  CII_BY_YEAR,
  INDEXATION_CUTOFF,
  NEW_ACT_FROM,
  PROPERTY_LONG_TERM_MONTHS,
  STAMP_DUTY_TOLERANCE,
} from '../../constants/resources/cii';
import { SPECIAL_RATES } from '../../constants/resources/incomeTax';

// Tax on the sale of land or a building. For a sale from 1 April 2026: s.197
// of the Income-tax Act, 2025, with the s.197(3) comparison for resident
// individuals and HUFs, s.72 (indexed cost), s.78 (stamp duty value) and s.90
// (cost for property held before 1 April 2001). For a sale in 2024-25 or
// 2025-26 the same rules stood in s.112, 48, 50C and 55 of the 1961 Act, with
// 20% with indexation for a sale before 23 July 2024.

/** The rate on indexed long-term gains, and the old rate before 23 July 2024. */
const INDEXED_RATE = 0.2;

/** The tax year (April to March) a date falls in: '2026-04-01' → '2026-27'. */
export const taxYearOf = (isoDate: string) => {
  const [year = 0, month = 1] = isoDate.split('-').map(Number);
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
};

/** The CII year used for a cost: the year it was incurred, but not before 2001-02. */
const indexYear = (year: string) => (year < '2001-02' ? '2001-02' : year);

/** An amount indexed from one tax year to another; null when either year has no index. */
export const indexedAmount = (amount: number, fromYear: string, toYear: string) => {
  const from = CII_BY_YEAR.get(indexYear(fromYear));
  const to = CII_BY_YEAR.get(toYear);
  return from && to ? { value: Math.round((amount * to) / from), from, to } : null;
};

/**
 * The tax years an improvement can be counted for: from the year of purchase
 * (or 2001-02 for property owned before 1 April 2001) to the year of sale.
 */
export const improvementYears = (purchaseDate: string, saleDate: string) => {
  const first = purchaseDate ? indexYear(taxYearOf(purchaseDate)) : '2001-02';
  const last = taxYearOf(saleDate);
  return [...CII_BY_YEAR.keys()].filter((year) => year >= first && year <= last);
};

export interface Improvement {
  /** The tax year the improvement was paid for, such as '2015-16'. */
  year: string;
  amount: number;
}

export interface PropertySaleInput {
  purchaseDate: string;
  saleDate: string;
  salePrice: number;
  /** Stamp duty value on the date of sale; 0 if not known. */
  stampDutyValue: number;
  /** Brokerage and other costs of the sale. */
  saleCosts: number;
  /** Purchase cost; for property held before 1 April 2001, the cost or its value on that date. */
  cost: number;
  improvements: Improvement[];
  residentIndividualOrHuf: boolean;
}

/**
 * How a long-term gain is taxed: 'indexed' at 20% with indexation (a sale
 * before 23 July 2024); 'lower' the lower of 12.5% and 20% with indexation;
 * 'plain' 12.5% without indexation.
 */
export type GainBasis = 'indexed' | 'lower' | 'plain';

export interface PropertySaleResult {
  longTerm: boolean;
  basis: GainBasis;
  /** The sale falls under the Income-tax Act, 2025 (from 1 April 2026); otherwise the 1961 Act. */
  newAct: boolean;
  /** The figure taken as the sale price (s.78). */
  consideration: number;
  stampDutyUsed: boolean;
  plainGain: number;
  /** Tax at 12.5% without indexation. */
  plainTax: number;
  indexedCost: number;
  indexedImprovements: number;
  indexedGain: number;
  /** Tax at 20% with indexation (0 when the indexed working shows a loss). */
  indexedTax: number;
  /** The tax payable, before surcharge and cess. */
  tax: number;
  /** The working that sets the tax. */
  method: 'plain' | 'indexed';
  saleIndex: number;
  costIndex: number;
}

/**
 * The date a number of months after another. When that month is shorter (29
 * February plus 24 months), it is the last day of the month.
 */
const addMonths = (isoDate: string, months: number) => {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month - 1 + months + 1, 0)).getUTCDate();
  const date = new Date(Date.UTC(year, month - 1 + months, Math.min(day, lastDay)));
  return date.toISOString().slice(0, 10);
};

export const calculatePropertyGain = (input: PropertySaleInput): PropertySaleResult | null => {
  const saleYear = taxYearOf(input.saleDate);
  const saleIndex = CII_BY_YEAR.get(saleYear);
  if (!saleIndex || input.purchaseDate >= input.saleDate) {
    return null;
  }
  const costIndex = CII_BY_YEAR.get(indexYear(taxYearOf(input.purchaseDate))) ?? 0;
  if (!costIndex) {
    return null;
  }

  // Held for more than 24 months.
  const longTerm = input.saleDate > addMonths(input.purchaseDate, PROPERTY_LONG_TERM_MONTHS);

  const stampDutyUsed = input.stampDutyValue > input.salePrice * STAMP_DUTY_TOLERANCE;
  const consideration = stampDutyUsed ? input.stampDutyValue : input.salePrice;

  // Only improvements paid for between the purchase and the sale; for property
  // owned before 1 April 2001, not those before that date (s.90(1)(b)).
  const years = new Set(improvementYears(input.purchaseDate, input.saleDate));
  const improvements = input.improvements.filter((item) => item.amount > 0 && years.has(item.year));
  const improvementTotal = improvements.reduce((sum, item) => sum + item.amount, 0);

  const plainGain = consideration - input.saleCosts - input.cost - improvementTotal;
  const plainTax = Math.max(0, plainGain) * SPECIAL_RATES.ltcg;

  const indexedCost = (input.cost * saleIndex) / costIndex;
  const indexedImprovements = improvements.reduce(
    (sum, item) => sum + (item.amount * saleIndex) / (CII_BY_YEAR.get(indexYear(item.year)) ?? saleIndex),
    0,
  );
  const indexedGain = consideration - input.saleCosts - indexedCost - indexedImprovements;
  const indexedTax = Math.max(0, indexedGain) * INDEXED_RATE;

  let basis: GainBasis = 'plain';
  if (input.saleDate < INDEXATION_CUTOFF) {
    basis = 'indexed';
  } else if (input.residentIndividualOrHuf && input.purchaseDate < INDEXATION_CUTOFF) {
    basis = 'lower';
  }
  const method = basis === 'indexed' || (basis === 'lower' && indexedTax < plainTax) ? 'indexed' : 'plain';

  return {
    longTerm,
    basis,
    newAct: input.saleDate >= NEW_ACT_FROM,
    consideration,
    stampDutyUsed,
    plainGain: Math.round(plainGain),
    plainTax: Math.round(plainTax),
    indexedCost: Math.round(indexedCost),
    indexedImprovements: Math.round(indexedImprovements),
    indexedGain: Math.round(indexedGain),
    indexedTax: Math.round(indexedTax),
    tax: Math.round(method === 'indexed' ? indexedTax : plainTax),
    method,
    saleIndex,
    costIndex,
  };
};
