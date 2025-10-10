import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function DatabaseTest() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<"checking" | "success" | "error">(
    "checking",
  );
  const [results, setResults] = useState<any>({});

  const testDatabase = async () => {
    if (!user) return;

    setStatus("checking");
    const testResults: any = {};

    try {
      // Test 1: Check if profile exists
      const { error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      testResults.profile = profileError ? "FAILED" : "PASSED";

      // Test 2: Check workspaces
      const { error: workspacesError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id);

      testResults.workspaces = workspacesError ? "FAILED" : "PASSED";

      // Test 3: Check tasks table
      const { error: tasksError } = await supabase
        .from("tasks")
        .select("count", { count: "exact", head: true });

      testResults.tasks = tasksError ? "FAILED" : "PASSED";

      // Test 4: Check Luna Productivity Profiles
      const { error: lunaProfileError } = await supabase
        .from("luna_productivity_profiles")
        .select("count", { count: "exact", head: true });

      testResults.lunaProfiles = lunaProfileError ? "FAILED" : "PASSED";

      // Test 5: Check Luna Proactive Insights
      const { error: insightsError } = await supabase
        .from("luna_proactive_insights")
        .select("count", { count: "exact", head: true });

      testResults.lunaInsights = insightsError ? "FAILED" : "PASSED";

      // Test 6: Check Luna Productivity Metrics
      const { error: metricsError } = await supabase
        .from("luna_productivity_metrics")
        .select("count", { count: "exact", head: true });

      testResults.lunaMetrics = metricsError ? "FAILED" : "PASSED";

      // Test 7: Check Luna Framework Assessments
      const { error: assessmentsError } = await supabase
        .from("luna_framework_assessments")
        .select("count", { count: "exact", head: true });

      testResults.lunaAssessments = assessmentsError ? "FAILED" : "PASSED";

      // Test 8: Check Luna Recovery Sessions
      const { error: recoveryError } = await supabase
        .from("luna_recovery_sessions")
        .select("count", { count: "exact", head: true });

      testResults.lunaRecovery = recoveryError ? "FAILED" : "PASSED";

      // Test 9: Check Luna Framework Reminders
      const { error: remindersError } = await supabase
        .from("luna_framework_reminders")
        .select("count", { count: "exact", head: true });

      testResults.lunaReminders = remindersError ? "FAILED" : "PASSED";

      setResults(testResults);
      setStatus("success");
    } catch (error) {
      console.error("Database test failed:", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (user) {
      testDatabase();
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Schema Test</CardTitle>
        <CardDescription>
          Testing database tables and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="font-semibold text-sm mb-2">Core Tables</div>
          <div className="flex justify-between">
            <span>Profiles Table:</span>
            <span
              className={
                results.profile === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.profile || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Workspaces Table:</span>
            <span
              className={
                results.workspaces === "PASSED"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {results.workspaces || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tasks Table:</span>
            <span
              className={
                results.tasks === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.tasks || "Testing..."}
            </span>
          </div>

          <div className="font-semibold text-sm mt-4 mb-2">Luna Framework Tables</div>
          <div className="flex justify-between">
            <span>Luna Profiles:</span>
            <span
              className={
                results.lunaProfiles === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaProfiles || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luna Insights:</span>
            <span
              className={
                results.lunaInsights === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaInsights || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luna Metrics:</span>
            <span
              className={
                results.lunaMetrics === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaMetrics || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luna Assessments:</span>
            <span
              className={
                results.lunaAssessments === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaAssessments || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luna Recovery:</span>
            <span
              className={
                results.lunaRecovery === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaRecovery || "Testing..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luna Reminders:</span>
            <span
              className={
                results.lunaReminders === "PASSED" ? "text-green-600" : "text-red-600"
              }
            >
              {results.lunaReminders || "Testing..."}
            </span>
          </div>
        </div>

        <Button onClick={testDatabase} disabled={status === "checking"}>
          {status === "checking" ? "Testing..." : "Run Test"}
        </Button>

        {profile && (
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm">
              <strong>User:</strong> {profile.full_name || "No name"} (
              {profile.role})
            </p>
            <p className="text-sm">
              <strong>Subscription:</strong> {profile.subscription_tier}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
