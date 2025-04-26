import { Lesson } from "@shared/schema";
import { useEffect } from "react";

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
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`lesson-selector ${isOpen ? 'open' : ''}`}>
      <div className="lesson-selector-content">
        <div className="lesson-selector-header">
          <h2>Select a Lesson</h2>
          <button 
            className="close-selector"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="lesson-list">
          {lessons.map((lesson) => {
            const lessonNumber = getLessonNumber(lesson.lessonId);
            const isActive = lesson.lessonId === currentLessonId;
            
            return (
              <div
                key={lesson.lessonId}
                className={`lesson-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectLesson(lesson.lessonId);
                  onClose();
                }}
              >
                <i className="fas fa-book"></i>
                <span>
                  {lessonNumber ? `Lesson ${lessonNumber}: ${lesson.title}` : lesson.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
