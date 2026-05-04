import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Printer, AlertCircle, Clock, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
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
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const { data: calendarData, loading, error } = useResourceData<ComplianceCalendarData>('compliance-calendar.json');

  const handlePrint = () => {
    window.print();
  };

  const badgeColors: Record<string, string> = {
    gst: 'bg-blue-100 text-blue-800 border-blue-200',
    it: 'bg-green-100 text-green-800 border-green-200',
    tds: 'bg-purple-100 text-purple-800 border-purple-200',
    roc: 'bg-orange-100 text-orange-800 border-orange-200',
    payroll: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  const categoryMap: Record<string, string> = {
    gst: 'GST',
    it: 'Income Tax',
    tds: 'TDS/TCS',
    roc: 'ROC',
    payroll: 'Payroll',
  };

  // Sort months chronologically
  const sortedMonths = useMemo(() => {
    return calendarData ? Object.keys(calendarData).sort() : [];
  }, [calendarData]);

  // Set default active month to current or next month only once
  useEffect(() => {
    if (sortedMonths.length > 0 && !hasInitialized.current) {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

      if (sortedMonths.includes(currentMonth)) {
        setActiveMonth(currentMonth);
      } else {
        // Find the next available month
        const next = sortedMonths.find((m) => m > currentMonth);
        setActiveMonth(next || sortedMonths[0] || null);
      }
      hasInitialized.current = true;
    }
  }, [sortedMonths]);

  // Calculate Next Deadline and Urgency
  const nextDeadline = useMemo(() => {
    if (!calendarData || sortedMonths.length === 0) return null;

    const now = new Date();
    // Normalize today to start of day for comparison
    now.setHours(0, 0, 0, 0);

    let upcomingEvent: { date: Date; event: CalendarEvent } | null = null;

    // Flatten all events into standard Date objects
    for (const monthKey of sortedMonths) {
      const [year, month] = monthKey.split('-').map(Number);
      if (year === undefined || month === undefined) continue;

      for (const event of calendarData[monthKey] || []) {
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
    now.setHours(0, 0, 0, 0);

    const [year, month] = monthKey.split('-').map(Number);
    if (year === undefined || month === undefined) return 'border-l-4 border-l-brand-border';
    const eventDate = new Date(year, month - 1, day);

    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'border-l-4 border-l-gray-300 opacity-60'; // Past
    if (diffDays <= 7) return 'border-l-4 border-l-red-500 bg-red-50/50'; // Urgent
    if (diffDays <= 14) return 'border-l-4 border-l-orange-400 bg-orange-50/30'; // Warning
    if (diffDays <= 30) return 'border-l-4 border-l-yellow-400'; // Upcoming
    return 'border-l-4 border-l-brand-border'; // Far out
  };

  const toggleMonth = (monthKey: string) => {
    setActiveMonth((prev) => (prev === monthKey ? null : monthKey));
  };

  return (
    <div className="animate-fade-in-up rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-sm md:p-12 print:border-0 print:p-0 print:shadow-none">
      {/* Next Deadline Banner */}
      {nextDeadline && (
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-brand-dark p-6 text-white shadow-lg print:hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-moss opacity-30 blur-[40px]"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="shrink-0 animate-pulse rounded-xl bg-white/10 p-3">
              <Clock className="text-brand-accent" size={24} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-brand-stone/80">
                Next Compliance Deadline
              </span>
              <h3 className="mb-1 text-xl font-bold">{nextDeadline.event.desc}</h3>
              <p className="text-sm font-medium text-white/70">
                Due on{' '}
                {nextDeadline.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="ml-2 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                  {Math.ceil((nextDeadline.date.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24))} Days
                  left
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-heading text-3xl font-bold text-brand-dark">Compliance Calendar</h2>
          <p className="mt-1 text-brand-stone">Key Due Dates for {CONTACT_INFO.financialYear.replace('FY ', '')}</p>
        </div>
        <div className="flex w-full gap-2 md:w-auto print:hidden">
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-stone" />
            <input
              type="text"
              placeholder="Search..."
              value={calSearch}
              onChange={(e) => setCalSearch(e.target.value)}
              className="w-full rounded-full border border-brand-border bg-brand-bg py-2 pl-10 pr-4 text-sm focus:border-brand-moss focus:outline-none"
            />
          </div>
          <button
            onClick={handlePrint}
            className="rounded-full bg-brand-bg p-2 text-brand-dark transition-colors hover:bg-brand-moss hover:text-white"
            title="Print Calendar"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
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
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {sortedMonths.map((monthKey, idx) => {
              const events = calendarData?.[monthKey] || [];
              const displayMonth = formatCalendarMonth(monthKey);
              const monthAbbr = getMonthAbbreviation(monthKey);
              const isExpanded = activeMonth === monthKey;

              const filteredEvents = events.filter(
                (e) =>
                  (calFilter === 'all' || e.cat === calFilter) &&
                  e.desc.toLowerCase().includes(calSearch.toLowerCase()),
              );

              if (filteredEvents.length === 0) return null;

              return (
                <div
                  key={idx}
                  className={`break-inside-avoid overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${isExpanded ? 'border-brand-moss/30 bg-white ring-4 ring-brand-moss/5' : 'border-brand-border bg-white hover:shadow-md'}`}
                >
                  <button
                    onClick={() => toggleMonth(monthKey)}
                    className={`flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors ${isExpanded ? 'bg-brand-moss/5' : 'hover:bg-brand-bg/50'}`}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg p-2 transition-colors ${isExpanded ? 'bg-brand-moss text-white' : 'bg-brand-bg text-brand-moss'}`}
                      >
                        <CalendarIcon size={20} />
                      </div>
                      <h3
                        className={`font-heading text-xl font-bold transition-colors ${isExpanded ? 'text-brand-moss' : 'text-brand-dark'}`}
                      >
                        {displayMonth}
                      </h3>
                    </div>
                    <div
                      className={`rounded-full border p-2 transition-all duration-300 ${isExpanded ? 'rotate-180 border-brand-moss bg-brand-moss text-white' : 'border-brand-border bg-white text-brand-stone'}`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="border-t border-brand-border/30 p-5 pt-0">
                      <div className="mt-4 grid gap-3">
                        {filteredEvents.map((event, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-4 rounded-xl border border-brand-border/50 bg-white p-4 transition-all hover:shadow-sm ${getUrgencyClass(monthKey, event.day)}`}
                          >
                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-brand-border bg-brand-bg shadow-sm">
                              <span className="text-xs font-bold uppercase leading-none text-brand-moss">
                                {monthAbbr}
                              </span>
                              <span className="mt-1 text-lg font-bold leading-none text-brand-dark">{event.day}</span>
                            </div>
                            <div className="flex-grow">
                              <div className="text-sm font-bold text-brand-dark md:text-base">{event.desc}</div>
                              <div className="mt-1 text-xs font-medium text-brand-stone">{categoryMap[event.cat]}</div>
                            </div>
                            <div
                              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider md:text-xs ${badgeColors[event.cat]} whitespace-nowrap`}
                            >
                              {event.cat}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-12 border-t border-brand-border pt-8 print:hidden">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-stone">Legend</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryMap).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCalFilter(calFilter === key ? 'all' : key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    calFilter === key || calFilter === 'all'
                      ? badgeColors[key]
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-medium text-brand-stone">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div> &lt; 7 Days
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-orange-400"></div> &lt; 14 Days
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div> &lt; 30 Days
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComplianceCalendar;
