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
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        onClick={onClose}
      ></div>
      
      <div className="fixed inset-y-0 left-0 w-full sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold">Select a Lesson</h3>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <div className="p-2">
              {lessons.map((lesson) => {
                const lessonNumber = getLessonNumber(lesson.lessonId);
                const isActive = lesson.lessonId === currentLessonId;
                
                return (
                  <div
                    key={lesson.lessonId}
                    className={`p-3 rounded-lg ${
                      isActive 
                        ? "bg-gray-100 dark:bg-gray-700" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    } mb-2 cursor-pointer flex items-center`}
                    onClick={() => {
                      onSelectLesson(lesson.lessonId);
                      onClose();
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full ${
                      isActive 
                        ? "bg-primary" 
                        : lessonNumber 
                          ? "bg-primary-light" 
                          : "bg-gray-300 dark:bg-gray-600"
                      } text-white flex items-center justify-center mr-3`}
                    >
                      {lessonNumber || <i className="fas fa-info"></i>}
                    </div>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
