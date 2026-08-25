import { useLocation } from "wouter";
import { Language } from "@shared/schema";

interface LanguageDropdownProps {
  selectedLanguage: Language | null;
  languages: Language[];
}

/**
 * A native select is intentionally used here: it is compact, works with touch,
 * keyboard, and screen readers, and avoids the focus traps of the old div menu.
 */
export default function LanguageDropdown({ selectedLanguage, languages }: LanguageDropdownProps) {
  const [, navigate] = useLocation();
  return (
    <label className="language-select-label">
      <span className="sr-only">Choose learning language</span>
      <select
        className="language-select"
        value={selectedLanguage?.code || ""}
        onChange={(event) => {
          const code = event.target.value;
          navigate(code ? `/language/${code}` : "/languages");
        }}
      >
        <option value="">All languages</option>
        {languages.map((language) => (
          <option value={language.code} key={language.code}>{language.name}</option>
        ))}
      </select>
    </label>
  );
}