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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchString, setSearchString] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

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

  // Scroll active option into view when activeIndex changes
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const activeOption = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeOption) {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  // Sync active index with value when opening
  useEffect(() => {
    if (isOpen && value) {
      const idx = options.indexOf(value);
      if (idx >= 0) setActiveIndex(idx);
    } else if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, value, options]);

  const handleSelect = (option: string) => {
    onChange(name, option);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Type-ahead functionality
  const handleTypeAhead = (char: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    const newSearch = searchString + char;
    setSearchString(newSearch);
    
    const matchIndex = options.findIndex(opt => 
      opt.toLowerCase().startsWith(newSearch.toLowerCase())
    );

    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }

    searchTimeout.current = setTimeout(() => {
      setSearchString('');
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(options[activeIndex]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        if (e.key.length === 1) {
          handleTypeAhead(e.key);
        }
    }
  };

  const activeDescendantId = isOpen && activeIndex >= 0 ? `${name}-option-${activeIndex}` : undefined;

  return (
    <div className="flex flex-col gap-2 relative z-dropdown" ref={dropdownRef}>
      <label 
        id={`${name}-label`} 
        className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-1 ml-1"
      >
        {icon} {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <button 
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${name}-listbox`}
        aria-labelledby={`${name}-label`}
        aria-activedescendant={activeDescendantId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full bg-brand-bg border py-4 px-6 rounded-2xl text-brand-dark text-left
          focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group
          ${error ? 'border-red-500 ring-1 ring-red-500' : isOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'}
        `}
      >
        <span className={value ? "text-brand-dark font-medium" : "text-brand-stone/40 font-medium"}>
          {value || placeholder}
        </span>
        <ChevronDown size={20} className={`text-brand-stone transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
      </button>
      
      {error && <p className="text-red-500 text-xs mt-1 font-bold" role="alert" aria-live="polite">{error}</p>}

      {isOpen && (
        <ul
          id={`${name}-listbox`}
          role="listbox"
          ref={listboxRef}
          aria-labelledby={`${name}-label`}
          tabIndex={-1}
          className="absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-popover max-h-60 overflow-y-auto py-2 no-scrollbar outline-none"
        >
          {options.map((option, idx) => (
            <li 
              key={idx}
              id={`${name}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`
                px-6 py-3 cursor-pointer flex justify-between items-center transition-colors
                ${activeIndex === idx ? 'bg-brand-bg text-brand-moss' : 'text-brand-dark'}
              `}
            >
              <span className={`text-base font-medium ${value === option ? 'font-bold' : ''}`}>
                {option}
              </span>
              {value === option && <Check size={16} className="text-brand-moss" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;