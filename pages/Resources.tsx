import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IMPORTANT_LINKS, COMPLIANCE_CALENDAR, CHECKLIST_DATA } from '../constants';
import { Download, ExternalLink, Calculator, Calendar, Search, Filter, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const Resources: React.FC = () => {
  const [income, setIncome] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState('below60');
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [deductions, setDeductions] = useState({ d80c: 0, d80d: 0, hra: 0, other: 0 });
  const [taxResult, setTaxResult] = useState<{ tax: number, cess: number, total: number } | null>(null);
  const [compareResult, setCompareResult] = useState<{ new: number, old: number } | null>(null);

  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');

  // --- Calculator Logic ---
  const calculateTax = (annualIncome: number, age: string, reg: 'new' | 'old', deds: any) => {
    let tax = 0;
    const standardDeduction = reg === 'new' ? 75000 : 50000; // Updated for FY 24-25 (New Regime 75k)
    
    let totalDeductions = standardDeduction;
    if (reg === 'old') {
      totalDeductions += Math.min(deds.d80c || 0, 150000) + (deds.d80d || 0) + (deds.hra || 0) + (deds.other || 0);
    }

    let taxableIncome = Math.max(0, annualIncome - totalDeductions);

    if (reg === 'new') {
      // New Regime Slabs FY 24-25
      if (annualIncome <= 700000) return { tax: 0, cess: 0, total: 0 }; // Rebate u/s 87A
      
      if (taxableIncome > 300000) tax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
      if (taxableIncome > 700000) tax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
      if (taxableIncome > 1000000) tax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
      if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
      if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
      
    } else {
      // Old Regime Slabs
      if (taxableIncome <= 500000) return { tax: 0, cess: 0, total: 0 }; // Rebate u/s 87A

      let exemption = age === 'below60' ? 250000 : age === '60to80' ? 300000 : 500000;
      
      if (taxableIncome > exemption) tax += (Math.min(taxableIncome, 500000) - exemption) * 0.05;
      if (taxableIncome > 500000) tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20;
      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    }

    const cess = tax * 0.04;
    return { tax, cess, total: tax + cess };
  };

  const handleCalculate = () => {
    const res = calculateTax(income, ageGroup, regime, deductions);
    setTaxResult(res);
    setCompareResult(null);
  };

  const handleCompare = () => {
    const newReg = calculateTax(income, ageGroup, 'new', deductions);
    const oldReg = calculateTax(income, ageGroup, 'old', deductions);
    setCompareResult({ new: newReg.total, old: oldReg.total });
    setTaxResult(null);
  };

  // --- Calendar Logic ---
  const categoryMap: Record<string, string> = { gst: 'GST', it: 'Income Tax', tds: 'TDS/TCS', roc: 'ROC', payroll: 'Payroll' };
  const badgeColors: Record<string, string> = {
    gst: 'bg-blue-100 text-blue-800',
    it: 'bg-red-100 text-red-800',
    tds: 'bg-green-100 text-green-800',
    roc: 'bg-purple-100 text-purple-800',
    payroll: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                Client Tools
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Resource <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">Hub.</span>
              </h1>
              <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 Essential tools, official links, and compliance calendars to keep your business ahead of the curve.
              </p>
           </div>
        </div>
      </section>

      <div className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN - Sticky Navigation & Links */}
            <div className="lg:col-span-4 space-y-12">
              <div className="sticky top-32 space-y-12">
                
                {/* Important Links */}
                <div className="bg-brand-surface p-8 rounded-[2rem] border border-brand-border shadow-sm">
                  <h3 className="text-2xl font-heading font-bold text-brand-dark mb-6 flex items-center gap-2">
                    <ExternalLink size={24} className="text-brand-moss"/> Important Links
                  </h3>
                  <div className="space-y-8">
                    {IMPORTANT_LINKS.map((group, idx) => (
                      <div key={idx}>
                        <h4 className="text-xs font-bold text-brand-stone uppercase tracking-widest mb-4">{group.category}</h4>
                        <ul className="space-y-3">
                          {group.links.map((link, lIdx) => (
                            <li key={lIdx}>
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between group p-3 rounded-xl hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-border/50"
                              >
                                <span className="text-brand-dark font-bold group-hover:text-brand-moss transition-colors text-sm">{link.name}</span>
                                <ArrowUpRightLink />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Checklists */}
                <div className="bg-brand-dark p-8 rounded-[2rem] text-brand-surface relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-moss opacity-20 rounded-full blur-[50px]"></div>
                  <h3 className="text-2xl font-heading font-bold mb-6 relative z-10 flex items-center gap-2">
                     <FileText size={24} /> Checklists
                  </h3>
                  <div className="space-y-2 relative z-10">
                    {Object.entries(CHECKLIST_DATA).map(([key, data]) => (
                      <Link 
                        key={key} 
                        to={`/resources/checklist/${key}`}
                        className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{data.title}</span>
                          <Download size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN - Tools */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Tax Calculator */}
              <div id="calculator" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-lg relative overflow-hidden">
                 <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border text-brand-moss">
                          <Calculator size={32} />
                       </div>
                       <div>
                          <h2 className="text-3xl font-heading font-bold text-brand-dark">Tax Calculator</h2>
                          <p className="text-brand-stone font-medium">FY 2024-25 (AY 2025-26)</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div>
                          <label htmlFor="income-input" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-2 ml-1">Annual Income</label>
                          <input 
                            id="income-input"
                            type="number" 
                            value={income || ''} 
                            onChange={(e) => setIncome(parseFloat(e.target.value))}
                            placeholder="₹ 10,0,000"
                            className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all"
                          />
                       </div>
                       <div>
                          <label htmlFor="age-select" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-2 ml-1">Age Group</label>
                          <select 
                            id="age-select"
                            value={ageGroup}
                            onChange={(e) => setAgeGroup(e.target.value)}
                            className="w-full p-4 bg-brand-bg border border-brand-border rounded-2xl font-bold text-brand-dark focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all appearance-none"
                          >
                             <option value="below60">Below 60 Years</option>
                             <option value="60to80">60 - 80 Years</option>
                             <option value="above80">Above 80 Years</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex gap-2 bg-brand-bg p-1 rounded-full w-fit mb-8 border border-brand-border">
                       <button 
                         onClick={() => setRegime('new')}
                         className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${regime === 'new' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:text-brand-dark'}`}
                       >
                          New Regime
                       </button>
                       <button 
                         onClick={() => setRegime('old')}
                         className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${regime === 'old' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:text-brand-dark'}`}
                       >
                          Old Regime
                       </button>
                    </div>

                    {regime === 'old' && (
                       <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-border mb-8 animate-fade-in-up">
                          <h4 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-widest">Deductions</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="80c-input" className="block text-xs font-bold text-brand-stone mb-1">80C</label>
                                <input id="80c-input" type="number" placeholder="Max 1.5L" className="w-full p-2 rounded-lg border border-brand-border text-sm" onChange={(e) => setDeductions({...deductions, d80c: parseFloat(e.target.value)})} />
                             </div>
                             <div>
                                <label htmlFor="80d-input" className="block text-xs font-bold text-brand-stone mb-1">80D (Medical)</label>
                                <input id="80d-input" type="number" placeholder="Amount" className="w-full p-2 rounded-lg border border-brand-border text-sm" onChange={(e) => setDeductions({...deductions, d80d: parseFloat(e.target.value)})} />
                             </div>
                             <div>
                                <label htmlFor="hra-input" className="block text-xs font-bold text-brand-stone mb-1">HRA</label>
                                <input id="hra-input" type="number" placeholder="Exempt Amount" className="w-full p-2 rounded-lg border border-brand-border text-sm" onChange={(e) => setDeductions({...deductions, hra: parseFloat(e.target.value)})} />
                             </div>
                             <div>
                                <label htmlFor="other-input" className="block text-xs font-bold text-brand-stone mb-1">Other</label>
                                <input id="other-input" type="number" placeholder="Amount" className="w-full p-2 rounded-lg border border-brand-border text-sm" onChange={(e) => setDeductions({...deductions, other: parseFloat(e.target.value)})} />
                             </div>
                          </div>
                       </div>
                    )}

                    <div className="flex gap-4 mb-8">
                       <button onClick={handleCalculate} className="flex-1 py-4 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-moss transition-all shadow-lg">Calculate Tax</button>
                       <button onClick={handleCompare} className="flex-1 py-4 bg-brand-surface border-2 border-brand-dark text-brand-dark font-bold rounded-xl hover:bg-brand-bg transition-all">Compare Regimes</button>
                    </div>

                    {/* Results */}
                    <div aria-live="polite">
                      {taxResult && (
                        <div className="bg-brand-mossLight p-6 rounded-2xl border border-brand-moss/20 animate-scale-in">
                          <div className="flex justify-between items-end mb-2">
                              <span className="text-brand-moss font-bold uppercase tracking-widest text-sm">Total Tax Payable</span>
                              <span className="text-4xl font-heading font-bold text-brand-dark">₹ {taxResult.total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="h-[1px] w-full bg-brand-moss/20 my-4"></div>
                          <div className="flex justify-between text-sm text-brand-stone font-medium">
                              <span>Income Tax: ₹ {taxResult.tax.toLocaleString()}</span>
                              <span>Cess (4%): ₹ {taxResult.cess.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {compareResult && (
                        <div className="grid grid-cols-2 gap-4 animate-scale-in">
                          <div className={`p-6 rounded-2xl border ${compareResult.new < compareResult.old ? 'bg-green-50 border-green-200' : 'bg-brand-bg border-brand-border'}`}>
                              <span className="block text-xs font-bold uppercase tracking-widest mb-2">New Regime</span>
                              <span className="text-2xl font-heading font-bold text-brand-dark">₹ {compareResult.new.toLocaleString('en-IN')}</span>
                          </div>
                          <div className={`p-6 rounded-2xl border ${compareResult.old < compareResult.new ? 'bg-green-50 border-green-200' : 'bg-brand-bg border-brand-border'}`}>
                              <span className="block text-xs font-bold uppercase tracking-widest mb-2">Old Regime</span>
                              <span className="text-2xl font-heading font-bold text-brand-dark">₹ {compareResult.old.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="col-span-2 text-center text-sm font-bold text-brand-dark bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                              {compareResult.new < compareResult.old 
                                ? `You save ₹ ${(compareResult.old - compareResult.new).toLocaleString()} with New Regime` 
                                : `You save ₹ ${(compareResult.new - compareResult.old).toLocaleString()} with Old Regime`
                              }
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
              </div>

              {/* Compliance Calendar */}
              <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-lg">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border text-brand-moss">
                          <Calendar size={32} />
                       </div>
                       <div>
                          <h2 className="text-3xl font-heading font-bold text-brand-dark">Compliance Calendar</h2>
                          <p className="text-brand-stone font-medium">Upcoming Due Dates</p>
                       </div>
                    </div>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone w-4 h-4" />
                       <input 
                         type="text" 
                         aria-label="Search calendar"
                         placeholder="Search..." 
                         value={calSearch}
                         onChange={(e) => setCalSearch(e.target.value)}
                         className="pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-full text-sm font-bold text-brand-dark focus:outline-none focus:border-brand-moss w-full md:w-64"
                       />
                    </div>
                 </div>

                 {/* Filters */}
                 <div className="flex flex-wrap gap-2 mb-8">
                    {['all', ...Object.keys(categoryMap)].map((cat) => (
                       <button 
                         key={cat}
                         onClick={() => setCalFilter(cat)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${calFilter === cat ? 'bg-brand-dark text-white border-brand-dark' : 'bg-brand-surface border-brand-border text-brand-stone hover:border-brand-dark'}`}
                       >
                          {cat === 'all' ? 'All' : categoryMap[cat]}
                       </button>
                    ))}
                 </div>

                 {/* Timeline */}
                 <div className="space-y-6 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                    {Object.entries(COMPLIANCE_CALENDAR).map(([month, events]) => {
                       const filteredEvents = events.filter(e => 
                          (calFilter === 'all' || e.cat === calFilter) && 
                          e.desc.toLowerCase().includes(calSearch.toLowerCase())
                       );

                       if (filteredEvents.length === 0) return null;

                       return (
                          <div key={month} className="relative pl-8 border-l-2 border-brand-border/50 pb-8 last:pb-0 last:border-0">
                             <div className="absolute -left-[9px] top-0 w-4 h-4 bg-brand-moss rounded-full ring-4 ring-brand-surface"></div>
                             <h3 className="text-xl font-heading font-bold text-brand-dark mb-4">{month}</h3>
                             <div className="space-y-3">
                                {filteredEvents.sort((a,b) => a.day - b.day).map((event, idx) => (
                                   <div key={idx} className="flex items-center gap-4 p-4 bg-brand-bg rounded-2xl border border-brand-border hover:border-brand-moss transition-colors">
                                      <div className="text-center shrink-0 bg-brand-surface w-14 h-14 rounded-xl flex flex-col justify-center items-center border border-brand-border shadow-sm">
                                         <span className="text-xl font-bold text-brand-dark leading-none">{event.day}</span>
                                      </div>
                                      <div className="grow">
                                         <p className="text-brand-dark font-bold text-sm md:text-base">{event.desc}</p>
                                         <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${badgeColors[event.cat]}`}>
                                            {categoryMap[event.cat]}
                                         </span>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowUpRightLink = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-stone group-hover:text-brand-moss transition-colors">
    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Resources;