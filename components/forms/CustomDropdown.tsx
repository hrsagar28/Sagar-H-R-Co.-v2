import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomDropdownProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  icon,
  error,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(name, option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        handleSelect(options[highlightedIndex]);
      } else {
        setIsOpen(!isOpen);
        setHighlightedIndex(0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'Tab') {
      if (isOpen) setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative z-dropdown" ref={dropdownRef}>
      <label id={`${name}-label`} className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-1 ml-1">
        {icon} {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <button 
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${name}-label`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full bg-brand-bg border ${error ? 'border-red-500 ring-1 ring-red-500' : isOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group text-left`}
      >
        <span className={value ? "text-brand-dark font-medium" : "text-brand-stone/40 font-medium"}>
          {value || placeholder}
        </span>
        <ChevronDown size={20} className={`text-brand-stone transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
      </button>
      
      {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}

      <div 
        className={`absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-popover origin-top ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
        role="listbox"
      >
        <div className="max-h-60 overflow-y-auto py-2 no-scrollbar">
          {options.map((option, idx) => (
            <div 
              key={idx}
              role="option"
              aria-selected={value === option}
              onClick={() => handleSelect(option)}
              className={`px-6 py-3 cursor-pointer flex justify-between items-center group transition-colors ${highlightedIndex === idx ? 'bg-brand-bg text-brand-moss' : 'hover:bg-brand-bg text-brand-dark'}`}
            >
              <span className={`text-base font-medium ${value === option ? 'text-brand-moss font-bold' : 'group-hover:text-brand-moss'}`}>
                {option}
              </span>
              {value === option && <Check size={16} className="text-brand-moss" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;