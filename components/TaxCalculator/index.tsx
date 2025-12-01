
import React, { useReducer } from 'react';
import { Printer, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import CustomDropdown from '../forms/CustomDropdown';
import Skeleton from '../Skeleton';

import IncomeInputs from './IncomeInputs';
import DeductionsPanel from './DeductionsPanel';
import ResultsDisplay from './ResultsDisplay';
import { useTaxCalculation } from './useTaxCalculation';
import { useTaxConfig } from '../../hooks/useTaxConfig';
import { IncomeHeads, Deductions } from './types';
import { AGE_MAP } from './taxSlabs';
import { CURRENT_AY, CURRENT_FY } from '../../config/financial-year';

// --- Reducer Types & Logic ---

interface TaxState {
  incomeHeads: IncomeHeads;
  deductions: Deductions;
  ageGroup: string;
  regime: 'new' | 'old';
  showResults: boolean;
  showDeductions: boolean;
}

type TaxAction =
  | { type: 'SET_INCOME'; field: keyof IncomeHeads; value: number }
  | { type: 'SET_DEDUCTION'; field: keyof Deductions; value: number }
  | { type: 'SET_DEDUCTIONS_OBJECT'; payload: Deductions } 
  | { type: 'SET_INCOME_OBJECT'; payload: IncomeHeads } 
  | { type: 'SET_AGE_GROUP'; value: string }
  | { type: 'SET_REGIME'; value: 'new' | 'old' }
  | { type: 'SHOW_RESULTS'; value: boolean }
  | { type: 'TOGGLE_DEDUCTIONS' }
  | { type: 'RESET' };

const initialIncome: IncomeHeads = {
  salary: 0, houseProperty: 0, business: 0, capitalGains: 0, otherSources: 0
};

const initialDeductions: Deductions = {
  d80c: 0, d80d: 0, hra: 0, d80e: 0, d80g: 0, d80tta: 0, d80ttb: 0, nps: 0, other: 0
};

const initialState: TaxState = {
  incomeHeads: initialIncome,
  deductions: initialDeductions,
  ageGroup: 'below60',
  regime: 'new',
  showResults: false,
  showDeductions: false,
};

function taxReducer(state: TaxState, action: TaxAction): TaxState {
  switch (action.type) {
    case 'SET_INCOME':
      return {
        ...state,
        incomeHeads: { ...state.incomeHeads, [action.field]: action.value }
      };
    case 'SET_INCOME_OBJECT':
      return { ...state, incomeHeads: action.payload };
    case 'SET_DEDUCTION':
      return {
        ...state,
        deductions: { ...state.deductions, [action.field]: action.value }
      };
    case 'SET_DEDUCTIONS_OBJECT':
      return { ...state, deductions: action.payload };
    case 'SET_AGE_GROUP':
      return { ...state, ageGroup: action.value };
    case 'SET_REGIME':
      return { ...state, regime: action.value };
    case 'SHOW_RESULTS':
      return { ...state, showResults: action.value };
    case 'TOGGLE_DEDUCTIONS':
      return { ...state, showDeductions: !state.showDeductions };
    case 'RESET':
      return {
        ...state,
        incomeHeads: initialIncome,
        deductions: initialDeductions,
        showResults: false
      };
    default:
      return state;
  }
}

// --- Component ---

const TaxCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(taxReducer, initialState);
  const { config, loading } = useTaxConfig();

  const comparison = useTaxCalculation(state.incomeHeads, state.deductions, state.ageGroup, config);

  const handleCalculate = () => dispatch({ type: 'SHOW_RESULTS', value: true });
  const handleClear = () => dispatch({ type: 'RESET' });
  const handlePrint = () => window.print();

  const setIncomeHeadsWrapper = (heads: IncomeHeads) => {
     dispatch({ type: 'SET_INCOME_OBJECT', payload: heads });
  };

  const setDeductionsWrapper = (deds: Deductions) => {
     dispatch({ type: 'SET_DEDUCTIONS_OBJECT', payload: deds });
  };

  if (loading || !config) {
    return (
      <div className="bg-brand-surface rounded-[3rem] p-8 md:p-12 border border-brand-border h-[600px] flex flex-col justify-center items-center gap-6 shadow-xl">
         <Loader2 className="w-12 h-12 text-brand-moss animate-spin" />
         <p className="text-brand-stone font-medium">Loading Tax Rules...</p>
         <div className="w-full max-w-md space-y-4">
            <Skeleton variant="text" height={40} className="w-full" />
            <Skeleton variant="text" height={40} className="w-3/4" />
            <Skeleton variant="text" height={40} className="w-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-[3rem] p-8 md:p-12 border border-brand-border shadow-2xl shadow-brand-dark/5 print:border-0 print:shadow-none print:p-0 animate-fade-in-up relative overflow-visible print-container">
      
      {/* Print Only Header (Letterhead Style) */}
      <div className="hidden print:flex flex-col items-center mb-8 border-b-2 border-black pb-4 text-center print-header">
         <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-1">{CONTACT_INFO.name}</h1>
         <p className="text-sm font-bold uppercase tracking-wider text-black mb-2">Chartered Accountants</p>
         <p className="text-xs text-black">
            {CONTACT_INFO.address.city} | {CONTACT_INFO.phone.display} | {CONTACT_INFO.email}
         </p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-brand-border/50 pb-8 print:mb-8 print:border-black">
          <div>
              <div className="mb-4">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone block mb-0.5 print:text-black">Assessment Year</span>
                   <span className="px-3 py-1 rounded-full bg-brand-moss/10 text-brand-moss text-xs font-bold uppercase tracking-widest border border-brand-moss/20 print:border-black print:text-black print:bg-white">{CURRENT_AY || config.assessmentYear}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-2 print:text-black">Tax Estimator</h2>
              <p className="text-brand-stone font-medium text-lg max-w-md print:text-black print:text-sm">
                Simplified calculation for modern taxpayers. Compare Old vs New Regime instantly.
              </p>
          </div>
          <button onClick={handlePrint} className="p-4 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-all shadow-sm hover:shadow-lg group print:hidden" aria-label="Print Calculation">
              <Printer size={20} className="group-hover:scale-110 transition-transform" />
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-7 space-y-10 print:col-span-12">
              
              {/* Age Selection */}
              <div className="bg-brand-bg/30 p-6 rounded-[2rem] border border-brand-border/50 print:border-black print:bg-white print:p-0 print:border-0 print:mb-6">
                  <div className="print:hidden">
                    <CustomDropdown
                        label="Tax Payer Category"
                        name="ageGroup"
                        value={AGE_MAP[state.ageGroup]}
                        options={Object.values(AGE_MAP)}
                        onChange={(_, val) => {
                            const key = Object.keys(AGE_MAP).find(k => AGE_MAP[k] === val);
                            if (key) dispatch({ type: 'SET_AGE_GROUP', value: key });
                        }}
                    />
                  </div>
                  {/* Print friendly static text */}
                  <div className="hidden print:block border p-2 border-black">
                      <span className="font-bold uppercase text-xs block mb-1">Category</span>
                      <span className="text-lg font-bold">{AGE_MAP[state.ageGroup]}</span>
                  </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-px bg-brand-border flex-grow print:bg-black"></div>
                   <h3 className="text-xs font-bold text-brand-stone uppercase tracking-widest print:text-black">Income Sources</h3>
                   <div className="h-px bg-brand-border flex-grow print:bg-black"></div>
                </div>
                <IncomeInputs incomeHeads={state.incomeHeads} setIncomeHeads={setIncomeHeadsWrapper} />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-px bg-brand-border flex-grow print:bg-black"></div>
                   <h3 className="text-xs font-bold text-brand-stone uppercase tracking-widest print:text-black">Exemptions</h3>
                   <div className="h-px bg-brand-border flex-grow print:bg-black"></div>
                </div>
                {/* Force show deductions in print mode if they exist */}
                <div className={state.showDeductions ? '' : 'print:hidden'}>
                    <DeductionsPanel 
                    deductions={state.deductions} 
                    setDeductions={setDeductionsWrapper} 
                    showDeductions={state.showDeductions}
                    setShowDeductions={() => dispatch({ type: 'TOGGLE_DEDUCTIONS' })}
                    ageGroup={state.ageGroup}
                    />
                </div>
              </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS & SUMMARY */}
          <div className="lg:col-span-5 relative print:col-span-12 h-full print:mt-8">
              <div className="sticky top-32 space-y-6 print:static">
                  
                  {/* Actions Card */}
                  <div className="bg-brand-dark p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden print:hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[60px] pointer-events-none"></div>
                      
                      <div className="relative z-10 text-center space-y-6">
                          <div>
                              <h3 className="text-xl font-heading font-bold text-white mb-2">Ready to calculate?</h3>
                              <p className="text-brand-stone/80 text-sm font-medium">Updated with {CURRENT_FY || config.financialYear} rules.</p>
                          </div>

                          <div className="flex flex-col gap-3">
                              <button 
                                onClick={handleCalculate} 
                                className="w-full py-5 bg-white text-brand-dark rounded-2xl font-bold text-lg hover:bg-brand-moss hover:text-white transition-all shadow-lg flex items-center justify-center gap-3 group"
                              >
                                Calculate Tax <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                              </button>
                              <button 
                                onClick={handleClear} 
                                className="w-full py-4 text-white/60 font-bold text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
                              >
                                <RotateCcw size={14} /> Clear Form
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Results */}
                  {comparison && (
                    <ResultsDisplay 
                        comparison={comparison}
                        regime={state.regime}
                        setRegime={(r) => dispatch({ type: 'SET_REGIME', value: r })}
                        showResults={state.showResults}
                    />
                  )}
                  
                  {/* Disclaimer */}
                  <div className="text-center print:text-left pt-4">
                      <p className="text-[10px] text-brand-stone/60 font-medium leading-relaxed print:text-black">
                          <strong>Note:</strong> This tool provides an estimate based on {CURRENT_FY || config.financialYear} proposals. Actual liability may vary.
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
