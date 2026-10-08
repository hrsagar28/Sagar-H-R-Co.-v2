import { useState } from 'react';

/**
 * A form's values and its field errors. The forms (Contact, the careers
 * application) validate with utils/formValidation.ts themselves, when a field
 * is left and on submit, and set the errors here; typing in a field clears its
 * error.
 */
export const useFormValidation = <T extends object>(initialState: T) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return { values, setValues, errors, handleChange, setErrors };
};
