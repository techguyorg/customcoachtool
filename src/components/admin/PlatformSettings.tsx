import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Shield, Bell, Globe, Database } from "lucide-react";

export function PlatformSettings() {
  // Feature flags
  const [features, setFeatures] = useState({
    coachMarketplace: true,
    clientSelfSignup: true,
    progressPhotos: true,
    nutritionTracking: true,
    workoutLogging: true,
    messaging: true,
  });

  // Default values
  const [defaults, setDefaults] = useState({
    maxClientsPerCoach: "50",
    defaultTrialDays: "14",
    checkinFrequencyDays: "7",
    sessionTimeout: "60",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    checkinReminders: true,
    newClientAlerts: true,
    systemAlerts: true,
  });

  const handleSaveFeatures = () => {
    // In a real app, this would save to database
    toast.success("Feature flags updated successfully");
  };

  const handleSaveDefaults = () => {
    toast.success("Default values updated successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification settings updated successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Platform Settings
        </h2>
        <p className="text-muted-foreground">
          Configure platform-wide settings, feature flags, and default values
        </p>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features" className="gap-2">
            <Shield className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="defaults" className="gap-2">
            <Database className="h-4 w-4" />
            Defaults
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable platform features globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Coach Marketplace</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow clients to discover and request coaches
                  </p>
                </div>
                <Switch
                  checked={features.coachMarketplace}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, coachMarketplace: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client Self-Signup</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow clients to sign up without coach invitation
                  </p>
                </div>
                <Switch
                  checked={features.clientSelfSignup}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, clientSelfSignup: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Progress Photos</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable progress photo uploads and tracking
                  </p>
                </div>
                <Switch
                  checked={features.progressPhotos}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, progressPhotos: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nutrition Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable nutrition logging and diet plan features
                  </p>
                </div>
                <Switch
                  checked={features.nutritionTracking}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, nutritionTracking: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workout Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable workout tracking and exercise logging
                  </p>
                </div>
                <Switch
                  checked={features.workoutLogging}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, workoutLogging: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In-App Messaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable coach-client messaging
                  </p>
                </div>
                <Switch
                  checked={features.messaging}
                  onCheckedChange={(checked) =>
                    setFeatures({ ...features, messaging: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveFeatures}>Save Feature Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Values</CardTitle>
              <CardDescription>
                Configure default settings for new users and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxClients">Max Clients per Coach</Label>
                  <Input
                    id="maxClients"
                    type="number"
                    value={defaults.maxClientsPerCoach}
                    onChange={(e) =>
                      setDefaults({ ...defaults, maxClientsPerCoach: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum clients a coach can accept
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trialDays">Default Trial Period (days)</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={defaults.defaultTrialDays}
                    onChange={(e) =>
                      setDefaults({ ...defaults, defaultTrialDays: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Free trial duration for new coaching relationships
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkinFreq">Check-in Frequency (days)</Label>
                  <Input
                    id="checkinFreq"
                    type="number"
                    value={defaults.checkinFrequencyDays}
                    onChange={(e) =>
                      setDefaults({ ...defaults, checkinFrequencyDays: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Default days between client check-ins
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={defaults.sessionTimeout}
                    onChange={(e) =>
                      setDefaults({ ...defaults, sessionTimeout: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveDefaults}>Save Default Values</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure platform-wide notification behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Check-in Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders to clients for scheduled check-ins
                  </p>
                </div>
                <Switch
                  checked={notifications.checkinReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, checkinReminders: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Client Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify coaches when new clients request coaching
                  </p>
                </div>
                <Switch
                  checked={notifications.newClientAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newClientAlerts: checked })
                  }
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify super admins of system events
                  </p>
                </div>
                <Switch
                  checked={notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, systemAlerts: checked })
                  }
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
