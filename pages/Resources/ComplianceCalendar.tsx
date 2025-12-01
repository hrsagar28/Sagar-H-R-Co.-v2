
import React, { useState } from 'react';
import { Search, Printer, AlertCircle } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';
import { formatCalendarMonth, getMonthAbbreviation } from '../../utils/dateUtils';
import { useResourceData } from '../../hooks/useResourceData';
import Skeleton from '../../components/Skeleton';

interface CalendarEvent {
  day: number;
  desc: string;
  cat: string;
}

type ComplianceCalendarData = Record<string, CalendarEvent[]>;

const ComplianceCalendar: React.FC = () => {
  const [calFilter, setCalFilter] = useState('all');
  const [calSearch, setCalSearch] = useState('');
  
  const { data: calendarData, loading, error } = useResourceData<ComplianceCalendarData>('compliance-calendar.json');

  const handlePrint = () => {
    window.print();
  };

  const badgeColors: Record<string, string> = {
    gst: 'bg-blue-100 text-blue-800 border-blue-200',
    it: 'bg-green-100 text-green-800 border-green-200',
    tds: 'bg-purple-100 text-purple-800 border-purple-200',
    roc: 'bg-orange-100 text-orange-800 border-orange-200',
    payroll: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  const categoryMap: Record<string, string> = { gst: 'GST', it: 'Income Tax', tds: 'TDS/TCS', roc: 'ROC', payroll: 'Payroll' };

  // Sort months chronologically if data exists
  const sortedMonths = calendarData ? Object.keys(calendarData).sort() : [];

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-heading font-bold text-brand-dark">Compliance Calendar</h2>
            <p className="text-brand-stone mt-1">Key Due Dates for {CONTACT_INFO.financialYear.replace('FY ', '')}</p>
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

    {loading ? (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <Skeleton variant="text" width={150} height={28} className="mb-4" />
            <div className="grid gap-3">
               <Skeleton variant="rectangular" height={60} className="w-full rounded-xl" />
               <Skeleton variant="rectangular" height={60} className="w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600">
         <AlertCircle className="mx-auto mb-2" size={24} />
         <p>{error}</p>
      </div>
    ) : (
      <div className="space-y-8">
          {sortedMonths.map((monthKey, idx) => {
              const events = calendarData![monthKey];
              const displayMonth = formatCalendarMonth(monthKey);
              const monthAbbr = getMonthAbbreviation(monthKey);

              const filteredEvents = events.filter(e => 
                  (calFilter === 'all' || e.cat === calFilter) && 
                  (e.desc.toLowerCase().includes(calSearch.toLowerCase()))
              );

              if (filteredEvents.length === 0) return null;

              return (
                  <div key={idx} className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-brand-dark mb-4 sticky top-0 bg-brand-surface py-2 border-b border-brand-border/50 print:static print:bg-white print:border-black">{displayMonth}</h3>
                  <div className="grid gap-3">
                      {filteredEvents.map((event, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-brand-bg border border-brand-border/50 hover:border-brand-moss/30 transition-colors print:bg-white print:border-gray-200">
                              <div className="w-12 h-12 flex flex-col items-center justify-center bg-white rounded-lg border border-brand-border shadow-sm shrink-0 print:border-black">
                              <span className="text-xs font-bold text-brand-moss uppercase leading-none print:text-black">{monthAbbr}</span>
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
    )}
    </div>
  );
};

export default ComplianceCalendar;
