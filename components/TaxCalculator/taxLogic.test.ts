
import { describe, it, expect } from 'vitest';
import { calculateRegimeTax } from './useTaxCalculation';
import { IncomeHeads, Deductions } from './types';

// Helper to create empty inputs
const createInputs = (salary = 0): { incomes: IncomeHeads, deds: Deductions } => ({
  incomes: { salary, houseProperty: 0, business: 0, capitalGains: 0, otherSources: 0 },
  deds: { d80c: 0, d80d: 0, hra: 0, d80e: 0, d80g: 0, d80tta: 0, d80ttb: 0, nps: 0, other: 0 }
});

describe('Tax Calculation Logic', () => {
  
  describe('New Regime', () => {
    it('should apply Standard Deduction of 75k', () => {
      const { incomes, deds } = createInputs(800000);
      const result = calculateRegimeTax('new', incomes, deds, 'below60');
      
      expect(result.stdDeduction).toBe(75000);
      expect(result.taxableIncome).toBe(725000); // 800k - 75k
    });

    it('should apply 87A Rebate for income up to 12L', () => {
      const { incomes, deds } = createInputs(1275000); // 12.75L Gross -> 12L Taxable
      const result = calculateRegimeTax('new', incomes, deds, 'below60');
      
      expect(result.taxableIncome).toBe(1200000);
      // Tax on 12L: 0-4 (0), 4-8 (20k), 8-12 (40k) = 60k
      expect(result.taxOnIncome).toBe(60000);
      // Rebate should equal tax since <= 12L
      expect(result.rebate).toBe(60000);
      expect(result.totalTax).toBe(0);
    });

    it('should calculate tax correctly for high income (30% slab)', () => {
        const { incomes, deds } = createInputs(3075000); // 30.75L Gross -> 30L Taxable
        const result = calculateRegimeTax('new', incomes, deds, 'below60');
        
        expect(result.taxableIncome).toBe(3000000);
        
        // Tax Calc:
        // 0-4L: 0
        // 4-8L: 20,000 (5%)
        // 8-12L: 40,000 (10%)
        // 12-16L: 60,000 (15%)
        // 16-20L: 80,000 (20%)
        // 20-24L: 100,000 (25%)
        // 24-30L: 1,80,000 (30% on 6L)
        // Total Base Tax: 4,80,000
        
        expect(result.taxOnIncome).toBe(480000);
        const expectedCess = 480000 * 0.04;
        expect(result.cess).toBe(expectedCess);
        expect(result.totalTax).toBe(480000 + expectedCess);
    });
  });

  describe('Old Regime', () => {
    it('should apply Standard Deduction of 50k and Chapter VI-A deductions', () => {
        const { incomes, deds } = createInputs(1000000);
        deds.d80c = 150000;
        deds.d80d = 25000;
        
        const result = calculateRegimeTax('old', incomes, deds, 'below60');
        
        expect(result.stdDeduction).toBe(50000);
        expect(result.chapterVIA).toBe(175000); // 1.5L + 25k
        expect(result.taxableIncome).toBe(1000000 - 50000 - 175000); // 7,75,000
    });

    it('should allow higher basic exemption limit for Senior Citizens', () => {
        const { incomes, deds } = createInputs(350000); // 3.5L Salary
        // 3.5L - 50k Std Ded = 3L Taxable
        
        // Case 1: Below 60 (Exemption 2.5L)
        const resultNormal = calculateRegimeTax('old', incomes, deds, 'below60');
        // Taxable 3L. 2.5L exempt. 50k @ 5% = 2500. Rebate 87A covers it.
        expect(resultNormal.taxableIncome).toBe(300000);
        expect(resultNormal.taxOnIncome).toBe(2500);

        // Case 2: 60-80 (Exemption 3L)
        const resultSenior = calculateRegimeTax('old', incomes, deds, '60to80');
        expect(resultSenior.taxableIncome).toBe(300000);
        expect(resultSenior.taxOnIncome).toBe(0); // Fully exempt
    });
  });

  describe('Surcharge & Marginal Relief', () => {
      it('should apply surcharge when income exceeds 50L', () => {
          const { incomes, deds } = createInputs(6000000); // 60L (Taxable approx 59.25L in new)
          // Simplified: Set taxable income directly by using exact business income
          const inputs = {
              incomes: { salary: 0, houseProperty: 0, business: 6000000, capitalGains: 0, otherSources: 0 },
              deds: { d80c: 0, d80d: 0, hra: 0, d80e: 0, d80g: 0, d80tta: 0, d80ttb: 0, nps: 0, other: 0 }
          };
          
          const result = calculateRegimeTax('new', inputs.incomes, inputs.deds, 'below60');
          expect(result.taxableIncome).toBe(6000000);
          expect(result.surcharge).toBeGreaterThan(0);
          
          // Tax on 60L New Regime:
          // 0-24L: 3,00,000
          // 24-60L: 36L * 30% = 10,80,000
          // Total Tax = 13,80,000
          // Surcharge 10% = 1,38,000
          
          expect(result.taxOnIncome).toBe(1380000);
          expect(result.surcharge).toBe(138000);
      });
  });

});
