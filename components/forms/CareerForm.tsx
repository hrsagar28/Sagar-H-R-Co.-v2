import Button from '../ui/Button';
import FormField from '../ui/FormField';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Briefcase, Loader2, AlertCircle, Save, RotateCcw, Trash2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import CustomDatePicker from './CustomDatePicker';
import { useFormValidation, useToast, useRateLimit, useFormDraft } from '../../hooks';
import { createFormSchema, required, email, indianPhone, minLength, maxLength } from '../../utils/formValidation';
import { apiClient, ApiError } from '../../utils/api';
import { CONTACT_INFO } from '../../constants';
import { OPEN_ROLES } from '../../constants/careers';
import { sanitizeInput } from '../../utils/sanitize';
import { logger } from '../../utils/logger';

interface CareerFormProps {
  initialPosition?: string;
  onFormSubmitSuccess?: () => void;
}

interface FormData {
  fullName: string;
  fatherName: string;
  mobile: string;
  email: string;
  dob: string;
  qualification: string;
  experience: string;
  previousCompanies: string;
  position: string;
}

const positionOptions = [...OPEN_ROLES.map(role => role.role), '---', 'General Application'];
const experienceOptions = ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'];
const STEP_TRANSITION_MS = 150;

// Define Validation Schema
const careerSchema = createFormSchema<FormData>({
  fullName: [required('Full Name is required'), minLength(2), maxLength(100)],
  fatherName: [required("Father's Name is required"), minLength(2)],
  mobile: [required('Mobile number is required'), indianPhone()],
  email: [required('Email is required'), email()],
  dob: [required('Date of Birth is required')],
  qualification: [required('Qualification is required')],
  experience: [required('Please select your experience level')],
  position: [required('Please select a position')],
  previousCompanies: [maxLength(1000, 'Maximum 1000 characters allowed')]
});

const CareerForm = ({ initialPosition, onFormSubmitSuccess }: CareerFormProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addToast } = useToast();

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Rate Limiter
  const { canSubmit, recordAttempt, timeUntilReset } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 1000, // 1 Minute
    storageKey: 'career_submission_limit'
  });

  // Use the custom validation hook
  const { values, handleChange, errors, validate, setValues } = useFormValidation<FormData>({
    fullName: '',
    fatherName: '',
    mobile: '',
    email: '',
    dob: '',
    qualification: '',
    experience: '',
    previousCompanies: '',
    position: initialPosition || ''
  }, {
    validationSchema: careerSchema,
    validateOnChange: false
  });

  // Draft Hook
  const { loadDraft, clearDraft, lastSaved } = useFormDraft('career_form_draft', values);

  // Check for draft on mount
  useEffect(() => {
    if (lastSaved && !values.fullName) {
      const ageInDays = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 14) {
        clearDraft();
      } else {
        setShowDraftBanner(true);
      }
    }
  }, [lastSaved, clearDraft, values.fullName]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setValues(draft);
      setShowDraftBanner(false);
      addToast("Application draft restored.", "success");
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
    addToast("Draft discarded.", "info");
  };

  // Update position if initialPosition changes
  const prevInitialRef = useRef<string | undefined>(initialPosition);
  useEffect(() => {
    if (initialPosition && initialPosition !== prevInitialRef.current) {
      const isInitialLoad = prevInitialRef.current === undefined || prevInitialRef.current === '';
      setValues(prev => ({ ...prev, position: initialPosition }));
      if (!isInitialLoad) addToast(`Switched position to ${initialPosition}`, "info");
      prevInitialRef.current = initialPosition;
    }
  }, [initialPosition, setValues, addToast]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e.target.name as keyof FormData, e.target.value);
  };

  const onCustomChange = (name: string, value: string) => {
    handleChange(name as keyof FormData, value);
  };

  // Partial validation for multi-step
  const validateStep = (step: number) => {
    let fieldsToValidate: Partial<FormData> = {};
    if (step === 1) fieldsToValidate = { fullName: values.fullName, fatherName: values.fatherName, dob: values.dob };
    if (step === 2) fieldsToValidate = { mobile: values.mobile, email: values.email };
    if (step === 3) fieldsToValidate = { position: values.position, qualification: values.qualification, experience: values.experience };
    if (step === 4) return validate(careerSchema);

    // Create subset schema for current step
    const stepSchema: any = {};
    Object.keys(fieldsToValidate).forEach(k => {
      stepSchema[k] = careerSchema[k as keyof FormData];
    });

    return validate(stepSchema);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, prefersReducedMotion ? 0 : STEP_TRANSITION_MS);

      if (window.innerWidth < 768) {
        const formHeader = document.getElementById('form-header');
        formHeader?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    } else {
      addToast("Please fill in all required fields correctly.", "error");
    }
  };

  const handleBack = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : STEP_TRANSITION_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 4) return;
    if (honeypot) return;

    if (!canSubmit) {
      addToast(`Still submitting — please wait ${timeUntilReset} seconds.`, "info");
      return;
    }

    if (validateStep(4)) {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      try {
        await apiClient.post(CONTACT_INFO.formEndpoint, {
          fullName: sanitizeInput(values.fullName),
          fatherName: sanitizeInput(values.fatherName),
          mobile: sanitizeInput(values.mobile),
          email: sanitizeInput(values.email),
          dob: sanitizeInput(values.dob),
          qualification: sanitizeInput(values.qualification),
          experience: sanitizeInput(values.experience),
          previousCompanies: sanitizeInput(values.previousCompanies),
          position: sanitizeInput(values.position),
          _subject: `Job Application: ${sanitizeInput(values.fullName)} - ${sanitizeInput(values.position) || 'General'}`
        });

        setSubmitStatus('success');
        recordAttempt();
        clearDraft();
        addToast("Application submitted successfully!", "success");
        if (onFormSubmitSuccess) onFormSubmitSuccess();

      } catch (e) {
        setSubmitStatus('error');
        logger.error('Career form submission failed:', e);

        let msg = "Something went wrong. Please try again.";
        if (e instanceof ApiError) {
          if (e.code === 'NETWORK_ERROR') msg = "Network error. Please check your internet.";
          else if (e.code === 'TIMEOUT') msg = "Request timed out. Please try again.";
        }
        addToast(msg, "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      addToast("Please fill in all required fields correctly.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault();
      if (currentStep < 4) handleNext();
      else if (validateStep(4)) handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    setTimeout(() => {
      let selector = '';
      if (step === 1) selector = 'input[name="fullName"]';
      if (step === 2) selector = 'input[name="mobile"]';
      if (step === 3) selector = 'button[aria-labelledby="position-label"]';
      const el = document.querySelector(selector) as HTMLElement;
      el?.focus();
    }, 50);
  };

  if (submitStatus === 'success') {
    return (
      <div id="form-header" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in-up">
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-grid opacity-30"></div>
        </div>

        <div className="w-24 h-24 bg-brand-moss text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-moss/30 relative z-10">
          <Check size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4 relative z-10">Application Submitted!</h2>
        <p className="text-xl text-brand-stone font-medium max-w-md mx-auto mb-8 relative z-10">
          Our team will review your profile and get in touch within 5 working days if your background matches the role.
        </p>
        <button
          onClick={() => {
            setSubmitStatus('idle');
            setCurrentStep(1);
            setValues({
              fullName: '', fatherName: '', mobile: '', email: '', dob: '',
              qualification: '', experience: '', previousCompanies: '',
              position: initialPosition || ''
            });
          }}
          className="px-8 py-4 bg-brand-bg border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-moss hover:text-white transition-all duration-300 relative z-10"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div id="form-header" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative">
      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
      </div>

      <div className="relative z-10">

        {/* Draft Banner */}
        {showDraftBanner && (
          <div className="mb-8 p-4 bg-brand-moss/10 border border-brand-moss/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-brand-moss shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-brand-dark">
                  We found an unsaved application. Would you like to resume?
                </p>
                {lastSaved && (
                  <p className="text-xs text-brand-stone mt-1">
                    Last saved {lastSaved.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="solid" 
                className="flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                onClick={handleRestoreDraft}
              >
                <RotateCcw size={14} /> Resume
              </Button>
              <Button
                variant="outline"
                onClick={handleDiscardDraft}
                className="flex-1 md:flex-none px-4 py-2 bg-white border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Discard
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Application Form</span>
          <h2 id="form-heading" tabIndex={-1} className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6 focus:outline-none">Submit Your Details</h2>
          {values.position && (
            <p className="text-lg text-brand-stone font-medium mt-2 animate-fade-in-up">
              Applying for: <span className="text-brand-dark font-bold">{values.position}</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative max-w-lg mx-auto z-base">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-border -z-10 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-brand-moss -z-10 transition-all duration-500 rounded-full" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

          {[1, 2, 3, 4].map(step => {
            const labels = ["Personal", "Contact", "Professional", "Review"];
            const isActive = step <= currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isActive ? 'bg-brand-moss border-brand-moss text-white scale-110 shadow-lg shadow-brand-moss/30' : 'bg-brand-surface border-brand-border text-brand-stone'}`}>
                  {isActive ? <Check size={16} /> : step}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isCurrent ? 'text-brand-moss' : 'text-brand-stone/60'}`}>
                  {labels[step - 1]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <form
          className="space-y-8 relative z-20"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          {/* Honeypot Field */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Leave this field empty
              <input
                type="text"
                name="work_authorization_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {/* STEP 1: PERSONAL DETAILS */}
          <div className={`${currentStep === 1 ? 'block animate-fade-in-up' : 'hidden'}`} aria-hidden={currentStep !== 1} inert={currentStep !== 1 ? true : undefined}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <FormField label="Full Name" name="fullName" required error={errors.fullName}>
                  <input
                    type="text"
                    value={values.fullName}
                    onChange={onInputChange}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                  />
                </FormField>
              </div>

              <FormField label="Father's Name" name="fatherName" required error={errors.fatherName}>
                <input
                  type="text"
                  value={values.fatherName}
                  onChange={onInputChange}
                  placeholder="Father's Full Name"
                  className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all"
                />
              </FormField>

              {/* Date of Birth */}
              <div>
                <CustomDatePicker
                  label="Date of Birth"
                  name="dob"
                  value={values.dob}
                  onChange={onCustomChange}
                  error={errors.dob}
                  required
                />
              </div>
            </div>
          </div>

          {/* STEP 2: CONTACT INFO */}
          <div className={`${currentStep === 2 ? 'block animate-fade-in-up' : 'hidden'}`} aria-hidden={currentStep !== 2} inert={currentStep !== 2 ? true : undefined}>
            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <FormField label="Mobile Number" name="mobile" required error={errors.mobile}>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={15}
                    autoComplete="tel"
                    value={values.mobile}
                    onChange={onInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                  />
                </FormField>
              </div>

              <div className="group">
                <FormField label="Email Address" name="email" required error={errors.email}>
                  <input
                    type="email"
                    value={values.email}
                    onChange={onInputChange}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* STEP 3: PROFESSIONAL DETAILS */}
          <div className={`${currentStep === 3 ? 'block animate-fade-in-up' : 'hidden'}`} aria-hidden={currentStep !== 3} inert={currentStep !== 3 ? true : undefined}>
            <div className="space-y-8">

              {/* Position */}
              <CustomDropdown
                label="Position Applying For"
                name="position"
                value={values.position}
                options={positionOptions}
                onChange={onCustomChange}
                error={errors.position}
                required
                icon={<Briefcase size={14} className="text-brand-moss" />}
              />

              {/* Qualification */}
              <div className="group">
                <FormField label="Qualification" name="qualification" required error={errors.qualification}>
                  <input
                    type="text"
                    value={values.qualification}
                    onChange={onInputChange}
                    placeholder="e.g. B.Com, CA Inter, MBA"
                    className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
                  />
                </FormField>
              </div>

              {/* Experience */}
              <CustomDropdown
                label="Years of Experience"
                name="experience"
                value={values.experience}
                options={experienceOptions}
                onChange={onCustomChange}
                error={errors.experience}
                required
                icon={<Briefcase size={14} className="text-brand-moss" />}
              />

              {/* Previous Companies */}
              <div className="group">
                <FormField label="Companies Previously Worked At" name="previousCompanies">
                  <textarea
                    value={values.previousCompanies}
                    onChange={onInputChange}
                    maxLength={1000}
                    rows={3}
                    placeholder="List your previous employers..."
                    className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all resize-none"
                  ></textarea>
                </FormField>
              </div>
            </div>
          </div>

          {/* STEP 4: REVIEW */}
          <div className={`${currentStep === 4 ? 'block animate-fade-in-up' : 'hidden'}`} aria-hidden={currentStep !== 4} inert={currentStep !== 4 ? true : undefined}>
            <div className="space-y-6">
               <div className={`bg-brand-surface p-6 rounded-2xl border ${errors.fullName || errors.fatherName || errors.dob ? 'border-red-500 ring-2 ring-red-500' : 'border-brand-border'}`}>
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                       <h3 className="font-heading font-bold text-brand-dark text-xl">Personal Details</h3>
                       {(errors.fullName || errors.fatherName || errors.dob) && <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Edit needed</span>}
                     </div>
                     <button type="button" onClick={() => handleEditStep(1)} className="text-brand-moss text-sm font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss rounded-sm px-1">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div><span className="text-brand-stone block mb-1">Full Name</span><span className="font-medium text-brand-dark">{values.fullName || '-'}</span></div>
                     <div><span className="text-brand-stone block mb-1">Father's Name</span><span className="font-medium text-brand-dark">{values.fatherName || '-'}</span></div>
                     <div><span className="text-brand-stone block mb-1">Date of Birth</span><span className="font-medium text-brand-dark">{values.dob ? new Date(values.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span></div>
                  </div>
               </div>
               
               <div className={`bg-brand-surface p-6 rounded-2xl border ${errors.mobile || errors.email ? 'border-red-500 ring-2 ring-red-500' : 'border-brand-border'}`}>
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                       <h3 className="font-heading font-bold text-brand-dark text-xl">Contact Information</h3>
                       {(errors.mobile || errors.email) && <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Edit needed</span>}
                     </div>
                     <button type="button" onClick={() => handleEditStep(2)} className="text-brand-moss text-sm font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss rounded-sm px-1">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div><span className="text-brand-stone block mb-1">Mobile</span><span className="font-medium text-brand-dark">{values.mobile || '-'}</span></div>
                     <div><span className="text-brand-stone block mb-1">Email</span><span className="font-medium text-brand-dark">{values.email || '-'}</span></div>
                  </div>
               </div>

               <div className={`bg-brand-surface p-6 rounded-2xl border ${errors.position || errors.qualification || errors.experience ? 'border-red-500 ring-2 ring-red-500' : 'border-brand-border'}`}>
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                       <h3 className="font-heading font-bold text-brand-dark text-xl">Professional Details</h3>
                       {(errors.position || errors.qualification || errors.experience) && <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Edit needed</span>}
                     </div>
                     <button type="button" onClick={() => handleEditStep(3)} className="text-brand-moss text-sm font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss rounded-sm px-1">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div><span className="text-brand-stone block mb-1">Position</span><span className="font-medium text-brand-dark">{values.position || '-'}</span></div>
                     <div><span className="text-brand-stone block mb-1">Qualification</span><span className="font-medium text-brand-dark">{values.qualification || '-'}</span></div>
                     <div><span className="text-brand-stone block mb-1">Experience</span><span className="font-medium text-brand-dark">{values.experience || '-'}</span></div>
                     {values.previousCompanies && <div className="md:col-span-2"><span className="text-brand-stone block mb-1">Previous Companies</span><span className="font-medium text-brand-dark break-words">{values.previousCompanies}</span></div>}
                  </div>
               </div>
            </div>
          </div>

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600" role="alert" aria-live="assertive">
              <AlertCircle size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Something went wrong. Please check your connection and try again.</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 flex-col md:flex-row">
            {currentStep > 1 && !isSubmitting && (
              <Button
                key="back-btn"
                type="button"
                variant="surface-outline"
                onClick={handleBack}
                className="flex-1 py-5 font-heading font-bold text-lg"
              >
                Back
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                key="next-btn"
                type="button"
                variant="dark"
                onClick={handleNext}
                className="flex-1 py-5 font-heading font-bold text-lg shadow-xl hover:shadow-brand-moss/30 group"
              >
                {currentStep === 3 ? "Review Application" : "Next Step"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                key="submit-btn"
                type="submit"
                disabled={isSubmitting || !canSubmit}
                variant="solid"
                className={`flex-1 py-5 shadow-xl flex justify-center items-center gap-2 group ${(isSubmitting || !canSubmit) ? 'opacity-80' : 'hover:shadow-brand-dark/30'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    Submit Application <Check size={20} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            {lastSaved && (
              <span className="text-[10px] uppercase tracking-wider text-brand-stone flex items-center gap-1">
                <Save size={12} /> Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <p className="text-xs text-brand-stone font-medium">
              Protected by reCAPTCHA and our <a href="/privacy-policy" className="underline hover:text-brand-moss transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerForm;
