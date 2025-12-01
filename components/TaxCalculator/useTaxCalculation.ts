
import { useMemo } from 'react';
import { TaxResult, IncomeHeads, Deductions, ComparisonResult, TaxConfig } from './types';

/**
 * Calculates tax based on a set of iterative slabs (New Regime style).
 * Slabs must be ordered by limit.
 */
const calculateSlabTax = (taxableIncome: number, slabs: { upto: number | null, rate: number }[]) => {
  let tax = 0;
  let prevLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome <= prevLimit) break;

    const currentLimit = slab.upto === null ? Infinity : slab.upto;
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
const calculateOldRegimeTax = (taxableIncome: number, age: string, config: TaxConfig) => {
  let tax = 0;
  
  // Determine Exemption Limit
  const exemptionLimit = config.oldRegimeConfig.exemptions[age as keyof typeof config.oldRegimeConfig.exemptions] || config.oldRegimeConfig.exemptions.below60;
  
  // Dynamic calculation based on config slabs
  // We assume the first slab starts after exemption limit
  const slabs = config.oldRegimeConfig.slabs;
  let prevLimit = exemptionLimit;

  // Find the first slab that applies after exemption.
  // Standard old regime: 0-2.5L Exempt, 2.5L-5L @ 5%, 5L-10L @ 20%, >10L @ 30%
  // We'll iterate the config slabs.
  
  for (const slab of slabs) {
      if (taxableIncome <= prevLimit) break;
      
      const currentLimit = slab.upto === null ? Infinity : slab.upto;
      // Skip slabs below exemption limit
      if (currentLimit <= exemptionLimit) continue;

      const effectiveLimit = Math.min(taxableIncome, currentLimit);
      const taxableAmount = effectiveLimit - prevLimit;
      
      if (taxableAmount > 0) {
          tax += taxableAmount * slab.rate;
      }
      prevLimit = currentLimit;
  }

  return tax;
};

export const calculateRegimeTax = (
  r: 'new' | 'old', 
  incomes: IncomeHeads, 
  deds: Deductions, 
  age: string,
  config: TaxConfig
): TaxResult => {
  
  // 1. Gross Total Income
  const grossIncome = Object.values(incomes).reduce((a, b) => a + Number(b), 0);

  // 2. Standard Deduction
  const stdDedLimit = r === 'new' ? config.stdDeduction.new : config.stdDeduction.old;
  const stdDeduction = Math.min(Number(incomes.salary), stdDedLimit);

  // 3. Chapter VI-A Deductions
  let chapterVIA = 0;

  if (r === 'old') {
    const d80c = Math.min(Number(deds.d80c), config.deductionLimits.d80c); 
    const d80d = Number(deds.d80d);
    const d80e = Number(deds.d80e);
    const d80g = Number(deds.d80g);
    const nps = Math.min(Number(deds.nps), config.deductionLimits.nps); 
    
    let interestDed = 0;
    if (age === 'below60') {
      interestDed = Math.min(Number(deds.d80tta), config.deductionLimits.d80tta);
    } else {
      interestDed = Math.min(Number(deds.d80ttb), config.deductionLimits.d80ttb);
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
    tax = calculateSlabTax(taxableIncome, config.newRegimeSlabs);
  } else {
    tax = calculateOldRegimeTax(taxableIncome, age, config);
  }

  // 5. Rebate u/s 87A
  let rebate = 0;
  let marginalRelief87A = 0;

  if (r === 'new') {
     const { limit } = config.rebate.new;
     if (taxableIncome <= limit) {
       rebate = tax;
     } else {
       // Marginal relief for New Regime
       const excessIncome = taxableIncome - limit;
       if (tax > excessIncome) {
           marginalRelief87A = tax - excessIncome;
       }
     }
  } else {
     const { limit, amount } = config.rebate.old;
     if (taxableIncome <= limit) {
       rebate = Math.min(tax, Number(amount));
     }
  }

  let taxAfterRebate = Math.max(0, tax - rebate - marginalRelief87A);

  // 6. Surcharge & Marginal Relief
  let surcharge = 0;
  let surchargeRate = 0;
  
  // Sort surcharge slabs to iterate
  const sortedSurchargeSlabs = Object.entries(config.surchargeSlabs)
    .sort(([, a], [, b]) => a - b)
    .map(([k, v]) => ({ id: k, min: v }));

  // Define rates map (hardcoded based on typical tax rules if not in config, assuming standard structure)
  // Standard: 50L: 10%, 1Cr: 15%, 2Cr: 25%, 5Cr: 37% (Old) or 25% (New)
  const getSurchargeRate = (income: number, regime: 'new' | 'old') => {
      if (income > 50000000) return regime === 'new' ? 0.25 : 0.37;
      if (income > 20000000) return 0.25;
      if (income > 10000000) return 0.15;
      if (income > 5000000) return 0.10;
      return 0;
  };

  surchargeRate = getSurchargeRate(taxableIncome, r);
  let basicSurcharge = taxAfterRebate * surchargeRate;
  let surchargeMarginalRelief = 0;

  if (surchargeRate > 0) {
      // Calculate Marginal Relief for Surcharge
      // Find the immediate lower threshold
      let threshold = 0;
      // Reverse check
      if (taxableIncome > 50000000) threshold = 50000000;
      else if (taxableIncome > 20000000) threshold = 20000000;
      else if (taxableIncome > 10000000) threshold = 10000000;
      else if (taxableIncome > 5000000) threshold = 5000000;

      // Tax on Threshold Income
      let taxAtThreshold = 0;
      if (r === 'new') taxAtThreshold = calculateSlabTax(threshold, config.newRegimeSlabs);
      else taxAtThreshold = calculateOldRegimeTax(threshold, age, config);
      
      // Surcharge on Threshold Tax
      let thresholdSurchargeRate = getSurchargeRate(threshold, r); 
      // Edge case: Surcharge is applicable if income exceeds threshold. 
      // At exactly 50L, rate is 0. At 1.01Cr, comparison is against 1Cr.
      // We need rate AT threshold (which is the rate of the tier BELOW the current one)
      
      const taxOnThresholdWithSurcharge = taxAtThreshold + (taxAtThreshold * thresholdSurchargeRate);
      
      // Max Tax Payable = Tax on Threshold + (Income - Threshold)
      const excessIncome = taxableIncome - threshold;
      const maxTaxPayable = taxOnThresholdWithSurcharge + excessIncome;
      
      const totalTaxWithCurrentSurcharge = taxAfterRebate + basicSurcharge;
      
      if (totalTaxWithCurrentSurcharge > maxTaxPayable) {
          surchargeMarginalRelief = totalTaxWithCurrentSurcharge - maxTaxPayable;
          surcharge = basicSurcharge - surchargeMarginalRelief;
      } else {
          surcharge = basicSurcharge;
      }
  } else {
      surcharge = basicSurcharge;
  }

  const totalMarginalRelief = marginalRelief87A + surchargeMarginalRelief;
  const finalTaxBeforeCess = Math.max(0, tax + surcharge - rebate - totalMarginalRelief);
  const cess = finalTaxBeforeCess * 0.04; // 4% Cess
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
  ageGroup: string,
  config: TaxConfig | null
): ComparisonResult | null => {
  return useMemo(() => {
    if (!config) return null;

    const newRegimeTax = calculateRegimeTax('new', incomeHeads, deductions, ageGroup, config);
    const oldRegimeTax = calculateRegimeTax('old', incomeHeads, deductions, ageGroup, config);
    
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
  }, [incomeHeads, deductions, ageGroup, config]);
};
