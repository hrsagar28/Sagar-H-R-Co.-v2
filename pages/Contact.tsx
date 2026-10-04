import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import Honeypot from '../components/forms/Honeypot';
import { CONTACT_INFO } from '../constants';
import { useFormDraft, useFormValidation, useRateLimit, useToast } from '../hooks';
import { createFormSchema, email, indianPhone, required, validateForm, type FormSchema } from '../utils/formValidation';
import { ApiError } from '../utils/api';
import { submitToFormSubmit } from '../utils/formSubmit';
import { headerSafe, normalizeInput } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { ArrowRight } from '../components/redesign/icons';
import FormField, { fieldErrorProps } from '../components/redesign/FormField';
import { RD_HOURS_TABLE } from '../components/redesign/content';

// 2026 redesign of /contact. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet (components/redesign/redesign.css).

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  subjectOther: string;
  message: string;
}

const INITIAL_CONTACT: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  subjectOther: '',
  message: '',
};

const MESSAGE_MAX = 2000;
const OTHER_REQUIRED = 'Please tell us what it is about.';

// The subject choices. Each covers one or more service pages, so a service
// page's "Send us a message" (/contact?subject=<slug>) arrives with its choice
// already made. The submitted value is the label shown here.
const SUBJECT_CHIPS: { value: string; label: string; services: string[] }[] = [
  { value: 'GST', label: 'GST', services: ['gst'] },
  { value: 'Income tax', label: 'Income tax', services: ['income-tax', 'tds-and-tcs', 'nri-taxation'] },
  { value: 'A notice or appeal', label: 'A notice or appeal', services: ['notices-and-appeals'] },
  { value: 'Audit or a certificate', label: 'Audit or a certificate', services: ['audit', 'certificates'] },
  {
    value: 'Company, LLP or firm',
    label: 'Company, LLP or firm',
    services: ['company-law', 'partnership-firms-and-llps'],
  },
  { value: 'Trust or NPO', label: 'Trust or NPO', services: ['trusts-and-npos'] },
  {
    value: 'Business, loan or grant',
    label: 'Business, loan or grant',
    services: ['advisory', 'bank-loans-and-project-reports', 'startup-and-grant-support'],
  },
  { value: 'Bookkeeping or payroll', label: 'Bookkeeping or payroll', services: ['bookkeeping-and-payroll'] },
  { value: 'Other', label: 'Something else', services: [] },
];
const allowedSubjectOptions = new Set(SUBJECT_CHIPS.map((chip) => chip.value));

/** A subject choice from its value, or from the slug of a service it covers. */
const getAllowedSubject = (subject?: string | null) => {
  const value = subject || '';
  if (allowedSubjectOptions.has(value)) {
    return value;
  }
  return SUBJECT_CHIPS.find((chip) => chip.services.includes(value))?.value ?? '';
};

const normalizeContactValues = (data: Partial<ContactFormData>, fallback?: ContactFormData): ContactFormData => {
  const subject = getAllowedSubject(data.subject) || getAllowedSubject(fallback?.subject);

  return {
    ...INITIAL_CONTACT,
    ...fallback,
    ...data,
    subject,
    subjectOther: subject === 'Other' ? data.subjectOther || fallback?.subjectOther || '' : '',
  };
};

const contactSchema = createFormSchema<ContactFormData>({
  name: [required('Please enter your name.')],
  phone: [
    required('Please enter a mobile number we can call.'),
    indianPhone('Please enter a 10-digit Indian mobile number.'),
  ],
  email: [required('Please enter your email address.'), email('This email address looks incomplete. Please check it.')],
  message: [required('Please write a short message.')],
});

const CONTACT_FIELD_ORDER: (keyof ContactFormData)[] = ['name', 'phone', 'email', 'subjectOther', 'message'];
const fieldId = (field: keyof ContactFormData) => `contact-${field}`;

/** Error message for one field, given the whole form (the "Other" box depends on the subject). */
const checkField = (field: keyof ContactFormData, values: ContactFormData): string | undefined => {
  if (field === 'subjectOther') {
    return values.subject === 'Other' && !values.subjectOther.trim() ? OTHER_REQUIRED : undefined;
  }
  const validators = contactSchema[field];
  if (!validators) {
    return undefined;
  }
  return validateForm(values, { [field]: validators } as FormSchema<ContactFormData>)[field];
};

// Matches the textarea's min-height in redesign.css (four lines).
const MESSAGE_MIN_HEIGHT = 112;

const growTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = 'auto';
  element.style.height = `${Math.max(MESSAGE_MIN_HEIGHT, element.scrollHeight + 1)}px`;
};

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall back below
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) {
    throw new Error('Copy command was refused');
  }
};

// Office hours are in India time whatever the visitor's clock says.
const IST_WEEKDAY = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' });
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayInIndia = () => WEEKDAYS.indexOf(IST_WEEKDAY.format(new Date()));

const [ADDRESS_LINE_1, ADDRESS_LINE_2] = CONTACT_INFO.address.lines;
const ADDRESS_TO_COPY = `${CONTACT_INFO.name}, ${CONTACT_INFO.address.lines.join(', ')}`;

const errorProps = (field: keyof ContactFormData, error?: string) => fieldErrorProps(fieldId(field), error);

const Contact: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();
  const [initialSubject] = useState(() => getAllowedSubject(new URLSearchParams(location.search).get('subject')));
  // "Ask us this question" on the FAQ page arrives with the search text.
  const [prefill] = useState(() => {
    const question = (location.state as { faqQuestion?: unknown } | null)?.faqQuestion;
    return typeof question === 'string' && question.trim()
      ? `I could not find this in your FAQs: ${question.trim().slice(0, 300)}\n\n`
      : '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => new URLSearchParams(location.search).get('sent') === '1');
  const [sentName, setSentName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [today, setToday] = useState(weekdayInIndia);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  // Once a submit has been tried, empty required fields are flagged on blur too.
  const triedRef = useRef(false);

  const { canSubmit, recordAttempt, timeUntilReset } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    storageKey: 'contact_form_limit',
  });

  // Errors appear when a field is left, and update as it is corrected.
  const { values, handleChange, errors, setValues, setErrors } = useFormValidation<ContactFormData>(
    {
      ...INITIAL_CONTACT,
      subject: initialSubject,
      message: prefill,
    },
    { validationSchema: contactSchema },
  );

  const { loadDraft, clearDraft, lastSaved } = useFormDraft('contact_form_draft', values);

  const restoredDraft = useRef(false);
  useEffect(() => {
    if (restoredDraft.current) return;
    restoredDraft.current = true;
    void Promise.resolve(loadDraft()).then((draft) => {
      if (draft) {
        setValues((prev) => {
          const merged = normalizeContactValues(draft, prev);
          return prefill ? { ...merged, message: prev.message } : merged;
        });
      }
    });
  }, [loadDraft, setValues, prefill]);

  useEffect(() => {
    if (isSuccess && successHeadingRef.current) {
      const heading = successHeadingRef.current;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      try {
        heading.focus({ preventScroll: true });
      } catch {
        heading.focus();
      }

      const { top, bottom } = heading.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (top < 0 || bottom > viewportHeight) {
        heading.scrollIntoView({
          block: 'start',
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    }
  }, [isSuccess]);

  // /contact#write (the menu's "Send us a message", the FAQ's "Ask us this
  // question") goes straight to the form. Runs after RouteHandler's
  // scroll-to-top and its focus of #main-content.
  useEffect(() => {
    if (location.hash !== '#write') {
      return;
    }
    const timer = window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ block: 'start' });
      document.getElementById(fieldId('name'))?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  // Keep the "Today" mark right if the page is left open past midnight.
  useEffect(() => {
    const timer = window.setInterval(() => setToday(weekdayInIndia()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const updateSentParam = (sent: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (sent) {
      params.set('sent', '1');
    } else {
      params.delete('sent');
    }
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  };

  const setFieldError = (field: keyof ContactFormData, message?: string) => {
    setErrors((prev) => {
      if (prev[field] === message) {
        return prev;
      }
      const next = { ...prev };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const onFieldChange =
    (field: keyof ContactFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      if (event.target instanceof HTMLTextAreaElement) {
        growTextarea(event.target);
      }
      handleChange(field, value);
      if (errors[field]) {
        setFieldError(field, checkField(field, { ...values, [field]: value }));
      }
    };

  const onFieldBlur =
    (field: keyof ContactFormData) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.target.value.trim() || triedRef.current) {
        setFieldError(field, checkField(field, values));
      }
    };

  const onSubjectChange = (value: string) => {
    const subject = getAllowedSubject(value);
    setValues((prev) => ({
      ...prev,
      subject,
      subjectOther: subject === 'Other' ? prev.subjectOther : '',
    }));
    if (subject !== 'Other') {
      setFieldError('subjectOther', undefined);
    }
  };

  const handleCopy = async (text: string, what: string) => {
    try {
      await copyText(text);
      addToast(`${what} copied`, 'success');
    } catch {
      addToast('Could not copy. Please select it instead.', 'error');
    }
  };

  const handleSendAnother = () => {
    updateSentParam(false);
    setIsSuccess(false);
    triedRef.current = false;
    if (messageRef.current) {
      messageRef.current.style.height = '';
    }
    window.requestAnimationFrame(() => document.getElementById(fieldId('name'))?.focus());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // A filled honeypot means a bot, or a browser that autofilled the hidden
    // field. Either way the message isn't sent, but a person must not be left
    // with a Send button that seems to do nothing.
    if (honeypot) {
      logger.warn('Contact form: hidden spam-check field was filled', { form: 'contact' });
      addToast(`We could not send your message. Please email us directly at ${CONTACT_INFO.email}`, 'error');
      return;
    }

    if (!canSubmit) {
      addToast(`Please wait ${timeUntilReset}s before retrying.`, 'error');
      return;
    }

    triedRef.current = true;
    const validationErrors = validateForm(values, contactSchema);
    const otherError = checkField('subjectOther', values);

    if (Object.keys(validationErrors).length > 0 || otherError) {
      setErrors({
        ...validationErrors,
        ...(otherError ? { subjectOther: otherError } : {}),
      });
      const firstErrorField = CONTACT_FIELD_ORDER.find((field) =>
        field === 'subjectOther' ? otherError : validationErrors[field],
      );
      if (firstErrorField) {
        window.requestAnimationFrame(() => document.getElementById(fieldId(firstErrorField))?.focus());
      }
      addToast('Please check the highlighted fields.', 'error');
      return;
    }

    // CF-7: only count an attempt once the form is valid and we're about to hit
    // the network, so validation mistakes don't burn the client rate limit.
    recordAttempt();

    setIsSubmitting(true);

    try {
      await submitToFormSubmit({
        name: normalizeInput(values.name),
        email: headerSafe(values.email, 254),
        phone: headerSafe(values.phone, 30),
        company: normalizeInput(values.company),
        subject:
          headerSafe(values.subject === 'Other' ? values.subjectOther : values.subject) || 'Contact Form Inquiry',
        message: normalizeInput(values.message, { preserveLineBreaks: true }),
        _subject: `New Inquiry: ${headerSafe(values.name)}`,
        _honey: honeypot,
        _template: 'table',
      });

      setSentName(values.name.trim().split(/\s+/)[0] ?? '');
      updateSentParam(true);
      setIsSuccess(true);
      clearDraft();
      setValues({ ...INITIAL_CONTACT });
      triedRef.current = false;
    } catch (error) {
      logger.error('Contact form error', { error, form: 'contact', canSubmit, timeUntilReset });
      // CF-6: distinguish "wait a day" from "outage" from "bad connection", and
      // surface the function's own message where it is more specific.
      let msg = `Failed to send message. Please email us directly at ${CONTACT_INFO.email}`;
      if (error instanceof ApiError) {
        if (error.code === 'NETWORK_ERROR') {
          msg = 'Network unavailable. Please check your connection and try again.';
        } else if (error.code === 'TIMEOUT') {
          msg = 'The request timed out. Please check your connection and try again.';
        } else if (error.status === 429) {
          msg =
            error.message || `You've reached the submission limit. Please email us directly at ${CONTACT_INFO.email}`;
        } else if (error.status === 422 || error.status === 400) {
          msg =
            error.message ||
            `We couldn't verify your submission. Please refresh the page and try again, or email us at ${CONTACT_INFO.email}`;
        } else {
          msg =
            error.message ||
            `Our contact system is temporarily unavailable. Please email us directly at ${CONTACT_INFO.email}`;
        }
      }
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasDraftContent = Object.values(values).some((value) => value.trim());
  const successAnnouncement = isSuccess ? 'Message sent. We will get back to you within a working day.' : '';

  return (
    <div className="rd-page">
      <SEO
        title={`Contact Us | ${CONTACT_INFO.name}`}
        description="Contact Sagar H R & Co. in Mysuru for Audit, Tax, GST and Business Advisory. Visit our KR Mohalla office or reach us by phone, email or WhatsApp."
        canonicalUrl="https://casagar.co.in/contact"
        ogImage="https://casagar.co.in/og-contact.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'AccountingService',
            '@id': 'https://casagar.co.in/#organization',
            name: CONTACT_INFO.name,
            image: 'https://casagar.co.in/logo.png',
            telephone: CONTACT_INFO.phone.value,
            email: CONTACT_INFO.email,
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: CONTACT_INFO.phone.display.replace(/\s+/g, '-'),
                contactType: 'customer support',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi', 'kn'],
              },
              {
                '@type': 'ContactPoint',
                email: CONTACT_INFO.email,
                contactType: 'customer support',
              },
            ],
            url: 'https://casagar.co.in',
            address: {
              '@type': 'PostalAddress',
              streetAddress: CONTACT_INFO.address.street,
              addressLocality: CONTACT_INFO.address.city,
              addressRegion: CONTACT_INFO.address.state,
              postalCode: CONTACT_INFO.address.zip,
              addressCountry: 'IN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: CONTACT_INFO.geo.latitude,
              longitude: CONTACT_INFO.geo.longitude,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '10:00',
                closes: '20:00',
              },
            ],
            sameAs: [CONTACT_INFO.social.whatsapp],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: 'https://casagar.co.in/contact',
            name: 'Contact Sagar H R & Co.',
            mainEntity: { '@id': 'https://casagar.co.in/#organization' },
          },
        ]}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid pad">
          <div>
            <h1 className="rise">Contact us</h1>
            <p className="hsub rise d1">
              Call, WhatsApp or email us, or use the form below. We usually reply within a working day.
            </p>
          </div>
          <div className="rise d2">
            <div className="hline">
              <p className="lbl">Phone and WhatsApp</p>
              <a className="big tnum" href={`tel:${CONTACT_INFO.phone.value}`}>
                {CONTACT_INFO.phone.display}
              </a>
              <div className="acts">
                <a href={`tel:${CONTACT_INFO.phone.value}`}>Call</a>
                <a href={CONTACT_INFO.social.whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp<span className="vh"> (opens in a new tab)</span>
                </a>
                <button type="button" onClick={() => handleCopy(CONTACT_INFO.phone.display, 'Phone number')}>
                  Copy number
                </button>
              </div>
            </div>
            <div className="hline">
              <p className="lbl">Email</p>
              <a className="big sm" href={`mailto:${CONTACT_INFO.email}`}>
                {CONTACT_INFO.email}
              </a>
              <div className="acts">
                <a href={`mailto:${CONTACT_INFO.email}`}>Write an email</a>
                <button type="button" onClick={() => handleCopy(CONTACT_INFO.email, 'Email address')}>
                  Copy address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cwrap pad">
        <section className="seam panel fpanel" id="write" ref={formSectionRef} aria-labelledby="contact-form-heading">
          <p className="vh" role="status" aria-live="polite" aria-atomic="true">
            {successAnnouncement}
          </p>

          <div hidden={isSuccess}>
            <h2 id="contact-form-heading">Send us a message</h2>
            <p className="fintro">
              Tell us briefly what you need. Fields marked <span className="req-key">*</span> are required.
            </p>
            <form className="rd-form" onSubmit={handleSubmit} noValidate>
              <Honeypot name="_honey" value={honeypot} onChange={setHoneypot} />
              <input type="hidden" name="_template" value="table" />

              <div className="row2">
                <FormField id={fieldId('name')} label="Name" required error={errors.name}>
                  <input
                    id={fieldId('name')}
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    required
                    value={values.name}
                    onChange={onFieldChange('name')}
                    onBlur={onFieldBlur('name')}
                    {...errorProps('name', errors.name)}
                  />
                </FormField>
                <FormField id={fieldId('phone')} label="Mobile number" required error={errors.phone}>
                  <input
                    id={fieldId('phone')}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={16}
                    required
                    placeholder="10-digit mobile number"
                    value={values.phone}
                    onChange={onFieldChange('phone')}
                    onBlur={onFieldBlur('phone')}
                    {...errorProps('phone', errors.phone)}
                  />
                </FormField>
              </div>

              <div className="row2">
                <FormField id={fieldId('email')} label="Email" required error={errors.email}>
                  <input
                    id={fieldId('email')}
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={values.email}
                    onChange={onFieldChange('email')}
                    onBlur={onFieldBlur('email')}
                    {...errorProps('email', errors.email)}
                  />
                </FormField>
                <FormField id={fieldId('company')} label="Business or firm name" optional>
                  <input
                    id={fieldId('company')}
                    name="company"
                    autoComplete="organization"
                    maxLength={120}
                    value={values.company}
                    onChange={onFieldChange('company')}
                  />
                </FormField>
              </div>

              <fieldset className="fld">
                <legend>What is it about?</legend>
                <div className="chips">
                  {SUBJECT_CHIPS.map((chip) => (
                    <label className="chip" key={chip.value}>
                      <input
                        type="radio"
                        name="subject"
                        value={chip.value}
                        checked={values.subject === chip.value}
                        onChange={() => onSubjectChange(chip.value)}
                      />
                      <span>{chip.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {values.subject === 'Other' && (
                <FormField id={fieldId('subjectOther')} label="What is it about?" required error={errors.subjectOther}>
                  <input
                    id={fieldId('subjectOther')}
                    name="subjectOther"
                    maxLength={80}
                    required
                    value={values.subjectOther}
                    onChange={onFieldChange('subjectOther')}
                    onBlur={onFieldBlur('subjectOther')}
                    {...errorProps('subjectOther', errors.subjectOther)}
                  />
                </FormField>
              )}

              <FormField
                id={fieldId('message')}
                label="Message"
                required
                error={errors.message}
                aside={
                  <span className={`count tnum ${values.message.length > 1800 ? 'near' : ''}`} aria-hidden="true">
                    {values.message.length} / {MESSAGE_MAX}
                  </span>
                }
              >
                <textarea
                  ref={messageRef}
                  id={fieldId('message')}
                  name="message"
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  required
                  placeholder="For example: I have received a GST notice and the reply is due on 15 October."
                  value={values.message}
                  onChange={onFieldChange('message')}
                  onBlur={onFieldBlur('message')}
                  {...errorProps('message', errors.message)}
                />
              </FormField>

              <div className="submit-row">
                <button className="btn" type="submit" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? (
                    <>
                      <span>Sending</span>
                      <span className="spin" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>Send message</span>
                      <ArrowRight />
                    </>
                  )}
                </button>
                {!canSubmit && <span className="draft">You can send another message in a minute.</span>}
                {canSubmit && lastSaved && hasDraftContent && <span className="draft">Draft saved</span>}
              </div>
              <p className="fine">
                We use your details only to reply to you. See our <Link to="/privacy">privacy policy</Link>.
              </p>
            </form>
          </div>

          <div className="sent" hidden={!isSuccess}>
            <h2 ref={successHeadingRef} tabIndex={-1}>
              Thank you{sentName ? `, ${sentName}` : ''}.
            </h2>
            <p>
              We have your message and will get back to you within a working day. If it is urgent, please call{' '}
              <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>.
            </p>
            <div className="acts">
              <button type="button" onClick={handleSendAnother}>
                Send another message
              </button>
            </div>
          </div>
        </section>

        <section className="cinfo" aria-label="Office details">
          <div className="blk">
            <h2 className="lbl">Office</h2>
            <address>
              {ADDRESS_LINE_1}
              <br />
              {ADDRESS_LINE_2}
            </address>
            {/* Muted to sit with the palette until hovered or focused.
                data-hide-cursor is read by CustomCursor.tsx so the custom
                cursor steps aside over the embedded map. */}
            <div className="map" data-hide-cursor="true">
              <iframe
                title={`Map showing the office of ${CONTACT_INFO.name}`}
                src={CONTACT_INFO.geo.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="geolocation 'none'"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                allowFullScreen
              />
            </div>
            <div className="acts">
              <a href={CONTACT_INFO.geo.mapShareUrl} target="_blank" rel="noopener noreferrer">
                Get directions<span className="vh"> (opens Google Maps in a new tab)</span>
              </a>
              <button type="button" onClick={() => handleCopy(ADDRESS_TO_COPY, 'Address')}>
                Copy address
              </button>
            </div>
          </div>
          <div className="blk">
            <h2 className="lbl">Office hours</h2>
            <table className="hours">
              <tbody>
                {RD_HOURS_TABLE.map((row) => {
                  const isToday = row.days.includes(today);
                  return (
                    <tr key={row.label} className={isToday ? 'today' : undefined}>
                      <th scope="row">
                        {row.label}
                        {isToday && <span className="tag">Today</span>}
                      </th>
                      <td>{row.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="next sand pad" aria-labelledby="contact-next-heading">
        <h2 className="next-h" id="contact-next-heading">
          After you get in touch
        </h2>
        <ol className="steps">
          <li>
            <span className="sn" aria-hidden="true">
              1
            </span>
            <h3>We get back to you</h3>
            <p>Usually within a working day, by phone or email.</p>
          </li>
          <li>
            <span className="sn" aria-hidden="true">
              2
            </span>
            <h3>We discuss the work</h3>
            <p>A short call or a meeting at the office to go over the deadlines and the documents involved.</p>
          </li>
          <li>
            <span className="sn" aria-hidden="true">
              3
            </span>
            <h3>You receive a written quote</h3>
            <p>A fixed fee and the scope of work. Once you agree, we send a checklist of the documents we need.</p>
          </li>
        </ol>
        <p className="more">
          Have a general question first? <Link to="/faqs">Read the FAQs</Link>
        </p>
      </section>
    </div>
  );
};

export default Contact;
