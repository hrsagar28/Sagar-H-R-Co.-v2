import React from 'react';
import { Check, Info, Calculator } from 'lucide-react';
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

  return (
    <>
        {/* RECOMMENDATION BANNER */}
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

        {/* RESULTS PANEL */}
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
        </div>
    </>
  );
};

export default ResultsDisplay;
