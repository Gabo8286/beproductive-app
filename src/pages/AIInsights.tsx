import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Insights Page - Test View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a simplified test version. If you can see this message, the routing is working correctly.
          </p>
          <p className="mt-4 text-sm">
            Full dashboard will be loaded next...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
