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
  min?: string;
  max?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
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

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const parseDateString = (dateString?: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    const parsedDate = new Date(year, month - 1, day);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const minDate = parseDateString(min);
  const maxDate = parseDateString(max);
  const clampDate = (date: Date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (minDate && normalizedDate < minDate) {
      return new Date(minDate);
    }

    if (maxDate && normalizedDate > maxDate) {
      return new Date(maxDate);
    }

    return normalizedDate;
  };
  const isDateDisabled = (date: Date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return (minDate !== null && normalizedDate < minDate) || (maxDate !== null && normalizedDate > maxDate);
  };

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

      const initialDate = value ? (parseDateString(value) ?? new Date()) : new Date();
      const boundedDate = clampDate(initialDate);
      if (isNaN(initialDate.getTime())) {
        // Handle invalid date string gracefully
        const now = clampDate(new Date());
        setViewDate(now);
        setFocusedDate(now);
      } else {
        setViewDate(boundedDate);
        setFocusedDate(boundedDate);
      }
      setCalendarView('days');

      // Move focus to the calendar grid for keyboard nav
      setTimeout(() => {
        if (gridRef.current) {
          // Focus the grid container first
          gridRef.current.focus({ preventScroll: true });
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
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Select Date';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (isDateDisabled(selectedDate)) return;
    // Adjust for timezone to ensure we get YYYY-MM-DD correctly in local time
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - offset * 60 * 1000);
    const dateString = adjustedDate.toISOString().split('T')[0];
    if (!dateString) return;

    onChange(name, dateString);
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
    announce(`Selected date ${selectedDate.toLocaleDateString()}`);
  };

  const changeMonth = (offset: number) => {
    const newDate = clampDate(new Date(viewDate));
    newDate.setMonth(newDate.getMonth() + offset);
    const boundedDate = clampDate(newDate);
    setViewDate(boundedDate);
    // Update focus to same day in new month, or last day if not exists
    const daysInNewMonth = getDaysInMonth(boundedDate.getFullYear(), boundedDate.getMonth());
    const newFocus = new Date(boundedDate);
    newFocus.setDate(Math.min(focusedDate.getDate(), daysInNewMonth));
    const boundedFocus = clampDate(newFocus);
    setFocusedDate(boundedFocus);

    announce(`${months[boundedDate.getMonth()]} ${boundedDate.getFullYear()}`);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    const boundedDate = clampDate(newDate);
    setViewDate(boundedDate);
    setCalendarView('days');
    setFocusedDate(boundedDate);
    announce(`${months[boundedDate.getMonth()]} ${boundedDate.getFullYear()}`);
    // Return focus to grid
    setTimeout(() => gridRef.current?.focus(), 50);
  };

  const generateYearRange = () => {
    const startYear = minDate?.getFullYear() ?? 1960;
    const endYear = maxDate?.getFullYear() ?? new Date().getFullYear();
    const years = [];
    for (let i = startYear; i <= endYear; i++) years.push(i);
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
        case 'ArrowLeft':
          newFocus.setDate(newFocus.getDate() - 1);
          break;
        case 'ArrowRight':
          newFocus.setDate(newFocus.getDate() + 1);
          break;
        case 'ArrowUp':
          newFocus.setDate(newFocus.getDate() - 7);
          break;
        case 'ArrowDown':
          newFocus.setDate(newFocus.getDate() + 7);
          break;
        case 'PageUp':
          changeMonth(-1);
          return;
        case 'PageDown':
          changeMonth(1);
          return;
        case 'Home':
          newFocus.setDate(1);
          break;
        case 'End':
          newFocus.setDate(getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleDateSelect(focusedDate.getDate());
          return;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        const boundedFocus = clampDate(newFocus);
        setFocusedDate(boundedFocus);
        if (boundedFocus.getMonth() !== viewDate.getMonth() || boundedFocus.getFullYear() !== viewDate.getFullYear()) {
          setViewDate(boundedFocus);
        }
        announce(boundedFocus.toLocaleDateString());
      }
    }
  };

  const labelId = `${name}-label`;
  const errorId = `${name}-error`;
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  return (
    <div className="group relative z-dropdown" ref={calendarRef}>
      <label
        id={labelId}
        className="mb-3 ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-dark"
      >
        <Calendar size={14} className="text-brand-moss" /> {label} {required && <span className="text-red-500">*</span>}
      </label>

      {isTouch ? (
        <input
          type="date"
          id={`${name}-trigger`}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          autoComplete="bday"
          min={min}
          max={max}
          aria-labelledby={labelId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-2xl border bg-brand-bg px-6 py-4 text-brand-dark transition-[border-color,box-shadow] focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'}`}
        />
      ) : (
        <button
          type="button"
          id={`${name}-trigger`}
          ref={triggerRef}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          className={`group flex w-full items-center justify-between rounded-2xl border bg-brand-bg px-6 py-4 text-left text-brand-dark transition-[border-color,box-shadow] focus:border-brand-moss focus:outline-none focus:ring-2 focus:ring-brand-moss ${error ? 'border-red-500 ring-1 ring-red-500' : isOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'}`}
        >
          <span className={value ? 'font-medium text-brand-dark' : 'font-medium text-brand-stone/40'}>
            {formatDateDisplay(value)}
          </span>
          <Calendar size={20} className="text-brand-stone transition-colors group-hover:text-brand-moss" />
        </button>
      )}

      {error && (
        <p id={errorId} className="mt-2 text-xs font-bold text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {/* Calendar Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={`absolute left-0 w-full md:w-80 ${position === 'top' ? 'bottom-full mb-2 origin-bottom-left' : 'top-full mt-2 origin-top-left'} z-[1000] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-2xl transition-[transform,opacity] duration-300 ${isOpen ? 'visible scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'} `}
      >
        <div className="flex items-center justify-between border-b border-brand-border/50 bg-brand-bg/50 p-4">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={calendarView === 'years'}
            className={`rounded-lg p-2 transition-colors hover:bg-brand-moss hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-moss ${calendarView === 'years' ? 'pointer-events-none opacity-0' : ''}`}
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCalendarView(calendarView === 'days' ? 'years' : 'days')}
            className="rounded-md px-4 py-1 font-heading text-lg font-bold text-brand-dark transition-colors hover:text-brand-moss focus:outline-none focus:ring-2 focus:ring-brand-moss"
          >
            {calendarView === 'days' ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}` : 'Select Year'}
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={calendarView === 'years'}
            className={`rounded-lg p-2 transition-colors hover:bg-brand-moss hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-moss ${calendarView === 'years' ? 'pointer-events-none opacity-0' : ''}`}
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div
          className="rounded-b-2xl p-4 outline-none focus:ring-2 focus:ring-inset focus:ring-brand-moss"
          ref={gridRef}
          tabIndex={0}
          role="grid"
          aria-label="Calendar Date Grid"
          onKeyDown={handleGridKeyDown}
        >
          {calendarView === 'days' ? (
            <div role="rowgroup">
              <div className="mb-2 grid grid-cols-7" role="row">
                {daysOfWeek.map((d, i) => (
                  <div
                    key={d}
                    className="py-1 text-center text-xs font-bold uppercase tracking-wide text-brand-stone"
                    role="columnheader"
                    aria-label={fullDaysOfWeek[i]}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1" role="row">
                {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} role="presentation" />
                ))}

                {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const currentDateString = currentDate.toDateString();
                  const selectedDateString = value ? (parseDateString(value)?.toDateString() ?? '') : '';
                  const isSelected = currentDateString === selectedDateString;
                  const isFocused = currentDate.toDateString() === focusedDate.toDateString();
                  const isToday = currentDate.toDateString() === new Date().toDateString();
                  const isDisabled = isDateDisabled(currentDate);

                  return (
                    <button
                      key={day}
                      type="button"
                      role="gridcell"
                      tabIndex={-1} // Handled by container keyboard nav
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      aria-label={`${day} ${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                      aria-current={isToday ? 'date' : undefined}
                      disabled={isDisabled}
                      onClick={() => handleDateSelect(day)}
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-[background-color,color,box-shadow] focus:outline-none ${isSelected ? 'bg-brand-moss text-white shadow-md' : ''} ${isDisabled ? 'cursor-not-allowed text-brand-stone/30 hover:bg-transparent hover:text-brand-stone/30' : ''} ${!isSelected && isFocused ? 'bg-brand-bg text-brand-dark ring-2 ring-brand-moss' : ''} ${!isSelected && !isFocused && !isDisabled ? 'text-brand-dark hover:bg-brand-bg hover:text-brand-moss' : ''} `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-scrollbar grid h-64 grid-cols-3 gap-2 overflow-y-auto">
              {generateYearRange().map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => selectYear(year)}
                  className={`rounded-xl px-1 py-3 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-moss ${viewDate.getFullYear() === year ? 'bg-brand-moss text-white' : 'text-brand-dark hover:bg-brand-bg'}`}
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
