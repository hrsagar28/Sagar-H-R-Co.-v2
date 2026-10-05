import React from 'react';

interface FormFieldProps {
  /** id of the input inside; the error message gets `${id}-error`. */
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  /** Shown beside the label, such as a character count. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A labelled field in the redesigned forms (Contact, Careers): the label over a
 * single underline, with the error below it. No hint or placeholder text; the
 * labels say what to enter. Styled by `.fld` in redesign.css.
 */
const FormField: React.FC<FormFieldProps> = ({ id, label, required, optional, error, aside, children }) => (
  <div className="fld" data-err={error ? '' : undefined}>
    <label htmlFor={id}>
      {label}
      {required && (
        <>
          {' '}
          <span className="req" aria-hidden="true">
            *
          </span>
        </>
      )}
      {optional && (
        <>
          {' '}
          <span className="opt">(optional)</span>
        </>
      )}
    </label>
    {aside}
    {children}
    {error && (
      <p className="err" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

/** aria attributes for an input whose FormField may be showing an error. */
export const fieldErrorProps = (id: string, error?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
});

export default FormField;
