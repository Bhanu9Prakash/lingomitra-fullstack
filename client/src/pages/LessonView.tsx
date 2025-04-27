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
  
  // Helper to extract lesson number for sorting
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };
  
  // Sort lessons by number for proper navigation
  const sortedLessons = lessons ? [...lessons].sort((a, b) => 
    getLessonNumber(a.lessonId) - getLessonNumber(b.lessonId)
  ) : [];
  
  // Find next and previous lessons using sorted lessons
  const currentIndex = sortedLessons?.findIndex(l => l.lessonId === currentLessonId) ?? -1;
  const nextLesson = currentIndex >= 0 && sortedLessons && currentIndex < sortedLessons.length - 1 
    ? sortedLessons[currentIndex + 1] 
    : null;
  const prevLesson = currentIndex > 0 && sortedLessons 
    ? sortedLessons[currentIndex - 1] 
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
    <div className="lesson-view">
      {/* Lesson header */}
      {selectedLanguage && currentLesson && (
        <LessonHeader 
          currentLesson={currentLesson}
          onOpenLessonSelector={() => setLessonSelectorOpen(true)}
        />
      )}

      {/* Main content */}
      <div className="container">
        {/* Lesson content */}
        {currentLesson ? (
          <LessonContent 
            lesson={currentLesson}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
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
