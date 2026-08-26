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

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  const selectedLanguage = languageCode ? languages.find((language) => language.code === languageCode) || null : null;
  const isHomePage = location === "/";
  const isAuthPage = location === "/auth" || location.startsWith("/auth?");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    gcTime: 0,
  });

  const isLessonPage = location.includes("/lesson/");
  const isUserLoggedIn = Boolean(user);
  const homeStartHref = isUserLoggedIn ? "/languages" : "/auth?tab=register&returnTo=%2Flanguages";

  return (
    <div className={theme === "dark" ? "dark-theme dark" : ""}>
      <div id="app-wrapper" className={`app-wrapper w-full overflow-x-hidden ${isUserLoggedIn && !isLessonPage ? "pb-20 md:pb-0" : ""}`}>
        <header className="site-header fixed inset-x-0 top-0 z-50 w-full">
          <div className="header-shell">
            <Link href={isUserLoggedIn ? "/dashboard" : "/"} className="logo" aria-label="LingoMitra home">
              <MascotLogo className="mascot-logo" linked={false} />
              <h1>LingoMitra</h1>
            </Link>

            <div className="header-controls">
              {isHomePage && (
                <nav className="landing-header-nav" aria-label="Landing page navigation">
                  <a href="#how-it-works" className="header-nav-link">Method</a>
                  <Link href="/about" className="header-nav-link">About</Link>
                  {!isUserLoggedIn && <Link href="/auth" className="header-sign-in">Sign in</Link>}
                  <Link href={homeStartHref} className="header-start-link">
                    {isUserLoggedIn ? "Continue learning" : "Start learning"}
                  </Link>
                </nav>
              )}
              {!isHomePage && !isAuthPage && <LanguageDropdown selectedLanguage={selectedLanguage} languages={languages} />}
              {!isHomePage && !isAuthPage && <UserMenu />}
            </div>
          </div>
        </header>

        <div className="app-header-spacer" aria-hidden="true" />
        <div className={isHomePage ? "app-content app-content-home" : "app-content"}>{children}</div>

        {!isLessonPage && !isUserLoggedIn && <Footer />}
        <ScrollToTop />
        <NetworkStatus />
        <InstallPrompt />
      </div>

      {isUserLoggedIn && !isLessonPage && !isAuthPage && (
        <nav className="mobile-tabbar" aria-label="Primary navigation">
          <div className="mobile-tabbar-inner">
            {[
              { href: "/dashboard", label: "Today", icon: House },
              { href: "/languages", label: "Learn", icon: BookOpen },
              { href: "/conversation", label: "Talk", icon: MessageCircle },
              { href: "/profile", label: "Profile", icon: UserRound },
            ].map(({ href, label, icon: Icon }) => {
              const active = location === href || (href === "/conversation" && location.startsWith("/conversation"));
              return (
                <Link key={href} href={href} className={`mobile-tab ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <div id="portal-container" className="portal-container" />
    </div>
  );
}
