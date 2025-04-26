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
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        onClick={toggleDropdown}
      >
        <img
          src={`/flags/${selectedLanguage.flagCode}.svg`}
          alt={`${selectedLanguage.name} Flag`}
          className="w-5 h-5 rounded-sm"
        />
        <span className="font-medium">{selectedLanguage.name}</span>
        <i className="fas fa-chevron-down text-xs"></i>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50">
          <div
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
            onClick={navigateToLanguageGrid}
          >
            <i className="fas fa-th-large text-gray-500"></i>
            <span>All Languages</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          {languages.map((language) => (
            <div
              key={language.code}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
              onClick={() => handleLanguageSelect(language.code)}
            >
              <img
                src={`/flags/${language.flagCode}.svg`}
                alt={`${language.name} Flag`}
                className="w-5 h-5 rounded-sm"
              />
              <span>{language.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
