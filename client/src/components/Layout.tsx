import { ReactNode } from "react";
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

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const [location] = useLocation();
  
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
  });
  
  // Find the selected language
  const selectedLanguage = languageCode 
    ? languages.find(lang => lang.code === languageCode) || null 
    : null;
  
  const isLanguageSelectionPage = location === "/languages";
  const isHomePage = location === "/";
  const isAuthPage = location === "/auth" || location.startsWith("/auth?");
  
  // Check if we're on a lesson page to hide the footer
  const isLessonPage = location.includes("/lesson/");

  return (
    <div className={`${theme === 'dark' ? 'dark-theme dark' : ''}`}>
      <header>
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
      
      <main>
        {children}
      </main>
      
      {/* Only show footer on non-lesson pages */}
      {!isLessonPage && <Footer />}
      <ScrollToTop />
      <NetworkStatus />
      <InstallPrompt />
    </div>
  );
}