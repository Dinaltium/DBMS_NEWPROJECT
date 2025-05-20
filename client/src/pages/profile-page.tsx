import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { StatusIndicator } from "@/components/status-indicator";
import { UserAvatar } from "@/components/user-avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfileMutation, changePasswordMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (user) {
      updateProfileMutation.mutate({
        id: user.id,
        data,
      });
    }
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    // Reset the form on submit
    passwordForm.reset();
  };

  // Can change status if manager (T Mohammed Jazeel) or admin
  const canChangeStatus =
    user?.name === "T Mohammed Jazeel" || user?.role === "admin";

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Profile Overview Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <UserAvatar user={user} size="lg" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.employeeId}
                </p>

                <div className="mt-4 flex items-center justify-center">
                  <StatusIndicator canChange={canChangeStatus} />
                </div>

                <div className="mt-6 border-t pt-6 w-full">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Role
                      </dt>
                      <dd className="mt-1 text-sm text-foreground capitalize">
                        {user.role}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Last Active
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {user.lastActive &&
                          format(new Date(user.lastActive), "PPpp")}
                      </dd>
                    </div>
                    {user.nameLastChanged && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Name Last Changed
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {format(new Date(user.nameLastChanged), "PPp")}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile Info</TabsTrigger>
                    <TabsTrigger value="password">Change Password</TabsTrigger>
                  </TabsList>

                  {/* Profile Info Tab */}
                  <TabsContent value="profile" className="pt-4">
                    <Form {...profileForm}>
                      <form
                        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Your full name"
                                  disabled={updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                              {user.role === "employee" && (
                                <p className="text-xs text-muted-foreground">
                                  Note: Employees can only change their name
                                  once every 6 months
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Your email address"
                                  disabled={updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="Your phone number"
                                  disabled={updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  disabled={updateProfileMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* Change Password Tab */}
                  <TabsContent value="password" className="pt-4">
                    <Form {...passwordForm}>
                      <form
                        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Enter your current password"
                                  disabled={changePasswordMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Enter your new password"
                                  disabled={changePasswordMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Confirm your new password"
                                  disabled={changePasswordMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Change Password
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
