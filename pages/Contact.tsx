
import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Building, Clock } from 'lucide-react';
import { PageHero } from '../components/hero';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { CONTACT_INFO, SERVICES } from '../constants';
import { useFormValidation, useToast, useRateLimit } from '../hooks';
import { createFormSchema, required, email, indianPhone } from '../utils/formValidation';
import { apiClient, ApiError } from '../utils/api';
import { sanitizeInput } from '../utils/sanitize';
import { logger } from '../utils/logger';
import CustomDropdown from '../components/forms/CustomDropdown';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { BigCTA } from '../components/ui/BigCTA';

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
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isSuccess && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [isSuccess]);

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
    validateOnChange: true
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
        const formElement = e.target as HTMLFormElement;
        const formData = new FormData(formElement);

        await apiClient.post(CONTACT_INFO.formEndpoint, {
          name: sanitizeInput(values.name),
          email: sanitizeInput(values.email),
          phone: sanitizeInput(values.phone),
          company: sanitizeInput(values.companyName),
          subject: sanitizeInput(values.subject) || 'Contact Form Inquiry',
          message: sanitizeInput(values.message),
          _subject: `New Inquiry: ${sanitizeInput(values.name)}`,
          _honey: formData.get('_honey') || '',
          _captcha: formData.get('_captcha') || 'false',
          _template: formData.get('_template') || 'table'
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
    <div data-zone="editorial" className="zone-bg min-h-screen">
      <SEO
        title={`Contact Us | ${CONTACT_INFO.name}`}
        description="Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp."
        canonicalUrl="https://casagar.co.in/contact"
        ogImage="https://casagar.co.in/og-contact.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ]}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "AccountingService",
            "@id": "https://casagar.co.in/#organization",
            "name": CONTACT_INFO.name,
            "image": "https://casagar.co.in/logo.png",
            "telephone": CONTACT_INFO.phone.value,
            "email": CONTACT_INFO.email,
            "url": "https://casagar.co.in",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": CONTACT_INFO.address.street,
              "addressLocality": CONTACT_INFO.address.city,
              "addressRegion": CONTACT_INFO.address.state,
              "postalCode": CONTACT_INFO.address.zip,
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": CONTACT_INFO.geo.latitude,
              "longitude": CONTACT_INFO.geo.longitude
            },
            "openingHours": CONTACT_INFO.hours.value,
            "sameAs": [
              CONTACT_INFO.social.linkedin,
              CONTACT_INFO.social.whatsapp
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "url": "https://casagar.co.in/contact",
            "name": "Contact Sagar H R & Co.",
            "mainEntity": { "@id": "https://casagar.co.in/#organization" }
          }
        ]}
      />

      <PageHero
        variant="directory"
        eyebrow="§ Contact / 06 · Direct Lines"
        title={<>Begin a <em>conversation</em>.</>}
        coordinates="12.3004° N · 76.6518° E"
        contacts={[
          { label: "By Letter", value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
          { label: "By Voice", value: CONTACT_INFO.phone.value, href: `tel:${CONTACT_INFO.phone.value}` },
          { label: "By Visit", value: `${CONTACT_INFO.address.street}, ${CONTACT_INFO.address.city} - ${CONTACT_INFO.address.zip}` }
        ]}
        ghostWord="Engage."
      />

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">

        {/* Main Grid: Info Card & Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12 md:mb-20 items-start">

          {/* Left Column: Contact Info (Dark Theme) - Sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <Reveal width="100%">
              <div className="zone-bg text-brand-surface p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-moss opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-noise opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10">
                  <span className="text-[#4ADE80] font-bold tracking-widest uppercase text-xs mb-4 block">Contact Details</span>
                  <h2 className="text-2xl font-heading font-bold text-white mb-8">
                    Let's discuss your <br /> <span className="text-white/60">financial future.</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Office */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:zone-text transition-all duration-300 border border-white/5 shrink-0">
                        <MapPin size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Our Office</h3>
                        <address className="not-italic text-gray-300 font-medium leading-relaxed text-sm">
                          {CONTACT_INFO.address.street},<br />
                          {CONTACT_INFO.address.city} - {CONTACT_INFO.address.zip}
                        </address>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:zone-text transition-all duration-300 border border-white/5 shrink-0">
                        <Mail size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Email Us</h3>
                        <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-300 hover:text-white transition-colors font-medium break-words text-sm">
                          {CONTACT_INFO.email}
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:zone-text transition-all duration-300 border border-white/5 shrink-0">
                        <Phone size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Call Us</h3>
                        <a href={`tel:${CONTACT_INFO.phone.value}`} className="text-gray-300 hover:text-white transition-colors font-medium text-sm">
                          {CONTACT_INFO.phone.display}
                        </a>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-start gap-5 group">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:zone-text transition-all duration-300 border border-white/5 shrink-0">
                        <Clock size={18} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Working Hours</h3>
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
            <div className="zone-surface p-8 md:p-12 rounded-[2.5rem] border zone-border h-full shadow-lg flex flex-col justify-center">
              {isSuccess ? (
                <div role="status" aria-live="polite" className="text-center py-10 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} aria-hidden="true" />
                  </div>
                  <h3 ref={successHeadingRef} tabIndex={-1} className="text-3xl font-heading font-bold zone-text mb-4">Message Sent!</h3>
                  <p className="zone-text-muted mb-8 text-lg font-medium">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-brand-moss font-bold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 rounded-md px-1"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* FormSubmit Config & Honeypot */}
                  <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />

                  <div className="mb-2">
                    <h3 className="text-3xl font-heading font-bold zone-text">Send a Message</h3>
                    <p className="zone-text-muted font-medium mt-2">Fill out the form below and we will get back to you.</p>
                  </div>

                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Name" name="name" required error={errors.name}>
                      <input
                        type="text"
                        value={values.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full zone-bg border rounded-2xl p-4 focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                        placeholder="Your Name"
                        autoComplete="name"
                      />
                    </FormField>
                    <FormField label="Phone" name="phone" required error={errors.phone}>
                      <input
                        type="tel"
                        value={values.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full zone-bg border rounded-2xl p-4 focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                        placeholder="Mobile Number"
                        autoComplete="tel"
                      />
                    </FormField>
                  </div>

                  {/* Row 2: Email & Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Email" name="email" required error={errors.email}>
                      <input
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full zone-bg border rounded-2xl p-4 focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                        placeholder="email@company.com"
                        autoComplete="email"
                      />
                    </FormField>

                    <FormField label="Company Name" name="companyName">
                      <input
                        type="text"
                        value={values.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full zone-bg border rounded-2xl p-4 focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                        placeholder="Company Name"
                        autoComplete="organization"
                      />
                    </FormField>
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
                  <FormField label="Message" name="message" required error={errors.message}>
                    <textarea
                      rows={4}
                      value={values.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="w-full zone-bg border rounded-2xl p-4 focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </FormField>

                  <BigCTA
                    type="submit"
                    disabled={isSubmitting || !canSubmit}
                    tone="moss" size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Sending...
                      </>
                    ) : (
                      <>
                        Send
                      </>
                    )}
                  </BigCTA>
                </form>
              )}
            </div>
          </Reveal>
        </div>

        {/* Map Section */}
        <Reveal variant="scale" delay={0.2} width="100%">
          <div
            className="-mx-4 w-[calc(100%+2rem)] md:mx-0 md:w-full h-[280px] md:h-[350px] rounded-none md:rounded-[3rem] overflow-hidden shadow-2xl border-0 md:border zone-border grayscale-0 md:grayscale group relative transition-all duration-700 hover:grayscale-0"
            data-hide-cursor="true"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:top-10 md:right-10 z-10 zone-surface/90 backdrop-blur-md px-6 py-4 rounded-2xl border zone-border/50 shadow-lg pointer-events-none w-max">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest zone-text">Our Location</span>
              </div>
              <h3 className="font-heading font-bold text-xl zone-text">{CONTACT_INFO.name}</h3>
            </div>

            <a 
              href={`https://maps.google.com/?q=${CONTACT_INFO.geo.latitude},${CONTACT_INFO.geo.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white text-black p-3 rounded-xl shadow-lg font-bold"
            >
              Get directions on Google Maps
            </a>
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


