import { useState, useRef, useEffect } from "react";
import { Language } from "@shared/schema";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface LanguageSelectorProps {
  selectedLanguage: Language | null;
  languages: Language[];
}

export default function LanguageSelector({
  selectedLanguage,
  languages,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [_, navigate] = useLocation();
  const isMobile = useIsMobile();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (languageCode: string) => {
    navigate(`/language/${languageCode}`);
    setIsOpen(false);
  };

  const navigateToLanguageSelection = () => {
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

  return (
    <div className="header-language-selector" ref={dropdownRef}>
      <button 
        className={`language-selector-btn ${isOpen ? 'active' : ''}`} 
        onClick={toggleDropdown}
        aria-label={selectedLanguage ? `Change language from ${selectedLanguage.name}` : "Select language"}
      >
        {selectedLanguage ? (
          <>
            <img
              src={`/flags/${selectedLanguage.flagCode}.svg`}
              alt={`${selectedLanguage.name} Flag`}
              className="language-flag"
            />
            {!isMobile && <span className="language-name">{selectedLanguage.name}</span>}
          </>
        ) : (
          <>
            <i className="fas fa-globe"></i>
            {!isMobile && <span className="language-name">Select Language</span>}
          </>
        )}
      </button>

      {isOpen && (
        <div className="language-selector-dropdown">
          <div className="language-selector-header">
            <h3>Select a Language</h3>
          </div>
          
          <div className="language-list">
            <div
              className="language-item view-all"
              onClick={navigateToLanguageSelection}
            >
              <i className="fas fa-th-large"></i>
              <span>All Languages</span>
            </div>
            
            {languages.map((language) => (
              <div
                key={language.code}
                className={`language-item ${selectedLanguage?.code === language.code ? 'active' : ''}`}
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
      )}
    </div>
  );
}