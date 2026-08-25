import { Lesson } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LearningLoop from "./LearningLoop";

interface LessonContentProps {
  lesson: Lesson;
  isLoading: boolean;
  error?: string;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  onNavigate: (lessonId: string) => void;
}

export default function LessonContent({
  lesson,
  isLoading,
  error,
  nextLesson,
  prevLesson,
  onNavigate,
}: LessonContentProps) {
  if (isLoading) {
    return <div className="lesson-loading" aria-live="polite">Preparing your lesson…</div>;
  }

  if (error) {
    return <div className="lesson-error" role="alert">{error}</div>;
  }

  return (
    <article className="lesson-experience">
      <LearningLoop lesson={lesson} nextLesson={nextLesson} prevLesson={prevLesson} onNavigate={onNavigate} />
      <details className="lesson-source-notes">
        <summary>Open the lesson notes and examples</summary>
        <div className="lesson-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>
      </details>
    </article>
  );
}