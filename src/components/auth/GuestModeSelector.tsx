import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Crown, TestTube } from "lucide-react";
import { isGuestModeEnabled, GuestUserType } from "@/utils/auth/guestMode";

interface GuestModeOption {
  type: GuestUserType;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  badge: string;
  color: string;
}

const guestModeOptions: GuestModeOption[] = [
  {
    type: 'admin',
    title: 'Super Admin',
    description: 'Full access to all features and administrative functions',
    icon: <Crown className="h-6 w-6 text-purple-600" />,
    features: [
      'Create & manage workspaces',
      'Access all modules & features',
      'User management capabilities',
      'System configuration',
      'Luna AI assistant',
      'All productivity tools'
    ],
    badge: 'Full Access',
    color: 'border-purple-200 bg-purple-50'
  },
  {
    type: 'user',
    title: 'Regular User',
    description: 'Standard user experience with core productivity features',
    icon: <User className="h-6 w-6 text-blue-600" />,
    features: [
      'Task management',
      'Calendar & scheduling',
      'Basic AI features',
      'Personal workspace',
      'Goal tracking',
      'Habit building'
    ],
    badge: 'Standard',
    color: 'border-blue-200 bg-blue-50'
  }
];

interface GuestModeSelectorProps {
  className?: string;
}

export default function GuestModeSelector({ className = "" }: GuestModeSelectorProps) {
  const { signInAsGuest } = useAuth();

  // Only show if guest mode is enabled
  if (!isGuestModeEnabled()) {
    return null;
  }

  const handleGuestSignIn = (type: GuestUserType) => {
    signInAsGuest(type);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <TestTube className="h-5 w-5 text-orange-500 mr-2" />
          <span className="text-sm font-medium text-orange-700">Development Mode</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a demo account to explore the application
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4">
        {guestModeOptions.map((option) => (
          <Card key={option.type} className={`transition-all hover:shadow-md ${option.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {option.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Shield className="h-3 w-3 mr-1 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleGuestSignIn(option.type)}
                  className="w-full"
                  variant={option.type === 'admin' ? 'default' : 'secondary'}
                >
                  Continue as {option.title}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Guest mode bypasses authentication for testing purposes only
        </p>
      </div>
    </div>
  );
}