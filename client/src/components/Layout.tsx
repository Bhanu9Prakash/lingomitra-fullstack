import { ReactNode } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { useLocation } from "wouter";
import { Language } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import LanguageSelector from "./LanguageSelector";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  
  // Get the language code from the location if we're on a language page
  const languageCode = location.startsWith("/language/") 
    ? location.split("/language/")[1]
    : null;
  
  // Fetch all languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  // Find the selected language
  const selectedLanguage = languageCode 
    ? languages.find(lang => lang.code === languageCode) 
    : null;
  
  const isLanguageSelectionPage = location === "/languages";
  const isHomePage = location === "/";

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <header>
        <div className="container">
          <div className="logo">
            <MascotLogo className="mascot-logo" />
            <h1>LingoMitra</h1>
          </div>
          
          <div className="header-controls">
            {/* Always show the language selector, even on home page */}
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              languages={languages}
            />
            
            <div className="theme-container">
              <button 
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <i className="fas fa-sun"></i>
                ) : (
                  <i className="fas fa-moon"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}