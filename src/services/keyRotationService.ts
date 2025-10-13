import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KeyRotationConfig {
  rotationInterval: number; // in milliseconds
  backupKeyCount: number; // number of backup keys to maintain
  warningThreshold: number; // warn when key expires in X milliseconds
  autoRotate: boolean;
}

interface APIKeyInfo {
  id: string;
  provider: string;
  keyHash: string; // hashed key for identification
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  usageCount: number;
  lastUsed: Date;
}

class KeyRotationService {
  private config: KeyRotationConfig;
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.config = {
      rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      backupKeyCount: 2,
      warningThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
      autoRotate: false, // Disabled by default for security
    };
  }

  async initializeRotation(): Promise<void> {
    console.log('[KeyRotation] Initializing key rotation service');

    try {
      // Load configuration from database
      await this.loadConfig();

      // Check existing keys and schedule rotations
      await this.checkAllKeys();

      // Set up periodic checks
      this.schedulePeriodicChecks();

      console.log('[KeyRotation] Service initialized successfully');
    } catch (error) {
      console.error('[KeyRotation] Failed to initialize:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('key_rotation_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.config = {
          ...this.config,
          ...data,
        };
      }
    } catch (error) {
      console.error('[KeyRotation] Failed to load config:', error);
    }
  }

  private async checkAllKeys(): Promise<void> {
    try {
      const { data: keys, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      for (const key of keys || []) {
        await this.checkKeyExpiration(key);
      }
    } catch (error) {
      console.error('[KeyRotation] Failed to check keys:', error);
    }
  }

  private async checkKeyExpiration(key: APIKeyInfo): Promise<void> {
    const now = new Date();
    const expirationTime = new Date(key.expiresAt);
    const timeUntilExpiration = expirationTime.getTime() - now.getTime();

    // Warn if key is expiring soon
    if (timeUntilExpiration <= this.config.warningThreshold && timeUntilExpiration > 0) {
      await this.notifyKeyExpiration(key, timeUntilExpiration);
    }

    // Rotate if key has expired
    if (timeUntilExpiration <= 0) {
      if (this.config.autoRotate) {
        await this.rotateKey(key.provider);
      } else {
        await this.notifyKeyExpired(key);
      }
    }

    // Schedule next check
    if (timeUntilExpiration > 0) {
      this.scheduleKeyCheck(key, timeUntilExpiration);
    }
  }

  private async notifyKeyExpiration(key: APIKeyInfo, timeUntilExpiration: number): Promise<void> {
    const daysUntilExpiration = Math.ceil(timeUntilExpiration / (24 * 60 * 60 * 1000));

    toast.warning('API Key Expiring Soon', {
      description: `Your ${key.provider} API key expires in ${daysUntilExpiration} days.`,
      duration: 10000,
      action: {
        label: 'Manage Keys',
        onClick: () => {
          window.location.href = '/settings/api-keys';
        },
      },
    });

    // Log to admin dashboard
    await this.logKeyEvent(key, 'expiring_soon', {
      daysUntilExpiration,
    });
  }

  private async notifyKeyExpired(key: APIKeyInfo): Promise<void> {
    toast.error('API Key Expired', {
      description: `Your ${key.provider} API key has expired. AI features may not work.`,
      duration: 15000,
      action: {
        label: 'Update Key',
        onClick: () => {
          window.location.href = '/settings/api-keys';
        },
      },
    });

    // Deactivate expired key
    await this.deactivateKey(key.id);

    // Log to admin dashboard
    await this.logKeyEvent(key, 'expired', {});
  }

  private scheduleKeyCheck(key: APIKeyInfo, timeUntilExpiration: number): void {
    // Clear existing timer if any
    const existingTimer = this.rotationTimers.get(key.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule next check at warning threshold or expiration
    const checkTime = Math.min(
      timeUntilExpiration - this.config.warningThreshold,
      timeUntilExpiration
    );

    if (checkTime > 0) {
      const timer = setTimeout(async () => {
        await this.checkKeyExpiration(key);
      }, checkTime);

      this.rotationTimers.set(key.id, timer);
    }
  }

  private schedulePeriodicChecks(): void {
    // Check all keys every 24 hours
    setInterval(async () => {
      await this.checkAllKeys();
    }, 24 * 60 * 60 * 1000);
  }

  async rotateKey(provider: string): Promise<boolean> {
    console.log(`[KeyRotation] Rotating key for provider: ${provider}`);

    try {
      // This would need to be implemented based on the specific provider's API
      // For now, we'll just log the rotation request
      await this.logKeyEvent({ provider } as APIKeyInfo, 'rotation_requested', {});

      toast.info('Key Rotation Required', {
        description: `Please manually update your ${provider} API key.`,
        duration: 10000,
        action: {
          label: 'Update Now',
          onClick: () => {
            window.location.href = '/settings/api-keys';
          },
        },
      });

      return true;
    } catch (error) {
      console.error(`[KeyRotation] Failed to rotate key for ${provider}:`, error);
      return false;
    }
  }

  private async deactivateKey(keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);

      if (error) throw error;

      console.log(`[KeyRotation] Deactivated key: ${keyId}`);
    } catch (error) {
      console.error('[KeyRotation] Failed to deactivate key:', error);
    }
  }

  private async logKeyEvent(key: APIKeyInfo, event: string, metadata: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('key_rotation_logs')
        .insert({
          key_id: key.id,
          provider: key.provider,
          event_type: event,
          metadata,
          created_at: new Date(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('[KeyRotation] Failed to log event:', error);
    }
  }

  // Public methods for manual operations

  async manualRotateKey(provider: string): Promise<boolean> {
    console.log(`[KeyRotation] Manual rotation requested for ${provider}`);
    return this.rotateKey(provider);
  }

  async validateKeySecurity(provider: string, key: string): Promise<{
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    issues: string[];
  }> {
    const issues: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'strong';

    // Basic validation
    if (!key || key.length < 20) {
      issues.push('Key is too short');
      strength = 'weak';
    }

    // Check for common patterns that indicate test/invalid keys
    const suspiciousPatterns = [
      'test',
      'demo',
      'example',
      'placeholder',
      '123456',
      'abcdef',
    ];

    const lowerKey = key.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (lowerKey.includes(pattern)) {
        issues.push(`Key contains suspicious pattern: ${pattern}`);
        strength = 'weak';
      }
    }

    // Provider-specific validation
    switch (provider) {
      case 'openai':
        if (!key.startsWith('sk-')) {
          issues.push('OpenAI keys should start with "sk-"');
          strength = 'weak';
        }
        break;

      case 'anthropic':
        if (!key.startsWith('sk-ant-')) {
          issues.push('Anthropic keys should start with "sk-ant-"');
          strength = 'weak';
        }
        break;

      case 'gemini':
        if (key.length < 32) {
          issues.push('Gemini keys are typically longer');
          strength = 'medium';
        }
        break;
    }

    // Entropy check
    const entropy = this.calculateEntropy(key);
    if (entropy < 3.5) {
      issues.push('Key has low entropy (may be predictable)');
      if (strength === 'strong') strength = 'medium';
    }

    return {
      isValid: issues.length === 0,
      strength,
      issues,
    };
  }

  private calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  async getKeyUsageStats(provider: string): Promise<{
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    lastUsed: Date | null;
    costThisMonth: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_key_usage_stats', {
          provider_param: provider,
          days_param: 30,
        });

      if (error) throw error;

      return data || {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        lastUsed: null,
        costThisMonth: 0,
      };
    } catch (error) {
      console.error('[KeyRotation] Failed to get usage stats:', error);
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        lastUsed: null,
        costThisMonth: 0,
      };
    }
  }

  async updateRotationConfig(newConfig: Partial<KeyRotationConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };

      const { error } = await supabase
        .from('key_rotation_config')
        .upsert(this.config);

      if (error) throw error;

      console.log('[KeyRotation] Configuration updated');
    } catch (error) {
      console.error('[KeyRotation] Failed to update config:', error);
      throw error;
    }
  }

  getConfig(): KeyRotationConfig {
    return { ...this.config };
  }

  cleanup(): void {
    // Clear all timers
    this.rotationTimers.forEach(timer => clearTimeout(timer));
    this.rotationTimers.clear();
    console.log('[KeyRotation] Service cleaned up');
  }
}

// Global instance
export const keyRotationService = new KeyRotationService();

// Initialize on module load
if (typeof window !== 'undefined') {
  keyRotationService.initializeRotation();
}

export default keyRotationService;