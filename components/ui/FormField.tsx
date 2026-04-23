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
  labelClassName = "",
  hintClassName = ""
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={name} className={`block text-sm font-semibold zone-text mb-2 ${labelClassName}`}>
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, {
        id: name,
        name: name,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
        className: `${children.props.className || ''} ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`.trim()
      }) : children}

      {hint && !error && <p id={`${name}-hint`} className={`zone-text-muted text-xs mt-2 text-right tabular-nums ${hintClassName}`}>{hint}</p>}
      {error && <p id={`${name}-error`} className="text-red-500 font-bold text-xs mt-2" aria-live="polite">{error}</p>}
    </div>
  );
};

export default FormField;
