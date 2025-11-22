
import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, ArrowRight, User, Calendar, BookOpen, Building, Phone, Mail, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const Careers: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  
  // Sticky Scroll Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Dropdown States
  const [isPosDropdownOpen, setIsPosDropdownOpen] = useState(false);
  const [isExpDropdownOpen, setIsExpDropdownOpen] = useState(false);
  const posDropdownRef = useRef<HTMLDivElement>(null);
  const expDropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard Navigation States
  const [posHighlightedIndex, setPosHighlightedIndex] = useState(-1);
  const [expHighlightedIndex, setExpHighlightedIndex] = useState(-1);

  // Custom Date Picker States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // The month/year currently being viewed
  const [calendarView, setCalendarView] = useState<'days' | 'years'>('days'); // Toggle between picking days or years
  
  // Keyboard Nav for Calendar
  const [focusedDate, setFocusedDate] = useState(new Date()); // The date currently highlighted by keyboard
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarPopupRef = useRef<HTMLDivElement>(null);
  const calendarTriggerRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    mobile: '',
    email: '',
    dob: '',
    qualification: '',
    experience: '',
    previousCompanies: '',
    position: ''
  });

  // Options
  const positionOptions = ['Audit Associate', 'Articled Assistant', 'General Application'];
  const experienceOptions = ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'];

  // Click Outside Handler for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (posDropdownRef.current && !posDropdownRef.current.contains(event.target as Node)) {
        setIsPosDropdownOpen(false);
      }
      if (expDropdownRef.current && !expDropdownRef.current.contains(event.target as Node)) {
        setIsExpDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- OPTIMIZED STICKY SCROLL LOGIC ---
  useEffect(() => {
    let rAFId: number;
    let currentY = 0;
    let targetY = 0;

    const loop = () => {
      if (!containerRef.current || !sidebarRef.current || window.innerWidth < 1024) {
        if (sidebarRef.current) sidebarRef.current.style.transform = 'translate3d(0,0,0)';
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      
      // The offset from top of viewport where we want the element to stick
      const stickyTopOffset = 120; 

      // Calculate max translation (container height - sidebar height)
      // We use the containerRef's offsetHeight (static height) to prevent jitter from getBoundingClientRect height fluctuations
      const maxTranslate = containerRef.current.offsetHeight - sidebarRef.current.offsetHeight;

      if (maxTranslate <= 0) {
         rAFId = requestAnimationFrame(loop);
         return;
      }

      // Logic:
      // If container top is > stickyTopOffset, we are at the top (Translate 0).
      // If container top is < stickyTopOffset, we need to push the sidebar down by the difference.
      
      if (containerRect.top < stickyTopOffset) {
        targetY = stickyTopOffset - containerRect.top;
      } else {
        targetY = 0;
      }

      // Clamp the value so it doesn't go past the bottom of the container
      if (targetY > maxTranslate) {
        targetY = maxTranslate;
      }
      if (targetY < 0) targetY = 0;

      // Linear Interpolation (LERP) for smoothness
      // This smooths out any micro-stutters from the parent smooth scroll
      // 0.15 = follow speed. Lower is looser/smoother, Higher is tighter.
      currentY += (targetY - currentY) * 0.2;

      // If the difference is very small, snap to target to save processing
      if (Math.abs(targetY - currentY) < 0.1) {
        currentY = targetY;
      }

      sidebarRef.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      
      rAFId = requestAnimationFrame(loop);
    };

    // Start Loop
    loop();

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, []);

  // Sync focused date when calendar opens
  useEffect(() => {
    if (isCalendarOpen) {
      const initialDate = formData.dob ? new Date(formData.dob) : new Date();
      setViewDate(initialDate);
      setFocusedDate(initialDate);
      setCalendarView('days');
      // Move focus to popup for keyboard nav
      setTimeout(() => {
        calendarPopupRef.current?.focus();
      }, 50);
    }
  }, [isCalendarOpen, formData.dob]);

  const handleApplyClick = (role: string) => {
    setFormData(prev => ({ ...prev, position: role }));
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (field: 'position' | 'experience', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'position') {
      setIsPosDropdownOpen(false);
      setPosHighlightedIndex(-1);
    }
    if (field === 'experience') {
      setIsExpDropdownOpen(false);
      setExpHighlightedIndex(-1);
    }
  };

  // Keyboard Handler for Position Dropdown
  const handlePosKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isPosDropdownOpen && posHighlightedIndex >= 0) {
        handleDropdownSelect('position', positionOptions[posHighlightedIndex]);
      } else {
        setIsPosDropdownOpen(!isPosDropdownOpen);
        setPosHighlightedIndex(0); // Highlight first option on open
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isPosDropdownOpen) {
        setIsPosDropdownOpen(true);
        setPosHighlightedIndex(0);
      } else {
        setPosHighlightedIndex(prev => (prev < positionOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isPosDropdownOpen) {
        setPosHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === 'Escape') {
      setIsPosDropdownOpen(false);
    } else if (e.key === 'Tab') {
      if (isPosDropdownOpen) setIsPosDropdownOpen(false);
    }
  };

  // Keyboard Handler for Experience Dropdown
  const handleExpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isExpDropdownOpen && expHighlightedIndex >= 0) {
        handleDropdownSelect('experience', experienceOptions[expHighlightedIndex]);
      } else {
        setIsExpDropdownOpen(!isExpDropdownOpen);
        setExpHighlightedIndex(0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isExpDropdownOpen) {
        setIsExpDropdownOpen(true);
        setExpHighlightedIndex(0);
      } else {
        setExpHighlightedIndex(prev => (prev < experienceOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isExpDropdownOpen) {
        setExpHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === 'Escape') {
      setIsExpDropdownOpen(false);
    } else if (e.key === 'Tab') {
      if (isExpDropdownOpen) setIsExpDropdownOpen(false);
    }
  };


  // --- Calendar Logic ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure the date string is correct
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset*60*1000));
    const dateString = adjustedDate.toISOString().split('T')[0];

    setFormData(prev => ({ ...prev, dob: dateString }));
    setIsCalendarOpen(false);
    calendarTriggerRef.current?.focus();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCalendarView('days');
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Ascending order
    for (let i = 1960; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select Date of Birth";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Keyboard Handler for Date Picker Trigger
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsCalendarOpen(true);
     } else if (e.key === 'Escape') {
        setIsCalendarOpen(false);
     }
  };

  // Keyboard Navigation Inside Calendar
  const handleCalendarKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Escape') {
        setIsCalendarOpen(false);
        calendarTriggerRef.current?.focus();
        return;
     }
     
     if (calendarView === 'days') {
        const newFocus = new Date(focusedDate);
        
        switch (e.key) {
           case 'ArrowLeft':
              e.preventDefault();
              newFocus.setDate(newFocus.getDate() - 1);
              break;
           case 'ArrowRight':
              e.preventDefault();
              newFocus.setDate(newFocus.getDate() + 1);
              break;
           case 'ArrowUp':
              e.preventDefault();
              newFocus.setDate(newFocus.getDate() - 7);
              break;
           case 'ArrowDown':
              e.preventDefault();
              newFocus.setDate(newFocus.getDate() + 7);
              break;
           case 'Enter':
           case ' ':
              e.preventDefault();
              handleDateSelect(focusedDate.getDate());
              return;
           case 'PageUp':
              e.preventDefault();
              changeMonth(-1);
              return;
           case 'PageDown':
              e.preventDefault();
              changeMonth(1);
              return;
           default:
              return;
        }
        
        setFocusedDate(newFocus);
        // If we navigated to a different month, switch the view
        if (newFocus.getMonth() !== viewDate.getMonth()) {
           setViewDate(newFocus);
        }
     } else {
        // Year View Navigation
        const currentYearIndex = generateYearRange().indexOf(viewDate.getFullYear());
        const years = generateYearRange();
        let newYearIndex = currentYearIndex;

        switch(e.key) {
           case 'ArrowLeft':
              e.preventDefault();
              newYearIndex = Math.max(0, currentYearIndex - 1);
              break;
           case 'ArrowRight':
              e.preventDefault();
              newYearIndex = Math.min(years.length - 1, currentYearIndex + 1);
              break;
           case 'ArrowUp':
              e.preventDefault();
              newYearIndex = Math.max(0, currentYearIndex - 3);
              break;
           case 'ArrowDown':
              e.preventDefault();
              newYearIndex = Math.min(years.length - 1, currentYearIndex + 3);
              break;
           case 'Enter':
           case ' ':
              e.preventDefault();
              selectYear(years[currentYearIndex]);
              return;
           default:
              return;
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
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                Careers
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Join The <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">Elite.</span>
              </h1>
              <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 We are always looking for sharp minds. If you are passionate about finance and solving complex problems, this is your arena.
              </p>
           </div>
        </div>
      </section>

      <div className="py-20 px-4 md:px-6">
       <div className="container mx-auto max-w-7xl">
          <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
             
             {/* Left Column: Jobs & Application Form */}
             <div className="lg:col-span-2 space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-10">
                       <div className="p-2 bg-brand-moss/10 rounded-lg"><Briefcase className="text-brand-moss" size={24} /></div>
                       <h2 className="text-3xl font-heading font-bold text-brand-dark">Open Positions</h2>
                    </div>
                    
                    {[
                      { role: 'Audit Associate', exp: '1-2 Years', type: 'Full Time' },
                      { role: 'Articled Assistant', exp: 'Fresher', type: 'Internship' }
                    ].map((job, idx) => (
                      <div key={idx} className="p-10 bg-brand-surface rounded-[2rem] border border-brand-border hover:border-brand-moss hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                         <div className="flex justify-between items-start mb-4 relative z-10">
                            <h3 className="text-2xl text-brand-dark font-heading font-bold group-hover:text-brand-moss transition-colors">{job.role}</h3>
                            <span className="px-4 py-1 bg-brand-bg rounded-full text-brand-stone text-xs font-bold uppercase tracking-widest border border-brand-border group-hover:bg-brand-moss group-hover:text-white transition-colors">{job.type}</span>
                         </div>
                         <p className="text-brand-stone text-base mb-8 font-medium relative z-10">Mysuru, KA • Experience: {job.exp}</p>
                         <button 
                            onClick={() => handleApplyClick(job.role)}
                            className="flex items-center gap-2 text-brand-dark font-bold text-sm group-hover:gap-4 transition-all relative z-10 hover:text-brand-moss focus:outline-none"
                         >
                           Apply Now <ArrowRight size={16} />
                         </button>
                      </div>
                    ))}
                </div>

                {/* APPLICATION FORM SECTION (Moved Here) */}
                <div ref={formRef} className="pt-10">
                    <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
                       <div className="relative z-10">
                          <div className="text-center mb-12">
                             <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Application Form</span>
                             <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6">Submit Your Details</h2>
                             <p className="text-brand-stone font-medium text-lg">
                                Tell us about yourself.
                             </p>
                          </div>

                          <form 
                            action="https://formsubmit.co/mail@casagar.co.in" 
                            method="POST" 
                            className="space-y-8"
                          >
                            <input type="hidden" name="_subject" value={`Job Application: ${formData.fullName} - ${formData.position || 'General'}`} />
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_captcha" value="false" />

                            {/* Position Dropdown (Custom) */}
                            <div className="flex flex-col gap-2 relative" ref={posDropdownRef}>
                              <label id="position-label" className="text-xs font-bold text-brand-dark uppercase tracking-widest mb-2 ml-1">Position Applying For <span className="text-red-500">*</span></label>
                              <input type="hidden" name="position" value={formData.position} />
                              <button 
                                type="button"
                                aria-haspopup="listbox"
                                aria-expanded={isPosDropdownOpen}
                                aria-labelledby="position-label"
                                onClick={() => setIsPosDropdownOpen(!isPosDropdownOpen)}
                                onKeyDown={handlePosKeyDown}
                                className={`w-full bg-brand-bg border ${isPosDropdownOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group`}
                              >
                                <span className={formData.position ? "text-brand-dark font-heading font-bold text-lg" : "text-brand-stone/40 font-heading font-bold text-lg"}>
                                  {formData.position || "Select Position"}
                                </span>
                                <ChevronDown size={20} className={`text-brand-stone transition-transform duration-300 ${isPosDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                              </button>

                              <div 
                                className={`absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-50 origin-top ${isPosDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                                role="listbox"
                              >
                                <div className="max-h-60 overflow-y-auto py-2">
                                  {positionOptions.map((option, idx) => (
                                    <div 
                                      key={idx}
                                      role="option"
                                      aria-selected={formData.position === option}
                                      onClick={() => handleDropdownSelect('position', option)}
                                      className={`px-6 py-3 cursor-pointer flex justify-between items-center group transition-colors ${posHighlightedIndex === idx ? 'bg-brand-bg text-brand-moss' : 'hover:bg-brand-bg text-brand-dark'}`}
                                    >
                                      <span className={`text-base font-medium ${formData.position === option ? 'text-brand-moss font-bold' : 'group-hover:text-brand-moss'}`}>
                                        {option}
                                      </span>
                                      {formData.position === option && <Check size={16} className="text-brand-moss" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Full Name */}
                               <div className="group">
                                  <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <User size={14} className="text-brand-moss"/> Full Name <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                     type="text" 
                                     id="fullName"
                                     name="fullName"
                                     value={formData.fullName}
                                     onChange={handleChange}
                                     required
                                     placeholder="John Doe"
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                                  />
                               </div>

                               {/* Father's Name */}
                               <div className="group">
                                  <label htmlFor="fatherName" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <User size={14} className="text-brand-moss"/> Father's Name <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                     type="text" 
                                     id="fatherName"
                                     name="fatherName"
                                     value={formData.fatherName}
                                     onChange={handleChange}
                                     required
                                     placeholder="Father's Full Name"
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                                  />
                               </div>

                               {/* Mobile */}
                               <div className="group">
                                  <label htmlFor="mobile" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <Phone size={14} className="text-brand-moss"/> Mobile Number <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                     type="tel" 
                                     id="mobile"
                                     name="mobile"
                                     value={formData.mobile}
                                     onChange={handleChange}
                                     required
                                     placeholder="+91 98765 43210"
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                                  />
                               </div>

                               {/* Email */}
                               <div className="group">
                                  <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <Mail size={14} className="text-brand-moss"/> Email Address <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                     type="email" 
                                     id="email"
                                     name="email"
                                     value={formData.email}
                                     onChange={handleChange}
                                     required
                                     placeholder="john@example.com"
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                                  />
                               </div>

                               {/* Date of Birth - Custom Calendar */}
                               <div className="group relative" ref={calendarRef}>
                                  <label htmlFor="dob-trigger" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <Calendar size={14} className="text-brand-moss"/> Date of Birth <span className="text-red-500">*</span>
                                  </label>
                                  
                                  {/* Hidden input for form submission */}
                                  <input type="hidden" name="dob" value={formData.dob} required />

                                  <button 
                                    type="button"
                                    id="dob-trigger"
                                    ref={calendarTriggerRef}
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    onKeyDown={handleTriggerKeyDown}
                                    className={`w-full bg-brand-bg border ${isCalendarOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group text-left`}
                                  >
                                    <span className={formData.dob ? "text-brand-dark font-medium" : "text-brand-stone/40"}>
                                      {formatDateDisplay(formData.dob)}
                                    </span>
                                    <Calendar size={20} className="text-brand-stone group-hover:text-brand-moss transition-colors" />
                                  </button>

                                  {/* Calendar Dropdown */}
                                  <div 
                                    ref={calendarPopupRef}
                                    tabIndex={-1}
                                    onKeyDown={handleCalendarKeyDown}
                                    className={`absolute top-full left-0 w-full md:w-80 mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-50 origin-top-left outline-none ${isCalendarOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                                  >
                                    {/* Calendar Header */}
                                    <div className="p-4 flex justify-between items-center border-b border-brand-border/50 bg-brand-bg/50">
                                       <button 
                                         type="button" 
                                         onClick={() => changeMonth(-1)} 
                                         disabled={calendarView === 'years'}
                                         tabIndex={-1}
                                         className={`p-1 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`}
                                       >
                                          <ChevronLeft size={18} />
                                       </button>
                                       
                                       <button 
                                         type="button"
                                         onClick={() => setCalendarView(calendarView === 'days' ? 'years' : 'days')}
                                         tabIndex={-1}
                                         className="font-heading font-bold text-brand-dark hover:text-brand-moss transition-colors"
                                       >
                                          {calendarView === 'days' 
                                            ? `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`
                                            : 'Select Year'
                                          }
                                       </button>

                                       <button 
                                         type="button" 
                                         onClick={() => changeMonth(1)}
                                         disabled={calendarView === 'years'}
                                         tabIndex={-1}
                                         className={`p-1 hover:bg-brand-moss hover:text-white rounded-lg transition-colors ${calendarView === 'years' ? 'opacity-0 pointer-events-none' : ''}`}
                                       >
                                          <ChevronRight size={18} />
                                       </button>
                                    </div>

                                    {/* Calendar Body */}
                                    <div className="p-4">
                                      {calendarView === 'days' ? (
                                        <>
                                          {/* Weekdays */}
                                          <div className="grid grid-cols-7 mb-2">
                                            {daysOfWeek.map(d => (
                                              <div key={d} className="text-center text-xs font-bold text-brand-stone uppercase tracking-wide py-1">
                                                {d}
                                              </div>
                                            ))}
                                          </div>
                                          {/* Days Grid */}
                                          <div className="grid grid-cols-7 gap-1">
                                            {/* Empty slots for start of month */}
                                            {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                                              <div key={`empty-${i}`} />
                                            ))}
                                            
                                            {/* Actual Days */}
                                            {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                              const day = i + 1;
                                              const currentDateString = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
                                              const selectedDateString = formData.dob ? new Date(formData.dob).toDateString() : '';
                                              const isSelected = currentDateString === selectedDateString;
                                              
                                              // Determine if this day is focused by keyboard
                                              const currentDayObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                              const isFocused = currentDayObj.toDateString() === focusedDate.toDateString();

                                              return (
                                                <button
                                                  key={day}
                                                  type="button"
                                                  onClick={() => handleDateSelect(day)}
                                                  tabIndex={-1}
                                                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center mx-auto transition-all
                                                    ${isSelected 
                                                      ? 'bg-brand-moss text-white shadow-md' 
                                                      : isFocused 
                                                         ? 'bg-brand-bg text-brand-moss ring-1 ring-brand-moss' 
                                                         : 'text-brand-dark hover:bg-brand-bg hover:text-brand-moss'}
                                                  `}
                                                >
                                                  {day}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </>
                                      ) : (
                                        /* Year Selector */
                                        <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2 no-scrollbar">
                                           {generateYearRange().map(year => (
                                              <button 
                                                key={year}
                                                type="button"
                                                onClick={() => selectYear(year)}
                                                tabIndex={-1}
                                                className={`py-2 px-1 rounded-xl text-sm font-medium transition-colors ${viewDate.getFullYear() === year ? 'bg-brand-moss text-white' : 'hover:bg-brand-bg text-brand-dark'}`}
                                              >
                                                {year}
                                              </button>
                                           ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                               </div>

                               {/* Qualification */}
                               <div className="group">
                                  <label htmlFor="qualification" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <BookOpen size={14} className="text-brand-moss"/> Qualification <span className="text-red-500">*</span>
                                  </label>
                                  <input 
                                     type="text" 
                                     id="qualification"
                                     name="qualification"
                                     value={formData.qualification}
                                     onChange={handleChange}
                                     required
                                     placeholder="e.g. B.Com, CA Inter, MBA"
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                                  />
                               </div>

                               {/* Experience Dropdown (Custom) */}
                               <div className="group relative" ref={expDropdownRef}>
                                  <label id="experience-label" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <Briefcase size={14} className="text-brand-moss"/> Years of Experience <span className="text-red-500">*</span>
                                  </label>
                                  <input type="hidden" name="experience" value={formData.experience} />
                                  
                                  <button 
                                    type="button"
                                    aria-haspopup="listbox"
                                    aria-expanded={isExpDropdownOpen}
                                    aria-labelledby="experience-label"
                                    onClick={() => setIsExpDropdownOpen(!isExpDropdownOpen)}
                                    onKeyDown={handleExpKeyDown}
                                    className={`w-full bg-brand-bg border ${isExpDropdownOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-moss/50 transition-all flex justify-between items-center group text-left`}
                                  >
                                    <span className={formData.experience ? "text-brand-dark font-medium" : "text-brand-stone/40"}>
                                      {formData.experience || "Select Experience"}
                                    </span>
                                    <ChevronDown size={18} className={`text-brand-stone transition-transform duration-300 ${isExpDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                                  </button>

                                  <div 
                                    className={`absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-50 origin-top ${isExpDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                                    role="listbox"
                                  >
                                    <div className="max-h-60 overflow-y-auto py-2">
                                      {experienceOptions.map((option, idx) => (
                                        <div 
                                          key={idx}
                                          role="option"
                                          aria-selected={formData.experience === option}
                                          onClick={() => handleDropdownSelect('experience', option)}
                                          className={`px-6 py-3 cursor-pointer flex justify-between items-center group transition-colors ${expHighlightedIndex === idx ? 'bg-brand-bg text-brand-moss' : 'hover:bg-brand-bg text-brand-dark'}`}
                                        >
                                          <span className={`text-base font-medium ${formData.experience === option ? 'text-brand-moss font-bold' : 'group-hover:text-brand-moss'}`}>
                                            {option}
                                          </span>
                                          {formData.experience === option && <Check size={16} className="text-brand-moss" />}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                               </div>

                               {/* Previous Companies */}
                               <div className="group md:col-span-2">
                                  <label htmlFor="previousCompanies" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3">
                                     <Building size={14} className="text-brand-moss"/> Companies Previously Worked At
                                  </label>
                                  <textarea 
                                     id="previousCompanies"
                                     name="previousCompanies"
                                     value={formData.previousCompanies}
                                     onChange={handleChange}
                                     rows={3}
                                     placeholder="List your previous employers..."
                                     className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all resize-none"
                                  ></textarea>
                               </div>
                            </div>

                            <button 
                               type="submit" 
                               className="w-full py-5 bg-brand-dark text-white font-heading font-bold text-lg rounded-full hover:bg-brand-moss transition-all duration-300 shadow-xl hover:shadow-brand-moss/30 flex justify-center items-center gap-2 group"
                            >
                               Submit Application <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <p className="text-center text-xs text-brand-stone font-medium mt-4">
                               By submitting this form, you agree to our Privacy Policy.
                            </p>
                          </form>
                       </div>
                    </div>
                </div>
             </div>
             
             {/* Right Column: Sticky Sidebar */}
             <div className="lg:col-span-1">
                <div 
                  ref={sidebarRef}
                  className="bg-brand-dark text-brand-surface p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden will-change-transform"
                  // Inline styles removed to let JS handle transform fully
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[60px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-heading font-bold mb-8">Why Join Us?</h3>
                    <ul className="space-y-6 text-brand-surface/80 text-lg font-medium">
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Direct Expert Mentorship</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Diverse Corporate Exposure</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Continuous Learning Culture</li>
                       <li className="flex gap-4 items-center"><span className="w-2 h-2 bg-brand-moss rounded-full shadow-glow"></span>Competitive Compensation</li>
                    </ul>
                  </div>
                </div>
             </div>
          </div>

       </div>
      </div>
    </div>
  );
};

export default Careers;
