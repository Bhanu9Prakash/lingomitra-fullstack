import { Language } from "@shared/schema";
import LanguageCard from "./LanguageCard";
import { Languages } from "lucide-react";

interface LanguageGridProps {
  languages: Language[];
  isLoading: boolean;
}

export default function LanguageGrid({ languages, isLoading }: LanguageGridProps) {
  if (isLoading) {
    return (
      <div className="language-grid" aria-label="Loading languages" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="language-card language-card-skeleton" aria-hidden="true">
            <div className="skeleton-flag" />
            <div className="skeleton-copy">
              <span />
              <span />
              <span />
            </div>
            <div className="skeleton-action" />
          </div>
        ))}
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="language-empty">
        <Languages aria-hidden="true" />
        <h3>No languages are available yet</h3>
        <p>New courses are being prepared. Please check back soon.</p>
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
