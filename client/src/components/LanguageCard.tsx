import { Language } from "@shared/schema";
import { useLocation } from "wouter";
import { ArrowUpRight, UsersRound } from "lucide-react";

interface LanguageCardProps {
  language: Language;
}

export default function LanguageCard({ language }: LanguageCardProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (!language.isAvailable) return;
    navigate(`/language/${language.code}`);
  };

  const speakerCount = Number(language.speakers) || 0;
  const formattedSpeakerCount = speakerCount > 999
    ? `${(speakerCount / 1000).toFixed(1)}B`
    : `${speakerCount}M`;

  return (
    <button
      type="button"
      className="language-card"
      onClick={handleClick}
      disabled={!language.isAvailable}
      aria-label={language.isAvailable ? `Start learning ${language.name}` : `${language.name} is coming soon`}
    >
      <div className="language-card-flag">
        <img
          src={`/flags/${language.flagCode}.svg`}
          alt=""
          aria-hidden="true"
        />
      </div>
      <div className="language-card-copy">
        <span className="language-code">{language.code.toUpperCase()}</span>
        <h3>{language.name}</h3>
        <p className="speakers"><UsersRound aria-hidden="true" /> {formattedSpeakerCount} speakers worldwide</p>
      </div>
      <span className="language-card-action">
        {language.isAvailable ? "Open course" : "Coming soon"}
        {language.isAvailable && <ArrowUpRight aria-hidden="true" />}
      </span>
    </button>
  );
}
