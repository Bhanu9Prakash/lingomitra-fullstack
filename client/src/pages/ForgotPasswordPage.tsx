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

// Schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const { user } = useAuth();
  const { toast, success, error: showError } = useSimpleToast();
  const { theme } = useTheme();
  const [_, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Forgot password form
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/forgot-password", { email: values.email });
      // Always show success, even if email doesn't exist (security best practice)
      setEmailSent(true);
      setSentTo(values.email);
      success(
        "Reset email sent",
        "If an account exists with this email, you'll receive instructions to reset your password."
      );
    } catch (err: any) {
      // Don't reveal if the email exists or not
      setEmailSent(true);
      setSentTo(values.email);
      // Still show success message, but log the error
      console.error("Error sending reset email:", err);
      success(
        "Reset email sent",
        "If an account exists with this email, you'll receive instructions to reset your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f5f5f5]'}`}>
      <div className="container mx-auto py-6 md:py-10">
        <div className="min-h-screen grid md:grid-cols-2 gap-0 max-w-6xl mx-auto overflow-hidden rounded-lg shadow-xl">
          {/* Forgot Password Form */}
          <div className={`flex flex-col justify-center items-center p-5 md:p-10 ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f9f9f9]'}`}>
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <MascotLogo className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-1">
                  <span className="text-[#ff6600]">LingoMitra</span>
                </h1>
              </div>
              
              {emailSent ? (
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Check Your Email
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      We've sent password reset instructions to:
                    </p>
                    <p className={`text-md font-medium mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {sentTo}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      The email contains a link that will expire in 1 hour.
                      If you don't see the email, check your spam folder.
                    </p>
                    <div className="flex flex-col space-y-3 mt-6">
                      <Button
                        onClick={() => {
                          setEmailSent(false);
                          forgotPasswordForm.reset();
                        }}
                        variant="outline"
                        className={`w-full ${theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
                      >
                        Try a different email
                      </Button>
                      <Button
                        onClick={() => navigate("/auth")}
                        className="w-full bg-[#ff6600] hover:bg-[#cc5200] text-white"
                      >
                        Return to login
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200'}`}>
                  <div className="mb-7">
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Forgot Password
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  
                  <Form {...forgotPasswordForm}>
                    <form
                      onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                autoComplete="email"
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
                      
                      <Button
                        type="submit"
                        className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white rounded-md py-2 mt-2 ${isSubmitting ? 'opacity-70' : ''}`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
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
                Recover access to your language learning journey
              </p>
              <div className="space-y-7 mt-10 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Quick and secure</strong> password recovery process
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Continue learning</strong> where you left off
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Safe and private</strong> account recovery
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