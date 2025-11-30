
import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const HRACalculator: React.FC = () => {
  const [basic, setBasic] = useState<number | ''>('');
  const [da, setDA] = useState<number | ''>('');
  const [hraReceived, setHraReceived] = useState<number | ''>('');
  const [rentPaid, setRentPaid] = useState<number | ''>('');
  const [isMetro, setIsMetro] = useState(true);

  const calculate = () => {
    if (!basic || !rentPaid || !hraReceived) return { exempt: 0, taxable: 0 };

    const salary = Number(basic) + Number(da || 0);
    
    // 1. Actual HRA Received
    const cond1 = Number(hraReceived);
    
    // 2. Rent Paid - 10% of Salary
    const cond2 = Number(rentPaid) - (0.10 * salary);
    
    // 3. 50% (Metro) or 40% (Non-Metro) of Salary
    const cond3 = (isMetro ? 0.50 : 0.40) * salary;

    const exempt = Math.max(0, Math.min(cond1, cond2, cond3));
    const taxable = Math.max(0, cond1 - exempt);

    return { exempt, taxable };
  };

  const { exempt, taxable } = calculate();

  const handleClear = () => {
    setBasic('');
    setDA('');
    setHraReceived('');
    setRentPaid('');
    setIsMetro(true);
  };

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-dark">HRA Calculator</h2>
          <p className="text-brand-stone mt-2">Calculate House Rent Allowance exemption.</p>
        </div>
        <button 
          onClick={handleClear} 
          className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Inputs */}
        <div className="lg:col-span-7 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Basic Salary (Yearly)</label>
                <input 
                  type="number" 
                  value={basic} 
                  onChange={(e) => setBasic(Number(e.target.value))} 
                  className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none"
                  placeholder="0" 
                />
              </div>
              <div className="group">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">DA (Yearly)</label>
                <input 
                  type="number" 
                  value={da} 
                  onChange={(e) => setDA(Number(e.target.value))} 
                  className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none"
                  placeholder="0" 
                />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">HRA Received (Yearly)</label>
                <input 
                  type="number" 
                  value={hraReceived} 
                  onChange={(e) => setHraReceived(Number(e.target.value))} 
                  className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none"
                  placeholder="0" 
                />
              </div>
              <div className="group">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Rent Paid (Yearly)</label>
                <input 
                  type="number" 
                  value={rentPaid} 
                  onChange={(e) => setRentPaid(Number(e.target.value))} 
                  className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none"
                  placeholder="0" 
                />
              </div>
           </div>

           <div className="group">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Residence City Type</label>
              <div className="flex bg-brand-bg p-1.5 rounded-2xl max-w-md">
                <button 
                  onClick={() => setIsMetro(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${isMetro ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
                >
                  Metro (50%)
                </button>
                <button 
                  onClick={() => setIsMetro(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${!isMetro ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
                >
                  Non-Metro (40%)
                </button>
              </div>
              <p className="text-[10px] text-brand-stone mt-2 ml-1">Metros: Delhi, Mumbai, Kolkata, Chennai</p>
           </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5">
           <div className="bg-brand-bg/50 border border-brand-border rounded-[2rem] p-8 h-full flex flex-col justify-center gap-8">
              <div>
                 <span className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-2 block">Exempt HRA</span>
                 <span className="text-4xl font-heading font-bold text-green-700">₹ {exempt.toLocaleString('en-IN')}</span>
                 <p className="text-xs text-brand-stone mt-2">Least of: Actual HRA, Rent-10% Salary, 50%/40% Salary</p>
              </div>
              <div className="border-t border-brand-border/50 pt-8">
                 <span className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-2 block">Taxable HRA</span>
                 <span className="text-4xl font-heading font-bold text-brand-dark">₹ {taxable.toLocaleString('en-IN')}</span>
                 <p className="text-xs text-brand-stone mt-2">Added to your taxable salary income</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HRACalculator;
