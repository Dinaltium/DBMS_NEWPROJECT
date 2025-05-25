import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginData } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Loader2, Truck, Package, Server, Shield } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AuthPage() {
  const { user, loginMutation, forgotPasswordMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"employee" | "admin">("employee");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(
      z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      })
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
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
    // Use a stronger redirect approach that forces a navigation
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-blue-200 dark:bg-blue-900/20 opacity-50"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full bg-indigo-200 dark:bg-indigo-900/20 opacity-40"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-[40%] left-[15%] w-32 h-32 rounded-full bg-purple-200 dark:bg-purple-900/20 opacity-30"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Login container */}
      <div className="container mx-auto px-4 py-12 z-10">
        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Left side - Hero section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold mb-4">
                  DBMS Mini Project: Aviation Logistics
                </h1>
                <p className="text-blue-100 mb-8">Created by</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src="/Assets/1517568614094.png"
                    alt="Rafan Ahamad Sheik"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">Rafan Ahamad Sheik</h3>
                    <p className="text-sm text-blue-100">4PA23CS102</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <img
                    src="https://github.com/jazeeljr.png"
                    alt="Shaikh Mohammed Shahil"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">Shaikh Mohammed Shahil</h3>
                    <p className="text-sm text-blue-100">4PA23CS127</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <img
                    src="https://github.com/octocat.png"
                    alt="Mustafa Muhammad"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">Mustafa Muhammad</h3>
                    <p className="text-sm text-blue-100">4PA22CS092</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <img
                    src="https://github.com/octocat.png"
                    alt="Mishab K"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">Mishab K</h3>
                    <p className="text-sm text-blue-100">4PA23CS073</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <p className="text-sm text-blue-100 mt-8">
                © 2025 Aviation Logistics
              </p>
            </motion.div>
          </div>

          {/* Right side - Login form */}
          <motion.div
            className="lg:w-1/2 p-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>

            {/* User type toggle */}
            <div className="mb-8 flex justify-center">
              <motion.div
                className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex"
                whileHover={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
              >
                <motion.div
                  className="absolute inset-y-1 rounded-full bg-white dark:bg-primary-600 shadow-md z-0"
                  initial={false}
                  animate={{
                    x: activeTab === "employee" ? 0 : "100%",
                    width: "50%",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <motion.button
                  className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors duration-200
                    ${
                      activeTab === "employee"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => setActiveTab("employee")}
                  whileTap={{ scale: 0.95 }}
                >
                  Employee
                </motion.button>
                <motion.button
                  className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors duration-200
                    ${
                      activeTab === "admin"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => setActiveTab("admin")}
                  whileTap={{ scale: 0.95 }}
                >
                  Admin
                </motion.button>
              </motion.div>
            </div>

            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            activeTab === "employee"
                              ? "Enter employee username"
                              : "Enter admin username"
                          }
                          className="dark:bg-gray-800 h-11"
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
                          className="dark:bg-gray-800 h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>

                  <Dialog
                    open={forgotPasswordOpen}
                    onOpenChange={setForgotPasswordOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="text-primary-600 dark:text-primary-400 p-0"
                      >
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your username to reset your password.
                          {activeTab === "admin" &&
                            " Admin passwords can only be reset manually."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="forgot-username"
                            className="text-right"
                          >
                            Username
                          </Label>
                          <Input
                            id="forgot-username"
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="Enter your username"
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

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-5 w-5" />
                    )}
                    Sign in
                  </Button>
                </motion.div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For demo, use credentials:{" "}
                    <span className="font-medium">
                      Username: {activeTab === "admin" ? "rafan" : "sandeep"},
                      Password: AL2023
                    </span>
                  </p>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
