import { ReactNode } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { Link, useLocation } from "wouter";
import { Language } from "@shared/schema";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Get the language code from the location if we're on a language page
  const languageCode = location.startsWith("/language/") 
    ? location.split("/language/")[1]
    : null;
  
  // Fetch all languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    enabled: languageCode !== null,
  });
  
  // Find the selected language
  const selectedLanguage = languages.find(lang => lang.code === languageCode);
  
  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };
  
  const isLanguageSelectionPage = location === "/languages";
  const isHomePage = location === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b border-border shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <MascotLogo />
          
          <div className="flex items-center gap-4">
            {selectedLanguage && !isLanguageSelectionPage && !isHomePage && (
              <div className="relative">
                <div 
                  className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg cursor-pointer"
                  onClick={toggleLanguageDropdown}
                >
                  <img 
                    src={`/flags/${selectedLanguage.flagCode}.svg`} 
                    alt={`${selectedLanguage.name} Flag`}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">{selectedLanguage.name}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}></i>
                </div>
                
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-background dark:bg-gray-800 border border-border rounded-lg shadow-lg overflow-hidden w-48 z-50">
                    <div 
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border flex items-center gap-2"
                      onClick={() => {
                        window.location.href = "/languages";
                        setShowLanguageDropdown(false);
                      }}
                    >
                      <i className="fas fa-th-large"></i>
                      <span>All Languages</span>
                    </div>
                    {languages.map(lang => (
                      <Link 
                        key={lang.code} 
                        href={`/language/${lang.code}`}
                        onClick={() => setShowLanguageDropdown(false)}
                      >
                        <div className="p-3 hover:bg-muted cursor-pointer flex items-center gap-2">
                          <img 
                            src={`/flags/${lang.flagCode}.svg`}
                            alt={`${lang.name} Flag`}
                            className="w-5 h-5"
                          />
                          <span>{lang.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-gray-600"></i>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}