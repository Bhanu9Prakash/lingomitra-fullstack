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
        <div className="spinner w-12 h-12 relative">
          <div className="absolute w-full h-full border-4 border-primary rounded-full opacity-30"></div>
          <div className="absolute w-full h-full border-4 border-primary-light rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="ml-4 text-muted-foreground font-medium">Loading languages...</p>
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-language text-3xl text-muted-foreground"></i>
        </div>
        <h3 className="text-xl font-bold mb-2">No Languages Available</h3>
        <p className="text-muted-foreground max-w-md">
          We're currently working on adding more languages to our platform.
          Please check back soon for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="language-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {languages.map((language) => (
        <LanguageCard key={language.code} language={language} />
      ))}
    </div>
  );
}
