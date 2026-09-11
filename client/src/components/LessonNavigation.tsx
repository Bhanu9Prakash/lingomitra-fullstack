import { Button } from "@/components/ui/button";
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
    <div className="lesson-navigation">
      {prevLesson ? (
        <Button variant="ghost"
          className="nav-button"
          onClick={() => onNavigate(prevLesson.lessonId)}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Previous: {prevLesson.title}</span>
        </Button>
      ) : (
        <div></div> // Empty div for spacing
      )}

      {nextLesson ? (
        <Button variant="ghost"
          className="nav-button"
          onClick={() => onNavigate(nextLesson.lessonId)}
        >
          <span>Next: {nextLesson.title}</span>
          <i className="fas fa-arrow-right"></i>
        </Button>
      ) : (
        <Button variant="ghost"
          className="nav-button disabled" disabled
        >
          <span>Course Complete</span>
          <i className="fas fa-check-circle"></i>
        </Button>
      )}
    </div>
  );
}
