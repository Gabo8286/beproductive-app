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

      // Test 3: Check tasks table (should be empty but accessible)
      const { error: tasksError } = await supabase
        .from("tasks")
        .select("count", { count: "exact", head: true });

      testResults.tasks = tasksError ? "FAILED" : "PASSED";

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
