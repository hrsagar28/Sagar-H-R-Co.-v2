import { useState, useCallback } from 'react';

type ValidationRule<T> = (values: T) => string | undefined;
type ValidationSchema<T> = Record<keyof T, ValidationRule<T>>;

/**
 * useFormValidation Hook
 * 
 * A lightweight hook for managing form state and validation logic.
 * 
 * @param initialState - Initial values for the form fields
 * @returns Object containing form state, change handlers, and validation utilities
 * 
 * @example
 * const { values, handleChange, errors, validate } = useFormValidation({ name: '' });
 * 
 * const handleSubmit = () => {
 *   const isValid = validate({
 *     name: (v) => !v.name ? 'Name is required' : undefined
 *   });
 *   if (isValid) {
 *     // submit logic
 *   }
 * }
 */
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