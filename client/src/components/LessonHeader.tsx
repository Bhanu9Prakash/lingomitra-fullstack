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
    <div className="bg-background dark:bg-gray-800 border-b border-border dark:border-gray-700 sticky top-[64px] z-40 py-3 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <button 
            className="p-2 rounded-lg text-foreground hover:bg-muted dark:hover:bg-gray-700 transition-all"
            onClick={onOpenLessonSelector}
            aria-label="Open lesson selector"
          >
            <i className="fas fa-bars"></i>
          </button>
          
          {currentLesson && (
            <h2 className="text-lg font-bold flex-grow text-center">
              {getLessonNumber(currentLesson.lessonId) ? (
                <span className="text-primary dark:text-primary-light">
                  Lesson {getLessonNumber(currentLesson.lessonId)}:&nbsp;
                </span>
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
