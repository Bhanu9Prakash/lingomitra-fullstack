import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

const VerifyEmailPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const { theme } = useTheme();
  const [_, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  // If the user is already verified and logged in, redirect to home
  useEffect(() => {
    if (user && user.emailVerified) {
      navigate("/");
    }
  }, [user, navigate]);

  // Unregister service worker to prevent updates during verification
  useEffect(() => {
    // Mark that we're in the verification process to prevent SW updates
    sessionStorage.setItem('inVerificationProcess', 'true');
    
    // Explicitly unregister the service worker to prevent any interference
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('ServiceWorker unregistered for verification process');
          });
        });
      });
    }
    
    return () => {
      // Clean up when component unmounts
      sessionStorage.removeItem('inVerificationProcess');
      
      // Re-register service worker when leaving the page
      // It will register again on the next page load
    };
  }, []);

  // Get token or verified flag from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const verifiedParam = searchParams.get("verified");
    const registrationParam = searchParams.get("registration");
    
    // If this is a fresh registration, show verification instructions, not success
    const isNewRegistration = registrationParam === "true";
    
    if (tokenParam) {
      setToken(tokenParam);
      
      // Store verification token in sessionStorage before verification
      // This ensures we can resume verification process if page reloads
      sessionStorage.setItem('pendingVerificationToken', tokenParam);
      
      verifyEmail(tokenParam);
      
      // Clear the token from URL after processing
      // This prevents re-verification attempts on page refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.toString());
    } else if (verifiedParam === "true" && !isNewRegistration) {
      // If redirected back with verified=true and not a new registration, show success and redirect
      setToken("verified");
      setStatus("success");
      setMessage("Your email has been verified successfully!");
      
      // Store verification success in sessionStorage
      sessionStorage.setItem('emailJustVerified', 'true');
      
      // Try to check if we're logged in
      fetch("/api/user")
        .then(response => {
          if (response.ok) {
            // We have a valid session, update the user information
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            
            // Redirect to languages page after 2 seconds
            setTimeout(() => {
              navigate("/languages");
            }, 2000);
          } else {
            // No valid session, redirect to login
            setTimeout(() => {
              navigate("/auth?verified=true");
            }, 2000);
          }
        })
        .catch(() => {
          // On error, redirect to login
          setTimeout(() => {
            navigate("/auth?verified=true");
          }, 2000);
        });
    } else if (isNewRegistration) {
      // If this is a new registration, explicitly show the instructions
      console.log('New registration detected, showing verification instructions');
      setStatus("idle");
      
      // Clean up the URL to remove the registration param
      const url = new URL(window.location.href);
      url.searchParams.delete('registration');
      window.history.replaceState({}, document.title, url.toString());
    } else {
      // Check if we have a verification in progress or one that just completed
      const storedToken = sessionStorage.getItem('pendingVerificationToken');
      const justVerifiedSession = sessionStorage.getItem('emailJustVerified');
      const justVerifiedLocal = localStorage.getItem('emailJustVerified');
      const verificationInProgress = localStorage.getItem('verificationInProgress');
      
      // Check for a recently successful verification within the last hour (3600000 ms)
      const verificationTimestamp = parseInt(localStorage.getItem('verificationSuccessTimestamp') || '0');
      const isRecentVerification = (Date.now() - verificationTimestamp) < 3600000;
      
      if (storedToken) {
        // Resume verification process from the stored token
        console.log('Resuming verification from stored token');
        setToken(storedToken);
        verifyEmail(storedToken);
      } else if (justVerifiedSession === 'true' || (justVerifiedLocal === 'true' && isRecentVerification)) {
        // If we just verified but got reloaded, restore the success state
        // This handles cases where service worker caused a reload
        console.log('Restoring verification success state from storage');
        setToken("verified");
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } else if (verificationInProgress === 'true') {
        // If we have a verification in progress but got interrupted
        console.log('Verification was in progress but got interrupted');
        setStatus("error");
        setMessage("Your verification process was interrupted. Please try clicking the link in your email again.");
        localStorage.removeItem('verificationInProgress');
        
        // Check if user is logged in after reload
        if (user) {
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          
          setTimeout(() => {
            navigate("/languages");
            // Clear the verification flag after redirecting
            sessionStorage.removeItem('emailJustVerified');
          }, 2000);
        } else {
          setTimeout(() => {
            navigate("/auth?verified=true");
            // Clear the verification flag after redirecting
            sessionStorage.removeItem('emailJustVerified');
          }, 2000);
        }
      } else if (user && user.emailVerified) {
        // If user is already verified, redirect to home page
        navigate("/");
      } else {
        // No token in URL, so we're just showing the instruction page
        setStatus("idle" as "loading" | "success" | "error" | "idle");
        setMessage("");
      }
    }
  }, [user, navigate]);

  // Function to verify email with the token
  const verifyEmail = async (verificationToken: string) => {
    try {
      console.log('Starting verification with token:', verificationToken);
      setStatus("loading");
      
      // Set verification in progress before making request
      // This ensures we can restore state even if the page refreshes mid-verification
      localStorage.setItem('verificationInProgress', 'true');
      
      // Log the token before making the request
      console.log('Making verification request with token:', verificationToken);
      
      const response = await fetch(`/api/verify-email?token=${verificationToken}`);
      console.log('Verification response status:', response.status);
      
      // Get the response data even in error cases to check the message
      const data = await response.json();
      console.log('Verification response data:', data);
      
      // Handle already verified tokens as a success case
      if (response.ok || (data && data.message && data.message.includes("already verified"))) {
        console.log('Verification successful or email already verified!');
        // Immediately set success state in both component and storage
        setStatus("success");
        setMessage(data.message || "Your email has been verified successfully!");
        
        // Store successful verification in both sessionStorage AND localStorage
        // This helps maintain state across potential page reloads or tab closures
        sessionStorage.setItem('emailJustVerified', 'true');
        localStorage.setItem('emailJustVerified', 'true');
        localStorage.setItem('verificationSuccessTimestamp', Date.now().toString());
        
        // Get user data returned from the verification endpoint
        // This contains username and other info we can use
        const userData = data;
        
        // Store the username to help with login after verification
        if (userData && userData.username) {
          sessionStorage.setItem('verifiedUsername', userData.username);
          localStorage.setItem('verifiedUsername', userData.username);
        }
        
        // Clear the pending token since verification was successful
        sessionStorage.removeItem('pendingVerificationToken');
        localStorage.removeItem('verificationInProgress');
        
        // Try to login the user with their existing session
        try {
          // Check if we have a user session
          const userResponse = await fetch("/api/user");
          if (userResponse.ok) {
            // We have a valid session, update local user data
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            
            // Redirect to languages page - use window.location for a harder redirect
            console.log("Redirecting to languages page...");
            // First try navigate
            navigate("/languages");
            // Also use a direct location change for a guaranteed redirect
            setTimeout(() => {
              window.location.href = "/languages";
            }, 1000);
          } else {
            // No valid session, redirect to login - use window.location for a harder redirect
            console.log("Redirecting to login page...");
            // First try navigate
            navigate("/auth?verified=true");
            // Also use a direct location change for a guaranteed redirect
            setTimeout(() => {
              window.location.href = "/auth?verified=true";
            }, 1000);
          }
        } catch (error) {
          // On error, redirect to login - use window.location for a harder redirect
          console.log("Error occurred, redirecting to login page...");
          // First try navigate
          navigate("/auth?verified=true");
          // Also use a direct location change for a guaranteed redirect
          setTimeout(() => {
            window.location.href = "/auth?verified=true";
          }, 1000);
        }
      } else {
        // We already have data from the response (pulled above)
        setStatus("error");
        setMessage(data.message || "An error occurred during email verification.");
        
        // Clear any stored verification data on error
        sessionStorage.removeItem('pendingVerificationToken');
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during email verification. Please try again later.");
      
      // Clear any stored verification data on error
      sessionStorage.removeItem('pendingVerificationToken');
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
            Redirecting you shortly...
          </p>
          <div className="mt-6">
            <Button 
              className="w-full bg-[#ff6600] hover:bg-[#cc5200]"
              onClick={() => {
                console.log("Manual redirect via button clicked");
                if (user && user.emailVerified) {
                  // Navigate to languages with both methods
                  navigate("/languages");
                  window.location.href = "/languages";
                } else {
                  // Navigate to auth with both methods
                  navigate("/auth");
                  window.location.href = "/auth";
                }
              }}
            >
              {user && user.emailVerified ? "Go to Languages" : "Go to Login"}
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
              onClick={() => {
                console.log("Manual redirect to auth from error state");
                navigate("/auth");
                window.location.href = "/auth";
              }}
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
          {user ? (
            <>
              A verification link has been sent to <strong>{user.email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </>
          ) : (
            "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
          )}
        </p>
        
        <div className={`mt-6 p-4 rounded-md ${theme === 'dark' ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
          <h3 className="font-medium">Next Steps:</h3>
          <ol className="mt-2 text-sm list-decimal pl-5 space-y-1">
            <li>Open your email inbox</li>
            <li>Find the email from LingoMitra</li>
            <li>Click the verification link in the email</li>
            <li>After verification, you'll be able to log in</li>
          </ol>
        </div>
        
        <div className="mt-6">
          <Button 
            variant="outline"
            className="w-full"
            onClick={async () => {
              if (user) {
                // Logout user
                await logoutMutation.mutateAsync();
                // Then redirect to login page
                navigate("/auth");
              } else {
                // If no user, just redirect to login page
                navigate("/auth");
              }
            }}
          >
            {user ? "Log Out" : "Return to Login"}
          </Button>
        </div>
        
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Didn't receive the email? Check your spam folder or try resending it.
          </p>
          <Button 
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleResendVerification}
            disabled={status === "loading" || !user?.email}
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
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;