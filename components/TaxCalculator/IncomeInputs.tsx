
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { IncomeHeads } from './types';

interface IncomeInputsProps {
  incomeHeads: IncomeHeads;
  setIncomeHeads: (heads: IncomeHeads) => void;
}

interface InputRowProps {
  label: string;
  field: keyof IncomeHeads;
  placeholder: string;
  value: number;
  onChange: (field: keyof IncomeHeads, value: string) => void;
  tooltip?: string;
  warningThreshold?: number;
}

const InputRow: React.FC<InputRowProps> = ({ 
  label, 
  field, 
  placeholder,
  value,
  onChange,
  tooltip,
  warningThreshold = 50000000 // Default warning at 5 Crores
}) => {
  const showWarning = value > warningThreshold;

  return (
    <div className="group">
       <div className="flex items-center gap-2 mb-3 ml-1">
          <label htmlFor={`input-${field}`} className="text-xs font-bold text-brand-dark uppercase tracking-widest">
             {label}
          </label>
          {tooltip && (
            <div className="relative group/tooltip cursor-help">
              <span className="text-[10px] font-bold text-brand-stone bg-brand-bg border border-brand-border px-1.5 py-0.5 rounded-full hover:bg-brand-dark hover:text-white transition-colors">?</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-brand-dark text-white text-xs p-3 rounded-xl hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-center pointer-events-none">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
              </div>
            </div>
          )}
       </div>
       <div className="relative">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-stone/50 font-medium">₹</span>
          <input 
            id={`input-${field}`}
            type="number" 
            value={value || ''} 
            onChange={(e) => onChange(field, e.target.value)} 
            className={`w-full pl-10 pr-6 py-4 bg-brand-bg border rounded-2xl text-lg font-heading font-bold text-brand-dark focus:outline-none focus:ring-1 transition-all placeholder:text-brand-stone/30 ${
                showWarning ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500' : 'border-brand-border focus:border-brand-moss focus:ring-brand-moss'
            }`}
            placeholder={placeholder} 
          />
       </div>
       {showWarning && (
           <div className="flex items-center gap-2 mt-2 text-orange-600 text-xs font-bold animate-fade-in-up">
               <AlertCircle size={12} />
               <span>High value entered. Please verify.</span>
           </div>
       )}
    </div>
  );
};

const IncomeInputs: React.FC<IncomeInputsProps> = ({ incomeHeads, setIncomeHeads }) => {
  const handleChange = (field: keyof IncomeHeads, value: string) => {
    // Allow negative values only for Capital Gains (Losses)
    // For others, floor at 0
    let numVal = Number(value);
    
    if (field !== 'capitalGains' && field !== 'houseProperty') { // House property loss is also possible
        numVal = Math.max(0, numVal);
    }
    
    // Reasonable max cap check (e.g. 1000 Crores) to prevent overflow/abuse
    if (numVal > 10000000000) return;

    setIncomeHeads({ ...incomeHeads, [field]: value === '' ? 0 : numVal });
  };

  return (
    <div className="space-y-6">
      <InputRow 
        field="salary" 
        label="Salary / Pension" 
        placeholder="0"
        value={incomeHeads.salary}
        onChange={handleChange}
        tooltip="Gross Salary before Standard Deduction. Include allowances and perquisites."
        warningThreshold={10000000} // Warn > 1 Cr
      />
      
      <InputRow 
        field="houseProperty" 
        label="Income from House Property" 
        placeholder="0"
        value={incomeHeads.houseProperty}
        onChange={handleChange}
        tooltip="Net annual value. Enter negative value for loss (Interest on Home Loan)."
        warningThreshold={5000000} // Warn > 50L
      />
      
      <InputRow 
        field="business" 
        label="Business / Profession" 
        placeholder="0"
        value={incomeHeads.business}
        onChange={handleChange}
        tooltip="Net Profit/Gain from Business or Profession."
        warningThreshold={50000000} // Warn > 5 Cr
      />
      
      <InputRow 
        field="capitalGains" 
        label="Capital Gains" 
        placeholder="0"
        value={incomeHeads.capitalGains}
        onChange={handleChange}
        tooltip="Total Short Term and Long Term Capital Gains. Enter negative for losses."
        warningThreshold={50000000} // Warn > 5 Cr
      />
      
      <InputRow 
        field="otherSources" 
        label="Other Sources" 
        placeholder="0"
        value={incomeHeads.otherSources}
        onChange={handleChange}
        tooltip="Interest, Dividend, etc."
        warningThreshold={5000000} // Warn > 50L
      />
    </div>
  );
};

export default IncomeInputs;
