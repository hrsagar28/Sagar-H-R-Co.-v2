import { validateEmail, validatePhone } from './validation';

export const required = (fieldName: string) => (value: string) => 
  !value?.toString().trim() ? `${fieldName} is required` : undefined;

export const phoneValidation = (value: string) => {
  if (!value?.trim()) return 'Mobile number is required';
  if (!validatePhone(value)) return 'Invalid Indian mobile number';
  return undefined;
};

export const emailValidation = (isRequired = true) => (value: string) => {
  if (!value?.trim()) return isRequired ? 'Email is required' : undefined;
  if (!validateEmail(value)) return 'Invalid email address';
  return undefined;
};

export const minLength = (min: number) => (value: string) =>
  value && value.length < min ? `Must be at least ${min} characters` : undefined;

export const maxLength = (max: number) => (value: string) =>
  value && value.length > max ? `Must be less than ${max} characters` : undefined;
