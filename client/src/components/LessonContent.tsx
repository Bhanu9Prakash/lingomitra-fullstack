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
        <div className="w-10 h-10 border-4 border-secondary-light rounded-full border-t-secondary-dark animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading lesson content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 className="text-xl font-bold mb-2">Error Loading Lesson</h3>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
        <h3 className="text-xl font-bold mb-2">No Lesson Selected</h3>
        <p className="text-gray-600 dark:text-gray-300">Please select a lesson to begin learning</p>
      </div>
    );
  }

  return (
    <div 
      ref={contentRef}
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: marked(lesson.content) }}
    />
  );
}
