import { ReactNode, useState, useEffect } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { useLocation } from "wouter";
import { Language } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import LanguageDropdown from "./LanguageDropdown";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
  // Handle scroll events to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.scrollY;
      
      // Set scrolled state (used for styling)
      setScrolled(currentScrollTop > 50);
      
      // Determine scroll direction
      if (currentScrollTop > lastScrollTop && currentScrollTop > 70) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      setLastScrollTop(currentScrollTop);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);
  
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
      <header className={`${scrolled ? 'scrolled' : ''} ${scrollDirection === 'down' ? 'header-hidden' : ''}`}>
        <div className="container">
          <div className="logo">
            <MascotLogo className="mascot-logo" />
            <h1>LingoMitra</h1>
          </div>
          
          <div className="header-controls">
            {!isHomePage && !isLanguageSelectionPage && selectedLanguage && (
              <LanguageDropdown
                selectedLanguage={selectedLanguage}
                languages={languages}
              />
            )}
            
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