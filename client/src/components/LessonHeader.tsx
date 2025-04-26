import { Lesson } from "@shared/schema";

interface LessonHeaderProps {
  currentLesson: Lesson | null;
  onOpenLessonSelector: () => void;
}

export default function LessonHeader({ 
  currentLesson, 
  onOpenLessonSelector 
}: LessonHeaderProps) {
  // Extract lesson number from lessonId (e.g., "de-lesson-3" -> "3")
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/-lesson-(\d+)$/);
    return match ? match[1] : null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 py-3 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={onOpenLessonSelector}
            aria-label="Open lesson selector"
          >
            <i className="fas fa-bars"></i>
          </button>
          
          {currentLesson && (
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-grow text-center">
              {getLessonNumber(currentLesson.lessonId) ? (
                <>Lesson {getLessonNumber(currentLesson.lessonId)}: </>
              ) : null}
              {currentLesson.title}
            </h2>
          )}
          
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
}
