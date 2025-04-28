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

  // Create a new combined content with navigation buttons
  const combinedContent = () => {
    const lessonHtml = processContent();
    
    const navigationHtml = `
      <div class="lesson-navigation">
        ${prevLesson ? 
          `<button class="nav-button prev-button" data-lesson-id="${prevLesson.lessonId}">
            <i class="fas fa-arrow-left"></i>
            <span>Previous: ${prevLesson.title}</span>
          </button>` 
          : 
          `<div></div>`
        }
        
        ${nextLesson ? 
          `<button class="nav-button next-button" data-lesson-id="${nextLesson.lessonId}">
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
  
  // Add event handlers after component mounts or updates
  useEffect(() => {
    if (!isLoading && lesson) {
      // Add click handlers for navigation buttons
      const prevButton = document.querySelector('.prev-button');
      if (prevButton && prevLesson) {
        prevButton.addEventListener('click', () => onNavigate(prevLesson.lessonId));
      }
      
      const nextButton = document.querySelector('.next-button');
      if (nextButton && nextLesson) {
        nextButton.addEventListener('click', () => onNavigate(nextLesson.lessonId));
      }
    }
    
    // Cleanup
    return () => {
      const prevButton = document.querySelector('.prev-button');
      if (prevButton) {
        prevButton.removeEventListener('click', () => {});
      }
      
      const nextButton = document.querySelector('.next-button');
      if (nextButton) {
        nextButton.removeEventListener('click', () => {});
      }
    };
  }, [lesson, nextLesson, prevLesson, onNavigate, isLoading]);

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
