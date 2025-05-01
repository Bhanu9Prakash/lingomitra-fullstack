import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  
  // Get the default tab from URL query parameter (e.g., /auth?tab=register)
  const defaultTab = location.includes("?tab=register") ? "register" : "login";

  // If user is already logged in, redirect to home page
  if (user) {
    navigate("/");
    return null;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    
    // Clear password error when user types in either password field
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    // Validate password length
    if (registerForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password
    });
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Auth form section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to LingoMitra</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in or create an account to continue your language learning journey.
          </p>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLoginSubmit}>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username" 
                        value={loginForm.username} 
                        onChange={handleLoginChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        value={loginForm.password} 
                        onChange={handleLoginChange} 
                        required 
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegisterSubmit}>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Join LingoMitra to track your progress and save your learning sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        name="username" 
                        value={registerForm.username} 
                        onChange={handleRegisterChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        name="password" 
                        type="password" 
                        value={registerForm.password} 
                        onChange={handleRegisterChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        name="confirmPassword" 
                        type="password" 
                        value={registerForm.confirmPassword} 
                        onChange={handleRegisterChange} 
                        required 
                      />
                      {passwordError && (
                        <p className="text-sm text-destructive mt-1">{passwordError}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Hero section explaining features */}
        <div className="bg-muted p-8 rounded-lg hidden md:block">
          <h2 className="text-2xl font-bold mb-4">Enhance Your Learning with AI</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-primary text-white p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Personalized Learning</h3>
                <p className="text-muted-foreground">Our AI tutor adapts to your learning style and pace</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary text-white p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Progress Tracking</h3>
                <p className="text-muted-foreground">Monitor your vocabulary growth and learning challenges</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary text-white p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Continuous Sessions</h3>
                <p className="text-muted-foreground">Resume your learning from where you left off</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary text-white p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Interactive Practice</h3>
                <p className="text-muted-foreground">Practice real conversations with instant feedback</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}