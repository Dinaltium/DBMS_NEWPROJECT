import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser, LoginData, User, UpdateUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  updateProfileMutation: UseMutationResult<
    User,
    Error,
    { id: number; data: UpdateUser }
  >;
  forgotPasswordMutation: UseMutationResult<
    { message: string },
    Error,
    { username: string }
  >;
  changePasswordMutation: UseMutationResult<
    { message: string },
    Error,
    { currentPassword: string; newPassword: string }
  >;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Clear any existing stale data
      queryClient.clear();

      // Make login request
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      // Set user data in query cache
      queryClient.setQueryData(["/api/user"], user);

      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome, ${user.name}`,
      });

      // Force a full page reload to ensure fresh state
      window.location.replace("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // NUCLEAR OPTION - BRUTE FORCE APPROACH
      console.log("FORCE LOGOUT INITIATED");

      try {
        // Step 1: Clear client state aggressively
        console.log("Clearing client state...");
        queryClient.clear();
        queryClient.setQueryData(["/api/user"], null);

        // Step 2: Wipe all storage
        console.log("Clearing all storage...");
        localStorage.clear();
        sessionStorage.clear();

        // Step 3: Obliterate all cookies
        console.log("Destroying all cookies...");
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" +
                new Date(0).toUTCString() +
                ";path=/;domain=" +
                window.location.hostname
            );
        });

        // Step 4: Call server logout in background
        console.log("Notifying server of logout...");
        fetch("/api/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store",
            Pragma: "no-cache",
          },
          // Don't wait for response - fire and forget
        }).catch((e) => console.log("Server logout notification error:", e));

        // Step 5: Show feedback
        if (toast) {
          toast({
            title: "Logging out...",
            description: "Redirecting to login page",
          });
        }

        // Step 6: IMMEDIATE FORCED REDIRECT - Multiple attempts
        console.log("EXECUTING FORCED NAVIGATION");

        // Add logout parameter
        const authUrl = `/auth?logout=1&nocache=${Date.now()}`;

        // First attempt
        console.log("Navigation attempt 1: location.href");
        window.location.href = authUrl;

        // Second attempt with slight delay
        setTimeout(() => {
          console.log("Navigation attempt 2: location.replace");
          window.location.replace(authUrl + "&attempt=2");
        }, 50);

        // Third attempt with different technique
        setTimeout(() => {
          console.log("Navigation attempt 3: open in self");
          window.open(authUrl + "&attempt=3", "_self");
        }, 100);

        // Fourth attempt with page reload
        setTimeout(() => {
          console.log("Navigation attempt 4: hard reload");
          window.location.href = authUrl + "&attempt=4";
          window.location.reload(true);
        }, 150);
      } catch (error) {
        // Even if there's an error in the main logic, proceed with nuclear option
        console.error(
          "Logout error occurred, proceeding with force redirect:",
          error
        );

        // Last resort - brute force reload to auth page
        window.location.href = "/auth?error=1&force=1&t=" + Date.now();
        window.location.reload(true);
      }
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUser }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return await res.json();
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await apiRequest("POST", "/api/forgot-password", {
        username,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const res = await apiRequest("POST", "/api/change-password", {
        currentPassword,
        newPassword,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password changed",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
        forgotPasswordMutation,
        changePasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
