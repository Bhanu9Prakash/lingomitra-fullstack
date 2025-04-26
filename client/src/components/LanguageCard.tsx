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
    <div
      className="bg-background dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all border border-border dark:border-gray-600 flex flex-col cursor-pointer text-center p-8 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="language-card-flag mb-5">
        <img
          src={`/flags/${language.flagCode}.svg`}
          alt={`${language.name} Flag`}
          className="w-12 h-12 mx-auto object-contain"
        />
      </div>
      <h3 className="text-xl font-bold mb-2">{language.name}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {language.speakers} million speakers
      </p>
      <button className="language-btn bg-primary hover:bg-primary-dark text-white border-none py-2 px-5 rounded-lg font-semibold text-sm transition-colors mt-auto">
        Start Learning
      </button>
    </div>
  );
}
