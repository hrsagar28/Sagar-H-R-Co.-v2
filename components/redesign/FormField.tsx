import React from 'react';

interface FormFieldProps {
  /** id of the input inside; the error message gets `${id}-error`. */
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  /** A short line under the label on what to enter, such as an example.
   *  Pass `hint` to fieldErrorProps too, so the input is described by it. */
  hint?: string;
  /** Shown beside the label, such as a character count. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A labelled field in the redesigned forms (Contact, Careers): the label, an
 * optional hint, a single underline, and the error below it. Hints sit under
 * the label rather than inside the box as placeholder text, so every box
 * starts empty and the hint stays visible while typing. Styled by `.fld` in
 * redesign.css.
 */
const FormField: React.FC<FormFieldProps> = ({ id, label, required, optional, hint, error, aside, children }) => (
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
    {hint && (
      <p className="hint" id={`${id}-hint`}>
        {hint}
      </p>
    )}
    {aside}
    {children}
    {error && (
      <p className="err" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

/** aria attributes for an input whose FormField may show a hint or an error. */
export const fieldErrorProps = (id: string, error?: string, hint?: string) => {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  };
};

export default FormField;
