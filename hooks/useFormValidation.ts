
import { useState, useCallback } from 'react';
import { FormSchema, validateForm } from '../utils/formValidation';

interface UseFormValidationOptions<T> {
  validateOnChange?: boolean;
  validationSchema?: FormSchema<T>;
}

/**
 * Hook for managing form validation state and logic using the new schema builder.
 */
export const useFormValidation = <T extends {}>(
  initialState: T,
  options: UseFormValidationOptions<T> = {}
) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback((name: keyof T, value: T[keyof T]) => {
    if (!options.validationSchema) return;
    
    // Create a mini-schema for just this field to validate it in isolation
    // We cast it to FormSchema<T> to satisfy type check even though it's partial
    const fieldValidators = options.validationSchema[name];
    if (!fieldValidators) return;

    const miniSchema: any = { [name]: fieldValidators };
    const fieldErrors = validateForm({ ...values, [name]: value }, miniSchema);
    
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name] || undefined
    }));
  }, [options.validationSchema, values]);

  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (options.validateOnChange) {
      validateField(name, value);
    } else {
        // Clear specific error on change if not validating aggressively
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }
  };

  /**
   * Run validation against the schema.
   * Can accept an optional override schema for partial validation (e.g. multi-step forms).
   */
  const validate = useCallback((overrideSchema?: FormSchema<T>) => {
    const schemaToUse = overrideSchema || options.validationSchema;
    if (!schemaToUse) return true;
    
    const newErrors = validateForm(values, schemaToUse);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [values, options.validationSchema]);

  const clearErrors = () => setErrors({});

  return { values, setValues, errors, handleChange, validate, setErrors, clearErrors };
};
