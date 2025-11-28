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
