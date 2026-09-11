import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import LearningLanguagePicker from '@/components/LearningLanguagePicker';
import { useLearningScope } from '@/hooks/use-learning-scope';
import { learningApi } from '@/lib/learning-api';
import type { LearningSummary } from '@shared/learning';
import type { WordsSummary } from '@shared/words';

export default function Practice() {
  const { code, selected, select, error: preferenceError, user } = useLearningScope();
  const summary = useQuery<LearningSummary>({ queryKey: ['/api/learning/summary', code, user?.id], queryFn: () => learningApi('/api/learning/summary?language=' + code), enabled: Boolean(selected) });
  const words = useQuery<WordsSummary>({ queryKey: ['/api/words', code, user?.id], queryFn: () => learningApi('/api/words?language=' + code), enabled: Boolean(selected) });
  const data = summary.data;
  const available = words.data?.words.filter(w => w.encountered && w.practiceHref) || [];
  return <main className="studio-page"><div className="studio-shell practice-workspace">
    <header className="studio-page-heading"><div><p className="eyebrow">Practice{selected ? ' / ' + selected.name : ''}</p><h1>Bring an idea back.</h1><p>A word, a sentence, a little more confidence.</p></div><LearningLanguagePicker code={code} onChange={select} /></header>
    {preferenceError && <p role="status">{preferenceError}</p>}
    {!selected ? <section className="studio-empty"><h2>Choose a language for this practice.</h2></section> : summary.isLoading ? <p className="studio-empty" role="status">Finding your review suggestions…</p> : summary.error ? <div className="studio-empty" role="alert"><p>Your practice record couldn’t load. It has not been reset.</p><Button onClick={() => summary.refetch()}>Try again</Button></div> : data && <>
      <Card className="practice-ready"><CardHeader><p className="eyebrow">Suggested for this visit</p><h2>{data.reviews.length ? data.reviews.length + (data.reviews.length === 1 ? ' idea to revisit' : ' ideas to revisit') : 'Nothing is due. You can still practise.'}</h2></CardHeader><CardContent>{data.reviews.length ? <><p>Try before opening help. You can stop after any activity.</p><ul className="practice-queue">{data.reviews.map((r, i) => <li key={r.id}><div><h3>{r.title}</h3><p>{r.id.startsWith('word-') ? 'Recall a word, then use it in a sentence.' : 'Bring back a pattern from your lesson.'}</p></div><Button variant={i === 0 ? 'default' : 'outline'} asChild><Link href={r.href}>Revisit<ArrowRight size={17} aria-hidden="true" /></Link></Button></li>)}</ul></> : <p>Pick a familiar lesson below. Your next reminder will appear here after you finish.</p>}</CardContent></Card>
      <section className="practice-lessons" aria-labelledby="practice-lessons-title"><div className="words-list-heading"><h2 id="practice-lessons-title">Return to a lesson</h2><Link href={'/language/' + code}>See the whole course</Link></div><ul>{data.activities.map(a => { const learned = data.skills.find(s => s.id === a.id); return <li key={a.id}><div><Link href={learned?.completed ? a.href + '?review=1' : a.href}>{a.title}<ChevronRight size={18} aria-hidden="true" /></Link><p>{a.outcome}</p></div><span>{learned?.completed ? 'Ready to revisit' : learned ? 'In progress' : 'Open lesson'}</span></li>; })}</ul></section>
      <section className="practice-words" aria-labelledby="practice-words-title"><div className="words-list-heading"><h2 id="practice-words-title">Words into sentences</h2><Link href={'/words/' + code}>Open your words</Link></div><p>Recall the word first, then use it in its lesson pattern.</p>{words.error ? <p role="alert">Your word practice couldn’t load. <Button variant="ghost" onClick={() => words.refetch()}>Try again</Button></p> : words.isLoading ? <p role="status">Loading word practice…</p> : available.length ? <div className="practice-word-links">{available.map(w => <Button asChild variant="outline" key={w.senseId}><Link href={w.practiceHref!}>Recall “{w.meaning}”<ChevronRight size={16} aria-hidden="true" /></Link></Button>)}</div> : <p className="practice-empty-note">Words from your lessons will appear here as you encounter them.</p>}</section>
      <section className="practice-conversation"><MessageCircle size={22} aria-hidden="true" /><div><h2>Make room for conversation.</h2><p>Use the existing conversation space for a longer exchange.</p></div><Button asChild variant="outline"><Link href="/conversation">Open conversation</Link></Button></section>
    </>}
  </div></main>;
}
