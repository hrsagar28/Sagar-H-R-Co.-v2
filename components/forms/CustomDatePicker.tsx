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
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { announce } = useAnnounce();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  // Initialize view date from value or current date
  useEffect(() => {
    if (isOpen) {
      // Smart Positioning Logic
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        // Approximate height of calendar is 360px
        if (spaceBelow < 360 && spaceAbove > 360) {
          setPosition('top');
        } else {
          setPosition('bottom');
        }
      }

      const initialDate = value ? new Date(value) : new Date();
      if (isNaN(initialDate.getTime())) {
          // Handle invalid date string gracefully
          const now = new Date();
          setViewDate(now);
          setFocusedDate(now);
      } else {
          setViewDate(initialDate);
          setFocusedDate(initialDate);
      }
      setCalendarView('days');
      
      // Move focus to the calendar grid for keyboard nav
      setTimeout(() => {
          if (gridRef.current) {
              const focusedBtn = gridRef.current.querySelector('button[tabindex="0"]') as HTMLElement;
              // Prevent scroll on focus to avoid "heading disappears" / layout jumps
              if (focusedBtn) focusedBtn.focus({ preventScroll: true });
              else gridRef.current.focus({ preventScroll: true });
          }
      }, 50);
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
    if (!dateStr) return "Select Date";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Select Date";
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone to ensure we get YYYY-MM-DD correctly in local time
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const dateString = adjustedDate.toISOString().split('T')[0];
    
    onChange(name, dateString);
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
    announce(`Selected date ${selectedDate.toDateString()}`);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
    // Update focus to same day in new month, or last day if not exists
    const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), newDate.getMonth());
    const newFocus = new Date(newDate);
    newFocus.setDate(Math.min(focusedDate.getDate(), daysInNewMonth));
    setFocusedDate(newFocus);
    
    announce(`${months[newDate.getMonth()]} ${newDate.getFullYear()}`);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCalendarView('days');
    setFocusedDate(newDate);
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

  // Keyboard navigation within the grid
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
      return;
    }
    
    if (e.key === 'Tab') {
        setIsOpen(false);
        return;
    }

    if (calendarView === 'days') {
      const newFocus = new Date(focusedDate);
      let handled = true;

      switch (e.key) {
        case 'ArrowLeft': newFocus.setDate(newFocus.getDate() - 1); break;
        case 'ArrowRight': newFocus.setDate(newFocus.getDate() + 1); break;
        case 'ArrowUp': newFocus.setDate(newFocus.getDate() - 7); break;
        case 'ArrowDown': newFocus.setDate(newFocus.getDate() + 7); break;
        case 'PageUp': changeMonth(-1); return;
        case 'PageDown': changeMonth(1); return;
        case 'Home': newFocus.setDate(1); break;
        case 'End': newFocus.setDate(getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())); break;
        case 'Enter': 
        case ' ':
            e.preventDefault(); 
            handleDateSelect(focusedDate.getDate()); 
            return;
        default: handled = false;
      }

      if (handled) {
        e.preventDefault();
        setFocusedDate(newFocus);
        if (newFocus.getMonth() !== viewDate.getMonth()) {
            setViewDate(newFocus);
        }
      }
    }
  };

  return (
    <div className="group relative z-dropdown" ref={calendarRef}>
      <label 
        id={`${name}-label`}
        className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1"
      >
        <Calendar size={14} className="text-brand-moss"/> {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <button 
        type="button"
        id={`${name}-trigger`}
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={`${name}-label`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full bg-brand-bg border py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group text-left ${error ? 'border-red-500 ring-1 ring-red-500' : isOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'}`}
      >
        <span className={value ? "text-brand-dark font-medium" : "text-brand-stone/40 font-medium"}>
          {formatDateDisplay(value)}
        </span>
        <Calendar size={20} className="text-brand-stone group-hover:text-brand-moss transition-colors" />
      </button>
      
      {error && <p className="text-red-500 text-xs mt-2 font-bold" role="alert" aria-live="polite">{error}</p>}

      {/* Calendar Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${name}-label`}
        className={`
            absolute left-0 w-full md:w-80
            ${position === 'top' ? 'bottom-full mb-2 origin-bottom-left' : 'top-full mt-2 origin-top-left'}
            bg-white border border-brand-border rounded-2xl shadow-2xl overflow-hidden 
            transition-all duration-300 z-[1000]
            ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
      >
        <div className="p-4 flex justify-between items-center border-b border-brand-border/50 bg-brand-bg/50">
          <button type="button" onClick={() => changeMonth(-1)} disabled={calendarView === 'years'} className={`p-2 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`} aria-label="Previous Month"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => setCalendarView(calendarView === 'days' ? 'years' : 'days')} className="font-heading font-bold text-lg text-brand-dark hover:text-brand-moss transition-colors px-4 py-1 rounded-md">
            {calendarView === 'days' ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}` : 'Select Year'}
          </button>
          <button type="button" onClick={() => changeMonth(1)} disabled={calendarView === 'years'} className={`p-2 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`} aria-label="Next Month"><ChevronRight size={20} /></button>
        </div>

        <div 
            className="p-4 outline-none" 
            ref={gridRef}
            tabIndex={-1}
            onKeyDown={handleGridKeyDown}
        >
          {calendarView === 'days' ? (
            <div role="grid" aria-labelledby={`${name}-label`}>
              <div className="grid grid-cols-7 mb-2" role="row">
                {daysOfWeek.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-brand-stone uppercase tracking-wide py-1" role="columnheader" aria-label={d}>
                        {d}
                    </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} role="presentation" />
                ))}
                
                {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const currentDateString = currentDate.toDateString();
                  const selectedDateString = value ? new Date(value).toDateString() : '';
                  const isSelected = currentDateString === selectedDateString;
                  const isFocused = currentDate.toDateString() === focusedDate.toDateString();
                  const isToday = currentDate.toDateString() === new Date().toDateString();

                  return (
                    <button 
                        key={day} 
                        type="button" 
                        role="gridcell"
                        tabIndex={isFocused ? 0 : -1}
                        aria-selected={isSelected}
                        aria-label={`${day} ${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => handleDateSelect(day)} 
                        className={`
                            w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center mx-auto transition-all focus:outline-none
                            ${isSelected ? 'bg-brand-moss text-white shadow-md' : ''}
                            ${!isSelected && isFocused ? 'bg-brand-bg text-brand-dark ring-2 ring-brand-moss' : ''}
                            ${!isSelected && !isFocused ? 'text-brand-dark hover:bg-brand-bg hover:text-brand-moss' : ''}
                        `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2 no-scrollbar">
              {generateYearRange().map(year => (
                <button 
                    key={year} 
                    type="button" 
                    onClick={() => selectYear(year)} 
                    className={`py-3 px-1 rounded-xl text-base font-medium transition-colors ${viewDate.getFullYear() === year ? 'bg-brand-moss text-white' : 'hover:bg-brand-bg text-brand-dark'}`}
                >
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