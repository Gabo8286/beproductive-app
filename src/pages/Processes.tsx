import { ProcessDashboard } from "@/components/processes/ProcessDashboard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function Processes() {
  return (
    <div className="container mx-auto p-6">
      <ErrorBoundary>
        <ProcessDashboard />
      </ErrorBoundary>
    </div>
  );
}