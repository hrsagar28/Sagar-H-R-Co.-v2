import React from 'react';
import { IncomeHeads } from './types';

interface IncomeInputsProps {
  incomeHeads: IncomeHeads;
  setIncomeHeads: (heads: IncomeHeads) => void;
}

const IncomeInputs: React.FC<IncomeInputsProps> = ({ incomeHeads, setIncomeHeads }) => {
  const handleChange = (field: keyof IncomeHeads, value: string) => {
    setIncomeHeads({ ...incomeHeads, [field]: Number(value) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest border-b border-brand-border pb-2">Income Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="group">
            <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Salary / Pension (Before Std. Ded.)</label>
            <input 
              type="number" 
              value={incomeHeads.salary || ''} 
              onChange={(e) => handleChange('salary', e.target.value)} 
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" 
              placeholder="Gross Salary (Basic + DA + Allowances)" 
            />
        </div>
        <div className="group">
            <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">House Property (Net Value)</label>
            <input 
              type="number" 
              value={incomeHeads.houseProperty || ''} 
              onChange={(e) => handleChange('houseProperty', e.target.value)} 
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" 
              placeholder="Income/Loss from House Property" 
            />
        </div>
        <div className="group">
            <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Business & Profession (Net Profit)</label>
            <input 
              type="number" 
              value={incomeHeads.business || ''} 
              onChange={(e) => handleChange('business', e.target.value)} 
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" 
              placeholder="Net Profit as per Books / Presumptive Income" 
            />
        </div>
        <div className="group">
            <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Capital Gains</label>
            <input 
              type="number" 
              value={incomeHeads.capitalGains || ''} 
              onChange={(e) => handleChange('capitalGains', e.target.value)} 
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" 
              placeholder="Total Capital Gains (STCG + LTCG)" 
            />
        </div>
        <div className="group">
            <label className="block text-xs font-bold text-brand-stone mb-1.5 ml-1">Other Sources (Interest, etc.)</label>
            <input 
              type="number" 
              value={incomeHeads.otherSources || ''} 
              onChange={(e) => handleChange('otherSources', e.target.value)} 
              className="w-full p-3 bg-brand-bg border border-brand-border rounded-xl font-mono focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none" 
              placeholder="Interest, Dividends, etc." 
            />
        </div>
      </div>
    </div>
  );
};

export default IncomeInputs;
