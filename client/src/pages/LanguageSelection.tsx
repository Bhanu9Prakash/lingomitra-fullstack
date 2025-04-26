import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";
import LanguageGrid from "@/components/LanguageGrid";

export default function LanguageSelection() {
  const { data: languages, isLoading } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  return (
    <section className="language-grid-section">
      <div className="container">
        <h2>Choose Your Language Adventure</h2>
        <div className="section-intro">
          <p>
            Select a language to start your learning journey. Each language offers unique lessons
            designed to help you master new skills naturally.
          </p>
        </div>
        
        <LanguageGrid languages={languages || []} isLoading={isLoading} />
      </div>
    </section>
  );
}
