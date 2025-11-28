import { useMemo } from 'react';
import { TaxResult, IncomeHeads, Deductions, ComparisonResult, TaxConfig } from './types';

// Fallback defaults if config fails to load
export const DEFAULT_CONFIG: TaxConfig = {
  financialYear: "FY 2025-26",
  assessmentYear: "AY 2026-27",
  stdDeduction: { new: 75000, old: 50000 },
  deductionLimits: { d80c: 150000, d80tta: 10000, d80ttb: 50000, nps: 50000 },
  rebate: {
    new: { limit: 1200000, amount: "full" },
    old: { limit: 500000, amount: 12500 }
  },
  surchargeSlabs: { "1": 5000000, "2": 10000000, "3": 20000000, "4": 50000000 },
  newRegimeSlabs: [
    { "upto": 400000, "rate": 0 },
    { "upto": 800000, "rate": 0.05 },
    { "upto": 1200000, "rate": 0.10 },
    { "upto": 1600000, "rate": 0.15 },
    { "upto": 2000000, "rate": 0.20 },
    { "upto": 2400000, "rate": 0.25 },
    { "upto": null, "rate": 0.30 }
  ]
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
    chapterVIA = 0; 
  }

  const totalDeductions = stdDeduction + chapterVIA;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // 4. Tax Slab Calculation
  let tax = 0;

  if (r === 'new') {
    let remainingIncome = taxableIncome;
    let prevLimit = 0;

    for (let i = 0; i < config.newRegimeSlabs.length; i++) {
        const slab = config.newRegimeSlabs[i];
        if (remainingIncome <= 0) break;

        const currentLimit = slab.upto === null ? Infinity : slab.upto;
        // Calculate income falling within this specific slab range
        // Limit logic: The slab ends at currentLimit. It started at prevLimit.
        
        const slabCeiling = currentLimit;
        const slabFloor = prevLimit;
        
        // Income in this slab is Min(Taxable, Ceiling) - Floor
        // If Taxable < Floor, it's 0.
        
        const incomeInSlab = Math.max(0, Math.min(taxableIncome, slabCeiling) - slabFloor);
        tax += incomeInSlab * slab.rate;
        
        prevLimit = currentLimit;
    }

  } else {
    let slab1 = 250000;
    let slab2 = 500000;
    
    if (age === '60to80') slab1 = 300000;
    if (age === 'above80') { slab1 = 500000; slab2 = 500000; } 

    // Old regime logic is structural, keeping it mostly static as it's less prone to yearly slab shifts compared to New Regime
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    if (taxableIncome > 500000)  tax += Math.min(Math.max(0, taxableIncome - 500000), 500000) * 0.20;
    if (taxableIncome > slab1)   tax += Math.min(Math.max(0, taxableIncome - slab1), slab2 - slab1) * 0.05;
  }

  // 5. Rebate u/s 87A
  let rebate = 0;
  let marginalRelief87A = 0;

  if (r === 'new') {
     const limit = config.rebate.new.limit;
     if (taxableIncome <= limit) {
       rebate = tax;
     } else {
       // Marginal relief for New Regime
       // Standard 2025 Budget logic: Relief if Tax > (Income - Limit)
       const excessIncome = taxableIncome - limit;
       if (tax > excessIncome) {
           marginalRelief87A = tax - excessIncome;
       }
     }
  } else {
     const limit = config.rebate.old.limit;
     if (taxableIncome <= limit) {
       rebate = Math.min(tax, config.rebate.old.amount as number);
     }
  }

  let taxAfterRebate = Math.max(0, tax - rebate - marginalRelief87A);

  // 6. Surcharge
  let surcharge = 0;
  let surchargeRate = 0;
  
  const slabs = config.surchargeSlabs;

  if (taxableIncome > slabs["1"]) {
      if (taxableIncome <= slabs["2"]) surchargeRate = 0.10;
      else if (taxableIncome <= slabs["3"]) surchargeRate = 0.15;
      else if (taxableIncome <= slabs["4"]) surchargeRate = 0.25;
      else surchargeRate = r === 'new' ? 0.25 : 0.37; // Enhanced surcharge usually restricted in New Regime
  }

  let basicSurcharge = taxAfterRebate * surchargeRate;
  let surchargeMarginalRelief = 0;

  if (surchargeRate > 0) {
      // Basic marginal relief check
      // Find nearest lower threshold
      let threshold = 0;
      if (taxableIncome > slabs["4"]) threshold = slabs["4"];
      else if (taxableIncome > slabs["3"]) threshold = slabs["3"];
      else if (taxableIncome > slabs["2"]) threshold = slabs["2"];
      else if (taxableIncome > slabs["1"]) threshold = slabs["1"];

      // Recalculate tax at threshold (Simplified for robustness)
      const taxAtThreshold = calculateRegimeTax(r, { ...incomes, salary: threshold, houseProperty:0, business:0, capitalGains:0, otherSources:0 }, { ...deds, d80c:0, d80d:0, hra:0, d80e:0, d80g:0, d80tta:0, d80ttb:0, nps:0, other:0 }, age, config).taxOnIncome;
      
      // Determine lower surcharge rate at threshold
      let lowerSurchargeRate = 0;
      if (threshold === slabs["2"]) lowerSurchargeRate = 0.10;
      if (threshold === slabs["3"]) lowerSurchargeRate = 0.15;
      if (threshold === slabs["4"]) lowerSurchargeRate = 0.25;
      
      let taxWithLowerSurcharge = taxAtThreshold + (taxAtThreshold * lowerSurchargeRate);
      let excessIncome = taxableIncome - threshold;
      let maxTaxPayable = taxWithLowerSurcharge + excessIncome;
      
      let currentTotalTax = taxAfterRebate + basicSurcharge;
      
      if (currentTotalTax > maxTaxPayable) {
          surchargeMarginalRelief = currentTotalTax - maxTaxPayable;
          surcharge = basicSurcharge - surchargeMarginalRelief;
      } else {
          surcharge = basicSurcharge;
      }
  } else {
      surcharge = basicSurcharge;
  }

  const totalMarginalRelief = marginalRelief87A + surchargeMarginalRelief;
  const finalTaxBeforeCess = Math.max(0, tax + surcharge - rebate - totalMarginalRelief);
  const cess = finalTaxBeforeCess * 0.04;
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
): ComparisonResult => {
  return useMemo(() => {
    // Use provided config or fallback
    const activeConfig = config || DEFAULT_CONFIG;

    const newRegimeTax = calculateRegimeTax('new', incomeHeads, deductions, ageGroup, activeConfig);
    const oldRegimeTax = calculateRegimeTax('old', incomeHeads, deductions, ageGroup, activeConfig);
    
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