
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { TDS_RATES } from '../../constants';

const TDSRateChart: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRates = TDS_RATES.filter(item => 
    item.section.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-brand-dark">TDS Rates</h2>
          <p className="text-brand-stone mt-1">Quick Reference for FY 2025-26</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone" />
          <input 
            type="text" 
            placeholder="Search Section or Nature..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-full text-sm focus:outline-none focus:border-brand-moss transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone">Section</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone w-1/2">Nature of Payment</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone">Threshold (₹)</th>
              <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {filteredRates.length > 0 ? (
              filteredRates.map((rate, idx) => (
                <tr key={idx} className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors group">
                  <td className="py-4 px-4 font-bold text-brand-moss group-hover:text-brand-dark">{rate.section}</td>
                  <td className="py-4 px-4 font-medium text-brand-dark">{rate.nature}</td>
                  <td className="py-4 px-4 text-brand-stone text-sm">{rate.threshold}</td>
                  <td className="py-4 px-4 font-bold text-brand-dark text-right">{rate.rate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-brand-stone font-medium">No rates found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-[10px] text-brand-stone text-center md:text-right">
        * Rates listed are basic rates. Surcharge and cess may apply where applicable.
      </p>
    </div>
  );
};

export default TDSRateChart;
