import React, { useState } from 'react';
import { Search, Calendar, FileText, Clock, AlertCircle, Copy, Check } from 'lucide-react';
import { TDS_DUE_DATES_SUMMARY } from '../../constants';
import { useResourceData } from '../../hooks/useResourceData';
import { useToast } from '../../hooks/useToast';
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
  const { addToast } = useToast();

  const { data: tdsData, loading, error } = useResourceData<TDSRatesData>('tds-rates.json');

  const filterRates = (rates: RateItem[] = []) =>
    rates.filter(
      (item) =>
        item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nature.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const getCurrentData = () => {
    if (!tdsData) return [];
    switch (activeTab) {
      case 'resident':
        return filterRates(tdsData.resident);
      case 'non-resident':
        return filterRates(tdsData.nonResident);
      case 'tcs':
        return filterRates(tdsData.tcs);
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  const handleCopyRow = (item: RateItem) => {
    const text = `Sec ${item.section}: ${item.nature}\nThreshold: ${item.threshold} | Rate: ${item.rate}`;
    navigator.clipboard.writeText(text);
    addToast(`Copied rate for Sec ${item.section}`, 'success');
  };

  const RateList = ({ data }: { data: RateItem[] }) => (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm md:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-brand-border bg-brand-bg/80 text-brand-dark">
            <tr>
              <th className="w-[12%] px-6 py-5 text-xs font-bold uppercase tracking-wider">Section</th>
              <th className="w-[43%] px-6 py-5 text-xs font-bold uppercase tracking-wider">Nature of Payment</th>
              <th className="w-[25%] px-6 py-5 text-xs font-bold uppercase tracking-wider">Threshold (₹)</th>
              <th className="w-[15%] px-6 py-5 text-right text-xs font-bold uppercase tracking-wider">Rate</th>
              <th className="w-[5%] px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className="group transition-colors hover:bg-brand-bg/30">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-brand-moss transition-colors group-hover:text-brand-dark">
                    {item.section}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium leading-relaxed text-brand-dark">{item.nature}</td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-stone">{item.threshold}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-brand-dark">{item.rate}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleCopyRow(item)}
                      className="rounded-lg p-2 text-brand-stone opacity-0 transition-colors hover:bg-brand-moss hover:text-white group-hover:opacity-100"
                      title="Copy details"
                    >
                      <Copy size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center font-medium text-brand-stone">
                  No rates found matching "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-sm"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-brand-moss opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div className="flex items-start justify-between gap-4">
                <span className="rounded-lg border border-brand-border bg-brand-bg px-3 py-1.5 font-mono text-xs font-bold tracking-tight text-brand-dark">
                  Sec {item.section}
                </span>
                <div className="flex gap-2">
                  <span className="rounded-lg border border-brand-moss/10 bg-brand-moss/5 px-3 py-1 text-lg font-bold text-brand-moss">
                    {item.rate}
                  </span>
                  <button
                    onClick={() => handleCopyRow(item)}
                    className="rounded-lg bg-brand-bg p-2 text-brand-stone transition-colors hover:bg-brand-moss hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <p className="pr-2 text-sm font-bold leading-relaxed text-brand-dark">{item.nature}</p>

              <div className="mt-1 flex items-center justify-between border-t border-brand-border/50 pt-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-brand-stone">Threshold</span>
                <span className="rounded bg-brand-bg px-2 py-1 font-medium text-brand-dark">{item.threshold}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-brand-border bg-white py-12 text-center font-medium text-brand-stone">
            No rates found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-6 shadow-sm md:p-12">
      {/* Header & Search */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-heading text-3xl font-bold text-brand-dark">TDS & TCS Rates</h2>
          <p className="mt-2 font-medium text-brand-stone">Comprehensive Rate Chart for FY 2025-26</p>
        </div>
        <div className="relative w-full lg:w-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone" />
          <input
            type="text"
            placeholder="Search Section or Nature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-brand-border bg-brand-bg py-3 pl-11 pr-4 text-sm font-medium transition-[border-color,box-shadow] focus:border-brand-moss focus:outline-none focus:ring-1 focus:ring-brand-moss lg:w-80"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex w-fit flex-wrap gap-2 rounded-2xl bg-brand-bg/50 p-1.5">
        {[
          { id: 'resident', label: 'TDS (Resident)' },
          { id: 'non-resident', label: 'TDS (Non-Resident)' },
          { id: 'tcs', label: 'TCS Rates' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`rounded-xl px-6 py-3 text-sm font-bold transition-[background-color,color,box-shadow] duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-brand-moss shadow-sm ring-1 ring-black/5'
                : 'text-brand-stone hover:bg-white/50 hover:text-brand-dark'
            } `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive Content Table/List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} className="w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <RateList data={currentData} />
      )}

      <p className="mt-6 text-right text-[11px] font-medium italic text-brand-stone">
        * Rates listed are base rates. Surcharge and Health & Education Cess (4%) may apply depending on the deductee
        category and amount.
      </p>

      {/* Due Dates Summary Section */}
      <div className="mt-20 border-t border-brand-border pt-12">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-brand-moss/10 p-3 text-brand-moss">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-brand-dark">Key Compliance Deadlines</h3>
            <p className="text-sm font-medium text-brand-stone">Return filing and payment schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {TDS_DUE_DATES_SUMMARY.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between gap-4 rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-[border-color,box-shadow] hover:border-brand-moss/50 hover:shadow-md md:flex-row md:items-center"
            >
              <div className="flex items-start gap-5">
                <div className="hidden shrink-0 rounded-full bg-brand-bg p-3 text-brand-stone transition-colors group-hover:bg-brand-moss/10 group-hover:text-brand-moss md:flex">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-brand-dark transition-colors group-hover:text-brand-moss md:text-lg">
                    {item.event}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-brand-stone">{item.note}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-brand-border/50 pt-2 md:border-t-0 md:pl-0 md:pt-0">
                <div className="hidden text-right md:block">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-stone">
                    Due Date
                  </span>
                </div>
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-bg px-4 py-2.5 text-sm font-bold text-brand-dark transition-[border-color,background-color,color] group-hover:border-brand-moss group-hover:bg-brand-moss group-hover:text-white md:w-auto">
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
