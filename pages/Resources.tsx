import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE_CALENDAR, CHECKLIST_DATA } from '../constants';
import { 
  Calculator, Calendar, Search, ChevronDown, ChevronUp, 
  FileText, Printer, ArrowRight, RotateCcw, Info, HelpCircle, X, Check, TrendingDown 
} from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import CustomDropdown from '../components/forms/CustomDropdown';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'calendar' | 'checklist'>('calculator');

  // --- CALCULATOR STATE ---
  const [incomeHeads, setIncomeHeads] = useState({
    salary: 0,
    houseProperty: 0,
    business: 0,
    capitalGains: 0,
    otherSources: 0
  });

  const [ageGroup, setAgeGroup] = useState('below60');
  // We keep 'regime' for the *primary* view, but we can compare both
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  
  const [deductions, setDeductions] = useState({
    d80c: 0,
    d80d: 0,
    hra: 0,
    d80e: 0,     // Education Loan
    d80g: 0,     // Donations
    d80tta: 0,   // Savings Interest
    d80ttb: 0,   // Senior Interest
    nps: 0,      // 80CCD(1B)
    other: 0
  });

  const [showDeductions, setShowDeductions] = useState(false);
  
  // Store results for both regimes for comparison
  const [comparison, setComparison] = useState<{
    new: TaxResult,
    old: TaxResult,
    recommendation: 'new' | 'old' | 'equal',
    savings: number
  } | null>(null);

  // --- CALENDAR STATE ---
  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');

  const handlePrint = () => {
    window.print();
  };
  
  // Helper for Age Dropdown mapping
  const ageMap: Record<string, string> = {
    'below60': 'General (Below 60)',
    '60to80': 'Senior Citizen (60-80)',
    'above80': 'Super Senior (80+)'
  };

  interface TaxResult {
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

  // --- CORE CALCULATION ENGINE ---
  const calculateRegimeTax = (
    r: 'new' | 'old', 
    incomes: typeof incomeHeads, 
    deds: typeof deductions, 
    age: string
  ): TaxResult => {
    
    // 1. Gross Total Income
    const grossIncome = Object.values(incomes).reduce((a, b) => a + Number(b), 0);

    // 2. Standard Deduction (Salary)
    // AY 2026-27 (FY 2025-26): New Regime = 75k, Old Regime = 50k
    const stdDedLimit = r === 'new' ? 75000 : 50000;
    const stdDeduction = Math.min(Number(incomes.salary), stdDedLimit);

    // 3. Chapter VI-A Deductions
    let chapterVIA = 0;

    if (r === 'old') {
      const d80c = Math.min(Number(deds.d80c), 150000); // Max 1.5L
      const d80d = Number(deds.d80d); // User entered
      const d80e = Number(deds.d80e); // No limit
      const d80g = Number(deds.d80g); // User entered (50% or 100%)
      const nps = Math.min(Number(deds.nps), 50000); // Max 50k for 80CCD(1B)
      
      // 80TTA (Max 10k) vs 80TTB (Max 50k for Seniors)
      let interestDed = 0;
      if (age === 'below60') {
        interestDed = Math.min(Number(deds.d80tta), 10000);
      } else {
        interestDed = Math.min(Number(deds.d80ttb), 50000);
      }

      chapterVIA = d80c + d80d + Number(deds.hra) + d80e + d80g + nps + interestDed + Number(deds.other);
    } else {
      // New Regime: 80CCD(2) [Employer NPS] and 80CCH [Agniveer] allowed. 
      // Assuming 'nps' input here is employee contribution (80CCD 1B) which is disallowed.
      // Family Pension deduction (enhanced to 25k) is also allowed, 
      // but simpler to stick to basic input unless we add specific field.
      chapterVIA = 0; 
    }

    const totalDeductions = stdDeduction + chapterVIA;
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // 4. Tax Slab Calculation
    let tax = 0;

    if (r === 'new') {
      // New Regime Slabs (AY 2026-27 / FY 2025-26 Proposed)
      // 0-4L: Nil
      // 4-8L: 5%
      // 8-12L: 10%
      // 12-16L: 15%
      // 16-20L: 20%
      // 20-24L: 25%
      // >24L: 30%
      if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.30;
      if (taxableIncome > 2000000) tax += Math.min(Math.max(0, taxableIncome - 2000000), 400000) * 0.25;
      if (taxableIncome > 1600000) tax += Math.min(Math.max(0, taxableIncome - 1600000), 400000) * 0.20;
      if (taxableIncome > 1200000) tax += Math.min(Math.max(0, taxableIncome - 1200000), 400000) * 0.15;
      if (taxableIncome > 800000)  tax += Math.min(Math.max(0, taxableIncome - 800000), 400000) * 0.10;
      if (taxableIncome > 400000)  tax += Math.min(Math.max(0, taxableIncome - 400000), 400000) * 0.05;
    } else {
      // Old Regime Slabs
      let slab1 = 250000;
      let slab2 = 500000;
      
      if (age === '60to80') slab1 = 300000;
      if (age === 'above80') { slab1 = 500000; slab2 = 500000; } // Super senior direct to 20% after 5L

      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
      if (taxableIncome > 500000)  tax += Math.min(Math.max(0, taxableIncome - 500000), 500000) * 0.20;
      if (taxableIncome > slab1)   tax += Math.min(Math.max(0, taxableIncome - slab1), slab2 - slab1) * 0.05;
    }

    // 5. Rebate u/s 87A
    let rebate = 0;
    let marginalRelief87A = 0;

    if (r === 'new') {
       // New Regime: Full rebate if income <= 12L
       if (taxableIncome <= 1200000) {
         rebate = tax;
       } else {
         // Marginal Relief for 87A (New Regime)
         if (taxableIncome <= 1275000) { 
             const excessIncome = taxableIncome - 1200000;
             if (tax > excessIncome) {
                 marginalRelief87A = tax - excessIncome;
             }
         }
       }
    } else {
       // Old Regime: Rebate max 12500 if income <= 5L
       if (taxableIncome <= 500000) {
         rebate = Math.min(tax, 12500);
       }
    }

    let taxAfterRebate = Math.max(0, tax - rebate - marginalRelief87A);

    // 6. Surcharge & Surcharge Marginal Relief
    let surcharge = 0;
    let surchargeRate = 0;

    if (taxableIncome > 5000000) {
        if (taxableIncome <= 10000000) surchargeRate = 0.10;
        else if (taxableIncome <= 20000000) surchargeRate = 0.15;
        else if (taxableIncome <= 50000000) surchargeRate = 0.25;
        else surchargeRate = r === 'new' ? 0.25 : 0.37; // New regime capped at 25%
    }

    let basicSurcharge = taxAfterRebate * surchargeRate;
    let taxWithSurcharge = taxAfterRebate + basicSurcharge;
    let surchargeMarginalRelief = 0;

    if (surchargeRate > 0) {
        let threshold = 0;
        if (taxableIncome > 50000000) threshold = 50000000;
        else if (taxableIncome > 20000000) threshold = 20000000;
        else if (taxableIncome > 10000000) threshold = 10000000;
        else if (taxableIncome > 5000000) threshold = 5000000;

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
        if (threshold === 10000000) tSurchargeRate = 0.10;
        if (threshold === 20000000) tSurchargeRate = 0.15;
        if (threshold === 50000000) tSurchargeRate = 0.25;
        
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

  const calculateAndCompare = () => {
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

    setComparison({
        new: newRegimeTax,
        old: oldRegimeTax,
        recommendation,
        savings
    });
  };

  const handleClear = () => {
    setIncomeHeads({ salary: 0, houseProperty: 0, business: 0, capitalGains: 0, otherSources: 0 });
    setDeductions({ d80c: 0, d80d: 0, hra: 0, d80e: 0, d80g: 0, d80tta: 0, d80ttb: 0, nps: 0, other: 0 });
    setComparison(null);
  };

  const badgeColors: Record<string, string> = {
    gst: 'bg-blue-100 text-blue-800 border-blue-200',
    it: 'bg-green-100 text-green-800 border-green-200',
    tds: 'bg-purple-100 text-purple-800 border-purple-200',
    roc: 'bg-orange-100 text-orange-800 border-orange-200',
    payroll: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  const categoryMap: Record<string, string> = { gst: 'GST', it: 'Income Tax', tds: 'TDS/TCS', roc: 'ROC', payroll: 'Payroll' };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Financial Resources",
    "description": "Tools, checklists, and calendars for financial compliance.",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "Income Tax Calculator AY 2026-27",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web"
      },
      {
        "@type": "Dataset",
        "name": "Compliance Calendar 2025"
      }
    ]
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Resources | Calculators, Calendar & Checklists"
        description="Essential financial tools for businesses and individuals. Income Tax Calculator, Compliance Calendar, and Downloadable Checklists."
        schema={schema}
      />
      
      {/* HERO SECTION - Hidden in Print */}
      <PageHero
        tag="Tools & Utilities"
        title="Resource"
        subtitle="Hub."
        className="print:hidden"
      />

      {/* MAIN CONTENT AREA */}
      <div className="py-12 px-4 md:px-6 print:py-0 print:px-0">
         <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
               
               {/* SIDEBAR TABS - Hidden in Print */}
               <div className="lg:col-span-1 print:hidden">
                  <div className="bg-brand-surface rounded-[2rem] border border-brand-border p-4 sticky top-32 shadow-sm">
                     <nav className="flex flex-col gap-2">
                        <button 
                           onClick={() => setActiveTab('calculator')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'calculator' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <Calculator size={20} /> Tax Calculator
                        </button>
                        <button 
                           onClick={() => setActiveTab('calendar')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'calendar' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <Calendar size={20} /> Compliance Calendar
                        </button>
                        <button 
                           onClick={() => setActiveTab('checklist')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'checklist' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <FileText size={20} /> Checklists
                        </button>
                     </nav>
                  </div>
               </div>

               {/* CONTENT PANEL - Full Width in Print */}
               <div className="lg:col-span-3 print:w-full">
                  
                  {/* CALCULATOR TAB */}
                  {activeTab === 'calculator' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:border-0 print:shadow-none print:p-0 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-8 print:mb-4">
                           <div>
                              <h2 className="text-3xl font-heading font-bold text-brand-dark">Income Tax Calculator</h2>
                              <p className="text-brand-stone mt-2 font-medium">AY 2026-27 (FY 2025-26) • Updated as per Budget 2025</p>
                           </div>
                           <button onClick={handlePrint} className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors print:hidden" title="Print Calculation">
                              <Printer size={20} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                           {/* LEFT COLUMN: INPUTS */}
                           <div className="md:col-span-7 space-y-8 print:col-span-12">
                              
                              {/* Income Sources */}
                              <div className="space-y-4">
                                 <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest border-b border-brand-border pb-2">Income Details</h3>
                                 
                                 <div className="grid grid-cols-1 gap-4">
                                    <div className="group">
                                       <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Salary / Pension (Before Std. Ded.)</label>
                                       <input type="number" value={incomeHeads.salary || ''} onChange={(e) => setIncomeHeads({...incomeHeads, salary: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" placeholder="Gross Salary (Basic + DA + Allowances)" />
                                    </div>
                                    <div className="group">
                                       <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">House Property (Net Value)</label>
                                       <input type="number" value={incomeHeads.houseProperty || ''} onChange={(e) => setIncomeHeads({...incomeHeads, houseProperty: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" placeholder="Income/Loss from House Property" />
                                    </div>
                                    <div className="group">
                                       <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Business & Profession (Net Profit)</label>
                                       <input type="number" value={incomeHeads.business || ''} onChange={(e) => setIncomeHeads({...incomeHeads, business: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" placeholder="Net Profit as per Books / Presumptive Income" />
                                    </div>
                                    <div className="group">
                                       <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Capital Gains</label>
                                       <input type="number" value={incomeHeads.capitalGains || ''} onChange={(e) => setIncomeHeads({...incomeHeads, capitalGains: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" placeholder="Total Capital Gains (STCG + LTCG)" />
                                    </div>
                                    <div className="group">
                                       <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Other Sources (Interest, etc.)</label>
                                       <input type="number" value={incomeHeads.otherSources || ''} onChange={(e) => setIncomeHeads({...incomeHeads, otherSources: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" placeholder="Interest, Dividends, etc." />
                                    </div>
                                 </div>
                              </div>

                              {/* Deductions Accordion */}
                              <div className="border border-brand-border rounded-2xl overflow-hidden transition-all duration-300 bg-brand-surface">
                                 <button 
                                    onClick={() => setShowDeductions(!showDeductions)}
                                    className="w-full flex justify-between items-center p-4 bg-brand-bg/50 hover:bg-brand-bg transition-colors"
                                 >
                                    <span className="text-sm font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                       Deductions (Old Regime)
                                    </span>
                                    {showDeductions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                 </button>
                                 
                                 <div className={`transition-all duration-500 ease-in-out ${showDeductions ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="col-span-full mb-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-100 flex items-start gap-2">
                                          <Info size={14} className="mt-0.5 shrink-0" />
                                          These deductions are generally available only under the Old Tax Regime. Standard Deduction is auto-applied to both.
                                       </div>

                                       <div className="group">
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                             <label className="text-xs font-bold text-brand-stone">80C (LIC, PPF, EPF)</label>
                                             <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for investments in PPF, EPF, LIC premiums, Equity Linked Savings Schemes (ELSS), Principal repayment of Housing Loan, Sukanya Samriddhi Yojana, etc. The maximum aggregate deduction is capped at ₹1,50,000 per financial year.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.d80c || ''} onChange={(e) => setDeductions({...deductions, d80c: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Investments (PPF, LIC, etc.)" />
                                       </div>

                                       <div className="group">
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                             <label className="text-xs font-bold text-brand-stone">80D (Medical Ins.)</label>
                                             <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for Medical Insurance Premiums paid. Individuals can claim up to ₹25,000 for self/family (₹50,000 if senior citizen) and an additional ₹25,000 for parents (₹50,000 if senior citizen). Includes preventive health checkup up to ₹5,000.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.d80d || ''} onChange={(e) => setDeductions({...deductions, d80d: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Medical Insurance Premium" />
                                       </div>

                                       <div className="group">
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                             <label className="text-xs font-bold text-brand-stone">80CCD(1B) (NPS)</label>
                                             <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Additional deduction for voluntary contributions made to the National Pension System (NPS). This is over and above the ₹1.5 lakh limit of Section 80C. Maximum deduction allowed is ₹50,000.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.nps || ''} onChange={(e) => setDeductions({...deductions, nps: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="NPS Contribution" />
                                       </div>

                                       <div>
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                            <label className="text-xs font-bold text-brand-stone">HRA / Home Loan Int.</label>
                                            <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Exemption for House Rent Allowance (HRA) under Section 10(13A) (least of: Actual HRA, Rent paid - 10% Salary, 50%/40% of Salary) OR Deduction for Interest on Home Loan under Section 24(b) for self-occupied property (Max ₹2,00,000).
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.hra || ''} onChange={(e) => setDeductions({...deductions, hra: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Exempt HRA or Loan Interest" />
                                       </div>

                                       <div>
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                            <label className="text-xs font-bold text-brand-stone">80E (Edu Loan Int.)</label>
                                            <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for interest paid on Education Loan taken for higher studies (self, spouse, or children). There is no monetary ceiling on the amount, and it is available for a maximum of 8 years.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.d80e || ''} onChange={(e) => setDeductions({...deductions, d80e: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Education Loan Interest" />
                                       </div>

                                       <div>
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                            <label className="text-xs font-bold text-brand-stone">80G (Donations)</label>
                                            <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for donations made to prescribed charitable institutions and relief funds. Deduction varies (50% or 100% of donation) depending on the donee. Some donations are subject to a qualifying limit of 10% of Adjusted Gross Total Income.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.d80g || ''} onChange={(e) => setDeductions({...deductions, d80g: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Eligible Donation Amount" />
                                       </div>
                                       
                                       {ageGroup === 'below60' ? (
                                         <div>
                                            <div className="flex items-center gap-1 mb-1 ml-1">
                                              <label className="text-xs font-bold text-brand-stone">80TTA (Savings Int.)</label>
                                              <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for interest earned on Savings Accounts (Bank, Post Office, Co-op Society). Maximum deduction is ₹10,000. Note: This is NOT available for Resident Senior Citizens (use 80TTB instead).
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                              </div>
                                            </div>
                                            <input type="number" value={deductions.d80tta || ''} onChange={(e) => setDeductions({...deductions, d80tta: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Savings Interest (Max 10k)" />
                                         </div>
                                       ) : (
                                         <div>
                                            <div className="flex items-center gap-1 mb-1 ml-1">
                                              <label className="text-xs font-bold text-brand-stone">80TTB (Senior Int.)</label>
                                              <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Deduction for Resident Senior Citizens (aged 60 years or more) on interest income from deposits (Savings + Fixed Deposits + Recurring Deposits). Maximum deduction is ₹50,000.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                              </div>
                                            </div>
                                            <input type="number" value={deductions.d80ttb || ''} onChange={(e) => setDeductions({...deductions, d80ttb: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Deposit Interest (Max 50k)" />
                                         </div>
                                       )}
                                       
                                       <div>
                                          <div className="flex items-center gap-1 mb-1 ml-1">
                                            <label className="text-xs font-bold text-brand-stone">Other Deductions</label>
                                            <div className="relative group/tooltip inline-block ml-1 align-middle">
                                                <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                                                  Any other deductions under Chapter VI-A, such as Sec 80U (Person with Disability), Sec 80DD (Maintenance of Dependent with Disability), Sec 80GGC (Donations to Political Parties), Sec 80DDB (Medical treatment of specified diseases), etc.
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
                                                </div>
                                             </div>
                                          </div>
                                          <input type="number" value={deductions.other || ''} onChange={(e) => setDeductions({...deductions, other: Number(e.target.value)})} className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" placeholder="Other Chapter VI-A Deductions" />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                           </div>

                           {/* RIGHT COLUMN: CONTROLS & SUMMARY */}
                           <div className="md:col-span-5 flex flex-col gap-6 print:col-span-12">
                              
                              <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-border space-y-6 print:hidden">
                                  <div className="mb-2">
                                     <CustomDropdown
                                        label="Age Category"
                                        name="ageGroup"
                                        value={ageMap[ageGroup]}
                                        options={Object.values(ageMap)}
                                        onChange={(_, val) => {
                                            const key = Object.keys(ageMap).find(k => ageMap[k] === val);
                                            if (key) setAgeGroup(key);
                                        }}
                                     />
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                     <button 
                                        onClick={calculateAndCompare} 
                                        className="flex-1 py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-moss transition-all shadow-lg flex items-center justify-center gap-2 group"
                                     >
                                        Compare & Calculate <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                                     </button>
                                     <button 
                                        onClick={handleClear} 
                                        className="px-4 py-4 bg-white border border-brand-border text-brand-dark rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                        title="Clear All"
                                     >
                                        <RotateCcw size={20} />
                                     </button>
                                  </div>
                              </div>

                              {/* RECOMMENDATION BANNER */}
                              {comparison && (
                                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in-up ${comparison.recommendation === 'new' ? 'bg-green-50 border-green-200 text-green-900' : comparison.recommendation === 'old' ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                    <div className="mt-0.5 shrink-0">
                                        {comparison.recommendation === 'equal' ? <Info size={20}/> : <Check size={20} className="font-bold"/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Recommendation</h4>
                                        <p className="text-sm">
                                            {comparison.recommendation === 'new' && <><strong>New Regime</strong> saves you <strong>₹ {Math.round(comparison.savings).toLocaleString('en-IN')}</strong>.</>}
                                            {comparison.recommendation === 'old' && <><strong>Old Regime</strong> saves you <strong>₹ {Math.round(comparison.savings).toLocaleString('en-IN')}</strong>.</>}
                                            {comparison.recommendation === 'equal' && "Both regimes result in the same tax liability."}
                                        </p>
                                    </div>
                                </div>
                              )}

                              {/* RESULTS PANEL */}
                              {comparison && (
                                 <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 animate-scale-in print:border-black print:border-2">
                                    <div className="flex items-center justify-between mb-6 border-b border-brand-border pb-4 print:border-black">
                                       <div className="flex items-center gap-2">
                                         <Calculator size={24} className="text-brand-moss print:text-black" />
                                         <h3 className="text-xl font-heading font-bold text-brand-dark">Tax Breakdown</h3>
                                       </div>
                                       
                                       <div className="flex bg-brand-bg rounded-lg p-1 print:hidden">
                                           <button 
                                             onClick={() => setRegime('new')}
                                             className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${regime === 'new' ? 'bg-brand-moss text-white shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
                                           >
                                             New Regime
                                           </button>
                                           <button 
                                             onClick={() => setRegime('old')}
                                             className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${regime === 'old' ? 'bg-brand-moss text-white shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
                                           >
                                             Old Regime
                                           </button>
                                       </div>
                                       {/* Print Only Header */}
                                       <div className="hidden print:block font-bold">
                                           {regime === 'new' ? 'New Regime' : 'Old Regime'}
                                       </div>
                                    </div>
                                    
                                    {/* Select which result to show based on active tab in panel */}
                                    {(() => {
                                        const res = regime === 'new' ? comparison.new : comparison.old;
                                        return (
                                            <div className="space-y-3 text-sm md:text-base">
                                                <div className="flex justify-between">
                                                    <span className="text-brand-stone print:text-black">Gross Income</span>
                                                    <span className="font-bold font-mono">₹ {res.grossIncome.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-brand-stone/80 print:text-black">
                                                    <span>Standard Deduction</span>
                                                    <span className="font-mono">- ₹ {res.stdDeduction.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-brand-stone/80 print:text-black">
                                                    <span>Chapter VI-A Deductions</span>
                                                    <span className="font-mono">- ₹ {res.chapterVIA.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-brand-dark pt-2 border-t border-dashed border-brand-border print:border-gray-400">
                                                    <span>Taxable Income</span>
                                                    <span className="font-mono">₹ {res.taxableIncome.toLocaleString('en-IN')}</span>
                                                </div>
                                                
                                                <div className="pt-4 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-brand-stone print:text-black">Tax on Income</span>
                                                        <span className="font-mono">₹ {res.taxOnIncome.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    {res.rebate > 0 && (
                                                        <div className="flex justify-between text-green-700">
                                                            <span>Rebate u/s 87A</span>
                                                            <span className="font-mono">- ₹ {res.rebate.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}
                                                    {res.surcharge > 0 && (
                                                        <div className="flex justify-between text-red-600">
                                                            <span>Surcharge</span>
                                                            <span className="font-mono">+ ₹ {Math.round(res.surcharge).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}
                                                    {res.marginalRelief > 0 && (
                                                        <div className="flex justify-between text-green-700">
                                                            <span>Marginal Relief</span>
                                                            <span className="font-mono">- ₹ {Math.round(res.marginalRelief).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-brand-stone print:text-black">Health & Ed. Cess (4%)</span>
                                                        <span className="font-mono">₹ {Math.round(res.cess).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 mt-2 border-t-2 border-brand-moss/30 flex justify-between items-center print:border-black">
                                                    <span className="text-lg font-bold text-brand-moss print:text-black">Net Tax Payable</span>
                                                    <span className="text-2xl font-bold text-brand-moss font-mono print:text-black">₹ {Math.round(res.totalTax).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                 </div>
                              )}

                           </div>
                        </div>

                        <div className="mt-10 text-center print:text-left">
                           <p className="text-xs text-brand-stone/60 max-w-2xl mx-auto print:text-black">
                              <strong>Disclaimer:</strong> This calculator provides estimates based on Finance Bill 2025 proposals (AY 2026-27). Actual tax liability may vary. Please consult a Chartered Accountant for filing.
                           </p>
                        </div>
                     </div>
                  )}

                  {/* CALENDAR TAB */}
                  {activeTab === 'calendar' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                           <div>
                              <h2 className="text-3xl font-heading font-bold text-brand-dark">Compliance Calendar</h2>
                              <p className="text-brand-stone mt-1">Key Due Dates for 2025-26</p>
                           </div>
                           <div className="flex gap-2 print:hidden">
                              <div className="relative">
                                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-stone" />
                                 <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={calSearch}
                                    onChange={(e) => setCalSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm focus:outline-none focus:border-brand-moss"
                                 />
                              </div>
                              <button onClick={handlePrint} className="p-2 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors">
                                 <Printer size={20} />
                              </button>
                           </div>
                        </div>

                        <div className="space-y-8">
                           {Object.entries(COMPLIANCE_CALENDAR).map(([month, events], idx) => {
                              const filteredEvents = events.filter(e => 
                                 (calFilter === 'all' || e.cat === calFilter) && 
                                 (e.desc.toLowerCase().includes(calSearch.toLowerCase()))
                              );

                              if (filteredEvents.length === 0) return null;

                              return (
                                 <div key={idx} className="break-inside-avoid">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 sticky top-0 bg-brand-surface py-2 border-b border-brand-border/50 print:static print:bg-white print:border-black">{month}</h3>
                                    <div className="grid gap-3">
                                       {filteredEvents.map((event, i) => (
                                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-brand-bg border border-brand-border/50 hover:border-brand-moss/30 transition-colors print:bg-white print:border-gray-200">
                                             <div className="w-12 h-12 flex flex-col items-center justify-center bg-white rounded-lg border border-brand-border shadow-sm shrink-0 print:border-black">
                                                <span className="text-xs font-bold text-brand-moss uppercase leading-none print:text-black">{month.slice(0,3)}</span>
                                                <span className="text-lg font-bold text-brand-dark leading-none mt-1">{event.day}</span>
                                             </div>
                                             <div className="flex-grow">
                                                <div className="font-bold text-brand-dark">{event.desc}</div>
                                                <div className="text-xs text-brand-stone font-medium mt-1">{categoryMap[event.cat]}</div>
                                             </div>
                                             <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColors[event.cat]} print:border-black print:text-black print:bg-white`}>
                                                {event.cat}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* CHECKLISTS TAB */}
                  {activeTab === 'checklist' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
                        <div className="mb-8">
                           <h2 className="text-3xl font-heading font-bold text-brand-dark">Document Checklists</h2>
                           <p className="text-brand-stone mt-2">Download or print requirements for various services.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Object.entries(CHECKLIST_DATA).map(([key, data]) => (
                              <Link to={`/resources/checklist/${key}`} key={key} className="group p-6 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all flex justify-between items-center print:border-gray-300 print:bg-white">
                                 <div>
                                    <h3 className="font-bold text-brand-dark group-hover:text-brand-moss transition-colors">{data.title}</h3>
                                    <p className="text-xs text-brand-stone mt-1 line-clamp-1">{data.subtitle}</p>
                                 </div>
                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-stone group-hover:bg-brand-moss group-hover:text-white transition-all print:hidden">
                                    <ArrowRight size={18} />
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Resources;