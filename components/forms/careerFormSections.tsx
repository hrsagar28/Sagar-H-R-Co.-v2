import React from 'react';
import { Briefcase } from 'lucide-react';
import FormField from '../ui/FormField';
import CustomDropdown from './CustomDropdown';
import CustomDatePicker from './CustomDatePicker';

export interface CareerFormValues {
  fullName: string;
  fatherName: string;
  mobile: string;
  email: string;
  dob: string;
  qualification: string;
  experience: string;
  previousCompanies: string;
  whyJoin: string;
  position: string;
}

export type CareerFormErrors = Partial<Record<keyof CareerFormValues, string>>;

type TextChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
type CustomChangeHandler = (name: keyof CareerFormValues, value: string) => void;

interface StepPersonalProps {
  values: CareerFormValues;
  errors: CareerFormErrors;
  onInputChange: TextChangeHandler;
  onCustomChange: CustomChangeHandler;
  dobMinDate: string;
  dobMaxDate: string;
}

export const StepPersonal = React.forwardRef<HTMLInputElement, StepPersonalProps>(function StepPersonal(
  { values, errors, onInputChange, onCustomChange, dobMinDate, dobMaxDate },
  ref
) {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2">
          <FormField label="Full Name" name="fullName" required error={errors.fullName}>
            <input
              ref={ref}
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
            autoComplete="off"
            className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all"
          />
        </FormField>

        <div>
          <CustomDatePicker
            label="Date of Birth"
            name="dob"
            value={values.dob}
            onChange={onCustomChange}
            min={dobMinDate}
            max={dobMaxDate}
            error={errors.dob}
            required
          />
        </div>
      </div>
    </div>
  );
});

interface StepContactProps {
  values: CareerFormValues;
  errors: CareerFormErrors;
  onInputChange: TextChangeHandler;
}

export const StepContact = React.forwardRef<HTMLInputElement, StepContactProps>(function StepContact(
  { values, errors, onInputChange },
  ref
) {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 gap-8">
        <div className="group">
          <FormField label="Mobile Number" name="mobile" required error={errors.mobile}>
            <input
              ref={ref}
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
  );
});

interface StepProfessionalProps {
  containerRef: React.RefObject<HTMLDivElement>;
  values: CareerFormValues;
  errors: CareerFormErrors;
  onInputChange: TextChangeHandler;
  onCustomChange: CustomChangeHandler;
  positionOptions: string[];
  experienceOptions: string[];
}

export const StepProfessional: React.FC<StepProfessionalProps> = ({
  containerRef,
  values,
  errors,
  onInputChange,
  onCustomChange,
  positionOptions,
  experienceOptions
}) => (
  <div className="animate-fade-in-up">
    <div className="space-y-8">
      <div ref={containerRef}>
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
      </div>

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

      <div className="group">
        <FormField label="Companies Previously Worked At" name="previousCompanies">
          <textarea
            name="previousCompanies"
            value={values.previousCompanies}
            onChange={onInputChange}
            maxLength={1000}
            rows={3}
            placeholder="List your previous employers..."
            className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all resize-none"
          ></textarea>
        </FormField>
      </div>

      <div className="group">
        <FormField label="Why Do You Want To Join?" name="whyJoin" error={errors.whyJoin}>
          <textarea
            name="whyJoin"
            value={values.whyJoin}
            onChange={onInputChange}
            maxLength={1500}
            rows={4}
            placeholder="Tell us what draws you to this role or firm..."
            className="w-full bg-brand-bg border rounded-2xl py-4 px-6 text-brand-dark focus:outline-none focus-visible:border-brand-moss focus-visible:ring-2 focus-visible:ring-brand-moss transition-all resize-none"
          ></textarea>
        </FormField>
      </div>
    </div>
  </div>
);

interface ReviewFieldConfig {
  label: string;
  key: keyof CareerFormValues;
  className?: string;
  render?: (value: string) => React.ReactNode;
}

const formatDateValue = (value: string) => {
  if (!value) return '-';
  const formattedDate = new Date(`${value}T00:00:00`);
  return formattedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const REVIEW_FIELDS = {
  personal: [
    { label: 'Full Name', key: 'fullName' },
    { label: "Father's Name", key: 'fatherName' },
    { label: 'Date of Birth', key: 'dob', render: formatDateValue }
  ],
  contact: [
    { label: 'Mobile', key: 'mobile' },
    { label: 'Email', key: 'email' }
  ],
  professional: [
    { label: 'Position', key: 'position' },
    { label: 'Qualification', key: 'qualification' },
    { label: 'Experience', key: 'experience' },
    { label: 'Previous Companies', key: 'previousCompanies', className: 'md:col-span-2', render: (value) => <span className="whitespace-pre-line">{value || '-'}</span> },
    { label: 'Why Do You Want To Join?', key: 'whyJoin', className: 'md:col-span-2', render: (value) => <span className="whitespace-pre-line">{value || '-'}</span> }
  ]
} satisfies Record<string, ReviewFieldConfig[]>;

const REVIEW_SECTIONS = [
  {
    heading: 'Personal Details',
    headingId: 'review-personal-heading',
    editStep: 1,
    errorKeys: ['fullName', 'fatherName', 'dob'] as (keyof CareerFormValues)[],
    fields: REVIEW_FIELDS.personal
  },
  {
    heading: 'Contact Information',
    headingId: 'review-contact-heading',
    editStep: 2,
    errorKeys: ['mobile', 'email'] as (keyof CareerFormValues)[],
    fields: REVIEW_FIELDS.contact
  },
  {
    heading: 'Professional Details',
    headingId: 'review-professional-heading',
    editStep: 3,
    errorKeys: ['position', 'qualification', 'experience', 'previousCompanies', 'whyJoin'] as (keyof CareerFormValues)[],
    fields: REVIEW_FIELDS.professional
  }
] as const;

const ReviewField: React.FC<{ field: ReviewFieldConfig; values: CareerFormValues }> = ({ field, values }) => {
  const rawValue = values[field.key];
  const content = field.render ? field.render(rawValue) : rawValue || '-';

  return (
    <div className={field.className}>
      <span className="text-brand-stone block mb-1">{field.label}</span>
      <span className="font-medium text-brand-dark">{content}</span>
    </div>
  );
};

interface StepReviewProps {
  values: CareerFormValues;
  errors: CareerFormErrors;
  onEditStep: (step: number) => void;
}

export const StepReview: React.FC<StepReviewProps> = ({ values, errors, onEditStep }) => (
  <div className="animate-fade-in-up">
    <div className="space-y-6">
      {REVIEW_SECTIONS.map((section) => {
        const hasErrors = section.errorKeys.some((key) => Boolean(errors[key]));

        return (
          <section
            key={section.headingId}
            aria-labelledby={section.headingId}
            className={`bg-brand-surface p-6 rounded-2xl border ${hasErrors ? 'border-red-500 ring-2 ring-red-500' : 'border-brand-border'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 id={section.headingId} className="font-heading font-bold text-brand-dark text-xl">{section.heading}</h3>
                {hasErrors && <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Edit needed</span>}
              </div>
              <button type="button" onClick={() => onEditStep(section.editStep)} className="text-brand-moss text-sm font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss rounded-sm px-1">Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {section.fields.map((field) => (
                <ReviewField key={field.label} field={field} values={values} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  </div>
);
