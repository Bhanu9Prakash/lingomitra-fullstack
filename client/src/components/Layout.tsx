import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";
import MascotLogo from "./MascotLogo";
import { useTheme } from "./ThemeProvider";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import NetworkStatus from "./NetworkStatus";
import InstallPrompt from "./InstallPrompt";
import { Link, useLocation } from "wouter";
import { Language } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import LanguageDropdown from "./LanguageDropdown";
import UserMenu from "./UserMenu";
import { getQueryFn } from "@/lib/queryClient";
import { arrivalTime } from '@/lib/learning-api';
import { pathwayForActivity } from '@shared/pathways';
import PrimaryNavigation from './PrimaryNavigation';
import SwitchButton from './kokonut/switch-button';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    arrivalTime();
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
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  let languageCode: string | null = null;
  const pathParts = location.split("/").filter(Boolean);
  if (pathParts[0]?.length === 2) languageCode = pathParts[0];
  if (location.startsWith("/language/")) languageCode = location.split("/language/")[1].split("/")[0];
  if (pathParts[0] === 'try') languageCode = pathParts[1];
  if (pathParts[0] === 'learn') languageCode = pathwayForActivity(pathParts[1])?.code || null;
  if (['dashboard','practice','words'].includes(pathParts[0])) languageCode = pathParts[1] || user?.preferences?.selectedTarget || null;

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  const selectedLanguage = languageCode ? languages.find((language) => language.code === languageCode) || null : null;
  const isHomePage = location === "/";
  const isAuthPage = location === "/auth" || location.startsWith("/auth?");

  const isLessonPage = location.includes("/lesson/") || location.startsWith('/learn/') || location.startsWith('/try/');
  const isUserLoggedIn = Boolean(user);
  const homeStartHref = isUserLoggedIn ? "/dashboard" : "/languages";

  return (
    <div className={theme === "dark" ? "dark-theme dark" : ""}>
      <div id="app-wrapper" className={`app-wrapper w-full overflow-x-hidden ${isLessonPage ? 'has-lesson' : ''} ${isUserLoggedIn && !isLessonPage ? "pb-20 md:pb-0" : ""}`}>
        <a className="skip-link" href="#main-content">Skip to learning content</a>
        <header className="site-header fixed inset-x-0 top-0 z-50 w-full">
          <div className="header-shell">
            <Link href={isUserLoggedIn ? "/dashboard" : "/"} className="logo" aria-label="LingoMitra home">
              <MascotLogo className="mascot-logo" linked={false} />
              <span className="brand-name">LingoMitra</span>
            </Link>

            {isUserLoggedIn && !isHomePage && !isLessonPage && !isAuthPage && <PrimaryNavigation />}

            <div className="header-controls">
              {isHomePage && (
                <nav className="landing-header-nav" aria-label="Landing page navigation">
                  <a href="#how-it-works" className="header-nav-link">How it works</a>
                  <Link href="/about" className="header-nav-link">About</Link>
                  {!isUserLoggedIn && <Link href="/auth" className="header-sign-in">Sign in</Link>}
                  <Link href={homeStartHref} className="header-start-link">
                    {isUserLoggedIn ? "Continue learning" : "Start learning"}
                  </Link>
                </nav>
              )}
              {!isHomePage && !isAuthPage && <LanguageDropdown selectedLanguage={selectedLanguage} languages={languages} publicEntry={!isUserLoggedIn} />}
              <SwitchButton className="header-theme-toggle" showLabel={false} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} />
              {!isHomePage && !isAuthPage && <UserMenu />}
            </div>
          </div>
        </header>

        <div className="app-header-spacer" aria-hidden="true" />
        <div id="main-content" tabIndex={-1} className={isHomePage ? "app-content app-content-home" : "app-content"}>{children}</div>

        {!isLessonPage && !isUserLoggedIn && <Footer />}
        <ScrollToTop />
        <NetworkStatus />
        <InstallPrompt />
      </div>

      {isUserLoggedIn && !isLessonPage && !isAuthPage && (
        <PrimaryNavigation mobile />
      )}

      <div id="portal-container" className="portal-container" />
    </div>
  );
}
