import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validatePhoneAnyCountry } from './validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate standard email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('user+tag@domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false); // Missing TLD in regex if enforced, or basic structure
      expect(validateEmail('plainaddress')).toBe(false);
      expect(validateEmail('@missingusername.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate Indian mobile numbers', () => {
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('919876543210')).toBe(true);
      expect(validatePhone('+919876543210')).toBe(true);
      expect(validatePhone('+91 98765 43210')).toBe(true); // with spaces
      expect(validatePhone('98765-43210')).toBe(true); // with dashes
    });

    it('should reject invalid numbers', () => {
      expect(validatePhone('1234567890')).toBe(false); // Does not start with 6-9
      expect(validatePhone('987654321')).toBe(false); // Too short
      expect(validatePhone('98765432100')).toBe(false); // Too long
      expect(validatePhone('abcdefghij')).toBe(false); // Non-numeric
    });
  });

  describe('validatePhoneAnyCountry', () => {
    it('accepts Indian mobiles as before', () => {
      expect(validatePhoneAnyCountry('9876543210')).toBe(true);
      expect(validatePhoneAnyCountry('+91 98765 43210')).toBe(true);
      expect(validatePhoneAnyCountry('0091 98765 43210')).toBe(true);
    });

    it('accepts foreign numbers written with the country code', () => {
      expect(validatePhoneAnyCountry('+971 50 123 4567')).toBe(true); // UAE
      expect(validatePhoneAnyCountry('+1 (415) 555-0123')).toBe(true); // US
      expect(validatePhoneAnyCountry('+44 7700 900123')).toBe(true); // UK
      expect(validatePhoneAnyCountry('0065 9123 4567')).toBe(true); // Singapore, 00 prefix
    });

    it('rejects numbers it cannot place', () => {
      expect(validatePhoneAnyCountry('+91 12345 67890')).toBe(false); // +91 but not an Indian mobile
      expect(validatePhoneAnyCountry('4155550123')).toBe(false); // foreign, no country code
      expect(validatePhoneAnyCountry('+0 123 456 789')).toBe(false); // no country starts with 0
      expect(validatePhoneAnyCountry('+1234567890123456')).toBe(false); // over 15 digits
      expect(validatePhoneAnyCountry('+12345')).toBe(false); // too short
      expect(validatePhoneAnyCountry('+971 abc')).toBe(false);
    });
  });
});
