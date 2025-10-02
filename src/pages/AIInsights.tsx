import { AIInsightsDashboard } from "@/components/ai-insights/AIInsightsDashboard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AIInsights() {
  return (
    <div className="container mx-auto p-6">
      <ErrorBoundary>
        <AIInsightsDashboard />
      </ErrorBoundary>
    </div>
  );
}
