import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, RefreshCw } from "lucide-react";
import {
  useRecurringTasks,
  useGenerateInstances,
  RecurrencePattern,
} from "@/hooks/useRecurringTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { RecurrencePatternEditor } from "@/components/tasks/recurring/RecurrencePatternEditor";
import { RecurringInstancesList } from "@/components/tasks/recurring/RecurringInstancesList";
import { RecurrencePreview } from "@/components/tasks/recurring/RecurrencePreview";
import { RecurrenceIndicator } from "@/components/tasks/recurring/RecurrenceIndicator";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecurringTasks() {
  const { data: recurringTasks, isLoading } = useRecurringTasks();
  const generateInstances = useGenerateInstances();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleGenerateInstances = () => {
    generateInstances.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recurring Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage recurring task templates and their instances
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateInstances}
            disabled={generateInstances.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${generateInstances.isPending ? "animate-spin" : ""}`}
            />
            Generate Instances
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Recurring Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Recurring Task</DialogTitle>
                <DialogDescription>
                  Create a new recurring task template. Instances will be
                  generated automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  Use the Task Form and enable recurring options
                </p>
                <p className="text-xs mt-2">
                  This feature will be integrated into the task creation flow
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !recurringTasks || recurringTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg font-semibold mb-2">
                No recurring tasks yet
              </p>
              <p className="text-sm mb-4">
                Create your first recurring task to automate routine activities
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Recurring Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Templates Sidebar */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Templates ({recurringTasks.length})
            </h2>
            {recurringTasks.map((task) => (
              <Card
                key={task.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === task.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(task.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="text-xs">
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {task.recurrence_pattern && (
                    <RecurrenceIndicator
                      pattern={
                        task.recurrence_pattern as unknown as RecurrencePattern
                      }
                      size="sm"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Details */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <Tabs defaultValue="instances" className="w-full">
                <TabsList>
                  <TabsTrigger value="instances">Instances</TabsTrigger>
                  <TabsTrigger value="pattern">Pattern</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="instances" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Instances</CardTitle>
                      <CardDescription>
                        Task instances created from this template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecurringInstancesList templateId={selectedTemplate} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pattern" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recurrence Pattern</CardTitle>
                      <CardDescription>
                        Configure how often this task repeats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const template = recurringTasks.find(
                          (t) => t.id === selectedTemplate,
                        );
                        return template?.recurrence_pattern ? (
                          <div className="space-y-4">
                            <RecurrencePatternEditor
                              value={
                                template.recurrence_pattern as unknown as RecurrencePattern
                              }
                              onChange={() => {}}
                            />
                            <p className="text-xs text-muted-foreground">
                              Pattern editing coming soon
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No recurrence pattern configured
                          </p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  {(() => {
                    const template = recurringTasks.find(
                      (t) => t.id === selectedTemplate,
                    );
                    return template?.recurrence_pattern ? (
                      <RecurrencePreview
                        templateId={selectedTemplate}
                        pattern={
                          template.recurrence_pattern as unknown as RecurrencePattern
                        }
                      />
                    ) : null;
                  })()}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <p>Select a template to view details and instances</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
