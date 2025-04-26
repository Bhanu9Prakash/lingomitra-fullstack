import { Language } from "@shared/schema";
import LanguageCard from "./LanguageCard";

interface LanguageGridProps {
  languages: Language[];
  isLoading: boolean;
}

export default function LanguageGrid({ languages, isLoading }: LanguageGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-10 h-10 border-4 border-secondary-light rounded-full border-t-secondary-dark animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3">Choose Your Language Adventure</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Select a language to start your learning journey. Each language offers unique lessons designed to help you master new skills naturally.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {languages.map((language) => (
            <LanguageCard key={language.code} language={language} />
          ))}
        </div>
      </div>
    </section>
  );
}
