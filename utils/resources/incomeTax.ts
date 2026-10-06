import {
  ADVANCE_TAX,
  CESS,
  DEDUCTIONS,
  HOUSE_PROPERTY,
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  REBATE,
  SPECIAL_RATES,
  STANDARD_DEDUCTION,
  SURCHARGE,
  type AgeBand,
  type Slab,
} from '../../constants/resources/incomeTax';

// Income tax for a resident individual, tax year 2026-27, under the new
// (default) regime of s.202 and the old regime (opting out under s.202(4)).
// Figures and the sections they come from are in constants/resources/incomeTax.ts.

export type Regime = 'new' | 'old';

export interface IncomeTaxInput {
  age: AgeBand;
  /** Gross salary for the year, including HRA and other taxable allowances. */
  salary: number;
  /** Basic pay plus DA for the year, for the employer-NPS limit. */
  basicAndDa: number;
  /** Old regime only. */
  professionalTax: number;
  /** Exempt HRA (old regime only), from the HRA calculator. */
  hraExempt: number;
  employerNps: number;
  governmentEmployer: boolean;
  /** A house let out: rent for the year, municipal tax paid and home-loan interest. */
  letOutRent: number;
  municipalTax: number;
  letOutInterest: number;
  /** Home-loan interest on the house you live in (old regime only). */
  selfOccupiedInterest: number;
  /** Profit from a business or profession. */
  businessIncome: number;
  /** Interest and other income taxed at normal rates. */
  otherIncome: number;
  /** Of other income: savings account interest, or for a senior citizen any bank or post office deposit interest. */
  depositInterest: number;
  /** Short-term gains on listed shares and equity funds (s.196). */
  stcgEquity: number;
  /** Long-term gains on listed shares and equity funds (s.198). */
  ltcgEquity: number;
  /** Other long-term gains, such as property, gold or unlisted shares (s.197). */
  ltcgOther: number;
  /** Old-regime deductions. */
  investments: number;
  ownNps: number;
  healthSelf: number;
  healthParents: number;
  parentsSenior: boolean;
  educationLoanInterest: number;
  donations: number;
  /** TDS and TCS expected for the year, for advance tax. */
  taxDeducted: number;
  /** Business income declared on a presumptive basis (s.58: the old 44AD or 44ADA). */
  presumptive: boolean;
}

export const EMPTY_INCOME_TAX_INPUT: IncomeTaxInput = {
  age: 'below60',
  salary: 0,
  basicAndDa: 0,
  professionalTax: 0,
  hraExempt: 0,
  employerNps: 0,
  governmentEmployer: false,
  letOutRent: 0,
  municipalTax: 0,
  letOutInterest: 0,
  selfOccupiedInterest: 0,
  businessIncome: 0,
  otherIncome: 0,
  depositInterest: 0,
  stcgEquity: 0,
  ltcgEquity: 0,
  ltcgOther: 0,
  investments: 0,
  ownNps: 0,
  healthSelf: 0,
  healthParents: 0,
  parentsSenior: false,
  educationLoanInterest: 0,
  donations: 0,
  taxDeducted: 0,
  presumptive: false,
};

export interface RegimeResult {
  regime: Regime;
  salaryIncome: number;
  houseProperty: number;
  /** A house-property loss that cannot reduce other income this year. */
  housePropertyLossNotSetOff: number;
  grossNormalIncome: number;
  deductions: number;
  /** Income taxed at the slab rates. */
  normalIncome: number;
  /** Capital gains taxed at special rates. */
  specialGains: number;
  totalIncome: number;
  slabTax: number;
  specialTax: number;
  rebate: number;
  surcharge: number;
  /** Marginal relief taken off the surcharge. */
  marginalRelief: number;
  cess: number;
  /** The difference that rounding the tax to ₹10 makes to the rows above (s.516). */
  roundOff: number;
  total: number;
}

const slabTax = (income: number, slabs: Slab[]) => {
  let tax = 0;
  let floor = 0;
  for (const slab of slabs) {
    if (income <= floor) break;
    tax += (Math.min(income, slab.upTo) - floor) * slab.rate;
    floor = slab.upTo;
  }
  return tax;
};

const slabsFor = (regime: Regime, age: AgeBand) => (regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[age]);

/** The income on which no tax is charged (the first slab's top). */
const basicExemption = (regime: Regime, age: AgeBand) => slabsFor(regime, age)[0]?.upTo ?? 0;

interface Gains {
  stcg: number;
  ltcgEquity: number;
  ltcgOther: number;
}

interface TaxParts {
  slabTax: number;
  specialTax: number;
  ltcgEquityTax: number;
}

/**
 * Tax before rebate and surcharge. A resident's unused basic exemption
 * reduces the special-rate gains (s.196(2), 197(2), 198(3)), applied first to
 * the gains taxed at the highest rate.
 */
const taxParts = (normalIncome: number, gains: Gains, regime: Regime, age: AgeBand): TaxParts => {
  let shortfall = Math.max(0, basicExemption(regime, age) - normalIncome);
  const take = (amount: number) => {
    const used = Math.min(amount, shortfall);
    shortfall -= used;
    return amount - used;
  };
  const stcg = take(gains.stcg);
  const ltcgOther = take(gains.ltcgOther);
  const ltcgEquity = Math.max(0, take(gains.ltcgEquity) - SPECIAL_RATES.ltcgEquityExemption);
  const ltcgEquityTax = ltcgEquity * SPECIAL_RATES.ltcg;
  return {
    slabTax: slabTax(normalIncome, slabsFor(regime, age)),
    specialTax: stcg * SPECIAL_RATES.stcgEquity + ltcgOther * SPECIAL_RATES.ltcg + ltcgEquityTax,
    ltcgEquityTax,
  };
};

/** s.156. Returns the rebate and how much of it came off the slab tax. */
const rebateFor = (parts: TaxParts, totalIncome: number, regime: Regime) => {
  if (regime === 'new') {
    const { incomeLimit, max } = REBATE.new;
    // The rebate cannot exceed tax at the s.202(1) rates (s.156(3)).
    if (totalIncome <= incomeLimit) {
      return Math.min(parts.slabTax, max);
    }
    const before = parts.slabTax + parts.specialTax;
    const excess = totalIncome - incomeLimit;
    return before > excess ? Math.min(before - excess, parts.slabTax) : 0;
  }
  const { incomeLimit, max } = REBATE.old;
  if (totalIncome > incomeLimit) return 0;
  // Not against tax on long-term gains on listed equity (s.198(7)).
  return Math.min(parts.slabTax + parts.specialTax - parts.ltcgEquityTax, max);
};

const surchargeRate = (totalIncome: number, otherIncome: number, regime: Regime) => {
  let rate = 0;
  for (const band of SURCHARGE.bands) {
    // The 25% and 37% bands look at income other than capital gains and dividends.
    const measure = band.rate > 0.15 ? otherIncome : totalIncome;
    if (measure > band.above) rate = band.rate;
    else if (band.rate <= 0.15 && totalIncome <= band.above) break;
  }
  return regime === 'new' ? Math.min(rate, SURCHARGE.newRegimeMax) : rate;
};

/** Tax and surcharge on a given split of income, with no marginal relief. */
const taxAndSurcharge = (normalIncome: number, gains: Gains, regime: Regime, age: AgeBand) => {
  const parts = taxParts(normalIncome, gains, regime, age);
  const specialGains = gains.stcg + gains.ltcgEquity + gains.ltcgOther;
  const totalIncome = normalIncome + specialGains;
  const rebate = rebateFor(parts, totalIncome, regime);
  const slabAfter = Math.max(0, parts.slabTax - rebate);
  const specialAfter = Math.max(0, parts.specialTax - Math.max(0, rebate - parts.slabTax));
  const rate = surchargeRate(totalIncome, normalIncome, regime);
  const surcharge = slabAfter * rate + specialAfter * Math.min(rate, SURCHARGE.capitalGainsMax);
  return { parts, rebate, tax: slabAfter + specialAfter, surcharge, totalIncome };
};

/** Lower the income to `target`, from normal income first. */
const reducedTo = (normalIncome: number, gains: Gains, target: number): [number, Gains] => {
  let cut = normalIncome + gains.stcg + gains.ltcgEquity + gains.ltcgOther - target;
  const lower = (amount: number) => {
    const used = Math.min(amount, Math.max(0, cut));
    cut -= used;
    return amount - used;
  };
  const normal = lower(normalIncome);
  return [normal, { ltcgOther: lower(gains.ltcgOther), ltcgEquity: lower(gains.ltcgEquity), stcg: lower(gains.stcg) }];
};

/** Whole rupees, without a negative zero. */
const whole = (value: number) => Math.round(value) || 0;

/** s.516: paise are ignored and the amount is rounded to the nearest ₹10, ₹5 and above going up. */
const roundTen = (value: number) => Math.round(Math.floor(value) / 10) * 10;

/** Total income rounded under s.516, the difference taken from normal income where there is any. */
const roundedIncome = (normalIncome: number, gains: Gains): [number, Gains] => {
  const total = normalIncome + gains.stcg + gains.ltcgEquity + gains.ltcgOther;
  const delta = roundTen(total) - total;
  if (!delta) return [normalIncome, gains];
  if (normalIncome > 0 && normalIncome + delta >= 0) return [normalIncome + delta, gains];
  const key = (['ltcgOther', 'stcg', 'ltcgEquity'] as const).find((k) => gains[k] > 0 && gains[k] + delta >= 0);
  return key ? [normalIncome, { ...gains, [key]: gains[key] + delta }] : [normalIncome, gains];
};

export const calculateRegime = (input: IncomeTaxInput, regime: Regime): RegimeResult => {
  const senior = input.age !== 'below60';
  const isNew = regime === 'new';

  // Salary: standard deduction (s.19), and in the old regime professional tax and exempt HRA.
  const standard = Math.min(input.salary, isNew ? STANDARD_DEDUCTION.new : STANDARD_DEDUCTION.old);
  const salaryIncome = Math.max(
    0,
    input.salary - standard - (isNew ? 0 : input.professionalTax + Math.min(input.hraExempt, input.salary)),
  );

  // House property (s.22): 30% of the let-out annual value, interest, and the self-occupied cap.
  const annualValue = Math.max(0, input.letOutRent - input.municipalTax);
  const letOut = annualValue * (1 - HOUSE_PROPERTY.standardDeduction) - input.letOutInterest;
  const selfOccupied = isNew ? 0 : Math.min(input.selfOccupiedInterest, HOUSE_PROPERTY.selfOccupiedInterestCap);
  const property = letOut - selfOccupied;
  // A loss cannot reduce other income in the new regime, and only up to ₹2 lakh in the old (s.109).
  const allowedLoss = isNew ? 0 : HOUSE_PROPERTY.lossSetOffCap;
  const houseProperty = Math.max(property, -allowedLoss);
  const housePropertyLossNotSetOff = Math.max(0, houseProperty - property);

  const grossNormalIncome = Math.max(0, salaryIncome + houseProperty + input.businessIncome + input.otherIncome);

  // Chapter VIII deductions come off income other than special-rate gains.
  const npsShare =
    isNew || input.governmentEmployer ? DEDUCTIONS.employerNps.newRegime : DEDUCTIONS.employerNps.oldRegime;
  const employerNps = Math.min(input.employerNps, npsShare * input.basicAndDa);
  let deductions = employerNps;
  if (!isNew) {
    const healthCap = (isSenior: boolean) =>
      isSenior ? DEDUCTIONS.healthInsurance.senior : DEDUCTIONS.healthInsurance.normal;
    deductions +=
      Math.min(input.investments, DEDUCTIONS.investments) +
      Math.min(input.ownNps, DEDUCTIONS.ownNps) +
      Math.min(input.healthSelf, healthCap(senior)) +
      Math.min(input.healthParents, healthCap(input.parentsSenior)) +
      input.educationLoanInterest +
      input.donations +
      Math.min(
        input.depositInterest,
        input.otherIncome,
        senior ? DEDUCTIONS.depositInterest.senior : DEDUCTIONS.depositInterest.savings,
      );
  }
  deductions = Math.min(deductions, grossNormalIncome);
  const [normalIncome, gains] = roundedIncome(grossNormalIncome - deductions, {
    stcg: input.stcgEquity,
    ltcgEquity: input.ltcgEquity,
    ltcgOther: input.ltcgOther,
  });
  const specialGains = gains.stcg + gains.ltcgEquity + gains.ltcgOther;
  const now = taxAndSurcharge(normalIncome, gains, regime, input.age);

  // Marginal relief: tax and surcharge may not exceed those at the threshold
  // crossed, plus the income above it.
  let marginalRelief = 0;
  if (now.surcharge > 0) {
    const threshold = [...SURCHARGE.bands].reverse().find((band) => now.totalIncome > band.above)?.above ?? 0;
    const [normalAt, gainsAt] = reducedTo(normalIncome, gains, threshold);
    const at = taxAndSurcharge(normalAt, gainsAt, regime, input.age);
    const cap = at.tax + at.surcharge + (now.totalIncome - threshold);
    marginalRelief = Math.min(now.surcharge, Math.max(0, now.tax + now.surcharge - cap));
  }

  const surcharge = now.surcharge - marginalRelief;
  const cess = (now.tax + surcharge) * CESS;
  const total = roundTen(now.tax + surcharge + cess);
  const shown =
    whole(now.parts.slabTax) + whole(now.parts.specialTax) - whole(now.rebate) + whole(surcharge) + whole(cess);
  return {
    regime,
    salaryIncome: whole(salaryIncome),
    houseProperty: whole(houseProperty),
    housePropertyLossNotSetOff: whole(housePropertyLossNotSetOff),
    grossNormalIncome: whole(grossNormalIncome),
    deductions: whole(deductions),
    normalIncome: whole(normalIncome),
    specialGains: whole(specialGains),
    totalIncome: whole(now.totalIncome),
    slabTax: whole(now.parts.slabTax),
    specialTax: whole(now.parts.specialTax),
    rebate: whole(now.rebate),
    surcharge: whole(surcharge),
    marginalRelief: whole(marginalRelief),
    cess: whole(cess),
    roundOff: total - shown,
    total,
  };
};

export const compareRegimes = (input: IncomeTaxInput) => {
  const newRegime = calculateRegime(input, 'new');
  const oldRegime = calculateRegime(input, 'old');
  return { newRegime, oldRegime, better: oldRegime.total < newRegime.total ? ('old' as const) : ('new' as const) };
};

export interface AdvanceTaxInput {
  /** The year's tax, after rebate, with surcharge and cess. */
  tax: number;
  /** TDS and TCS expected for the year. */
  deducted: number;
  senior: boolean;
  hasBusinessIncome: boolean;
  presumptive: boolean;
}

export type AdvanceTaxResult =
  | { due: false; reason: 'below-threshold' | 'senior'; net: number }
  | { due: true; net: number; instalments: { date: string; share: number; byThen: number }[] };

/** Advance tax for the year (s.404, s.408): what must have been paid by each date. */
export const advanceTax = (input: AdvanceTaxInput): AdvanceTaxResult => {
  const net = Math.max(0, input.tax - input.deducted);
  if (input.senior && !input.hasBusinessIncome) return { due: false, reason: 'senior', net };
  if (net < ADVANCE_TAX.threshold) return { due: false, reason: 'below-threshold', net };
  const schedule =
    input.presumptive && input.hasBusinessIncome
      ? [{ date: ADVANCE_TAX.presumptiveDate, share: 1 }]
      : ADVANCE_TAX.instalments;
  return {
    due: true,
    net,
    instalments: schedule.map((item) => ({ ...item, byThen: Math.round(net * item.share) })),
  };
};
