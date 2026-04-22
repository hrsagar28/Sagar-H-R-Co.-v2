import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  hint,
  required,
  children
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-semibold text-brand-dark mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, {
        id: name,
        name: name,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
        className: `${children.props.className || ''} ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border'}`.trim()
      }) : children}
      
      {hint && !error && <p id={`${name}-hint`} className="text-brand-stone text-xs mt-2">{hint}</p>}
      {error && <p id={`${name}-error`} className="text-red-500 font-bold text-xs mt-2" aria-live="polite">{error}</p>}
    </div>
  );
};

export default FormField;
