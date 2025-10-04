import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Shield } from "lucide-react";

export const SystemLimitsConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Limits</h2>
        <p className="text-gray-600 mt-1">
          Configure global limits and quotas for API usage across all providers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Limits Configuration
          </CardTitle>
          <CardDescription>
            Global limits and provider-specific configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4" />
              <p>System limits configuration interface coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
