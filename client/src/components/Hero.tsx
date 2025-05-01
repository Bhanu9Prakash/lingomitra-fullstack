import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./ThemeProvider";

export default function Hero() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

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
    <section className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[var(--bg-color)]' : 'bg-white'}`}>
      <div className="container px-4 py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-block rounded-lg bg-[rgba(255,102,0,0.1)] px-3 py-1 text-sm text-[var(--primary-color)] font-semibold">
            Language Learning Simplified
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${theme === 'dark' ? 'text-[var(--text-color)]' : ''}`}>
            Learn Languages The Smart Way
          </h1>
          <p className={`text-lg max-w-prose ${theme === 'dark' ? 'text-[var(--text-light)]' : 'text-muted-foreground'}`}>
            Master new languages naturally through pattern-based lessons. Build your vocabulary and understanding step by step with our intelligent AI tutor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              className="primary-btn rounded-full font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleGetStarted}
            >
              {user ? "Start Learning" : "Get Started For Free"}
            </Button>
            <Button 
              variant={theme === 'dark' ? 'outline' : 'outline'}
              size="lg"
              className={`rounded-full font-medium px-8 py-6 text-lg transition-all duration-200
                ${theme === 'dark' 
                  ? 'text-[var(--text-color)] border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-dark)] hover:text-[var(--primary-color)]' 
                  : 'text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]'
                }`}
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
            <div className={`absolute -top-4 -left-4 md:top-0 md:left-5 ${theme === 'dark' ? 'bg-[var(--bg-light)]' : 'bg-[var(--bg-color)]'} rounded-2xl p-4 shadow-[var(--shadow)]`}>
              <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-[var(--bg-dark)]' : 'bg-[var(--bg-light)]'} rounded-full flex items-center justify-center`}>
                <div className="text-3xl">💬</div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
