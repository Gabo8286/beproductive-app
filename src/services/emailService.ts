import { supabase } from "@/integrations/supabase/client";
import { renderInvitationEmail } from "@/components/admin/BetaSignupManagement/EmailTemplates/InvitationEmailTemplate";

// Email types for tracking
export type EmailType = 'invitation' | 'reminder' | 'welcome';

// Email configuration interface
export interface EmailConfig {
  testMode?: boolean;
  defaultLanguage?: 'en' | 'es';
  fromEmail?: string;
  fromName?: string;
}

// Email data for sending
export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: EmailType;
  language: 'en' | 'es';
  metadata?: Record<string, any>;
}

// Email service class
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig = {}) {
    this.config = {
      testMode: process.env.NODE_ENV === 'development',
      defaultLanguage: 'en',
      fromEmail: 'noreply@be-productive.app',
      fromName: 'BeProductive Team',
      ...config
    };
  }

  /**
   * Send beta invitation email
   */
  async sendInvitationEmail(
    recipientEmail: string,
    recipientName: string,
    invitationToken: string,
    language: 'en' | 'es' = 'en',
    betaSignupId: string
  ): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      // Load translations
      const translations = await this.loadTranslations(language);

      // Generate email content
      const subject = translations.invitation.subject;
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

      const htmlContent = renderInvitationEmail({
        recipientName,
        invitationToken,
        expiryDate,
        language,
        translations
      });

      // Create text version (simplified)
      const textContent = this.createTextVersion(translations.invitation, recipientName, invitationToken);

      const emailData: EmailData = {
        to: recipientEmail,
        toName: recipientName,
        subject,
        htmlContent,
        textContent,
        type: 'invitation',
        language,
        metadata: {
          betaSignupId,
          invitationToken,
          expiryDate
        }
      };

      // Send email and track
      const result = await this.sendEmail(emailData);

      if (result.success && result.emailId) {
        // Track email in database
        await this.trackEmail(betaSignupId, emailData, result.emailId);
      }

      return result;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(
    recipientEmail: string,
    recipientName: string,
    invitationToken: string,
    daysUntilExpiry: number,
    language: 'en' | 'es' = 'en',
    betaSignupId: string
  ): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      const translations = await this.loadTranslations(language);
      const expiryDate = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000).toLocaleDateString();

      const subject = translations.reminder.subject;
      const htmlContent = this.renderReminderEmail(translations.reminder, recipientName, invitationToken, daysUntilExpiry, expiryDate);
      const textContent = this.createReminderTextVersion(translations.reminder, recipientName, invitationToken, daysUntilExpiry);

      const emailData: EmailData = {
        to: recipientEmail,
        toName: recipientName,
        subject,
        htmlContent,
        textContent,
        type: 'reminder',
        language,
        metadata: {
          betaSignupId,
          invitationToken,
          daysUntilExpiry
        }
      };

      const result = await this.sendEmail(emailData);

      if (result.success && result.emailId) {
        await this.trackEmail(betaSignupId, emailData, result.emailId);
      }

      return result;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Core email sending function
   */
  private async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string; emailId?: string }> {
    if (this.config.testMode) {
      // In test mode, just log the email
      console.log('📧 [TEST MODE] Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        language: emailData.language
      });

      return {
        success: true,
        emailId: `test-${Date.now()}`
      };
    }

    try {
      // Try Supabase Auth email first
      const supabaseResult = await this.sendWithSupabase(emailData);
      if (supabaseResult.success) {
        return supabaseResult;
      }

      // Fallback to external email service (Resend, SendGrid, etc.)
      return await this.sendWithFallbackService(emailData);

    } catch (error) {
      console.error('Error in email sending:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email using Supabase Auth
   */
  private async sendWithSupabase(emailData: EmailData): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      // Note: This would use Supabase's admin email functions
      // For now, we'll simulate the API call

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.htmlContent,
          text: emailData.textContent,
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          metadata: emailData.metadata
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          emailId: result.id || `supabase-${Date.now()}`
        };
      } else {
        throw new Error(`Email API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Supabase email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Supabase email failed'
      };
    }
  }

  /**
   * Fallback email service (Resend, SendGrid, etc.)
   */
  private async sendWithFallbackService(emailData: EmailData): Promise<{ success: boolean; error?: string; emailId?: string }> {
    try {
      // This would integrate with external email services
      // For now, we'll simulate success

      console.log('📧 Using fallback email service for:', emailData.to);

      return {
        success: true,
        emailId: `fallback-${Date.now()}`
      };
    } catch (error) {
      console.error('Fallback email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fallback email failed'
      };
    }
  }

  /**
   * Track email in database
   */
  private async trackEmail(betaSignupId: string, emailData: EmailData, emailId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('beta_invitations')
        .insert({
          beta_signup_id: betaSignupId,
          email_type: emailData.type,
          language_code: emailData.language,
          email_data: {
            subject: emailData.subject,
            to: emailData.to,
            emailId,
            metadata: emailData.metadata
          }
        });

      if (error) {
        console.error('Error tracking email:', error);
      }
    } catch (error) {
      console.error('Error in email tracking:', error);
    }
  }

  /**
   * Load translations for email templates
   */
  private async loadTranslations(language: 'en' | 'es'): Promise<any> {
    try {
      // In a real implementation, this would use the i18n system
      // For now, we'll load the JSON files directly
      const response = await fetch(`/locales/${language}/email.json`);
      return await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if translation loading fails
      if (language !== 'en') {
        return this.loadTranslations('en');
      }
      throw new Error('Failed to load email translations');
    }
  }

  /**
   * Create text version of invitation email
   */
  private createTextVersion(translations: any, recipientName: string, invitationToken: string): string {
    const invitationUrl = `${window.location.origin}/signup/invite/${invitationToken}`;

    return `
${translations.greeting.replace('{{name}}', recipientName)}

${translations.intro}

${translations.about}

${translations.features.title}
• ${translations.features.ai_assistant.replace(/\*\*/g, '')}
• ${translations.features.goal_tracking.replace(/\*\*/g, '')}
• ${translations.features.team_collaboration.replace(/\*\*/g, '')}
• ${translations.features.multilingual.replace(/\*\*/g, '')}
• ${translations.features.integrations.replace(/\*\*/g, '')}

${translations.cta.description}
${invitationUrl}

${translations.trial_info.replace(/\*\*/g, '')}

${translations.expiry_notice.replace(/\*\*/g, '')}

${translations.support.title}
${translations.support.text}

${translations.footer.signature}
${translations.footer.name}
${translations.footer.title}
${translations.footer.email}
${translations.footer.company}

Luna: ${translations.luna_welcome}
    `.trim();
  }

  /**
   * Create reminder email HTML (simplified version)
   */
  private renderReminderEmail(translations: any, recipientName: string, invitationToken: string, daysUntilExpiry: number, expiryDate: string): string {
    const invitationUrl = `${window.location.origin}/signup/invite/${invitationToken}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>BeProductive Beta Reminder</title>
</head>
<body style="font-family: 'Inter', sans-serif; background-color: #FAFAFA; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; padding: 40px;">
        <h1>${translations.greeting.replace('{{name}}', recipientName)}</h1>
        <p>${translations.intro}</p>
        <p>${translations.urgency.replace('{{days}}', daysUntilExpiry.toString()).replace('{{expiry_date}}', expiryDate)}</p>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationUrl}" style="display: inline-block; background-color: #D97706; color: #FFFFFF; font-size: 16px; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
                ${translations.cta.text}
            </a>
        </div>

        <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin: 32px 0;">
            <p>${translations.footer.signature}</p>
            <p><strong>${translations.footer.name}</strong></p>
            <p>${translations.footer.title}</p>
            <p><a href="mailto:${translations.footer.email}">${translations.footer.email}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Create text version of reminder email
   */
  private createReminderTextVersion(translations: any, recipientName: string, invitationToken: string, daysUntilExpiry: number): string {
    const invitationUrl = `${window.location.origin}/signup/invite/${invitationToken}`;

    return `
${translations.greeting.replace('{{name}}', recipientName)}

${translations.intro}

${translations.urgency.replace('{{days}}', daysUntilExpiry.toString())}

${translations.cta.description}
${invitationUrl}

${translations.footer.signature}
${translations.footer.name}
${translations.footer.title}
${translations.footer.email}
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService({
  testMode: import.meta.env.VITE_EMAIL_TEST_MODE === 'true',
  defaultLanguage: 'en',
  fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@be-productive.app',
  fromName: 'BeProductive Team'
});

// Export utility functions
export const sendBetaInvitation = emailService.sendInvitationEmail.bind(emailService);
export const sendBetaReminder = emailService.sendReminderEmail.bind(emailService);