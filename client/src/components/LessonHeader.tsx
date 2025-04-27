import { Lesson, Language } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LessonHeaderProps {
  currentLesson: Lesson | null;
  onOpenLessonSelector: () => void;
}

export default function LessonHeader({ 
  currentLesson, 
  onOpenLessonSelector 
}: LessonHeaderProps) {
  const isMobile = useIsMobile();
  const [_, navigate] = useLocation();
  
  // Fetch all languages for the language selector
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  // Extract lesson number from lessonId (e.g., "de-lesson01" -> "01")
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? match[1] : "";
  };
  
  // Get language name from lesson language code
  const getLanguageName = (languageCode: string) => {
    const languages: Record<string, string> = {
      de: "German",
      es: "Spanish",
      fr: "French",
      hi: "Hindi",
      zh: "Chinese",
      ja: "Japanese"
    };
    return languages[languageCode] || languageCode;
  };
  
  // Language selection handler
  const handleLanguageChange = (languageCode: string) => {
    navigate(`/language/${languageCode}`);
  };

  return (
    <header className="lesson-header">
      <div className="container">
        {isMobile ? (
          // Mobile layout - single row with compact header
          <div className="mobile-lesson-header">
            {currentLesson && (
              <div className="mobile-lesson-title">
                <div className="language-selector-mobile" onClick={() => currentLesson && handleLanguageChange(currentLesson.languageCode)}>
                  <img 
                    src={`/flags/${currentLesson.languageCode}.svg`} 
                    alt={`${getLanguageName(currentLesson.languageCode)} Flag`}
                    className="language-flag" 
                  />
                </div>
                <span>Lesson {getLessonNumber(currentLesson.lessonId)}</span>
              </div>
            )}
            <button 
              className="lesson-selector-btn"
              onClick={onOpenLessonSelector}
              aria-label="View all lessons"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        ) : (
          // Desktop layout
          <div className="lesson-header-content">
            <div className="lesson-title">
              {currentLesson && (
                <>
                  <h1>Lesson {getLessonNumber(currentLesson.lessonId)}: {currentLesson.title}</h1>
                  <div className="lesson-language">
                    <img 
                      src={`/flags/${currentLesson.languageCode}.svg`} 
                      alt={`${getLanguageName(currentLesson.languageCode)} Flag`}
                      className="language-flag" 
                    />
                    <span>{getLanguageName(currentLesson.languageCode)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="header-controls">
              {/* Language selector dropdown */}
              <div className="language-dropdown">
                <div className="selected-language" onClick={() => currentLesson && handleLanguageChange(currentLesson.languageCode)}>
                  {currentLesson && (
                    <>
                      <img 
                        src={`/flags/${currentLesson.languageCode}.svg`} 
                        alt={`${getLanguageName(currentLesson.languageCode)} Flag`}
                        className="language-flag" 
                      />
                      <span>{getLanguageName(currentLesson.languageCode)}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Lesson selector button */}
              <button 
                className="lesson-selector-btn"
                onClick={onOpenLessonSelector}
                aria-label="View all lessons"
              >
                <i className="fas fa-list"></i>
                <span>All Lessons</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
