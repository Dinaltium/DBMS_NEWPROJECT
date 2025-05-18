import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginData, insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, forgotPasswordMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"employee" | "admin">("employee");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(z.object({
      username: z.string().min(1, "Employee ID is required"),
      password: z.string().min(1, "Password is required"),
    })),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      employeeId: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
    },
  });

  // Set the role based on the active tab
  useEffect(() => {
    registerForm.setValue("role", activeTab);
  }, [activeTab, registerForm]);

  // Handle login submission
  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Handle register submission
  const onRegisterSubmit = (data: RegisterData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    if (forgotUsername) {
      forgotPasswordMutation.mutate({ username: forgotUsername });
      setForgotPasswordOpen(false);
    }
  };

  // Redirect if user is logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Advanced Logistics Management
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>
        
        {/* Auth Tabs */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="relative bg-gray-100 dark:bg-dark-card rounded-full p-1 flex">
                      <button 
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          activeTab === "employee" 
                            ? "bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("employee")}
                      >
                        Employee
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          activeTab === "admin" 
                            ? "bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("admin")}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Format: AL00CA1234"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Default: AL2023"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox id="remember-me" />
                          <label
                            htmlFor="remember-me"
                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Remember me
                          </label>
                        </div>
                        
                        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="text-primary-600 dark:text-primary-400">
                              Forgot your password?
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Enter your Employee ID to reset your password.
                                Admin passwords can only be reset manually.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="forgot-username" className="text-right">
                                  Employee ID
                                </Label>
                                <Input
                                  id="forgot-username"
                                  value={forgotUsername}
                                  onChange={(e) => setForgotUsername(e.target.value)}
                                  placeholder="Enter your Employee ID"
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                onClick={handleForgotPassword}
                                disabled={forgotPasswordMutation.isPending}
                              >
                                {forgotPasswordMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Reset Password
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign in
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="relative bg-gray-100 dark:bg-dark-card rounded-full p-1 flex">
                      <button 
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          activeTab === "employee" 
                            ? "bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("employee")}
                      >
                        Employee
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          activeTab === "admin" 
                            ? "bg-white dark:bg-primary-600 text-gray-900 dark:text-white shadow" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setActiveTab("admin")}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your full name"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Format: AL00CA1234"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Choose a username"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter your email"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Create a password"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Confirm your password"
                                className="dark:bg-dark-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
