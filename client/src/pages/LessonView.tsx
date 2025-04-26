import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Lesson, Language } from "@shared/schema";
import { useTheme } from "@/components/ThemeProvider";
import MascotLogo from "@/components/MascotLogo";
import LanguageDropdown from "@/components/LanguageDropdown";
import LessonHeader from "@/components/LessonHeader";
import LessonContent from "@/components/LessonContent";
import LessonNavigation from "@/components/LessonNavigation";
import LessonSelector from "@/components/LessonSelector";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function LessonView() {
  const { theme, toggleTheme } = useTheme();
  const [_, navigate] = useLocation();
  
  // Get route params
  const [matchLanguage, paramsLanguage] = useRoute("/language/:code");
  const [matchLesson, paramsLesson] = useRoute("/lesson/:id");
  
  // Determine whether we're accessing by language code or specific lesson
  const languageCode = paramsLanguage?.code;
  const specificLessonId = paramsLesson?.id;
  
  // State for lesson modal
  const [isLessonSelectorOpen, setLessonSelectorOpen] = useState(false);
  
  // Fetch all languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  // Fetch language data if we have a language code
  const { data: language } = useQuery<Language>({
    queryKey: [`/api/languages/${languageCode}`],
    enabled: !!languageCode,
  });
  
  // Fetch lessons for the selected language
  const { 
    data: lessons, 
    isLoading: lessonsLoading,
    error: lessonsError
  } = useQuery<Lesson[]>({
    queryKey: [`/api/languages/${languageCode}/lessons`],
    enabled: !!languageCode,
  });
  
  // Fetch specific lesson if we have a lesson ID
  const {
    data: specificLesson,
    isLoading: specificLessonLoading,
    error: specificLessonError
  } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${specificLessonId}`],
    enabled: !!specificLessonId,
  });
  
  // Determine current lesson
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  
  // Set current lesson based on available data
  useEffect(() => {
    if (specificLessonId) {
      setCurrentLessonId(specificLessonId);
    } else if (lessons && lessons.length > 0 && !currentLessonId) {
      // If we have lessons but no current lesson, select the first one
      setCurrentLessonId(lessons[0].lessonId);
    }
  }, [specificLessonId, lessons, currentLessonId]);
  
  // Find current lesson object
  const currentLesson = specificLesson || 
    (lessons && currentLessonId 
      ? lessons.find(l => l.lessonId === currentLessonId) 
      : null);
  
  // Find next and previous lessons
  const currentIndex = lessons?.findIndex(l => l.lessonId === currentLessonId) ?? -1;
  const nextLesson = currentIndex >= 0 && lessons && currentIndex < lessons.length - 1 
    ? lessons[currentIndex + 1] 
    : null;
  const prevLesson = currentIndex > 0 && lessons 
    ? lessons[currentIndex - 1] 
    : null;
  
  // Determine selected language
  const selectedLanguage = language || 
    (currentLesson && languages 
      ? languages.find(l => l.code === currentLesson.languageCode) 
      : null);
  
  // Navigation handlers
  const handleLessonSelect = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };
  
  // Determine loading and error states
  const isLoading = lessonsLoading || specificLessonLoading;
  const error = lessonsError 
    ? "Failed to load lessons" 
    : specificLessonError 
      ? "Failed to load the selected lesson" 
      : "";
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <MascotLogo />
            
            <div className="flex items-center gap-4">
              {/* Language dropdown */}
              {selectedLanguage && languages && (
                <LanguageDropdown 
                  selectedLanguage={selectedLanguage}
                  languages={languages}
                />
              )}
              
              {/* Theme toggle */}
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

      {/* Lesson header */}
      {selectedLanguage && (
        <LessonHeader 
          currentLesson={currentLesson}
          onOpenLessonSelector={() => setLessonSelectorOpen(true)}
        />
      )}

      {/* Main content */}
      <main className="py-8 bg-gray-50 dark:bg-gray-900 flex-grow">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 max-w-4xl mx-auto">
            {/* Lesson content */}
            <LessonContent 
              lesson={currentLesson!}
              isLoading={isLoading}
              error={error}
            />
            
            {/* Lesson navigation */}
            {currentLesson && !isLoading && !error && (
              <LessonNavigation 
                currentLesson={currentLesson}
                nextLesson={nextLesson}
                prevLesson={prevLesson}
                onNavigate={handleLessonSelect}
              />
            )}
          </div>
        </div>
      </main>

      {/* Lesson selector modal */}
      {lessons && (
        <LessonSelector 
          lessons={lessons}
          currentLessonId={currentLessonId}
          isOpen={isLessonSelectorOpen}
          onClose={() => setLessonSelectorOpen(false)}
          onSelectLesson={handleLessonSelect}
        />
      )}

      <Footer />
      <ScrollToTop />
    </div>
  );
}
