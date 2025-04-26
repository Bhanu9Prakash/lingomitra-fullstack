import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";
import LanguageGrid from "@/components/LanguageGrid";

export default function LanguageSelection() {
  const { data: languages, isLoading } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  return (
    <div className="bg-muted dark:bg-gray-900 py-10">
      <section className="language-grid-section">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Language Adventure</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Select a language to start your learning journey. Each language offers unique lessons
            designed to help you master new skills naturally.
          </p>
          
          <LanguageGrid languages={languages || []} isLoading={isLoading} />
        </div>
      </section>
    </div>
  );
}
