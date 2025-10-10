import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  CreditCard,
  Crown,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Receipt,
  Clock,
  DollarSign,
  BarChart3,
  Gift,
  RefreshCw
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";

interface Subscription {
  id: string;
  planName: string;
  planType: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  price: number;
  currency: string;
  interval: 'month' | 'year';
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  name: string;
}

interface Invoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'draft';
  downloadUrl?: string;
  description: string;
}

interface UsageData {
  current: number;
  limit: number;
  feature: string;
  description: string;
}

export default function Billing() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_1234567890',
    planName: 'Pro Plan',
    planType: 'pro',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: addDays(new Date(), 30),
    cancelAtPeriodEnd: false,
    price: 9.99,
    currency: 'USD',
    interval: 'month',
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1234567890',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      name: 'Main Credit Card',
    },
    {
      id: 'pm_0987654321',
      type: 'paypal',
      last4: '',
      isDefault: false,
      name: 'PayPal Account',
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'in_1234567890',
      number: 'INV-2024-001',
      date: new Date(),
      dueDate: new Date(),
      amount: 9.99,
      currency: 'USD',
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
    {
      id: 'in_0987654321',
      number: 'INV-2024-002',
      date: addDays(new Date(), -30),
      dueDate: addDays(new Date(), -30),
      amount: 9.99,
      currency: 'USD',
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
    {
      id: 'in_1122334455',
      number: 'INV-2024-003',
      date: addDays(new Date(), -60),
      dueDate: addDays(new Date(), -60),
      amount: 9.99,
      currency: 'USD',
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
  ]);

  const [usage, setUsage] = useState<UsageData[]>([
    { current: 847, limit: 1000, feature: 'Tasks', description: 'Active tasks in your workspace' },
    { current: 23, limit: 50, feature: 'Projects', description: 'Active projects' },
    { current: 8, limit: 10, feature: 'Team Members', description: 'Users in your workspace' },
    { current: 2.1, limit: 5, feature: 'Storage (GB)', description: 'File storage used' },
    { current: 156, limit: 500, feature: 'AI Insights', description: 'AI-powered recommendations this month' },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'canceled':
      case 'failed':
        return 'bg-red-500';
      case 'past_due':
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'pro':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'enterprise':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Here you would call your Stripe API to cancel the subscription
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: true,
      }));

      toast.success("Subscription will be canceled at the end of the current period");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: false,
      }));

      toast.success("Subscription reactivated successfully");
    } catch (error) {
      toast.error("Failed to reactivate subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    // This would open Stripe's payment method collection flow
    toast.info("Payment method setup would open here");
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
    toast.success("Default payment method updated");
  };

  const removePaymentMethod = async (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    toast.success("Payment method removed");
  };

  const downloadInvoice = async (invoice: Invoice) => {
    // Mock download
    toast.success(`Downloading invoice ${invoice.number}`);
  };

  const getNextBillingDate = () => {
    if (subscription.cancelAtPeriodEnd) {
      return null;
    }
    return subscription.currentPeriodEnd;
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        <Button>
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage in Stripe
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                {getPlanIcon(subscription.planType)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription.planName}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(subscription.price)}/{subscription.interval}
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)} mr-2`} />
                  <span className="text-sm capitalize">{subscription.status}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getNextBillingDate() ? format(getNextBillingDate()!, 'MMM d') : 'Canceled'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getNextBillingDate()
                    ? `${formatCurrency(subscription.price)} will be charged`
                    : 'Subscription ends ' + format(subscription.currentPeriodEnd, 'MMM d, yyyy')
                  }
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <Badge variant="destructive" className="mt-2">
                    Canceling
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(subscription.price)}</div>
                <p className="text-xs text-muted-foreground">
                  Billed on {format(subscription.currentPeriodStart, 'MMM d')}
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Paid</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage This Month
              </CardTitle>
              <CardDescription>Your current usage across all features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usage.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">
                          {item.current.toLocaleString()} / {item.limit.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((item.current / item.limit) * 100)}% used
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={(item.current / item.limit) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common billing and subscription tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Crown className="h-6 w-6 mb-2" />
                  Upgrade Plan
                  <span className="text-xs text-muted-foreground mt-1">
                    Get more features
                  </span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Update Payment
                  <span className="text-xs text-muted-foreground mt-1">
                    Change payment method
                  </span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Download Invoices
                  <span className="text-xs text-muted-foreground mt-1">
                    Get billing history
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(subscription.planType)}
                Subscription Details
              </CardTitle>
              <CardDescription>Manage your current subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <p className="text-lg font-semibold">{subscription.planName}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Price</Label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(subscription.price)}/{subscription.interval}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)}`} />
                      <span className="capitalize">{subscription.status}</span>
                      {subscription.cancelAtPeriodEnd && (
                        <Badge variant="destructive">Canceling</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Billing Period</Label>
                    <p>
                      {format(subscription.currentPeriodStart, 'MMM d, yyyy')} - {format(subscription.currentPeriodEnd, 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Next Billing Date</Label>
                    <p>
                      {getNextBillingDate()
                        ? format(getNextBillingDate()!, 'MMM d, yyyy')
                        : 'Subscription will end on ' + format(subscription.currentPeriodEnd, 'MMM d, yyyy')
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Subscription ID</Label>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{subscription.id}</code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">
                  <Crown className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>

                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleReactivateSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription? You'll continue to have access
                          until {format(subscription.currentPeriodEnd, 'MMM d, yyyy')}.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Keep Subscription</Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Yes, Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {subscription.trialEnd && (
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertTitle>Trial Period</AlertTitle>
                  <AlertDescription>
                    Your trial ends on {format(subscription.trialEnd, 'MMM d, yyyy')}.
                    You'll be charged {formatCurrency(subscription.price)} on that date.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                      {method.type === 'card' ? (
                        <CreditCard className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-xs text-white font-bold">PP</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.name}</p>
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.type === 'card'
                          ? `•••• •••• •••• ${method.last4} • ${method.expiryMonth}/${method.expiryYear}`
                          : 'PayPal account'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultPaymentMethod(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethod(method.id)}
                      disabled={method.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={addPaymentMethod} variant="outline" className="w-full h-16 border-dashed">
                <Plus className="h-5 w-5 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>Download and view your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(invoice.date, 'MMM d, yyyy')} • {invoice.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(invoice.status)}`} />
                          <span className="text-sm capitalize">{invoice.status}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}