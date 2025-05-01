import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Hero() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  // Direct new users to the registration page
  const handleGetStarted = () => {
    if (user) {
      navigate("/languages");
    } else {
      // Navigate to auth page with register tab active
      navigate("/auth?tab=register");
      console.log("Navigating to auth page with register tab");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="container px-4 py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
            Language Learning Simplified
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Learn Languages The Smart Way
          </h1>
          <p className="text-lg text-muted-foreground max-w-prose">
            Master new languages naturally through pattern-based lessons. Build your vocabulary and understanding step by step with our intelligent AI tutor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg"
              className="rounded-full font-medium bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleGetStarted}
            >
              {user ? "Start Learning" : "Get Started For Free"}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full font-medium"
            >
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <img 
              src="/mascot.svg" 
              alt="LingoMitra Fox Mascot" 
              className="w-full h-auto"
            />
            <div className="absolute -top-4 -left-4 md:top-0 md:left-5 bg-background rounded-2xl p-4 shadow-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="text-3xl">💬</div>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <div className="absolute bottom-8 right-8 max-w-xs bg-card rounded-xl shadow-lg p-4 border border-border">
          <h3 className="font-semibold mb-1">Install LingoMitra</h3>
          <p className="text-sm text-muted-foreground mb-3">Add LingoMitra to your home screen for quick access to your language lessons, even offline!</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Not Now</Button>
            <Button size="sm">Install</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
