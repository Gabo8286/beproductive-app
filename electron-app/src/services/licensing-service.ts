import { analyticsService } from './analytics-service';

export type LicenseType = 'free' | 'pro' | 'enterprise' | 'lifetime';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'grace_period';

export interface License {
  id: string;
  userId: string;
  type: LicenseType;
  status: SubscriptionStatus;
  features: string[];
  limits: {
    projects: number;
    aiRequests: number;
    storage: number; // MB
    teamMembers: number;
    deployments: number;
  };
  expiresAt?: Date;
  activatedAt: Date;
  lastValidated: Date;
  metadata: Record<string, any>;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: LicenseType;
  price: {
    monthly: number;
    yearly: number;
    lifetime?: number;
  };
  features: string[];
  limits: License['limits'];
  highlighted?: boolean;
  description: string;
  cta: string;
}

class LicensingService {
  private currentLicense: License | null = null;
  private readonly FREE_TRIAL_DAYS = 14;

  constructor() {
    this.loadLicense();
    this.setupLicenseValidation();
  }

  // Pricing plans
  getPricingPlans(): PricingPlan[] {
    return [
      {
        id: 'trial',
        name: 'Free Trial',
        type: 'free',
        price: { monthly: 0, yearly: 0 },
        description: 'Try BeProductive for 14 days - full features, no limits',
        cta: 'Start Free Trial',
        features: [
          'Full app access for 14 days',
          'Unlimited projects',
          'Claude Code & Grok AI integration',
          'M4 Neural Engine optimization',
          'iPad Pro Sidecar support',
          'All creation tools',
          'Export your work'
        ],
        limits: {
          projects: -1,
          aiRequests: -1,
          storage: 10000,
          teamMembers: 1,
          deployments: -1
        }
      },
      {
        id: 'full',
        name: 'BeProductive Coding',
        type: 'lifetime',
        price: { monthly: 0, yearly: 0, lifetime: 89 },
        description: 'Like Procreate, but for coding - one purchase, yours forever',
        cta: 'Buy Once, Own Forever',
        highlighted: true,
        features: [
          'Own it forever - no subscriptions',
          'Unlimited everything',
          'Claude Code & Grok integration',
          'M4 Neural Engine acceleration',
          'Adaptive interface (beginner to pro)',
          'Complete Apple ecosystem integration',
          'iPad Pro dual-screen development',
          'AI-powered asset creation',
          'Visual workflow builder',
          'Advanced automation',
          'All future updates included',
          'Priority email support'
        ],
        limits: {
          projects: -1,
          aiRequests: -1,
          storage: -1,
          teamMembers: 1,
          deployments: -1
        }
      },
      {
        id: 'team',
        name: 'Team License',
        type: 'enterprise',
        price: { monthly: 0, yearly: 0, lifetime: 299 },
        description: 'For teams and organizations - up to 10 seats',
        cta: 'Buy Team License',
        features: [
          'Everything in BeProductive Coding',
          'Up to 10 team members',
          'Shared project libraries',
          'Team collaboration tools',
          'Advanced project analytics',
          'Custom deployment options',
          'Priority team support',
          'Volume discount pricing'
        ],
        limits: {
          projects: -1,
          aiRequests: -1,
          storage: -1,
          teamMembers: 10,
          deployments: -1
        }
      }
    ];
  }

  // License management
  private loadLicense(): void {
    try {
      const stored = localStorage.getItem('beproductive_license');
      if (stored) {
        const license = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (license.expiresAt) license.expiresAt = new Date(license.expiresAt);
        license.activatedAt = new Date(license.activatedAt);
        license.lastValidated = new Date(license.lastValidated);

        this.currentLicense = license;
      } else {
        // Create free license for new users
        this.createFreeLicense();
      }
    } catch (error) {
      console.error('Failed to load license:', error);
      this.createFreeLicense();
    }
  }

  private createFreeLicense(): void {
    // Start with a 14-day trial instead of limited free version
    this.startFreeTrial();
  }

  private saveLicense(): void {
    if (this.currentLicense) {
      localStorage.setItem('beproductive_license', JSON.stringify(this.currentLicense));
    }
  }

  private setupLicenseValidation(): void {
    // Validate license every hour
    setInterval(() => {
      this.validateLicense();
    }, 60 * 60 * 1000);

    // Initial validation
    setTimeout(() => this.validateLicense(), 5000);
  }

  private async validateLicense(): Promise<boolean> {
    if (!this.currentLicense) return false;

    try {
      // Check if license is expired
      if (this.currentLicense.expiresAt && new Date() > this.currentLicense.expiresAt) {
        this.currentLicense.status = 'expired';
        this.saveLicense();
        analyticsService.track('license_expired', { type: this.currentLicense.type }, 'app');
        return false;
      }

      // Update last validated time
      this.currentLicense.lastValidated = new Date();
      this.saveLicense();

      return true;
    } catch (error) {
      console.error('License validation failed:', error);
      return false;
    }
  }

  // Feature access control
  hasFeature(feature: string): boolean {
    if (!this.currentLicense) return false;

    const hasFeature = this.currentLicense.features.some(f =>
      f.toLowerCase().includes(feature.toLowerCase()) ||
      feature.toLowerCase().includes(f.toLowerCase())
    );

    if (!hasFeature) {
      analyticsService.track('feature_blocked', {
        feature,
        licenseType: this.currentLicense.type
      }, 'feature');
    }

    return hasFeature;
  }

  canCreateProject(): boolean {
    if (!this.currentLicense) return false;

    const currentProjects = this.getCurrentProjectCount();
    const limit = this.currentLicense.limits.projects;

    return limit === -1 || currentProjects < limit;
  }

  canUseAI(): boolean {
    if (!this.currentLicense) return false;

    const currentRequests = this.getCurrentAIRequestsThisMonth();
    const limit = this.currentLicense.limits.aiRequests;

    return limit === -1 || currentRequests < limit;
  }

  canDeploy(): boolean {
    if (!this.currentLicense) return false;

    const currentDeployments = this.getCurrentDeploymentsThisMonth();
    const limit = this.currentLicense.limits.deployments;

    return limit === -1 || currentDeployments < limit;
  }

  // Usage tracking
  private getCurrentProjectCount(): number {
    // This would integrate with the project manager service
    // For now, return a mock value
    return 1;
  }

  private getCurrentAIRequestsThisMonth(): number {
    const events = analyticsService.getStoredEvents();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    return events.filter(e =>
      e.category === 'ai' &&
      new Date(e.timestamp) >= thisMonth
    ).length;
  }

  private getCurrentDeploymentsThisMonth(): number {
    const events = analyticsService.getStoredEvents();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    return events.filter(e =>
      e.event.includes('deploy') &&
      new Date(e.timestamp) >= thisMonth
    ).length;
  }

  // Trial management
  startFreeTrial(): boolean {
    if (this.currentLicense && this.currentLicense.status === 'trial') {
      return false; // Already on trial
    }

    const trialPlan = this.getPricingPlans().find(p => p.id === 'trial')!;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.FREE_TRIAL_DAYS);

    this.currentLicense = {
      id: 'trial_' + Date.now(),
      userId: this.currentLicense?.userId || 'anonymous',
      type: 'free',
      status: 'trial',
      features: trialPlan.features,
      limits: trialPlan.limits,
      expiresAt,
      activatedAt: new Date(),
      lastValidated: new Date(),
      metadata: {
        trialStarted: new Date(),
        source: 'trial',
        version: '1.0.0'
      }
    };

    this.saveLicense();
    analyticsService.track('trial_started', { type: 'full_access' }, 'app');

    return true;
  }

  isTrialActive(): boolean {
    return this.currentLicense?.status === 'trial' &&
           this.currentLicense?.expiresAt &&
           new Date() < this.currentLicense.expiresAt;
  }

  getTrialDaysRemaining(): number {
    if (!this.isTrialActive() || !this.currentLicense?.expiresAt) return 0;

    const now = new Date();
    const expiry = this.currentLicense.expiresAt;
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  // License activation
  async activateLicense(licenseKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would validate with a server
      // For now, we'll simulate license activation

      analyticsService.track('license_activation_attempted', {
        keyLength: licenseKey.length
      }, 'app');

      // Mock license validation
      if (licenseKey.startsWith('PRO_') && licenseKey.length >= 20) {
        const proPlan = this.getPricingPlans().find(p => p.type === 'pro')!;

        this.currentLicense = {
          id: licenseKey,
          userId: this.currentLicense?.userId || 'anonymous',
          type: 'pro',
          status: 'active',
          features: proPlan.features,
          limits: proPlan.limits,
          activatedAt: new Date(),
          lastValidated: new Date(),
          metadata: {
            source: 'license_key',
            version: '1.0.0'
          }
        };

        this.saveLicense();
        analyticsService.track('license_activated', { type: 'pro' }, 'app');

        return { success: true };
      } else if (licenseKey.startsWith('LIFETIME_') && licenseKey.length >= 25) {
        const lifetimePlan = this.getPricingPlans().find(p => p.type === 'lifetime')!;

        this.currentLicense = {
          id: licenseKey,
          userId: this.currentLicense?.userId || 'anonymous',
          type: 'lifetime',
          status: 'active',
          features: lifetimePlan.features,
          limits: lifetimePlan.limits,
          activatedAt: new Date(),
          lastValidated: new Date(),
          metadata: {
            source: 'license_key',
            version: '1.0.0'
          }
        };

        this.saveLicense();
        analyticsService.track('license_activated', { type: 'lifetime' }, 'app');

        return { success: true };
      } else {
        return { success: false, error: 'Invalid license key format' };
      }
    } catch (error) {
      analyticsService.trackError(error as Error, { context: 'license_activation' });
      return { success: false, error: 'License activation failed' };
    }
  }

  // Purchase flow
  async initiatePurchase(planId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    const plan = this.getPricingPlans().find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Plan not found' };
    }

    analyticsService.track('purchase_initiated', {
      planId,
      planType: plan.type,
      price: plan.price
    }, 'app');

    // In a real implementation, this would integrate with Stripe, Paddle, or similar
    // For now, we'll simulate the purchase flow

    try {
      // Mock purchase URL generation
      const purchaseUrl = `https://checkout.beproductive.dev/purchase?plan=${planId}&user=${this.currentLicense?.userId}`;

      return { success: true, url: purchaseUrl };
    } catch (error) {
      return { success: false, error: 'Failed to initiate purchase' };
    }
  }

  // Getters
  getCurrentLicense(): License | null {
    return this.currentLicense;
  }

  getLicenseType(): LicenseType {
    return this.currentLicense?.type || 'free';
  }

  getLicenseStatus(): SubscriptionStatus {
    return this.currentLicense?.status || 'expired';
  }

  isProUser(): boolean {
    return this.currentLicense?.type === 'pro' ||
           this.currentLicense?.type === 'lifetime' ||
           this.currentLicense?.type === 'enterprise';
  }

  isFreeUser(): boolean {
    return this.currentLicense?.type === 'free';
  }

  // Usage stats for display
  getUsageLimits(): {
    projects: { current: number; limit: number; percentage: number };
    aiRequests: { current: number; limit: number; percentage: number };
    deployments: { current: number; limit: number; percentage: number };
  } {
    if (!this.currentLicense) {
      return {
        projects: { current: 0, limit: 0, percentage: 0 },
        aiRequests: { current: 0, limit: 0, percentage: 0 },
        deployments: { current: 0, limit: 0, percentage: 0 }
      };
    }

    const currentProjects = this.getCurrentProjectCount();
    const currentAI = this.getCurrentAIRequestsThisMonth();
    const currentDeployments = this.getCurrentDeploymentsThisMonth();

    const limits = this.currentLicense.limits;

    return {
      projects: {
        current: currentProjects,
        limit: limits.projects,
        percentage: limits.projects === -1 ? 0 : (currentProjects / limits.projects) * 100
      },
      aiRequests: {
        current: currentAI,
        limit: limits.aiRequests,
        percentage: limits.aiRequests === -1 ? 0 : (currentAI / limits.aiRequests) * 100
      },
      deployments: {
        current: currentDeployments,
        limit: limits.deployments,
        percentage: limits.deployments === -1 ? 0 : (currentDeployments / limits.deployments) * 100
      }
    };
  }

  // License info for support/debugging
  getLicenseInfo(): {
    id: string;
    type: LicenseType;
    status: SubscriptionStatus;
    activatedAt: string;
    expiresAt?: string;
    lastValidated: string;
  } | null {
    if (!this.currentLicense) return null;

    return {
      id: this.currentLicense.id,
      type: this.currentLicense.type,
      status: this.currentLicense.status,
      activatedAt: this.currentLicense.activatedAt.toISOString(),
      expiresAt: this.currentLicense.expiresAt?.toISOString(),
      lastValidated: this.currentLicense.lastValidated.toISOString()
    };
  }
}

// Create singleton instance
export const licensingService = new LicensingService();