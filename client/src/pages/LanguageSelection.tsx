import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";
import { useTheme } from "@/components/ThemeProvider";
import MascotLogo from "@/components/MascotLogo";
import LanguageGrid from "@/components/LanguageGrid";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function LanguageSelection() {
  const { theme, toggleTheme } = useTheme();

  const { data: languages, isLoading } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <MascotLogo />
            
            <div className="flex items-center gap-4">
              <button 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <LanguageGrid languages={languages || []} isLoading={isLoading} />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
