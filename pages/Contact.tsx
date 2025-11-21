import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Mail, Phone, Clock, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { SERVICES } from '../constants';

const Contact: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      
      {/* UNIFIED HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 px-4 md:px-6 bg-brand-bg bg-grid relative overflow-hidden border-b border-brand-border/60">
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-white/50 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-brand-stone mb-8 animate-fade-in-up">
                <span className="w-1.5 h-1.5 bg-brand-moss rounded-full"></span>
                Get In Touch
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-brand-dark tracking-tighter leading-[0.9] mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Let's <br/>
                <span className="font-serif italic font-normal text-brand-stone opacity-60">Connect.</span>
              </h1>
              <p className="text-xl md:text-2xl text-brand-stone font-medium leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 Ready to optimize your financial strategy? Reach out to us for a consultation.
              </p>
           </div>
        </div>
      </section>

      <div className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            
            {/* Left Column: Contact Info */}
            <div>
              <div className="bg-brand-surface p-10 rounded-[2.5rem] border border-brand-border shadow-xl relative overflow-hidden group hover:border-brand-moss/50 transition-colors duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss/5 rounded-full blur-[60px] pointer-events-none"></div>
                 <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
                 
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-2xl font-heading font-bold text-brand-dark mb-6 border-b border-brand-border pb-6">Contact Details</h3>
                       
                       <div className="space-y-8">
                          <div className="flex items-start gap-5 group/item">
                             <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                <MapPin size={20} />
                             </div>
                             <div>
                                <h4 className="text-brand-dark font-bold mb-1 text-lg">Visit Us</h4>
                                <p className="text-brand-stone font-medium leading-relaxed">
                                   1479, 2nd Floor, Thyagaraja Road,<br />
                                   KR Mohalla, Mysuru - 570004
                                </p>
                             </div>
                          </div>

                          <div className="flex items-start gap-5 group/item">
                             <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                <Mail size={20} />
                             </div>
                             <div>
                                <h4 className="text-brand-dark font-bold mb-1 text-lg">Email</h4>
                                <a href="mailto:mail@casagar.co.in" className="text-brand-stone font-medium hover:text-brand-moss transition-colors block break-all">mail@casagar.co.in</a>
                             </div>
                          </div>

                          <div className="flex items-start gap-5 group/item">
                             <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                <Phone size={20} />
                             </div>
                             <div>
                                <h4 className="text-brand-dark font-bold mb-1 text-lg">Call</h4>
                                <a href="tel:+919482359455" className="text-brand-stone font-medium hover:text-brand-moss transition-colors">+91 94823 59455</a>
                             </div>
                          </div>

                          <div className="flex items-start gap-5 group/item">
                             <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-moss shrink-0 group-hover/item:bg-brand-moss group-hover/item:text-white transition-colors duration-300 shadow-sm">
                                <Clock size={20} />
                             </div>
                             <div>
                                <h4 className="text-brand-dark font-bold mb-1 text-lg">Working Hours</h4>
                                <p className="text-brand-stone font-medium text-sm leading-relaxed">
                                   Mon - Sat: 10:00 AM - 02:00 PM<br/>
                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 04:00 PM - 08:00 PM
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-brand-border shadow-2xl shadow-brand-dark/5">
              <h3 className="text-2xl font-heading font-bold text-brand-dark mb-8">Send a message</h3>
              
              <form 
                action="https://formsubmit.co/mail@casagar.co.in" 
                method="POST" 
                className="space-y-6 md:space-y-8"
              >
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value={`New Inquiry: ${subject || 'General'}`} />
                <input type="hidden" name="_honey" style={{display: 'none'}} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Name <span className="text-red-500">*</span></label>
                    <input 
                      id="name"
                      name="name" 
                      type="text" 
                      autoComplete="name" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-brand-bg border border-brand-border py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder-brand-stone/40" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="company" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Company Name</label>
                    <input 
                      id="company"
                      name="company" 
                      type="text" 
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleChange}
                      className="bg-brand-bg border border-brand-border py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder-brand-stone/40" 
                      placeholder="Acme Corp" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      id="phone" 
                      name="phone"
                      type="tel" 
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-brand-bg border border-brand-border py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder-brand-stone/40" 
                      placeholder="+91 98765 43210" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="email" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Email</label>
                    </div>
                    <input 
                      id="email" 
                      name="email"
                      type="email" 
                      autoComplete="email" 
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-brand-bg border border-brand-border py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all placeholder-brand-stone/40" 
                      placeholder="john@company.com" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
                  <label id="subject-label" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Subject <span className="text-red-500">*</span></label>
                  
                  <input type="hidden" name="subject" value={subject} />

                  <button 
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-labelledby="subject-label"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-brand-bg border ${isDropdownOpen ? 'border-brand-moss ring-1 ring-brand-moss' : 'border-brand-border'} py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:outline-none transition-all flex justify-between items-center group`}
                  >
                    <span className={subject ? "text-brand-dark font-medium" : "text-brand-stone/40"}>
                      {subject || "Select a Topic"}
                    </span>
                    <ChevronDown size={18} className={`text-brand-stone transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                  </button>

                  <div 
                    className={`absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-50 origin-top ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                    role="listbox"
                  >
                    <div className="max-h-60 overflow-y-auto py-2">
                      {subjectOptions.map((option, idx) => (
                        <div 
                          key={idx}
                          role="option"
                          aria-selected={subject === option}
                          onClick={() => handleOptionClick(option)}
                          className="px-6 py-3 hover:bg-brand-bg cursor-pointer flex justify-between items-center group transition-colors"
                        >
                          <span className={`text-sm md:text-base font-medium ${subject === option ? 'text-brand-moss font-bold' : 'text-brand-dark group-hover:text-brand-moss'}`}>
                            {option}
                          </span>
                          {subject === option && <Check size={16} className="text-brand-moss" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm text-brand-dark font-bold ml-2 uppercase tracking-wider text-[10px]">Message <span className="text-red-500">*</span></label>
                  <textarea 
                    id="message" 
                    name="message"
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-brand-bg border border-brand-border py-3 px-5 md:py-4 md:px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all resize-none placeholder-brand-stone/40" 
                    placeholder="How can we assist you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="mt-4 px-8 py-4 md:px-10 md:py-5 font-heading font-bold text-lg rounded-full transition-all duration-300 w-full shadow-xl flex justify-center items-center gap-2 group bg-brand-dark text-brand-inverse hover:bg-brand-moss hover:text-white shadow-brand-dark/10"
                >
                  Send Message <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-brand-border shadow-xl relative bg-brand-surface h-[400px] md:h-[500px] group">
             <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 bg-brand-surface/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-brand-border/50 shadow-lg pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold uppercase tracking-widest text-brand-dark">Our Location</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-brand-dark">Sagar H R & Co.</h3>
             </div>

             <iframe 
                title="Sagar H R & Co. Location"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src="https://maps.google.com/maps?q=12.300430367886586,76.65174852128196&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 ease-in-out"
                loading="lazy"
             ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;