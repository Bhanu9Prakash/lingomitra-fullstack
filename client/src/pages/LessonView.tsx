import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Lesson, Language } from "@shared/schema";
import LessonHeader from "@/components/LessonHeader";
import LessonContent from "@/components/LessonContent";
import LessonNavigation from "@/components/LessonNavigation";
import LessonSelector from "@/components/LessonSelector";

export default function LessonView() {
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
    setLessonSelectorOpen(false);
  };
  
  // Determine loading and error states
  const isLoading = lessonsLoading || specificLessonLoading;
  const error = lessonsError 
    ? "Failed to load lessons" 
    : specificLessonError 
      ? "Failed to load the selected lesson" 
      : "";
  
  return (
    <div className="bg-muted dark:bg-gray-900">
      {/* Lesson header */}
      {selectedLanguage && currentLesson && (
        <LessonHeader 
          currentLesson={currentLesson}
          onOpenLessonSelector={() => setLessonSelectorOpen(true)}
        />
      )}

      {/* Main content */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-background dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 max-w-4xl mx-auto border border-border">
            {/* Lesson content */}
            {currentLesson ? (
              <LessonContent 
                lesson={currentLesson}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
                <div className="spinner w-6 h-6 relative mr-3">
                  <div className="absolute w-full h-full border-4 border-primary rounded-full opacity-30"></div>
                  <div className="absolute w-full h-full border-4 border-primary-light rounded-full border-t-transparent animate-spin"></div>
                </div>
                Loading lesson...
              </div>
            )}
            
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
      </div>

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
    </div>
  );
}
