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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-white'}`}>
      <div className="container mx-auto py-10">
        <div className="min-h-screen grid md:grid-cols-2 gap-0 max-w-6xl mx-auto">
          {/* Auth Form */}
          <div className={`flex flex-col justify-center items-center p-4 md:p-8 ${theme === 'dark' ? 'bg-[#111111]' : 'bg-white'}`}>
            <div className="w-full max-w-md">
              {/* Top tabs */}
              <div className="flex w-full mb-6 rounded-md overflow-hidden">
                <button 
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 px-4 text-center transition-colors ${
                    activeTab === 'login' 
                      ? theme === 'dark' ? 'bg-[#232323]' : 'bg-gray-100' 
                      : theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
                  } ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 px-4 text-center transition-colors ${
                    activeTab === 'register' 
                      ? theme === 'dark' ? 'bg-[#232323]' : 'bg-gray-100' 
                      : theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
                  } ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                >
                  Register
                </button>
              </div>
              
              {/* Login Form */}
              {activeTab === 'login' && (
                <div className={`p-6 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-200'}`}>
                  <div className="mb-6">
                    <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Welcome Back
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : ''}>
                            <FormLabel className="mb-1">Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                                className={`${theme === 'dark' ? 'bg-[#232323] border-[#333333]' : 'bg-white border-gray-300'} px-3 py-2 rounded-md w-full text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
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
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : ''}>
                            <FormLabel className="mb-1">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className={`${theme === 'dark' ? 'bg-[#232323] border-[#333333]' : 'bg-white border-gray-300'} px-3 py-2 rounded-md w-full text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
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
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                <div className={`p-6 rounded-md ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-200'}`}>
                  <div className="mb-6">
                    <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Create Account
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : ''}>
                            <FormLabel className="mb-1">Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username"
                                {...field}
                                className={`${theme === 'dark' ? 'bg-[#232323] border-[#333333]' : 'bg-white border-gray-300'} px-3 py-2 rounded-md w-full text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
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
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : ''}>
                            <FormLabel className="mb-1">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                className={`${theme === 'dark' ? 'bg-[#232323] border-[#333333]' : 'bg-white border-gray-300'} px-3 py-2 rounded-md w-full text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
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
                          <FormItem className={theme === 'dark' ? 'text-gray-200' : ''}>
                            <FormLabel className="mb-1">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                className={`${theme === 'dark' ? 'bg-[#232323] border-[#333333]' : 'bg-white border-gray-300'} px-3 py-2 rounded-md w-full text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
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
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <div className="hidden md:flex flex-col justify-center items-start p-12 text-[#f0f0f0]">
            <div className="max-w-md space-y-5">
              <h1 className="text-4xl font-bold">LingoMitra</h1>
              <p className="text-xl">
                Your personal language learning companion with AI assistance.
              </p>
              <div className="space-y-6 mt-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                  </div>
                  <p className="text-gray-300">Personalized AI language tutor available 24/7</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                  </div>
                  <p className="text-gray-300">Interactive lessons in multiple languages</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                  </div>
                  <p className="text-gray-300">Track your progress and master new languages faster</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}