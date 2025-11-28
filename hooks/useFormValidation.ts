
import { useState, useCallback } from 'react';

type ValidationRule<T> = (values: T) => string | undefined;

type EnhancedValidationRule<T> = {
  test: (values: T) => boolean;
  message: string;
  severity?: 'error' | 'warning';
};

type Rule<T> = ValidationRule<T> | EnhancedValidationRule<T>;

type ValidationSchema<T> = Partial<Record<keyof T, Rule<T>>>;

interface UseFormValidationOptions<T> {
  validateOnChange?: boolean;
  validationSchema?: ValidationSchema<T>;
}

/**
 * Hook for managing form validation state and logic.
 * 
 * @template T
 * @param {T} initialState - Initial values for the form fields.
 * @param {UseFormValidationOptions<T>} [options] - Validation configuration options.
 * @returns {object} Form state and validation methods.
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialState: T,
  options: UseFormValidationOptions<T> = {}
) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const validateField = (name: keyof T, value: any, schema: ValidationSchema<T> = options.validationSchema || {}) => {
    const rule = schema[name];
    if (rule) {
      const tempValues = { ...values, [name]: value };
      
      let error: string | undefined;
      let warning: string | undefined;

      if (typeof rule === 'function') {
        error = rule(tempValues);
      } else {
        const isValid = rule.test(tempValues);
        if (!isValid) {
          if (rule.severity === 'warning') warning = rule.message;
          else error = rule.message;
        }
      }

      setErrors(prev => {
        const next = { ...prev };
        if (error) next[name as string] = error;
        else delete next[name as string];
        return next;
      });

      setWarnings(prev => {
        const next = { ...prev };
        if (warning) next[name as string] = warning;
        else delete next[name as string];
        return next;
      });
      
      return !error;
    }
    return true;
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // If validation schema is provided and real-time validation is on
    if (options.validateOnChange && options.validationSchema) {
        validateField(name, value);
    } else {
        // Default behavior: clear error when user types
        if (errors[name as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as string];
                return newErrors;
            });
        }
    }
  };

  const validate = useCallback((schema: ValidationSchema<T> = options.validationSchema || {}) => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};
    let isValid = true;
    
    Object.keys(schema).forEach((key) => {
      const rule = schema[key as keyof T];
      if (rule) {
         if (typeof rule === 'function') {
             const error = rule(values);
             if (error) {
               newErrors[key] = error;
               isValid = false;
             }
         } else {
             if (!rule.test(values)) {
                 if (rule.severity === 'warning') {
                     newWarnings[key] = rule.message;
                 } else {
                     newErrors[key] = rule.message;
                     isValid = false;
                 }
             }
         }
      }
    });
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    return isValid;
  }, [values, options.validationSchema]);

  const clearErrors = () => {
      setErrors({});
      setWarnings({});
  };

  return { values, setValues, errors, warnings, handleChange, validate, setErrors, clearErrors };
};
