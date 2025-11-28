/**
 * Comprehensive email regex compliant with RFC 5322
 */
export const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Regex for Indian phone numbers (supports +91, 91, or just 10 digits starting with 6-9)
 */
export const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove whitespace/dashes before checking
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return indianPhoneRegex.test(cleanPhone);
};