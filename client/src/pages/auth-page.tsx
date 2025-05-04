import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MascotLogo from "@/components/MascotLogo";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { useTheme } from "@/components/ThemeProvider";

// Extend the user schema with client-side validation
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = loginSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  // Check for tab parameter in URL and verification status
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      return tabParam === 'register' ? 'register' : 'login';
    }
    return 'login';
  };

  const isVerified = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('verified') === 'true';
    }
    return false;
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const [justVerified, setJustVerified] = useState<boolean>(isVerified());
  const [showVerificationMessage, setShowVerificationMessage] = useState<boolean>(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast, success, error: showError } = useSimpleToast();
  const { theme } = useTheme();
  const [_, navigate] = useLocation();

  // Set the active tab based on URL parameter
  useEffect(() => {
    const tabFromUrl = getInitialTab();
    setActiveTab(tabFromUrl);
    
    // Check if email was just verified - both from URL and sessionStorage
    const justVerifiedFromUrl = isVerified();
    const justVerifiedFromStorage = sessionStorage.getItem('emailJustVerified') === 'true';
    
    if (justVerifiedFromUrl || justVerifiedFromStorage) {
      success(
        "Email verified successfully!", 
        "Your email has been verified. You can now log in to your account."
      );
      
      // Remove the verified parameter from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      window.history.replaceState({}, document.title, url.toString());
      
      // Clear the verification flag from sessionStorage
      sessionStorage.removeItem('emailJustVerified');
      
      // Pre-populate username field if available in sessionStorage
      const verifiedUsername = sessionStorage.getItem('verifiedUsername');
      if (verifiedUsername) {
        loginForm.setValue('username', verifiedUsername);
        sessionStorage.removeItem('verifiedUsername');
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // State for form-level error message
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Submit handlers
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoginError(null); // Clear previous errors
    try {
      await loginMutation.mutateAsync(values);
      success("Welcome back!", "You have successfully logged in.");
      navigate("/");
    } catch (err: any) {
      // Check for verification error
      if (err.message?.includes("verify") || 
          (err.response && err.response.verified === false)) {
        // Get username from the form values
        const username = values.username;
        
        // Show verification message with instructions
        setLoginError("Your email address has not been verified. Please check your inbox for a verification link or request a new one.");
        setVerificationEmail(username); // Use username as email (may be either)
        setShowVerificationMessage(true);
      } else {
        // Set a generic error message
        setLoginError("Incorrect username/email or password. Please try again.");
      }
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setRegisterError(null); // Clear previous errors
    try {
      const { confirmPassword, ...userData } = values;
      // TypeScript doesn't know the API will return this kind of response
      const response = await registerMutation.mutateAsync(userData) as any;
      
      // Check if verification is needed
      if (response && response.needsVerification) {
        // Show verification instructions
        success(
          "Registration successful!", 
          "Please check your email to verify your account. A verification link has been sent to your email address."
        );
        // Create a verification pending UI state
        setVerificationEmail(userData.email);
        setShowVerificationMessage(true);
        // Stay on the login page, but switch to login tab
        setActiveTab("login");
      } else {
        // Legacy behavior (if verification is not required)
        success("Registration successful!", "Your account has been created.");
        navigate("/");
      }
    } catch (err: any) {
      // Set an inline error message
      if (err.message?.includes("Username already exists")) {
        setRegisterError("This username is already taken. Please try another one.");
      } else if (err.message?.includes("Email already exists")) {
        setRegisterError("An account with this email already exists. Try logging in instead.");
      } else {
        setRegisterError("Could not create your account. Please check your information and try again.");
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f5f5f5]'}`}>
      <div className="container mx-auto py-6 md:py-10">
        <div className="min-h-screen grid md:grid-cols-2 gap-0 max-w-6xl mx-auto overflow-hidden rounded-lg shadow-xl">
          {/* Auth Form */}
          <div className={`flex flex-col justify-center items-center p-5 md:p-10 ${theme === 'dark' ? 'bg-[#111111]' : 'bg-[#f9f9f9]'}`}>
            <div className="w-full max-w-md">
              {/* Top tabs */}
              <div className={`flex w-full mb-6 rounded-md overflow-hidden ${theme === 'dark' ? '' : 'border border-gray-200'}`}>
                <button 
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'login' 
                      ? theme === 'dark' 
                        ? 'bg-[#232323] border-b-2 border-[#ff6600]' 
                        : 'bg-white border-b-2 border-[#ff6600]' 
                      : theme === 'dark' 
                        ? 'bg-[#1a1a1a]' 
                        : 'bg-[#f0f0f0]'
                  } ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'register' 
                      ? theme === 'dark' 
                        ? 'bg-[#232323] border-b-2 border-[#ff6600]' 
                        : 'bg-white border-b-2 border-[#ff6600]' 
                      : theme === 'dark' 
                        ? 'bg-[#1a1a1a]' 
                        : 'bg-[#f0f0f0]'
                  } ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
                >
                  Register
                </button>
              </div>
              
              {/* Verification Message */}
              {showVerificationMessage && (
                <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200">
                  <h3 className="text-lg font-medium mb-2">Verify Your Email</h3>
                  <p className="text-sm mb-2">
                    We've sent a verification link to <strong>{verificationEmail}</strong>.
                  </p>
                  <p className="text-sm">
                    Please check your inbox and click the link to activate your account. 
                    You won't be able to login until your email is verified.
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setShowVerificationMessage(false)}
                      className="text-xs underline text-blue-600 dark:text-blue-400"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              
              {/* Login Form */}
              {activeTab === 'login' && (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200 auth-card-light'}`}>
                  <div className="mb-7">
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Welcome Back
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Login to your LingoMitra account
                    </p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Username or Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username or email"
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
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <div className="flex justify-between items-center mb-1">
                              <FormLabel className="font-medium">Password</FormLabel>
                              <a 
                                href="/forgot-password"
                                className="text-xs text-[#ff6600] hover:underline"
                              >
                                Forgot Password?
                              </a>
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
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
                      {loginError && (
                        <div className="p-3 mb-3 rounded-md text-white bg-red-600 dark:bg-red-700 text-sm">
                          <p>{loginError}</p>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white rounded-md py-2 mt-2 ${loginMutation.isPending ? 'opacity-70' : ''}`}
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setActiveTab("register")}
                        className={`text-[#ff6600] hover:underline font-medium`}
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Register Form */}
              {activeTab === 'register' && (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200 auth-card-light'}`}>
                  <div className="mb-7">
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Create Account
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Register for a new LingoMitra account
                    </p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username"
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
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
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
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
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
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                            <FormLabel className="mb-1 font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
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
                      {registerError && (
                        <div className="p-3 mb-3 rounded-md text-white bg-red-600 dark:bg-red-700 text-sm">
                          <p>{registerError}</p>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white rounded-md py-2 mt-2 ${registerMutation.isPending ? 'opacity-70' : ''}`}
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Registering..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Already have an account?{' '}
                      <button 
                        onClick={() => setActiveTab("login")}
                        className={`text-[#ff6600] hover:underline font-medium`}
                      >
                        Login
                      </button>
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
                Your personal language learning companion with AI assistance.
              </p>
              <div className="space-y-7 mt-10 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`feature-bullet ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`feature-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Personalized AI language tutor</strong> available 24/7
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`feature-bullet ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`feature-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Interactive lessons</strong> in multiple languages
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`feature-bullet ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`feature-text ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    <strong className="font-bold text-[#ff6600]">Track your progress</strong> and master new languages faster
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