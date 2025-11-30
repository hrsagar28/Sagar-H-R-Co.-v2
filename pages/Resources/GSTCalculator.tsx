
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
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-dark">GST Calculator</h2>
          <p className="text-brand-stone mt-2">Calculate tax exclusive or inclusive amounts instantly.</p>
        </div>
        <button 
          onClick={handleClear} 
          className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Amount Input */}
          <div className="group">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-stone/50 font-medium">₹</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full pl-10 pr-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-lg font-heading font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder:text-brand-stone/30"
                placeholder="Enter Amount" 
              />
            </div>
          </div>

          {/* Tax Rate */}
          <div className="group">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">GST Rate</label>
            <div className="flex flex-wrap gap-2">
              {[5, 12, 18, 28].map(r => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${rate === r ? 'bg-brand-moss text-white shadow-md' : 'bg-brand-bg text-brand-stone hover:bg-brand-border/50'}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Tax Type */}
          <div className="group">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Calculation Type</label>
            <div className="flex bg-brand-bg p-1.5 rounded-2xl">
              <button 
                onClick={() => setType('exclusive')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'exclusive' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Tax Exclusive (Add GST)
              </button>
              <button 
                onClick={() => setType('inclusive')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'inclusive' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-stone hover:text-brand-dark'}`}
              >
                Tax Inclusive (Remove GST)
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-brand-dark text-white p-8 rounded-[2rem] flex flex-col justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-brand-moss opacity-20 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10"></div>
           
           <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                 <span className="text-white/60 font-medium">Net Amount</span>
                 <span className="text-xl font-mono font-bold">₹ {net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                 <span className="text-white/60 font-medium">GST ({rate}%)</span>
                 <span className="text-xl font-mono font-bold text-[#4ADE80]">+ ₹ {gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2">
                 <span className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-1">Total Amount</span>
                 <span className="text-4xl font-heading font-bold">₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
           </div>
           
           <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                 {type === 'exclusive' 
                   ? `Calculating GST on ₹${amount || 0} at ${rate}%`
                   : `Extracting GST from ₹${amount || 0} at ${rate}%`
                 }
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;
