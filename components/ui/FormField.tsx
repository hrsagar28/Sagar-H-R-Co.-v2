import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  labelClassName?: string;
  hintClassName?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  hint,
  required,
  children,
  labelClassName = '',
  hintClassName = '',
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={name} className={`zone-text mb-2 block text-sm font-semibold ${labelClassName}`}>
        {label}{' '}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {React.isValidElement<{
        id?: string;
        name?: string;
        className?: string;
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
      }>(children)
        ? React.cloneElement(children, {
            id: name,
            name,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
            className: `${children.props.className || ''} ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`.trim(),
          })
        : children}

      {hint && !error && (
        <p id={`${name}-hint`} className={`zone-text-muted mt-2 text-right text-xs tabular-nums ${hintClassName}`}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-xs font-bold text-red-500" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
