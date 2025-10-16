import React from "react";
import { brandConfig } from "@/lib/brand";

interface EmailTemplateProps {
  children: React.ReactNode;
  preheader?: string;
  language?: 'en' | 'es';
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  children,
  preheader = "",
  language = 'en'
}) => {
  const brandColors = {
    primary: "#2563EB", // Blue-600
    secondary: "#7C3AED", // Violet-600
    success: "#059669", // Emerald-600
    warning: "#D97706", // Amber-600
    muted: "#6B7280", // Gray-500
    background: "#FAFAFA", // Gray-50
    white: "#FFFFFF",
    text: "#111827", // Gray-900
    textMuted: "#6B7280", // Gray-500
  };

  const isRTL = language === 'ar' || language === 'he';

  // Inline CSS for email compatibility
  const styles = {
    container: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      backgroundColor: brandColors.background,
      margin: 0,
      padding: 0,
      direction: isRTL ? 'rtl' : 'ltr',
    },
    wrapper: {
      width: '100%',
      backgroundColor: brandColors.background,
      padding: '40px 20px',
    },
    content: {
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: brandColors.white,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    header: {
      background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
      padding: '32px 40px',
      textAlign: 'center' as const,
    },
    logo: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: brandColors.white,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    tagline: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '8px',
    },
    body: {
      padding: '40px',
    },
    footer: {
      backgroundColor: brandColors.background,
      padding: '32px 40px',
      textAlign: 'center' as const,
      borderTop: `1px solid #E5E7EB`,
    },
    footerText: {
      fontSize: '14px',
      color: brandColors.textMuted,
      lineHeight: '1.6',
    },
    lunaSection: {
      backgroundColor: '#F3F4F6',
      borderRadius: '12px',
      padding: '20px',
      margin: '24px 0',
      border: `2px solid ${brandColors.primary}20`,
    },
    lunaIcon: {
      fontSize: '24px',
      marginRight: '8px',
    }
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>BeProductive</title>
        {preheader && (
          <div style={{
            display: 'none',
            fontSize: '1px',
            color: brandColors.background,
            lineHeight: '1px',
            maxHeight: '0px',
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden'
          }}>
            {preheader}
          </div>
        )}
      </head>
      <body style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.content}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.logo}>
                <div style={styles.logoIcon}>✨</div>
                BeProductive
              </div>
              <div style={styles.tagline}>
                {brandConfig.tagline}
              </div>
            </div>

            {/* Body Content */}
            <div style={styles.body}>
              {children}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={styles.footerText}>
                <div style={{ marginBottom: '16px' }}>
                  <strong>BeProductive</strong> - Transform your productivity journey
                </div>
                <div style={{ marginBottom: '12px' }}>
                  © 2025 BeProductive. All rights reserved.
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  You're receiving this email because you signed up for the BeProductive beta program.
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

// Common email components
export const EmailHeading: React.FC<{ children: React.ReactNode; level?: 1 | 2 | 3 }> = ({
  children,
  level = 1
}) => {
  const style = {
    color: '#111827',
    fontWeight: 'bold',
    lineHeight: '1.3',
    margin: level === 1 ? '0 0 24px 0' : level === 2 ? '24px 0 16px 0' : '16px 0 12px 0',
    fontSize: level === 1 ? '24px' : level === 2 ? '20px' : '18px',
  };

  return React.createElement(`h${level}`, { style }, children);
};

export const EmailParagraph: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style = {}
}) => (
  <p style={{
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
    ...style
  }}>
    {children}
  </p>
);

export const EmailButton: React.FC<{
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}> = ({ href, children, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';

  return (
    <div style={{ textAlign: 'center', margin: '32px 0' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          backgroundColor: isPrimary ? '#2563EB' : '#6B7280',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '14px 28px',
          borderRadius: '8px',
          textDecoration: 'none',
          textAlign: 'center',
          minWidth: '200px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </a>
    </div>
  );
};

export const EmailList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul style={{
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '16px 0',
    paddingLeft: '20px',
  }}>
    {children}
  </ul>
);

export const EmailListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li style={{ marginBottom: '8px' }}>
    {children}
  </li>
);

export const LunaSection: React.FC<{ children: React.ReactNode; language?: 'en' | 'es' }> = ({
  children,
  language = 'en'
}) => (
  <div style={{
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
    border: '2px solid rgba(37, 99, 235, 0.1)',
    textAlign: 'center',
  }}>
    <div style={{
      fontSize: '20px',
      marginBottom: '12px',
    }}>
      🌙 Luna
    </div>
    <div style={{
      color: '#374151',
      fontSize: '16px',
      lineHeight: '1.6',
      fontStyle: 'italic',
    }}>
      {children}
    </div>
  </div>
);

export const EmailDivider: React.FC = () => (
  <hr style={{
    border: 'none',
    height: '1px',
    backgroundColor: '#E5E7EB',
    margin: '32px 0',
  }} />
);