import { useMemo } from 'react';
import { TaxResult, IncomeHeads, Deductions, ComparisonResult } from './types';
import { STD_DEDUCTION_NEW, STD_DEDUCTION_OLD, DEDUCTION_LIMITS, REBATE_LIMIT_NEW, REBATE_LIMIT_OLD, REBATE_AMOUNT_OLD, SURCHARGE_SLABS } from './taxSlabs';

const calculateRegimeTax = (
  r: 'new' | 'old', 
  incomes: IncomeHeads, 
  deds: Deductions, 
  age: string
): TaxResult => {
  
  // 1. Gross Total Income
  const grossIncome = Object.values(incomes).reduce((a, b) => a + Number(b), 0);

  // 2. Standard Deduction
  const stdDedLimit = r === 'new' ? STD_DEDUCTION_NEW : STD_DEDUCTION_OLD;
  const stdDeduction = Math.min(Number(incomes.salary), stdDedLimit);

  // 3. Chapter VI-A Deductions
  let chapterVIA = 0;

  if (r === 'old') {
    const d80c = Math.min(Number(deds.d80c), DEDUCTION_LIMITS.d80c); 
    const d80d = Number(deds.d80d);
    const d80e = Number(deds.d80e);
    const d80g = Number(deds.d80g);
    const nps = Math.min(Number(deds.nps), DEDUCTION_LIMITS.nps); 
    
    let interestDed = 0;
    if (age === 'below60') {
      interestDed = Math.min(Number(deds.d80tta), DEDUCTION_LIMITS.d80tta);
    } else {
      interestDed = Math.min(Number(deds.d80ttb), DEDUCTION_LIMITS.d80ttb);
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
    if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.30;
    if (taxableIncome > 2000000) tax += Math.min(Math.max(0, taxableIncome - 2000000), 400000) * 0.25;
    if (taxableIncome > 1600000) tax += Math.min(Math.max(0, taxableIncome - 1600000), 400000) * 0.20;
    if (taxableIncome > 1200000) tax += Math.min(Math.max(0, taxableIncome - 1200000), 400000) * 0.15;
    if (taxableIncome > 800000)  tax += Math.min(Math.max(0, taxableIncome - 800000), 400000) * 0.10;
    if (taxableIncome > 400000)  tax += Math.min(Math.max(0, taxableIncome - 400000), 400000) * 0.05;
  } else {
    let slab1 = 250000;
    let slab2 = 500000;
    
    if (age === '60to80') slab1 = 300000;
    if (age === 'above80') { slab1 = 500000; slab2 = 500000; } 

    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    if (taxableIncome > 500000)  tax += Math.min(Math.max(0, taxableIncome - 500000), 500000) * 0.20;
    if (taxableIncome > slab1)   tax += Math.min(Math.max(0, taxableIncome - slab1), slab2 - slab1) * 0.05;
  }

  // 5. Rebate u/s 87A
  let rebate = 0;
  let marginalRelief87A = 0;

  if (r === 'new') {
     if (taxableIncome <= REBATE_LIMIT_NEW) {
       rebate = tax;
     } else {
       if (taxableIncome <= 1275000) { 
           const excessIncome = taxableIncome - 1200000;
           if (tax > excessIncome) {
               marginalRelief87A = tax - excessIncome;
           }
       }
     }
  } else {
     if (taxableIncome <= REBATE_LIMIT_OLD) {
       rebate = Math.min(tax, REBATE_AMOUNT_OLD);
     }
  }

  let taxAfterRebate = Math.max(0, tax - rebate - marginalRelief87A);

  // 6. Surcharge
  let surcharge = 0;
  let surchargeRate = 0;

  if (taxableIncome > SURCHARGE_SLABS[1]) {
      if (taxableIncome <= SURCHARGE_SLABS[2]) surchargeRate = 0.10;
      else if (taxableIncome <= SURCHARGE_SLABS[3]) surchargeRate = 0.15;
      else if (taxableIncome <= SURCHARGE_SLABS[4]) surchargeRate = 0.25;
      else surchargeRate = r === 'new' ? 0.25 : 0.37; 
  }

  let basicSurcharge = taxAfterRebate * surchargeRate;
  let taxWithSurcharge = taxAfterRebate + basicSurcharge;
  let surchargeMarginalRelief = 0;

  if (surchargeRate > 0) {
      // Simplified Marginal Relief Logic for Surcharge
      let threshold = 0;
      if (taxableIncome > SURCHARGE_SLABS[4]) threshold = SURCHARGE_SLABS[4];
      else if (taxableIncome > SURCHARGE_SLABS[3]) threshold = SURCHARGE_SLABS[3];
      else if (taxableIncome > SURCHARGE_SLABS[2]) threshold = SURCHARGE_SLABS[2];
      else if (taxableIncome > SURCHARGE_SLABS[1]) threshold = SURCHARGE_SLABS[1];

      // Calculate tax at threshold
      let tTax = 0;
      let tVal = threshold;
      if (r === 'new') {
          if (tVal > 2400000) tTax += (tVal - 2400000) * 0.30;
          if (tVal > 2000000) tTax += 400000 * 0.25;
          if (tVal > 1600000) tTax += 400000 * 0.20;
          if (tVal > 1200000) tTax += 400000 * 0.15;
          if (tVal > 800000) tTax += 400000 * 0.10;
          if (tVal > 400000) tTax += 400000 * 0.05;
      } else {
           let s1 = age === '60to80' ? 300000 : (age === 'above80' ? 500000 : 250000);
           if (tVal > 1000000) tTax += (tVal - 1000000) * 0.30;
           if (tVal > 500000) tTax += 500000 * 0.20;
           if (tVal > s1 && age !== 'above80') tTax += (500000 - s1) * 0.05;
      }
      
      let tSurchargeRate = 0;
      if (threshold === SURCHARGE_SLABS[2]) tSurchargeRate = 0.10;
      if (threshold === SURCHARGE_SLABS[3]) tSurchargeRate = 0.15;
      if (threshold === SURCHARGE_SLABS[4]) tSurchargeRate = 0.25;
      
      let tTotal = tTax + (tTax * tSurchargeRate);
      let maxPayable = tTotal + (taxableIncome - threshold);
      
      if (taxWithSurcharge > maxPayable) {
          surchargeMarginalRelief = taxWithSurcharge - maxPayable;
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
