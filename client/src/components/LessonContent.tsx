import { useEffect, useRef } from "react";
import { Lesson } from "@shared/schema";
import { marked } from "marked";
import { markedConfig } from "@/lib/marked-config";
import { useIsMobile } from "@/hooks/use-mobile";
import { markLessonAsCompleted } from "@/lib/progress";

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

  // Function to process content and hide the first h1 title on mobile
  const processContent = () => {
    if (!lesson) return "";
    
    // Get the content with appropriate processing
    let contentToUse = lesson.content;
    
    if (isMobile) {
      // On mobile, hide the first H1 title since it's displayed in the header
      // Get content without the first H1 header (attempt to find and remove the first title)
      const titlePattern = /^#\s+.+(\r\n|\n|\r)/;
      contentToUse = contentToUse.replace(titlePattern, '');
    }
    
    // Remove any trailing horizontal rules to avoid duplicate separators
    const trailingHRPattern = /(\r\n|\n|\r)-{3,}(\r\n|\n|\r)*$/;
    contentToUse = contentToUse.replace(trailingHRPattern, '');
    
    return marked(contentToUse);
  };

  // Create a new combined content with navigation buttons
  const combinedContent = () => {
    if (!lesson) return "";
    
    const lessonHtml = processContent();
    
    const navigationHtml = `
      <!-- Remove the hr before the navigation -->
      <div class="lesson-navigation">
        ${prevLesson ? 
          `<button class="nav-button prev-button" id="prev-lesson-btn" data-lesson-id="${prevLesson.lessonId}">
            <i class="fas fa-arrow-left"></i>
            <span>Previous: ${prevLesson.title}</span>
          </button>` 
          : 
          `<div></div>`
        }
        
        ${nextLesson ? 
          `<button class="nav-button next-button" id="next-lesson-btn" data-lesson-id="${nextLesson.lessonId}">
            <span>Next: ${nextLesson.title}</span>
            <i class="fas fa-arrow-right"></i>
          </button>` 
          : 
          `<button class="nav-button disabled">
            <span>Course Complete</span>
            <i class="fas fa-check-circle"></i>
          </button>`
        }
      </div>
    `;
    
    return lessonHtml + navigationHtml;
  };

  // #1: Initialize marked configuration
  useEffect(() => {
    markedConfig();
  }, []);
  
  // #2: Scroll to top when lesson changes and mark the lesson as completed
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
      
      // Mark the current lesson as completed when it's viewed
      if (lesson?.lessonId) {
        // Mark the lesson as completed in localStorage
        markLessonAsCompleted(lesson.lessonId);
      }
    }
  }, [lesson]);
  
  // #3: Add event handlers after component mounts or updates
  // IMPORTANT: This useEffect MUST be declared before any conditional returns
  useEffect(() => {
    if (!isLoading && lesson) {
      // Add click handlers for navigation buttons
      const prevButton = document.getElementById('prev-lesson-btn');
      const nextButton = document.getElementById('next-lesson-btn');
      
      // Define the handlers
      const handlePrevClick = () => prevLesson && onNavigate(prevLesson.lessonId);
      const handleNextClick = () => nextLesson && onNavigate(nextLesson.lessonId);
      
      // Add event listeners
      if (prevButton && prevLesson) {
        prevButton.addEventListener('click', handlePrevClick);
      }
      
      if (nextButton && nextLesson) {
        nextButton.addEventListener('click', handleNextClick);
      }
      
      // Cleanup
      return () => {
        if (prevButton) {
          prevButton.removeEventListener('click', handlePrevClick);
        }
        
        if (nextButton) {
          nextButton.removeEventListener('click', handleNextClick);
        }
      };
    }
  }, [lesson, nextLesson, prevLesson, onNavigate, isLoading]);

  // Now the conditional returns are safe because all hooks are above them
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

  return (
    <div className="lesson-content">
      <div 
        ref={contentRef}
        className={`lesson-markdown ${isMobile ? 'mobile-view' : ''}`}
        dangerouslySetInnerHTML={{ __html: combinedContent() }}
      />
    </div>
  );
}
