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

  // FIXED NUCLEAR LOGOUT FUNCTION
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("NUCLEAR LOGOUT INITIATED");

      try {
        // 1. First nullify the user in query cache immediately
        queryClient.setQueryData(["/api/user"], null);
        queryClient.clear();

        // 2. Clear any browser storage
        localStorage.clear();
        sessionStorage.clear();

        // 3. Clear all cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
        }

        // 4. Show logout message
        if (toast) {
          toast({
            title: "Logging out",
            description: "Redirecting to login...",
          });
        }

        // 5. Immediate redirect to auth page with timestamp to prevent caching
        try {
          const timestamp = new Date().getTime();
          const authUrl = `/auth?logout=1&t=${timestamp}`;

          // Main redirection attempt
          window.location.href = authUrl;

          // Multiple fallback attempts with increasing delays
          setTimeout(() => {
            try {
              window.location.replace(authUrl + "&attempt=2");
            } catch (e) {}
          }, 50);

          setTimeout(() => {
            try {
              window.open(authUrl + "&attempt=3", "_self");
            } catch (e) {}
          }, 100);

          setTimeout(() => {
            try {
              document.location.href = authUrl + "&attempt=4";
            } catch (e) {}
          }, 150);

          // Last resort - hard reload
          setTimeout(() => {
            try {
              window.location.reload(true);
            } catch (e) {}
          }, 200);
        } catch (navErr) {
          console.error("Navigation error:", navErr);
          // Just in case navigation API fails
          window.location.href = "/auth?error=navfailed";
        }

        // 6. Call server logout API as a background task
        try {
          fetch("/api/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Cache-Control": "no-store, no-cache",
              Pragma: "no-cache",
            },
          }).catch((err) => {
            console.error("Logout API error (non-critical):", err);
          });
        } catch (fetchErr) {
          // Nothing to do - we're already redirecting anyway
          console.error("Fetch API error:", fetchErr);
        }
      } catch (err) {
        console.error("Critical logout error:", err);
        // No matter what, try to redirect
        window.location.href = "/auth?error=critical";
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
