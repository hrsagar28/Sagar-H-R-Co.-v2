import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, User, Phone, Mail, BookOpen, Briefcase, Building, Loader2, AlertCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import CustomDatePicker from './CustomDatePicker';
import { useFormValidation } from '../../hooks/useFormValidation';

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

const positionOptions = ['Audit Associate', 'Articled Assistant', 'General Application'];
const experienceOptions = ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'];

const CareerForm: React.FC<CareerFormProps> = ({ initialPosition, onFormSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');

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
  });

  // Update position if initialPosition changes
  useEffect(() => {
    if (initialPosition) {
        setValues(prev => ({ ...prev, position: initialPosition }));
        // Also jump to start if position is clicked
        if (currentStep !== 1) setCurrentStep(1);
    }
  }, [initialPosition, setValues]);

  // Handle Input Changes wrapper
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e.target.name as keyof FormData, e.target.value);
  };
  
  // Wrapper for custom components
  const onCustomChange = (name: string, value: string) => {
    handleChange(name as keyof FormData, value);
  };

  // Step Validation Logic
  const validateStep = (step: number) => {
    if (step === 1) {
      return validate({
        fullName: (val) => !val.fullName.trim() ? "Full Name is required" : undefined,
        fatherName: (val) => !val.fatherName.trim() ? "Father's Name is required" : undefined,
        dob: (val) => !val.dob ? "Date of Birth is required" : undefined,
      });
    }
    if (step === 2) {
      return validate({
        mobile: (val) => !val.mobile.trim() ? "Mobile number is required" : !/^\+?[\d\s-]{10,}$/.test(val.mobile) ? "Invalid mobile number" : undefined,
        email: (val) => !val.email.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(val.email) ? "Invalid email address" : undefined,
      });
    }
    if (step === 3) {
      return validate({
        position: (val) => !val.position ? "Please select a position" : undefined,
        qualification: (val) => !val.qualification.trim() ? "Qualification is required" : undefined,
        experience: (val) => !val.experience ? "Please select your experience level" : undefined,
      });
    }
    return true;
  };

  const handleNext = () => {
    if (isTransitioning) return;
    if (validateStep(currentStep)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 300); // Small delay for animation
      
      // Mobile scroll correction
      if (window.innerWidth < 768) {
        const formHeader = document.getElementById('form-header');
        formHeader?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleBack = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return;
    
    // Honeypot Check
    if (honeypot) return;

    if (validateStep(3)) {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      try {
        const res = await fetch("https://formsubmit.co/ajax/mail@casagar.co.in", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...values,
                _subject: `Job Application: ${values.fullName} - ${values.position || 'General'}`
            })
        });

        if (res.ok) {
            setSubmitStatus('success');
            if (onFormSubmitSuccess) onFormSubmitSuccess();
        } else {
            setSubmitStatus('error');
        }
      } catch(e) {
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Allow Enter key to navigate steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault();
      if (currentStep < 3) handleNext();
      else if (validateStep(3)) handleSubmit(e as unknown as React.FormEvent);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div id="form-header" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in-up">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
        <div className="w-24 h-24 bg-brand-moss text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-moss/30">
          <Check size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">Application Submitted!</h2>
        <p className="text-xl text-brand-stone font-medium max-w-md mx-auto mb-8">
          Thank you for applying. Our HR team will review your profile and contact you if your qualifications match our requirements.
        </p>
        <button 
          onClick={() => {
            setSubmitStatus('idle');
            setCurrentStep(1);
            setValues({
                fullName: '',
                fatherName: '',
                mobile: '',
                email: '',
                dob: '',
                qualification: '',
                experience: '',
                previousCompanies: '',
                position: initialPosition || ''
            });
          }}
          className="px-8 py-4 bg-brand-bg border border-brand-border text-brand-dark font-bold rounded-full hover:bg-brand-moss hover:text-white transition-all duration-300"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div id="form-header" className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-brand-border shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
      <div className="relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-4 block">Application Form</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mb-6">Submit Your Details</h2>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative max-w-lg mx-auto z-base">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-border -z-10 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-brand-moss -z-10 transition-all duration-500 rounded-full" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map(step => {
            const labels = ["Personal", "Contact", "Professional"];
            const isActive = step <= currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isActive ? 'bg-brand-moss border-brand-moss text-white scale-110 shadow-lg shadow-brand-moss/30' : 'bg-brand-surface border-brand-border text-brand-stone'}`}>
                  {isActive ? <Check size={16} /> : step}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isCurrent ? 'text-brand-moss' : 'text-brand-stone/60'}`}>
                  {labels[step-1]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <form 
          className="space-y-8"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
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

          {/* STEP 1: PERSONAL DETAILS */}
          <div className={`${currentStep === 1 ? 'block animate-fade-in-up' : 'hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group md:col-span-2">
                <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <User size={14} className="text-brand-moss"/> Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  value={values.fullName}
                  onChange={onInputChange}
                  placeholder="John Doe"
                  className={`w-full bg-brand-bg border ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-2 font-bold">{errors.fullName}</p>}
              </div>

              <div className="group">
                <label htmlFor="fatherName" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <User size={14} className="text-brand-moss"/> Father's Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="fatherName"
                  name="fatherName"
                  value={values.fatherName}
                  onChange={onInputChange}
                  placeholder="Father's Full Name"
                  className={`w-full bg-brand-bg border ${errors.fatherName ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all`}
                />
                {errors.fatherName && <p className="text-red-500 text-xs mt-2 font-bold">{errors.fatherName}</p>}
              </div>

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
          <div className={`${currentStep === 2 ? 'block animate-fade-in-up' : 'hidden'}`}>
            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <label htmlFor="mobile" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <Phone size={14} className="text-brand-moss"/> Mobile Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="mobile"
                  name="mobile"
                  value={values.mobile}
                  onChange={onInputChange}
                  placeholder="+91 98765 43210"
                  className={`w-full bg-brand-bg border ${errors.mobile ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all`}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-2 font-bold">{errors.mobile}</p>}
              </div>

              <div className="group">
                <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <Mail size={14} className="text-brand-moss"/> Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={onInputChange}
                  placeholder="john@example.com"
                  className={`w-full bg-brand-bg border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-2 font-bold">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* STEP 3: PROFESSIONAL DETAILS */}
          <div className={`${currentStep === 3 ? 'block animate-fade-in-up' : 'hidden'}`}>
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
              />

              {/* Qualification */}
              <div className="group">
                <label htmlFor="qualification" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <BookOpen size={14} className="text-brand-moss"/> Qualification <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="qualification"
                  name="qualification"
                  value={values.qualification}
                  onChange={onInputChange}
                  placeholder="e.g. B.Com, CA Inter, MBA"
                  className={`w-full bg-brand-bg border ${errors.qualification ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'} py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all`}
                />
                {errors.qualification && <p className="text-red-500 text-xs mt-2 font-bold">{errors.qualification}</p>}
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
                icon={<Briefcase size={14} className="text-brand-moss"/>}
              />

              {/* Previous Companies */}
              <div className="group">
                <label htmlFor="previousCompanies" className="flex items-center gap-2 text-xs font-bold text-brand-dark uppercase tracking-widest mb-3 ml-1">
                  <Building size={14} className="text-brand-moss"/> Companies Previously Worked At
                </label>
                <textarea 
                  id="previousCompanies"
                  name="previousCompanies"
                  value={values.previousCompanies}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="List your previous employers..."
                  className="w-full bg-brand-bg border border-brand-border py-4 px-6 rounded-2xl text-brand-dark focus:border-brand-moss focus:ring-1 focus:ring-brand-moss focus:outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">Something went wrong. Please try again later.</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            {currentStep > 1 && !isSubmitting && (
              <button 
                key="back-btn"
                type="button"
                onClick={handleBack}
                className="flex-1 py-5 bg-brand-surface border border-brand-border text-brand-dark font-heading font-bold text-lg rounded-full hover:bg-brand-bg transition-all duration-300"
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                key="next-btn"
                type="button" 
                onClick={handleNext}
                className="flex-1 py-5 bg-brand-dark text-white font-heading font-bold text-lg rounded-full hover:bg-brand-moss transition-all duration-300 shadow-xl hover:shadow-brand-moss/30 flex justify-center items-center gap-2 group"
              >
                Next Step <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                key="submit-btn"
                type="submit" 
                disabled={isSubmitting}
                className={`
                  flex-1 py-5 rounded-full font-heading font-bold text-lg 
                  flex justify-center items-center gap-2 group transition-all duration-300 shadow-xl
                  ${isSubmitting 
                    ? 'bg-brand-moss opacity-80 cursor-wait' 
                    : 'bg-brand-moss text-white hover:bg-brand-dark hover:shadow-brand-dark/30'
                  }
                `}
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
              </button>
            )}
          </div>
          
          <p className="text-center text-xs text-brand-stone font-medium mt-4">
             By submitting this form, you agree to our Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CareerForm;