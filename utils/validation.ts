/**
 * Comprehensive email regex compliant with RFC 5322
 */
export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

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

/**
 * Any mobile number, for forms that clients abroad also use (Contact). An
 * Indian number passes on the rule above; a foreign one must carry its country
 * code, written "+" or "00", with 7 to 15 digits in all (the E.164 maximum).
 * Spaces, dashes, dots and brackets between digits are ignored. A +91 number
 * must still be a valid Indian mobile.
 */
export const validatePhoneAnyCountry = (phone: string): boolean => {
  const clean = phone.replace(/[\s\-.()]/g, '');
  if (indianPhoneRegex.test(clean)) return true;
  const withPlus = clean.replace(/^00/, '+');
  if (withPlus.startsWith('+91')) return indianPhoneRegex.test(withPlus);
  return /^\+[1-9]\d{6,14}$/.test(withPlus);
};
