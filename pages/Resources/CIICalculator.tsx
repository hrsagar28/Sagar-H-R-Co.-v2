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
  const [result, setResult] = useState<{ indexedCost: number; gain: number } | null>(null);

  // Set default sale year to latest
  useEffect(() => {
    if (ciiData && ciiData.length > 0 && !saleYear) {
      setSaleYear(ciiData[0]?.fy || '');
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

    const pIndex = Number(ciiData.find((d) => d.fy === purchaseYear)?.index);
    const sIndex = Number(ciiData.find((d) => d.fy === saleYear)?.index);

    if (pIndex && sIndex) {
      // Formula: (Cost * Sale Index) / Purchase Index
      const indexed = (Number(cost) * sIndex) / pIndex;
      setResult({
        indexedCost: Math.round(indexed),
        gain: Math.round(indexed - Number(cost)),
      });
    }
  };

  const handleClear = () => {
    setCost('');
    setPurchaseYear('');
    if (ciiData) setSaleYear(ciiData[0]?.fy || '');
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-brand-border bg-brand-surface p-8">
        <Skeleton variant="rectangular" width={60} height={60} className="rounded-full" />
        <Skeleton variant="text" width={200} height={30} />
      </div>
    );
  }

  if (error || !ciiData) return <div className="text-red-500">Failed to load CII Data</div>;

  const years = ciiData.map((d) => d.fy); // Already sorted desc in JSON usually
  // Allow purchase year selection from all available years
  // Allow sale year only >= purchase year (handled in logic or UI validation)

  return (
    <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold text-brand-dark">Capital Gains Indexation</h2>
          <p className="mt-2 flex items-center gap-2 text-brand-stone">
            Calculate inflation-adjusted cost of acquisition.
            <div className="group relative">
              <Info size={14} className="cursor-help text-brand-moss" />
              <div className="absolute bottom-full left-0 z-50 mb-2 hidden w-64 rounded-xl bg-brand-dark p-3 text-xs text-white shadow-xl group-hover:block">
                CII is used to calculate Long Term Capital Gains (LTCG). It adjusts the purchase price for inflation.
              </div>
            </div>
          </p>
        </div>
        <button
          onClick={handleClear}
          className="rounded-full bg-brand-bg p-3 text-brand-dark transition-colors hover:bg-red-50 hover:text-red-600"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <div className="group">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-dark">
              Purchase Cost
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-medium text-brand-stone/50">₹</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-bg py-4 pl-10 pr-6 font-heading text-lg font-bold text-brand-dark transition-[border-color,box-shadow] placeholder:text-brand-stone/30 focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss"
                placeholder="Enter Purchase Price"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
              <AlertCircle size={16} /> Sale year cannot be before purchase year.
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-brand-dark p-8 text-white shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-brand-moss opacity-20 blur-[60px]"></div>

            {result && !(purchaseYear > saleYear) ? (
              <div className="relative z-10 animate-fade-in-up space-y-8">
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/60">
                    Indexed Cost
                  </span>
                  <span className="font-mono text-4xl font-bold text-brand-accent md:text-5xl">
                    ₹ {result.indexedCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white/60">Inflation Benefit</span>
                    <span className="font-bold text-white">₹ {result.gain.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mt-4 rounded-lg bg-white/5 p-3 font-mono text-[10px] text-white/40">
                    Formula: ({cost} × {ciiData.find((d) => d.fy === saleYear)?.index}) /{' '}
                    {ciiData.find((d) => d.fy === purchaseYear)?.index}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white/30">
                <TrendingUp size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">
                  Enter values to calculate
                  <br />
                  indexed cost.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CIICalculator;
