import { useLocation } from 'wouter';
import type { Language } from '@shared/schema';
import { useLearningScope } from '@/hooks/use-learning-scope';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './ui/select';

interface LanguageDropdownProps {
  selectedLanguage: Language | null;
  languages: Language[];
  publicEntry?: boolean;
}

export default function LanguageDropdown({ selectedLanguage, languages, publicEntry = false }: LanguageDropdownProps) {
  const [location, navigate] = useLocation();
  const destination=location.split('/')[1];
  const scope=useLearningScope();
  return <div className="language-select-label">
    <Select value={selectedLanguage?.code || 'all'} onValueChange={code => { if (code !== 'all' && !publicEntry && ['dashboard','practice','words'].includes(destination)) { void scope.select(code); } else navigate(code === 'all' ? '/languages' : publicEntry ? `/try/${code}` : `/language/${code}`); }}>
      <SelectTrigger className="language-select" aria-label="Choose learning language"><SelectValue placeholder="All languages" /></SelectTrigger>
      <SelectContent position="popper" align="end" className="language-select-menu">
        <SelectItem value="all">All languages</SelectItem><SelectSeparator />
        <SelectGroup><SelectLabel>Learning language</SelectLabel>{languages.map(language => <SelectItem value={language.code} key={language.code}>{language.name}</SelectItem>)}</SelectGroup>
      </SelectContent>
    </Select>
    {scope.error && <span className="sr-only" role="status">{scope.error}</span>}
  </div>;
}
