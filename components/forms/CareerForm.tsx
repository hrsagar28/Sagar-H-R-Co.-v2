import Button from '../ui/Button';
import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { ArrowRight, Check, AlertCircle, Save, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import Honeypot from './Honeypot';
import {
  CareerFormErrors,
  CareerFormValues,
  StepContact,
  StepPersonal,
  StepProfessional,
  StepReview
} from './careerFormSections';
import { useFormValidation, useToast, useRateLimit, useFormDraft, useAnnounce, useReducedMotion } from '../../hooks';
import { createFormSchema, required, email, indianPhone, minLength, maxLength } from '../../utils/formValidation';
import { apiClient, ApiError } from '../../utils/api';
import { CONTACT_INFO } from '../../constants';
import { CAREERS_CONTACT_EMAIL, CAREERS_RESPONSE_SLA_DAYS, OPEN_ROLES } from '../../constants/careers';
import { headerSafe, normalizeInput } from '../../utils/sanitize';
import { buildCareerSubject } from '../../utils/careersEmail';
import { logger } from '../../utils/logger';

interface CareerFormProps {
  initialPosition?: string;
}

// Reordering OPEN_ROLES also reorders this dropdown, which keeps the picker aligned with the role cards.
const positionOptions = OPEN_ROLES.map((role) => role.role);
const experienceOptions = ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'];
const STEP_TRANSITION_MS = 100;
const STEP_LABELS = ['Personal', 'Contact', 'Professional', 'Review'] as const;
const MIN_DOB = '1940-01-01';
const LAST_SAVED_DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Kolkata'
});
const LAST_SAVED_TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata'
});

const getTodayIsoDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createInitialValues = (initialPosition?: string): CareerFormValues => ({
  fullName: '',
  fatherName: '',
  mobile: '',
  email: '',
  dob: '',
  qualification: '',
  experience: '',
  previousCompanies: '',
  whyJoin: '',
  position: initialPosition || ''
});

const careerSchema = createFormSchema<CareerFormValues>({
  fullName: [required('Full Name is required'), minLength(2), maxLength(100)],
  fatherName: [required("Father's Name is required"), minLength(2)],
  mobile: [required('Mobile number is required'), indianPhone()],
  email: [required('Email is required'), email()],
  dob: [required('Date of Birth is required')],
  qualification: [required('Qualification is required')],
  experience: [required('Please select your experience level')],
  position: [required('Please select a position')],
  previousCompanies: [maxLength(1000, 'Maximum 1000 characters allowed')],
  whyJoin: [maxLength(1500, 'Maximum 1500 characters allowed')]
});

const CareerForm = ({ initialPosition }: CareerFormProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [pendingFocusStep, setPendingFocusStep] = useState<number | null>(null);

  const { addToast } = useToast();
  const { announce } = useAnnounce();
  const prefersReducedMotion = useReducedMotion();

  const stepOneFocusRef = useRef<HTMLInputElement>(null);
  const stepTwoFocusRef = useRef<HTMLInputElement>(null);
  const stepThreeFocusRef = useRef<HTMLDivElement>(null);
  const draftBannerRef = useRef<HTMLDivElement>(null);
  const dobMaxDate = useRef(getTodayIsoDate());

  const { canSubmit, recordAttempt, timeUntilReset } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    storageKey: 'career_submission_limit'
  });

  const { values, handleChange, errors, validate, setValues } = useFormValidation<CareerFormValues>(
    createInitialValues(initialPosition),
    {
      validationSchema: careerSchema,
      validateOnChange: false
    }
  );
  const formErrors = errors as CareerFormErrors;

  const stepSchemas = useMemo(() => ({
    1: {
      fullName: careerSchema.fullName,
      fatherName: careerSchema.fatherName,
      dob: careerSchema.dob
    },
    2: {
      mobile: careerSchema.mobile,
      email: careerSchema.email
    },
    3: {
      position: careerSchema.position,
      qualification: careerSchema.qualification,
      experience: careerSchema.experience,
      previousCompanies: careerSchema.previousCompanies,
      whyJoin: careerSchema.whyJoin
    },
    4: careerSchema
  }), []);

  const { loadDraft, clearDraft, lastSaved } = useFormDraft('career_form_draft', values);

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

  useEffect(() => {
    if (!showDraftBanner) return;
    draftBannerRef.current?.focus();
  }, [showDraftBanner]);

  useEffect(() => {
    const isDirty = Object.entries(values).some(([key, value]) => {
      const initialValue = key === 'position' ? (initialPosition || '') : '';
      return value !== initialValue;
    });

    if (!isDirty || submitStatus === 'success') return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [initialPosition, submitStatus, values]);

  useEffect(() => {
    if (!initialPosition) return;
    setValues((prev) => (prev.position === initialPosition ? prev : { ...prev, position: initialPosition }));
  }, [initialPosition, setValues]);

  useEffect(() => {
    if (submitStatus !== 'success') return;
    const timeout = window.setTimeout(() => {
      document.getElementById('success-heading')?.focus();
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [submitStatus]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setValues((prev) => ({ ...prev, ...draft }));
      setShowDraftBanner(false);
      addToast('Application draft restored.', 'success');
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
    addToast('Draft discarded.', 'info');
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e.target.name as keyof CareerFormValues, e.target.value);
  };

  const onCustomChange = (name: keyof CareerFormValues, value: string) => {
    handleChange(name, value);
  };

  const validateStep = (step: 1 | 2 | 3 | 4) => validate(stepSchemas[step]);

  const transitionToStep = (nextStep: number) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setCurrentStep(nextStep);
      announce(`Step ${nextStep} of ${STEP_LABELS.length}: ${STEP_LABELS[nextStep - 1]}`);
      setIsTransitioning(false);
    }, prefersReducedMotion ? 0 : STEP_TRANSITION_MS);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const validationStep = currentStep === 3 ? 4 : (currentStep as 1 | 2 | 3);
    if (!validateStep(validationStep)) {
      addToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    transitionToStep(currentStep + 1);

    if (window.innerWidth < 768) {
      document.getElementById('form-header')?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  };

  const handleBack = () => {
    if (isTransitioning) return;
    transitionToStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 4 || honeypot) return;

    if (!canSubmit) {
      addToast(`Still submitting - please wait ${timeUntilReset} seconds.`, 'info');
      return;
    }

    if (!validateStep(4)) {
      addToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    recordAttempt();

    try {
      await apiClient.post(CONTACT_INFO.formEndpoint, {
        fullName: normalizeInput(values.fullName),
        fatherName: normalizeInput(values.fatherName),
        mobile: headerSafe(values.mobile, 30),
        email: headerSafe(values.email, 254),
        dob: headerSafe(values.dob, 30),
        qualification: normalizeInput(values.qualification),
        experience: headerSafe(values.experience, 80),
        previousCompanies: normalizeInput(values.previousCompanies, { preserveLineBreaks: true }),
        whyJoin: normalizeInput(values.whyJoin, { preserveLineBreaks: true }),
        position: headerSafe(values.position),
        _subject: buildCareerSubject(values.fullName, values.position)
      });

      setSubmitStatus('success');
      clearDraft();
      addToast('Application submitted successfully!', 'success');
    } catch (error) {
      setSubmitStatus('error');
      logger.error('Career form submission failed:', error);

      let message = 'Something went wrong. Please try again.';
      if (error instanceof ApiError) {
        if (error.code === 'NETWORK_ERROR') message = 'Network error. Please check your internet.';
        else if (error.code === 'TIMEOUT') message = 'Request timed out. Please try again.';
      }
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;

    e.preventDefault();
    if (currentStep < 4) handleNext();
  };

  const handleEditStep = (step: number) => {
    setPendingFocusStep(step);
    setCurrentStep(step);
    announce(`Editing step ${step} of ${STEP_LABELS.length}: ${STEP_LABELS[step - 1]}`);
  };

  useLayoutEffect(() => {
    if (pendingFocusStep === null || pendingFocusStep !== currentStep || isTransitioning) return;

    if (pendingFocusStep === 1) {
      stepOneFocusRef.current?.focus();
    } else if (pendingFocusStep === 2) {
      stepTwoFocusRef.current?.focus();
    } else if (pendingFocusStep === 3) {
      const focusTarget = stepThreeFocusRef.current?.querySelector<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusTarget?.focus();
    }

    setPendingFocusStep(null);
  }, [currentStep, isTransitioning, pendingFocusStep]);

  if (submitStatus === 'success') {
    return (
      <div id="form-header" role="status" aria-live="polite" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in-up">
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-grid opacity-30"></div>
        </div>

        <div className="w-24 h-24 bg-brand-moss text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-moss/30 relative z-10">
          <Check size={48} />
        </div>
        <h2 id="success-heading" tabIndex={-1} className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4 relative z-10 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moss focus:ring-offset-4 focus:ring-offset-brand-surface">Application Submitted!</h2>
        <p className="text-xl text-brand-stone font-medium max-w-md mx-auto mb-8 relative z-10">
          Our team will review your profile and get in touch within {CAREERS_RESPONSE_SLA_DAYS} working days if your background matches the role.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitStatus('idle');
            setCurrentStep(1);
            setValues(createInitialValues(initialPosition));
          }}
          className="px-8 py-4 bg-brand-bg border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-moss hover:text-white transition-all duration-300 relative z-10"
        >
          Submit Another Application
        </button>
        <p className="text-sm text-brand-stone font-medium max-w-lg mx-auto mt-6 relative z-10">
          If you have questions, email <a href={`mailto:${CAREERS_CONTACT_EMAIL}`} className="text-brand-moss underline hover:text-brand-dark transition-colors">{CAREERS_CONTACT_EMAIL}</a> or reach us on <a href={CONTACT_INFO.social.whatsapp} className="text-brand-moss underline hover:text-brand-dark transition-colors">WhatsApp</a>.
        </p>
      </div>
    );
  }

  return (
    <div id="form-header" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative">
      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
      </div>

      <div className="relative z-10">
        {showDraftBanner && (
          <div
            ref={draftBannerRef}
            tabIndex={-1}
            className="mb-8 p-4 bg-brand-moss/10 border border-brand-moss/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-brand-moss shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-brand-dark">
                  We found an unsaved application. Would you like to resume?
                </p>
                {lastSaved && (
                  <p className="text-xs text-brand-stone mt-1">
                    Last saved {LAST_SAVED_DATE_FORMATTER.format(lastSaved)}, {LAST_SAVED_TIME_FORMATTER.format(lastSaved)}
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

        <div className="text-center mb-8">
          <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Application Form</span>
          <h2 id="form-heading" tabIndex={-1} className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-moss focus:ring-offset-4 focus:ring-offset-brand-surface">Submit Your Details</h2>
          {values.position && (
            <p className="text-lg text-brand-stone font-medium mt-2 animate-fade-in-up">
              Applying for: <span className="text-brand-dark font-bold">{values.position}</span>
            </p>
          )}
        </div>

        <div
          className="flex justify-between items-center mb-12 relative max-w-lg mx-auto z-base"
          role="group"
          aria-label={`Application progress: step ${currentStep} of ${STEP_LABELS.length}`}
        >
          <span className="sr-only">{`Step ${currentStep} of ${STEP_LABELS.length}`}</span>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-border -z-10 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-brand-moss -z-10 transition-all duration-500 rounded-full" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

          {[1, 2, 3, 4].map((step) => {
            const isActive = step <= currentStep;
            const isCurrent = step === currentStep;
            return (
              <div
                key={step}
                className="flex flex-col items-center gap-2"
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${step} of ${STEP_LABELS.length}: ${STEP_LABELS[step - 1]}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isActive ? 'bg-brand-moss border-brand-moss text-white scale-110 shadow-lg shadow-brand-moss/30' : 'bg-brand-surface border-brand-border text-brand-stone'}`}>
                  {isActive ? <Check size={16} /> : step}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isCurrent ? 'text-brand-moss' : 'text-brand-stone/60'}`}>
                  {STEP_LABELS[step - 1]}
                </span>
              </div>
            );
          })}
        </div>

        <form className="relative z-20" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Honeypot name="_hp_wauth_do_not_fill" value={honeypot} onChange={setHoneypot} />

          <div className="space-y-8">
            {currentStep === 1 && (
              <StepPersonal
                ref={stepOneFocusRef}
                values={values}
                errors={formErrors}
                onInputChange={onInputChange}
                onCustomChange={onCustomChange}
                dobMinDate={MIN_DOB}
                dobMaxDate={dobMaxDate.current}
              />
            )}

            {currentStep === 2 && (
              <StepContact
                ref={stepTwoFocusRef}
                values={values}
                errors={formErrors}
                onInputChange={onInputChange}
              />
            )}

            {currentStep === 3 && (
              <StepProfessional
                containerRef={stepThreeFocusRef}
                values={values}
                errors={formErrors}
                onInputChange={onInputChange}
                onCustomChange={onCustomChange}
                positionOptions={positionOptions}
                experienceOptions={experienceOptions}
              />
            )}

            {currentStep === 4 && (
              <StepReview values={values} errors={formErrors} onEditStep={handleEditStep} />
            )}
          </div>

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600" role="alert" aria-live="assertive">
              <AlertCircle size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Something went wrong. Please check your connection and try again.</span>
            </div>
          )}

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
                {currentStep === 3 ? 'Review Application' : 'Next Step'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                <Save size={12} /> Draft saved {LAST_SAVED_TIME_FORMATTER.format(lastSaved)}
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
