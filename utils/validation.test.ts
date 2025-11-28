
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone } from './validation';

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
});
