
import React from 'react';
import { useResourceData } from '../../hooks/useResourceData';
import Skeleton from '../../components/Skeleton';
import { AlertCircle } from 'lucide-react';

interface CIIRow {
  fy: string;
  index: string;
}

const CIITable: React.FC = () => {
  const { data: ciiData, loading, error } = useResourceData<CIIRow[]>('cii-data.json');

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-brand-dark">Cost Inflation Index</h2>
        <p className="text-brand-stone mt-1">For Long Term Capital Gains Calculation</p>
      </div>

      {loading ? (
        <div className="space-y-4">
           <Skeleton variant="rectangular" height={40} className="w-full rounded-lg" />
           {[1, 2, 3, 4, 5].map(i => (
             <Skeleton key={i} variant="rectangular" height={50} className="w-full rounded-md" />
           ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600">
           <AlertCircle className="mx-auto mb-2" size={24} />
           <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-border">
          <table className="w-full text-left">
            <thead className="bg-brand-bg">
              <tr>
                <th className="py-4 px-8 text-sm font-bold uppercase tracking-widest text-brand-dark">Financial Year</th>
                <th className="py-4 px-8 text-sm font-bold uppercase tracking-widest text-brand-dark text-right">CII Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {ciiData && ciiData.map((row, idx) => (
                <tr key={idx} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="py-4 px-8 font-medium text-brand-stone">{row.fy}</td>
                  <td className="py-4 px-8 font-bold text-brand-moss text-right font-mono text-lg">{row.index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-[10px] text-brand-stone text-center">
        * Base Year 2001-02 = 100.
      </p>
    </div>
  );
};

export default CIITable;
