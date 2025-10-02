import { useAutomationLogs } from '@/hooks/useAutomation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AutomationLogsProps {
  ruleId?: string;
}

export function AutomationLogs({ ruleId }: AutomationLogsProps) {
  const { data: logs = [], isLoading } = useAutomationLogs(ruleId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading logs...</div>;
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">No automation logs yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Execution Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {log.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={log.success ? 'default' : 'destructive'}>
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.executed_at), 'PPp')}
                    </span>
                    {log.execution_time_ms && (
                      <span className="text-xs text-muted-foreground">
                        • {log.execution_time_ms}ms
                      </span>
                    )}
                  </div>

                  {log.success && Object.keys(log.changes_made).length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Changes made:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {Object.entries(log.changes_made).map(([key, value]) => (
                          <li key={key}>
                            {key.replace(/_/g, ' ')}: {JSON.stringify(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!log.success && log.error_message && (
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-1">Error:</p>
                      <p className="text-muted-foreground">{log.error_message}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
