import { Language } from "@shared/schema";
import LanguageCard from "./LanguageCard";

interface LanguageGridProps {
  languages: Language[];
  isLoading: boolean;
}

export default function LanguageGrid({ languages, isLoading }: LanguageGridProps) {
  if (isLoading) {
    return (
      <div className="language-grid">
        {/* Skeleton loading cards - show 4 placeholders */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="language-card animate-pulse">
            {/* Flag icon placeholder */}
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 mx-auto"></div>
            
            {/* Title placeholder */}
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-3 mx-auto"></div>
            
            {/* Description placeholder */}
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
            <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 mx-auto"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 mx-auto"></div>
            
            {/* Button placeholder */}
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="section-intro">
        <div className="icon-container">
          <i className="fas fa-language"></i>
        </div>
        <h3>No Languages Available</h3>
        <p>
          We're currently working on adding more languages to our platform.
          Please check back soon for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="language-grid">
      {languages.map((language) => (
        <LanguageCard key={language.code} language={language} />
      ))}
    </div>
  );
}
