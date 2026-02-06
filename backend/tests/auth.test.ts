import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth Service Utils', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    const secret = 'test-secret-key';
    const payload = { userId: 1, username: 'testuser', role: 'admin' };

    it('should generate token correctly', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '2h' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should verify token correctly', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '2h' });
      const decoded = jwt.verify(token, secret) as typeof payload;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject expired token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '-1s' });
      expect(() => jwt.verify(token, secret)).toThrow();
    });

    it('should reject invalid token', () => {
      expect(() => jwt.verify('invalid-token', secret)).toThrow();
    });
  });

  describe('Token Expiration', () => {
    it('should set correct expiration time', () => {
      const expiresIn = '2h';
      const decoded = jwt.sign({ test: true }, 'secret', { expiresIn });
      const payload = JSON.parse(atob(decoded.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      expect(payload.exp).toBeGreaterThan(now);
      expect(payload.exp - now).toBeLessThanOrEqual(7205);
    });
  });
});
