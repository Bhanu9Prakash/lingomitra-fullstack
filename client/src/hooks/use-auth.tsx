import React, { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useSimpleToast } from "@/hooks/use-simple-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { error: toastError } = useSimpleToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: "include"
        });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation<Omit<User, "password">, Error, LoginData>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      
      // Provide more user-friendly messages for common errors
      if (errorMessage.includes("Unauthorized") || errorMessage === "Login failed") {
        errorMessage = "Incorrect username/email or password. Please try again.";
      }
      
      // Show error toast with the formatted message
      toastError("Login failed", errorMessage);
    },
  });

  const registerMutation = useMutation<Omit<User, "password">, Error, InsertUser>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      
      // Provide more user-friendly messages for common errors
      if (errorMessage.includes("Username already exists")) {
        errorMessage = "This username is already taken. Please try another one.";
      } else if (errorMessage.includes("Email already exists")) {
        errorMessage = "An account with this email already exists. Try logging in instead.";
      } else if (errorMessage === "Registration failed") {
        errorMessage = "Could not create your account. Please check your information and try again.";
      }
      
      // Show error toast with the formatted message
      toastError("Registration failed", errorMessage);
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      // Show error toast with the error message
      toastError("Logout failed", error.message);
    },
  });

  const value = React.useMemo(() => ({
    user: user || null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  }), [user, isLoading, error, loginMutation, logoutMutation, registerMutation]);

  return (
    <AuthContext.Provider value={value}>
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