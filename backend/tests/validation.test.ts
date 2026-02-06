import { describe, it, expect } from 'vitest';

describe('Validation Utils', () => {
  describe('ID Card Validation', () => {
    const isValidIdCardFormat = (idCard: string): boolean => {
      return /^\d{17}[\dXx]$/.test(idCard);
    };

    it('should validate correct format ID card', () => {
      expect(isValidIdCardFormat('11010119900101123X')).toBe(true);
      expect(isValidIdCardFormat('110101199001011234')).toBe(true);
    });

    it('should reject invalid ID card format', () => {
      expect(isValidIdCardFormat('123')).toBe(false);
      expect(isValidIdCardFormat('11010119900101123')).toBe(false);
      expect(isValidIdCardFormat('1101011990010112345')).toBe(false);
      expect(isValidIdCardFormat('11010119900101123G')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    const isValidPhone = (phone: string): boolean => {
      return /^1[3-9]\d{9}$/.test(phone);
    };

    it('should validate correct phone numbers', () => {
      expect(isValidPhone('13800138000')).toBe(true);
      expect(isValidPhone('13912345678')).toBe(true);
      expect(isValidPhone('18612345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('1380013800')).toBe(false);
      expect(isValidPhone('138001380000')).toBe(false);
      expect(isValidPhone('12800138000')).toBe(false);
      expect(isValidPhone('13800-138000')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    const isValidEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('admin@hospital.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    const isValidDate = (dateStr: string): boolean => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    };

    it('should validate correct date formats', () => {
      expect(isValidDate('1990-01-01')).toBe(true);
      expect(isValidDate('2026-02-05')).toBe(true);
      expect(isValidDate('2026-02-05T10:00:00Z')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('Name Validation', () => {
    const isValidName = (name: string): boolean => {
      return /^[\u4e00-\u9fa5a-zA-Z\s]{2,50}$/.test(name);
    };

    it('should validate Chinese names', () => {
      expect(isValidName('张三')).toBe(true);
      expect(isValidName('李晓明')).toBe(true);
    });

    it('should validate English names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Jane')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('A')).toBe(false);
      expect(isValidName('')).toBe(false);
      expect(isValidName('Test@123')).toBe(false);
    });
  });
});
