import React from 'react';
import { ComparisonResult } from './types';

interface ResultsDisplayProps {
  comparison: ComparisonResult;
  regime: 'new' | 'old';
  setRegime: (r: 'new' | 'old') => void;
  showResults: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ comparison, regime, setRegime, showResults }) => {
  if (!showResults) return null;

  const res = regime === 'new' ? comparison.new : comparison.old;
  const savings = Math.round(comparison.savings).toLocaleString('en-IN');

  return (
    <div className="animate-scale-in space-y-6">
      {/* RECOMMENDATION BANNER */}
      <div
        className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-lg transition-colors duration-500 print:mb-4 print:rounded-none print:border-black print:p-4 print:shadow-none ${
          comparison.recommendation === regime || comparison.recommendation === 'equal'
            ? 'border-transparent bg-gradient-to-br from-brand-moss to-[#143d24] text-white print:bg-white print:text-black'
            : 'border-brand-border bg-white text-brand-dark print:border-black'
        }`}
      >
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${comparison.recommendation === regime || comparison.recommendation === 'equal' ? 'text-white/80 print:text-black' : 'text-brand-stone print:text-black'}`}
            >
              Recommendation
            </div>
            {comparison.recommendation !== 'equal' && comparison.recommendation !== regime && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500 print:border print:border-red-500 print:bg-white">
                Not Recommended
              </span>
            )}
          </div>

          <div className="leading-tight">
            {comparison.recommendation === 'new' && (
              <div className="space-y-2">
                <span className="block text-lg font-medium opacity-90">
                  Switch to <strong>New Regime</strong>
                </span>
                <span className="block font-heading text-3xl font-bold text-[#4ADE80] print:text-black">
                  Save ₹ {savings}
                </span>
              </div>
            )}
            {comparison.recommendation === 'old' && (
              <div className="space-y-2">
                <span className="block text-lg font-medium opacity-90">
                  Stick to <strong>Old Regime</strong>
                </span>
                <span className="block font-heading text-3xl font-bold text-[#4ADE80] print:text-black">
                  Save ₹ {savings}
                </span>
              </div>
            )}
            {comparison.recommendation === 'equal' && (
              <div className="space-y-1">
                <span className="block font-heading text-xl font-bold">Tax Neutral</span>
                <span className="block text-sm opacity-80">Both regimes result in equal tax liability.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS PANEL */}
      <div className="rounded-[2.5rem] border border-brand-border bg-white p-8 shadow-xl shadow-brand-dark/5 print:rounded-none print:border-2 print:border-black print:p-4 print:shadow-none">
        {/* Toggle Header */}
        <div className="mb-8 flex flex-col gap-6 border-b border-brand-border/60 pb-6 print:mb-4 print:border-black print:pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold text-brand-dark print:text-black">Breakdown</h3>
            <span className="rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-xs font-bold text-brand-stone print:border-black print:bg-white print:text-black">
              {regime === 'new' ? 'New Regime' : 'Old Regime'}
            </span>
          </div>

          <div className="relative flex w-full rounded-2xl bg-brand-bg p-1.5 print:hidden">
            <button
              onClick={() => setRegime('new')}
              className={`relative z-10 flex-1 rounded-xl py-3 text-sm font-bold transition-[background-color,color,box-shadow] duration-300 ${regime === 'new' ? 'bg-white text-brand-moss shadow-sm ring-1 ring-black/5' : 'text-brand-stone hover:text-brand-dark'}`}
            >
              New Regime
            </button>
            <button
              onClick={() => setRegime('old')}
              className={`relative z-10 flex-1 rounded-xl py-3 text-sm font-bold transition-[background-color,color,box-shadow] duration-300 ${regime === 'old' ? 'bg-white text-brand-moss shadow-sm ring-1 ring-black/5' : 'text-brand-stone hover:text-brand-dark'}`}
            >
              Old Regime
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary Rows */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-stone print:text-black">Gross Income</span>
            <span className="font-mono text-lg font-bold text-brand-dark print:text-black">
              ₹ {res.grossIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2 border-t border-dashed border-brand-border/50 py-4 print:border-black">
            <div className="flex justify-between text-sm text-brand-stone print:text-black">
              <span>Standard Deduction</span>
              <span className="font-mono text-brand-dark print:text-black">
                - ₹ {res.stdDeduction.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm text-brand-stone print:text-black">
              <span>Chapter VI-A Deductions</span>
              <span className="font-mono text-brand-dark print:text-black">
                - ₹ {res.chapterVIA.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="-mx-8 flex items-center justify-between border-t border-brand-border/60 bg-brand-bg/30 px-8 py-4 print:mx-0 print:border-black print:bg-white print:px-0">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-dark print:text-black">
              Taxable Income
            </span>
            <span className="font-mono text-lg font-bold text-brand-dark print:text-black">
              ₹ {res.taxableIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-brand-stone print:text-black">Tax on Income</span>
              <span className="font-mono text-brand-dark print:text-black">
                ₹ {res.taxOnIncome.toLocaleString('en-IN')}
              </span>
            </div>
            {res.rebate > 0 && (
              <div className="flex justify-between text-sm font-bold text-green-700 print:text-black">
                <span>Rebate u/s 87A</span>
                <span className="font-mono">- ₹ {res.rebate.toLocaleString('en-IN')}</span>
              </div>
            )}
            {res.surcharge > 0 && (
              <div className="flex justify-between text-sm font-bold text-orange-600 print:text-black">
                <span>Surcharge</span>
                <span className="font-mono">+ ₹ {Math.round(res.surcharge).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-brand-stone print:text-black">
              <span>Health & Ed. Cess (4%)</span>
              <span className="font-mono text-brand-dark print:text-black">
                ₹ {Math.round(res.cess).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Final Total */}
          <div className="mt-4 flex items-end justify-between border-t-2 border-brand-moss/20 pt-6 print:border-black">
            <span className="mb-1 text-sm font-bold uppercase tracking-widest text-brand-stone print:text-black">
              Net Payable
            </span>
            <span className="font-heading text-4xl font-bold tracking-tighter text-brand-moss print:text-black">
              ₹ {Math.round(res.totalTax).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
