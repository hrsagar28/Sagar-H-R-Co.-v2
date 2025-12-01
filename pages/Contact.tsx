
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Building, Clock } from 'lucide-react';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useFormValidation, useToast, useRateLimit } from '../hooks';
import { createFormSchema, required, email, indianPhone } from '../utils/formValidation';
import { apiClient, ApiError } from '../utils/api';
import { sanitizeInput } from '../utils/sanitize';
import { logger } from '../utils/logger';
import CustomDropdown from '../components/forms/CustomDropdown';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  subject: string;
  message: string;
}

const contactSchema = createFormSchema<ContactFormData>({
  name: [required('Name is required')],
  email: [required('Email is required'), email()],
  phone: [required('Phone is required'), indianPhone()],
  message: [required('Message is required')]
});

const Contact: React.FC = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { canSubmit, recordAttempt, timeUntilReset } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    storageKey: 'contact_form_limit'
  });

  const { values, handleChange, errors, validate, setValues } = useFormValidation<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    subject: '',
    message: ''
  }, {
    validationSchema: contactSchema,
    validateOnChange: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      addToast(`Please wait ${timeUntilReset}s before retrying.`, 'error');
      return;
    }

    if (validate()) {
      setIsSubmitting(true);

      try {
        await apiClient.post(CONTACT_INFO.formEndpoint, {
            name: sanitizeInput(values.name),
            email: sanitizeInput(values.email),
            phone: sanitizeInput(values.phone),
            company: sanitizeInput(values.companyName),
            subject: sanitizeInput(values.subject) || 'Contact Form Inquiry',
            message: sanitizeInput(values.message),
            _subject: `New Inquiry: ${sanitizeInput(values.name)}`
        });

        setIsSuccess(true);
        recordAttempt();
        setValues({ name: '', email: '', phone: '', companyName: '', subject: '', message: '' });
        addToast('Message sent successfully!', 'success');

      } catch (error) {
        logger.error('Contact form error', error);
        let msg = 'Failed to send message. Please try again.';
        if (error instanceof ApiError) {
            if (error.code === 'NETWORK_ERROR') msg = "Network unavailable. Please check your connection.";
            else if (error.code === 'TIMEOUT') msg = "Request timed out.";
        }
        addToast(msg, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
        addToast('Please correct the errors in the form.', 'error');
    }
  };

  const serviceOptions = [
    ...SERVICES.map(s => s.title),
    "Other"
  ];

  return (
    <div className="bg-brand-bg min-h-screen">
      <SEO 
        title={`Contact Us | ${CONTACT_INFO.name}`}
        description="Get in touch with us for expert financial advice. Visit our office in Mysuru or contact us via phone/email."
      />
      
      <PageHero
        tag="Get in Touch"
        title="Start the"
        subtitle="Conversation."
        description="Whether you have a specific question or need comprehensive advisory, we are here to help."
      />

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        
        {/* Main Grid: Info Card & Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12 md:mb-20 items-start">
          
          {/* Left Column: Contact Info (Dark Theme) - Sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal width="100%">
               <div className="bg-brand-dark text-brand-surface p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="absolute inset-0 bg-noise opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

                  <div className="relative z-10">
                     <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Contact Details</span>
                     <h2 className="text-2xl font-heading font-bold text-white mb-8">
                       Let's discuss your <br/> <span className="text-white/60">financial future.</span>
                     </h2>

                     <div className="space-y-6">
                       {/* Office */}
                       <div className="flex items-start gap-5 group">
                          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-brand-dark transition-all duration-300 border border-white/5 shrink-0">
                             <MapPin size={18} />
                          </div>
                          <div>
                             <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Our Office</h4>
                             <address className="not-italic text-gray-300 font-medium leading-relaxed text-sm">
                               {CONTACT_INFO.address.street},<br/>
                               {CONTACT_INFO.address.city} - {CONTACT_INFO.address.zip}
                             </address>
                          </div>
                       </div>

                       {/* Email */}
                       <div className="flex items-start gap-5 group">
                          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-brand-dark transition-all duration-300 border border-white/5 shrink-0">
                             <Mail size={18} />
                          </div>
                          <div>
                             <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Email Us</h4>
                             <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-300 hover:text-white transition-colors font-medium break-all text-sm">
                               {CONTACT_INFO.email}
                             </a>
                          </div>
                       </div>

                       {/* Phone */}
                       <div className="flex items-start gap-5 group">
                          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-brand-dark transition-all duration-300 border border-white/5 shrink-0">
                             <Phone size={18} />
                          </div>
                          <div>
                             <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Call Us</h4>
                             <a href={`tel:${CONTACT_INFO.phone.value}`} className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                               {CONTACT_INFO.phone.display}
                             </a>
                          </div>
                       </div>

                       {/* Working Hours */}
                       <div className="flex items-start gap-5 group">
                          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-brand-dark transition-all duration-300 border border-white/5 shrink-0">
                             <Clock size={18} />
                          </div>
                          <div>
                             <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Working Hours</h4>
                             <p className="text-gray-300 font-medium text-sm">
                               {CONTACT_INFO.hours.display}
                             </p>
                          </div>
                       </div>
                     </div>
                  </div>
               </div>
            </Reveal>
          </div>

          {/* Right Column: Contact Form (Light Theme) */}
          <Reveal className="lg:col-span-8" delay={0.1} width="100%">
            <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border h-full shadow-lg flex flex-col justify-center">
              {isSuccess ? (
                <div className="text-center py-10 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-brand-dark mb-4">Message Sent!</h3>
                  <p className="text-brand-stone mb-8 text-lg font-medium">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-brand-moss font-bold hover:underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-2">
                     <h3 className="text-3xl font-heading font-bold text-brand-dark">Send a Message</h3>
                     <p className="text-brand-stone font-medium mt-2">Fill out the form below and we will get back to you.</p>
                  </div>
                  
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2 ml-1">Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        value={values.name} 
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full bg-brand-bg border ${errors.name ? 'border-red-500' : 'border-brand-border'} rounded-2xl p-4 focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all`}
                        placeholder="Your Name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                    </div>
                    <div className="group">
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2 ml-1">Phone <span className="text-red-500">*</span></label>
                      <input 
                        type="tel"
                        id="phone"
                        name="phone" 
                        value={values.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full bg-brand-bg border ${errors.phone ? 'border-red-500' : 'border-brand-border'} rounded-2xl p-4 focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all`}
                        placeholder="Mobile Number"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Row 2: Email & Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2 ml-1">Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full bg-brand-bg border ${errors.email ? 'border-red-500' : 'border-brand-border'} rounded-2xl p-4 focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all`}
                        placeholder="email@company.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>
                    
                    <div className="group">
                      <label htmlFor="companyName" className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2 ml-1">Company Name</label>
                      <input 
                        type="text" 
                        id="companyName"
                        name="companyName"
                        value={values.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-2xl p-4 focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  {/* Row 3: Subject (Full Width) */}
                  <div className="w-full">
                    <CustomDropdown
                      label="Subject"
                      name="subject"
                      value={values.subject}
                      options={serviceOptions}
                      onChange={(name, val) => handleChange(name as keyof ContactFormData, val)}
                      placeholder="Select a topic"
                    />
                  </div>

                  {/* Row 4: Message */}
                  <div className="group">
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-brand-dark mb-2 ml-1">Message <span className="text-red-500">*</span></label>
                    <textarea 
                      id="message"
                      rows={4}
                      name="message"
                      value={values.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={`w-full bg-brand-bg border ${errors.message ? 'border-red-500' : 'border-brand-border'} rounded-2xl p-4 focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all resize-none`}
                      placeholder="How can we help you?"
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1 ml-1">{errors.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !canSubmit}
                    className="w-full bg-brand-dark text-white font-bold py-5 rounded-2xl hover:bg-brand-moss transition-all shadow-xl shadow-brand-dark/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-lg mt-4"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Sending...
                        </>
                    ) : (
                        <>
                            Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>

        {/* Map Section */}
        <Reveal variant="scale" delay={0.2} width="100%">
            <div 
              className="w-full h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border border-brand-border grayscale group relative transition-all duration-700 hover:grayscale-0"
              data-hide-cursor="true"
            >
               <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 bg-brand-surface/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-brand-border/50 shadow-lg pointer-events-none">
                  <div className="flex items-center gap-3 mb-1">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">Our Location</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-brand-dark">{CONTACT_INFO.name}</h3>
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
                  className="w-full h-full border-0"
                  loading="lazy"
               ></iframe>
               
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-dark/20 to-transparent opacity-50"></div>
            </div>
        </Reveal>

      </div>
    </div>
  );
};

export default Contact;
