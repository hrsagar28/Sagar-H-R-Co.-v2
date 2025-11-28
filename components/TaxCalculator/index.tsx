import React, { useState } from 'react';
import { Printer, ArrowRight, RotateCcw } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import CustomDropdown from '../forms/CustomDropdown';

import IncomeInputs from './IncomeInputs';
import DeductionsPanel from './DeductionsPanel';
import ResultsDisplay from './ResultsDisplay';
import { useTaxCalculation } from './useTaxCalculation';
import { IncomeHeads, Deductions } from './types';
import { AGE_MAP } from './taxSlabs';

const TaxCalculator: React.FC = () => {
  const [incomeHeads, setIncomeHeads] = useState<IncomeHeads>({
    salary: 0,
    houseProperty: 0,
    business: 0,
    capitalGains: 0,
    otherSources: 0
  });

  const [deductions, setDeductions] = useState<Deductions>({
    d80c: 0,
    d80d: 0,
    hra: 0,
    d80e: 0,
    d80g: 0,
    d80tta: 0,
    d80ttb: 0,
    nps: 0,
    other: 0
  });

  const [ageGroup, setAgeGroup] = useState('below60');
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [showResults, setShowResults] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);
  
  const comparison = useTaxCalculation(incomeHeads, deductions, ageGroup);

  const handleCalculate = () => setShowResults(true);

  const handleClear = () => {
    setIncomeHeads({ salary: 0, houseProperty: 0, business: 0, capitalGains: 0, otherSources: 0 });
    setDeductions({ d80c: 0, d80d: 0, hra: 0, d80e: 0, d80g: 0, d80tta: 0, d80ttb: 0, nps: 0, other: 0 });
    setShowResults(false);
  };
  
  const handlePrint = () => window.print();

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:border-0 print:shadow-none print:p-0 animate-fade-in-up">
      <div className="flex justify-between items-start mb-8 print:mb-4">
          <div>
              <h2 className="text-3xl font-heading font-bold text-brand-dark">Income Tax Calculator</h2>
              <p className="text-brand-stone mt-2 font-medium">{CONTACT_INFO.assessmentYear} ({CONTACT_INFO.financialYear}) • Updated as per Budget 2025</p>
          </div>
          <button onClick={handlePrint} className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors print:hidden" title="Print Calculation">
              <Printer size={20} />
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* LEFT COLUMN: INPUTS */}
          <div className="md:col-span-7 space-y-8 print:col-span-12">
              <IncomeInputs incomeHeads={incomeHeads} setIncomeHeads={setIncomeHeads} />
              <DeductionsPanel 
                deductions={deductions} 
                setDeductions={setDeductions} 
                showDeductions={showDeductions}
                setShowDeductions={setShowDeductions}
                ageGroup={ageGroup}
              />
          </div>

          {/* RIGHT COLUMN: CONTROLS & SUMMARY */}
          <div className="md:col-span-5 flex flex-col gap-6 print:col-span-12">
              <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-border space-y-6 print:hidden">
                  <div className="mb-2">
                      <CustomDropdown
                        label="Age Category"
                        name="ageGroup"
                        value={AGE_MAP[ageGroup]}
                        options={Object.values(AGE_MAP)}
                        onChange={(_, val) => {
                            const key = Object.keys(AGE_MAP).find(k => AGE_MAP[k] === val);
                            if (key) setAgeGroup(key);
                        }}
                      />
                  </div>

                  <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handleCalculate} 
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

              <ResultsDisplay 
                comparison={comparison}
                regime={regime}
                setRegime={setRegime}
                showResults={showResults}
              />
          </div>
      </div>

      <div className="mt-10 text-center print:text-left">
          <p className="text-xs text-brand-stone/60 max-w-2xl mx-auto print:text-black">
              <strong>Disclaimer:</strong> This calculator provides estimates based on Finance Bill 2025 proposals ({CONTACT_INFO.assessmentYear}). Actual tax liability may vary. Please consult a Chartered Accountant for filing.
          </p>
      </div>
    </div>
  );
};

export default TaxCalculator;
