import { Lesson } from "@shared/schema";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { isLessonCompleted, getCompletedLessons } from "@/lib/progress";

interface LessonSelectorProps {
  lessons: Lesson[];
  currentLessonId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export default function LessonSelector({
  lessons,
  currentLessonId,
  isOpen,
  onClose,
  onSelectLesson,
}: LessonSelectorProps) {
  const isMobile = useIsMobile();
  
  // State to force refresh when opened to show updated completion status
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Track completion status
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Helper to extract lesson number for display
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? match[1] : null;
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Force refresh when opened to get latest completion status
      setRefreshTrigger(prev => prev + 1);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Sort lessons by lesson number
  const sortedLessons = [...lessons].sort((a, b) => {
    const numA = getLessonNumber(a.lessonId);
    const numB = getLessonNumber(b.lessonId);

    if (numA && numB) {
      return parseInt(numA) - parseInt(numB);
    }

    return 0;
  });

  // Get the language code from lessons
  const languageCode = lessons.length > 0 ? lessons[0].languageCode : null;

  // Create language display data
  const currentLanguage = languageCode
    ? {
        code: languageCode,
        // Convert language code to proper name (assuming ISO language codes)
        name:
          {
            de: "German",
            fr: "French",
            es: "Spanish",
            hi: "Hindi",
            zh: "Chinese",
            ja: "Japanese",
            kn: "Kannada",
          }[languageCode] || languageCode,
        // Map language codes to flag codes (some differ from language code)
        flagCode:
          {
            de: "de",
            fr: "fr",
            es: "es",
            hi: "hi",
            zh: "zh",
            ja: "jp",
            kn: "kn",
          }[languageCode] || languageCode,
      }
    : null;

  return (
    <div
      className={`lesson-selector ${isOpen ? "open" : ""} ${isMobile ? "mobile-drawer" : ""}`}
    >
      <div
        className="lesson-selector-backdrop"
        onClick={onClose}
        aria-label="Close selector"
      ></div>
      <div className="lesson-selector-content">
        <div className="lesson-selector-header">
          {isMobile && currentLanguage ? (
            <div className="mobile-drawer-header">
              <div className="language-info">
                <div className="language-flag">
                  <img
                    src={`/flags/${currentLanguage.flagCode}.svg`}
                    alt={`${currentLanguage.name} Flag`}
                  />
                </div>
                <h2>
                  {currentLanguage.name}{" "}
                  <span className="subtitle">Lessons</span>
                </h2>
              </div>
              <button
                className="close-selector"
                onClick={onClose}
                aria-label="Close lesson selector"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <>
              <h2>Select a Lesson</h2>
              <button
                className="close-selector"
                onClick={onClose}
                aria-label="Close lesson selector"
              >
                <i className="fas fa-times"></i>
              </button>
            </>
          )}
        </div>

        {isMobile && currentLanguage && (
          <div className="mobile-drawer-subheader">
            <p>Select a lesson to continue learning</p>
          </div>
        )}

        <div className="lesson-list">
          {sortedLessons.map((lesson) => {
            const lessonNumber = getLessonNumber(lesson.lessonId);
            const isActive = lesson.lessonId === currentLessonId;

            // Always show full lesson title with number for better readability
            const displayTitle = lessonNumber
              ? `Lesson ${lessonNumber}: ${lesson.title}`
              : lesson.title;

            // Check if the lesson is completed using the localStorage data
            // Including refreshTrigger ensures this updates when modal is opened
            const isCompleted = refreshTrigger > 0 && isLessonCompleted(lesson.lessonId);
            
            return (
              <div
                key={lesson.lessonId}
                className={`lesson-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => {
                  onSelectLesson(lesson.lessonId);
                  onClose();
                }}
              >
                {/* Use check-circle for completed lessons, otherwise use book icon */}
                <i className={`fas ${isCompleted ? "fa-check-circle" : "fa-book"}`}></i>
                <span>{displayTitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
