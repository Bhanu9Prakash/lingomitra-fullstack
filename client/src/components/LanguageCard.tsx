import { Language } from "@shared/schema";
import { useLocation } from "wouter";

interface LanguageCardProps {
  language: Language;
}

export default function LanguageCard({ language }: LanguageCardProps) {
  const [_, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/language/${language.code}`);
  };

  return (
    <div className="language-card" onClick={handleClick}>
      <div className="language-card-flag">
        <img
          src={`/flags/${language.flagCode}.svg`}
          alt={`${language.name} Flag`}
        />
      </div>
      <h3>{language.name}</h3>
      <p className="speakers">
        {language.speakers} million speakers
      </p>
      <button className="language-btn">
        Start Learning
      </button>
    </div>
  );
}
