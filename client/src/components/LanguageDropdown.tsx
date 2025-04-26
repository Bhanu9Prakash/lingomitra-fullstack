import { useState, useRef, useEffect } from "react";
import { Language } from "@shared/schema";
import { useLocation } from "wouter";

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

  const handleLanguageSelect = (languageCode: string) => {
    navigate(`/language/${languageCode}`);
    setIsOpen(false);
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

  if (!selectedLanguage) return null;

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <div 
        className={`selected-language ${isOpen ? 'open' : ''}`} 
        onClick={toggleDropdown}
      >
        <img
          src={`/flags/${selectedLanguage.flagCode}.svg`}
          alt={`${selectedLanguage.name} Flag`}
          className="language-flag"
        />
        <span>{selectedLanguage.name}</span>
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
