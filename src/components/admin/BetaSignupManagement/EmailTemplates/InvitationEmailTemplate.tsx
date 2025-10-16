import React from "react";
import {
  EmailTemplate,
  EmailHeading,
  EmailParagraph,
  EmailButton,
  EmailList,
  EmailListItem,
  LunaSection,
  EmailDivider,
} from "./EmailTemplate";

interface InvitationEmailProps {
  recipientName: string;
  invitationToken: string;
  expiryDate: string;
  language: 'en' | 'es';
  translations: any; // Will be typed properly when connected to i18n
}

export const InvitationEmailTemplate: React.FC<InvitationEmailProps> = ({
  recipientName,
  invitationToken,
  expiryDate,
  language,
  translations
}) => {
  const t = translations.invitation;
  const common = translations.common;

  const invitationUrl = `${window.location.origin}/signup/invite/${invitationToken}`;

  return (
    <EmailTemplate
      language={language}
      preheader={t.intro.replace('{{name}}', recipientName)}
    >
      {/* Greeting */}
      <EmailHeading level={1}>
        {t.greeting.replace('{{name}}', recipientName)}
      </EmailHeading>

      {/* Introduction */}
      <EmailParagraph>
        {t.intro}
      </EmailParagraph>

      {/* About BeProductive */}
      <EmailParagraph>
        {t.about}
      </EmailParagraph>

      {/* Features List */}
      <EmailHeading level={2}>
        {t.features.title}
      </EmailHeading>

      <EmailList>
        <EmailListItem>
          <span dangerouslySetInnerHTML={{ __html: t.features.ai_assistant }} />
        </EmailListItem>
        <EmailListItem>
          <span dangerouslySetInnerHTML={{ __html: t.features.goal_tracking }} />
        </EmailListItem>
        <EmailListItem>
          <span dangerouslySetInnerHTML={{ __html: t.features.team_collaboration }} />
        </EmailListItem>
        <EmailListItem>
          <span dangerouslySetInnerHTML={{ __html: t.features.multilingual }} />
        </EmailListItem>
        <EmailListItem>
          <span dangerouslySetInnerHTML={{ __html: t.features.integrations }} />
        </EmailListItem>
      </EmailList>

      {/* Call to Action */}
      <EmailDivider />

      <EmailHeading level={2}>
        {t.cta.description}
      </EmailHeading>

      <EmailButton href={invitationUrl}>
        {t.cta.text}
      </EmailButton>

      {/* Trial Information */}
      <EmailParagraph style={{
        backgroundColor: '#F3F4F6',
        padding: '16px',
        borderRadius: '8px',
        border: '2px solid rgba(5, 150, 105, 0.2)',
        textAlign: 'center',
        fontWeight: '500',
      }}>
        <span dangerouslySetInnerHTML={{ __html: t.trial_info }} />
      </EmailParagraph>

      {/* Expiry Notice */}
      <EmailParagraph style={{
        backgroundColor: '#FEF3C7',
        padding: '16px',
        borderRadius: '8px',
        border: '2px solid rgba(217, 119, 6, 0.2)',
        textAlign: 'center',
        color: '#92400E',
      }}>
        <span dangerouslySetInnerHTML={{ __html: t.expiry_notice }} />
      </EmailParagraph>

      {/* Luna Welcome */}
      <LunaSection language={language}>
        {t.luna_welcome}
      </LunaSection>

      {/* Support Section */}
      <EmailDivider />

      <EmailHeading level={2}>
        {t.support.title}
      </EmailHeading>

      <EmailParagraph>
        {t.support.text}
      </EmailParagraph>

      {/* Personal Signature */}
      <EmailDivider />

      <div style={{
        backgroundColor: '#F9FAFB',
        padding: '24px',
        borderRadius: '8px',
        textAlign: 'left',
      }}>
        <EmailParagraph style={{ marginBottom: '8px' }}>
          {t.footer.signature}
        </EmailParagraph>
        <EmailParagraph style={{ marginBottom: '4px', fontWeight: 'bold' }}>
          {t.footer.name}
        </EmailParagraph>
        <EmailParagraph style={{ marginBottom: '4px', fontSize: '14px', color: '#6B7280' }}>
          {t.footer.title}
        </EmailParagraph>
        <EmailParagraph style={{ marginBottom: '4px', fontSize: '14px' }}>
          <a href={`mailto:${t.footer.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
            {t.footer.email}
          </a>
        </EmailParagraph>
        <EmailParagraph style={{ marginBottom: '0', fontSize: '14px', color: '#6B7280' }}>
          {t.footer.company}
        </EmailParagraph>
      </div>

      {/* Footer Links */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '12px',
        color: '#6B7280',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <span dangerouslySetInnerHTML={{ __html: common.beta_notice }} />
        </div>
        <div>
          <a href="#" style={{ color: '#2563EB', textDecoration: 'none', marginRight: '16px' }}>
            {common.website}
          </a>
          <a href="#" style={{ color: '#2563EB', textDecoration: 'none', marginRight: '16px' }}>
            {common.privacy}
          </a>
          <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>
            {common.terms}
          </a>
        </div>
      </div>
    </EmailTemplate>
  );
};

// Helper function to render email to HTML string
export const renderInvitationEmail = (props: InvitationEmailProps): string => {
  // This would use a server-side React renderer like ReactDOMServer
  // For now, we'll create a simplified HTML string
  const { recipientName, invitationToken, language, translations } = props;
  const t = translations.invitation;
  const invitationUrl = `${window.location.origin}/signup/invite/${invitationToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeProductive Beta Invitation</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #FAFAFA; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 12px;">
                <div style="width: 32px; height: 32px; background-color: rgba(255, 255, 255, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">✨</div>
                BeProductive
            </div>
            <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-top: 8px;">
                Your journey to productivity starts here
            </div>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
            <h1 style="color: #111827; font-weight: bold; font-size: 24px; margin: 0 0 24px 0;">
                ${t.greeting.replace('{{name}}', recipientName)}
            </h1>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${t.intro}
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${t.about}
            </p>

            <h2 style="color: #111827; font-weight: bold; font-size: 20px; margin: 24px 0 16px 0;">
                ${t.features.title}
            </h2>

            <ul style="color: #374151; font-size: 16px; line-height: 1.6; margin: 16px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">${t.features.ai_assistant}</li>
                <li style="margin-bottom: 8px;">${t.features.goal_tracking}</li>
                <li style="margin-bottom: 8px;">${t.features.team_collaboration}</li>
                <li style="margin-bottom: 8px;">${t.features.multilingual}</li>
                <li style="margin-bottom: 8px;">${t.features.integrations}</li>
            </ul>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${invitationUrl}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 16px; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; min-width: 200px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    ${t.cta.text}
                </a>
            </div>

            <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; border: 2px solid rgba(5, 150, 105, 0.2); text-align: center; font-weight: 500; margin: 16px 0;">
                ${t.trial_info}
            </div>

            <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; border: 2px solid rgba(217, 119, 6, 0.2); text-align: center; color: #92400E; margin: 16px 0;">
                ${t.expiry_notice}
            </div>

            <!-- Luna Section -->
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0; border: 2px solid rgba(37, 99, 235, 0.1); text-align: center;">
                <div style="font-size: 20px; margin-bottom: 12px;">🌙 Luna</div>
                <div style="color: #374151; font-size: 16px; line-height: 1.6; font-style: italic;">
                    ${t.luna_welcome}
                </div>
            </div>

            <!-- Support -->
            <h2 style="color: #111827; font-weight: bold; font-size: 20px; margin: 24px 0 16px 0;">
                ${t.support.title}
            </h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${t.support.text}
            </p>

            <!-- Signature -->
            <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin: 32px 0;">
                <p style="margin-bottom: 8px;">${t.footer.signature}</p>
                <p style="margin-bottom: 4px; font-weight: bold;">${t.footer.name}</p>
                <p style="margin-bottom: 4px; font-size: 14px; color: #6B7280;">${t.footer.title}</p>
                <p style="margin-bottom: 4px; font-size: 14px;">
                    <a href="mailto:${t.footer.email}" style="color: #2563EB; text-decoration: none;">${t.footer.email}</a>
                </p>
                <p style="margin-bottom: 0; font-size: 14px; color: #6B7280;">${t.footer.company}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #FAFAFA; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
            <div style="font-size: 14px; color: #6B7280; line-height: 1.6;">
                <div style="margin-bottom: 16px;"><strong>BeProductive</strong> - Transform your productivity journey</div>
                <div style="margin-bottom: 12px;">© 2025 BeProductive. All rights reserved.</div>
                <div style="font-size: 12px; opacity: 0.8;">You're receiving this email because you signed up for the BeProductive beta program.</div>
            </div>
        </div>
    </div>
</body>
</html>`;
};