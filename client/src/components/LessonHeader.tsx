import { Lesson, Language } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LessonHeaderProps {
  currentLesson: Lesson | null;
  onOpenLessonSelector: () => void;
  onToggleChat: () => void;
  isChatActive: boolean;
}

export default function LessonHeader({ 
  currentLesson, 
  onOpenLessonSelector,
  onToggleChat,
  isChatActive
}: LessonHeaderProps) {
  const isMobile = useIsMobile();
  
  // Extract lesson number from lessonId (e.g., "de-lesson01" -> "01")
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? match[1] : "";
  };

  return (
    <header className="lesson-header">
      <div className="container">
        {isMobile ? (
          // Mobile layout - simplified single row header with fixed spacing
          <div className="mobile-lesson-header">
            {/* Lesson selector button (left) */}
            <button 
              className="lesson-selector-btn"
              onClick={onOpenLessonSelector}
              aria-label="View all lessons"
            >
              <i className="fas fa-list"></i>
            </button>
            
            {/* Full lesson title with lesson number */}
            <div className="mobile-lesson-title">
              {currentLesson && (
                <span className="full-lesson-title">
                  Lesson {getLessonNumber(currentLesson.lessonId)}: {currentLesson.title}
                </span>
              )}
            </div>
            
            {/* Chat toggle button (right) */}
            <button 
              className={`chat-toggle ${isChatActive ? 'active' : ''}`}
              onClick={onToggleChat}
              aria-label={isChatActive ? "Close tutor chat" : "Open tutor chat"}
              title={isChatActive ? "Close tutor chat" : "Open tutor chat"}
            >
              <i className={`fas ${isChatActive ? 'fa-times' : 'fa-comment'}`}></i>
            </button>
          </div>
        ) : (
          // Desktop layout
          <div className="lesson-header-content">
            {/* Lesson selector button (left) */}
            <button 
              className="lesson-selector-btn"
              onClick={onOpenLessonSelector}
              aria-label="View all lessons"
            >
              <i className="fas fa-list"></i>
            </button>
            
            {/* Lesson title (center) */}
            <div className="lesson-title">
              {currentLesson && (
                <h1>Lesson {getLessonNumber(currentLesson.lessonId)}: {currentLesson.title}</h1>
              )}
            </div>
            
            {/* Chat toggle button (right) */}
            <button 
              className={`chat-toggle ${isChatActive ? 'active' : ''}`}
              onClick={onToggleChat}
              aria-label={isChatActive ? "Close tutor chat" : "Open tutor chat"}
              title={isChatActive ? "Close tutor chat" : "Open tutor chat"}
            >
              <i className={`fas ${isChatActive ? 'fa-times' : 'fa-comment'}`}></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}