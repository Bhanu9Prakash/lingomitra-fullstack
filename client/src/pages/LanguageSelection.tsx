import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";
import LanguageGrid from "@/components/LanguageGrid";
import { getQueryFn } from "@/lib/queryClient";
import { useEffect } from "react";

export default function LanguageSelection() {
  const { data: languages, isLoading, error } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  
  // Log any errors for debugging
  if (error) {
    console.error("Error fetching languages:", error);
  }
  
  // Check for pending service worker updates
  // This is a safe place to show the update notification after verification
  useEffect(() => {
    // We only want to check after the component has fully mounted and is stable
    const checkForPendingUpdates = () => {
      const pendingUpdate = sessionStorage.getItem('pendingServiceWorkerUpdate');
      
      // If we have a pending update and user has been here for a few seconds
      if (pendingUpdate === 'true') {
        // Clear the pending update flag
        sessionStorage.removeItem('pendingServiceWorkerUpdate');
        
        // Show update notification after a short delay
        setTimeout(() => {
          // Only show the notification if we haven't shown one recently
          const lastUpdateTime = sessionStorage.getItem('lastUpdatePrompt');
          const now = Date.now();
          
          if (!lastUpdateTime || (now - parseInt(lastUpdateTime)) > 5 * 60 * 1000) {
            sessionStorage.setItem('lastUpdatePrompt', now.toString());
            
            // Show the update notification
            if (confirm('New app version available. Reload now to update?')) {
              window.location.reload();
            }
          }
        }, 5000); // Wait 5 seconds after page load
      }
    };
    
    // Set a timeout to check for updates after the component is stable
    const timer = setTimeout(checkForPendingUpdates, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <section className="language-grid-section">
      <div className="container">
        <h2>Choose Your Language Adventure</h2>
        <div className="section-intro">
          <p>
            Select a language to start your learning journey. Each language offers unique lessons
            designed to help you master new skills naturally.
          </p>
        </div>
        
        <LanguageGrid languages={languages || []} isLoading={isLoading} />
      </div>
    </section>
  );
}
