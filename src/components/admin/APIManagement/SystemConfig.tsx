import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, Database } from 'lucide-react';

export const SystemConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-gray-600 mt-1">
          Advanced system settings and configuration options
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Advanced settings for encryption, rotation, and system behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Cog className="h-12 w-12 mx-auto mb-4" />
              <p>System configuration interface coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};