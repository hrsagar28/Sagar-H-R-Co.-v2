import {
  CII_BY_YEAR,
  FMV_DATE,
  INDEXATION_CUTOFF,
  PROPERTY_LONG_TERM_MONTHS,
  STAMP_DUTY_TOLERANCE,
} from '../../constants/resources/cii';
import { SPECIAL_RATES } from '../../constants/resources/incomeTax';

// Tax on the sale of land or a building, tax year 2026-27: s.197 of the
// Income-tax Act, 2025, with the s.197(3) comparison for resident individuals
// and HUFs, s.72 (indexed cost), s.78 (stamp duty value) and s.90 (cost for
// property held before 1 April 2001).

/** The tax year (April to March) a date falls in: '2026-04-01' → '2026-27'. */
export const taxYearOf = (isoDate: string) => {
  const [year = 0, month = 1] = isoDate.split('-').map(Number);
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
};

/** The CII year used for a cost: the year it was incurred, but not before 2001-02. */
const indexYear = (year: string) => (year < '2001-02' ? '2001-02' : year);

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

export interface PropertySaleResult {
  longTerm: boolean;
  /** The figure taken as the sale price (s.78). */
  consideration: number;
  stampDutyUsed: boolean;
  plainGain: number;
  /** Tax at 12.5% without indexation. */
  plainTax: number;
  /** Whether the 20%-with-indexation comparison is available. */
  comparisonAvailable: boolean;
  indexedCost: number;
  indexedImprovements: number;
  indexedGain: number;
  /** Tax at 20% with indexation (0 when the indexed working shows a loss). */
  indexedTax: number;
  /** The tax payable, before surcharge and cess. */
  tax: number;
  /** 'indexed' when the 20% working is lower and applies. */
  method: 'plain' | 'indexed';
  saleIndex: number;
  costIndex: number;
}

const addMonths = (isoDate: string, months: number) => {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
};

export const calculatePropertyGain = (input: PropertySaleInput): PropertySaleResult | null => {
  const saleYear = taxYearOf(input.saleDate);
  const saleIndex = CII_BY_YEAR.get(saleYear);
  if (!saleIndex || input.purchaseDate >= input.saleDate) {
    return null;
  }
  const costYear = indexYear(taxYearOf(input.purchaseDate));
  const costIndex = CII_BY_YEAR.get(costYear) ?? 0;
  if (!costIndex) {
    return null;
  }

  // Held for more than 24 months.
  const longTerm = input.saleDate > addMonths(input.purchaseDate, PROPERTY_LONG_TERM_MONTHS);

  const stampDutyUsed = input.stampDutyValue > input.salePrice * STAMP_DUTY_TOLERANCE;
  const consideration = stampDutyUsed ? input.stampDutyValue : input.salePrice;

  // Improvements before 1 April 2001 are not counted for property owned before then (s.90(1)(b)).
  const ownedBefore2001 = input.purchaseDate < FMV_DATE;
  const improvements = input.improvements.filter(
    (item) => item.amount > 0 && CII_BY_YEAR.has(indexYear(item.year)) && !(ownedBefore2001 && item.year < '2001-02'),
  );
  const improvementTotal = improvements.reduce((sum, item) => sum + item.amount, 0);

  const plainGain = consideration - input.saleCosts - input.cost - improvementTotal;
  const plainTax = Math.max(0, plainGain) * SPECIAL_RATES.ltcg;

  const indexedCost = (input.cost * saleIndex) / costIndex;
  const indexedImprovements = improvements.reduce(
    (sum, item) => sum + (item.amount * saleIndex) / (CII_BY_YEAR.get(indexYear(item.year)) ?? saleIndex),
    0,
  );
  const indexedGain = consideration - input.saleCosts - indexedCost - indexedImprovements;
  const indexedTax = Math.max(0, indexedGain) * 0.2;

  const comparisonAvailable = longTerm && input.residentIndividualOrHuf && input.purchaseDate < INDEXATION_CUTOFF;
  const method = comparisonAvailable && indexedTax < plainTax ? 'indexed' : 'plain';

  return {
    longTerm,
    consideration,
    stampDutyUsed,
    plainGain: Math.round(plainGain),
    plainTax: Math.round(plainTax),
    comparisonAvailable,
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
