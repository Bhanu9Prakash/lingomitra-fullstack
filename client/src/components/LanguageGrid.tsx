import { Language } from "@shared/schema";
import LanguageCard from "./LanguageCard";

interface LanguageGridProps {
  languages: Language[];
  isLoading: boolean;
}

export default function LanguageGrid({ languages, isLoading }: LanguageGridProps) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
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
