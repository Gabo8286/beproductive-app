/**
 * Safe localStorage wrapper that handles failures gracefully
 * Prevents main thread blocking in Safari/Brave private browsing mode
 */

interface StorageItem {
  value: any;
  timestamp: number;
  expiresAt?: number;
}

class SafeStorage {
  private isAvailable: boolean | null = null;
  private memoryFallback: Map<string, StorageItem> = new Map();

  /**
   * Check if localStorage is available and working
   */
  private checkAvailability(): boolean {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      // Test localStorage with a simple operation
      const testKey = "__storage_test__";
      const testValue = "test";

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      this.isAvailable = retrieved === testValue;
      return this.isAvailable;
    } catch (error) {
      console.warn("[SafeStorage] localStorage not available:", error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Safely get item from storage
   */
  getItem(key: string): string | null {
    try {
      if (this.checkAvailability()) {
        return localStorage.getItem(key);
      } else {
        // Use memory fallback
        const item = this.memoryFallback.get(key);
        if (item) {
          // Check expiration
          if (item.expiresAt && Date.now() > item.expiresAt) {
            this.memoryFallback.delete(key);
            return null;
          }
          return typeof item.value === "string"
            ? item.value
            : JSON.stringify(item.value);
        }
        return null;
      }
    } catch (error) {
      console.warn(`[SafeStorage] Failed to get item "${key}":`, error);
      return null;
    }
  }

  /**
   * Safely set item in storage
   */
  setItem(key: string, value: string, expirationMs?: number): boolean {
    try {
      if (this.checkAvailability()) {
        localStorage.setItem(key, value);
        return true;
      } else {
        // Use memory fallback
        const item: StorageItem = {
          value,
          timestamp: Date.now(),
          expiresAt: expirationMs ? Date.now() + expirationMs : undefined,
        };
        this.memoryFallback.set(key, item);
        return true;
      }
    } catch (error) {
      console.warn(`[SafeStorage] Failed to set item "${key}":`, error);

      // If quota exceeded, try to clear old items
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        this.clearExpiredItems();
        // Try again
        try {
          if (this.checkAvailability()) {
            localStorage.setItem(key, value);
            return true;
          }
        } catch (retryError) {
          console.warn(`[SafeStorage] Retry failed for "${key}":`, retryError);
        }
      }

      return false;
    }
  }

  /**
   * Safely remove item from storage
   */
  removeItem(key: string): boolean {
    try {
      if (this.checkAvailability()) {
        localStorage.removeItem(key);
      } else {
        this.memoryFallback.delete(key);
      }
      return true;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to remove item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear expired items from memory fallback
   */
  private clearExpiredItems(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryFallback.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.memoryFallback.delete(key);
      }
    }
  }

  /**
   * Get storage info for debugging
   */
  getStorageInfo(): {
    isLocalStorageAvailable: boolean;
    memoryFallbackSize: number;
    totalMemoryItems: number;
  } {
    return {
      isLocalStorageAvailable: this.checkAvailability(),
      memoryFallbackSize: this.memoryFallback.size,
      totalMemoryItems: this.memoryFallback.size,
    };
  }

  /**
   * Clear all storage (localStorage + memory fallback)
   */
  clear(): void {
    try {
      if (this.checkAvailability()) {
        localStorage.clear();
      }
    } catch (error) {
      console.warn("[SafeStorage] Failed to clear localStorage:", error);
    }
    this.memoryFallback.clear();
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage();

/**
 * Safe JSON operations with error handling
 */
export const safeJSON = {
  parse: <T = any>(text: string, fallback: T | null = null): T | null => {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn("[SafeStorage] JSON parse failed:", error);
      return fallback;
    }
  },

  stringify: (value: any, fallback: string = "{}"): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn("[SafeStorage] JSON stringify failed:", error);
      return fallback;
    }
  },
};

/**
 * Async storage operations to prevent main thread blocking
 */
export const asyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      // Use setTimeout to make it async and prevent blocking
      setTimeout(() => {
        resolve(safeStorage.getItem(key));
      }, 0);
    });
  },

  setItem: async (
    key: string,
    value: string,
    expirationMs?: number,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(safeStorage.setItem(key, value, expirationMs));
      }, 0);
    });
  },

  removeItem: async (key: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(safeStorage.removeItem(key));
      }, 0);
    });
  },
};
