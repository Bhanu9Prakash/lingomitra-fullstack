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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gradient-to-b from-orange-50 to-white'}`}>
      <div className="container mx-auto py-8">
        <div className="min-h-screen flex flex-col md:flex-row max-w-6xl mx-auto">
          
          {/* Left Column: Form Section */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center">
            {activeTab === 'register' ? (
              <div className={`w-full max-w-lg p-8 rounded-xl ${theme === 'dark' ? 'bg-[#1f1f1f] shadow-xl' : 'bg-white shadow-md'}`}>
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Create Account
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Register for a new LingoMitra account
                  </p>
                </div>
                
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              {...field}
                              className={`${theme === 'dark' 
                                ? 'bg-[#2c2c2c] border-[#3f3f3f] text-white focus:border-orange-500 focus:ring-orange-500/20' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500/20'
                              } px-4 py-3 rounded-lg w-full text-base`}
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
                        <FormItem className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              {...field}
                              className={`${theme === 'dark' 
                                ? 'bg-[#2c2c2c] border-[#3f3f3f] text-white focus:border-orange-500 focus:ring-orange-500/20' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500/20'
                              } px-4 py-3 rounded-lg w-full text-base`}
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
                        <FormItem className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                              className={`${theme === 'dark' 
                                ? 'bg-[#2c2c2c] border-[#3f3f3f] text-white focus:border-orange-500 focus:ring-orange-500/20' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500/20'
                              } px-4 py-3 rounded-lg w-full text-base`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className={`w-full bg-[#ff6600] hover:bg-[#ff8533] text-white rounded-lg py-3 text-base font-semibold transition-colors ${registerMutation.isPending ? 'opacity-70' : ''}`}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Register"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 text-center">
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setActiveTab("login")}
                      className="text-[#ff6600] hover:text-[#ff8533] font-medium transition-colors"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className={`w-full max-w-lg p-8 rounded-xl ${theme === 'dark' ? 'bg-[#1f1f1f] shadow-xl' : 'bg-white shadow-md'}`}>
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Welcome Back
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Login to your LingoMitra account
                  </p>
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
                        <FormItem className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              {...field}
                              className={`${theme === 'dark' 
                                ? 'bg-[#2c2c2c] border-[#3f3f3f] text-white focus:border-orange-500 focus:ring-orange-500/20' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500/20'
                              } px-4 py-3 rounded-lg w-full text-base`}
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
                        <FormItem className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                              className={`${theme === 'dark' 
                                ? 'bg-[#2c2c2c] border-[#3f3f3f] text-white focus:border-orange-500 focus:ring-orange-500/20' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-orange-500 focus:ring-orange-500/20'
                              } px-4 py-3 rounded-lg w-full text-base`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className={`w-full bg-[#ff6600] hover:bg-[#ff8533] text-white rounded-lg py-3 text-base font-semibold transition-colors ${loginMutation.isPending ? 'opacity-70' : ''}`}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 text-center">
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setActiveTab("register")}
                      className="text-[#ff6600] hover:text-[#ff8533] font-medium transition-colors"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Branding/Info Section */}
          <div className={`w-full md:w-1/2 hidden md:flex items-center justify-center ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gradient-to-br from-orange-100 to-orange-50'}`}>
            <div className="max-w-md px-8">
              <div className="text-center mb-10">
                <div className="flex flex-col items-center">
                  <MascotLogo className="h-20 w-20 mb-5" />
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-[#ff6600]">LingoMitra</span>
                  </h1>
                </div>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Your personal language learning companion with AI assistance.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-[#ff6600]' : 'bg-[#ff6600]'} flex items-center justify-center text-white text-xs font-bold`}>
                      1
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    Personalized AI language tutor available 24/7
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-[#ff6600]' : 'bg-[#ff6600]'} flex items-center justify-center text-white text-xs font-bold`}>
                      2
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    Interactive lessons in multiple languages
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-5 w-5 rounded-full ${theme === 'dark' ? 'bg-[#ff6600]' : 'bg-[#ff6600]'} flex items-center justify-center text-white text-xs font-bold`}>
                      3
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                    Track your progress and master new languages faster
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