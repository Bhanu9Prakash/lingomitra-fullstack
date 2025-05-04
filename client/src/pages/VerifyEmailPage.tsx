import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const VerifyEmailPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const { theme } = useTheme();
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  // If the user is already verified and logged in, redirect to home
  useEffect(() => {
    if (user && user.emailVerified) {
      navigate("/");
    }
  }, [user, navigate]);

  // Get token from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    } else {
      // No token in URL, so we're just showing the instruction page
      setStatus("loading");
      setMessage("");
    }
  }, []);

  // Function to verify email with the token
  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus("loading");
      
      const response = await fetch(`/api/verify-email?token=${verificationToken}`);
      
      if (response.ok) {
        setStatus("success");
        setMessage("Your email has been verified successfully. You can now login to your account.");
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/auth?verified=true");
        }, 3000);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.message || "An error occurred during email verification.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during email verification. Please try again later.");
    }
  };

  // Function to handle resend verification email
  const handleResendVerification = async () => {
    try {
      setStatus("loading");
      
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user?.email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("success");
        setMessage("Verification email has been resent. Please check your inbox.");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
    }
  };

  // Render loading state
  if (token && status === "loading") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#ff6600]" />
          <h1 className="mt-6 text-2xl font-bold">Verifying Your Email</h1>
          <p className="mt-2">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  // Render success state
  if (token && status === "success") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
        <div className={`max-w-md w-full mx-auto rounded-lg shadow-lg p-8 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-2xl font-bold text-center">Email Verified</h1>
          <p className="mt-2 text-center">{message}</p>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Redirecting you to the login page...
          </p>
          <div className="mt-6">
            <Button 
              className="w-full bg-[#ff6600] hover:bg-[#cc5200]"
              onClick={() => navigate("/auth")}
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (token && status === "error") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
        <div className={`max-w-md w-full mx-auto rounded-lg shadow-lg p-8 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-2xl font-bold text-center">Verification Failed</h1>
          <p className="mt-2 text-center">{message}</p>
          <div className="mt-6">
            <Button 
              className="w-full bg-[#ff6600] hover:bg-[#cc5200]"
              onClick={() => navigate("/auth")}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default state: show instructions for unverified users
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
      <div className={`max-w-md w-full mx-auto rounded-lg shadow-lg p-8 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
        <Mail className="mx-auto h-16 w-16 text-[#ff6600]" />
        <h1 className="mt-6 text-2xl font-bold text-center">Verify Your Email</h1>
        
        <p className="mt-4 text-center">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        
        <div className={`mt-6 p-4 rounded-md ${theme === 'dark' ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
          <h3 className="font-medium">Didn't receive the email?</h3>
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Verify that you entered the correct email address</li>
            <li>Try resending the verification email</li>
          </ul>
        </div>
        
        <div className="mt-6 space-y-4">
          <Button 
            className="w-full bg-[#ff6600] hover:bg-[#cc5200]"
            onClick={handleResendVerification}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;