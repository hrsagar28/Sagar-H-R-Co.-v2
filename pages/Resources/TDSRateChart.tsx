
import React, { useState } from 'react';
import { Search, Calendar, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { TDS_DUE_DATES_SUMMARY } from '../../constants';
import { useResourceData } from '../../hooks/useResourceData';
import Skeleton from '../../components/Skeleton';

type TabType = 'resident' | 'non-resident' | 'tcs';

interface RateItem {
  section: string;
  nature: string;
  threshold: string;
  rate: string;
}

interface TDSRatesData {
  resident: RateItem[];
  nonResident: RateItem[];
  tcs: RateItem[];
}

const TDSRateChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('resident');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: tdsData, loading, error } = useResourceData<TDSRatesData>('tds-rates.json');

  const filterRates = (rates: RateItem[] = []) => 
    rates.filter(item => 
      item.section.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.nature.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getCurrentData = () => {
    if (!tdsData) return [];
    switch (activeTab) {
      case 'resident': return filterRates(tdsData.resident);
      case 'non-resident': return filterRates(tdsData.nonResident);
      case 'tcs': return filterRates(tdsData.tcs);
      default: return [];
    }
  };

  const currentData = getCurrentData();

  const RateList = ({ data }: { data: RateItem[] }) => (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-brand-bg/80 text-brand-dark border-b border-brand-border">
            <tr>
              <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider w-[15%]">Section</th>
              <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider w-[45%]">Nature of Payment</th>
              <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider w-[25%]">Threshold (₹)</th>
              <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider w-[15%] text-right">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="py-4 px-6 font-bold text-brand-moss font-mono text-sm group-hover:text-brand-dark transition-colors">{item.section}</td>
                  <td className="py-4 px-6 text-sm font-medium text-brand-dark leading-relaxed">{item.nature}</td>
                  <td className="py-4 px-6 text-sm text-brand-stone font-medium">{item.threshold}</td>
                  <td className="py-4 px-6 text-sm font-bold text-brand-dark text-right">{item.rate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-brand-stone font-medium">
                  No rates found matching "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-moss opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start gap-4">
                <span className="px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-dark text-xs font-bold rounded-lg font-mono tracking-tight">
                  Sec {item.section}
                </span>
                <span className="text-lg font-bold text-brand-moss bg-brand-moss/5 px-3 py-1 rounded-lg border border-brand-moss/10">
                  {item.rate}
                </span>
              </div>
              
              <p className="text-brand-dark font-bold text-sm leading-relaxed pr-2">
                {item.nature}
              </p>
              
              <div className="pt-3 mt-1 border-t border-brand-border/50 flex justify-between items-center text-xs">
                <span className="text-brand-stone uppercase tracking-wider font-bold">Threshold</span>
                <span className="font-medium text-brand-dark bg-brand-bg px-2 py-1 rounded">{item.threshold}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-brand-stone font-medium bg-white rounded-2xl border border-brand-border">
             No rates found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-6 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-dark">TDS & TCS Rates</h2>
          <p className="text-brand-stone mt-2 font-medium">Comprehensive Rate Chart for FY 2025-26</p>
        </div>
        <div className="relative w-full lg:w-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone" />
          <input 
            type="text" 
            placeholder="Search Section or Nature..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:w-80 pl-11 pr-4 py-3 bg-brand-bg border border-brand-border rounded-2xl text-sm font-medium focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-brand-bg/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'resident', label: 'TDS (Resident)' },
          { id: 'non-resident', label: 'TDS (Non-Resident)' },
          { id: 'tcs', label: 'TCS Rates' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`
              px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-white text-brand-moss shadow-sm ring-1 ring-black/5' 
                : 'text-brand-stone hover:text-brand-dark hover:bg-white/50'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive Content Table/List */}
      {loading ? (
        <div className="space-y-4">
           {[1,2,3,4,5].map(i => (
             <Skeleton key={i} variant="rectangular" height={60} className="w-full rounded-xl" />
           ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600">
           <AlertCircle className="mx-auto mb-2" size={24} />
           <p>{error}</p>
        </div>
      ) : (
        <RateList data={currentData} />
      )}

      <p className="mt-6 text-[11px] text-brand-stone/70 text-right italic font-medium">
        * Rates listed are base rates. Surcharge and Health & Education Cess (4%) may apply depending on the deductee category and amount.
      </p>

      {/* Due Dates Summary Section */}
      <div className="mt-20 pt-12 border-t border-brand-border">
         <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-brand-moss/10 rounded-xl text-brand-moss">
               <Clock size={24} />
            </div>
            <div>
               <h3 className="text-xl font-heading font-bold text-brand-dark">Key Compliance Deadlines</h3>
               <p className="text-sm text-brand-stone font-medium">Return filing and payment schedule</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {TDS_DUE_DATES_SUMMARY.map((item, index) => (
               <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-white border border-brand-border hover:border-brand-moss/50 transition-all shadow-sm hover:shadow-md gap-4 group">
                  <div className="flex items-start gap-5">
                     <div className="hidden md:flex p-3 rounded-full bg-brand-bg text-brand-stone group-hover:text-brand-moss group-hover:bg-brand-moss/10 transition-colors shrink-0">
                        <AlertCircle size={20} />
                     </div>
                     <div>
                        <h4 className="text-base md:text-lg font-bold text-brand-dark group-hover:text-brand-moss transition-colors">{item.event}</h4>
                        <p className="text-sm text-brand-stone font-medium mt-1">{item.note}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/50">
                     <div className="text-right hidden md:block">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone block">Due Date</span>
                     </div>
                     <div className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-brand-bg text-brand-dark font-bold text-sm border border-brand-border flex items-center justify-center gap-2 group-hover:bg-brand-moss group-hover:text-white group-hover:border-brand-moss transition-all">
                        <Calendar size={16} />
                        {item.due}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default TDSRateChart;
