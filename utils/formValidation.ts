
import { validateEmail as isValidEmail, validatePhone as isValidPhone } from './validation';

export type Validator<T> = (value: T) => string | undefined;

export const required = (message = 'This field is required'): Validator<any> => 
  (value) => (!value || (typeof value === 'string' && !value.trim()) ? message : undefined);

export const minLength = (min: number, message?: string): Validator<string> => 
  (value) => (value && value.length < min ? (message || `Must be at least ${min} characters`) : undefined);

export const maxLength = (max: number, message?: string): Validator<string> => 
  (value) => (value && value.length > max ? (message || `Must be less than ${max} characters`) : undefined);

export const email = (message = 'Invalid email address'): Validator<string> => 
  (value) => (value && !isValidEmail(value) ? message : undefined);

export const indianPhone = (message = 'Invalid Indian mobile number'): Validator<string> => 
  (value) => (value && !isValidPhone(value) ? message : undefined);

export type FormSchema<T> = {
  [K in keyof T]?: Validator<T[K]> | Validator<T[K]>[];
};

export const createFormSchema = <T>(schema: FormSchema<T>) => schema;

export const validateForm = <T>(values: T, schema: FormSchema<T>): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const key in schema) {
    const validators = schema[key];
    const value = values[key];
    
    if (Array.isArray(validators)) {
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[key] = error;
          break; // Stop at first error
        }
      }
    } else if (typeof validators === 'function') {
      const error = validators(value);
      if (error) errors[key] = error;
    }
  }
  return errors;
};
