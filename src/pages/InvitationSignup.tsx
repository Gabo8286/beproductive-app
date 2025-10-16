import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Mail,
  Lock,
  User,
  Calendar,
  Sparkles
} from "lucide-react";
import { useInvitationValidation } from "@/hooks/useBetaSignupManagement";
import { supabase } from "@/integrations/supabase/client";
import { brandConfig } from "@/lib/brand";
import { useAuth } from "@/contexts/AuthContext";

interface InvitationData {
  valid: boolean;
  signup_id: string;
  email: string;
  name: string;
  expires_at: string;
}

export const InvitationSignup: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validateTokenAsync, isValidating } = useInvitationValidation();

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string>("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user && !isValidating && !invitationData) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    validateTokenAsync(token)
      .then((data) => {
        setInvitationData(data);
      })
      .catch((err) => {
        setError(err.message || "Invalid or expired invitation");
      });
  }, [token, validateTokenAsync]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationData) return;

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsCreatingAccount(true);
    setError("");

    try {
      // Create account with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: password,
        options: {
          data: {
            full_name: invitationData.name,
            beta_signup_id: invitationData.signup_id,
            invitation_token: token,
            onboarding_source: 'beta_invitation'
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Account created successfully
        setAccountCreated(true);

        // Optional: Mark invitation as used in the database
        await supabase
          .from('beta_signups')
          .update({
            account_created_at: new Date().toISOString(),
            user_id: data.user.id
          })
          .eq('id', invitationData.signup_id);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      }

    } catch (err: any) {
      console.error("Account creation error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getExpiryInfo = () => {
    if (!invitationData) return null;

    const expiryDate = new Date(invitationData.expires_at);
    const now = new Date();
    const diffHours = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return { expired: true, message: "This invitation has expired" };
    } else if (diffHours < 24) {
      return { expired: false, message: `Expires in ${diffHours} hours`, urgent: true };
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return { expired: false, message: `Expires in ${diffDays} days`, urgent: false };
    }
  };

  const expiryInfo = getExpiryInfo();

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Validating your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BeProductive! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Your account has been created successfully. You're now part of our exclusive beta community!
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  🚀 Your 14-day Professional trial is now active!
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-brand">BeProductive</span>
          </div>
          <p className="text-muted-foreground">{brandConfig.tagline}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Beta Invitation
            </CardTitle>
            <CardDescription>
              Complete your account setup to join the BeProductive beta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invitation Info */}
            {invitationData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{invitationData.name}</p>
                    <p className="text-sm text-muted-foreground">{invitationData.email}</p>
                  </div>
                </div>

                {expiryInfo && (
                  <div className="flex items-center gap-2 mt-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={expiryInfo.expired ? "destructive" : expiryInfo.urgent ? "destructive" : "secondary"}
                    >
                      {expiryInfo.message}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Account Creation Form */}
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Trial Information */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium mb-1">
                  🎉 Exclusive Beta Benefits
                </p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• 14-day Professional trial (no credit card required)</li>
                  <li>• Early access to new features</li>
                  <li>• Direct feedback channel to our team</li>
                  <li>• Special beta pricing when we launch</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isCreatingAccount || expiryInfo?.expired}
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create My Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Luna Welcome */}
        <div className="mt-6 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-muted-foreground">
              🌙 <strong>Luna here!</strong> I can't wait to help you become your most productive self.
              Welcome to the BeProductive family!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};