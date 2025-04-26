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
    const match = lessonId.match(/-lesson-(\d+)$/);
    return match ? parseInt(match[1]) : null;
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
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="fixed inset-y-0 left-0 w-full sm:w-96 bg-background dark:bg-gray-800 shadow-xl z-50 transform transition-all duration-300 ease-in-out border-r border-border overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex justify-between items-center bg-muted/50">
            <h3 className="text-lg font-bold flex items-center">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                <i className="fas fa-book"></i>
              </span>
              Select a Lesson
            </h3>
            <button 
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
              aria-label="Close lesson selector"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-2">
            {lessons.map((lesson) => {
              const lessonNumber = getLessonNumber(lesson.lessonId);
              const isActive = lesson.lessonId === currentLessonId;
              const isIntroduction = !lessonNumber;
              
              return (
                <div
                  key={lesson.lessonId}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                    isActive 
                      ? "bg-primary/10 border-l-4 border-primary dark:border-primary-light" 
                      : "hover:bg-muted border-l-4 border-transparent"
                  }`}
                  onClick={() => {
                    onSelectLesson(lesson.lessonId);
                    onClose();
                  }}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      isActive 
                        ? "bg-primary text-white"
                        : isIntroduction
                          ? "bg-secondary text-white"
                          : "bg-muted text-primary"
                    }`}>
                      {isIntroduction 
                        ? <i className="fas fa-info-circle"></i>
                        : lessonNumber
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isActive ? "text-primary dark:text-primary-light" : ""}`}>
                        {isIntroduction ? "Introduction" : `Lesson ${lessonNumber}`}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lesson.title}
                      </p>
                    </div>
                    {isActive && (
                      <div className="text-primary dark:text-primary-light">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
