import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Settings,
  Shield,
  User,
  Palette,
  Trophy,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Star,
  Zap,
  Award,
  CheckCircle,
  Timer,
  Brain,
  Heart,
  Coffee,
  Moon,
  Sun,
  Activity,
  Globe,
  Share2,
  Eye,
  EyeOff,
  Edit3,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ProductivityProfileWidget } from "@/components/widgets/ProductivityProfileWidget";

interface ProductivityStats {
  tasksCompleted: number;
  goalsAchieved: number;
  streakDays: number;
  focusHours: number;
  projectsCompleted: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'productivity' | 'streak' | 'goal' | 'collaboration';
}

interface WorkPreferences {
  workingHours: { start: string; end: string };
  timezone: string;
  focusMode: 'pomodoro' | 'timeblocking' | 'flexible';
  workdays: number[];
  breakReminders: boolean;
  deepWorkBlocks: number;
  preferredTaskTypes: string[];
}

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState<ProductivityStats>({
    tasksCompleted: 847,
    goalsAchieved: 23,
    streakDays: 12,
    focusHours: 156.5,
    projectsCompleted: 8,
    achievements: [
      {
        id: '1',
        name: 'First Steps',
        description: 'Completed your first task',
        icon: '🎯',
        unlockedAt: new Date('2024-01-15'),
        category: 'productivity'
      },
      {
        id: '2',
        name: 'Streak Master',
        description: '7-day completion streak',
        icon: '🔥',
        unlockedAt: new Date('2024-02-01'),
        category: 'streak'
      },
      {
        id: '3',
        name: 'Goal Crusher',
        description: 'Achieved 10 goals',
        icon: '🏆',
        unlockedAt: new Date('2024-02-15'),
        category: 'goal'
      },
      {
        id: '4',
        name: 'Team Player',
        description: 'Collaborated on 5 projects',
        icon: '🤝',
        unlockedAt: new Date('2024-03-01'),
        category: 'collaboration'
      }
    ]
  });

  const [workPreferences, setWorkPreferences] = useState<WorkPreferences>({
    workingHours: { start: '09:00', end: '17:00' },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    focusMode: 'pomodoro',
    workdays: [1, 2, 3, 4, 5], // Monday to Friday
    breakReminders: true,
    deepWorkBlocks: 3,
    preferredTaskTypes: ['development', 'design', 'planning']
  });

  const [publicProfile, setPublicProfile] = useState({
    visible: false,
    showStats: true,
    showAchievements: true,
    showActivity: false,
    customTitle: '',
    bio: '',
    website: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({ full_name: fullName });

    if (error) {
      toast.error(error.message || "Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await updateProfile({
        avatar_url: data.publicUrl,
      });

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const weeklyGoal = 40; // hours
  const weeklyProgress = (stats.focusHours / weeklyGoal) * 100;

  const updateWorkPreference = (key: keyof WorkPreferences, value: any) => {
    setWorkPreferences(prev => ({ ...prev, [key]: value }));
    // Here you would save to backend
  };

  const updatePublicProfile = (key: string, value: any) => {
    setPublicProfile(prev => ({ ...prev, [key]: value }));
    // Here you would save to backend
  };

  const getProductivityLevel = () => {
    const score = stats.tasksCompleted + (stats.goalsAchieved * 5) + (stats.streakDays * 2);
    if (score >= 200) return { level: 'Expert', color: 'text-purple-600', icon: Crown };
    if (score >= 100) return { level: 'Advanced', color: 'text-blue-600', icon: Star };
    if (score >= 50) return { level: 'Intermediate', color: 'text-green-600', icon: Target };
    return { level: 'Beginner', color: 'text-yellow-600', icon: Zap };
  };

  const productivityLevel = getProductivityLevel();
  const LevelIcon = productivityLevel.icon;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account and productivity settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={productivityLevel.color}>
            <LevelIcon className="h-4 w-4 mr-1" />
            {productivityLevel.level}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Public
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt={profile?.full_name || ""}
                    />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById("avatar")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Edit3 className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <Badge variant="outline" className={productivityLevel.color}>
                      <LevelIcon className="h-3 w-3 mr-1" />
                      {productivityLevel.level}
                    </Badge>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {format(new Date(profile?.created_at || new Date()), 'MMM yyyy')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</div>
                    <div className="text-xs text-muted-foreground">Tasks Done</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.goalsAchieved}</div>
                    <div className="text-xs text-muted-foreground">Goals Hit</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.focusHours}h</div>
                    <div className="text-xs text-muted-foreground">Focus Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(weeklyProgress)}%</div>
                <Progress value={weeklyProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.focusHours}/{weeklyGoal} hours this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streakDays} days</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Keep it up! 🔥
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.achievements.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Unlocked this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Personal Information</CardTitle>
                <Badge variant="secondary">Essential</Badge>
              </div>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      type="text"
                      value={profile?.role || ""}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your role
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      type="text"
                      value={workPreferences.timezone}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-detected from system
                    </p>
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Productivity Profile Assessment
              </CardTitle>
              <CardDescription>
                Discover your unique productivity style and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductivityProfileWidget />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productivity Analytics Tab */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Hours</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.focusHours}h</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Done</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projectsCompleted}</div>
                <p className="text-xs text-muted-foreground">+25% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <p className="text-xs text-muted-foreground">Personal record: 28</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Productivity Insights
              </CardTitle>
              <CardDescription>AI-powered analysis of your work patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    Peak Performance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You're most productive between 9-11 AM and 2-4 PM. Consider scheduling important tasks during these hours.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Work-Life Balance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You've maintained good work-life balance this month. Keep taking regular breaks!
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber-500" />
                    Break Patterns
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You take breaks every 45 minutes on average. This aligns well with productivity research.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Energy Levels
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your energy peaks early in the week. Try tackling complex projects on Monday-Wednesday.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>Unlock badges by reaching productivity milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlocked {format(achievement.unlockedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium mb-4">Coming Soon</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', locked: true },
                    { name: 'Speed Demon', description: 'Complete 10 tasks in one day', icon: '⚡', locked: true },
                    { name: 'Marathon Runner', description: '30-day streak', icon: '🏃', locked: true },
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 border rounded-lg opacity-50">
                      <div className="text-2xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">Locked</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Work Schedule
              </CardTitle>
              <CardDescription>Configure your ideal work hours and patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Work Start Time</Label>
                  <Select
                    value={workPreferences.workingHours.start}
                    onValueChange={(value) => updateWorkPreference('workingHours', { ...workPreferences.workingHours, start: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Work End Time</Label>
                  <Select
                    value={workPreferences.workingHours.end}
                    onValueChange={(value) => updateWorkPreference('workingHours', { ...workPreferences.workingHours, end: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Focus Mode</Label>
                <Select
                  value={workPreferences.focusMode}
                  onValueChange={(value: 'pomodoro' | 'timeblocking' | 'flexible') => updateWorkPreference('focusMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomodoro">Pomodoro Technique (25min focus)</SelectItem>
                    <SelectItem value="timeblocking">Time Blocking (custom blocks)</SelectItem>
                    <SelectItem value="flexible">Flexible (no structured timing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded to take regular breaks</p>
                  </div>
                  <Switch
                    checked={workPreferences.breakReminders}
                    onCheckedChange={(checked) => updateWorkPreference('breakReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Profile Tab */}
        <TabsContent value="public" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Public Profile
              </CardTitle>
              <CardDescription>Control what others can see about your productivity journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={publicProfile.visible}
                  onCheckedChange={(checked) => updatePublicProfile('visible', checked)}
                />
              </div>

              {publicProfile.visible && (
                <div className="space-y-6 border-l-4 border-blue-200 pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Custom Title</Label>
                      <Input
                        placeholder="e.g., Productivity Enthusiast"
                        value={publicProfile.customTitle}
                        onChange={(e) => updatePublicProfile('customTitle', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={publicProfile.website}
                        onChange={(e) => updatePublicProfile('website', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Input
                      placeholder="Tell others about your productivity journey..."
                      value={publicProfile.bio}
                      onChange={(e) => updatePublicProfile('bio', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Statistics</Label>
                        <p className="text-sm text-muted-foreground">Display your productivity stats</p>
                      </div>
                      <Switch
                        checked={publicProfile.showStats}
                        onCheckedChange={(checked) => updatePublicProfile('showStats', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Achievements</Label>
                        <p className="text-sm text-muted-foreground">Display your unlocked badges</p>
                      </div>
                      <Switch
                        checked={publicProfile.showAchievements}
                        onCheckedChange={(checked) => updatePublicProfile('showAchievements', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Activity</Label>
                        <p className="text-sm text-muted-foreground">Show your recent activity feed</p>
                      </div>
                      <Switch
                        checked={publicProfile.showActivity}
                        onCheckedChange={(checked) => updatePublicProfile('showActivity', checked)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Public Profile
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
