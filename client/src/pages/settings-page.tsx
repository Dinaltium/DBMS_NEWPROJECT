import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { MainLayout } from "@/components/layout/main-layout";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value) =>
                      setTheme(value as "light" | "dark" | "system")
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="light"
                        id="theme-light"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mb-2 h-6 w-6"
                        >
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2" />
                          <path d="M12 20v2" />
                          <path d="m4.93 4.93 1.41 1.41" />
                          <path d="m17.66 17.66 1.41 1.41" />
                          <path d="M2 12h2" />
                          <path d="M20 12h2" />
                          <path d="m6.34 17.66-1.41 1.41" />
                          <path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                        Light
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="dark"
                        id="theme-dark"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mb-2 h-6 w-6"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                        Dark
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="system"
                        id="theme-system"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mb-2 h-6 w-6"
                        >
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <path d="M8 21h8" />
                          <path d="M12 17v4" />
                        </svg>
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifs">Email Notifications</Label>
                  <Switch id="email-notifs" />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="task-notifs">Task Assignments</Label>
                  <Switch id="task-notifs" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="update-notifs">System Updates</Label>
                  <Switch id="update-notifs" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="status-notifs">Status Changes</Label>
                  <Switch id="status-notifs" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-timeout">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Default: 2 hours of inactivity
                    </p>
                  </div>
                  <Switch id="session-timeout" disabled defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-status">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show your online status to other users
                    </p>
                  </div>
                  <Switch id="activity-status" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymous usage data collection
                    </p>
                  </div>
                  <Switch id="data-collection" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
