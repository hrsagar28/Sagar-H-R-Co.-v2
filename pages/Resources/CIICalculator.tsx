
import React, { useState, useEffect } from 'react';
import { RotateCcw, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { useResourceData } from '../../hooks/useResourceData';
import Skeleton from '../../components/Skeleton';
import CustomDropdown from '../../components/forms/CustomDropdown';

interface CIIRow {
  fy: string;
  index: string;
}

const CIICalculator: React.FC = () => {
  const { data: ciiData, loading, error } = useResourceData<CIIRow[]>('cii-data.json');
  
  const [purchaseYear, setPurchaseYear] = useState('');
  const [saleYear, setSaleYear] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [result, setResult] = useState<{ indexedCost: number, gain: number } | null>(null);

  // Set default sale year to latest
  useEffect(() => {
    if (ciiData && ciiData.length > 0 && !saleYear) {
      setSaleYear(ciiData[0].fy);
    }
  }, [ciiData]);

  useEffect(() => {
    calculate();
  }, [purchaseYear, saleYear, cost]);

  const calculate = () => {
    if (!purchaseYear || !saleYear || !cost || !ciiData) {
      setResult(null);
      return;
    }

    const pIndex = Number(ciiData.find(d => d.fy === purchaseYear)?.index);
    const sIndex = Number(ciiData.find(d => d.fy === saleYear)?.index);

    if (pIndex && sIndex) {
      // Formula: (Cost * Sale Index) / Purchase Index
      const indexed = (Number(cost) * sIndex) / pIndex;
      setResult({
        indexedCost: Math.round(indexed),
        gain: Math.round(indexed - Number(cost))
      });
    }
  };

  const handleClear = () => {
    setCost('');
    setPurchaseYear('');
    if (ciiData) setSaleYear(ciiData[0].fy);
    setResult(null);
  };

  if (loading) {
    return (
        <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-brand-border h-96 flex flex-col items-center justify-center gap-4">
            <Skeleton variant="rectangular" width={60} height={60} className="rounded-full" />
            <Skeleton variant="text" width={200} height={30} />
        </div>
    );
  }

  if (error || !ciiData) return <div className="text-red-500">Failed to load CII Data</div>;

  const years = ciiData.map(d => d.fy); // Already sorted desc in JSON usually
  // Allow purchase year selection from all available years
  // Allow sale year only >= purchase year (handled in logic or UI validation)

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-dark">Capital Gains Indexation</h2>
          <p className="text-brand-stone mt-2 flex items-center gap-2">
            Calculate inflation-adjusted cost of acquisition.
            <div className="group relative">
                <Info size={14} className="cursor-help text-brand-moss" />
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-brand-dark text-white text-xs rounded-xl shadow-xl hidden group-hover:block z-50">
                    CII is used to calculate Long Term Capital Gains (LTCG). It adjusts the purchase price for inflation.
                </div>
            </div>
          </p>
        </div>
        <button 
          onClick={handleClear} 
          className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
            <div className="group">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 block">Purchase Cost</label>
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-stone/50 font-medium">₹</span>
                    <input 
                        type="number" 
                        value={cost} 
                        onChange={(e) => setCost(Number(e.target.value))} 
                        className="w-full pl-10 pr-6 py-4 bg-brand-bg border border-brand-border rounded-2xl text-lg font-heading font-bold text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder:text-brand-stone/30"
                        placeholder="Enter Purchase Price" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomDropdown
                    label="Purchase Year"
                    name="purchaseYear"
                    value={purchaseYear}
                    options={years}
                    onChange={(_, val) => setPurchaseYear(val)}
                    placeholder="Select Year"
                />
                <CustomDropdown
                    label="Sale Year"
                    name="saleYear"
                    value={saleYear}
                    options={years}
                    onChange={(_, val) => setSaleYear(val)}
                    placeholder="Select Year"
                />
            </div>

            {purchaseYear && saleYear && purchaseYear > saleYear && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} /> Sale year cannot be before purchase year.
                </div>
            )}
        </div>

        <div className="lg:col-span-5">
            <div className="bg-brand-dark text-white p-8 rounded-[2rem] h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-moss opacity-20 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10"></div>
                
                {result && !(purchaseYear > saleYear) ? (
                    <div className="relative z-10 space-y-8 animate-fade-in-up">
                        <div>
                            <span className="text-white/60 font-bold text-xs uppercase tracking-widest block mb-2">Indexed Cost</span>
                            <span className="text-4xl md:text-5xl font-mono font-bold text-[#4ADE80]">
                                ₹ {result.indexedCost.toLocaleString('en-IN')}
                            </span>
                        </div>
                        
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white/60 text-sm">Inflation Benefit</span>
                                <span className="text-white font-bold">₹ {result.gain.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-[10px] text-white/40 font-mono mt-4 p-3 bg-white/5 rounded-lg">
                                Formula: ({cost} × {ciiData.find(d => d.fy === saleYear)?.index}) / {ciiData.find(d => d.fy === purchaseYear)?.index}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 text-center relative z-10">
                        <TrendingUp size={48} className="mb-4 opacity-50" />
                        <p className="text-sm font-medium">Enter values to calculate<br/>indexed cost.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CIICalculator;
