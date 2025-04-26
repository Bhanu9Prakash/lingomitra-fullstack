import { Lesson } from "@shared/schema";

interface LessonNavigationProps {
  currentLesson: Lesson;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  onNavigate: (lessonId: string) => void;
}

export default function LessonNavigation({
  currentLesson,
  nextLesson,
  prevLesson,
  onNavigate,
}: LessonNavigationProps) {
  return (
    <div className="flex justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
      {prevLesson ? (
        <button
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => onNavigate(prevLesson.lessonId)}
        >
          <i className="fas fa-arrow-left"></i>
          <span className="hidden sm:inline">Previous Lesson</span>
        </button>
      ) : (
        <div></div> // Empty div for spacing
      )}

      {nextLesson ? (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          onClick={() => onNavigate(nextLesson.lessonId)}
        >
          <span className="hidden sm:inline">Next Lesson</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      ) : (
        <div></div> // Empty div for spacing
      )}
    </div>
  );
}
