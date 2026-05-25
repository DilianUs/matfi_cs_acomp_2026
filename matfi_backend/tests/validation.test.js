import ValidationUtils from '../src/utils/validation.js';

describe('ValidationUtils', () => {
  test('isValidEmail returns true for valid emails and false for invalid', () => {
    expect(ValidationUtils.isValidEmail('juan@example.com')).toBe(true);
    expect(ValidationUtils.isValidEmail('bad-email')).toBe(false);
    expect(ValidationUtils.isValidEmail('')).toBe(false);
  });

  test('isValidPassword enforces minimum length', () => {
    expect(ValidationUtils.isValidPassword('password123')).toBe(true);
    expect(ValidationUtils.isValidPassword('short')).toBe(false);
    expect(ValidationUtils.isValidPassword(null)).toBeFalsy();
  });

  test('isNotEmpty detects empty values', () => {
    expect(ValidationUtils.isNotEmpty('hola')).toBe(true);
    expect(ValidationUtils.isNotEmpty('   ')).toBe(false);
    expect(ValidationUtils.isNotEmpty(null)).toBe(false);
  });

  test('isPositiveNumber validates numeric positivity', () => {
    expect(ValidationUtils.isPositiveNumber(5)).toBe(true);
    expect(ValidationUtils.isPositiveNumber('0')).toBe(false);
    expect(ValidationUtils.isPositiveNumber(-3)).toBe(false);
  });

  test('isValidDate validates YYYY-MM-DD', () => {
    expect(ValidationUtils.isValidDate('2026-05-25')).toBe(true);
    expect(ValidationUtils.isValidDate('25-05-2026')).toBe(false);
    expect(ValidationUtils.isValidDate('invalid')).toBe(false);
  });
});
