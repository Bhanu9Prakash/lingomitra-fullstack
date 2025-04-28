import { ReactNode } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <header>
        <div className="container">
          <div className="logo">
            <MascotLogo className="mascot-logo" />
            <h1>LingoMitra</h1>
          </div>
          
          <div className="header-controls">
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