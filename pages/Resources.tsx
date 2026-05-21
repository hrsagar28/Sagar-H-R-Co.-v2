import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  FileText,
  Globe,
  Percent,
  BarChart3,
  TrendingUp,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import TaxCalculator from '../components/TaxCalculator';
import ComplianceCalendar from './Resources/ComplianceCalendar';
import ChecklistGrid from './Resources/ChecklistGrid';
import ImportantLinksGrid from './Resources/ImportantLinksGrid';
import GSTCalculator from './Resources/GSTCalculator';
import HRACalculator from './Resources/HRACalculator';
import TDSRateChart from './Resources/TDSRateChart';
import CIITable from './Resources/CIITable';
import CIICalculator from './Resources/CIICalculator';
import './route-styles.css';
import '../components/hero/PageHero.css';

type ResourceTab =
  | 'income-tax'
  | 'gst-calc'
  | 'hra-calc'
  | 'calendar'
  | 'tds-rates'
  | 'cii-table'
  | 'cii-calc'
  | 'checklist'
  | 'links';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResourceTab>('income-tax');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Financial Resources',
    description: 'Tools, checklists, and calendars for financial compliance.',
    hasPart: [
      {
        '@type': 'SoftwareApplication',
        name: `Income Tax Calculator ${CONTACT_INFO.assessmentYear}`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
      },
      {
        '@type': 'Dataset',
        name: `Compliance Calendar ${CONTACT_INFO.financialYear}`,
      },
    ],
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ResourceTab; label: string; icon: LucideIcon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-[background-color,color,box-shadow] ${activeTab === id ? 'bg-brand-moss text-white shadow-md' : 'text-brand-stone hover:bg-brand-bg hover:text-brand-dark'}`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={activeTab === id ? 'text-white' : 'text-brand-stone/70 group-hover:text-brand-dark'}
        />
        <span>{label}</span>
      </div>
      {activeTab === id && <ChevronRight size={14} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
      <SEO
        title="Resources | Calculators, Calendar & Checklists"
        description="Essential financial tools for businesses and individuals. Income Tax Calculator, GST Calculator, Compliance Calendar, TDS Rates and more."
        schema={schema}
      />

      {/* HERO SECTION - Hidden in Print */}
      <PageHero
        tag="Tools & Utilities"
        title={
          <>
            Resource <em>Hub.</em>
          </>
        }
        className="print:hidden"
      />

      {/* MAIN CONTENT AREA */}
      <div className="px-4 py-12 md:px-6 print:px-0 print:py-0">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 print:block">
            {/* SIDEBAR TABS - Hidden in Print */}
            <div className="lg:col-span-1 print:hidden">
              <div className="sticky top-32 space-y-6 rounded-[2rem] border border-brand-border bg-brand-surface p-4 shadow-sm">
                <div>
                  <h3 className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone">
                    Calculators
                  </h3>
                  <div className="space-y-1">
                    <NavItem id="income-tax" label="Tax Estimator" icon={Calculator} />
                    <NavItem id="gst-calc" label="GST Calculator" icon={Percent} />
                    <NavItem id="hra-calc" label="HRA Calculator" icon={TrendingUp} />
                    <NavItem id="cii-calc" label="CII Calculator" icon={BarChart3} />
                  </div>
                </div>

                <div className="h-px w-full bg-brand-border/50"></div>

                <div>
                  <h3 className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-brand-stone">
                    Reference Data
                  </h3>
                  <div className="space-y-1">
                    <NavItem id="calendar" label="Compliance Calendar" icon={Calendar} />
                    <NavItem id="tds-rates" label="TDS Rate Chart" icon={BarChart3} />
                    <NavItem id="cii-table" label="CII Table" icon={TrendingUp} />
                  </div>
                </div>

                <div className="h-px w-full bg-brand-border/50"></div>

                <div>
                  <div className="space-y-1">
                    <NavItem id="checklist" label="Checklists" icon={FileText} />
                    <NavItem id="links" label="Important Links" icon={Globe} />
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT PANEL - Full Width in Print */}
            <div className="lg:col-span-3 print:w-full">
              {activeTab === 'income-tax' && <TaxCalculator />}
              {activeTab === 'gst-calc' && <GSTCalculator />}
              {activeTab === 'hra-calc' && <HRACalculator />}
              {activeTab === 'cii-calc' && <CIICalculator />}

              {activeTab === 'calendar' && <ComplianceCalendar />}
              {activeTab === 'tds-rates' && <TDSRateChart />}
              {activeTab === 'cii-table' && <CIITable />}

              {activeTab === 'checklist' && <ChecklistGrid />}
              {activeTab === 'links' && <ImportantLinksGrid />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
