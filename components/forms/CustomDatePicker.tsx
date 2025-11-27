import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnnounce } from '../../hooks/useAnnounce';

interface CustomDatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  required?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'days' | 'years'>('days');
  const [focusedDate, setFocusedDate] = useState(new Date());
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const { announce } = useAnnounce();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  // Initialize view date from value or current date
  useEffect(() => {
    if (isOpen) {
      const initialDate = value ? new Date(value) : new Date();
      setViewDate(initialDate);
      setFocusedDate(initialDate);
      setCalendarView('days');
      setTimeout(() => popupRef.current?.focus(), 50);
    }
  }, [isOpen, value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select Date of Birth";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone to ensure we get YYYY-MM-DD correctly
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const dateString = adjustedDate.toISOString().split('T')[0];
    
    onChange(name, dateString);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
    announce(`${months[newDate.getMonth()]} ${newDate.getFullYear()}`);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCalendarView('days');
    announce(`${months[newDate.getMonth()]} ${year}`);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 1960; i <= currentYear; i++) years.push(i);
    return years;
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCalendarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    
    if (calendarView === 'days') {
      const newFocus = new Date(focusedDate);
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); newFocus.setDate(newFocus.getDate() - 1); break;
        case 'ArrowRight': e.preventDefault(); newFocus.setDate(newFocus.getDate() + 1); break;
        case 'ArrowUp': e.preventDefault(); newFocus.setDate(newFocus.getDate() - 7); break;
        case 'ArrowDown': e.preventDefault(); newFocus.setDate(newFocus.getDate() + 7); break;
        case 'Enter': case ' ': e.preventDefault(); handleDateSelect(focusedDate.getDate()); return;
        case 'PageUp': e.preventDefault(); changeMonth(-1); return;
        case 'PageDown': e.preventDefault(); changeMonth(1); return;
        default: return;
      }
      setFocusedDate(newFocus);
      if (newFocus.getMonth() !== viewDate.getMonth()) setViewDate(newFocus);
    } else {
      const years = generateYearRange();
      const currentYearIndex = years.indexOf(viewDate.getFullYear());
      let newYearIndex = currentYearIndex;
      switch(e.key) {
        case 'ArrowLeft': e.preventDefault(); newYearIndex = Math.max(0, currentYearIndex - 1); break;
        case 'ArrowRight': e.preventDefault(); newYearIndex = Math.min(years.length - 1, currentYearIndex + 1); break;
        case 'ArrowUp': e.preventDefault(); newYearIndex = Math.max(0, currentYearIndex - 3); break;
        case 'ArrowDown': e.preventDefault(); newYearIndex = Math.min(years.length - 1, currentYearIndex + 3); break;
        case 'Enter': case ' ': e.preventDefault(); selectYear(years[currentYearIndex]); return;
        default: return;
      }
      if (newYearIndex !== currentYearIndex) {
        const newDate = new Date(viewDate);
        newDate.setFullYear(years[newYearIndex]);
        setViewDate(newDate);
        setFocusedDate(newDate);
      }
    }
  };

  return (
    <div className="group relative z-dropdown" ref={calendarRef}>
      <label htmlFor={`${name}-trigger`} className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
        <Calendar size={14} className="text-brand-moss"/> {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <button 
        type="button"
        id={`${name}-trigger`}
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full bg-brand-bg border ${error ? 'border-red-500 ring-1 ring-red-500' : isOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group text-left`}
      >
        <span className={value ? "text-brand-dark font-medium" : "text-brand-stone/40 font-medium"}>
          {formatDateDisplay(value)}
        </span>
        <Calendar size={20} className="text-brand-stone group-hover:text-brand-moss transition-colors" />
      </button>
      
      {error && <p className="text-red-500 text-xs mt-2 font-bold" role="alert" aria-live="polite">{error}</p>}

      {/* Calendar Popup */}
      <div 
        ref={popupRef}
        tabIndex={-1}
        onKeyDown={handleCalendarKeyDown}
        className={`absolute top-full left-0 w-full md:w-80 mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-popover origin-top-left outline-none ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-brand-border/50 bg-brand-bg/50">
          <button type="button" onClick={() => changeMonth(-1)} disabled={calendarView === 'years'} tabIndex={-1} className={`p-2 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`} aria-label="Previous Month"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => setCalendarView(calendarView === 'days' ? 'years' : 'days')} tabIndex={-1} className="font-heading font-bold text-lg text-brand-dark hover:text-brand-moss transition-colors px-4 py-1 rounded-md">
            {calendarView === 'days' ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}` : 'Select Year'}
          </button>
          <button type="button" onClick={() => changeMonth(1)} disabled={calendarView === 'years'} tabIndex={-1} className={`p-2 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`} aria-label="Next Month"><ChevronRight size={20} /></button>
        </div>

        <div className="p-4">
          {calendarView === 'days' ? (
            <>
              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map(d => <div key={d} className="text-center text-xs font-bold text-brand-stone uppercase tracking-wide py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const currentDateString = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
                  const selectedDateString = value ? new Date(value).toDateString() : '';
                  const isSelected = currentDateString === selectedDateString;
                  const currentDayObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const isFocused = currentDayObj.toDateString() === focusedDate.toDateString();
                  return (
                    // Increased touch target to w-10 h-10 (40px) from 32px
                    <button key={day} type="button" onClick={() => handleDateSelect(day)} tabIndex={-1} className={`w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center mx-auto transition-all ${isSelected ? 'bg-brand-moss text-white shadow-md' : isFocused ? 'bg-brand-bg text-brand-moss ring-1 ring-brand-moss' : 'text-brand-dark hover:bg-brand-bg hover:text-brand-moss'}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2 no-scrollbar">
              {generateYearRange().map(year => (
                <button key={year} type="button" onClick={() => selectYear(year)} tabIndex={-1} className={`py-3 px-1 rounded-xl text-base font-medium transition-colors ${viewDate.getFullYear() === year ? 'bg-brand-moss text-white' : 'hover:bg-brand-bg text-brand-dark'}`}>
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;