import { Lesson } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface LessonHeaderProps {
  currentLesson: Lesson | null;
  onOpenLessonSelector: () => void;
}

export default function LessonHeader({ 
  currentLesson, 
  onOpenLessonSelector 
}: LessonHeaderProps) {
  const isMobile = useIsMobile();
  
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

  return (
    <div className="lesson-header">
      <div className="container">
        <div className="lesson-header-content">
          <div className="lesson-title">
            {currentLesson && (
              <>
                <h1>
                  {isMobile ? (
                    // Simplified heading for mobile
                    <>Lesson {getLessonNumber(currentLesson.lessonId)}</>
                  ) : (
                    <>Lesson {getLessonNumber(currentLesson.lessonId)}: {currentLesson.title}</>
                  )}
                </h1>
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
          
          <button 
            className="lesson-selector-btn"
            onClick={onOpenLessonSelector}
            aria-label="View all lessons"
          >
            <i className="fas fa-list"></i>
            {!isMobile && <span>All Lessons</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
