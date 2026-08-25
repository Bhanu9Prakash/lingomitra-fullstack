import { ReactNode, useEffect } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import NetworkStatus from "./NetworkStatus";
import InstallPrompt from "./InstallPrompt";
import { Link, useLocation } from "wouter";
import { BookOpen, House, MessageCircle, UserRound } from "lucide-react";
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

  useEffect(() => {
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-visual-height", `${Math.round(height)}px`);
      document.documentElement.dataset.keyboardOpen = String(height < window.innerHeight - 120);
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);
  
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
      <div id="app-wrapper" className={`app-wrapper w-full overflow-x-hidden ${isUserLoggedIn && !isLessonPage ? "pb-20 md:pb-0" : ""}`}>
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

      {isUserLoggedIn && !isLessonPage && !isAuthPage && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-200/80 bg-[#fffdf8]/95 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(87,45,20,.08)] backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-950/95" aria-label="Primary navigation">
          <div className="mx-auto grid max-w-md grid-cols-4">
            {[
              { href: "/dashboard", label: "Home", icon: House },
              { href: "/languages", label: "Learn", icon: BookOpen },
              { href: "/conversation", label: "Practice", icon: MessageCircle },
              { href: "/profile", label: "Account", icon: UserRound },
            ].map(({ href, label, icon: Icon }) => {
              const active = location === href || (href === "/conversation" && location.startsWith("/conversation"));
              return (
                <Link key={href} href={href} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-extrabold ${active ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300" : "text-stone-600 dark:text-stone-300"}`} aria-current={active ? "page" : undefined}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      
      {/* Portal container for dropdowns - positioned outside the main layout flow */}
      <div id="portal-container" className="portal-container"></div>
    </div>
  );
}