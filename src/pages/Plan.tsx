import React from 'react';
import { CycleNavigation } from '@/components/productivity/CycleNavigation';
import { CaptureAndRecordView } from '@/components/productivity/CaptureAndRecordView';
import { OrganizedExecutionView } from '@/components/productivity/OrganizedExecutionView';
import { EngageAndControlView } from '@/components/productivity/EngageAndControlView';
import { useProductivityCycle } from '@/modules/productivity-cycle/hooks/useProductivityCycle';

const Plan: React.FC = () => {
  const { state } = useProductivityCycle();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Cycle Navigation */}
      <CycleNavigation />

      {/* Phase-specific Interface */}
      {state.currentPhase === 'capture' && <CaptureAndRecordView />}

      {state.currentPhase === 'execute' && <OrganizedExecutionView />}

      {state.currentPhase === 'engage' && <EngageAndControlView />}
    </div>
  );
};

export default Plan;