import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE_CALENDAR, CHECKLIST_DATA } from '../constants';
import { Download, ExternalLink, Calculator, Calendar, Search, Filter, ChevronDown, ChevronUp, FileText, Printer, Check, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'calendar' | 'checklist'>('calculator');

  // Calculator State
  const [income, setIncome] = useState<number>(0);
  const [ageGroup, setAgeGroup] = useState('below60');
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [deductions, setDeductions] = useState({ d80c: 0, d80d: 0, hra: 0, other: 0 });
  const [taxResult, setTaxResult] = useState<{ tax: number, cess: number, total: number } | null>(null);
  const [compareResult, setCompareResult] = useState<{ new: number, old: number } | null>(null);

  // Calendar State
  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Financial Resources",
    "description": "Tools, checklists, and calendars for financial compliance.",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "Income Tax Calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web"
      },
      {
        "@type": "Dataset",
        "name": "Compliance Calendar 2025"
      }
    ]
  };

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
      if (annualIncome <= 700000) return { tax: 0, cess: 0, total: 0 }; // Rebate u/s 87A (actually tax free up to 7L, effectively 12L now? stick to basics)
      // Note: Simplified logic based on provided context
      
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

  const badgeColors: Record<string, string> = {
    gst: 'bg-blue-100 text-blue-800 border-blue-200',
    it: 'bg-green-100 text-green-800 border-green-200',
    tds: 'bg-purple-100 text-purple-800 border-purple-200',
    roc: 'bg-orange-100 text-orange-800 border-orange-200',
    payroll: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  const categoryMap: Record<string, string> = { gst: 'GST', it: 'Income Tax', tds: 'TDS/TCS', roc: 'ROC', payroll: 'Payroll' };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Resources | Calculators, Calendar & Checklists"
        description="Essential financial tools for businesses and individuals. Income Tax Calculator, Compliance Calendar, and Downloadable Checklists."
        schema={schema}
      />
      
      {/* HERO SECTION - Hidden in Print */}
      <section className="pt-32 md:pt-48 pb-12 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60 print:hidden">
         <div className="container mx-auto max-w-7xl relative z-10">
            <div className="max-w-5xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                 <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                 Tools & Utilities
               </div>
               <h1 className="text-6xl md:text-8xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 Resource <br/>
                 <span className="font-serif italic font-normal text-brand-stone opacity-60">Hub.</span>
               </h1>
            </div>
         </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="py-12 px-4 md:px-6 print:py-0 print:px-0">
         <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
               
               {/* SIDEBAR TABS - Hidden in Print */}
               <div className="lg:col-span-1 print:hidden">
                  <div className="bg-brand-surface rounded-[2rem] border border-brand-border p-4 sticky top-32 shadow-sm">
                     <nav className="flex flex-col gap-2">
                        <button 
                           onClick={() => setActiveTab('calculator')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'calculator' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <Calculator size={20} /> Tax Calculator
                        </button>
                        <button 
                           onClick={() => setActiveTab('calendar')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'calendar' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <Calendar size={20} /> Compliance Calendar
                        </button>
                        <button 
                           onClick={() => setActiveTab('checklist')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'checklist' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <FileText size={20} /> Checklists
                        </button>
                     </nav>
                  </div>
               </div>

               {/* CONTENT PANEL - Full Width in Print */}
               <div className="lg:col-span-3 print:w-full">
                  
                  {/* CALCULATOR TAB */}
                  {activeTab === 'calculator' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:border-0 print:shadow-none print:p-0 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-8 print:mb-4">
                           <div>
                              <h2 className="text-3xl font-heading font-bold text-brand-dark">Income Tax Calculator</h2>
                              <p className="text-brand-stone mt-2">FY 2024-25 (AY 2025-26)</p>
                           </div>
                           <button onClick={handlePrint} className="p-3 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors print:hidden">
                              <Printer size={20} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 print:grid-cols-2 print:gap-4 print:mb-6">
                           <div className="space-y-6">
                              <div>
                                 <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2">Annual Income (₹)</label>
                                 <input 
                                    type="number" 
                                    value={income || ''} 
                                    onChange={(e) => setIncome(Number(e.target.value))}
                                    className="w-full p-4 bg-brand-bg border border-brand-border rounded-xl font-mono text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss print:bg-white print:border-gray-300"
                                    placeholder="e.g. 1200000"
                                 />
                              </div>
                              
                              <div>
                                 <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2">Tax Regime</label>
                                 <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border print:bg-white print:border-gray-300">
                                    <button 
                                       onClick={() => setRegime('new')}
                                       className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'new' ? 'bg-brand-surface shadow-sm text-brand-moss' : 'text-brand-stone'}`}
                                    >
                                       New Regime
                                    </button>
                                    <button 
                                       onClick={() => setRegime('old')}
                                       className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'old' ? 'bg-brand-surface shadow-sm text-brand-moss' : 'text-brand-stone'}`}
                                    >
                                       Old Regime
                                    </button>
                                 </div>
                              </div>

                              {regime === 'old' && (
                                 <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2">Age Group</label>
                                    <select 
                                       value={ageGroup}
                                       onChange={(e) => setAgeGroup(e.target.value)}
                                       className="w-full p-4 bg-brand-bg border border-brand-border rounded-xl text-brand-dark focus:outline-none focus:border-brand-moss print:bg-white print:border-gray-300"
                                    >
                                       <option value="below60">Below 60 Years</option>
                                       <option value="60to80">60 - 80 Years (Senior)</option>
                                       <option value="above80">Above 80 Years (Super Senior)</option>
                                    </select>
                                 </div>
                              )}
                           </div>

                           <div className="space-y-6">
                              <div className={`transition-opacity duration-300 ${regime === 'new' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                                 <h3 className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2">Deductions (Old Regime Only)</h3>
                                 <div className="space-y-4">
                                    <div>
                                       <label className="block text-xs font-bold text-brand-stone mb-1">Sec 80C (Max 1.5L)</label>
                                       <input type="number" value={deductions.d80c || ''} onChange={(e) => setDeductions({...deductions, d80c: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg text-sm print:bg-white print:border-gray-300" placeholder="PPF, LIC, etc." />
                                    </div>
                                    <div>
                                       <label className="block text-xs font-bold text-brand-stone mb-1">Sec 80D (Medical)</label>
                                       <input type="number" value={deductions.d80d || ''} onChange={(e) => setDeductions({...deductions, d80d: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg text-sm print:bg-white print:border-gray-300" placeholder="Insurance Premium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <label className="block text-xs font-bold text-brand-stone mb-1">HRA / Home Loan</label>
                                          <input type="number" value={deductions.hra || ''} onChange={(e) => setDeductions({...deductions, hra: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg text-sm print:bg-white print:border-gray-300" />
                                       </div>
                                       <div>
                                          <label className="block text-xs font-bold text-brand-stone mb-1">Other Deductions</label>
                                          <input type="number" value={deductions.other || ''} onChange={(e) => setDeductions({...deductions, other: Number(e.target.value)})} className="w-full p-3 bg-brand-bg border border-brand-border rounded-lg text-sm print:bg-white print:border-gray-300" />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-4 mb-10 print:hidden">
                           <button onClick={handleCalculate} className="flex-1 py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-moss transition-colors shadow-lg">Calculate Tax</button>
                           <button onClick={handleCompare} className="flex-1 py-4 bg-white border border-brand-border text-brand-dark rounded-xl font-bold hover:bg-brand-bg transition-colors">Compare Regimes</button>
                        </div>

                        {/* RESULTS SECTION */}
                        {taxResult && (
                           <div className="bg-brand-mossLight border border-brand-moss/20 rounded-2xl p-8 print:border-black print:bg-white print:border-2">
                              <h3 className="text-xl font-heading font-bold text-brand-moss mb-6 pb-4 border-b border-brand-moss/10 print:text-black print:border-black">Tax Calculation Summary</h3>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center text-lg">
                                    <span className="text-brand-stone font-medium print:text-black">Gross Income</span>
                                    <span className="font-bold text-brand-dark">₹ {income.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-lg">
                                    <span className="text-brand-stone font-medium print:text-black">Tax Payable</span>
                                    <span className="font-bold text-brand-dark">₹ {taxResult.tax.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-lg">
                                    <span className="text-brand-stone font-medium print:text-black">Health & Education Cess (4%)</span>
                                    <span className="font-bold text-brand-dark">₹ {taxResult.cess.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="pt-4 mt-4 border-t-2 border-dashed border-brand-moss/20 flex justify-between items-center text-xl print:border-black">
                                    <span className="font-bold text-brand-moss print:text-black">Total Tax Liability</span>
                                    <span className="font-bold text-brand-moss text-2xl print:text-black">₹ {taxResult.total.toLocaleString('en-IN')}</span>
                                 </div>
                              </div>
                              <div className="mt-6 text-xs text-center text-brand-stone print:text-black">
                                 Generated by Sagar H R & Co. Tax Calculator • Note: This is an estimate. Please consult a professional for exact filing.
                              </div>
                           </div>
                        )}

                        {compareResult && (
                           <div className="grid grid-cols-2 gap-6 print:gap-4">
                              <div className={`p-6 rounded-2xl border-2 text-center ${compareResult.new < compareResult.old ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'} print:bg-white print:border-black`}>
                                 <h4 className="font-bold text-brand-dark mb-2">New Regime Tax</h4>
                                 <div className="text-2xl font-bold text-brand-moss">₹ {compareResult.new.toLocaleString('en-IN')}</div>
                                 {compareResult.new < compareResult.old && <div className="mt-2 inline-block px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full print:border print:border-black">Recommended</div>}
                              </div>
                              <div className={`p-6 rounded-2xl border-2 text-center ${compareResult.old < compareResult.new ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'} print:bg-white print:border-black`}>
                                 <h4 className="font-bold text-brand-dark mb-2">Old Regime Tax</h4>
                                 <div className="text-2xl font-bold text-brand-moss">₹ {compareResult.old.toLocaleString('en-IN')}</div>
                                 {compareResult.old < compareResult.new && <div className="mt-2 inline-block px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full print:border print:border-black">Recommended</div>}
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* CALENDAR TAB */}
                  {activeTab === 'calendar' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                           <div>
                              <h2 className="text-3xl font-heading font-bold text-brand-dark">Compliance Calendar</h2>
                              <p className="text-brand-stone mt-1">Key Due Dates for 2025-26</p>
                           </div>
                           <div className="flex gap-2 print:hidden">
                              <div className="relative">
                                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-stone" />
                                 <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={calSearch}
                                    onChange={(e) => setCalSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm focus:outline-none focus:border-brand-moss"
                                 />
                              </div>
                              <button onClick={handlePrint} className="p-2 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors">
                                 <Printer size={20} />
                              </button>
                           </div>
                        </div>

                        <div className="space-y-8">
                           {Object.entries(COMPLIANCE_CALENDAR).map(([month, events], idx) => {
                              const filteredEvents = events.filter(e => 
                                 (calFilter === 'all' || e.cat === calFilter) && 
                                 (e.desc.toLowerCase().includes(calSearch.toLowerCase()))
                              );

                              if (filteredEvents.length === 0) return null;

                              return (
                                 <div key={idx} className="break-inside-avoid">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 sticky top-0 bg-brand-surface py-2 border-b border-brand-border/50 print:static print:bg-white print:border-black">{month}</h3>
                                    <div className="grid gap-3">
                                       {filteredEvents.map((event, i) => (
                                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-brand-bg border border-brand-border/50 hover:border-brand-moss/30 transition-colors print:bg-white print:border-gray-200">
                                             <div className="w-12 h-12 flex flex-col items-center justify-center bg-white rounded-lg border border-brand-border shadow-sm shrink-0 print:border-black">
                                                <span className="text-xs font-bold text-brand-moss uppercase leading-none print:text-black">{month.slice(0,3)}</span>
                                                <span className="text-lg font-bold text-brand-dark leading-none mt-1">{event.day}</span>
                                             </div>
                                             <div className="flex-grow">
                                                <div className="font-bold text-brand-dark">{event.desc}</div>
                                                <div className="text-xs text-brand-stone font-medium mt-1">{categoryMap[event.cat]}</div>
                                             </div>
                                             <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColors[event.cat]} print:border-black print:text-black print:bg-white`}>
                                                {event.cat}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* CHECKLISTS TAB */}
                  {activeTab === 'checklist' && (
                     <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
                        <div className="mb-8">
                           <h2 className="text-3xl font-heading font-bold text-brand-dark">Document Checklists</h2>
                           <p className="text-brand-stone mt-2">Download or print requirements for various services.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Object.entries(CHECKLIST_DATA).map(([key, data]) => (
                              <Link to={`/resources/checklist/${key}`} key={key} className="group p-6 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-moss hover:shadow-lg transition-all flex justify-between items-center print:border-gray-300 print:bg-white">
                                 <div>
                                    <h3 className="font-bold text-brand-dark group-hover:text-brand-moss transition-colors">{data.title}</h3>
                                    <p className="text-xs text-brand-stone mt-1 line-clamp-1">{data.subtitle}</p>
                                 </div>
                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-stone group-hover:bg-brand-moss group-hover:text-white transition-all print:hidden">
                                    <ArrowRight size={18} />
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Resources;