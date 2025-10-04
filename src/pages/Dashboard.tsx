import React from "react";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/widgets/CommandPalette";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";

const Dashboard: React.FC = () => {
  const commandPalette = useCommandPalette();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <GreetingHeader />

      <WidgetGrid className="min-h-[600px]" />

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onOpenChange={commandPalette.close}
      />

      {/* Quick tip for new users */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Pro Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            • Press{" "}
            <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">
              ⌘K
            </kbd>{" "}
            to open the command palette
          </li>
          <li>• Drag widgets to rearrange your dashboard</li>
          <li>• Click the expand icon on any widget to view the full module</li>
          <li>• Add up to 6 widgets for optimal productivity</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
