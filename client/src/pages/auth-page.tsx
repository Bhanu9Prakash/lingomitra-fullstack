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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1a1a1a] text-[#f0f0f0]' : 'bg-white text-[#333333]'}`}>
      <div className="container mx-auto">
        <div className="min-h-screen grid md:grid-cols-2 gap-0 max-w-6xl mx-auto shadow-xl overflow-hidden rounded-lg">
          {/* Auth Form */}
          <div className={`flex flex-col justify-center items-center p-4 md:p-8 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
            <div className="w-full max-w-md space-y-6">
              <div className="flex justify-center mb-8">
                <MascotLogo className="h-16 w-16" />
              </div>
              
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className={`grid grid-cols-2 w-full mb-6 ${theme === 'dark' ? 'bg-[#333333]' : ''}`}>
                  <TabsTrigger value="login" className={theme === 'dark' ? 'data-[state=active]:bg-[#2a2a2a]' : ''}>Login</TabsTrigger>
                  <TabsTrigger value="register" className={theme === 'dark' ? 'data-[state=active]:bg-[#2a2a2a]' : ''}>Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card className={theme === 'dark' ? 'border-[#444444] bg-[#2a2a2a]' : 'border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Welcome Back</CardTitle>
                      <CardDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                        Login to your LingoMitra account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your username"
                                    {...field}
                                    className={theme === 'dark' ? 'bg-[#333333] border-[#444444] text-white' : ''}
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                    className={theme === 'dark' ? 'bg-[#333333] border-[#444444] text-white' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white ${loginMutation.isPending ? 'opacity-70' : ''}`}
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("register")}
                        className={theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-[#333333]' : ''}
                      >
                        Don't have an account? Register
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card className={theme === 'dark' ? 'border-[#444444] bg-[#2a2a2a]' : 'border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Create Account</CardTitle>
                      <CardDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                        Register for a new LingoMitra account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Choose a username"
                                    {...field}
                                    className={theme === 'dark' ? 'bg-[#333333] border-[#444444] text-white' : ''}
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                    className={theme === 'dark' ? 'bg-[#333333] border-[#444444] text-white' : ''}
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                    className={theme === 'dark' ? 'bg-[#333333] border-[#444444] text-white' : ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            className={`w-full bg-[#ff6600] hover:bg-[#cc5200] text-white ${registerMutation.isPending ? 'opacity-70' : ''}`}
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Registering..." : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("login")}
                        className={theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-[#333333]' : ''}
                      >
                        Already have an account? Login
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 bg-[#ff6600] text-white">
            <div className="max-w-md space-y-6">
              <div className="flex justify-center mb-4">
                <MascotLogo className="h-24 w-24" />
              </div>
              <h1 className="text-4xl font-bold text-center">LingoMitra</h1>
              <p className="text-xl text-center">
                Your personal language learning companion with AI assistance.
              </p>
              <div className="space-y-4 mt-8">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 mt-0.5 rounded-full bg-white text-[#ff6600] flex items-center justify-center">
                    ✓
                  </div>
                  <p>Personalized AI language tutor available 24/7</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 mt-0.5 rounded-full bg-white text-[#ff6600] flex items-center justify-center">
                    ✓
                  </div>
                  <p>Interactive lessons in multiple languages</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 mt-0.5 rounded-full bg-white text-[#ff6600] flex items-center justify-center">
                    ✓
                  </div>
                  <p>Track your progress and master new languages faster</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}