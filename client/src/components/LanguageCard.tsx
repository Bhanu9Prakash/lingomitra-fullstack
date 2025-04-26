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
      className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      <div className="h-36 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-6">
        <img
          src={`/flags/${language.flagCode}.svg`}
          alt={`${language.name} Flag`}
          className="h-24 w-36 object-cover rounded shadow-sm group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2">{language.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {language.speakers} million speakers
        </p>
        <button className="w-full py-2 px-4 text-primary border border-primary hover:bg-primary hover:text-white rounded-lg transition-colors font-semibold mt-auto">
          Start Learning
        </button>
      </div>
    </div>
  );
}
