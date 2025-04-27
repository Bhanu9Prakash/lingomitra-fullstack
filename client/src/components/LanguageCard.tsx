import { Language } from "@shared/schema";
import { useLocation } from "wouter";

interface LanguageCardProps {
  language: Language;
}

export default function LanguageCard({ language }: LanguageCardProps) {
  const [_, navigate] = useLocation();

  const handleClick = () => {
    // Navigate to the first lesson using the new URL format
    navigate(`/${language.code}/lesson/1`);
  };

  // Map of languages to their approximate number of speakers (in millions)
  const speakerNumbers: Record<string, number> = {
    de: 130,     // German - native + non-native speakers
    fr: 267,     // French - native + non-native speakers
    es: 543,     // Spanish - native + non-native speakers
    hi: 602,     // Hindi
    zh: 1117,    // Chinese (mostly Mandarin)
    jp: 122,     // Japanese
  };

  // Get the speaker count for this language
  const speakerCount = speakerNumbers[language.code] || language.speakers || 0;

  // Format the speaker count for display
  const formattedSpeakerCount = speakerCount > 999 
    ? `${(speakerCount / 1000).toFixed(1)}B` 
    : `${speakerCount}M`;

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
        <i className="fas fa-users"></i> {formattedSpeakerCount} speakers worldwide
      </p>
      <button className="language-btn">
        Start Learning
      </button>
    </div>
  );
}
