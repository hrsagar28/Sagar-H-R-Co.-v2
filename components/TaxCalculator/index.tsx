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
  salary: 0,
  houseProperty: 0,
  business: 0,
  capitalGains: 0,
  otherSources: 0,
};

const initialDeductions: Deductions = {
  d80c: 0,
  d80d: 0,
  hra: 0,
  d80e: 0,
  d80g: 0,
  d80tta: 0,
  d80ttb: 0,
  nps: 0,
  other: 0,
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
        incomeHeads: { ...state.incomeHeads, [action.field]: action.value },
      };
    case 'SET_INCOME_OBJECT':
      return { ...state, incomeHeads: action.payload };
    case 'SET_DEDUCTION':
      return {
        ...state,
        deductions: { ...state.deductions, [action.field]: action.value },
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
        showResults: false,
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
      <div className="flex h-[600px] flex-col items-center justify-center gap-6 rounded-[3rem] border border-brand-border bg-brand-surface p-8 shadow-xl md:p-12">
        <Loader2 className="h-12 w-12 animate-spin text-brand-moss" />
        <p className="font-medium text-brand-stone">Loading Tax Rules...</p>
        <div className="w-full max-w-md space-y-4">
          <Skeleton variant="text" height={40} className="w-full" />
          <Skeleton variant="text" height={40} className="w-3/4" />
          <Skeleton variant="text" height={40} className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="print-container relative animate-fade-in-up overflow-visible rounded-[3rem] border border-brand-border bg-brand-surface p-8 shadow-2xl shadow-brand-dark/5 md:p-12 print:border-0 print:p-0 print:shadow-none">
      {/* Print Only Header (Letterhead Style) */}
      <div className="print-header mb-8 hidden flex-col items-center border-b-2 border-black pb-4 text-center print:flex">
        <h1 className="mb-1 font-serif text-3xl font-bold uppercase tracking-widest text-black">{CONTACT_INFO.name}</h1>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-black">Chartered Accountants</p>
        <p className="text-xs text-black">
          {CONTACT_INFO.address.city} | {CONTACT_INFO.phone.display} | {CONTACT_INFO.email}
        </p>
      </div>

      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-brand-border/50 pb-8 md:flex-row md:items-end print:mb-8 print:border-black">
        <div>
          <div className="mb-4">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-brand-stone print:text-black">
              Assessment Year
            </span>
            <span className="rounded-full border border-brand-moss/20 bg-brand-moss/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-moss print:border-black print:bg-white print:text-black">
              {CURRENT_AY || config.assessmentYear}
            </span>
          </div>
          <h2 className="mb-2 font-heading text-4xl font-bold text-brand-dark md:text-5xl print:text-black">
            Tax Estimator
          </h2>
          <p className="max-w-md text-lg font-medium text-brand-stone print:text-sm print:text-black">
            Simplified calculation for modern taxpayers. Compare Old vs New Regime instantly.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="group rounded-full bg-brand-bg p-4 text-brand-dark shadow-sm transition-all hover:bg-brand-moss hover:text-white hover:shadow-lg print:hidden"
          aria-label="Print Calculation"
        >
          <Printer size={20} className="transition-transform group-hover:scale-110" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* LEFT COLUMN: INPUTS */}
        <div className="space-y-10 lg:col-span-7 print:col-span-12">
          {/* Age Selection */}
          <div className="rounded-[2rem] border border-brand-border/50 bg-brand-bg/30 p-6 print:mb-6 print:border-0 print:border-black print:bg-white print:p-0">
            <div className="print:hidden">
              <CustomDropdown
                label="Tax Payer Category"
                name="ageGroup"
                value={AGE_MAP[state.ageGroup] || AGE_MAP.below60 || 'Below 60 years'}
                options={Object.values(AGE_MAP)}
                onChange={(_, val) => {
                  const key = Object.keys(AGE_MAP).find((k) => AGE_MAP[k] === val);
                  if (key) dispatch({ type: 'SET_AGE_GROUP', value: key });
                }}
              />
            </div>
            {/* Print friendly static text */}
            <div className="hidden border border-black p-2 print:block">
              <span className="mb-1 block text-xs font-bold uppercase">Category</span>
              <span className="text-lg font-bold">{AGE_MAP[state.ageGroup]}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-brand-border print:bg-black"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-stone print:text-black">
                Income Sources
              </h3>
              <div className="h-px flex-grow bg-brand-border print:bg-black"></div>
            </div>
            <IncomeInputs incomeHeads={state.incomeHeads} setIncomeHeads={setIncomeHeadsWrapper} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-brand-border print:bg-black"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-stone print:text-black">
                Exemptions
              </h3>
              <div className="h-px flex-grow bg-brand-border print:bg-black"></div>
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
        <div className="relative h-full lg:col-span-5 print:col-span-12 print:mt-8">
          <div className="sticky top-32 space-y-6 print:static">
            {/* Actions Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-dark p-8 shadow-2xl print:hidden">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-moss opacity-20 blur-[60px]"></div>

              <div className="relative z-10 space-y-6 text-center">
                <div>
                  <h3 className="mb-2 font-heading text-xl font-bold text-white">Ready to calculate?</h3>
                  <p className="text-sm font-medium text-brand-stone/80">
                    Updated with {CURRENT_FY || config.financialYear} rules.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCalculate}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 text-lg font-bold text-brand-dark shadow-lg transition-all hover:bg-brand-moss hover:text-white"
                  >
                    Calculate Tax <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-white/60 transition-colors hover:text-white"
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
            <div className="pt-4 text-center print:text-left">
              <p className="text-[10px] font-medium leading-relaxed text-brand-stone/60 print:text-black">
                <strong>Note:</strong> This tool provides an estimate based on {CURRENT_FY || config.financialYear}{' '}
                proposals. Actual liability may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
