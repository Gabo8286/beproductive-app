import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeStorage, safeJSON, asyncStorage } from '@/utils/storage/safeStorage';

describe('SafeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('safeStorage.setItem', () => {
    it('should store item in localStorage when available', () => {
      const result = safeStorage.setItem('test-key', 'test-value');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should handle localStorage quota exceeded error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock quota exceeded error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      const result = safeStorage.setItem('test-key', 'test-value');
      
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should use memory fallback when localStorage is not available', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage not available
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = safeStorage.setItem('test-key', 'test-value');
      
      expect(result).toBe(true);
      
      consoleWarnSpy.mockRestore();
    });

    it('should store item with expiration in memory fallback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = safeStorage.setItem('test-key', 'test-value', 5000);
      
      expect(result).toBe(true);
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('safeStorage.getItem', () => {
    it('should retrieve item from localStorage when available', () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = safeStorage.getItem('test-key');
      
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      const result = safeStorage.getItem('non-existent-key');
      
      expect(result).toBeNull();
    });

    it('should retrieve item from memory fallback when localStorage fails', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // First set an item using memory fallback
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      safeStorage.setItem('test-key', 'test-value');
      const result = safeStorage.getItem('test-key');
      
      expect(result).toBe('test-value');
      
      consoleWarnSpy.mockRestore();
    });

    it('should return null for expired item in memory fallback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Set item with 0ms expiration (already expired)
      safeStorage.setItem('test-key', 'test-value', -1);
      
      // Wait a bit to ensure expiration
      const result = safeStorage.getItem('test-key');
      
      expect(result).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('safeStorage.removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = safeStorage.removeItem('test-key');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should remove item from memory fallback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      safeStorage.setItem('test-key', 'test-value');
      const result = safeStorage.removeItem('test-key');
      
      expect(result).toBe(true);
      expect(safeStorage.getItem('test-key')).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('safeStorage.clear', () => {
    it('should clear all storage', () => {
      localStorage.setItem('test-key-1', 'value-1');
      localStorage.setItem('test-key-2', 'value-2');
      
      safeStorage.clear();
      
      expect(localStorage.length).toBe(0);
    });

    it('should clear memory fallback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      safeStorage.setItem('test-key', 'test-value');
      safeStorage.clear();
      
      expect(safeStorage.getItem('test-key')).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('safeStorage.getStorageInfo', () => {
    it('should return storage info', () => {
      const info = safeStorage.getStorageInfo();
      
      expect(info).toHaveProperty('isLocalStorageAvailable');
      expect(info).toHaveProperty('memoryFallbackSize');
      expect(info).toHaveProperty('totalMemoryItems');
    });
  });
});

describe('safeJSON', () => {
  describe('parse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSON.parse('{"key": "value"}');
      
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = safeJSON.parse('invalid json', { default: 'fallback' });
      
      expect(result).toEqual({ default: 'fallback' });
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should return null by default for invalid JSON', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = safeJSON.parse('invalid json');
      
      expect(result).toBeNull();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('stringify', () => {
    it('should stringify valid object', () => {
      const result = safeJSON.stringify({ key: 'value' });
      
      expect(result).toBe('{"key":"value"}');
    });

    it('should return fallback for unstringifiable object', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const circular: any = {};
      circular.self = circular;
      
      const result = safeJSON.stringify(circular, '{"error": true}');
      
      expect(result).toBe('{"error": true}');
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should return default fallback for unstringifiable object', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const circular: any = {};
      circular.self = circular;
      
      const result = safeJSON.stringify(circular);
      
      expect(result).toBe('{}');
      
      consoleWarnSpy.mockRestore();
    });
  });
});

describe('asyncStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getItem', () => {
    it('should asynchronously get item', async () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = await asyncStorage.getItem('test-key');
      
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const result = await asyncStorage.getItem('non-existent-key');
      
      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should asynchronously set item', async () => {
      const result = await asyncStorage.setItem('test-key', 'test-value');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should asynchronously set item with expiration', async () => {
      const result = await asyncStorage.setItem('test-key', 'test-value', 5000);
      
      expect(result).toBe(true);
    });
  });

  describe('removeItem', () => {
    it('should asynchronously remove item', async () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = await asyncStorage.removeItem('test-key');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });
});
