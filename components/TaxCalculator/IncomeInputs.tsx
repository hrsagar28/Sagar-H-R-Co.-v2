import React from 'react';
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
}

const InputRow: React.FC<InputRowProps> = ({ 
  label, 
  field, 
  placeholder,
  value,
  onChange,
  tooltip
}) => (
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
          min="0"
          value={value || ''} 
          onChange={(e) => onChange(field, e.target.value)} 
          className="w-full pl-10 pr-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-lg font-heading font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder:text-brand-stone/30"
          placeholder={placeholder} 
        />
     </div>
  </div>
);

const IncomeInputs: React.FC<IncomeInputsProps> = ({ incomeHeads, setIncomeHeads }) => {
  const handleChange = (field: keyof IncomeHeads, value: string) => {
    // Prevent negative numbers
    const numVal = Math.max(0, Number(value));
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
        tooltip="Please enter Gross Salary before Standard Deduction or any other exemptions."
      />
      
      <InputRow 
        field="houseProperty" 
        label="Income from House Property" 
        placeholder="0"
        value={incomeHeads.houseProperty}
        onChange={handleChange}
      />
      
      <InputRow 
        field="business" 
        label="Business / Profession" 
        placeholder="0"
        value={incomeHeads.business}
        onChange={handleChange}
      />
      
      <InputRow 
        field="capitalGains" 
        label="Capital Gains" 
        placeholder="0"
        value={incomeHeads.capitalGains}
        onChange={handleChange}
      />
      
      <InputRow 
        field="otherSources" 
        label="Other Sources" 
        placeholder="0"
        value={incomeHeads.otherSources}
        onChange={handleChange}
      />
    </div>
  );
};

export default IncomeInputs;