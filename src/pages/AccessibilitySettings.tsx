import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';

/**
 * Accessibility Settings Page
 * Dedicated page for users to customize accessibility preferences
 */
export default function AccessibilitySettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <AccessibilitySettings />
    </div>
  );
}
