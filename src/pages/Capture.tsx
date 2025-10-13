import React from 'react';
import { CaptureTab } from '@/components/tabs/CaptureTab';
import { PageErrorBoundary } from '@/components/errors/CascadingErrorBoundary';

export default function Capture() {
  return (
    <PageErrorBoundary pageName="Capture">
      <CaptureTab />
    </PageErrorBoundary>
  );
}