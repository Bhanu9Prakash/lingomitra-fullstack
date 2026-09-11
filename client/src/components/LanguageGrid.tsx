import { Language } from "@shared/schema";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import LanguageCard from "./LanguageCard";
import { Languages } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface LanguageGridProps {
  languages: Language[];
  isLoading: boolean;
}

export default function LanguageGrid({ languages, isLoading }: LanguageGridProps) {
  const reducedMotion = useReducedMotion();
  if (isLoading) {
    return (
      <div className="language-grid" aria-label="Loading languages" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="language-card language-card-skeleton" aria-hidden="true">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="skeleton-copy">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="language-empty">
        <Languages aria-hidden="true" />
        <h3>No languages are available yet</h3>
        <p>New courses are being prepared. Please check back soon.</p>
      </div>
    );
  }

  return (
    <AnimatedGroup className="language-grid" variants={{
      container: { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: reducedMotion === false ? .025 : 0 } } },
      item: { hidden: { opacity: 1, y: reducedMotion === false ? 8 : 0 }, visible: { opacity: 1, y: 0, transition: { duration: reducedMotion === false ? .24 : 0 } } },
    }}>
      {languages.map((language) => (
        <LanguageCard key={language.code} language={language} />
      ))}
    </AnimatedGroup>
  );
}
