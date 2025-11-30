
import { useMemo } from 'react';
import { TaxResult, IncomeHeads, Deductions, ComparisonResult } from './types';
import { TAX_CONFIG } from '../../constants/taxConfig';

/**
 * Calculates tax based on a set of iterative slabs (New Regime style).
 * Slabs must be ordered by limit.
 */
const calculateSlabTax = (taxableIncome: number, slabs: typeof TAX_CONFIG.slabs.new) => {
  let tax = 0;
  let prevLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome <= prevLimit) break;

    const currentLimit = slab.upto;
    const taxableInThisSlab = Math.min(taxableIncome, currentLimit) - prevLimit;
    
    if (taxableInThisSlab > 0) {
      tax += taxableInThisSlab * slab.rate;
    }

    prevLimit = currentLimit;
  }
  return tax;
};

/**
 * Calculates tax for Old Regime style (Basic Exemption Limit + Fixed Slabs).
 */
const calculateOldRegimeTax = (taxableIncome: number, age: string) => {
  let tax = 0;
  
  // Determine Exemption Limit
  const exemptionLimit = TAX_CONFIG.slabs.old.exemptions[age as keyof typeof TAX_CONFIG.slabs.old.exemptions] || TAX_CONFIG.slabs.old.exemptions.below60;
  
  // Slabs: 0-Exempt, Exempt-5L, 5L-10L, 10L+
  // We manually map the standard old regime structure based on config rates
  // Rate 1: 5% (typically 2.5L to 5L)
  if (taxableIncome > exemptionLimit) {
    // Income between Exemption and 5L
    const slab1Limit = 500000;
    if (slab1Limit > exemptionLimit) {
       const taxableInSlab1 = Math.min(taxableIncome, slab1Limit) - exemptionLimit;
       if (taxableInSlab1 > 0) tax += taxableInSlab1 * 0.05;
    }
  }

  // Rate 2: 20% (5L to 10L)
  if (taxableIncome > 500000) {
    const slab2Limit = 1000000;
    const taxableInSlab2 = Math.min(taxableIncome, slab2Limit) - 500000;
    if (taxableInSlab2 > 0) tax += taxableInSlab2 * 0.20;
  }

  // Rate 3: 30% (Above 10L)
  if (taxableIncome > 1000000) {
    const taxableInSlab3 = taxableIncome - 1000000;
    tax += taxableInSlab3 * 0.30;
  }

  return tax;
};

export const calculateRegimeTax = (
  r: 'new' | 'old', 
  incomes: IncomeHeads, 
  deds: Deductions, 
  age: string
): TaxResult => {
  
  // 1. Gross Total Income
  const grossIncome = Object.values(incomes).reduce((a, b) => a + Number(b), 0);

  // 2. Standard Deduction
  const stdDedLimit = r === 'new' ? TAX_CONFIG.stdDeduction.new : TAX_CONFIG.stdDeduction.old;
  const stdDeduction = Math.min(Number(incomes.salary), stdDedLimit);

  // 3. Chapter VI-A Deductions
  let chapterVIA = 0;

  if (r === 'old') {
    const d80c = Math.min(Number(deds.d80c), TAX_CONFIG.limits.d80c); 
    const d80d = Number(deds.d80d);
    const d80e = Number(deds.d80e);
    const d80g = Number(deds.d80g);
    const nps = Math.min(Number(deds.nps), TAX_CONFIG.limits.nps); 
    
    let interestDed = 0;
    if (age === 'below60') {
      interestDed = Math.min(Number(deds.d80tta), TAX_CONFIG.limits.d80tta);
    } else {
      interestDed = Math.min(Number(deds.d80ttb), TAX_CONFIG.limits.d80ttb);
    }

    chapterVIA = d80c + d80d + Number(deds.hra) + d80e + d80g + nps + interestDed + Number(deds.other);
  } else {
    // New regime typically disallows these, though 80CCD(2) is allowed (not handled here for simplicity)
    chapterVIA = 0; 
  }

  const totalDeductions = stdDeduction + chapterVIA;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // 4. Tax Slab Calculation
  let tax = 0;

  if (r === 'new') {
    tax = calculateSlabTax(taxableIncome, TAX_CONFIG.slabs.new);
  } else {
    tax = calculateOldRegimeTax(taxableIncome, age);
  }

  // 5. Rebate u/s 87A
  let rebate = 0;
  let marginalRelief87A = 0;

  if (r === 'new') {
     const { limit } = TAX_CONFIG.rebate87A.new;
     if (taxableIncome <= limit) {
       rebate = tax;
     } else {
       // Marginal relief for New Regime
       // If Income exceeds limit slightly, Tax payable should not exceed (Income - Limit)
       const excessIncome = taxableIncome - limit;
       // Valid range for check is roughly up to limit + potential tax
       // Heuristic check: check if (Tax - Excess) > 0
       if (tax > excessIncome) {
           marginalRelief87A = tax - excessIncome;
       }
     }
  } else {
     const { limit, amount } = TAX_CONFIG.rebate87A.old;
     if (taxableIncome <= limit) {
       rebate = Math.min(tax, amount as number);
     }
  }

  let taxAfterRebate = Math.max(0, tax - rebate - marginalRelief87A);

  // 6. Surcharge & Marginal Relief
  let surcharge = 0;
  let surchargeRate = 0;
  
  // Find applicable surcharge slab
  // Iterate slabs in ascending order to find highest applicable rate
  // Slabs structure: { min: 50L, rate: 0.10 }
  
  // Default max surcharge for New Regime is usually capped at 25% for income > 5Cr
  // For Old Regime it can go to 37%
  const maxSurchargeRate = r === 'new' ? 0.25 : TAX_CONFIG.surcharge.oldRegimeHighRate;

  for (const slab of TAX_CONFIG.surcharge.slabs) {
      if (taxableIncome > slab.min) {
          surchargeRate = Math.min(slab.rate, maxSurchargeRate);
      }
  }

  let basicSurcharge = taxAfterRebate * surchargeRate;
  let surchargeMarginalRelief = 0;

  if (surchargeRate > 0) {
      // Calculate Marginal Relief for Surcharge
      // 1. Find the immediate lower threshold
      let threshold = 0;
      for (let i = TAX_CONFIG.surcharge.slabs.length - 1; i >= 0; i--) {
          if (taxableIncome > TAX_CONFIG.surcharge.slabs[i].min) {
              threshold = TAX_CONFIG.surcharge.slabs[i].min;
              break;
          }
      }

      // 2. Tax on Threshold Income
      // We recursively call calculation for the exact threshold amount to get base tax
      // (Optimization: Inlining simple calc to avoid deep recursion loop issues)
      let taxAtThreshold = 0;
      if (r === 'new') taxAtThreshold = calculateSlabTax(threshold, TAX_CONFIG.slabs.new);
      else taxAtThreshold = calculateOldRegimeTax(threshold, age);
      
      // 3. Surcharge on Threshold Tax
      // Find rate applicable AT the threshold (not above)
      let thresholdSurchargeRate = 0;
      // Look for the slab where min equals threshold? No, look for slab strictly below or equal
      // Actually simpler: if threshold is 50L, rate is 0. If 1Cr, rate is 10%.
      for (const slab of TAX_CONFIG.surcharge.slabs) {
          if (threshold > slab.min) { 
             thresholdSurchargeRate = Math.min(slab.rate, maxSurchargeRate);
          }
      }
      // Edge case: if threshold is 50L, surcharge is 0. 
      
      const taxOnThresholdWithSurcharge = taxAtThreshold + (taxAtThreshold * thresholdSurchargeRate);
      
      // 4. Max Tax Payable = Tax on Threshold + (Income - Threshold)
      const excessIncome = taxableIncome - threshold;
      const maxTaxPayable = taxOnThresholdWithSurcharge + excessIncome;
      
      const totalTaxWithCurrentSurcharge = taxAfterRebate + basicSurcharge;
      
      if (totalTaxWithCurrentSurcharge > maxTaxPayable) {
          surchargeMarginalRelief = totalTaxWithCurrentSurcharge - maxTaxPayable;
          // Surcharge is reduced by the relief amount
          surcharge = basicSurcharge - surchargeMarginalRelief;
      } else {
          surcharge = basicSurcharge;
      }
  } else {
      surcharge = basicSurcharge;
  }

  const totalMarginalRelief = marginalRelief87A + surchargeMarginalRelief;
  const finalTaxBeforeCess = Math.max(0, tax + surcharge - rebate - totalMarginalRelief);
  const cess = finalTaxBeforeCess * TAX_CONFIG.cess;
  const totalTax = finalTaxBeforeCess + cess;

  return {
      grossIncome,
      stdDeduction,
      chapterVIA,
      totalDeductions,
      taxableIncome,
      taxOnIncome: tax,
      rebate,
      surcharge,
      marginalRelief: totalMarginalRelief,
      cess,
      totalTax
  };
};

export const useTaxCalculation = (
  incomeHeads: IncomeHeads, 
  deductions: Deductions, 
  ageGroup: string
): ComparisonResult => {
  return useMemo(() => {
    const newRegimeTax = calculateRegimeTax('new', incomeHeads, deductions, ageGroup);
    const oldRegimeTax = calculateRegimeTax('old', incomeHeads, deductions, ageGroup);
    
    let recommendation: 'new' | 'old' | 'equal' = 'equal';
    let savings = 0;

    if (newRegimeTax.totalTax < oldRegimeTax.totalTax) {
        recommendation = 'new';
        savings = oldRegimeTax.totalTax - newRegimeTax.totalTax;
    } else if (oldRegimeTax.totalTax < newRegimeTax.totalTax) {
        recommendation = 'old';
        savings = newRegimeTax.totalTax - oldRegimeTax.totalTax;
    }

    return {
        new: newRegimeTax,
        old: oldRegimeTax,
        recommendation,
        savings
    };
  }, [incomeHeads, deductions, ageGroup]);
};
