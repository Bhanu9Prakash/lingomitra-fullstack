import { useEffect, useRef } from "react";
import { Lesson } from "@shared/schema";
import { marked } from "marked";
import { markedConfig } from "@/lib/marked-config";
import { useIsMobile } from "@/hooks/use-mobile";

interface LessonContentProps {
  lesson: Lesson;
  isLoading: boolean;
  error?: string;
  prevLesson?: Lesson | null;
  nextLesson?: Lesson | null;
  onNavigate?: (lessonId: string) => void;
}

export default function LessonContent({ 
  lesson, 
  isLoading,
  error,
  prevLesson,
  nextLesson,
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

  // Handle lesson navigation
  const handleNavigation = (lesson: Lesson | null) => {
    if (lesson && onNavigate) {
      onNavigate(lesson.lessonId);
    }
  };

  return (
    <div className="lesson-content">
      <div 
        ref={contentRef}
        className={`lesson-markdown ${isMobile ? 'mobile-view' : ''}`}
        dangerouslySetInnerHTML={{ __html: processContent() }}
      />
      
      {/* In-Card Navigation */}
      {(prevLesson || nextLesson) && (
        <div className="lesson-card-navigation">
          <div className="card-nav-buttons">
            {prevLesson ? (
              <button 
                className="card-nav-button prev-lesson" 
                onClick={() => handleNavigation(prevLesson)}
              >
                <i className="fas fa-arrow-left"></i>
                Previous: {prevLesson.title}
              </button>
            ) : (
              <div className="nav-placeholder"></div>
            )}
            
            {nextLesson && (
              <button 
                className="card-nav-button next-lesson" 
                onClick={() => handleNavigation(nextLesson)}
              >
                Next: {nextLesson.title}
                <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
