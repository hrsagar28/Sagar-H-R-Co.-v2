import { describe, expect, it } from 'vitest';
import { calculateGst } from './gst';
import { calculateHra } from './hra';
import { calculatePropertyGain, taxYearOf } from './capitalGains';
import { calculateRegime, compareRegimes, EMPTY_INCOME_TAX_INPUT, type IncomeTaxInput } from './incomeTax';
import { cleanAmount, rupees, toAmount } from './format';

const income = (over: Partial<IncomeTaxInput>): IncomeTaxInput => ({ ...EMPTY_INCOME_TAX_INPUT, ...over });

describe('format', () => {
  it('groups in the Indian style and reads typed amounts', () => {
    expect(rupees(1234567)).toBe('₹12,34,567');
    expect(cleanAmount('₹1,20,000.505')).toBe('120000.50');
    expect(toAmount('abc')).toBe(0);
    expect(toAmount('1,00,000')).toBe(100000);
  });
});

describe('GST', () => {
  it('adds 18% within the state, split into CGST and SGST', () => {
    expect(calculateGst(1000, 18, 'add', 'same-state')).toEqual({
      taxable: 1000,
      gst: 180,
      total: 1180,
      cgst: 90,
      sgst: 90,
      igst: 0,
    });
  });
  it('takes 5% out of an inclusive price as IGST', () => {
    const result = calculateGst(1050, 5, 'remove', 'other-state');
    expect(result.taxable).toBe(1000);
    expect(result.igst).toBe(50);
    expect(result.cgst).toBe(0);
  });
  it('keeps CGST plus SGST equal to the tax when the paise do not halve evenly', () => {
    const result = calculateGst(10.05, 3, 'add', 'same-state');
    expect(result.cgst + result.sgst).toBeCloseTo(result.gst, 2);
  });
});

describe('HRA (Rule 279)', () => {
  it('takes the least of the three limits', () => {
    const result = calculateHra({
      basic: 50000,
      da: 0,
      hraReceived: 20000,
      rentPaid: 25000,
      months: 12,
      listedCity: true,
    });
    expect(result.limits).toEqual({ received: 240000, rent: 240000, salary: 300000 });
    expect(result.exempt).toBe(240000);
    expect(result.taxable).toBe(0);
  });
  it('uses 40% outside the eight cities, and nothing when rent is under 10% of salary', () => {
    expect(
      calculateHra({ basic: 30000, da: 0, hraReceived: 15000, rentPaid: 20000, months: 12, listedCity: false }),
    ).toMatchObject({ exempt: 144000, least: 'salary', taxable: 36000 });
    expect(
      calculateHra({ basic: 50000, da: 0, hraReceived: 10000, rentPaid: 4000, months: 12, listedCity: false }),
    ).toMatchObject({ exempt: 0, least: 'rent', taxable: 120000 });
  });
});

describe('capital gains on property (s.197)', () => {
  it('works out the tax years', () => {
    expect(taxYearOf('2026-04-01')).toBe('2026-27');
    expect(taxYearOf('2027-03-31')).toBe('2026-27');
    expect(taxYearOf('2010-06-15')).toBe('2010-11');
  });

  // The example in the firm's article capital-gains-property-12-5-vs-indexation.md.
  const plot = {
    purchaseDate: '2010-06-15',
    saleDate: '2026-08-01',
    salePrice: 14000000,
    stampDutyValue: 0,
    saleCosts: 0,
    cost: 3500000,
    improvements: [],
  };

  it('gives a resident the lower 20%-with-indexation figure', () => {
    const result = calculatePropertyGain({ ...plot, residentIndividualOrHuf: true });
    expect(result?.plainTax).toBe(1312500);
    expect(result?.indexedCost).toBe(8047904);
    expect(result?.indexedTax).toBe(1190419);
    expect(result?.method).toBe('indexed');
    expect(result?.tax).toBe(1190419);
  });
  it('charges others 12.5% without indexation', () => {
    const result = calculatePropertyGain({ ...plot, residentIndividualOrHuf: false });
    expect(result?.comparisonAvailable).toBe(false);
    expect(result?.tax).toBe(1312500);
  });
  it('has no comparison for property bought on or after 23 July 2024, and treats 24 months or less as short-term', () => {
    const recent = calculatePropertyGain({ ...plot, purchaseDate: '2024-07-23', residentIndividualOrHuf: true });
    expect(recent?.longTerm).toBe(true);
    expect(recent?.comparisonAvailable).toBe(false);
    const quick = calculatePropertyGain({
      ...plot,
      purchaseDate: '2024-08-01',
      saleDate: '2026-07-31',
      residentIndividualOrHuf: true,
    });
    expect(quick?.longTerm).toBe(false);
    const justOver = calculatePropertyGain({
      ...plot,
      purchaseDate: '2024-08-01',
      saleDate: '2026-08-02',
      residentIndividualOrHuf: true,
    });
    expect(justOver?.longTerm).toBe(true);
  });
  it('uses the stamp duty value when it is more than 110% of the price', () => {
    const result = calculatePropertyGain({ ...plot, stampDutyValue: 15500000, residentIndividualOrHuf: true });
    expect(result?.stampDutyUsed).toBe(true);
    expect(result?.consideration).toBe(15500000);
    const within = calculatePropertyGain({ ...plot, stampDutyValue: 15300000, residentIndividualOrHuf: true });
    expect(within?.stampDutyUsed).toBe(false);
  });
  it('indexes property held before 2001 from 2001-02 and ignores earlier improvements', () => {
    const result = calculatePropertyGain({
      ...plot,
      purchaseDate: '1995-01-01',
      cost: 1000000,
      improvements: [
        { year: '1999-00', amount: 500000 },
        { year: '2005-06', amount: 117000 },
      ],
      residentIndividualOrHuf: true,
    });
    expect(result?.costIndex).toBe(100);
    expect(result?.indexedCost).toBe(3840000);
    expect(result?.indexedImprovements).toBe(384000);
  });
});

describe('income tax, tax year 2026-27', () => {
  it('has no tax on a salary of ₹12.75 lakh in the new regime', () => {
    expect(calculateRegime(income({ salary: 1275000 }), 'new').total).toBe(0);
  });
  it('applies marginal relief just above ₹12 lakh', () => {
    // Taxable income ₹12.25 lakh: tax ₹63,750, relief leaves ₹25,000, plus cess.
    const result = calculateRegime(income({ salary: 1300000 }), 'new');
    expect(result.normalIncome).toBe(1225000);
    expect(result.rebate).toBe(38750);
    expect(result.total).toBe(26000);
  });
  it('taxes a ₹20 lakh salary in the new regime', () => {
    expect(calculateRegime(income({ salary: 2000000 }), 'new').total).toBe(192400);
  });
  it('allows old-regime deductions', () => {
    const result = calculateRegime(income({ salary: 1000000, investments: 200000 }), 'old');
    expect(result.deductions).toBe(150000);
    expect(result.normalIncome).toBe(800000);
    expect(result.total).toBe(75400);
  });
  it('gives the old-regime rebate up to ₹5 lakh, and higher slabs for senior citizens', () => {
    expect(calculateRegime(income({ salary: 550000 }), 'old').total).toBe(0);
    const senior = calculateRegime(income({ age: '60to79', otherIncome: 600000 }), 'old');
    expect(senior.slabTax).toBe(30000);
  });
  it('does not let a house-property loss reduce other income in the new regime, and caps it at ₹2 lakh in the old', () => {
    const input = income({ salary: 2000000, letOutRent: 120000, letOutInterest: 500000, selfOccupiedInterest: 250000 });
    const neu = calculateRegime(input, 'new');
    expect(neu.houseProperty).toBe(0);
    expect(neu.normalIncome).toBe(1925000);
    const old = calculateRegime(input, 'old');
    expect(old.houseProperty).toBe(-200000);
    expect(old.housePropertyLossNotSetOff).toBe(416000);
  });
  it('taxes equity gains at special rates, using unused basic exemption and the ₹1.25 lakh exemption', () => {
    const result = calculateRegime(income({ otherIncome: 300000, stcgEquity: 200000, ltcgEquity: 300000 }), 'new');
    // ₹1 lakh of unused exemption comes off the STCG; LTCG above ₹1.25 lakh at 12.5%.
    expect(result.specialTax).toBe(100000 * 0.2 + 175000 * 0.125);
    // Total income ₹8 lakh is within ₹12 lakh, but the rebate covers only slab tax (nil here).
    expect(result.rebate).toBe(0);
    expect(result.total).toBe(Math.round((20000 + 21875) * 1.04));
  });
  it('applies surcharge marginal relief just above ₹50 lakh', () => {
    const result = calculateRegime(income({ otherIncome: 5100000 }), 'new');
    expect(result.slabTax).toBe(1110000);
    expect(result.marginalRelief).toBe(41000);
    expect(result.total).toBe(1227200);
  });
  it('caps surcharge at 25% in the new regime and keeps 37% in the old', () => {
    const big = income({ otherIncome: 60000000 });
    const neu = calculateRegime(big, 'new');
    const old = calculateRegime(big, 'old');
    expect(neu.surcharge / neu.slabTax).toBeCloseTo(0.25, 2);
    expect(old.surcharge / old.slabTax).toBeCloseTo(0.37, 2);
  });
  it('limits surcharge on capital gains to 15%', () => {
    const result = calculateRegime(income({ otherIncome: 30000000, ltcgOther: 30000000 }), 'new');
    const expected = result.slabTax * 0.25 + result.specialTax * 0.15;
    expect(result.surcharge).toBe(Math.round(expected));
  });
  it('says which regime is cheaper', () => {
    expect(compareRegimes(income({ salary: 1500000 })).better).toBe('new');
    const heavy = income({
      salary: 1500000,
      hraExempt: 300000,
      investments: 150000,
      ownNps: 50000,
      healthSelf: 25000,
      healthParents: 50000,
      parentsSenior: true,
      selfOccupiedInterest: 200000,
    });
    expect(compareRegimes(heavy).better).toBe('old');
  });
});
