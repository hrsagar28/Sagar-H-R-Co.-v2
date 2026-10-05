import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Honeypot from '../forms/Honeypot';
import FormField, { fieldErrorProps } from './FormField';
import { ArrowRight } from './icons';
import { CAREERS_CONTACT_EMAIL, CAREERS_RESPONSE_TIME } from '../../constants/careers';
import { useFormDraft, useFormValidation, useRateLimit, useToast } from '../../hooks';
import {
  createFormSchema,
  email,
  indianPhone,
  maxLength,
  required,
  validateForm,
  type FormSchema,
} from '../../utils/formValidation';
import { ApiError } from '../../utils/api';
import { submitToFormSubmit } from '../../utils/formSubmit';
import { headerSafe, normalizeInput } from '../../utils/sanitize';
import { buildCareerSubject } from '../../utils/careersEmail';
import { logger } from '../../utils/logger';

// The application form on /careers: one page of underline fields, like the
// Contact form, sent from the browser to FormSubmit (utils/formSubmit.ts).

export const ANY_ROLE = 'Any suitable role';

const EXPERIENCE_OPTIONS = ['Fresher', '1 to 2 years', '3 to 5 years', 'More than 5 years'];
const PREVIOUS_MAX = 1000;
const WHY_MAX = 1500;

interface ApplicationValues {
  fullName: string;
  fatherName: string;
  dob: string;
  mobile: string;
  email: string;
  qualification: string;
  experience: string;
  previousCompanies: string;
  whyJoin: string;
}

const INITIAL_VALUES: ApplicationValues = {
  fullName: '',
  fatherName: '',
  dob: '',
  mobile: '',
  email: '',
  qualification: '',
  experience: '',
  previousCompanies: '',
  whyJoin: '',
};

const schema = createFormSchema<ApplicationValues>({
  fullName: [required('Please enter your full name.'), maxLength(100)],
  fatherName: [required('Please enter your father’s name.'), maxLength(100)],
  dob: [required('Please enter your date of birth.')],
  mobile: [required('Please enter your mobile number.'), indianPhone('Please enter a 10-digit Indian mobile number.')],
  email: [required('Please enter your email address.'), email('This email address looks incomplete. Please check it.')],
  qualification: [required('Please enter your qualification.'), maxLength(200)],
  experience: [required('Please choose your experience.')],
  previousCompanies: [maxLength(PREVIOUS_MAX, `Please keep this to ${PREVIOUS_MAX} characters.`)],
  whyJoin: [maxLength(WHY_MAX, `Please keep this to ${WHY_MAX} characters.`)],
});

const ROLE_ERROR = 'Please choose the role you’re applying for.';
const FIELD_ORDER: (keyof ApplicationValues | 'role')[] = [
  'role',
  'fullName',
  'fatherName',
  'dob',
  'mobile',
  'email',
  'qualification',
  'experience',
];

const fieldId = (field: keyof ApplicationValues | 'role') => `apply-${field}`;
const errorProps = (field: keyof ApplicationValues, error?: string) => fieldErrorProps(fieldId(field), error);
const checkField = (field: keyof ApplicationValues, values: ApplicationValues) =>
  schema[field] ? validateForm(values, { [field]: schema[field] } as FormSchema<ApplicationValues>)[field] : undefined;

const todayInIndia = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

interface ApplicationFormProps {
  /** Role names that can be chosen, in order; "Any suitable role" is added at the end. */
  roles: string[];
  /** The chosen role, kept by the page so "Apply for this role" can set it. */
  role: string;
  onRoleChange: (role: string) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ roles, role, onRoleChange }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState<{ name: string; role: string } | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [roleError, setRoleError] = useState<string>();
  const [maxDob] = useState(todayInIndia);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  // Once a submit has been tried, empty required fields are flagged on blur too.
  const triedRef = useRef(false);

  const { canSubmit, recordAttempt, timeUntilReset } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    storageKey: 'career_submission_limit',
  });
  const { values, handleChange, errors, setValues, setErrors } = useFormValidation<ApplicationValues>(INITIAL_VALUES, {
    validationSchema: schema,
  });
  const { loadDraft, clearDraft } = useFormDraft('career_form_draft', values);

  // Bring back an unfinished application after a reload (the draft lasts until
  // the tab closes).
  const restoredDraft = useRef(false);
  useEffect(() => {
    if (restoredDraft.current) return;
    restoredDraft.current = true;
    void Promise.resolve(loadDraft()).then((draft) => {
      if (draft) {
        setValues((prev) => ({ ...prev, ...draft }));
      }
    });
  }, [loadDraft, setValues]);

  useEffect(() => {
    if (sent) {
      sentHeadingRef.current?.focus();
    }
  }, [sent]);

  const setFieldError = (field: keyof ApplicationValues, message?: string) => {
    setErrors((prev) => {
      if (prev[field] === message) return prev;
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const onFieldChange =
    (field: keyof ApplicationValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      handleChange(field, value);
      if (errors[field]) {
        setFieldError(field, checkField(field, { ...values, [field]: value }));
      }
    };

  const onFieldBlur =
    (field: keyof ApplicationValues) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.target.value.trim() || triedRef.current) {
        setFieldError(field, checkField(field, values));
      }
    };

  const chooseRole = (value: string) => {
    onRoleChange(value);
    setRoleError(undefined);
  };

  const chooseExperience = (value: string) => {
    handleChange('experience', value);
    setFieldError('experience', undefined);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // A filled honeypot means a bot, or a browser that autofilled the hidden
    // field. The application isn't sent, but a person is told how else to
    // reach us rather than seeing nothing happen.
    if (honeypot) {
      logger.warn('Career form: hidden spam-check field was filled', { form: 'careers' });
      addToast(`We could not send your application. Please email us at ${CAREERS_CONTACT_EMAIL}`, 'error');
      return;
    }

    if (!canSubmit) {
      addToast(`Please wait ${timeUntilReset}s before trying again.`, 'error');
      return;
    }

    triedRef.current = true;
    const validationErrors = validateForm(values, schema);
    const missingRole = role ? undefined : ROLE_ERROR;
    setErrors(validationErrors);
    setRoleError(missingRole);
    const firstError = FIELD_ORDER.find((field) => (field === 'role' ? missingRole : validationErrors[field]));
    if (firstError) {
      const target =
        firstError === 'role' || firstError === 'experience'
          ? document.querySelector<HTMLInputElement>(`#${fieldId(firstError)} input`)
          : document.getElementById(fieldId(firstError));
      window.requestAnimationFrame(() => target?.focus());
      addToast('Please check the highlighted fields.', 'error');
      return;
    }

    // Count an attempt only once the form is valid and about to be sent, so
    // validation mistakes don't use up the rate limit.
    recordAttempt();
    setIsSubmitting(true);

    try {
      await submitToFormSubmit({
        position: headerSafe(role),
        fullName: normalizeInput(values.fullName),
        fatherName: normalizeInput(values.fatherName),
        dob: headerSafe(values.dob, 30),
        mobile: headerSafe(values.mobile, 30),
        email: headerSafe(values.email, 254),
        qualification: normalizeInput(values.qualification),
        experience: headerSafe(values.experience, 80),
        previousCompanies: normalizeInput(values.previousCompanies, { preserveLineBreaks: true }),
        whyJoin: normalizeInput(values.whyJoin, { preserveLineBreaks: true }),
        _subject: buildCareerSubject(values.fullName, role),
        _honey: honeypot,
        _template: 'table',
      });

      setSent({ name: values.fullName.trim().split(/\s+/)[0] ?? '', role });
      clearDraft();
      setValues(INITIAL_VALUES);
      triedRef.current = false;
    } catch (error) {
      logger.error('Career form error', { error, form: 'careers' });
      let message = `We could not send your application. Please email us at ${CAREERS_CONTACT_EMAIL}`;
      if (error instanceof ApiError) {
        if (error.code === 'NETWORK_ERROR') {
          message = 'Network unavailable. Please check your connection and try again.';
        } else if (error.code === 'TIMEOUT') {
          message = 'The request timed out. Please check your connection and try again.';
        } else if (error.message) {
          message = error.message;
        }
      }
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendAnother = () => {
    setSent(null);
    window.requestAnimationFrame(() => document.getElementById(fieldId('fullName'))?.focus());
  };

  const roleChoices = [...roles, ANY_ROLE];

  return (
    <>
      <p className="vh" role="status" aria-live="polite" aria-atomic="true">
        {sent ? 'Application sent.' : ''}
      </p>

      <div hidden={Boolean(sent)}>
        <h2 id="apply-heading">Apply</h2>
        <p className="fintro">
          Fields marked <span className="req-key">*</span> are required. It takes about five minutes.
        </p>
        <form className="rd-form" onSubmit={handleSubmit} noValidate aria-labelledby="apply-heading">
          <Honeypot name="_honey" value={honeypot} onChange={setHoneypot} />

          <fieldset className="fld" id={fieldId('role')} data-err={roleError ? '' : undefined}>
            <legend>
              Applying for{' '}
              <span className="req" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="chips">
              {roleChoices.map((choice) => (
                <label className="chip" key={choice}>
                  <input
                    type="radio"
                    name="position"
                    value={choice}
                    checked={role === choice}
                    onChange={() => chooseRole(choice)}
                    aria-describedby={roleError ? `${fieldId('role')}-error` : undefined}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
            {roleError && (
              <p className="err" id={`${fieldId('role')}-error`}>
                {roleError}
              </p>
            )}
          </fieldset>

          <div className="row2">
            <FormField id={fieldId('fullName')} label="Full name" required error={errors.fullName}>
              <input
                id={fieldId('fullName')}
                name="fullName"
                autoComplete="name"
                maxLength={100}
                required
                value={values.fullName}
                onChange={onFieldChange('fullName')}
                onBlur={onFieldBlur('fullName')}
                {...errorProps('fullName', errors.fullName)}
              />
            </FormField>
            <FormField id={fieldId('fatherName')} label="Father’s name" required error={errors.fatherName}>
              <input
                id={fieldId('fatherName')}
                name="fatherName"
                autoComplete="off"
                maxLength={100}
                required
                value={values.fatherName}
                onChange={onFieldChange('fatherName')}
                onBlur={onFieldBlur('fatherName')}
                {...errorProps('fatherName', errors.fatherName)}
              />
            </FormField>
          </div>

          <div className="row2">
            <FormField id={fieldId('dob')} label="Date of birth" required error={errors.dob}>
              <input
                id={fieldId('dob')}
                name="dob"
                type="date"
                min="1940-01-01"
                max={maxDob}
                autoComplete="bday"
                required
                value={values.dob}
                onChange={onFieldChange('dob')}
                onBlur={onFieldBlur('dob')}
                {...errorProps('dob', errors.dob)}
              />
            </FormField>
            <FormField id={fieldId('mobile')} label="Mobile number" required error={errors.mobile}>
              <input
                id={fieldId('mobile')}
                name="mobile"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
                required
                value={values.mobile}
                onChange={onFieldChange('mobile')}
                onBlur={onFieldBlur('mobile')}
                {...errorProps('mobile', errors.mobile)}
              />
            </FormField>
          </div>

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

          <FormField id={fieldId('qualification')} label="Qualification" required error={errors.qualification}>
            <input
              id={fieldId('qualification')}
              name="qualification"
              maxLength={200}
              required
              value={values.qualification}
              onChange={onFieldChange('qualification')}
              onBlur={onFieldBlur('qualification')}
              {...errorProps('qualification', errors.qualification)}
            />
          </FormField>

          <fieldset className="fld" id={fieldId('experience')} data-err={errors.experience ? '' : undefined}>
            <legend>
              Experience{' '}
              <span className="req" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="chips">
              {EXPERIENCE_OPTIONS.map((option) => (
                <label className="chip" key={option}>
                  <input
                    type="radio"
                    name="experience"
                    value={option}
                    checked={values.experience === option}
                    onChange={() => chooseExperience(option)}
                    aria-describedby={errors.experience ? `${fieldId('experience')}-error` : undefined}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.experience && (
              <p className="err" id={`${fieldId('experience')}-error`}>
                {errors.experience}
              </p>
            )}
          </fieldset>

          <FormField
            id={fieldId('previousCompanies')}
            label="Where you’ve worked before"
            optional
            error={errors.previousCompanies}
          >
            <textarea
              id={fieldId('previousCompanies')}
              name="previousCompanies"
              rows={3}
              maxLength={PREVIOUS_MAX}
              value={values.previousCompanies}
              onChange={onFieldChange('previousCompanies')}
              onBlur={onFieldBlur('previousCompanies')}
              {...errorProps('previousCompanies', errors.previousCompanies)}
            />
          </FormField>

          <FormField id={fieldId('whyJoin')} label="Why you’d like to join us" optional error={errors.whyJoin}>
            <textarea
              id={fieldId('whyJoin')}
              name="whyJoin"
              rows={3}
              maxLength={WHY_MAX}
              value={values.whyJoin}
              onChange={onFieldChange('whyJoin')}
              onBlur={onFieldBlur('whyJoin')}
              {...errorProps('whyJoin', errors.whyJoin)}
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
                  <span>Send application</span>
                  <ArrowRight />
                </>
              )}
            </button>
            {!canSubmit && <span className="draft">You can send another application in a minute.</span>}
          </div>
          <p className="fine">
            We use your details only to consider your application, and keep them for up to a year. See our{' '}
            <Link to="/privacy">privacy policy</Link>.
          </p>
        </form>
      </div>

      <div className="sent" hidden={!sent}>
        <h2 ref={sentHeadingRef} tabIndex={-1}>
          Thank you{sent?.name ? `, ${sent.name}` : ''}.
        </h2>
        <p>
          {sent?.role === ANY_ROLE
            ? 'We have your details. If a suitable role opens in the next year, we’ll call you.'
            : `We have your application for ${sent?.role ?? 'the role'}. If your background fits, we’ll call you within ${CAREERS_RESPONSE_TIME}.`}
        </p>
        <p>
          Questions in the meantime? Email <a href={`mailto:${CAREERS_CONTACT_EMAIL}`}>{CAREERS_CONTACT_EMAIL}</a>.
        </p>
        <div className="acts">
          <button type="button" onClick={sendAnother}>
            Send another application
          </button>
        </div>
      </div>
    </>
  );
};

export default ApplicationForm;
