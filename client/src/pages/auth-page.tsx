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
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";

// Extend the user schema with client-side validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
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
  // Check for tab parameter in URL
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      return tabParam === 'register' ? 'register' : 'login';
    }
    return 'login';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [_, navigate] = useLocation();

  // Set the active tab based on URL parameter
  useEffect(() => {
    const tabFromUrl = getInitialTab();
    setActiveTab(tabFromUrl);
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

  // Submit handlers
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await loginMutation.mutateAsync(values);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const { confirmPassword, ...userData } = values;
      await registerMutation.mutateAsync(userData);
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      // Error handling is done in the mutation
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
              
              {/* Login Form */}
              {activeTab === 'login' && (
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200 shadow-lg'}`}>
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
                            <FormLabel className="mb-1 font-medium">Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                            <FormLabel className="mb-1 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                <div className={`p-7 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a] border border-[#222222]' : 'bg-white border border-gray-200 shadow-lg'}`}>
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
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                                className={`px-3 py-2 rounded-md w-full text-sm ${
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
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} text-base font-medium`}>
                    <strong className="font-bold text-[#ff6600]">Personalized AI language tutor</strong> available 24/7
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} text-base font-medium`}>
                    <strong className="font-bold text-[#ff6600]">Interactive lessons</strong> in multiple languages
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-[#ff6600]'}`}></div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} text-base font-medium`}>
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