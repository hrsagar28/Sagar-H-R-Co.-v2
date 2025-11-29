
export interface TaxResult {
  grossIncome: number;
  stdDeduction: number;
  chapterVIA: number;
  totalDeductions: number;
  taxableIncome: number;
  taxOnIncome: number;
  rebate: number;
  surcharge: number;
  marginalRelief: number;
  cess: number;
  totalTax: number;
}

export interface IncomeHeads {
  salary: number;
  houseProperty: number;
  business: number;
  capitalGains: number;
  otherSources: number;
}

export interface Deductions {
  d80c: number;
  d80d: number;
  hra: number;
  d80e: number;
  d80g: number;
  d80tta: number;
  d80ttb: number;
  nps: number;
  other: number;
}

export interface ComparisonResult {
  new: TaxResult;
  old: TaxResult;
  recommendation: 'new' | 'old' | 'equal';
  savings: number;
}

export interface TaxConfig {
  financialYear: string;
  assessmentYear: string;
  stdDeduction: {
    new: number;
    old: number;
  };
  deductionLimits: {
    d80c: number;
    d80tta: number;
    d80ttb: number;
    nps: number;
  };
  rebate: {
    new: { limit: number; amount: string | number };
    old: { limit: number; amount: number };
  };
  surchargeSlabs: {
    [key: string]: number;
  };
  newRegimeSlabs: {
    upto: number | null;
    rate: number;
  }[];
  oldRegimeConfig: {
    exemptions: {
      below60: number;
      "60to80": number;
      above80: number;
    };
    slabs: {
      upto: number | null;
      rate: number;
    }[];
  };
}
