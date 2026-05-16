import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Deductions } from './types';

interface DeductionsPanelProps {
  deductions: Deductions;
  setDeductions: (d: Deductions) => void;
  showDeductions: boolean;
  setShowDeductions: (show: boolean) => void;
  ageGroup: string;
}

interface DeductionInputProps {
  field: keyof Deductions;
  label: string;
  placeholder: string;
  tooltip: string;
  value: number;
  onChange: (field: keyof Deductions, value: string) => void;
}

const DeductionInput: React.FC<DeductionInputProps> = ({ field, label, placeholder, tooltip, value, onChange }) => (
  <div className="group relative">
    <div className="mb-3 ml-1 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label
          htmlFor={`deduction-${field}`}
          className="cursor-pointer text-xs font-bold uppercase tracking-widest text-brand-dark"
        >
          {label}
        </label>
      </div>
      <div className="group/tooltip relative">
        <span className="cursor-help rounded-full border border-brand-border bg-brand-bg px-1.5 py-0.5 text-[10px] font-bold text-brand-stone transition-colors hover:bg-brand-dark hover:text-white">
          ?
        </span>
        {/* Tooltip with high z-index to prevent clipping */}
        <div className="pointer-events-none absolute bottom-full right-0 z-[60] mb-2 hidden w-64 rounded-xl bg-brand-dark p-3 text-left text-xs leading-relaxed text-white shadow-xl group-hover/tooltip:block">
          {tooltip}
          <div className="absolute right-1 top-full border-4 border-transparent border-t-brand-dark"></div>
        </div>
      </div>
    </div>
    <input
      id={`deduction-${field}`}
      type="number"
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full rounded-2xl border border-brand-border bg-brand-bg px-6 py-4 font-medium text-brand-dark transition-all placeholder:text-brand-stone/30 focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
      placeholder={placeholder}
    />
  </div>
);

const DeductionsPanel: React.FC<DeductionsPanelProps> = ({
  deductions,
  setDeductions,
  showDeductions,
  setShowDeductions,
  ageGroup,
}) => {
  const [overflowVisible, setOverflowVisible] = useState(false);

  const handleChange = (field: keyof Deductions, value: string) => {
    setDeductions({ ...deductions, [field]: Number(value) });
  };

  // Handle overflow transition to prevent tooltips from being clipped
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showDeductions) {
      // Wait for the slide-down animation (500ms) to finish before allowing overflow
      timer = setTimeout(() => {
        setOverflowVisible(true);
      }, 500);
    } else {
      setOverflowVisible(false);
    }
    return () => clearTimeout(timer);
  }, [showDeductions]);

  return (
    <div
      className={`rounded-[2rem] border border-brand-border bg-white shadow-sm transition-all duration-300 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <button
        onClick={() => setShowDeductions(!showDeductions)}
        className="group flex w-full items-center justify-between bg-white p-6 transition-colors hover:bg-brand-bg/30"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <span className="block font-heading text-lg font-bold text-brand-dark transition-colors group-hover:text-brand-moss">
              Old Regime Deductions
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-stone">
              Click to {showDeductions ? 'collapse' : 'expand'}
            </span>
          </div>
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-brand-border transition-all duration-300 ${showDeductions ? 'rotate-180 border-brand-moss bg-brand-moss text-white' : 'bg-transparent text-brand-stone'}`}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showDeductions ? 'max-h-[1600px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
      >
        <div className="border-t border-brand-border/50 bg-white p-6 pt-0 md:p-8">
          <div className="my-6 rounded-2xl border border-brand-border/50 bg-brand-bg p-4 text-sm font-medium text-brand-stone">
            <p className="leading-relaxed">
              These deductions are primarily for the Old Tax Regime. Standard Deduction (₹75k New / ₹50k Old) is applied
              automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
            <DeductionInput
              field="d80c"
              label="80C (Investments)"
              placeholder="Max 1.5L"
              tooltip="Max ₹1.5L. Includes PPF, EPF, LIC, ELSS, Principal repayment of Housing Loan, etc."
              value={deductions.d80c}
              onChange={handleChange}
            />
            <DeductionInput
              field="d80d"
              label="80D (Health Ins.)"
              placeholder="Premium Amt"
              tooltip="Medical Insurance Premiums. Max ₹25k (Self) + ₹25k (Parents). Higher limits for senior citizens."
              value={deductions.d80d}
              onChange={handleChange}
            />
            <DeductionInput
              field="nps"
              label="80CCD(1B) (NPS)"
              placeholder="Additional NPS"
              tooltip="Additional deduction for voluntary NPS contributions. Max ₹50,000 over 80C limit."
              value={deductions.nps}
              onChange={handleChange}
            />
            <DeductionInput
              field="hra"
              label="HRA / Housing Int."
              placeholder="Exempt Amt"
              tooltip="HRA Exemption or Interest on Housing Loan (Max ₹2L for self-occupied)."
              value={deductions.hra}
              onChange={handleChange}
            />
            <DeductionInput
              field="d80e"
              label="80E (Edu Loan)"
              placeholder="Interest Amt"
              tooltip="Interest on Education Loan for higher studies. No upper limit on amount."
              value={deductions.d80e}
              onChange={handleChange}
            />
            <DeductionInput
              field="d80g"
              label="80G (Donations)"
              placeholder="Donation Amt"
              tooltip="Donations to charitable funds. 50% or 100% deduction depending on the fund."
              value={deductions.d80g}
              onChange={handleChange}
            />

            {ageGroup === 'below60' ? (
              <DeductionInput
                field="d80tta"
                label="80TTA (Savings Int.)"
                placeholder="Max ₹10,000"
                tooltip="Savings Account Interest deduction. Max ₹10,000."
                value={deductions.d80tta}
                onChange={handleChange}
              />
            ) : (
              <DeductionInput
                field="d80ttb"
                label="80TTB (Senior Int.)"
                placeholder="Max ₹50,000"
                tooltip="Interest on deposits for Senior Citizens. Max ₹50,000."
                value={deductions.d80ttb}
                onChange={handleChange}
              />
            )}

            <DeductionInput
              field="other"
              label="Other Deductions"
              placeholder="Sec 80U, etc."
              tooltip="Any other Chapter VI-A deductions like disability maintenance, etc."
              value={deductions.other}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeductionsPanel;
