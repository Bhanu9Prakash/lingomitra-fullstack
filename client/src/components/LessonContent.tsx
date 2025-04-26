import { useEffect, useRef } from "react";
import { Lesson } from "@shared/schema";
import { marked } from "marked";
import { markedConfig } from "@/lib/marked-config";

interface LessonContentProps {
  lesson: Lesson;
  isLoading: boolean;
  error?: string;
}

export default function LessonContent({ 
  lesson, 
  isLoading,
  error 
}: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize marked configuration
    markedConfig();
  }, []);
  
  useEffect(() => {
    // Scroll to top when lesson changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [lesson]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="spinner w-12 h-12 relative">
          <div className="absolute w-full h-full border-4 border-primary rounded-full opacity-30"></div>
          <div className="absolute w-full h-full border-4 border-primary-light rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading lesson content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-exclamation-triangle text-3xl text-destructive"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">Error Loading Lesson</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-book text-3xl text-muted-foreground"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">No Lesson Selected</h3>
        <p className="text-muted-foreground max-w-md">
          Please select a lesson to begin learning
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className="lesson-content prose prose-lg dark:prose-invert prose-headings:text-primary dark:prose-headings:text-primary-light prose-a:text-secondary hover:prose-a:text-secondary-dark prose-img:rounded-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: marked(lesson.content) }}
    />
  );
}
