
import React, { useState, useMemo } from 'react';
import { Search, Printer, AlertCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
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

  // Sort months chronologically
  const sortedMonths = useMemo(() => {
    return calendarData ? Object.keys(calendarData).sort() : [];
  }, [calendarData]);

  // Calculate Next Deadline and Urgency
  const nextDeadline = useMemo(() => {
    if (!calendarData || sortedMonths.length === 0) return null;
    
    const now = new Date();
    // Normalize today to start of day for comparison
    now.setHours(0,0,0,0); 

    let upcomingEvent: { date: Date, event: CalendarEvent } | null = null;

    // Flatten all events into standard Date objects
    for (const monthKey of sortedMonths) {
        const [year, month] = monthKey.split('-').map(Number);
        
        for (const event of calendarData[monthKey]) {
            // Create event date: Month is 0-indexed in JS Date
            const eventDate = new Date(year, month - 1, event.day);
            
            if (eventDate >= now) {
                if (!upcomingEvent || eventDate < upcomingEvent.date) {
                    upcomingEvent = { date: eventDate, event };
                }
            }
        }
    }
    return upcomingEvent;
  }, [calendarData, sortedMonths]);

  const getUrgencyClass = (monthKey: string, day: number) => {
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const [year, month] = monthKey.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'border-l-4 border-l-gray-300 opacity-60'; // Past
      if (diffDays <= 7) return 'border-l-4 border-l-red-500 bg-red-50/50'; // Urgent
      if (diffDays <= 14) return 'border-l-4 border-l-orange-400 bg-orange-50/30'; // Warning
      if (diffDays <= 30) return 'border-l-4 border-l-yellow-400'; // Upcoming
      return 'border-l-4 border-l-brand-border'; // Far out
  };

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 md:p-12 border border-brand-border shadow-sm print:shadow-none print:border-0 print:p-0 animate-fade-in-up">
        
        {/* Next Deadline Banner */}
        {nextDeadline && (
            <div className="mb-8 p-6 bg-brand-dark rounded-2xl text-white relative overflow-hidden shadow-lg print:hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-moss opacity-30 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl shrink-0 animate-pulse">
                        <Clock className="text-[#4ADE80]" size={24} />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-stone/80 mb-1 block">Next Compliance Deadline</span>
                        <h3 className="text-xl font-bold mb-1">{nextDeadline.event.desc}</h3>
                        <p className="text-white/70 text-sm font-medium">
                            Due on {nextDeadline.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            <span className="ml-2 px-2 py-0.5 bg-[#4ADE80] text-black text-[10px] font-bold rounded-full uppercase">
                                {Math.ceil((nextDeadline.date.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 3600 * 24))} Days left
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-heading font-bold text-brand-dark">Compliance Calendar</h2>
                <p className="text-brand-stone mt-1">Key Due Dates for {CONTACT_INFO.financialYear.replace('FY ', '')}</p>
            </div>
            <div className="flex gap-2 print:hidden w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-stone" />
                    <input 
                    type="text" 
                    placeholder="Search..." 
                    value={calSearch}
                    onChange={(e) => setCalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-full text-sm focus:outline-none focus:border-brand-moss"
                    />
                </div>
                <button onClick={handlePrint} className="p-2 rounded-full bg-brand-bg text-brand-dark hover:bg-brand-moss hover:text-white transition-colors" title="Print Calendar">
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
      <>
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
                    <div className="sticky top-0 bg-brand-surface py-2 border-b border-brand-border/50 z-10 print:static print:bg-white print:border-black flex items-center gap-2 mb-4">
                        <CalendarIcon size={18} className="text-brand-moss" />
                        <h3 className="text-xl font-bold text-brand-dark">{displayMonth}</h3>
                    </div>
                    
                    <div className="grid gap-3">
                        {filteredEvents.map((event, i) => (
                            <div 
                                key={i} 
                                className={`flex items-center gap-4 p-4 rounded-xl border border-brand-border/50 hover:shadow-md transition-all print:bg-white print:border-gray-200 ${getUrgencyClass(monthKey, event.day)}`}
                            >
                                <div className="w-12 h-12 flex flex-col items-center justify-center bg-white rounded-lg border border-brand-border shadow-sm shrink-0 print:border-black">
                                <span className="text-xs font-bold text-brand-moss uppercase leading-none print:text-black">{monthAbbr}</span>
                                <span className="text-lg font-bold text-brand-dark leading-none mt-1">{event.day}</span>
                                </div>
                                <div className="flex-grow">
                                <div className="font-bold text-brand-dark">{event.desc}</div>
                                <div className="text-xs text-brand-stone font-medium mt-1">{categoryMap[event.cat]}</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColors[event.cat]} print:border-black print:text-black print:bg-white whitespace-nowrap`}>
                                {event.cat}
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                );
            })}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-8 border-t border-brand-border print:hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-4">Legend</h4>
            <div className="flex flex-wrap gap-3">
                {Object.entries(categoryMap).map(([key, label]) => (
                    <button 
                        key={key}
                        onClick={() => setCalFilter(calFilter === key ? 'all' : key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            calFilter === key || calFilter === 'all' 
                            ? badgeColors[key] 
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-brand-stone font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> &lt; 7 Days</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> &lt; 14 Days</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> &lt; 30 Days</span>
            </div>
        </div>
      </>
    )}
    </div>
  );
};

export default ComplianceCalendar;
