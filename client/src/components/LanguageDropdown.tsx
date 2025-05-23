import { useState, useRef, useEffect } from "react";
import { Language, Lesson } from "@shared/schema";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface LanguageDropdownProps {
  selectedLanguage: Language | null;
  languages: Language[];
}

export default function LanguageDropdown({
  selectedLanguage,
  languages,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [_, navigate] = useLocation();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Navigate to the first lesson of the selected language
  const handleLanguageSelect = (languageCode: string) => {
    // Use the proper route format for your application
    // We're immediately redirecting to the first lesson of that language
    navigateToFirstLesson(languageCode);
  };
  
  // Function to navigate to the first lesson of a language
  const navigateToFirstLesson = async (languageCode: string) => {
    try {
      // Fetch lessons for this language
      const response = await fetch(`/api/languages/${languageCode}/lessons`);
      const lessons: Lesson[] = await response.json();
      
      if (lessons && lessons.length > 0) {
        // Extract lesson number from lessonId (e.g. "de-lesson01" → "1")
        const lessonNumber = lessons[0].lessonId.split('-lesson')[1];
        // Navigate directly to the first lesson
        navigate(`/${languageCode}/lesson/${lessonNumber}`);
      } else {
        // Fallback if no lessons available
        navigate(`/language/${languageCode}`);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      // Fallback to language page on error
      navigate(`/language/${languageCode}`);
    } finally {
      // Always close the dropdown
      setIsOpen(false);
    }
  };

  const navigateToLanguageGrid = () => {
    navigate("/languages");
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If no language is selected, show a default "Select Language" button

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <div 
        className={`selected-language ${isOpen ? 'open' : ''}`} 
        onClick={toggleDropdown}
      >
        {selectedLanguage && selectedLanguage.flagCode ? (
          <>
            <img
              src={`/flags/${selectedLanguage.flagCode}.svg`}
              alt={`${selectedLanguage.name} Flag`}
              className="language-flag"
            />
            <span>{selectedLanguage.name}</span>
          </>
        ) : (
          <>
            <i className="fas fa-globe" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
            <span>Select Language</span>
          </>
        )}
        <i className="fas fa-chevron-down"></i>
      </div>

      <div className={`language-dropdown-content ${isOpen ? 'show' : ''}`}>
        <div
          className="dropdown-item"
          onClick={navigateToLanguageGrid}
        >
          <i className="fas fa-th-large"></i>
          <span>All Languages</span>
        </div>
        
        {languages.map((language) => (
          <div
            key={language.code}
            className="dropdown-item"
            onClick={() => handleLanguageSelect(language.code)}
          >
            <img
              src={`/flags/${language.flagCode}.svg`}
              alt={`${language.name} Flag`}
              className="language-flag"
            />
            <span>{language.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
