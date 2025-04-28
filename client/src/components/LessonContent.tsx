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

  // Initialize marked configuration
  useEffect(() => {
    markedConfig();
  }, []);
  
  // Scroll to top when lesson changes
  useEffect(() => {
    if (!isLoading && lesson && contentRef.current) {
      contentRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, [lesson, isLoading]);

  // Handle loading and error states
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

  // Process content for display
  const processContent = () => {
    let contentToUse = lesson.content;
    
    if (isMobile) {
      // On mobile, hide the first H1 title since it's displayed in the header
      const titlePattern = /^#\s+.+(\r\n|\n|\r)/;
      contentToUse = contentToUse.replace(titlePattern, '');
    }
    
    // Remove any trailing horizontal rules
    const trailingHRPattern = /(\r\n|\n|\r)-{3,}(\r\n|\n|\r)*$/;
    contentToUse = contentToUse.replace(trailingHRPattern, '');
    
    return marked(contentToUse);
  };

  // Handle navigation
  const handlePrevClick = () => {
    if (prevLesson) {
      onNavigate(prevLesson.lessonId);
    }
  };

  const handleNextClick = () => {
    if (nextLesson) {
      onNavigate(nextLesson.lessonId);
    }
  };

  return (
    <div className="lesson-content">
      <div 
        ref={contentRef}
        className={`lesson-markdown ${isMobile ? 'mobile-view' : ''}`}
        dangerouslySetInnerHTML={{ __html: processContent() }}
      />
      
      {/* Navigation buttons */}
      <div className="lesson-navigation">
        {prevLesson ? (
          <button 
            className="nav-button" 
            onClick={handlePrevClick}
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
            onClick={handleNextClick}
          >
            <span>Next: {nextLesson.title}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button className="nav-button disabled">
            <span>Course Complete</span>
            <i className="fas fa-check-circle"></i>
          </button>
        )}
      </div>
    </div>
  );
}