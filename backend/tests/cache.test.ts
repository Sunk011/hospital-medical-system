import { describe, it, expect, beforeEach, vi } from 'vitest';
import CacheService from '../src/utils/cache';

describe('CacheService', () => {
  let cache: CacheService<string>;

  beforeEach(() => {
    cache = new CacheService<string>(1);
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should return cached value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for expired key', async () => {
      cache.set('key1', 'value1', { ttl: 10 });
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with default TTL', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should store value with custom TTL', () => {
      cache.set('key1', 'value1', { ttl: 5000 });
      expect(cache.get('key1')).toBe('value1');
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      cache.set('key1', 'value1', { ttl: 10 });
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all cached values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });
  });
});
