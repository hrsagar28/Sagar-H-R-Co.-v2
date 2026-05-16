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
    const cond2 = Number(rentPaid) - 0.1 * salary;

    // 3. 50% (Metro) or 40% (Non-Metro) of Salary
    const cond3 = (isMetro ? 0.5 : 0.4) * salary;

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
    <div className="animate-fade-in-up rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-brand-dark">HRA Calculator</h2>
          <p className="mt-2 text-brand-stone">Calculate House Rent Allowance exemption.</p>
        </div>
        <button
          onClick={handleClear}
          className="rounded-full bg-brand-bg p-3 text-brand-dark transition-colors hover:bg-red-50 hover:text-red-600"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Inputs */}
        <div className="space-y-6 lg:col-span-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
                Basic Salary (Yearly)
              </label>
              <input
                type="number"
                value={basic}
                onChange={(e) => setBasic(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg p-4 font-bold text-brand-dark focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="0"
              />
            </div>
            <div className="group">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
                DA (Yearly)
              </label>
              <input
                type="number"
                value={da}
                onChange={(e) => setDA(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg p-4 font-bold text-brand-dark focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
                HRA Received (Yearly)
              </label>
              <input
                type="number"
                value={hraReceived}
                onChange={(e) => setHraReceived(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg p-4 font-bold text-brand-dark focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="0"
              />
            </div>
            <div className="group">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
                Rent Paid (Yearly)
              </label>
              <input
                type="number"
                value={rentPaid}
                onChange={(e) => setRentPaid(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg p-4 font-bold text-brand-dark focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="0"
              />
            </div>
          </div>

          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
              Residence City Type
            </label>
            <div className="flex max-w-md rounded-2xl bg-brand-bg p-1.5">
              <button
                onClick={() => setIsMetro(true)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isMetro ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Metro (50%)
              </button>
              <button
                onClick={() => setIsMetro(false)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${!isMetro ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Non-Metro (40%)
              </button>
            </div>
            <p className="ml-1 mt-2 text-[10px] text-brand-stone">Metros: Delhi, Mumbai, Kolkata, Chennai</p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col justify-center gap-8 rounded-[2rem] border border-brand-border bg-brand-bg/50 p-8">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-stone">
                Exempt HRA
              </span>
              <span className="font-heading text-4xl font-bold text-green-700">₹ {exempt.toLocaleString('en-IN')}</span>
              <p className="mt-2 text-xs text-brand-stone">Least of: Actual HRA, Rent-10% Salary, 50%/40% Salary</p>
            </div>
            <div className="border-t border-brand-border/50 pt-8">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-stone">
                Taxable HRA
              </span>
              <span className="font-heading text-4xl font-bold text-brand-dark">
                ₹ {taxable.toLocaleString('en-IN')}
              </span>
              <p className="mt-2 text-xs text-brand-stone">Added to your taxable salary income</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRACalculator;
