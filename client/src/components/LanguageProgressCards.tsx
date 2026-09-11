import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FlagIcon from './FlagIcon';
import type { Language, UserProgress, Lesson } from '@shared/schema';

interface LanguageProgressCardsProps {
  languages: Language[];
  progressData: { [code: string]: UserProgress[] };
  lessonData: { [code: string]: Lesson[] };
}

export default function LanguageProgressCards({ languages, progressData, lessonData }: LanguageProgressCardsProps) {
  const active=languages.filter(language=>progressData[language.code]?.length>0);
  return <Card><CardHeader><CardTitle>Course activity completion</CardTitle></CardHeader><CardContent>
    <p className="mb-6 text-muted-foreground">These counts record completed course activities. Your demonstrated sentence building and later retrieval appear separately above.</p>
    {active.length?<ul className="space-y-6">{active.map(language=>{
      const lessons=lessonData[language.code]||[],records=progressData[language.code]||[];
      const completed=lessons.filter(lesson=>records.some(record=>record.lessonId===lesson.lessonId&&record.completed)).length;
      const percentage=lessons.length?Math.round(completed/lessons.length*100):0;
      return <li key={language.code}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><Link className="inline-flex min-h-11 items-center gap-3 font-semibold underline underline-offset-4" href={`/language/${language.code}`}><FlagIcon code={language.flagCode} size={24}/>{language.name}</Link><span className="text-sm text-muted-foreground">{completed} of {lessons.length} activities completed</span></div><Progress value={percentage} aria-label={`${language.name}: ${completed} of ${lessons.length} course activities completed`}/></li>;
    })}</ul>:<p>No course activity completions recorded yet. Starter attempts and saved drafts remain separate.</p>}
  </CardContent></Card>;
}
