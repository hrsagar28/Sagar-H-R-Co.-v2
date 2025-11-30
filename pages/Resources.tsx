import React, { useState } from 'react';
import { Calculator, Calendar, FileText, Globe } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { CONTACT_INFO } from '../constants';
import TaxCalculator from '../components/TaxCalculator';
import ComplianceCalendar from './Resources/ComplianceCalendar';
import ChecklistGrid from './Resources/ChecklistGrid';
import ImportantLinksGrid from './Resources/ImportantLinksGrid';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'calendar' | 'checklist' | 'links'>('calculator');

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Financial Resources",
    "description": "Tools, checklists, and calendars for financial compliance.",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": `Income Tax Calculator ${CONTACT_INFO.assessmentYear}`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web"
      },
      {
        "@type": "Dataset",
        "name": `Compliance Calendar ${CONTACT_INFO.financialYear}`
      }
    ]
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title="Resources | Calculators, Calendar & Checklists"
        description="Essential financial tools for businesses and individuals. Income Tax Calculator, Compliance Calendar, and Downloadable Checklists."
        schema={schema}
      />
      
      {/* HERO SECTION - Hidden in Print */}
      <PageHero
        tag="Tools & Utilities"
        title="Resource"
        subtitle="Hub."
        className="print:hidden"
      />

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
                        <button 
                           onClick={() => setActiveTab('links')}
                           className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-left ${activeTab === 'links' ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
                        >
                           <Globe size={20} /> Important Links
                        </button>
                     </nav>
                  </div>
               </div>

               {/* CONTENT PANEL - Full Width in Print */}
               <div className="lg:col-span-3 print:w-full">
                  
                  {/* CALCULATOR TAB */}
                  {activeTab === 'calculator' && (
                     <TaxCalculator />
                  )}

                  {/* CALENDAR TAB */}
                  {activeTab === 'calendar' && (
                     <ComplianceCalendar />
                  )}

                  {/* CHECKLISTS TAB */}
                  {activeTab === 'checklist' && (
                     <ChecklistGrid />
                  )}

                  {/* LINKS TAB */}
                  {activeTab === 'links' && (
                     <ImportantLinksGrid />
                  )}

               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Resources;