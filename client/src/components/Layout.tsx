import { ReactNode, useEffect } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import NetworkStatus from "./NetworkStatus";
import InstallPrompt from "./InstallPrompt";
import { useLocation } from "wouter";
import { Language } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import LanguageDropdown from "./LanguageDropdown";
import UserMenu from "./UserMenu";
import { getQueryFn } from "@/lib/queryClient";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const [location] = useLocation();
  
  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Extract language code from URL path
  let languageCode = null;
  const pathParts = location.split('/').filter(Boolean); // Split and remove empty strings
  
  if (pathParts.length > 0) {
    // The first part of the path might be the language code
    const possibleCode = pathParts[0];
    // If it's a 2-letter code, it's likely a language code
    if (possibleCode.length === 2) {
      languageCode = possibleCode;
    }
  }
  
  // Handle old format: /language/xx/...
  if (location.startsWith("/language/")) {
    languageCode = location.split("/language/")[1].split("/")[0];
  }
  
  // Fetch all languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  
  // Find the selected language
  const selectedLanguage = languageCode 
    ? languages.find(lang => lang.code === languageCode) || null 
    : null;
  
  const isLanguageSelectionPage = location === "/languages";
  const isHomePage = location === "/";
  const isAuthPage = location === "/auth" || location.startsWith("/auth?");
  
  // Check user authentication status by querying the user API
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn(),
    // Don't retry on failure (401 when not logged in)
    retry: false,
    // Disable error display in UI
    gcTime: 0
  });
  
  // Hide footer on lesson pages and when user is logged in to create an app-like experience
  const isLessonPage = location.includes("/lesson/");
  const isUserLoggedIn = !!user;

  return (
    <div className={`${theme === 'dark' ? 'dark-theme dark' : ''}`}>
      <div id="app-wrapper" className="app-wrapper overflow-x-hidden w-full">
        <header className="fixed top-0 left-0 right-0 w-full z-50 bg-background shadow-sm">
          <div className="container">
            <div className="logo">
              <MascotLogo className="mascot-logo" />
              <h1>LingoMitra</h1>
            </div>
            
            <div className="header-controls">
              {/* Shows flag + name dropdown in the header - hide on homepage and auth pages */}
              {!isHomePage && !isAuthPage && (
                <LanguageDropdown
                  selectedLanguage={selectedLanguage}
                  languages={languages}
                />
              )}
              
              {/* User menu dropdown with theme toggle - hide on homepage and auth pages */}
              {!isHomePage && !isAuthPage && <UserMenu />}
            </div>
          </div>
        </header>
        
        {/* Add a spacer to account for the fixed header */}
        <div className="h-16"></div>
        
        <main className="mt-6">
          {children}
        </main>
        
        {/* Only show footer when user is not logged in and not on lesson page */}
        {!isLessonPage && !isUserLoggedIn && <Footer />}
        <ScrollToTop />
        <NetworkStatus />
        <InstallPrompt />
      </div>
      
      {/* Portal container for dropdowns - positioned outside the main layout flow */}
      <div id="portal-container" className="portal-container"></div>
    </div>
  );
}