import { useEffect, useRef } from "react";
import { Lesson } from "@shared/schema";
import { marked } from "marked";
import { markedConfig } from "@/lib/marked-config";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onNavigate
}: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-triangle"></i>
        <span>Error Loading Lesson: {error}</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-content">
        <div className="lesson-markdown">
          <h2>No Lesson Selected</h2>
          <p>Please select a lesson to begin learning</p>
        </div>
      </div>
    );
  }

  // Function to process content and hide the first h1 title on mobile
  const processContent = () => {
    if (isMobile) {
      // On mobile, hide the first H1 title since it's displayed in the header
      const parsed = lesson.content;
      
      // Get content without the first H1 header (attempt to find and remove the first title)
      const titlePattern = /^#\s+.+(\r\n|\n|\r)/;
      const processedContent = parsed.replace(titlePattern, '');
      
      return marked(processedContent);
    }
    
    return marked(lesson.content);
  };

  return (
    <div className="lesson-content">
      <div 
        ref={contentRef}
        className={`lesson-markdown ${isMobile ? 'mobile-view' : ''}`}
        dangerouslySetInnerHTML={{ __html: processContent() }}
      />
      
      {/* Lesson navigation */}
      <div className="lesson-navigation">
        {prevLesson ? (
          <button
            className="nav-button"
            onClick={() => onNavigate(prevLesson.lessonId)}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Previous: {prevLesson.title}</span>
          </button>
        ) : (
          <div></div> // Empty div for spacing
        )}

        {nextLesson ? (
          <button
            className="nav-button"
            onClick={() => onNavigate(nextLesson.lessonId)}
          >
            <span>Next: {nextLesson.title}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button
            className="nav-button disabled"
          >
            <span>Course Complete</span>
            <i className="fas fa-check-circle"></i>
          </button>
        )}
      </div>
    </div>
  );
}
