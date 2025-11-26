import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Mail, Phone, ChevronDown, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SERVICES } from '../constants';
import { CONTACT_INFO } from '../config/contact';
import Reveal from '../components/Reveal';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const subjectOptions = [
    ...SERVICES.map(s => s.title),
    "Other Inquiry"
  ];

  const handleOptionClick = (option: string) => {
    setSubject(option);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isDropdownOpen && highlightedIndex >= 0) {
          handleOptionClick(subjectOptions[highlightedIndex]);
        } else {
          setIsDropdownOpen(!isDropdownOpen);
          if (!isDropdownOpen) setHighlightedIndex(0);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => (prev < subjectOptions.length - 1 ? prev + 1 : prev));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isDropdownOpen) {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      } else if (e.key === 'Tab') {
         if(isDropdownOpen) setIsDropdownOpen(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if field is filled, it's a bot
    if (honeypot) {
        return; 
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
        const response = await fetch("https://formsubmit.co/ajax/mail@casagar.co.in", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                company: formData.company,
                phone: formData.phone,
                email: formData.email,
                subject: subject,
                message: formData.message,
                _subject: `New Inquiry: ${subject || 'General'}`
            })
        });

        if (response.ok) {
            setSubmitStatus('success');
            setFormData({ name: '', company: '', phone: '', email: '', message: '' });
            setSubject('');
        } else {
            setSubmitStatus('error');
        }
    } catch (error) {
        setSubmitStatus('error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "AccountingService",
      "name": CONTACT_INFO.name,
      "telephone": CONTACT_INFO.phone.value,
      "email": CONTACT_INFO.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": CONTACT_INFO.address.street,
        "addressLocality": CONTACT_INFO.address.city,
        "postalCode": CONTACT_INFO.address.zip,
        "addressCountry": "IN"
      }
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`Contact ${CONTACT_INFO.name} | CA Firm in Mysuru`}
        description={`Get in touch with ${CONTACT_INFO.name} for expert financial consultation. Located in Mysuru. Call or email us today for Audit, Tax, and Advisory services.`}
        schema={schema}
      />
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8">
                    <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                    Get In Touch
                </div>
              </Reveal>
              <h1 className="font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 text-6xl md:text-8xl lg:text-9xl">
                <Reveal variant="reveal-mask" delay={0.1}>
                   <span className="block">Let's</span>
                </Reveal>
                <Reveal variant="reveal-mask" delay={0.25}>
                   <span className="block font-serif italic font-normal text-brand-stone opacity-60">Connect.</span>
                </Reveal>
              </h1>
              <Reveal delay={0.4}>
                <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl">
                    Ready to optimize your financial strategy? Reach out to us for a consultation.
                </p>
              </Reveal>
           </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="py-24 px-4 md:px-8">
        <div className="container mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 mb-24">
            
            {/* Left Column: Contact Info */}
            <Reveal variant="fade-up">
              <div className="h-full">
                <div className="bg-brand-surface p-12 md:p-20 rounded-[3rem] border border-brand-border shadow-xl relative overflow-hidden group hover:border-brand-moss/50 transition-colors duration-500 h-full flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-brand-moss/5 rounded-full blur-[80px] pointer-events-none"></div>
                   <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
                   
                   <div className="relative z-10 space-y-12">
                      <div>
                         <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-10 border-b border-brand-border pb-8">Contact Details</h3>
                         
                         <div className="space-y-10">
                            <div className="flex items-start gap-6 group/item">
                               <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                  <MapPin size={28} />
                               </div>
                               <div>
                                  <h4 className="text-brand-dark font-bold mb-2 text-xl md:text-2xl">Visit Us</h4>
                                  <p className="text-brand-stone font-medium leading-relaxed text-lg">
                                     {CONTACT_INFO.address.street},<br />
                                     {CONTACT_INFO.address.city} - {CONTACT_INFO.address.zip}
                                  </p>
                               </div>
                            </div>

                            <div className="flex items-start gap-6 group/item">
                               <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                  <Mail size={28} />
                               </div>
                               <div>
                                  <h4 className="text-brand-dark font-bold mb-2 text-xl md:text-2xl">Email</h4>
                                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-brand-stone font-medium hover:text-brand-moss transition-colors block break-all text-lg">{CONTACT_INFO.email}</a>
                               </div>
                            </div>

                            <div className="flex items-start gap-6 group/item">
                               <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                  <Phone size={28} />
                               </div>
                               <div>
                                  <h4 className="text-brand-dark font-bold mb-2 text-xl md:text-2xl">Call</h4>
                                  <a href={`tel:${CONTACT_INFO.phone.value}`} className="text-brand-stone font-medium hover:text-brand-moss transition-colors text-lg">{CONTACT_INFO.phone.display}</a>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </Reveal>

            {/* Right Column: Form */}
            <Reveal variant="fade-up" delay={0.2}>
              <div className="bg-brand-surface p-12 md:p-20 rounded-[3rem] border border-brand-border shadow-2xl shadow-brand-dark/5 min-h-[600px] flex flex-col justify-center">
                {submitStatus === 'success' ? (
                  <div className="text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-brand-moss text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-moss/30">
                      <Check size={48} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">Message Sent!</h3>
                    <p className="text-xl text-brand-stone font-medium max-w-md mx-auto mb-10">
                      Thank you for reaching out. We have received your inquiry and will get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setSubmitStatus('idle')}
                      className="px-8 py-4 bg-brand-bg border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-moss hover:text-white transition-all duration-300"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-10">Send a message</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Honeypot Field */}
                      <input 
                        type="text" 
                        name="_honeypot" 
                        style={{ display: 'none' }} 
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div className="group">
                          <label htmlFor="name" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input 
                            id="name"
                            name="name" 
                            type="text" 
                            required 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-brand-bg border border-brand-border py-5 px-8 rounded-2xl text-brand-dark text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all placeholder:text-brand-stone/40"
                            placeholder="John Doe" 
                          />
                        </div>

                        {/* Company */}
                        <div className="group">
                          <label htmlFor="company" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                            Company Name
                          </label>
                          <input 
                            id="company"
                            name="company" 
                            type="text" 
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full bg-brand-bg border border-brand-border py-5 px-8 rounded-2xl text-brand-dark text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all placeholder:text-brand-stone/40"
                            placeholder="Acme Corp" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Phone */}
                        <div className="group">
                          <label htmlFor="phone" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input 
                            id="phone" 
                            name="phone"
                            type="tel" 
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-brand-bg border border-brand-border py-5 px-8 rounded-2xl text-brand-dark text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all placeholder:text-brand-stone/40"
                            placeholder="+91..." 
                          />
                        </div>

                        {/* Email */}
                        <div className="group">
                          <label htmlFor="email" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                            Email
                          </label>
                          <input 
                            id="email" 
                            name="email"
                            type="email" 
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-brand-bg border border-brand-border py-5 px-8 rounded-2xl text-brand-dark text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all placeholder:text-brand-stone/40"
                            placeholder="john@company.com" 
                          />
                        </div>
                      </div>
                      
                      {/* Dropdown */}
                      <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
                        <label id="subject-label" className="block text-xs font-bold text-brand-dark uppercase tracking-widest ml-1 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input type="hidden" name="subject" value={subject} />

                        <button 
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded={isDropdownOpen}
                          aria-labelledby="subject-label"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          onKeyDown={handleKeyDown}
                          className={`w-full bg-brand-bg border ${isDropdownOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-5 px-8 rounded-2xl text-brand-dark focus:outline-none transition-all flex justify-between items-center group hover:border-brand-moss/50 text-lg`}
                        >
                          <span className={subject ? "text-brand-dark font-medium" : "text-brand-stone/40"}>
                            {subject || "Select a Topic"}
                          </span>
                          <ChevronDown size={20} className={`text-brand-stone transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                        </button>

                        <div 
                          className={`absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-popover origin-top ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                          role="listbox"
                        >
                          <div className="max-h-60 overflow-y-auto py-2">
                            {subjectOptions.map((option, idx) => (
                              <div 
                                key={idx}
                                role="option"
                                aria-selected={subject === option}
                                onClick={() => handleOptionClick(option)}
                                className={`px-8 py-4 cursor-pointer flex justify-between items-center group transition-colors ${highlightedIndex === idx ? 'bg-brand-bg text-brand-moss' : 'hover:bg-brand-bg text-brand-dark'}`}
                              >
                                <span className={`text-base md:text-lg font-medium ${subject === option ? 'text-brand-moss font-bold' : 'group-hover:text-brand-moss'}`}>
                                  {option}
                                </span>
                                {subject === option && <Check size={20} className="text-brand-moss" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Textarea */}
                      <div className="group pt-2">
                        <label htmlFor="message" className="block text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                          id="message" 
                          name="message"
                          rows={5} 
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-brand-bg border border-brand-border py-5 px-8 rounded-2xl text-brand-dark text-lg focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all resize-none placeholder:text-brand-stone/40"
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>

                      {submitStatus === 'error' && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                          <AlertCircle size={20} />
                          <span className="text-sm font-medium">Something went wrong. Please try again later.</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`
                          mt-6 w-full relative overflow-hidden px-8 py-6 rounded-full font-bold text-xl tracking-wide 
                          flex items-center justify-center gap-4 group bg-brand-dark text-white shadow-xl 
                          transition-all duration-300
                          ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:shadow-2xl'}
                        `}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span className="relative z-10 group-hover:translate-x-[-4px] transition-transform duration-300">Send Message</span>
                            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                            {/* Hover Fill Effect */}
                            <div className="absolute inset-0 bg-brand-moss translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-premium"></div>
                          </>
                        )}
                      </button>
                      
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="px-2 md:px-4 pb-4">
          <Reveal variant="scale" delay={0.4}>
            <div className="w-full rounded-[3rem] overflow-hidden border border-brand-border shadow-xl relative bg-brand-surface h-[500px] md:h-[700px] group">
               <div className="absolute top-8 right-8 md:top-12 md:right-12 z-10 bg-brand-surface/90 backdrop-blur-md px-8 py-5 rounded-3xl border border-brand-border/50 shadow-lg pointer-events-none">
                  <div className="flex items-center gap-3 mb-1">
                     <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-bold uppercase tracking-widest text-brand-dark">Our Location</span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-brand-dark">{CONTACT_INFO.name}</h3>
               </div>

               <iframe 
                  title={`${CONTACT_INFO.name} Location`}
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={CONTACT_INFO.geo.mapEmbedUrl}
                  className="w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 ease-in-out"
                  loading="lazy"
               ></iframe>
            </div>
          </Reveal>
      </section>

    </div>
  );
};

export default Contact;