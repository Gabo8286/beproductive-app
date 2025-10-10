import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, AlertCircle, Shield, Sparkles } from "lucide-react";

interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Load recent login attempts
    const attempts = localStorage.getItem('login_attempts');
    if (attempts) {
      setLoginAttempts(JSON.parse(attempts));
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Check if onboarding has been completed
      const onboardingCompleted = localStorage.getItem('beproductive_onboarding_completed');
      if (onboardingCompleted) {
        navigate("/app/capture");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, navigate]);

  const recordLoginAttempt = (success: boolean) => {
    const attempt: LoginAttempt = {
      email,
      timestamp: new Date(),
      success,
    };

    const updatedAttempts = [attempt, ...loginAttempts.slice(0, 4)];
    setLoginAttempts(updatedAttempts);
    localStorage.setItem('login_attempts', JSON.stringify(updatedAttempts));

    // Check for failed attempts in last 15 minutes
    const recentFailedAttempts = updatedAttempts.filter(
      attempt =>
        !attempt.success &&
        Date.now() - new Date(attempt.timestamp).getTime() < 15 * 60 * 1000
    );

    if (recentFailedAttempts.length >= 3) {
      setIsLocked(true);
      setTimeout(() => setIsLocked(false), 15 * 60 * 1000); // 15 minutes
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error("Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.");
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      let errorMessage = error.message || "Failed to sign in";

      // Provide more helpful error messages
      if (errorMessage === "Invalid login credentials") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      }

      toast.error(errorMessage);
      recordLoginAttempt(false);
    } else {
      toast.success("Signed in successfully");
      recordLoginAttempt(true);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // Check onboarding status
      const onboardingCompleted = localStorage.getItem('beproductive_onboarding_completed');
      if (onboardingCompleted) {
        navigate("/app/capture");
      } else {
        navigate("/onboarding");
      }
    }

    setLoading(false);
  };

  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        // Mock other providers for demo
        toast.info(`${provider} authentication would be implemented here`);
      }
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setLoading(true);

    try {
      // Mock magic link sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error("Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setEmail("demo@beproductive.com");
    setPassword("DemoPassword123!");

    const { error } = await signIn("demo@beproductive.com", "DemoPassword123!");

    if (error) {
      let errorMessage = error.message || "Failed to sign in";

      if (errorMessage === "Invalid login credentials") {
        errorMessage = "Demo account not available. Please use the signup form to create an account.";
      }

      toast.error(errorMessage);
    } else {
      toast.success("Signed in with demo account");
      navigate("/app/capture");
    }

    setLoading(false);
  };

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
      color: 'border-gray-300 hover:bg-gray-50'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      color: 'border-gray-900 hover:bg-gray-900 hover:text-white'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#f25022" d="M0 0h11v11H0z" />
          <path fill="#00a4ef" d="M13 0h11v11H13z" />
          <path fill="#7fba00" d="M0 13h11v11H0z" />
          <path fill="#ffb900" d="M13 13h11v11H13z" />
        </svg>
      ),
      color: 'border-blue-500 hover:bg-blue-50'
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
      color: 'border-gray-800 hover:bg-gray-800 hover:text-white'
    }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-mesh p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">BeProductive</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue your productivity journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLocked && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.
              </AlertDescription>
            </Alert>
          )}

          {magicLinkSent ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Magic link sent to {email}! Check your email and click the link to sign in.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || isLocked}
                    className={isLocked ? 'opacity-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm"
                        onClick={handleMagicLink}
                        disabled={loading || !email}
                      >
                        Send Magic Link
                      </Button>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading || isLocked}
                      className={`pr-10 ${isLocked ? 'opacity-50' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember my email
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isLocked}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Providers */}
              <div className="grid grid-cols-2 gap-3">
                {socialProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className={`${provider.color} transition-colors`}
                    onClick={() => handleSocialSignIn(provider.id)}
                    disabled={loading || socialLoading !== null || isLocked}
                  >
                    {socialLoading === provider.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <span className="mr-2">{provider.icon}</span>
                    )}
                    {provider.name}
                  </Button>
                ))}
              </div>

              {/* Demo Account */}
              <Separator />

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={loading || isLocked}
              >
                🎯 Try Demo Account
              </Button>
            </>
          )}

          {/* Recent Login Attempts */}
          {loginAttempts.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <Shield className="h-4 w-4 mr-2" />
                  View Recent Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recent Login Activity</DialogTitle>
                  <DialogDescription>
                    Your recent login attempts for security monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {loginAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{attempt.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={attempt.success ? "default" : "destructive"}>
                        {attempt.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up for free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
