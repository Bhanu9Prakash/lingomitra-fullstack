import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";
import LanguageGrid from "@/components/LanguageGrid";
import MascotMoment from "@/components/MascotMoment";
import { getQueryFn } from "@/lib/queryClient";

export default function LanguageSelection() {
  const { data: languages, isLoading, error } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  
  if (error) {
    console.error("Error fetching languages:", error);
  }

  const availableCount = languages?.filter((language) => language.isAvailable).length || 0;

  return (
    <main className="studio-page language-catalog">
      <div className="studio-shell">
        <header className="language-catalog-header">
          <div className="studio-heading">
            <p className="eyebrow">Your learning studio</p>
            <h1>Choose a language to think in.</h1>
            <p>Start with one useful pattern. Predict it, say it aloud, and reuse it until the reasoning feels natural.</p>
            <div className="catalog-method" aria-label="LingoMitra learning method">
              <span><strong>01</strong> Notice</span>
              <span><strong>02</strong> Predict</span>
              <span><strong>03</strong> Reuse</span>
            </div>
          </div>
          <MascotMoment state="neutral" className="catalog-mascot" alt="The LingoMitra fox welcoming a learner" />
        </header>

        {error ? (
          <div className="catalog-error" role="alert">
            Languages could not be loaded. Check your connection and try again.
          </div>
        ) : null}

        <section className="catalog-list" aria-labelledby="available-languages">
          <div className="catalog-list-heading">
            <h2 id="available-languages">Available courses</h2>
            {!isLoading && <span>{availableCount} ready to explore</span>}
          </div>
          <LanguageGrid languages={languages || []} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}
