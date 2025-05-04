import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { useTheme } from "@/components/ThemeProvider";
import MascotLogo from "@/components/MascotLogo";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Schema for reset password form
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const { user } = useAuth();
  const { toast, success, error: showError } = useSimpleToast();
  const { theme } = useTheme();
  const [_, navigate] = useLocation();

  // Extract token from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      setToken(tokenParam);
    }
  }, []);

  // Validate token when it's loaded
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenInvalid(true);
        setValidatingToken(false);
        return;
      }

      try {
        const response = await apiRequest("GET", `/api/reset-password/validate?token=${token}`);
        const data = await response.json();
        if (data.valid) {
          setTokenValidated(true);
        } else {
          setTokenInvalid(true);
        }
      } catch (err) {
        console.error("Error validating token:", err);
        setTokenInvalid(true);
      } finally {
        setValidatingToken(false);
      }
    };

    if (token) {
      validateToken();
    } else if (token === null && !validatingToken) {
      // If we've checked for the token and it's null, mark it as invalid
      setTokenInvalid(true);
    }
  }, [token]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Reset password form
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // State for form-level error message
  const [resetError, setResetError] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      setResetError("Invalid or missing reset token. Please try requesting a new password reset link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/reset-password", { 
        token, 
        newPassword: values.password 
      });
      
      setResetComplete(true);
      success(
        "Password reset successful!",
        "Your password has been reset. You can now log in with your new password."
      );
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setResetError(
        "Failed to reset password. The reset link may have expired. Please try requesting a new one."
      );
      showError(
        "Password reset failed", 
        "There was a problem resetting your password. Please try again or request a new reset link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (validatingToken) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f5f5f5]'}`}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-[#ff6600]" />
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Validating your reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f5f5f5]'}`}>
      <div className="container mx-auto py-6 md:py-10">
        <div className="min-h-screen grid md:grid-cols-2 gap-0 max-w-6xl mx-auto overflow-hidden rounded-lg shadow-xl">
          {/* Reset Password Form */}
          <div className={`flex flex-col justify-center items-center p-5 md:p-10 ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f9f9f9]'}`}>
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <MascotLogo className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-1">
                  <span className="text-[#ff6600]">LingoMitra</span>
                </h1>
              </div>
              
              {tokenInvalid ? (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200'}`}>
                  <div className="text-center mb-6">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-16 w-16 text-red-500 mx-auto mb-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Invalid or Expired Link
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      The password reset link is invalid or has expired.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Please request a new password reset link to continue.
                    </p>
                    <div className="flex flex-col space-y-3 mt-6">
                      <Button
                        onClick={() => navigate("/forgot-password")}
                        className="w-full bg-[#ff6600] hover:bg-[#cc5200] text-white"
                      >
                        Request New Reset Link
                      </Button>
                      <Button
                        onClick={() => navigate("/auth")}
                        variant="outline"
                        className={`w-full ${theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
                      >
                        Return to Login
                      </Button>
                    </div>
                  </div>
                </div>
              ) : resetComplete ? (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200'}`}>
                  <div className="text-center mb-6">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-16 w-16 text-green-500 mx-auto mb-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Password Reset Complete
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Your password has been reset successfully.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      You can now log in with your new password.
                    </p>
                    <div className="flex flex-col space-y-3 mt-6">
                      <Button
                        onClick={() => navigate("/auth")}
                        className="w-full bg-[#ff6600] hover:bg-[#cc5200] text-white"
                      >
                        Log In
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200'}`}>
                  <div className="mb-7">
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Reset Your Password
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create a new password for your LingoMitra account.
                    </p>
                  </div>
                  
                  <Form {...resetPasswordForm}>
                    <form
                      onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={resetPasswordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a new password"
                                autoComplete="new-password"
                                {...field}
                                className={`px-3 py-2 rounded-md w-full text-sm auth-input ${
                                  theme === 'dark' 
                                    ? 'bg-[#232323] border-[#2a2a2a] border-2 text-white focus:border-[#ff6600] focus:ring-0 focus:ring-offset-0' 
                                    : 'bg-white border-gray-300 text-gray-800'
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={resetPasswordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your new password"
                                autoComplete="new-password"
                                {...field}
                                className={`px-3 py-2 rounded-md w-full text-sm auth-input ${
                                  theme === 'dark' 
                                    ? 'bg-[#232323] border-[#2a2a2a] border-2 text-white focus:border-[#ff6600] focus:ring-0 focus:ring-offset-0' 
                                    : 'bg-white border-gray-300 text-gray-800'
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Inline error message */}
                      {resetError && (
                        <div className="p-3 mb-3 rounded-md text-white bg-red-600 dark:bg-red-700 text-sm">
                          <p>{resetError}</p>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white rounded-md py-2 mt-2 ${isSubmitting ? 'opacity-70' : ''}`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Remember your password?{' '}
                      <a 
                        href="/auth"
                        className={`text-[#ff6600] hover:underline font-medium`}
                      >
                        Log in
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Hero Section */}
          <div className={`hidden md:flex flex-col justify-center items-center p-12 ${theme === 'dark' ? 'text-[#f0f0f0]' : 'text-[#333333] bg-white shadow-inner'}`}>
            <div className="max-w-md space-y-6 text-center">
              <div className="mb-8">
                <div className="flex flex-col items-center mb-4">
                  <MascotLogo className="h-16 w-16 mb-4" />
                  <h1 className="text-4xl font-bold">
                    <span className="text-[#ff6600]">LingoMitra</span>
                  </h1>
                </div>
              </div>
              <p className={`text-xl font-medium leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Create a new password to secure your account
              </p>
              <div className="space-y-7 mt-10 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Strong password</strong> helps keep your account secure
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Access restored</strong> to your learning progress
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Continue learning</strong> from where you left off
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}