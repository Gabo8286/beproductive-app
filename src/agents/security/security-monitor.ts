// Security Monitoring Agent
import { ClaudeClient } from '../shared/claude-client';
import { NotificationService } from '../shared/notification-service';
import { AgentConfig, getConfig } from '../shared/config';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_id?: string;
  user_agent?: string;
  details: Record<string, any>;
}

export interface ThreatAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  recommendation: string;
  affected_resources: string[];
  auto_blocked: boolean;
  timestamp: string;
}

export interface SecurityMetrics {
  total_events: number;
  failed_logins: number;
  blocked_ips: number;
  suspicious_activities: number;
  data_access_violations: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  period: string;
}

export class SecurityMonitoringAgent {
  private config: AgentConfig;
  private claude: ClaudeClient;
  private notifications: NotificationService;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();

  // Security thresholds
  private readonly FAILED_LOGIN_THRESHOLD = 5; // per IP per hour
  private readonly RATE_LIMIT_THRESHOLD = 100; // requests per minute per IP
  private readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 3; // different types per IP per hour

  constructor(config?: Partial<AgentConfig>) {
    this.config = { ...getConfig(), ...config };
    this.claude = new ClaudeClient(this.config.claudeApiKey, this.config.claudeModel);
    this.notifications = new NotificationService(this.config);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🛡️ Security Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🛡️ Starting Security Monitoring Agent...');

    // Run initial security scan
    await this.runSecurityScan();

    // Schedule periodic scans
    this.intervalId = setInterval(async () => {
      try {
        await this.runSecurityScan();
      } catch (error) {
        console.error('Security scan failed:', error);
        await this.notifications.sendError(
          'SecurityAgent',
          'Security Scan Failed',
          `Failed to complete security scan: ${error}`,
        );
      }
    }, this.config.intervals.security);

    await this.notifications.sendInfo(
      'SecurityAgent',
      'Security Monitor Started',
      `Security monitoring active with ${this.config.intervals.security / 1000}s intervals`,
    );
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    console.log('🛡️ Security Monitor stopped');
    await this.notifications.sendInfo(
      'SecurityAgent',
      'Security Monitor Stopped',
      'Security monitoring has been gracefully shut down',
    );
  }

  private async runSecurityScan(): Promise<SecurityMetrics> {
    try {
      console.log('🛡️ Running security scan...');

      // Collect security events from the last hour
      const events = await this.collectSecurityEvents();

      // Analyze events for threats
      const threats = await this.analyzeSecurityEvents(events);

      // Process threats and take action
      await this.processThreats(threats);

      // Generate security metrics
      const metrics = this.generateSecurityMetrics(events, threats);

      // Send alerts if threats detected
      if (threats.length > 0) {
        await this.sendSecurityAlerts(threats, metrics);
      }

      if (this.config.enableLogging) {
        console.log('Security Metrics:', metrics);
      }

      return metrics;
    } catch (error) {
      console.error('Security scan failed:', error);
      await this.notifications.sendCritical(
        'SecurityAgent',
        'Security Scan Failed',
        `Critical failure in security monitoring: ${error}`,
      );
      throw error;
    }
  }

  private async collectSecurityEvents(): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
      // In a real implementation, you'd query your auth logs, access logs, etc.
      // For Supabase, you might query auth audit logs or create custom logging

      // Simulate collecting various security events
      events.push(...this.simulateFailedLogins());
      events.push(...this.simulateSuspiciousActivity());
      events.push(...this.simulateDataAccessEvents());

      return events.filter(event => new Date(event.timestamp) > oneHourAgo);
    } catch (error) {
      console.error('Failed to collect security events:', error);
      return [];
    }
  }

  private simulateFailedLogins(): SecurityEvent[] {
    const events: SecurityEvent[] = [];
    const failedLoginCount = Math.floor(Math.random() * 10);

    for (let i = 0; i < failedLoginCount; i++) {
      events.push({
        id: `failed_login_${Date.now()}_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: 'failed_auth',
        severity: 'medium',
        source_ip: this.generateRandomIP(),
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: {
          reason: 'invalid_credentials',
          attempted_email: `user${i}@example.com`,
        },
      });
    }

    return events;
  }

  private simulateSuspiciousActivity(): SecurityEvent[] {
    const events: SecurityEvent[] = [];
    const suspiciousCount = Math.floor(Math.random() * 5);

    for (let i = 0; i < suspiciousCount; i++) {
      events.push({
        id: `suspicious_${Date.now()}_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: 'suspicious_activity',
        severity: 'high',
        source_ip: this.generateRandomIP(),
        details: {
          activity_type: 'rapid_api_calls',
          request_count: Math.floor(Math.random() * 200 + 100),
          pattern: 'automated_behavior',
        },
      });
    }

    return events;
  }

  private simulateDataAccessEvents(): SecurityEvent[] {
    const events: SecurityEvent[] = [];
    const accessCount = Math.floor(Math.random() * 3);

    for (let i = 0; i < accessCount; i++) {
      events.push({
        id: `data_access_${Date.now()}_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: 'data_access',
        severity: 'low',
        source_ip: this.generateRandomIP(),
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        details: {
          resource: 'user_profiles',
          action: 'bulk_download',
          record_count: Math.floor(Math.random() * 100),
        },
      });
    }

    return events;
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private async analyzeSecurityEvents(events: SecurityEvent[]): Promise<ThreatAlert[]> {
    if (events.length === 0) {
      return [];
    }

    try {
      // Use Claude AI to analyze security events
      const analysis = await this.claude.analyzeSecurityLogs(events);

      // Convert Claude analysis to threat alerts
      const threats: ThreatAlert[] = analysis.threats.map((threat, index) => ({
        id: `threat_${Date.now()}_${index}`,
        type: threat.type,
        severity: threat.severity,
        description: threat.description,
        recommendation: threat.recommendation,
        affected_resources: this.extractAffectedResources(events),
        auto_blocked: false,
        timestamp: new Date().toISOString(),
      }));

      // Add rule-based threat detection
      threats.push(...this.detectRuleBasedThreats(events));

      return threats;
    } catch (error) {
      console.error('Failed to analyze security events:', error);
      return this.detectRuleBasedThreats(events);
    }
  }

  private detectRuleBasedThreats(events: SecurityEvent[]): ThreatAlert[] {
    const threats: ThreatAlert[] = [];

    // Group events by IP
    const eventsByIP = new Map<string, SecurityEvent[]>();
    events.forEach(event => {
      if (!eventsByIP.has(event.source_ip)) {
        eventsByIP.set(event.source_ip, []);
      }
      eventsByIP.get(event.source_ip)!.push(event);
    });

    // Check for threats per IP
    eventsByIP.forEach((ipEvents, ip) => {
      // Failed login attempts
      const failedLogins = ipEvents.filter(e => e.type === 'failed_auth').length;
      if (failedLogins >= this.FAILED_LOGIN_THRESHOLD) {
        threats.push({
          id: `brute_force_${Date.now()}_${ip}`,
          type: 'brute_force_attack',
          severity: 'high',
          description: `${failedLogins} failed login attempts from IP ${ip}`,
          recommendation: 'Block IP address and investigate user accounts',
          affected_resources: [`IP: ${ip}`],
          auto_blocked: true,
          timestamp: new Date().toISOString(),
        });

        // Auto-block the IP
        this.blockedIPs.add(ip);
      }

      // Suspicious activity patterns
      const suspiciousEvents = ipEvents.filter(e => e.type === 'suspicious_activity').length;
      if (suspiciousEvents >= this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
        threats.push({
          id: `suspicious_pattern_${Date.now()}_${ip}`,
          type: 'suspicious_behavior',
          severity: 'medium',
          description: `Multiple suspicious activities detected from IP ${ip}`,
          recommendation: 'Monitor closely and consider rate limiting',
          affected_resources: [`IP: ${ip}`],
          auto_blocked: false,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return threats;
  }

  private extractAffectedResources(events: SecurityEvent[]): string[] {
    const resources = new Set<string>();
    events.forEach(event => {
      resources.add(`IP: ${event.source_ip}`);
      if (event.user_id) {
        resources.add(`User: ${event.user_id}`);
      }
    });
    return Array.from(resources);
  }

  private async processThreats(threats: ThreatAlert[]): Promise<void> {
    for (const threat of threats) {
      // Auto-block IPs for high-severity threats
      if (threat.severity === 'critical' || threat.severity === 'high') {
        if (threat.type === 'brute_force_attack') {
          // Extract IP from affected resources
          const ipResource = threat.affected_resources.find(r => r.startsWith('IP: '));
          if (ipResource) {
            const ip = ipResource.replace('IP: ', '');
            await this.blockIP(ip, threat.type);
          }
        }
      }

      // Log threat for audit trail
      console.log(`🚨 Security Threat Detected: ${threat.type} (${threat.severity})`);
    }
  }

  private async blockIP(ip: string, reason: string): Promise<void> {
    this.blockedIPs.add(ip);
    console.log(`🚫 IP ${ip} blocked due to: ${reason}`);

    // In production, you'd implement actual IP blocking:
    // - Update firewall rules
    // - Add to CDN block list
    // - Update application-level IP filtering
  }

  private generateSecurityMetrics(events: SecurityEvent[], threats: ThreatAlert[]): SecurityMetrics {
    const failedLogins = events.filter(e => e.type === 'failed_auth').length;
    const suspiciousActivities = events.filter(e => e.type === 'suspicious_activity').length;
    const dataAccessViolations = events.filter(e => e.type === 'data_access' && e.severity !== 'low').length;

    // Determine overall threat level
    let threatLevel: SecurityMetrics['threat_level'] = 'low';
    if (threats.some(t => t.severity === 'critical')) {
      threatLevel = 'critical';
    } else if (threats.some(t => t.severity === 'high')) {
      threatLevel = 'high';
    } else if (threats.some(t => t.severity === 'medium')) {
      threatLevel = 'medium';
    }

    return {
      total_events: events.length,
      failed_logins: failedLogins,
      blocked_ips: this.blockedIPs.size,
      suspicious_activities: suspiciousActivities,
      data_access_violations: dataAccessViolations,
      threat_level: threatLevel,
      period: 'last_hour',
    };
  }

  private async sendSecurityAlerts(threats: ThreatAlert[], metrics: SecurityMetrics): Promise<void> {
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    const highThreats = threats.filter(t => t.severity === 'high');

    if (criticalThreats.length > 0) {
      await this.notifications.sendCritical(
        'SecurityAgent',
        `Critical Security Threats Detected (${criticalThreats.length})`,
        this.formatThreatAlert(criticalThreats, metrics),
        { threats: criticalThreats, metrics },
      );
    }

    if (highThreats.length > 0) {
      await this.notifications.sendError(
        'SecurityAgent',
        `High Priority Security Threats (${highThreats.length})`,
        this.formatThreatAlert(highThreats, metrics),
        { threats: highThreats, metrics },
      );
    }
  }

  private formatThreatAlert(threats: ThreatAlert[], metrics: SecurityMetrics): string {
    return `
Security Alert Summary:
• Total Events: ${metrics.total_events}
• Failed Logins: ${metrics.failed_logins}
• Blocked IPs: ${metrics.blocked_ips}
• Threat Level: ${metrics.threat_level.toUpperCase()}

Detected Threats:
${threats.map(threat => `
• ${threat.type} (${threat.severity})
  ${threat.description}
  Recommendation: ${threat.recommendation}
  Auto-blocked: ${threat.auto_blocked ? 'Yes' : 'No'}
`).join('')}
    `.trim();
  }

  // Public API methods
  async getSecurityStatus(): Promise<{ metrics: SecurityMetrics; blockedIPs: string[] }> {
    const events = await this.collectSecurityEvents();
    const threats = await this.analyzeSecurityEvents(events);
    const metrics = this.generateSecurityMetrics(events, threats);

    return {
      metrics,
      blockedIPs: Array.from(this.blockedIPs),
    };
  }

  async unblockIP(ip: string): Promise<boolean> {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip);
      console.log(`✅ IP ${ip} unblocked`);
      await this.notifications.sendInfo(
        'SecurityAgent',
        'IP Unblocked',
        `IP ${ip} has been manually unblocked`,
      );
      return true;
    }
    return false;
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  async forceSecurityScan(): Promise<SecurityMetrics> {
    return await this.runSecurityScan();
  }
}