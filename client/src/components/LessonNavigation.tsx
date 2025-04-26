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
    <div className="flex justify-between mt-10 pt-6 border-t border-border">
      {prevLesson ? (
        <button
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all text-foreground"
          onClick={() => onNavigate(prevLesson.lessonId)}
        >
          <i className="fas fa-arrow-left"></i>
          <div className="flex flex-col items-start text-left ml-1">
            <span className="text-xs text-muted-foreground">Previous</span>
            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
              {prevLesson.title}
            </span>
          </div>
        </button>
      ) : (
        <div></div> // Empty div for spacing
      )}

      {nextLesson ? (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all hover:-translate-y-1 shadow-sm hover:shadow"
          onClick={() => onNavigate(nextLesson.lessonId)}
        >
          <div className="flex flex-col items-end text-right mr-1">
            <span className="text-xs text-white/80">Next</span>
            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
              {nextLesson.title}
            </span>
          </div>
          <i className="fas fa-arrow-right"></i>
        </button>
      ) : (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg transition-all hover:-translate-y-1 shadow-sm hover:shadow ml-auto"
        >
          <div className="flex flex-col items-end text-right mr-1">
            <span className="text-xs text-white/80">Completed</span>
            <span className="text-sm font-medium">Course Complete</span>
          </div>
          <i className="fas fa-check-circle"></i>
        </button>
      )}
    </div>
  );
}
