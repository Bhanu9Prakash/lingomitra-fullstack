import { Lesson, Language } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LessonHeaderProps {
  currentLesson: Lesson | null;
  onOpenLessonSelector: () => void;
}

export default function LessonHeader({ 
  currentLesson, 
  onOpenLessonSelector 
}: LessonHeaderProps) {
  const isMobile = useIsMobile();
  const [_, navigate] = useLocation();
  
  // Extract lesson number from lessonId (e.g., "de-lesson01" -> "01")
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? match[1] : "";
  };

  // Fetch languages for the language selector
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  // Fetch current language data if we have a lesson
  const { data: currentLanguage } = useQuery<Language>({
    queryKey: [`/api/languages/${currentLesson?.languageCode}`],
    enabled: !!currentLesson,
  });

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    // Navigate to the first lesson of the selected language
    if (languageCode && languageCode !== currentLesson?.languageCode) {
      navigate(`/${languageCode}/lesson/1`);
    }
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
            
            {/* Language flag only for mobile (right side) */}
            {currentLanguage && (
              <div className="mobile-language-selector">
                <button 
                  className="language-select-btn"
                  onClick={() => {
                    // Show a language selection dropdown on mobile
                    // For now, this is a simplified version - it could be expanded later
                    const selectLanguage = window.prompt(
                      "Select a language:", 
                      currentLanguage.code
                    );
                    if (selectLanguage) handleLanguageChange(selectLanguage);
                  }}
                  aria-label="Select language"
                >
                  <span className="language-flag">
                    <img 
                      src={`https://flagcdn.com/${currentLanguage.flagCode.toLowerCase()}.svg`} 
                      alt={`${currentLanguage.name} flag`} 
                    />
                  </span>
                </button>
              </div>
            )}
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
            
            {/* Language selector for desktop (right side) */}
            {currentLanguage && (
              <div className="language-selector">
                <button 
                  className="language-select-btn"
                  onClick={(e) => {
                    // Toggle language selection dropdown visibility
                    const dropdown = document.getElementById('language-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('show-dropdown');
                      // Add click outside listener to close dropdown
                      const closeDropdown = (event: MouseEvent) => {
                        if (!dropdown.contains(event.target as Node) && 
                            !(e.target as Node).contains(event.target as Node)) {
                          dropdown.classList.remove('show-dropdown');
                          document.removeEventListener('click', closeDropdown);
                        }
                      };
                      // Delay adding the listener slightly to prevent immediate closing
                      setTimeout(() => {
                        document.addEventListener('click', closeDropdown);
                      }, 10);
                    }
                  }}
                  aria-label="Select language"
                >
                  <span className="language-flag">
                    <img 
                      src={`https://flagcdn.com/${currentLanguage.flagCode.toLowerCase()}.svg`} 
                      alt={`${currentLanguage.name} flag`} 
                    />
                  </span>
                  <span className="language-name">{currentLanguage.name}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                
                {/* Language dropdown menu */}
                <div id="language-dropdown" className="language-dropdown">
                  {languages?.map(lang => (
                    <button 
                      key={lang.code} 
                      className={`language-option ${lang.code === currentLanguage.code ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span className="language-flag">
                        <img 
                          src={`https://flagcdn.com/${lang.flagCode.toLowerCase()}.svg`} 
                          alt={`${lang.name} flag`} 
                        />
                      </span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
