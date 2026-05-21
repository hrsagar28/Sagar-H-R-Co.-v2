import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

const GSTCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number | ''>('');
  const [rate, setRate] = useState<number>(18);
  const [type, setType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const calculate = () => {
    if (!amount) return { net: 0, gst: 0, total: 0 };

    let net = 0;
    let gst = 0;
    let total = 0;

    if (type === 'exclusive') {
      net = Number(amount);
      gst = (net * rate) / 100;
      total = net + gst;
    } else {
      total = Number(amount);
      net = total / (1 + rate / 100);
      gst = total - net;
    }

    return { net, gst, total };
  };

  const { net, gst, total } = calculate();

  const handleClear = () => {
    setAmount('');
    setRate(18);
    setType('exclusive');
  };

  return (
    <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-brand-dark">GST Calculator</h2>
          <p className="mt-2 text-brand-stone">Calculate tax exclusive or inclusive amounts instantly.</p>
        </div>
        <button
          onClick={handleClear}
          className="rounded-full bg-brand-bg p-3 text-brand-dark transition-colors hover:bg-red-50 hover:text-red-600"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-8">
          {/* Amount Input */}
          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-medium text-brand-stone/50">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg py-4 pl-10 pr-6 font-heading text-lg font-bold text-brand-dark transition-[border-color,box-shadow] placeholder:text-brand-stone/30 focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="Enter Amount"
              />
            </div>
          </div>

          {/* Tax Rate */}
          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">GST Rate</label>
            <div className="flex flex-wrap gap-2">
              {[5, 12, 18, 28].map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`flex-1 rounded-xl px-4 py-3 font-bold transition-[background-color,color,box-shadow] ${rate === r ? 'bg-brand-moss text-white shadow-md' : 'bg-brand-bg text-brand-stone hover:bg-brand-border/50'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Tax Type */}
          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
              Calculation Type
            </label>
            <div className="flex rounded-2xl bg-brand-bg p-1.5">
              <button
                onClick={() => setType('exclusive')}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-[background-color,color,box-shadow] ${type === 'exclusive' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Tax Exclusive (Add GST)
              </button>
              <button
                onClick={() => setType('inclusive')}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-[background-color,color,box-shadow] ${type === 'inclusive' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Tax Inclusive (Remove GST)
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-brand-dark p-8 text-white shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-brand-moss opacity-20 blur-[60px]"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <span className="font-medium text-white/60">Net Amount</span>
              <span className="font-mono text-xl font-bold">
                ₹ {net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <span className="font-medium text-white/60">GST ({rate}%)</span>
              <span className="font-mono text-xl font-bold text-brand-accent">
                + ₹ {gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Total Amount</span>
              <span className="font-heading text-4xl font-bold">
                ₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/40">
              {type === 'exclusive'
                ? `Calculating GST on ₹${amount || 0} at ${rate}%`
                : `Extracting GST from ₹${amount || 0} at ${rate}%`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;
