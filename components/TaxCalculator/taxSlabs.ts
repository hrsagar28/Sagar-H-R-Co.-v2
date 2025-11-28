// Constants for Tax Calculation (AY 2026-27 / FY 2025-26)

export const STD_DEDUCTION_NEW = 75000;
export const STD_DEDUCTION_OLD = 50000;

export const DEDUCTION_LIMITS = {
  d80c: 150000,
  d80tta: 10000,
  d80ttb: 50000,
  nps: 50000,
};

export const REBATE_LIMIT_NEW = 1200000;
export const REBATE_LIMIT_OLD = 500000;
export const REBATE_AMOUNT_OLD = 12500;

export const SURCHARGE_SLABS = {
  1: 5000000,
  2: 10000000,
  3: 20000000,
  4: 50000000,
};

export const AGE_MAP: Record<string, string> = {
  'below60': 'General (Below 60)',
  '60to80': 'Senior Citizen (60-80)',
  'above80': 'Super Senior (80+)'
};
