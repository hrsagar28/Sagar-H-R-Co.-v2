
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
    <div className="space-y-6 animate-scale-in">
        {/* RECOMMENDATION BANNER */}
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden shadow-lg transition-colors duration-500 print:border-black print:rounded-none print:shadow-none print:p-4 print:mb-4 ${
            comparison.recommendation === regime || comparison.recommendation === 'equal' 
                ? 'bg-gradient-to-br from-brand-moss to-[#143d24] border-transparent text-white print:bg-white print:text-black' 
                : 'bg-white border-brand-border text-brand-dark print:border-black'
        }`}>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold ${comparison.recommendation === regime || comparison.recommendation === 'equal' ? 'text-white/80 print:text-black' : 'text-brand-stone print:text-black'}`}>
                        Recommendation
                    </div>
                    {comparison.recommendation !== 'equal' && comparison.recommendation !== regime && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full print:border print:border-red-500 print:bg-white">Not Recommended</span>
                    )}
                </div>
                
                <div className="leading-tight">
                    {comparison.recommendation === 'new' && (
                        <div className="space-y-2">
                            <span className="text-lg font-medium block opacity-90">Switch to <strong>New Regime</strong></span>
                            <span className="text-3xl font-heading font-bold text-[#4ADE80] print:text-black block">Save ₹ {savings}</span>
                        </div>
                    )}
                    {comparison.recommendation === 'old' && (
                        <div className="space-y-2">
                            <span className="text-lg font-medium block opacity-90">Stick to <strong>Old Regime</strong></span>
                            <span className="text-3xl font-heading font-bold text-[#4ADE80] print:text-black block">Save ₹ {savings}</span>
                        </div>
                    )}
                    {comparison.recommendation === 'equal' && (
                        <div className="space-y-1">
                            <span className="text-xl font-heading font-bold block">Tax Neutral</span>
                            <span className="text-sm opacity-80 block">Both regimes result in equal tax liability.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="bg-white border border-brand-border rounded-[2.5rem] p-8 shadow-xl shadow-brand-dark/5 print:border-black print:border-2 print:shadow-none print:rounded-none print:p-4">
            
            {/* Toggle Header */}
            <div className="flex flex-col gap-6 mb-8 border-b border-brand-border/60 pb-6 print:border-black print:mb-4 print:pb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-heading font-bold text-brand-dark print:text-black">
                        Breakdown
                    </h3>
                    <span className="text-xs font-bold text-brand-stone bg-brand-bg px-3 py-1 rounded-full border border-brand-border print:border-black print:text-black print:bg-white">
                        {regime === 'new' ? 'New Regime' : 'Old Regime'}
                    </span>
                </div>
                
                <div className="flex bg-brand-bg p-1.5 rounded-2xl print:hidden w-full relative">
                    <button 
                        onClick={() => setRegime('new')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${regime === 'new' ? 'text-brand-moss shadow-sm bg-white ring-1 ring-black/5' : 'text-brand-stone hover:text-brand-dark'}`}
                    >
                        New Regime
                    </button>
                    <button 
                        onClick={() => setRegime('old')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${regime === 'old' ? 'text-brand-moss shadow-sm bg-white ring-1 ring-black/5' : 'text-brand-stone hover:text-brand-dark'}`}
                    >
                        Old Regime
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                {/* Summary Rows */}
                <div className="flex justify-between items-center">
                    <span className="text-brand-stone text-sm font-medium print:text-black">Gross Income</span>
                    <span className="font-bold font-mono text-brand-dark text-lg print:text-black">₹ {res.grossIncome.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="space-y-2 py-4 border-t border-brand-border/50 border-dashed print:border-black">
                    <div className="flex justify-between text-sm text-brand-stone/80 print:text-black">
                        <span>Standard Deduction</span>
                        <span className="font-mono text-brand-dark print:text-black">- ₹ {res.stdDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-brand-stone/80 print:text-black">
                        <span>Chapter VI-A Deductions</span>
                        <span className="font-mono text-brand-dark print:text-black">- ₹ {res.chapterVIA.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-brand-border/60 bg-brand-bg/30 -mx-8 px-8 print:bg-white print:border-black print:mx-0 print:px-0">
                    <span className="text-brand-dark font-bold text-sm uppercase tracking-wider print:text-black">Taxable Income</span>
                    <span className="font-bold font-mono text-brand-dark text-lg print:text-black">₹ {res.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-brand-stone font-medium print:text-black">Tax on Income</span>
                        <span className="font-mono text-brand-dark print:text-black">₹ {res.taxOnIncome.toLocaleString('en-IN')}</span>
                    </div>
                    {res.rebate > 0 && (
                        <div className="flex justify-between text-sm text-green-700 font-bold print:text-black">
                            <span>Rebate u/s 87A</span>
                            <span className="font-mono">- ₹ {res.rebate.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    {res.surcharge > 0 && (
                        <div className="flex justify-between text-sm text-orange-600 font-bold print:text-black">
                            <span>Surcharge</span>
                            <span className="font-mono">+ ₹ {Math.round(res.surcharge).toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-brand-stone/80 print:text-black">
                        <span>Health & Ed. Cess (4%)</span>
                        <span className="font-mono text-brand-dark print:text-black">₹ {Math.round(res.cess).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Final Total */}
                <div className="pt-6 mt-4 border-t-2 border-brand-moss/20 flex justify-between items-end print:border-black">
                    <span className="text-sm font-bold text-brand-stone uppercase tracking-widest mb-1 print:text-black">Net Payable</span>
                    <span className="text-4xl font-heading font-bold text-brand-moss tracking-tighter print:text-black">₹ {Math.round(res.totalTax).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResultsDisplay;
