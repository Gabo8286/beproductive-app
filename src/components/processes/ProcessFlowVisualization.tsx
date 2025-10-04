import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Square,
  Diamond,
  CheckCircle,
  FileInput,
  FileOutput,
  Clock,
  Users,
  Plus,
  ArrowDown,
  ArrowRight,
  Edit
} from "lucide-react";
import { ProcessStep, Process } from "@/types/processes";

interface ProcessFlowVisualizationProps {
  process: Process;
  onEditStep?: (stepId: string) => void;
  onAddStep?: (afterStepId?: string) => void;
  readonly?: boolean;
}

const getStepIcon = (type: ProcessStep['type']) => {
  switch (type) {
    case 'task':
      return Square;
    case 'decision':
      return Diamond;
    case 'approval':
      return CheckCircle;
    case 'input':
      return FileInput;
    case 'output':
      return FileOutput;
    case 'delay':
      return Clock;
    default:
      return Square;
  }
};

const getStepColor = (type: ProcessStep['type']) => {
  switch (type) {
    case 'task':
      return 'bg-blue-500';
    case 'decision':
      return 'bg-yellow-500';
    case 'approval':
      return 'bg-green-500';
    case 'input':
      return 'bg-purple-500';
    case 'output':
      return 'bg-indigo-500';
    case 'delay':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

export function ProcessFlowVisualization({
  process,
  onEditStep,
  onAddStep,
  readonly = false
}: ProcessFlowVisualizationProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const sortedSteps = [...process.steps].sort((a, b) => a.order - b.order);

  const StepCard = ({ step, index }: { step: ProcessStep; index: number }) => {
    const Icon = getStepIcon(step.type);
    const colorClass = getStepColor(step.type);
    const isSelected = selectedStep === step.id;

    return (
      <div className="relative">
        <Card
          className={`transition-all cursor-pointer hover:shadow-md ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedStep(step.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg text-white ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">{step.title}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {step.type}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">#{step.order}</span>
                {!readonly && onEditStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStep(step.id);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {step.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {step.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1 text-xs">
              {step.responsible_role && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {step.responsible_role}
                </Badge>
              )}
              {step.estimated_duration && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {step.estimated_duration}m
                </Badge>
              )}
            </div>

            {step.dependencies && step.dependencies.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Dependencies:</p>
                <div className="flex flex-wrap gap-1">
                  {step.dependencies.map((depId) => {
                    const depStep = process.steps.find(s => s.id === depId);
                    return depStep ? (
                      <Badge key={depId} variant="outline" className="text-xs">
                        {depStep.title}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {step.conditions && Object.keys(step.conditions).length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Conditions:</p>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  {Object.entries(step.conditions).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Step Button */}
        {!readonly && onAddStep && index < sortedSteps.length - 1 && (
          <div className="flex justify-center my-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddStep(step.id)}
              className="rounded-full w-8 h-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Flow Arrow */}
        {index < sortedSteps.length - 1 && (
          <div className="flex justify-center my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Flow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Process Flow</h3>
          <p className="text-sm text-muted-foreground">
            {sortedSteps.length} steps • {process.category} process
          </p>
        </div>
        <div className="flex gap-2">
          {!readonly && onAddStep && (
            <Button variant="outline" size="sm" onClick={() => onAddStep()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          )}
        </div>
      </div>

      {/* Process Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {process.triggers.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {process.triggers.map((trigger, index) => (
                  <Badge key={index} variant="outline" className="text-xs block">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {process.inputs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileInput className="h-4 w-4" />
                Inputs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {process.inputs.map((input, index) => (
                  <Badge key={index} variant="outline" className="text-xs block">
                    {input}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {process.outputs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileOutput className="h-4 w-4" />
                Outputs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {process.outputs.map((output, index) => (
                  <Badge key={index} variant="outline" className="text-xs block">
                    {output}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {process.metrics.avg_completion_time && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {Math.round(process.metrics.avg_completion_time)}m
              </div>
              <p className="text-xs text-muted-foreground">Average time</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Step Type Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Step Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { type: 'task', label: 'Task', icon: Square },
              { type: 'decision', label: 'Decision', icon: Diamond },
              { type: 'approval', label: 'Approval', icon: CheckCircle },
              { type: 'input', label: 'Input', icon: FileInput },
              { type: 'output', label: 'Output', icon: FileOutput },
              { type: 'delay', label: 'Delay', icon: Clock },
            ].map(({ type, label, icon: Icon }) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className={`p-1 rounded text-white ${getStepColor(type as ProcessStep['type'])}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Flow */}
      <div className="max-w-md mx-auto">
        {sortedSteps.length > 0 ? (
          <div className="space-y-0">
            {/* Start indicator */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                START
              </div>
            </div>

            {sortedSteps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}

            {/* Add step at end */}
            {!readonly && onAddStep && (
              <div className="flex justify-center my-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddStep()}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* End indicator */}
            <div className="flex justify-center mt-4">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                END
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Square className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No steps defined</h3>
            <p className="text-muted-foreground mb-4">
              Add steps to visualize your process flow.
            </p>
            {!readonly && onAddStep && (
              <Button onClick={() => onAddStep()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Step
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Step Details Panel */}
      {selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Step Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const step = process.steps.find(s => s.id === selectedStep);
              return step ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {step.type}
                    </div>
                    <div>
                      <span className="font-medium">Order:</span> {step.order}
                    </div>
                    {step.responsible_role && (
                      <div>
                        <span className="font-medium">Responsible:</span> {step.responsible_role}
                      </div>
                    )}
                    {step.estimated_duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {step.estimated_duration} minutes
                      </div>
                    )}
                  </div>

                  {step.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">{step.notes}</p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}