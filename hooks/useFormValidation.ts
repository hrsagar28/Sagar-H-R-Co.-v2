import { useState, useCallback } from 'react';

type ValidationRule<T> = (values: T) => string | undefined;
type ValidationSchema<T> = Record<keyof T, ValidationRule<T>>;

export const useFormValidation = <T extends Record<string, any>>(initialState: T) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being modified
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  /**
   * Validates the form state against a schema.
   * You can pass a partial schema to validate only specific fields (useful for multi-step forms).
   */
  const validate = useCallback((schema: Partial<ValidationSchema<T>>) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    Object.keys(schema).forEach((key) => {
      const rule = schema[key as keyof T];
      if (rule) {
         const error = rule(values);
         if (error) {
           newErrors[key] = error;
           isValid = false;
         }
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  }, [values]);

  const clearErrors = () => setErrors({});

  return { values, setValues, errors, handleChange, validate, setErrors, clearErrors };
};