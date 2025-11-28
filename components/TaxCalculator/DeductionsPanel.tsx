import React from 'react';
import { ChevronUp, ChevronDown, Info, HelpCircle } from 'lucide-react';
import { Deductions } from './types';

interface DeductionsPanelProps {
  deductions: Deductions;
  setDeductions: (d: Deductions) => void;
  showDeductions: boolean;
  setShowDeductions: (show: boolean) => void;
  ageGroup: string;
}

const DeductionsPanel: React.FC<DeductionsPanelProps> = ({ 
  deductions, 
  setDeductions, 
  showDeductions, 
  setShowDeductions,
  ageGroup
}) => {
  const handleChange = (field: keyof Deductions, value: string) => {
    setDeductions({ ...deductions, [field]: Number(value) });
  };

  const DeductionInput = ({ field, label, placeholder, tooltip }: { field: keyof Deductions, label: string, placeholder: string, tooltip: string }) => (
    <div className="group">
        <div className="flex items-center gap-1 mb-1 ml-1">
            <label className="text-xs font-bold text-brand-stone">{label}</label>
            <div className="relative group/tooltip inline-block ml-1 align-middle">
            <HelpCircle size={14} className="text-brand-stone/60 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-brand-dark text-white text-xs p-3 rounded-lg hidden group-hover/tooltip:block z-50 shadow-xl leading-relaxed text-left">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-dark"></div>
            </div>
            </div>
        </div>
        <input 
            type="number" 
            value={deductions[field] || ''} 
            onChange={(e) => handleChange(field, e.target.value)} 
            className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm" 
            placeholder={placeholder} 
        />
    </div>
  );

  return (
    <div className="border border-brand-border rounded-2xl overflow-hidden transition-all duration-300 bg-brand-surface">
        <button 
        onClick={() => setShowDeductions(!showDeductions)}
        className="w-full flex justify-between items-center p-4 bg-brand-bg/50 hover:bg-brand-bg transition-colors"
        >
        <span className="text-sm font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2">
            Deductions (Old Regime)
        </span>
        {showDeductions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        <div className={`transition-all duration-500 ease-in-out ${showDeductions ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full mb-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-100 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                These deductions are generally available only under the Old Tax Regime. Standard Deduction is auto-applied to both.
            </div>

            <DeductionInput 
                field="d80c" label="80C (LIC, PPF, EPF)" placeholder="Investments (PPF, LIC, etc.)"
                tooltip="Deduction for investments in PPF, EPF, LIC premiums, Equity Linked Savings Schemes (ELSS), Principal repayment of Housing Loan, Sukanya Samriddhi Yojana, etc. The maximum aggregate deduction is capped at ₹1,50,000 per financial year."
            />
            <DeductionInput 
                field="d80d" label="80D (Medical Ins.)" placeholder="Medical Insurance Premium"
                tooltip="Deduction for Medical Insurance Premiums paid. Individuals can claim up to ₹25,000 for self/family (₹50,000 if senior citizen) and an additional ₹25,000 for parents (₹50,000 if senior citizen). Includes preventive health checkup up to ₹5,000."
            />
            <DeductionInput 
                field="nps" label="80CCD(1B) (NPS)" placeholder="NPS Contribution"
                tooltip="Additional deduction for voluntary contributions made to the National Pension System (NPS). This is over and above the ₹1.5 lakh limit of Section 80C. Maximum deduction allowed is ₹50,000."
            />
            <DeductionInput 
                field="hra" label="HRA / Home Loan Int." placeholder="Exempt HRA or Loan Interest"
                tooltip="Exemption for House Rent Allowance (HRA) under Section 10(13A) (least of: Actual HRA, Rent paid - 10% Salary, 50%/40% of Salary) OR Deduction for Interest on Home Loan under Section 24(b) for self-occupied property (Max ₹2,00,000)."
            />
            <DeductionInput 
                field="d80e" label="80E (Edu Loan Int.)" placeholder="Education Loan Interest"
                tooltip="Deduction for interest paid on Education Loan taken for higher studies (self, spouse, or children). There is no monetary ceiling on the amount, and it is available for a maximum of 8 years."
            />
            <DeductionInput 
                field="d80g" label="80G (Donations)" placeholder="Eligible Donation Amount"
                tooltip="Deduction for donations made to prescribed charitable institutions and relief funds. Deduction varies (50% or 100% of donation) depending on the donee. Some donations are subject to a qualifying limit of 10% of Adjusted Gross Total Income."
            />

            {ageGroup === 'below60' ? (
                <DeductionInput 
                    field="d80tta" label="80TTA (Savings Int.)" placeholder="Savings Interest (Max 10k)"
                    tooltip="Deduction for interest earned on Savings Accounts (Bank, Post Office, Co-op Society). Maximum deduction is ₹10,000. Note: This is NOT available for Resident Senior Citizens (use 80TTB instead)."
                />
            ) : (
                <DeductionInput 
                    field="d80ttb" label="80TTB (Senior Int.)" placeholder="Deposit Interest (Max 50k)"
                    tooltip="Deduction for Resident Senior Citizens (aged 60 years or more) on interest income from deposits (Savings + Fixed Deposits + Recurring Deposits). Maximum deduction is ₹50,000."
                />
            )}

            <DeductionInput 
                field="other" label="Other Deductions" placeholder="Other Chapter VI-A Deductions"
                tooltip="Any other deductions under Chapter VI-A, such as Sec 80U (Person with Disability), Sec 80DD (Maintenance of Dependent with Disability), Sec 80GGC (Donations to Political Parties), Sec 80DDB (Medical treatment of specified diseases), etc."
            />
        </div>
        </div>
    </div>
  );
};

export default DeductionsPanel;
