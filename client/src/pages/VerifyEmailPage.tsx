import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL query parameters
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get("token");

        if (!token) {
          setError("Verification token is missing");
          setVerifying(false);
          return;
        }

        // Call the verification API
        const response = await fetch(`/api/verify-email?token=${token}`);
        
        if (response.ok) {
          setSuccess(true);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Email verification failed");
        }
      } catch (error) {
        setError("An error occurred during verification");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, []);

  const goToLogin = () => {
    setLocation("/auth");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verifying your LingoMitra account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {verifying ? (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p>Verifying your email address...</p>
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Successful!</h3>
              <p className="text-center">
                Your email has been verified. You can now login to your account.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
              <p className="text-center text-red-500">{error}</p>
              <p className="text-center mt-2">
                There was a problem verifying your email. The verification link may have expired or is invalid.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="w-full" 
            onClick={goToLogin}
            disabled={verifying}
          >
            {success ? "Go to Login" : "Try Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}