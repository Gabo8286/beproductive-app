import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Check,
  Crown,
  Users,
  Shield,
  Star,
  Zap,
  Infinity,
  Clock,
  HeadphonesIcon,
  Globe,
  Lock,
  TrendingUp,
  BarChart3,
  Sparkles,
  Gift,
  AlertTriangle,
  Calculator,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  X
} from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
  description?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  icon: any;
  color: string;
  popular?: boolean;
  trial?: number; // days
  features: PlanFeature[];
  limits: {
    tasks: number | 'unlimited';
    projects: number | 'unlimited';
    storage: number | 'unlimited'; // GB
    teamMembers: number | 'unlimited';
    aiInsights: number | 'unlimited';
    integrations: number | 'unlimited';
  };
}

export default function PricingPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with personal productivity',
      price: { monthly: 0, yearly: 0 },
      currency: 'USD',
      icon: Star,
      color: 'bg-gray-500',
      features: [
        { name: 'Task Management', included: true, limit: 'Up to 100 tasks' },
        { name: 'Basic Calendar', included: true },
        { name: 'Simple Goals Tracking', included: true },
        { name: 'Mobile App Access', included: true },
        { name: 'Basic Templates', included: true, limit: '5 templates' },
        { name: 'Email Support', included: true },
        { name: 'Team Collaboration', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'AI Insights', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Custom Integrations', included: false },
        { name: 'Advanced Security', included: false },
      ],
      limits: {
        tasks: 100,
        projects: 3,
        storage: 1,
        teamMembers: 1,
        aiInsights: 0,
        integrations: 2,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For power users who need advanced features and flexibility',
      price: { monthly: 9.99, yearly: 99.99 },
      currency: 'USD',
      icon: Crown,
      color: 'bg-yellow-500',
      popular: true,
      trial: 14,
      features: [
        { name: 'Unlimited Tasks', included: true },
        { name: 'Advanced Calendar', included: true, description: 'Time blocking, multiple views' },
        { name: 'Goal Analytics', included: true },
        { name: 'Mobile & Desktop Apps', included: true },
        { name: 'All Templates', included: true, limit: '50+ templates' },
        { name: 'Priority Support', included: true },
        { name: 'Basic Team Features', included: true, limit: 'Up to 5 members' },
        { name: 'Advanced Analytics', included: true },
        { name: 'AI Insights', included: true, limit: '500/month' },
        { name: 'Integrations', included: true, limit: '10 integrations' },
        { name: 'Custom Fields', included: true },
        { name: 'Advanced Security', included: false },
      ],
      limits: {
        tasks: 'unlimited',
        projects: 25,
        storage: 10,
        teamMembers: 5,
        aiInsights: 500,
        integrations: 10,
      },
    },
    {
      id: 'team',
      name: 'Team',
      description: 'Designed for teams and small organizations',
      price: { monthly: 19.99, yearly: 199.99 },
      currency: 'USD',
      icon: Users,
      color: 'bg-blue-500',
      trial: 30,
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'Unlimited Team Members', included: true },
        { name: 'Team Analytics', included: true },
        { name: 'Advanced Permissions', included: true },
        { name: 'Team Templates', included: true },
        { name: 'Video Support', included: true },
        { name: 'Advanced Integrations', included: true, limit: '25 integrations' },
        { name: 'Custom Workflows', included: true },
        { name: 'AI Insights', included: true, limit: '2000/month' },
        { name: 'Team Reporting', included: true },
        { name: 'SSO Integration', included: true },
        { name: 'Advanced Security', included: true },
      ],
      limits: {
        tasks: 'unlimited',
        projects: 'unlimited',
        storage: 100,
        teamMembers: 'unlimited',
        aiInsights: 2000,
        integrations: 25,
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom requirements',
      price: { monthly: 49.99, yearly: 499.99 },
      currency: 'USD',
      icon: Shield,
      color: 'bg-purple-500',
      features: [
        { name: 'Everything in Team', included: true },
        { name: 'Unlimited Everything', included: true },
        { name: 'Advanced Security', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Dedicated Support', included: true },
        { name: 'SLA Guarantee', included: true },
        { name: 'On-premise Deployment', included: true },
        { name: 'Advanced Compliance', included: true },
        { name: 'Custom AI Models', included: true },
        { name: 'White-label Options', included: true },
        { name: 'API Access', included: true },
        { name: 'Training & Onboarding', included: true },
      ],
      limits: {
        tasks: 'unlimited',
        projects: 'unlimited',
        storage: 'unlimited',
        teamMembers: 'unlimited',
        aiInsights: 'unlimited',
        integrations: 'unlimited',
      },
    },
  ];

  const currentPlan = 'pro'; // This would come from user context/API

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getYearlySavings = (plan: Plan) => {
    if (plan.price.monthly === 0) return 0;
    const yearlyEquivalent = plan.price.monthly * 12;
    const savings = yearlyEquivalent - plan.price.yearly;
    return Math.round((savings / yearlyEquivalent) * 100);
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planId === currentPlan) {
      navigate('/billing');
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      // Here you would integrate with Stripe to create checkout session
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      if (planId === 'free') {
        toast.success("Downgraded to Free plan");
      } else {
        toast.success(`Redirecting to checkout for ${plans.find(p => p.id === planId)?.name} plan`);
        // Redirect to Stripe Checkout
      }
    } catch (error) {
      toast.error("Failed to process plan change");
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const getButtonText = (plan: Plan) => {
    if (plan.id === currentPlan) {
      return 'Current Plan';
    }
    if (plan.id === 'free') {
      return currentPlan !== 'free' ? 'Downgrade' : 'Get Started';
    }
    if (plan.trial) {
      return `Start ${plan.trial}-Day Trial`;
    }
    return 'Upgrade Now';
  };

  const getButtonVariant = (plan: Plan) => {
    if (plan.id === currentPlan) return 'outline';
    if (plan.popular) return 'default';
    return 'outline';
  };

  const formatLimit = (value: number | 'unlimited') => {
    if (value === 'unlimited') return '∞';
    if (typeof value === 'number' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free and scale up as your productivity needs grow. All plans include our core features.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 p-1 bg-muted rounded-lg max-w-xs mx-auto">
          <Label htmlFor="billing-cycle" className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="billing-cycle" className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
            Yearly
          </Label>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Save up to 17%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          const yearlySavings = getYearlySavings(plan);

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'border-green-500 bg-green-50/50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-lg ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>

                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {formatPrice(plan.price[billingCycle], plan.currency)}
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-lg font-normal text-muted-foreground">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>

                  {billingCycle === 'yearly' && yearlySavings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Save {yearlySavings}% annually
                    </div>
                  )}

                  {plan.trial && (
                    <div className="text-sm text-blue-600 font-medium flex items-center justify-center gap-1">
                      <Gift className="h-4 w-4" />
                      {plan.trial}-day free trial
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Limits */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted rounded-lg text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{formatLimit(plan.limits.tasks)}</div>
                    <div className="text-muted-foreground">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{formatLimit(plan.limits.storage)} GB</div>
                    <div className="text-muted-foreground">Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{formatLimit(plan.limits.teamMembers)}</div>
                    <div className="text-muted-foreground">Team</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{formatLimit(plan.limits.aiInsights)}</div>
                    <div className="text-muted-foreground">AI Insights</div>
                  </div>
                </div>

                <Separator />

                {/* Features List */}
                <div className="space-y-2">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div className={feature.included ? '' : 'text-muted-foreground'}>
                        <span>{feature.name}</span>
                        {feature.limit && (
                          <span className="text-muted-foreground"> • {feature.limit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      +{plan.features.length - 6} more features
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={getButtonVariant(plan)}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    'Processing...'
                  ) : (
                    <>
                      {getButtonText(plan)}
                      {!isCurrentPlan && plan.id !== 'free' && (
                        <ArrowRight className="h-4 w-4 ml-2" />
                      )}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Feature Comparison
          </CardTitle>
          <CardDescription>
            Compare all features across our different plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Features</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center p-4 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans[0].features.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        {feature.description && (
                          <div className="text-sm text-muted-foreground">
                            {feature.description}
                          </div>
                        )}
                      </div>
                    </td>
                    {plans.map((plan) => {
                      const planFeature = plan.features[index];
                      return (
                        <td key={plan.id} className="p-4 text-center">
                          {planFeature?.included ? (
                            <div className="space-y-1">
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                              {planFeature.limit && (
                                <div className="text-xs text-muted-foreground">
                                  {planFeature.limit}
                                </div>
                              )}
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Do you offer refunds?</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Is there a setup fee?</h4>
              <p className="text-sm text-muted-foreground">
                No setup fees for any plan. What you see is what you pay.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Ready to boost your productivity?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join thousands of users who have transformed their workflow with BeProductive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => handleSelectPlan('pro')}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}