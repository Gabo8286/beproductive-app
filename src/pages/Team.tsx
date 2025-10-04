import { TeamDashboard } from "@/components/team/TeamDashboard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function Team() {
  return (
    <div className="container mx-auto p-6">
      <ErrorBoundary>
        <TeamDashboard />
      </ErrorBoundary>
    </div>
  );
}